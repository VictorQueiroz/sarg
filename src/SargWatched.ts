import { boundMethod } from 'autobind-decorator';
import chokidar from 'chokidar';
import path from 'path';
import Sarg, { SargOptions } from './Sarg';

export type SargWatchedOptions = SargOptions & {
    watch: string[];
    reloadTimeout: number;
};

export default class SargWatched extends Sarg {
    #watcher: chokidar.FSWatcher;
    #runTestsTimer: NodeJS.Timer | null;
    #reloadTimeout: number;
    changedFiles = new Array<string>();

    constructor(watchOptions: SargWatchedOptions) {
        super(watchOptions);

        const {
            watch,
            reloadTimeout
        } = watchOptions;

        this.#runTestsTimer = null;
        this.#watcher = chokidar.watch(watch);
        this.#watcher.on('change', this.onFileChanged);
        this.#reloadTimeout = reloadTimeout;
    }

    public override destroy() {
        this.#watcher.close();
        super.destroy();
    }

    @boundMethod
    public invalidateAndRun() {
        const changedFiles = this.changedFiles;
        if(!changedFiles.length || this.isRunning()) {
            return;
        }
        for(const changedFile of changedFiles) {
            if(this.isTestFile(changedFile)) {
                this.invalidateTest(changedFile);
            }
            require.cache[changedFile] = undefined;
        }
        this.changedFiles = [];
        this.run();
    }

    public override onFinishTests() {
        this.invalidateAndRun();
    }

    @boundMethod
    public onFileChanged(changedFile: string) {
        this.changedFiles = this.changedFiles.concat([
            path.resolve(process.cwd(), changedFile)
        ]);
        if(this.#runTestsTimer) {
            clearTimeout(this.#runTestsTimer);
        }
        this.#runTestsTimer = setTimeout(this.invalidateAndRun, this.#reloadTimeout);
    }
}
