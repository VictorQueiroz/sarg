import { AssertionError, strict } from 'assert';
import chalk from 'chalk';
import Reporter, { ReporterEvents } from './reporter';

export default class ReporterDefault extends Reporter {
    public describe(event: ReporterEvents) {
        let { filename } = this;
        const { test } = this;

        switch(event) {
            case ReporterEvents.ReadFile:
                if(!filename)
                    throw new Error('no filename specified');

                filename = filename.replace(process.cwd() + '/', '');
                this.stdout.write(`${chalk.white(filename)}:\n`);
                break;
            case ReporterEvents.EndFile:
                this.stdout.write('\n');
                break;
            case ReporterEvents.Finished:
                this.stdout.write(chalk.underline(
                    chalk.whiteBright('SUMMARY:\n')
                ));
                this.stdout.write(chalk.green(`\u2713 ${Math.max(0, this.successesCount)} tests completed\n`));
                this.stdout.write(chalk.red(`\u2715 ${Math.max(0, this.failuresCount)} tests failed\n`));
                this.stdout.write('\n');
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
    private printReadableFailure() {
        let strings: string[] = [];
        if(this.failure instanceof AssertionError) {
            if(!strict) {
                const diff = require('difflet')({
                    indent: 2
                });

                strings = diff.compare(this.failure.expected, this.failure.actual).split('\n');
            } else {
                strings = this.failure.message.split('\n');
            }

            strings.unshift('');

            for(let i = 0; i < strings.length; i++) {
                strings[i] = '  ' + strings[i];
            }

            process.stderr.write(`${strings.join('\n')}\n`);
        } else {
            /* tslint:disable no-console */
            console.error(this.failure);
            /* tslint:enable no-console */
        }
    }
}
