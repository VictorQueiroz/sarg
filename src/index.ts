import ArgumentsProcessor from './arguments-processor';
import Sarg from './sarg';
import Test, { TestExecutor } from './test';

const options = new ArgumentsProcessor(process.argv).getOptions();
export const sarg = options ? new Sarg(options) : undefined;

export function test(label: string, executor: TestExecutor) {
    if(!sarg)
        throw new Error('sarg is not running');

    const filename = sarg.getFilename();

    if(!filename)
        throw new Error('no file specified');

    sarg.addTest(new Test(label, executor), filename);
}
