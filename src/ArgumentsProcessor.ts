import { createReadStream } from 'fs';
import glob from 'glob';
import path from 'path';
import fs from 'fs';
import { Duplex } from 'stream';
import ReporterDefault from './reporters/ReporterDefault';
import { SargOptions } from './Sarg';

export default class ArgumentsProcessor {
    readonly #argv;
    readonly #stdout;
    readonly #stderr;
    readonly #cwd;
    // constructor({stdout,stderr,argv,cwd}:{
    //     cwd: string;
    //     argv: string[];
    //     stdout: Duplex;
    //     stderr: Duplex;
    // }) {
    constructor(
        argv: string[],
        stdout: Duplex,
        stderr: Duplex,
        cwd: string
    ) {
        this.#cwd = cwd;
        this.#argv = this.#simplifyArguments(Array.from(argv));
        this.#stdout = stdout;
        this.#stderr = stderr;
    }
    public getOptions(): SargOptions | null {
        const argv = this.#argv;
        const options: SargOptions = {
            files: [],
            ignore: [],
            reporter: new ReporterDefault(this.#stdout, this.#stderr)
        };

        const ii = argv.length;
        let i: number;
        for(i = 2; i < ii; i++) {
            switch(argv[i]) {
                case '-b':
                case '--bail':
                    options.bail = true;
                    break;
                case '--require':
                    require(require.resolve(argv[++i]));
                    break;
                case '--ignore':
                    options.ignore.push(argv[++i]);
                    break;
                case '-w':
                case '--watch': {
                    const value = argv[++i].split(',');

                    if(!Array.isArray(options.watch)) {
                        options.watch = value;
                        break;
                    }
                    options.watch = options.watch.concat(value);
                    break;
                }
                case '--reporter': {
                    const Reporter = require(require.resolve(argv[++i]));
                    if(!Reporter || !Reporter.default)
                        throw new Error('Reporter must be a class based on `Reporter` class');
                    try {
                        options.reporter = (
                            Reporter.default ?
                                new Reporter.default(this.#stdout, this.#stderr) :
                                new Reporter(this.#stdout, this.#stderr)
                        );
                    } catch(reason){
                        console.error('failed to construct Reporter class with error, using default reporter: %o',reason);
                        options.reporter = new ReporterDefault(this.#stdout,this.#stderr);
                    }
                    break;
                }
                case '--reload-timeout':
                    options.reloadTimeout = parseInt(argv[++i], 10);
                    break;
                case '--setup-script':
                    options.setupScript = require(require.resolve(argv[++i]));
                    break;
                case '--teardown-script':
                    options.teardownScript = require.resolve(argv[++i]);
                    break;
                case '-v':
                case '--version': {
                    const {version} = JSON.parse(
                        fs.readFileSync(
                            path.resolve(__dirname,'../package.json'),
                            'utf8'
                        )
                    );
                    this.#stdout.write(`${version}\n`);
                    return null;
                }
                case '--license':
                    createReadStream(path.resolve(__dirname, '../LICENSE')).on('close', () => {
                        this.#stdout.write('\n');
                    }).pipe(this.#stdout);
                    return null;
                case '-h':
                case '--help':
                    createReadStream(__dirname + '/../HELP').on('close', () => {
                        this.#stdout.write('\n');
                    }).pipe(this.#stdout);
                    return null;
                default:
                    if(argv[i][0] == '-' || argv[i].substring(0, 2) == '--') {
                        this.#stderr.write(`Invalid option ${argv[i]}\n`);
                        return null;
                    }
                    if(glob.hasMagic(argv[i])){
                        options.files.push(
                            ...glob.sync(path.resolve(this.#cwd,argv[i])).map(f => require.resolve(f))
                        );
                    } else {
                        options.files.push(path.join(this.#cwd,argv[i]));
                    }
            }
        }

        for(const list of [options.ignore,options.files]){
            for(i = 0; i < list.length; i++){
                list[i] = path.resolve(this.#cwd,list[i]);
                if(!glob.hasMagic(list[i])){
                    continue;
                }
                list.splice(i,1,...glob.sync(list[i]));
            }

            for(i = 0; i < list.length; i++){
                list[i] = require.resolve(list[i]);
            }
        }

        for(const ignore of options.ignore) {
            let files: string[];
            if(glob.hasMagic(ignore)) {
                files = glob.sync(path.resolve(ignore));
            } else {
                files = [path.resolve(ignore)];
            }

            for(let i = 0; i < files.length; i++){
                files[i] = require.resolve(files[i]);
            }

            for(let i = 0; i < options.files.length; i++) {
                if(files.indexOf(options.files[i]) !== -1) {
                    options.files.splice(i, 1);
                }
            }

            options.ignore = files;
        }

        return options;
    }
    /**
     * Convert --arg="x", --arg=x and --arg='x' to --arg "x"
     */
    #simplifyArguments(argv: string[]){
        let i: number, j: number;
        for(i = 2; i < argv.length; i++){
            const current = argv[i];
            if(current.indexOf('=') === -1 || current[0] !== '-') {
                continue;
            }
            const error = (offset: number) => {
                if(offset !== -1){
                    return new Error(
                        `unable to recognize argument due to character "${current[offset]}" at offset ${offset}: ${current}`
                    );
                }
                return new Error(`unable to recognize argument: ${current}`);
            };
            j = 0;
            if(current.startsWith('--')){
                j += 2;
            } else if(current.startsWith('-')){
                j++;
            }
            const additionalArgs = new Array<string>();
            while(j < current.length && /^[a-zA-Z-_]$/.test(current[j])){
                j++;
            }
            additionalArgs.push(current.substring(0, j));
            if(current[j] !== '='){
                throw error(j);
            }
            // =
            j++;
            // value with " or '
            let argValueStartIndex: number;
            if(current[j] === '\'' || current[j] === '"') {
                for(const quote of ['"','\'']){
                    if(current[j] !== quote){
                        continue;
                    }
                    // skip start
                    j++;
                    argValueStartIndex = j;
                    while(current[j] !== quote){
                        j++;
                    }
                    if(current[j] !== quote){
                        throw error(j);
                    }
                    additionalArgs.push(current.substring(argValueStartIndex,j));
                    // skip end
                    j++;
                    break;
                }
            } else {
                argValueStartIndex = j;
                while(j < current.length){
                    j++;
                }
                additionalArgs.push(current.substring(argValueStartIndex,j));
            }
            argv.splice(
                i,
                1,
                ...additionalArgs
            );
        }
        return argv;
    }
}
