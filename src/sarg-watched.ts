import { boundMethod } from 'autobind-decorator';
import * as chokidar from 'chokidar';
import * as path from 'path';
import Sarg, { SargOptions } from './sarg';

export type SargWatchedOptions = SargOptions & {
    watch: string[];
    reloadTimeout: number;
};

export default class SargWatched extends Sarg {
    private watcher: chokidar.FSWatcher;
    private runTestsTimer?: NodeJS.Timer;
    private reloadTimeout: number;
    private changedFiles = new Array<string>();

    constructor(private watchOptions: SargWatchedOptions) {
        super(watchOptions);

        this.watcher = chokidar.watch(this.watchOptions.watch);
        this.watcher.on('change', this.onFileChanged);

        this.reloadTimeout = this.watchOptions.reloadTimeout;
    }

    public destroy() {
        this.watcher.close();
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
            delete require.cache[changedFile];
        }
        this.changedFiles = [];
        this.run();
    }

    public onFinishTests() {
        this.invalidateAndRun();
    }

    @boundMethod
    public onFileChanged(changedFile: string) {
        this.changedFiles = this.changedFiles.concat([
            path.resolve(process.cwd(), changedFile)
        ]);
        if(this.runTestsTimer) {
            clearTimeout(this.runTestsTimer);
        }
        this.runTestsTimer = setTimeout(this.invalidateAndRun, this.reloadTimeout);
    }
}
