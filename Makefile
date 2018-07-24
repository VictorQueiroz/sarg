SARG_EXEC = ./bin/sarg

release:
	mkdir -p bin && \
	NODE_ENV=production ./node_modules/.bin/babel src/sarg \
	-o bin/sarg && \
	chmod +x bin/sarg && \
	node -e 'console.log("---\nnew build for version %s generated", require("chalk").blue(require("./package.json").version))'

test: release
	rm -rfv bin && \
	./src/sarg test/simple-test.js && \
	NODE_ENV=testing ./src/sarg --require ${PWD}/test/configure-enzyme.js --require ts-node/register test/typescript-test.js && \
	NODE_ENV=testing ./src/sarg --require babel-register test/babel-test.js && \
	./src/sarg -b test/failed-comparison.js && \
	./src/sarg test/ignore-option/execute.js --ignore test/ignore-option/ignore.js && \
	NODE_ENV=testing TS_NODE_PROJECT=$(PWD)/test $(SARG_EXEC) --require ${PWD}/test/configure-enzyme.js --require ts-node/register test/typescript-test.js && \
	echo "\n\nSuccess"

.PHONY: release test
