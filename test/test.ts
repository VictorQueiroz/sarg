import { strict as assert } from 'assert';
import Test from '../src/Test';
import Suite from '../src/Suite';

const suite = new Suite();
const {test} = suite;

test('it should throw when executor fails', async () => {
    const test1 = new Test('test 1', () => {
        throw new Error('failed');
    });
    try {
        await test1.run();
    } catch(reason) {
        assert.deepEqual(reason, new Error('failed'));
    }
});

export default suite;
