import { createReadStream } from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import ReporterDefault from './reporters/reporter-default';
import { SargOptions } from './sarg';

export default class ArgumentsProcessor {
    constructor(
        private argv: string[],
        private stdout: NodeJS.WriteStream,
        private stderr: NodeJS.WriteStream
    ) {
    }
    public getOptions(): SargOptions | void {
        const {
            argv
        } = this;
        const options: SargOptions = {
            files: [],
            ignore: [],
            reporter: new ReporterDefault(this.stdout, this.stderr)
        };

        argv.shift(); // node executable
        argv.shift(); // sarg executable

        for(let i = 0; i < argv.length; i++) {
            // support --arg="x", --arg=x and --arg='x'
            if(argv[i][0] == '-' && argv[i].indexOf('=') > -1) {
                const slices = argv[i].split('=');

                if(slices[1][0] == '"' || slices[1][0] == "'")
                    slices[1] = slices[1].substring(1, slices[1].length - 1);

                argv.splice(i, 1, ...slices);
                i--;
                continue;
            }

            switch(argv[i]) {
                case '-b':
                case '--bail':
                    options.bail = true;
                    break;
                case '--require':
                    require(argv[++i]);
                    break;
                case '--ignore':
                    options.ignore.push(argv[++i]);
                    break;
                case '-w':
                case '--watch': {
                    let value: string | string[] = argv[++i];

                    if(value.indexOf(',') != -1)
                        value = value.split(',');
                    else
                        value = [value];

                    if(!options.watch) {
                        options.watch = value;
                        break;
                    }
                    options.watch.push(...value);
                    break;
                }
                case '--reporter': {
                    const Reporter = require(require.resolve(argv[++i]));
                    if(!Reporter)
                        throw new Error('Reporter must be a class based on `Reporter` class');
                    options.reporter = Reporter.default ?
                                        new Reporter.default(this.stdout, this.stderr) :
                                        new Reporter(this.stdout, this.stderr);
                    break;
                }
                case '--reload-timeout':
                    options.reloadTimeout = parseInt(argv[++i], 10);
                    break;
                case '--setup-script':
                    options.setupScript = argv[++i];
                    break;
                case '--teardown-script':
                    options.teardownScript = argv[++i];
                    break;
                case '-v':
                case '--version':
                    this.stdout.write(`${require('../package.json').version}\n`);
                    return;
                case '--license':
                    createReadStream(__dirname + '/../LICENSE').on('close', () => {
                        this.stdout.write('\n');
                    }).pipe(this.stdout);
                    return;
                case '-h':
                case '--help':
                    createReadStream(__dirname + '/../HELP').on('close', () => {
                        this.stdout.write('\n');
                    }).pipe(this.stdout);
                    return;
                default:
                    if(argv[i][0] == '-' || argv[i].substring(0, 2) == '--') {
                        this.stderr.write(`Invalid option ${argv[i]}\n`);
                        return;
                    }
                    options.files.push(...glob.sync(path.resolve(argv[i])));
            }
        }

        for(const ignore of options.ignore) {
            let files: string[];
            if(glob.hasMagic(ignore)) {
                files = glob.sync(path.resolve(ignore));
            } else {
                files = [path.resolve(ignore)];
            }

            for(let i = 0; i < options.files.length; i++) {
                if(files.indexOf(options.files[i]) != -1) {
                    options.files.splice(i, 1);
                }
            }
        }

        return options;
    }
}
