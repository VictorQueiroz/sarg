import Test, { TestExecutor } from './Test';
import { BeforeExecutor, AfterEachExecutor, AfterExecutor, BeforeEachExecutor } from './Sarg';
import { boundMethod } from 'autobind-decorator';

export default class Suite {
    public isSargTestSuite = true;
    public readonly tests = new Map<string, Test>();
    public readonly afterSet = new Set<AfterExecutor>();
    public readonly beforeSet = new Set<BeforeExecutor>();
    public readonly beforeEachSet = new Set<BeforeEachExecutor>();
    public readonly afterEachSet = new Set<AfterEachExecutor>();

    @boundMethod
    public beforeEach(executor: BeforeEachExecutor) {
        this.beforeEachSet.add(executor);
    }

    @boundMethod
    public afterEach(executor: AfterEachExecutor) {
        this.afterEachSet.add(executor);
    }

    @boundMethod
    public after(executor: AfterExecutor) {
        this.afterSet.add(executor);
    }

    @boundMethod
    public before(executor: BeforeExecutor) {
        this.beforeSet.add(executor);
    }

    @boundMethod
    public test(label: string, executor: TestExecutor) {
        this.tests.set(label, new Test(label, executor));
    }
}
