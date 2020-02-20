import chalk from 'chalk';
import * as path from 'path';
import Reporter, { ReporterEvents } from './reporter';
import { diffJson } from 'diff';

export default class ReporterDefault extends Reporter {
    public describe(event: ReporterEvents) {
        let { filename } = this;
        const { test } = this;

        switch(event) {
            case ReporterEvents.ReadFile:
                if(!filename)
                    throw new Error('no filename specified');

                filename = filename.replace(path.resolve(process.cwd(), '/'), '');
                this.stdout.write(`${chalk.white(filename)}:\n`);
                break;
            case ReporterEvents.EndFile:
                this.stdout.write('\n');
                break;
            case ReporterEvents.Finished:
                // this.stdout.write(chalk.yellowBright(''));
                this.stdout.write(chalk.underline(
                    chalk.whiteBright('SUMMARY:\n')
                ));
                this.stdout.write(chalk.green(`\u2713 ${Math.max(0, this.successesCount)} tests completed\n`));
                this.stdout.write(chalk.red(`\u2715 ${Math.max(0, this.failuresCount)} tests failed\n`));
                this.stdout.write('\n');
                break;
            case ReporterEvents.FailRequire:
                if(!filename)
                    throw new Error('no filename specified');

                this.stderr.write(chalk.red(`\u2715 failed to load ${filename}\n`));
                this.printReadableFailure();
                break;
            case ReporterEvents.FailFilenameExecutor:
            case ReporterEvents.FailEachExecutor:
                this.stderr.write(chalk.red(`\u2715 each block execution failed ${filename}\n`));
                this.printReadableFailure();
                break;
            case ReporterEvents.SucceedTest:
            case ReporterEvents.FailTest:
                if(!test)
                    throw new Error('no test specified');

                let timeElapsed = '';

                if(test.timeElapsed() > 0)
                    timeElapsed = ` (${test.timeElapsed()}ms)`;

                if(event == ReporterEvents.SucceedTest)
                    this.stdout.write(chalk.green(`  \u2713 ${test.name()}${timeElapsed}\n`));
                else {
                    this.stderr.write(chalk.red(`  \u2715 ${test.name()}${timeElapsed}\n`));
                    this.printReadableFailure();
                }
        }
    }

    private reindent(text: string, indent: number = 2): string {
        const strings = text.split('\n');

        // console.log(strings);

        for(let i = 0; i < strings.length; i++) {
            if(!strings[i]) {
                continue;
            }
            for(let j = 0; j < indent; j++) {
                strings[i] = ' ' + strings[i];
            }
        }

        return strings.join('\n');
    }

    private printReadableFailure() {
        /*if(this.failure instanceof Error) {
            this.stderr.write(
                this.reindent(this.failure.stack ? this.failure.stack : this.failure.message, 2)
            );
        } else */if(this.failure && this.failure.expected && this.failure.actual) {
            const changes = diffJson(this.failure.expected, this.failure.actual);
            this.stderr.write('\n');
            this.stderr.write(this.reindent(chalk.green('+ Expected'), 2));
            this.stderr.write(' / ');
            this.stderr.write(chalk.red('- Actual'));
            this.stderr.write('\n\n');
            for(let {value, removed, added} of changes) {
                value = this.reindent(value, 2);
                if(removed) {
                    value = chalk.red(value);
                } else if(added) {
                    value = chalk.green(value);
                }
                this.stderr.write(value);
            }
            this.stderr.write('\n');
            this.stderr.write('\n');
        } else if(this.failure && (this.failure.stack || this.failure.message)) {
            if(this.failure.stack) {
                this.stderr.write(this.reindent(this.failure.stack, 2));
            } else if(this.failure.message) {
                this.stderr.write(this.reindent(this.failure.message, 2));
            }
        } else if(this.failure) {
            this.stderr.write(this.reindent(JSON.stringify(this.failure), 2));
        }
    }
    public warn(message: string) {
        this.stderr.write(chalk.yellow(`\u2757 ${message}`));
    }
}
