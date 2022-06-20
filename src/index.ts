#!/usr/bin/env node

import ArgumentsProcessor from './ArgumentsProcessor';
import Sarg, { AfterEachExecutor, AfterExecutor, BeforeEachExecutor, BeforeExecutor } from './Sarg';
import SargWatched from './SargWatched';
import Test, { TestExecutor } from './Test';

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

let instance: Sarg;
const options = new ArgumentsProcessor(
    process.argv,
    process.stdout,
    process.stderr,
    process.cwd()
).getOptions();

if(options !== null){
    if(Array.isArray(options.watch)){
        const {
            watch,
            reloadTimeout = 100
        } = options;

        instance = new SargWatched({
            reloadTimeout,
            ...options,
            watch
        });
    } else {
        instance = new Sarg(options);
    }
    instance.run().catch(reason => {
        console.error('failed to run sarg instance with error: %o', reason);
    });
}

function getFilename() {
    const filename = instance.getFilename();
    if(!filename) {
        throw new Error('No file is being processed');
    }
    return filename;
}

export function test(label: string, executor: TestExecutor) {
    showDeprecationWarning();
    instance.addTest(new Test(label, executor), getFilename());
}

export function beforeEach(executor: BeforeEachExecutor) {
    showDeprecationWarning();
    instance.addBeforeEach(executor, getFilename());
}

export function afterEach(executor: AfterEachExecutor) {
    showDeprecationWarning();
    instance.addAfterEach(executor, getFilename());
}

export function after(executor: AfterExecutor) {
    showDeprecationWarning();
    instance.addAfter(executor, getFilename());
}

export function before(executor: BeforeExecutor) {
    showDeprecationWarning();
    instance.addBefore(executor, getFilename());
}

export { default as Suite } from './Suite';
