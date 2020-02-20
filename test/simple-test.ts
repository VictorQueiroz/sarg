import { strict as assert } from 'assert';
import Suite from '../src/suite';

const suite = new Suite();
const {test} = suite;

test('it should work', () => {
    assert.ok(true);
});

export default suite;
