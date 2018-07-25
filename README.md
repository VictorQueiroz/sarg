# sarg

Simple unit testing runner that will travel through your files letting you know what happened. Simple fast and with TypeScript definitions included!

## Installation

The following approaches are valid:

```
npm install -g sarg
yarn add -D sarg
npm install --save-dev sarg
```

## Usage

If you want detailed information about what each argument does, you can hit:

```
./node_modules/.bin/sarg --help
```

Create your `test.js` file

```js
const assert = require('assert');
const reducer = require('./src/reducers/counter');
const { test } = require('sarg');

test('it should return initial state', function() {
	assert.equal(reducer(undefined, {}), 0);
});

test('it should increase counter', function() {
	assert.equal(reducer(0, reducer.increaseCounter()), 1);
});

test('it should decrease counter', function() {
	assert.equal(reducer(1, reducer.decreaseCounter()), 0);
});

test('it should not go lower than 0', function() {
	assert.equal(reducer(0, reducer.decreaseCounter()), 0);
});
```

Test it

```
./node_modules/.bin/sarg test.js
```

## Test-Driven Development

The `-w` command will watch changes in files for you.

```
./node_modules/.bin/sarg -w test,src --ignore test/client-test.js "test/**/*.{js,tsx?}"
```

## Usage with transpilers

You can use `--require` argument to load code that needs to be transpiled. It is an redundant argument so you can use how many compilers you need.

It works well with TypeScript and Babel register, you're free to use it together with no problem.

### Babel
```
./node_modules/.bin/sarg \
	--require babel-register \
	-w test,src -r test
```

### TypeScript

```
./node_modules/.bin/sarg \
	--require ts-node/register
	-w test,src
	-r test
```

## Reporters

Reporters are now available, you can easily extend the base reporter and create your own. Click [here](src/reporters/reporter.ts) and create your first one.
