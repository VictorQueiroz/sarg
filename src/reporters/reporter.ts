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
    SucceedRequire
}

export default abstract class Reporter {
    public test?: Test;
    /**
     * Filename which holds current test or is being loaded
     * currently
     */
    public filename?: string;

    public failuresCount: number = -1;
    public successesCount: number = -1;

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
        this.successesCount = -1;
        this.failuresCount = -1;
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
}
