import Test from "../test";

export enum ReporterEvents {
    StartTest,
    FailTest,
    SucceedTest,
    /**
     * Triggered when runner starts to
     * read tests of a file
     */
    ReadFile,
    EndTest,
    /**
     * Triggered when runner ends reading
     * of current file
     */
    EndFile,
    Finished,
    RequireFile,
    FailRequire,
    SucceedRequire,
    FailEachExecutor,
    /**
     * Describes a failure of a executor to be executed
     * before or after all tests
     */
    FailFilenameExecutor
}

export default abstract class Reporter {
    public test?: Test;
    /**
     * Filename which holds current test or is being loaded
     * currently
     */
    public filename?: string;

    public failuresCount: number = 0;
    public successesCount: number = 0;

    /**
     * Current failure description object. It'll be
     * attached to this reporter as soon as the runner receive
     * a rejection from a test
     */
    public failure?: any;

    constructor(public stdout: NodeJS.WriteStream, public stderr: NodeJS.WriteStream) {}
    /* tslint:disable member-access */
    abstract describe(event: ReporterEvents): void;
    /* tslint:enable member-access */
    public readFile(filename: string) {
        this.filename = filename;
        this.describe(ReporterEvents.ReadFile);
    }
    public endFile() {
        this.describe(ReporterEvents.EndFile);
        delete this.filename;
    }
    public startTest(test: Test) {
        this.test = test;
        this.describe(ReporterEvents.StartTest);
    }
    public succeedTest() {
        this.describe(ReporterEvents.SucceedTest);
        ++this.successesCount;
    }
    public failTest(reason: any) {
        this.failure = reason;
        this.describe(ReporterEvents.FailTest);
        delete this.failure;
        ++this.failuresCount;
    }
    public finished() {
        this.describe(ReporterEvents.Finished);
        this.successesCount = 0;
        this.failuresCount = 0;
    }
    public endTest() {
        this.describe(ReporterEvents.EndTest);
        delete this.test;
    }
    public requireFile(filename: string) {
        this.filename = filename;
        this.describe(ReporterEvents.RequireFile);
    }
    public succeedRequire() {
        this.describe(ReporterEvents.SucceedRequire);
        delete this.filename;
    }
    public failRequire(failure: any) {
        this.failure = failure;
        this.describe(ReporterEvents.FailRequire);
        delete this.failure;
        delete this.filename;
    }
    public failEachExecutor(failure: any) {
        this.failure = failure;
        this.describe(ReporterEvents.FailEachExecutor);
        delete this.failure;
    }
    public failFilenameExecutor(failure: any) {
        this.failure = failure;
        this.describe(ReporterEvents.FailFilenameExecutor);
        delete this.failure;
    }
}
