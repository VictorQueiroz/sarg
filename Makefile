release: test
	mkdir -p bin && \
	NODE_ENV=production ./node_modules/.bin/babel src/sarg \
	-o bin/sarg && \
	chmod +x bin/sarg && \
	node -e 'console.log("---\nnew build for version %s generated", require("chalk").blue(require("./package.json").version))'

test:
	rm -rfv bin && \
	./src/sarg test/simple-test.js && \
	NODE_ENV=testing ./src/sarg --require ${PWD}/test/configure-enzyme.js --require ts-node/register test/typescript-test.js && \
	NODE_ENV=testing ./src/sarg --require babel-register test/babel-test.js && \
	./src/sarg -b test/failed-comparison.js && \
	./src/sarg test/ignore-option/execute.js --ignore test/ignore-option/ignore.js && \
	echo "\n\nSuccess"

.PHONY: release test
