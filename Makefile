release:
	rm -frv lib && \
	npx tsc -b src test && \
	cp -v HELP LICENSE lib && \
	node -e 'console.log("---\nnew build for version %s generated", require("chalk").blue(require("./package.json").version))'

test:
	scripts/run-unit-tests.sh

tdd:
	scripts/run-unit-tests.sh -w "./{src,test}/**/*.*"

coverage:
	npx nyc --reporter html --reporter-dir coverage ./scripts/run-unit-tests.sh

.PHONY: release test coverage tdd
