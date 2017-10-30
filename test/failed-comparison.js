const assert = require('assert');

exports['should not be equal'] = function() {
    assert.deepEqual({a: 1}, {b: 2});
};

exports['will never get executed'] = function() {
    process.exit(-1);
};
