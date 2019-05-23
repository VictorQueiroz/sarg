import { strict as assert } from 'assert';
import { test } from '../src';

test('should not be equal', () => {
    assert.deepEqual({a: 1}, {b: 2});
});

test('will never get executed', () => {
    process.exit(-1);
});
