import ArgumentsProcessor from './arguments-processor';
import Sarg, { AfterEachExecutor, AfterExecutor, BeforeEachExecutor, BeforeExecutor } from './sarg';
import SargWatched from './sarg-watched';
import Test, { TestExecutor } from './test';

let instance: Sarg | undefined;
const options = new ArgumentsProcessor(
    process.argv,
    process.stdout,
    process.stderr
).getOptions();

if(options && !options.watch) {
    instance = new Sarg(options);
} else if(options && Array.isArray(options.watch)) {
    const {
        watch,
        reloadTimeout = 0
    } = options;

    instance = new SargWatched({
        reloadTimeout,
        ...options,
        watch
    });
}

function getSarg() {
    if(!sarg)
        throw new Error('No sarg instance found');

    return sarg;
}

function getFilename() {
    const filename = getSarg().getFilename();
    if(!filename) {
        throw new Error('No file is being processed');
    }
    return filename;
}

let showedDeprecationWarning = false;
function showDeprecationWarning() {
    if(showedDeprecationWarning) {
        return;
    }
    options && options.reporter.warn(
        'Test files should return suite instance instead of using `test` global function.\n\n'
    );
    showedDeprecationWarning = true;
}

export const sarg = instance;
export function test(label: string, executor: TestExecutor) {
    showDeprecationWarning();
    getSarg().addTest(new Test(label, executor), getFilename());
}

export function beforeEach(executor: BeforeEachExecutor) {
    showDeprecationWarning();
    getSarg().addBeforeEach(executor, getFilename());
}

export function afterEach(executor: AfterEachExecutor) {
    showDeprecationWarning();
    getSarg().addAfterEach(executor, getFilename());
}

export function after(executor: AfterExecutor) {
    showDeprecationWarning();
    getSarg().addAfter(executor, getFilename());
}

export function before(executor: BeforeExecutor) {
    showDeprecationWarning();
    getSarg().addBefore(executor, getFilename());
}

export { default as Suite } from './suite';

if(instance && !instance.isRunning()) {
    instance.run();
}

export default instance;
