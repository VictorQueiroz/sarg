import * as path from 'path';
import Reporter from './reporters/reporter';
import Test from './test';

export interface SargOptions {
    watch?: boolean;
    files: string[];
    bail?: boolean;
    reporter: Reporter;
}

export default class Sarg {
    private tests: {
        [filename: string]: Test[]
    } = {};
    private reporter: Reporter;
    private currentFile?: string;

    constructor(private options: SargOptions) {
        this.reporter = options.reporter;
    }

    /**
     * Current file name we're processing
     * at the moment
     */
    public getFilename() {
        return this.currentFile;
    }

    public async run() {
        const initialCache = Object.keys(require.cache);

        for(const file of this.options.files) {
            this.currentFile = file;
            const target = path.resolve(process.cwd(), file);
            require(target);
            delete this.currentFile;
        }

        for(const filename of Object.keys(this.tests)) {
            this.reporter.readFile(filename);

            for(const test of this.tests[filename]) {
                this.reporter.startTest(test);
                try {
                    await test.run();
                    this.reporter.succeedTest();
                } catch(reason) {
                    this.reporter.failTest(reason);

                    if(this.options.bail) {
                        this.reporter.endTest();
                        this.reporter.endFile();
                        this.reporter.finished();
                        return;
                    }
                }
                this.reporter.endTest();
            }

            this.reporter.endFile();
        }

        this.reporter.finished();

        for(const key of Object.keys(require.cache)) {
            if(key.indexOf('node_modules') != -1 || initialCache.indexOf(key) != -1)
                continue;

            delete require.cache[key];
        }
    }

    public addTest(test: Test, filename: string) {
        if(!this.tests.hasOwnProperty(filename))
            this.tests[filename] = [];

        this.tests[filename].push(test);
    }
}
