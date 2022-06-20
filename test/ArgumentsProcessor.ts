import assert from 'assert';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import ArgumentsProcessor from '../src/ArgumentsProcessor';
import ReporterDefault from '../src/reporters/ReporterDefault';
import ReporterTest from './reporter-test';
import WriteStream from './write-stream';
import Suite from '../src/Suite';

const suite = new Suite();
const {test} = suite;

test('it should throw for invalid reporter', async () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    assert.strict.throws(() => {
        new ArgumentsProcessor([
            '',
            '',
            '--require', '@babel/register',
            '--reporter', path.resolve(process.cwd(), 'test/invalid-reporter.ts')
        ], stdout, stderr, __dirname).getOptions();
    }, new Error('Reporter must be a class based on `Reporter` class'));
});

test('it should have --setup-script option', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const options = new ArgumentsProcessor([
        '',
        '',
        '--setup-script', path.resolve(__dirname, 'sarg-setup-script.ts')
    ], stdout, stderr, __dirname).getOptions();
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
        stderr,
        __dirname
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
        path.resolve(__dirname, 'Arguments*.ts')
    ], stdout, stderr, __dirname).getOptions();
    if(!options) {
        throw new Error('Invalid options result');
    }
    assert.deepEqual(options, {
        files: [path.resolve(__dirname, 'ArgumentsProcessor.ts')],
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
        stderr,
        __dirname
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
        stderr,
        __dirname
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
    ], stdout, stderr, __dirname).getOptions();
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
    ], stdout, stderr, __dirname).getOptions(), {
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr),
        watch: ['src', 'test']
    });
});

test('it should support --teardown-script argument', () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const teardownScript = path.resolve(__dirname,'close-tests.js');
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        `--teardown-script=${teardownScript}`
    ], stdout, stderr, __dirname).getOptions(), {
        files: [],
        ignore: [],
        reporter: new ReporterDefault(stdout, stderr),
        teardownScript
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
    ], stdout, stderr, __dirname).getOptions(), {
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
    ], stdout, stderr, __dirname).getOptions(), {
        files: [],
        ignore: [],
        reporter: new ReporterTest(stdout,stderr)
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
        ], stdout, stderr, __dirname).getOptions(), undefined);

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
        stderr,
        __dirname
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
        ], stdout, stderr, __dirname);

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
        ], stdout, stderr, __dirname);

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
        '--ignore', './babel-test.js',
        './configure-enzyme',
        './babel-test.js'
    ], stdout, stderr, __dirname).getOptions(), {
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
        '--ignore=./test/*.js',
        './test/*.js'
    ], stdout, stderr, __dirname).getOptions(), {
        files: [],
        ignore: glob.sync(__dirname + '/utilities/**/*.js'),
        reporter: new ReporterDefault(stdout, stderr)
    });
});

export default suite;
