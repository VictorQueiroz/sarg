import ArgumentsProcessor from './arguments-processor';
import Sarg from './sarg';
import Test, { TestExecutor } from './test';

export const sarg = new Sarg(new ArgumentsProcessor(process.argv).getOptions());

export function test(label: string, executor: TestExecutor) {
    const filename = sarg.getFilename();

    if(!filename)
        throw new Error('no file specified');

    sarg.addTest(new Test(label, executor), filename);
}
