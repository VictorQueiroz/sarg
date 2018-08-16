import * as chokidar from 'chokidar';
import Sarg, { SargOptions } from './sarg';

export type SargWatchedOptions = SargOptions & {
    watch: string[];
    reloadTimeout: number;
};

export default class SargWatched extends Sarg {
    private watcher: chokidar.FSWatcher;
    private runTestsTimer?: NodeJS.Timer;
    private reloadTimeout: number;

    constructor(options: SargWatchedOptions) {
        super(options);

        this.onFileChanged = this.onFileChanged.bind(this);

        this.watcher = chokidar.watch(options.watch);
        this.watcher.on('change', this.onFileChanged);

        this.reloadTimeout = options.reloadTimeout;
    }

    public destroy() {
        this.watcher.close();
        super.destroy();
    }

    private onFileChanged() {
        if(this.isRunning()) {
            return;
        }
        if(this.runTestsTimer) {
            clearTimeout(this.runTestsTimer);
        }
        this.runTestsTimer = setTimeout(() => this.run(), this.reloadTimeout);
    }

    public onFinishTests() {
    }
}
