const { strict: assert } = require('assert');
const { test } = require('../src');

test('should not be equal', function() {
    assert.deepEqual({a: 1}, {b: 2});
});

test('will never get executed', function() {
    process.exit(-1);
});
