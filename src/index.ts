import ArgumentsProcessor from './arguments-processor';
import Sarg from './sarg';
import SargWatched from './sarg-watched';
import Test, { TestExecutor } from './test';

let instance: Sarg | undefined;
const options = new ArgumentsProcessor(process.argv).getOptions();

if(options && !options.watch)
    instance = new Sarg(options);
else if(options && options.watch)
    instance = new SargWatched(options);

export const sarg = instance;
export function test(label: string, executor: TestExecutor) {
    if(!sarg)
        throw new Error('sarg is not running');

    const filename = sarg.getFilename();

    if(!filename)
        throw new Error('no file specified');

    sarg.addTest(new Test(label, executor), filename);
}
