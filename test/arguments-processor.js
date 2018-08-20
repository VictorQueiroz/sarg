import { strict as assert } from 'assert';
import { test } from '../src';
import ArgumentsProcessor from '../src/arguments-processor';
import ReporterDefault from '../src/reporters/reporter-default';
import ReporterTest from './reporter-test';
import * as path from 'path';
import WriteStream from './write-stream';
import fs from 'fs';

test('it should have --bail, -b options', () => {
    assert.deepEqual(new ArgumentsProcessor(['', '', '--bail']).getOptions(), {
        files: [],
        ignore: [],
        bail: true,
        reporter: new ReporterDefault()
    });
});

test('it should load files from glob', () => {
    assert.deepEqual(new ArgumentsProcessor(['', '', path.resolve(__dirname, 'arguments-*.js')]).getOptions(), {
        files: [path.resolve(__dirname, 'arguments-processor.js')],
        ignore: [],
        reporter: new ReporterDefault()
    });
});

test('it should support --watch, -w options', () => {
    assert.deepEqual(new ArgumentsProcessor(['', '', '-w', 'src,test']).getOptions(), {
        reporter: new ReporterDefault(),
        watch: ['src', 'test'],
        files: [],
        ignore: []
    });
});

test('it should support --reload-timeout option', () => {
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        '-w',
        'src,test',
        '--reload-timeout',
        '100'
    ]).getOptions(), {
        reporter: new ReporterDefault(),
        reloadTimeout: 100,
        watch: ['src', 'test'],
        files: [],
        ignore: []
    });
});

test('it should support --reporter option', () => {
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        '--reporter',
        path.resolve(__dirname, './reporter-test.js')
    ]).getOptions(), {
        reporter: new ReporterTest(),
        files: [],
        ignore: []
    });
});

test('it should support --version, -v options', () => {
    for(const flag of ['--version', '-v']) {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
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
    const processor = new ArgumentsProcessor([
        '',
        '',
        '--license'
    ], stdout, stderr);

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

test('it should throw when receive invalid option', function() {
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
    assert.deepEqual(new ArgumentsProcessor([
        '',
        '',
        '--ignore', path.resolve(__dirname, 'babel-test.js'),
        path.resolve(__dirname, 'configure-enzyme.js'),
        path.resolve(__dirname, 'babel-test.js')
    ]).getOptions(), {
        files: [path.resolve(__dirname, 'configure-enzyme.js')],
        ignore: [path.resolve(__dirname, 'babel-test.js')],
        reporter: new ReporterDefault()
    });
});
