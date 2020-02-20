import { strict as assert } from 'assert';
import Suite from '../src/suite';

const suite = new Suite();
const {test} = suite;

test('should not be equal', () => {
    assert.deepEqual({a: 1}, {b: 2});
});

test('will never get executed', () => {
    process.exit(-1);
});

export default suite;
