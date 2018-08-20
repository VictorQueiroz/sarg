import { test } from '../src';
import Test from '../src/test';
import { strict as assert } from 'assert';

test('it should throw when executor fails', async function() {
    const test1 = new Test('test 1', () => {
        throw new Error('failed');
    });
    try {
        await test1.run();
    } catch(reason) {
        assert.deepEqual(reason, new Error('failed'));
    }
});
