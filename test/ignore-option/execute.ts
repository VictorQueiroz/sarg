import assert from 'assert';
import Suite from '../../src/Suite';

const suite = new Suite();
const {test} = suite;

test('it should get executed', () => {
    assert.ok(true);
});

export default suite;
