import { strict as assert } from 'assert';
import * as glob from 'glob';
import * as path from 'path';
import reducer from './reducers/counter';
import * as actions from './reducers/counter';
import { test } from '../src';

test('it should work while importing modules', () => {
    assert.deepEqual(glob.sync(__dirname + '/../*.md'), [
        path.resolve(__dirname, '../README.md')
    ]);
});

test('its should work while importing modules', () => {
    assert.deepEqual(glob.sync(__dirname + '/../*.md'), [
        path.resolve(__dirname, '../README.md')
    ]);
});

test('it should return initial state', () => {
    assert.equal(reducer(undefined, {}), 0);
});

test('it should increase counter', () => {
    assert.equal(reducer(0, actions.increaseCounter()), 1);
});

test('it should decrease counter', () => {
    assert.equal(reducer(1, actions.decreaseCounter()), 0);
});

test('it should not go lower than 0', () => {
    assert.equal(reducer(0, actions.decreaseCounter()), 0);
});
