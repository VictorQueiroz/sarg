# sarg

Simple unit testing runner that will travel through your files letting you know what happened

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

exports['it should return initial state'] = function() {
	assert.equal(reducer(undefined, {}), 0);
};

exports['it should increase counter'] = function() {
	assert.equal(reducer(0, reducer.increaseCounter()), 1);
};

exports['it should decrease counter'] = function() {
	assert.equal(reducer(1, reducer.decreaseCounter()), 0);
};

exports['it should not go lower than 0'] = function() {
	assert.equal(reducer(0, reducer.decreaseCounter()), 0);
};
```

Test it

```
./node_modules/.bin/sarg test.js
```

## Test-Driven Development

The `-w` command will watch changes in files for you.

```
./node_modules/.bin/sarg -w test,src -r test --ignore test/client-test.js
```

## Usage with transpilers

You can use `--require` argument to load code that needs to be transpiled. It is an redundant argument so you can use how many compilers you need

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

## You're a free man

Although it's not the main purpose of this project, still your test code will not be attached to any assertion library or testing framework. Nothing will stop you from doing:

```js
const test1 = require('./test.js');

async function runTests(tests){
    for(let i = 0; i < tests.length; i++){
        for(let name of Object.keys(tests[i])){
            try {
                console.log(name);
                await tests[i][name]();
                console.log('Success!')
                console.log();
            } catch(reason){
                console.error('Failed');
                console.error(reason);
            }
        }
    }
}

runTests([
    test1
])
.then(() => {
    process.exit(0);
})
.catch(reason => {
    console.error(reason);
    process.exit(-1);
});
```

## Reporters

Unfortunately we don't have supports for custom reporters just yet
