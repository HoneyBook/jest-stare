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
        function getDOMSnapshot(testFullName) {
            var _a;
            const fileName = test.path.split("/").pop();
            const testId = `${fileName}__${testFullName}`;
            const snapshotPath = path.join(__dirname, `${testId}.json`);
            const data = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
            console.log("testId", testId);
            console.log("data", data);
            return ((_a = global.failedTestsIdToSnapshot) === null || _a === void 0 ? void 0 : _a[testId]) || "";
        }
        console.log("AGGREGATED RESULT", results);
        const failedTests = testResult.testResults.filter((t) => t.status === "failed");
        if (failedTests.length > 0) {
            failedTests.forEach((failedTest) => {
                console.log("failedTest", failedTest);
                failedTest.domSnapshot = getDOMSnapshot(failedTest.fullName);
            });
        }
        console.log("testResult", testResult.testResults.length);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVwb3J0ZXIvUmVwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNENBQXlDO0FBQ3pDLHNEQUFtRDtBQUVuRCxzREFBbUQ7QUFDbkQsa0RBQStDO0FBQy9DLDBEQUF1RDtBQUl2RCx5QkFBeUI7QUFDekIsNkJBQTZCO0FBVTdCLE1BQWEsUUFBUTtJQXFDakIsWUFDVyxhQUFvQyxFQUNuQyxRQUEwQjtRQUQzQixrQkFBYSxHQUFiLGFBQWEsQ0FBdUI7UUFDbkMsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7UUFFbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDZCQUFhLENBQUMsaUJBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFRTSxVQUFVLENBQ2IsT0FBeUIsRUFDekIsT0FBK0I7UUFHL0IsSUFDSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsS0FBSyxNQUFNLEVBQ3RDO1lBRUUscUJBQVMsQ0FBQyxHQUFHLENBQ1QsT0FBTyxFQUNQLEVBQUUsMkJBQTJCLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFDL0MsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQ3JCLENBQUM7U0FDTDthQUFNO1lBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsR0FBRyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxL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