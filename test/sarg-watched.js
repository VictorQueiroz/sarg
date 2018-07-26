import { test } from '../lib';
import ArgumentsProcessor from '../lib/arguments-processor';
import WriteStream from './write-stream';
import * as fs from 'fs';
import * as path from 'path';
import { strict as assert } from 'assert';
import SargCounted from './utilities/sarg-counted';
import Test from '../lib/test';

test('it should execute tests again just once no matter how many times files are changed', async () => {
    const tmpFile = '/tmp/sarg-file.js';
    const stdout = new WriteStream();
    const stderr = new WriteStream();

    fs.closeSync(fs.openSync(tmpFile, 'w+'));

    const options = new ArgumentsProcessor([
        '',
        '',
        '--reporter', path.resolve(__dirname, 'reporter-silent.js'),
        '-w', tmpFile
    ], stdout, stderr).getOptions();

    const sarg = new SargCounted(options);
    sarg.addTest(new Test('test', () => {}), tmpFile);

    await sarg.run();
    assert.equal(sarg.runCount, 1);

    await new Promise(async (resolve, reject) => {
        sarg.once('finished', async () => {
            assert.equal(sarg.runCount, 2);
            sarg.destroy();
            fs.unlinkSync(tmpFile);
            resolve();
        });

        sarg.onFileChanged();
        sarg.onFileChanged();
        sarg.onFileChanged();
    });
});

test('it should not run tests more than once if a test is already running', () => {
    const tmpFile = '/tmp/sarg-file.js';
    const stdout = new WriteStream();
    const stderr = new WriteStream();

    fs.writeFileSync(tmpFile, '');

    const options = new ArgumentsProcessor([
        '',
        '',
        '-w', tmpFile,
        '--reporter', path.resolve(__dirname, 'reporter-silent.js')
    ], stdout, stderr).getOptions();

    const sarg = new SargCounted(options);
    sarg.addTest(new Test('infinity test', () => new Promise(() => {})), tmpFile);

    sarg.run();
    assert.equal(sarg.runCount, 0);

    return new Promise((resolve) => {
        sarg.on('fsChanged', () => {
            assert.equal(sarg.runCount, 0);
            sarg.destroy();
            fs.unlinkSync(tmpFile);
            resolve();
        });
        fs.createWriteStream(tmpFile).end('\n');
    });
});

test('it should watch for changes in files', async () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();

    const tmpFile = '/tmp/sarg-watched-file';

    fs.createWriteStream(tmpFile).end('\n');

    const options = new ArgumentsProcessor([
        '',
        '',
        '-w', tmpFile,
        '--reporter', path.resolve(__dirname, 'reporter-silent.js'),
        tmpFile
    ], stdout, stderr).getOptions();

    const sarg = new SargCounted(options);
    assert.equal(sarg.runCount, 0);

    await sarg.run();
    assert.equal(sarg.runCount, 1);

    await new Promise((resolve) => {
        sarg.once('finished', () => {
            assert.equal(sarg.runCount, 2);
            sarg.destroy();
            fs.unlinkSync(tmpFile);
            resolve();
        });
        fs.createWriteStream(tmpFile).end('\n');
    });
});
