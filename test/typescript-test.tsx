import { strict as assert } from 'assert';
import { shallow } from 'enzyme';
import * as React from 'react';
import Topbar from './Topbar';
import Suite from '../src/suite';

const suite = new Suite();
const {test} = suite;

test('should render topbar', () => {
    const wrapper = shallow(
        <Topbar/>
    );

    assert.equal(wrapper.text(), 'Topbar test');
});
