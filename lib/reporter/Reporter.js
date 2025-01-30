"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reporter = void 0;
const Logger_1 = require("../utils/Logger");
const Processor_1 = require("../processor/Processor");
const Constants_1 = require("../processor/Constants");
const EnvVars_1 = require("../processor/EnvVars");
const EnvVarService_1 = require("../utils/EnvVarService");
const fs = require("fs");
const path = require("path");
class Reporter {
    constructor(mGlobalConfig, mOptions) {
        this.mGlobalConfig = mGlobalConfig;
        this.mOptions = mOptions;
        this.mEnvSrv = new EnvVarService_1.EnvVarService(EnvVars_1.EnvVars.ENV_PREFIX);
        this.logger.on = this.mEnvSrv.readBoolEnvValue("LOG");
    }
    onRunStart(results, options) {
        if (Object.entries(this.mOptions).length === 0 &&
            this.mOptions.constructor === Object) {
            Processor_1.Processor.run(results, { additionalResultsProcessors: [], log: false }, { reporter: this });
        }
        else {
            this.mOptions.additionalResultsProcessors = [];
            this.mLogOption = this.mOptions.log;
            this.mOptions.log = false;
            Processor_1.Processor.run(results, this.mOptions, { reporter: this });
        }
        this.logger.info(Constants_1.Constants.LOGO +
            Constants_1.Constants.REPORTER_WRITTING +
            this.jestStareConfig.resultDir +
            Constants_1.Constants.SUFFIX);
    }
    onTestStart(test) {
    }
    onTestResult(test, testResult, results) {
        const failedTests = testResult.testResults.filter((t) => t.status === "failed");
        failedTests.forEach((failedTest) => {
            failedTest.domSnapshot = getDOMSnapshot({
                testPath: test.path,
                testFullName: failedTest.fullName,
            });
        });
        if (Object.entries(this.mOptions).length === 0 &&
            this.mOptions.constructor === Object) {
            Processor_1.Processor.run(results, { additionalResultsProcessors: [], log: false }, { reporter: this });
        }
        else {
            this.mOptions.additionalResultsProcessors = [];
            Processor_1.Processor.run(results, this.mOptions, { reporter: this });
        }
    }
    onRunComplete(unused, results) {
        if (Object.entries(this.mOptions).length === 0 &&
            this.mOptions.constructor === Object) {
            Processor_1.Processor.run(results, { additionalResultsProcessors: [] }, { reporter: this });
        }
        else {
            this.mOptions.additionalResultsProcessors = [];
            this.mOptions.log = this.mLogOption;
            Processor_1.Processor.run(results, this.mOptions, { reporter: this });
        }
    }
    get jestStareConfig() {
        return this.mJestStareConfig || {};
    }
    set jestStareConfig(config) {
        this.mJestStareConfig = config;
    }
    set logger(logger) {
        this.mLog = logger;
    }
    get logger() {
        if (this.mLog == null) {
            this.logger = new Logger_1.Logger();
        }
        return this.mLog;
    }
}
exports.Reporter = Reporter;
function getDOMSnapshot({ testPath, testFullName }) {
    const fileName = testPath.split("/").pop();
    const testId = `${fileName}__${testFullName}`;
    const snapshotPath = path.join(__dirname, `${testId}.json`);
    let data;
    try {
        data = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    }
    catch (e) {
        console.error(`[Jest Stare]: Error reading snapshot file: ${snapshotPath}`);
        return "";
    }
    return (data === null || data === void 0 ? void 0 : data.domSnapshot) || "";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVwb3J0ZXIvUmVwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNENBQXlDO0FBQ3pDLHNEQUFtRDtBQUVuRCxzREFBbUQ7QUFDbkQsa0RBQStDO0FBQy9DLDBEQUF1RDtBQUl2RCx5QkFBeUI7QUFDekIsNkJBQTZCO0FBVTdCLE1BQWEsUUFBUTtJQXFDakIsWUFDVyxhQUFvQyxFQUNuQyxRQUEwQjtRQUQzQixrQkFBYSxHQUFiLGFBQWEsQ0FBdUI7UUFDbkMsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7UUFFbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDZCQUFhLENBQUMsaUJBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFRTSxVQUFVLENBQ2IsT0FBeUIsRUFDekIsT0FBK0I7UUFHL0IsSUFDSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsS0FBSyxNQUFNLEVBQ3RDO1lBRUUscUJBQVMsQ0FBQyxHQUFHLENBQ1QsT0FBTyxFQUNQLEVBQUUsMkJBQTJCLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFDL0MsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQ3JCLENBQUM7U0FDTDthQUFNO1lBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsR0FBRyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxL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