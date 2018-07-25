import * as chokidar from 'chokidar';
import Sarg, { SargOptions } from './sarg';

export type SargWatchedOptions = SargOptions & {
    watch: string[];
};

export default class SargWatched extends Sarg {
    private watcher: chokidar.FSWatcher;
    private runTestsTimer?: NodeJS.Timer;

    constructor(options: SargWatchedOptions) {
        super(options);

        this.onFileChanged = this.onFileChanged.bind(this);

        this.watcher = chokidar.watch(options.watch);
        this.watcher.on('change', this.onFileChanged);
    }

    private onFileChanged() {
        if(this.isRunning()) {
            return;
        }
        if(this.runTestsTimer) {
            clearTimeout(this.runTestsTimer);
        }
        this.runTestsTimer = setTimeout(() => this.run(), 100);
    }
}
