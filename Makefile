SARG_EXEC = ./bin/sarg

release:
	rm -frv lib && \
	mkdir -p bin && \
	./node_modules/.bin/tsc --build src/tsconfig.json && \
	chmod +x $(SARG_EXEC) && \
	node -e 'console.log("---\nnew build for version %s generated", require("chalk").blue(require("./package.json").version))'

test: release
	TS_NODE_PROJECT=$(PWD)/test $(SARG_EXEC) \
		--require $(PWD)/test/configure-enzyme.js \
		--require ts-node/register \
		--require babel-register \
		--ignore ./test/ignore-option/ignore.js \
		--ignore ./test/failed-comparison.js \
		"./test/**/*.js"

.PHONY: release test
