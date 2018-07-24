import * as glob from 'glob';
import ReporterDefault from './reporters/reporter-default';
import { SargOptions } from './sarg';

export default class ArgumentsProcessor {
    constructor(private argv: string[]) {
    }
    public getOptions(): SargOptions {
        const {
            argv
        } = this;
        const options: SargOptions = {
            files: [],
            reporter: new ReporterDefault(process.stdout, process.stderr)
        };

        argv.shift(); // node executable
        argv.shift(); // sarg executable

        for(let i = 0; i < argv.length; i++) {
            // support --arg="x", --arg=x and --arg='x'
            if(argv[i][0] == '-' && argv[i].indexOf('=') > -1) {
                const slices = argv[i].split('=');

                if(slices[1] == '"' || slices[1] == "'")
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
                    for(const file of glob.sync(argv[++i])) {
                        const index = options.files.indexOf(file);
                        if(index != -1) {
                            options.files.splice(index, 1);
                        }
                    }
                    break;
                default:
                    if(argv[i][0] == '-' || argv[i].substring(0, 2) == '--') {
                        process.stderr.write(`Invalid option ${argv[i]}\n`);
                        process.exit(1);
                        return options;
                    }
                    options.files.push(...glob.sync(argv[i]));
            }
        }

        return options;
    }
}