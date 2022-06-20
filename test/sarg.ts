import { spy } from 'sinon';
import ReporterDefault from '../src/reporters/ReporterDefault';
import Sarg from "../src/Sarg";
import WriteStream from './write-stream';
import Suite from '../src/Suite';

const suite = new Suite();
const {test} = suite;

test('it should run setup script', async () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const setupScript = spy();
    const sarg = new Sarg({
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr),
        setupScript
    });
    await sarg.run();
});

export default suite;
