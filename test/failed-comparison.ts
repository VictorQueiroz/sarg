import assert from 'assert';
import Suite from '../src/Suite';

const suite = new Suite();
const {test} = suite;

test('should not be equal', () => {
    assert.strict.deepEqual({a: 1}, {b: 2});
});

test('will never get executed', () => {
    assert.strict.ok(false);
});

export default suite;
