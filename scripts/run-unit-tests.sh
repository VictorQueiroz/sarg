npx tsc -b src test
TS_NODE_PROJECT=test/tsconfig.json node lib/src \
    --bail \
    --require ts-node/register \
    --require @babel/register \
    --require $PWD/test/configure-enzyme.ts \
    --require source-map-support/register \
    --ignore ./test/ignore-option/ignore \
    --ignore ./test/failed-comparison \
    $@ \
    "./test/**/*.*"
