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
            case ReporterEvents.FailRequire:
                if(!filename)
                    throw new Error('no filename specified');

                this.stderr.write(chalk.red(`\u2715 failed to load ${filename}\n`));
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

        for(let i = 0; i < strings.length; i++) {
            for(let j = 0; j < indent; j++) {
                strings[i] = ' ' + strings[i];
            }
        }

        strings.push('');
        strings.push('');

        return strings.join('\n');
    }

    private printReadableFailure() {
        if(this.failure instanceof AssertionError) {
            let text: string;

            if(!strict) {
                const diff = require('difflet')({
                    indent: 2
                });

                text = diff.compare(this.failure.expected, this.failure.actual);
            } else {
                text = this.failure.message;
            }

            process.stderr.write(this.reindent(text, 2));
            process.stderr.write('\n');
        } else if(this.failure instanceof Error) {
            process.stderr.write(
                this.reindent(this.failure.stack ? this.failure.stack : this.failure.message, 2)
            );
        } else {
            process.stderr.write(this.reindent(JSON.stringify(this.failure), 2));
        }
    }
}
