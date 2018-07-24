SARG_EXEC = ./bin/sarg

release:
	rm -frv lib && \
	mkdir -p bin && \
	./node_modules/.bin/tsc --build src/tsconfig.json && \
	chmod +x $(SARG_EXEC) && \
	node -e 'console.log("---\nnew build for version %s generated", require("chalk").blue(require("./package.json").version))'

test: release
	$(SARG_EXEC) test/simple-test.js && \
	NODE_ENV=testing TS_NODE_PROJECT=$(PWD)/test $(SARG_EXEC) --require ${PWD}/test/configure-enzyme.js --require ts-node/register test/typescript-test.js && \
	NODE_ENV=testing $(SARG_EXEC) --require babel-register test/babel-test.js && \
	$(SARG_EXEC) -b test/failed-comparison.js && \
	$(SARG_EXEC) test/ignore-option/execute.js --ignore test/ignore-option/ignore.js && \
	echo "\n\nSuccess"

.PHONY: release test
