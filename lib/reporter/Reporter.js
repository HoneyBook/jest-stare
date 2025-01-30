"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reporter = void 0;
const Logger_1 = require("../utils/Logger");
const Processor_1 = require("../processor/Processor");
const Constants_1 = require("../processor/Constants");
const EnvVars_1 = require("../processor/EnvVars");
const EnvVarService_1 = require("../utils/EnvVarService");
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
            var _a, _b;
            const fileName = test.path.split("/").pop();
            const testId = `${fileName}@${testFullName}`;
            console.log("testId", testId);
            console.log("global.failedTestsIdToSnapshot", global.failedTestsIdToSnapshot);
            console.log("global.failedTestsIdToSnapshot?.[testId]", (_a = global.failedTestsIdToSnapshot) === null || _a === void 0 ? void 0 : _a[testId]);
            return ((_b = global.failedTestsIdToSnapshot) === null || _b === void 0 ? void 0 : _b[testId]) || "";
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVwb3J0ZXIvUmVwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNENBQXlDO0FBQ3pDLHNEQUFtRDtBQUVuRCxzREFBbUQ7QUFDbkQsa0RBQStDO0FBQy9DLDBEQUF1RDtBQWF2RCxNQUFhLFFBQVE7SUFxQ2pCLFlBQ1csYUFBb0MsRUFDbkMsUUFBMEI7UUFEM0Isa0JBQWEsR0FBYixhQUFhLENBQXVCO1FBQ25DLGFBQVEsR0FBUixRQUFRLENBQWtCO1FBRWxDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSw2QkFBYSxDQUFDLGlCQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBUU0sVUFBVSxDQUNiLE9BQXlCLEVBQ3pCLE9BQStCO1FBRy9CLElBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUM7WUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEtBQUssTUFBTSxFQUN0QztZQUVFLHFCQUFTLENBQUMsR0FBRyxDQUNULE9BQU8sRUFDUCxFQUFFLDJCQUEyQixFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQy9DLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUNyQixDQUFDO1NBQ0w7YUFBTTtZQUVILElBQUksQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEdBQUcsRUFBRSxDQUFDO1lBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO1lBQzFCLHFCQUFTLENBQUMs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