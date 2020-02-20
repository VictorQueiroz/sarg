import ReporterDefault from '../../src/reporters/reporter-default';
import WriteStream from '../write-stream';
import Test from '../../src/test';
import {expect} from 'chai';
import Suite from '../../src/suite';

const suite = new Suite();
const {test} = suite;

test('it should show cool diff for assertion mismatches', async () => {
    const stdout = new WriteStream();
    const stderr = new WriteStream();
    const test = new Test('test 1', () => {
        expect({
            users: [{
                name: 'Victor'
            }]
        }).to.be.deep.equal({
            users: []
        });
    });
    const reporter = new ReporterDefault(stdout, stderr);
    reporter.readFile('test.js');
    reporter.startTest(test);
    try {
        await test.run();
    } catch(reason) {
        reporter.failTest(reason);
    }
    stderr.expect(/test 1/);
    stderr.expect(/\n/);
    stderr.expect(/\+ Expected/);
    stderr.expect(/\//);
    stderr.expect(/\- Actual/);
    stderr.expect(/\n\n/);
    stderr.expect(/\{\n/);
    stderr.expect(/\"users\": \[\]/);
    stderr.expect(/Victor/, /name/, /\"users\"/);
});

// test('it should report failures', async () => {
//     const stdout = new WriteStream();
//     const stderr = new WriteStream();
//     const reporter = new ReporterDefault(stdout, stderr);

//     const t = new Test('test 1', () => {
//         assert.deepEqual({}, {
//             posts: [{ title: 'Post 1' }]
//         });
//     });

//     reporter.readFile('test.js');
//     reporter.startTest(t);
//     try {
//         await t.run();
//         throw new Error('test should fail');
//     } catch(reason) {
//         reporter.failTest(reason);
//     }
//     reporter.endFile();

//     stdout.expect(`${chalk.white('test.js')}:\n`);
//     stderr.expect(new RegExp(t.name()));
//     stderr.expect(/Input A expected to strictly deep-equal input B/);
// });

test('it should show rejection message when fail to require test file', () => {
    const stderr = new WriteStream();
    const stdout = new WriteStream();
    const r = new ReporterDefault(stdout, stderr);
    r.requireFile('test.js');
    r.failRequire(new Error('some fancy error here'));

    stderr.expect(/failed to load test\.js/);
    stderr.expect(/some fancy error here/);
});

// test('it should fail when no test is specified', () => {
//     const stderr = new WriteStream();
//     const stdout = new WriteStream();
//     assert.throws(() => new ReporterDefault(stdout, stderr).failTest());
// });

// test('it should fail when there is no file to read',() => {
//     const stderr = new WriteStream();
//     const stdout = new WriteStream();
//     assert.throws(() => new ReporterDefault(stdout, stderr).readFile());
// });

// test('failRequire() should fail if no filename is provided', () => {
//     const stderr = new WriteStream();
//     const stdout = new WriteStream();
//     assert.throws(() => new ReporterDefault(stdout, stderr).failRequire());
// });

test('it should stringify the object given instead of an error through a throw statement', () => {
    const stderr = new WriteStream();
    const stdout = new WriteStream();
    const r = new ReporterDefault(stdout, stderr);

    r.requireFile('test.js');
    r.failRequire({
        a: 1
    });

    stderr.expect(/failed to load test\.js/);
    stderr.expect(/\{\"a\"\:1\}/);
});

test('it should print native Error instance', () => {
    const stderr = new WriteStream();
    const stdout = new WriteStream();
    const reporter = new ReporterDefault(stdout, stderr);

    reporter.requireFile('test.js');
    reporter.failRequire(new Error('can\'t load it'));

    stderr.expect(/failed to load test\.js/);
    stderr.expect(/can\'t load it/);
});

export default suite;
