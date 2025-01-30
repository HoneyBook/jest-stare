import { IJestStareConfig } from "./doc/IJestStareConfig";
import { Logger } from "../utils/Logger";
import { IProcessParms } from "./doc/IProcessParms";
import { AggregatedResult } from "@jest/test-result";
export declare class Processor {
    private mResults;
    private mExplicitConfig?;
    private mProcessParms?;
    private domSnapshot?;
    static run(results: AggregatedResult, explicitConfig?: IJestStareConfig, parms?: IProcessParms, domSnapshot?: string): AggregatedResult;
    private mLog;
    constructor(mResults: AggregatedResult, mExplicitConfig?: IJestStareConfig, mProcessParms?: IProcessParms, domSnapshot?: string);
    private generate;
    private collectImageSnapshots;
    private generateReport;
    private execute;
    private addThirdParty;
    private obtainWebFile;
    private obtainJsRenderFile;
    set logger(logger: Logger);
    get logger(): Logger;
}
