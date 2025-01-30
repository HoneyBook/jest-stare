"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Processor = void 0;
const Constants_1 = require("./Constants");
const IO_1 = require("../utils/IO");
const mustache = require("mustache");
const path = require("path");
const Logger_1 = require("../utils/Logger");
const chalk = require("chalk");
const Dependencies_1 = require("./Dependencies");
const util_1 = require("util");
const Config_1 = require("./Config");
const ImageSnapshotDifference_1 = require("../render/diff/ImageSnapshotDifference");
class Processor {
    static run(results, explicitConfig, parms, domSnapshot) {
        return new Processor(results, explicitConfig, parms, domSnapshot).generate();
    }
    constructor(mResults, mExplicitConfig, mProcessParms, domSnapshot) {
        this.mResults = mResults;
        this.mExplicitConfig = mExplicitConfig;
        this.mProcessParms = mProcessParms;
        this.domSnapshot = domSnapshot;
    }
    generate() {
        const substitute = {};
        if ((0, util_1.isNullOrUndefined)(this.mResults)) {
            throw new Error(Constants_1.Constants.NO_INPUT);
        }
        const config = new Config_1.Config(this.logger, this.mExplicitConfig, this.mProcessParms).buildConfig();
        substitute.results = this.mResults;
        substitute.rawResults = JSON.stringify(this.mResults, null, 2);
        substitute.jestStareConfig = config;
        substitute.rawJestStareConfig = JSON.stringify(config, null, 2);
        if (this.mProcessParms && this.mProcessParms.reporter) {
            this.mProcessParms.reporter.jestStareConfig = config;
            substitute.globalConfig = JSON.stringify(this.mProcessParms.reporter.mGlobalConfig, null, 2);
        }
        this.generateReport(config.resultDir, substitute, this.mProcessParms);
        this.collectImageSnapshots(config.resultDir, this.mResults);
        if (config.additionalResultsProcessors != null) {
            this.execute(this.mResults, config.additionalResultsProcessors);
        }
        return this.mResults;
    }
    collectImageSnapshots(resultDir, results) {
        results.testResults.forEach((rootResult) => {
            if (rootResult.numFailingTests) {
                rootResult.testResults.forEach((testResult) => {
                    testResult.failureMessages.forEach((failureMessage) => {
                        if (typeof failureMessage === "string" &&
                            ImageSnapshotDifference_1.ImageSnapshotDifference.containsDiff(failureMessage)) {
                            const diffImagePath = ImageSnapshotDifference_1.ImageSnapshotDifference.parseDiffImagePath(failureMessage);
                            const diffImageName = ImageSnapshotDifference_1.ImageSnapshotDifference.parseDiffImageName(failureMessage);
                            if (IO_1.IO.existsSync(diffImagePath)) {
                                IO_1.IO.mkdirsSync(resultDir +
                                    Constants_1.Constants.IMAGE_SNAPSHOT_DIFF_DIR);
                                const reportDiffImagePath = resultDir +
                                    Constants_1.Constants.IMAGE_SNAPSHOT_DIFF_DIR +
                                    diffImageName;
                                IO_1.IO.copyFileSync(diffImagePath, reportDiffImagePath);
                            }
                        }
                    });
                });
            }
        });
    }
    generateReport(resultDir, substitute, parms) {
        IO_1.IO.mkdirsSync(resultDir);
        IO_1.IO.writeFileSync(resultDir + substitute.jestStareConfig.resultJson, substitute.rawResults);
        if (substitute.jestStareConfig.jestStareConfigJson) {
            IO_1.IO.writeFileSync(resultDir + substitute.jestStareConfig.jestStareConfigJson, substitute.rawJestStareConfig);
        }
        if (substitute.globalConfig &&
            substitute.jestStareConfig.jestGlobalConfigJson) {
            IO_1.IO.writeFileSync(resultDir + substitute.jestStareConfig.jestGlobalConfigJson, substitute.globalConfig);
        }
        if (substitute.jestStareConfig.report != null &&
            !substitute.jestStareConfig.report) {
            return;
        }
        IO_1.IO.writeFileSync(resultDir + substitute.jestStareConfig.resultHtml, mustache.render(this.obtainWebFile(Constants_1.Constants.TEMPLATE_HTML), substitute));
        const cssDir = resultDir + Constants_1.Constants.CSS_DIR;
        IO_1.IO.mkdirsSync(cssDir);
        IO_1.IO.writeFileSync(cssDir + Constants_1.Constants.JEST_STARE_CSS, this.obtainWebFile(Constants_1.Constants.JEST_STARE_CSS));
        const jsDir = resultDir + Constants_1.Constants.JS_DIR;
        IO_1.IO.mkdirsSync(jsDir);
        IO_1.IO.writeFileSync(jsDir + Constants_1.Constants.JEST_STARE_JS, this.obtainJsRenderFile(Constants_1.Constants.JEST_STARE_JS));
        Dependencies_1.Dependencies.THIRD_PARTY_DEPENDENCIES.forEach((dependency) => {
            const updatedDependency = Object.assign({}, ...[dependency]);
            updatedDependency.targetDir = resultDir + dependency.targetDir;
            this.addThirdParty(updatedDependency);
        });
        let type = " ";
        type +=
            parms && parms.reporter
                ? Constants_1.Constants.REPORTERS
                : Constants_1.Constants.TEST_RESULTS_PROCESSOR;
        this.logger.info(Constants_1.Constants.LOGO +
            type +
            Constants_1.Constants.LOG_MESSAGE +
            resultDir +
            substitute.jestStareConfig.resultHtml +
            Constants_1.Constants.SUFFIX);
    }
    execute(jestTestData, processors) {
        for (const processor of processors) {
            if (processor === Constants_1.Constants.NAME) {
                this.logger.error("Error: In order to avoid infinite loops, " +
                    "jest-stare cannot be listed as an additional processor. Skipping... ");
                continue;
            }
            try {
                require(processor)(jestTestData);
                this.logger.info(Constants_1.Constants.LOGO +
                    " passed results to additional processor " +
                    chalk.white('"' + processor + '"') +
                    Constants_1.Constants.SUFFIX);
            }
            catch (e) {
                this.logger.error('Error executing additional processor: "' +
                    processor +
                    '" ' +
                    e);
            }
        }
    }
    addThirdParty(dependency) {
        return __awaiter(this, void 0, void 0, function* () {
            const location = require.resolve(dependency.requireDir + dependency.file);
            yield IO_1.IO.writeFileSync(dependency.targetDir + dependency.file, IO_1.IO.readFileSync(location));
        });
    }
    obtainWebFile(name) {
        return IO_1.IO.readFileSync(path.resolve(__dirname + "/../../web/" + name));
    }
    obtainJsRenderFile(name) {
        return IO_1.IO.readFileSync(path.resolve(__dirname + "/../render/" + name));
    }
    set logger(logger) {
        this.mLog = logger;
    }
    get logger() {
        if ((0, util_1.isNullOrUndefined)(this.mLog)) {
            this.logger = new Logger_1.Logger();
        }
        return this.mLog;
    }
}
exports.Processor = Processor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb2Nlc3Nvci9Qcm9jZXNzb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBRXhDLG9DQUFpQztBQUNqQyxxQ0FBcUM7QUFDckMsNkJBQTZCO0FBRTdCLDRDQUF5QztBQUN6QywrQkFBK0I7QUFFL0IsaURBQThDO0FBQzlDLCtCQUF5QztBQUV6QyxxQ0FBa0M7QUFDbEMsb0ZBQWlGO0FBUWpGLE1BQWEsU0FBUztJQVVYLE1BQU0sQ0FBQyxHQUFHLENBQ2IsT0FBeUIsRUFDekIsY0FBaUMsRUFDakMsS0FBcUIsRUFDckIsV0FBb0I7UUFFcEIsT0FBTyxJQUFJLFNBQVMsQ0FDaEIsT0FBTyxFQUNQLGNBQWMsRUFDZCxLQUFLLEVBQ0wsV0FBVyxDQUNkLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDakIsQ0FBQztJQWlCRCxZQUNZLFFBQTBCLEVBQzFCLGVBQWtDLEVBQ2xDLGFBQTZCLEVBQzdCLFdBQW9CO1FBSHBCLGFBQVEsR0FBUixRQUFRLENBQWtCO1FBQzFCLG9CQUFlLEdBQWYsZUFBZSxDQUFtQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFDN0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7SUFDN0IsQ0FBQztJQVFJLFFBQVE7UUFDWixNQUFNLFVBQVUsR0FBZ0IsRUFBRSxDQUFDO1FBR25DLElBQUksSUFBQSx3QkFBaUIsRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQ3JCLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLGVBQWUsRUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FDckIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUdoQixVQUFVLENB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