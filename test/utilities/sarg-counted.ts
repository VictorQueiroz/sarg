import SargWatched, { SargWatchedOptions } from '../../src/SargWatched';

type Listener = (...args: any[]) => void;

/**
 * Extension of `SargWatched` with the ability to count
 * how many times did tests were runned and catch an event
 * each time running is done
 */
export default class SargCounted extends SargWatched {
    public runCount = 0;
    private events = new Map<string, Array<(...args: any[]) => void>>();
    constructor(options: SargWatchedOptions) {
        super(options);
        this.runCount = 0;
    }
    public override async run() {
        await super.run();
        ++this.runCount;
        this.emit('finished');
    }
    public override onFileChanged(file: string) {
        this.emit('fsChanged');
        super.onFileChanged(file);
    }
    public override destroy() {
        this.events = new Map();
        super.destroy();
    }
    public emit(name: string, ...args: any[]) {
        const listeners = this.events.get(name);
        if(!listeners) {
            return;
        }
        for(const fn of listeners) {
            fn(...args);
        }
    }
    public once(name: string, listener: Listener) {
        const tempListener = (...args: any[]) => {
            listener(...args);
            this.removeListener(name, tempListener);
        };
        this.on(name, tempListener);
    }
    public removeListener(name: string, target: Listener) {
        let listeners = this.events.get(name);
        if(!listeners) {
            return;
        }
        for(let i = 0; i < listeners.length; i++) {
            if(target === listeners[i]) {
                listeners = [...listeners];
                listeners.splice(i, 1);
            }
        }
        this.events.set(name, listeners);
    }
    public on(name: string, listener: Listener) {
        let events = this.events.get(name);
        if(!events) {
            events = [];
            this.events.set(name, events);
        }
        events = events.concat([listener]);
        this.events.set(name, events);
    }
}
