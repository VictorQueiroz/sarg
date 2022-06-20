import Reporter from '../src/reporters/Reporter';

export default class ReporterSilent extends Reporter {
    public warn(): void {
        return;
    }
    public describe() {
        return;
    }
}
