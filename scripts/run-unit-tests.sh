TS_NODE_PROJECT=$PWD/test ts-node src/index.ts \
    --bail \
    --require $PWD/test/configure-enzyme.js \
    --require babel-register \
    --require source-map-support/register \
    --ignore ./test/ignore-option/ignore.js \
    --ignore ./test/failed-comparison.js \
    $@ \
    "./test/**/*.js"
