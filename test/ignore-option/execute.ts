import * as assert from 'assert';
import Suite from '../../src/suite';

const suite = new Suite();
const {test} = suite;

test('it should get executed', () => {
    assert.ok(true);
});

require('../../src').test('test', () => {});

export default suite;
