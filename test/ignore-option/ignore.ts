import Suite from '../../src/suite';

const suite = new Suite();
const {test} = suite;

test('it should be ignored', () => {
    process.exit(1);
});

export default suite;
