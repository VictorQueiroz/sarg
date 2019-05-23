import { strict as assert } from 'assert';
import { shallow } from 'enzyme';
import * as React from 'react';
import { test } from '../src';
import Topbar from './Topbar';

test('should render topbar', () => {
    const wrapper = shallow(
        <Topbar/>
    );

    assert.equal(wrapper.text(), 'Topbar test');
});
