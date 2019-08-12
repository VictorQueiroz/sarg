TS_NODE_PROJECT=$PWD/test npx ts-node src/index.ts \
    --bail \
    --require $PWD/test/configure-enzyme.ts \
    --require @babel/register \
    --require source-map-support/register \
    --ignore ./test/ignore-option/ignore.ts \
    --ignore ./test/failed-comparison.ts \
    $@ \
    "./test/**/*.*"
