import * as path from 'path';
import Reporter from './reporters/reporter';
import Test from './test';

export interface SargOptions {
    watch?: string[];
    files: string[];
    bail?: boolean;
    ignore: string[];
    reporter: Reporter;
    reloadTimeout?: number;
    teardownScript?: string;
    setupScript?: () => Promise<void>;
}

export type AfterExecutor = () => void | Promise<void>;
export type BeforeExecutor = () => void | Promise<void>;
export type BeforeEachExecutor = () => void | Promise<void>;
export type AfterEachExecutor = () => void | Promise<void>;

export default class Sarg {
    private tests: {
        [filename: string]: {
            tests: Test[];
            after: AfterExecutor[];
            before: BeforeExecutor[];
            beforeEach: BeforeEachExecutor[];
            afterEach: AfterEachExecutor[];
        };
    } = {};
    private reporter: Reporter;
    private currentFile?: string;
    private running: boolean = false;
    private setupPromise?: Promise<void>;

    constructor(private options: SargOptions) {
        this.reporter = options.reporter;
    }

    public isRunning() {
        return this.running;
    }

    /**
     * Current file name we're processing
     * at the moment
     */
    public getFilename() {
        return this.currentFile;
    }

    @boundMethod
    public async run() {
        if(this.options.setupScript) {
            if(!this.setupPromise) {
                this.setupPromise = this.options.setupScript();
            }
            await this.setupPromise;
        }

        if(this.running) {
            throw new Error('invalid run command');
        }

        this.running = true;

        for(const file of this.options.files) {
            this.reporter.requireFile(file);
            this.currentFile = file;
            const target = path.resolve(process.cwd(), file);
            try {
                require(target);
                this.reporter.succeedRequire();
            } catch(reason) {
                this.reporter.failRequire(reason);
            }
            delete this.currentFile;
        }

        let failed: boolean = false;

        for(const filename of Object.keys(this.tests)) {
            this.reporter.readFile(filename);

            const record = this.getFilenameRecord(filename);

            for(const before of record.before) {
                try {
                    await before();
                } catch(reason) {
                    this.reporter.failFilenameExecutor(reason);
                }
            }

            for(const test of record.tests) {
                for(const beforeEach of record.beforeEach) {
                    try {
                        await beforeEach();
                    } catch(reason) {
                        this.reporter.failEachExecutor(reason);
                    }
                }

                this.reporter.startTest(test);
                try {
                    await test.run();
                    this.reporter.succeedTest();
                } catch(reason) {
                    this.reporter.failTest(reason);

                    if(this.options.bail) {
                        failed = true;
                    }
                }
                this.reporter.endTest();

                for(const afterEach of record.afterEach) {
                    try {
                        await afterEach();
                    } catch(reason) {
                        this.reporter.failEachExecutor(reason);
                    }
                }

                if(failed)
                    break;
            }

            for(const after of record.after) {
                try {
                    await after();
                } catch(reason) {
                    this.reporter.failFilenameExecutor(reason);
                }
            }

            this.reporter.endFile();

            if(failed)
                break;
        }

        this.reporter.finished();

        this.running = false;

        this.onFinishTests();
    }

    public addAfter(executor: BeforeExecutor, filename: string) {
        this.getFilenameRecord(filename).after.push(executor);
    }

    public addBefore(executor: BeforeExecutor, filename: string) {
        this.getFilenameRecord(filename).before.push(executor);
    }

    public addBeforeEach(executor: BeforeEachExecutor, filename: string) {
        const record = this.getFilenameRecord(filename);

        record.beforeEach.push(executor);
    }

    public addAfterEach(executor: AfterEachExecutor, filename: string) {
        const record = this.getFilenameRecord(filename);

        record.afterEach.push(executor);
    }

    public addTest(test: Test, filename: string) {
        const record = this.getFilenameRecord(filename);

        record.tests.push(test);
    }

    public isTestFile(filename: string) {
        if(this.tests.has(filename)) {
            return true;
        }
        return false;
    }

    public invalidateTest(filename: string) {
        if(!this.tests.delete(filename)) {
            throw new Error(`Tried to invalidate cache of unexistent file: ${filename}`);
        }
    }

    public destroy() {
        if(this.running) {
            throw new Error('Test runner can only be destroyed after tests are finished');
        }
    }

    public onFinishTests() {
        if(this.options.teardownScript) {
            require(this.options.teardownScript)();
        }
    }

    private getFilenameRecord(filename: string) {
        if(!this.tests.hasOwnProperty(filename)) {
            this.tests[filename] = {
                after: [],
                afterEach: [],
                before: [],
                beforeEach: [],
                tests: []
            };
        }
        return this.tests[filename];
    }
}
