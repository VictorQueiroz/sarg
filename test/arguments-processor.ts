import { strict as assert } from 'assert';
import * as fs from 'fs';
import { sync } from 'glob';
import * as path from 'path';
import ArgumentsProcessor from '../src/arguments-processor';
import ReporterDefault from '../src/reporters/reporter-default';
import ReporterTest from './reporter-test';
import WriteStream from './write-stream';
import Suite from '../src/suite';

const suite = new Suite();
const {test} = suite;

test('it should throw for invalid reporter', async () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    await assert.throws(() => {
        new ArgumentsProcessor([
            '',
            '',
            '--require', '@babel/register',
            '--reporter', path.resolve(process.cwd(), 'test/invalid-reporter.ts')
        ], stdout, stderr).getOptions();
    }, new Error('Reporter must be a class based on `Reporter` class'));
});

test('it should have --setup-script option', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const options = new ArgumentsProcessor([
        '',
        '',
        '--setup-script', path.resolve(__dirname, 'sarg-setup-script.ts')
    ], stdout, stderr).getOptions();
    if(!options) {
        throw new Error('Invalid options');
    }
    assert.deepEqual(options, {
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr),
        setupScript: require(path.resolve(__dirname, 'sarg-setup-script.ts'))
    });
});

test('it should have --bail, -b options', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const options = new ArgumentsProcessor(
        ['', '', '--bail'],
        stdout,
        stderr
    ).getOptions();
    if(!options) {
        throw new Error('Invalid options variable');
    }
    assert.deepEqual(options, {
        bail: true,
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr)
    });
});

test('it should load files from glob', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const options = new ArgumentsProcessor([
        '',
        '',
        path.resolve(__dirname, 'arguments-*.ts')
    ], stdout, stderr).getOptions();
    if(!options) {
        throw new Error('Invalid options result');
    }
    assert.deepEqual(options, {
        files: [path.resolve(__dirname, 'arguments-processor.ts')],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr)
    });
});

test('it should detect directories/pattern separated by comma', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const options = new ArgumentsProcessor(
        [
            '', '',
            '-w', 'a,b,c/**/*/d.js'
        ],
        stdout,
        stderr
    ).getOptions();
    if(!options) {
        throw new Error('Invalid options result');
    }
    assert.deepEqual(options, {
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr),
        watch: ['a', 'b', 'c/**/*/d.js']
    });
});

test('it should support --watch, -w options', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const options = new ArgumentsProcessor(
        [
            '', '',
            '-w', 'src',
            '-w', 'test'
        ],
        stdout,
        stderr
    ).getOptions();
    if(!options) {
        throw new Error('Invalid options result');
    }
    assert.deepEqual(options, {
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr),
        watch: ['src', 'test']
    });
});

test('it should support several definitions of watch option', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const options = new ArgumentsProcessor([
        '',
        '',
        '-w', 'src',
        '-w', 'test'
    ], stdout, stderr).getOptions();
    assert.deepEqual(options, {
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr),
        watch: ['src', 'test']
    });
});

test('it should support setting arguments with = and quotes', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        '-w="src"',
        '--watch="test"'
    ], stdout, stderr).getOptions(), {
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr),
        watch: ['src', 'test']
    });
});

test('it should support --teardown-script argument', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        '--teardown-script=close-tests.js'
    ], stdout, stderr).getOptions(), {
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr),
        teardownScript: 'close-tests.js'
    });
});

test('it should support --reload-timeout option', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        '-w', 'src',
        '-w', 'test',
        '--reload-timeout',
        '100'
    ], stdout, stderr).getOptions(), {
        files: [],
        ignore: [],
        reloadTimeout: 100,
        reporter: new ReporterDefault(stdout, stderr),
        watch: ['src', 'test']
    });
});

test('it should support --reporter option', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        '--reporter',
        path.resolve(__dirname, './reporter-test.ts')
    ], stdout, stderr).getOptions(), {
        files: [],
        ignore: [],
        reporter: new ReporterTest(stdout, stderr),
    });
});

test('it should support --version, -v options', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    for(const flag of ['--version', '-v']) {
        assert.deepEqual(new ArgumentsProcessor([
            '',
            '',
            flag
        ], stdout, stderr).getOptions(), undefined);

        stdout.expect(`${require('../package.json').version}\n`);
    }
});

test('it should support --license option', async () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const processor = new ArgumentsProcessor(
        [
            '',
            '',
            '--license'
        ],
        stdout,
        stderr
    );

    stdout.prepare();
    assert.deepEqual(processor.getOptions(), undefined);

    await stdout.promise();

    stdout.expect(fs.readFileSync(__dirname + '/../LICENSE', 'utf8'));
    stdout.expect('\n');
});

test('it should support --help, -h', async () => {
    for(const flag of ['--help', '-h']) {
        const stdout = new WriteStream();
        const stderr = new WriteStream();
        const processor = new ArgumentsProcessor([
            '',
            '',
            flag
        ], stdout, stderr);

        stdout.prepare();
        assert.deepEqual(processor.getOptions(), undefined);

        await stdout.promise();

        stdout.expect(fs.readFileSync(__dirname + '/../HELP', 'utf8'));
        stdout.expect('\n');
    }
});

test('it should throw when receive invalid option', () => {
    for(const flag of ['--z', '-z']) {
        const stdout = new WriteStream();
        const stderr = new WriteStream();
        const processor = new ArgumentsProcessor([
            '',
            '',
            flag
        ], stdout, stderr);

        assert.deepEqual(processor.getOptions(), undefined);

        stderr.expect(`Invalid option ${flag}\n`);
    }
});

test('it should --ignore files', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        '--ignore', path.resolve(__dirname, 'babel-test.js'),
        path.resolve(__dirname, 'configure-enzyme.ts'),
        path.resolve(__dirname, 'babel-test.js')
    ], stdout, stderr).getOptions(), {
        files: [path.resolve(__dirname, 'configure-enzyme.ts')],
        ignore: [path.resolve(__dirname, 'babel-test.js')],
        reporter: new ReporterDefault(stdout, stderr)
    });
});

test('it sould resolve ignore pattern', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        '--ignore=test/utilities/**/*.js',
        'test/**/*.js'
    ], stdout, stderr).getOptions(), {
        files: sync(__dirname + '/**/*.js').filter((file) => {
            return sync(__dirname + '/utilities/**/*.js').indexOf(file) == -1;
        }),
        ignore: sync(__dirname + '/utilities/**/*.js'),
        reporter: new ReporterDefault(stdout, stderr)
    });
});

export default suite;
