import assert from 'assert';
import glob from 'glob';
import path from 'path';
import reducer from './reducers/counter';
import * as actions from './reducers/counter';
import Suite from '../src/Suite';

const suite = new Suite();
const {test} = suite;

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

export default suite;
