import stream from 'stream';
import { strict as assert } from 'assert';

export default class WriteStream extends stream.Writable {
    constructor() {
        super();
        this.items = [];
    }
    _write(chunk, encoding, callback) {
        this.items.push(chunk);
        callback();
    }
    expect(chunk) {
        if(this.items.length == 0) {
            throw new Error(`Unexpected: "${chunk}"`);
        }

        const buffer = Buffer.from(this.items.shift());

        if(chunk instanceof RegExp) {
            assert.ok(chunk.test(buffer.toString('utf8')), `${chunk} (RegExp) != "${buffer.toString('utf8')}"`);
            return;
        }

        assert.deepEqual(buffer, Buffer.from(chunk, 'utf8'));
    }
    end() {}
    /**
     * Return pending operations on this stream (i.e. pipe)
     */
    promise() { return this.pending; }
    prepare() {
        this.pending = new Promise((resolve, reject) => this.on('pipe', readable => {
            readable.on('close', () => resolve());
            readable.on('error', reason => reject(reason));
        }));
    }
}
