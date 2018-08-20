import EventEmitter from 'events';
import SargWatched from '../../src/sarg-watched';

function mixin(target, source) {
    target = target.prototype; source = source.prototype;

    Object.getOwnPropertyNames(source).forEach(function (name) {
        if (name !== "constructor") Object.defineProperty(target, name,
        Object.getOwnPropertyDescriptor(source, name));
    });
}

/**
 * Extension of `SargWatched` with the ability to count
 * how many times did tests were runned and catch an event
 * each time running is done
 */
export default class SargCounted extends SargWatched {
    constructor(options) {
        super(options);
        this.runCount = 0;
    }
    async run() {
        await super.run();
        ++this.runCount;
        this.emit('finished');
    }
    onFileChanged() {
        this.emit('fsChanged');
        super.onFileChanged();
    }
    destroy() {
        this.removeAllListeners();
        super.destroy();
    }
}

mixin(SargCounted, EventEmitter);
