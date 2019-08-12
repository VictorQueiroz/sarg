release:
	rm -frv lib && \
	mkdir -p bin && \
	npx tsc --project src/tsconfig.json && \
	chmod +x lib/index.js && \
	node -e 'console.log("---\nnew build for version %s generated", require("chalk").blue(require("./package.json").version))'

test:
	scripts/run-unit-tests.sh

tdd:
	scripts/run-unit-tests.sh -w ./{src,test}/**/*.*

coverage:
	npx nyc --reporter html --reporter-dir coverage ./scripts/run-unit-tests.sh

.PHONY: release test coverage tdd
