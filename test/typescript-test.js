const { strict: assert } = require('assert');
const React = require('react');
const Topbar = require('./Topbar').default;
const { shallow } = require('enzyme');
const { test } = require('../lib');

test('should render topbar', function() {
    const wrapper = shallow(
        <Topbar/>
    );

    assert.equal(wrapper.text(), 'Topbar test');
});
