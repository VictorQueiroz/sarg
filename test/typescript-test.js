const assert = require('assert');
const React = require('react');
const Topbar = require('./Topbar').default;
const { shallow } = require('enzyme');

exports['should render topbar'] = function() {
    const wrapper = shallow(
        <Topbar/>
    );

    assert.equal(wrapper.text(), 'Topbar test');
};
