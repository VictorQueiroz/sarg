import assert from 'assert';
import glob from 'glob';
import path from 'path';
import reducer from './reducers/counter';
import * as actions from './reducers/counter';

exports['it should work while importing modules'] = function() {
    assert.deepEqual(glob.sync(__dirname + '/../*.md'), [
        path.resolve(__dirname, '../README.md')
    ]);
};

exports['its should work while importing modules'] = function() {
    assert.deepEqual(glob.sync(__dirname + '/../*.md'), [
        path.resolve(__dirname, '../README.md')
    ]);
};

exports['it should return initial state'] = function() {
    assert.equal(reducer(undefined, {}), 0);
};

exports['it should increase counter'] = function() {
    assert.equal(reducer(0, actions.increaseCounter()), 1);
};

exports['it should decrease counter'] = function() {
    assert.equal(reducer(1, actions.decreaseCounter()), 0);
};

exports['it should not go lower than 0'] = function() {
    assert.equal(reducer(0, actions.decreaseCounter()), 0);
};
