import Reporter from '../src/reporters/reporter';

export default class ReporterSilent extends Reporter {
    public describe() {
        return;
    }
}
