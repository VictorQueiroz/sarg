export type TestExecutor = () => void | Promise<void>;

export default class Test {
    private startDate: Date = new Date();
    private endDate: Date = new Date();

    constructor(private label: string, private executor: TestExecutor) {
    }

    public name() {
        return this.label;
    }

    /**
     * Return how much time did it take to complete the test
     * since `startTime` in miliseconds
     */
    public timeElapsed() {
        return this.endDate.getTime() - this.startDate.getTime();
    }

    public async run() {
        this.startDate = new Date();
        try {
            await this.executor();
        } catch(reason) {
            throw reason;
        } finally {
            this.endDate = new Date();
        }
    }
}