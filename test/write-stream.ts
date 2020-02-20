import { strict as assert } from 'assert';
import { Duplex } from 'stream';

type StreamCallback = (error?: Error | null) => void;

export default class WriteStream extends Duplex {
    private pending?: Promise<void>;
    private items = new Array<string>();
    public _write(chunk: string, _ENCODING: string, callback: StreamCallback) {
        this.items.push(chunk);
        callback();
    }
    public expect(...chunks: Array<string | RegExp>) {
        if(this.items.length == 0) {
            throw new Error(`Unexpected: "(${chunks.join(' / ')})"`);
        }

        const item = this.items.shift();
        if(!item) {
            throw new Error(`Expected (${chunks.join(' / ')}) but got undefined instead`);
        }

        const buffer = Buffer.from(item);

        for(const chunk of chunks) {
            if(chunk instanceof RegExp) {
                assert.ok(chunk.test(buffer.toString('utf8')), `${chunk} (RegExp) != "${buffer.toString('utf8')}"`);
                return;
            }

            assert.deepEqual(buffer, Buffer.from(chunk, 'utf8'));
        }
    }
    public end() {
        return;
    }
    /**
     * Return pending operations on this stream (i.e. pipe)
     */
    public promise() {
        return this.pending;
    }
    public prepare() {
        this.pending = new Promise((resolve, reject) => {
            this.on('pipe', (readable) => {
                readable.on('close', () => resolve());
                readable.on('error', (reason: any) => reject(reason));
            });
        });
    }
}
