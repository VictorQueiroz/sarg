import * as path from 'path';
import { spy } from 'sinon';
import { test } from "../src";
import ReporterDefault from '../src/reporters/reporter-default';
import Sarg from "../src/sarg";
import WriteStream from './write-stream';

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
