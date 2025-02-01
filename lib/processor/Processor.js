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
    static run(results, explicitConfig, parms) {
        return new Processor(results, explicitConfig, parms).generate();
    }
    constructor(mResults, mExplicitConfig, mProcessParms) {
        this.mResults = mResults;
        this.mExplicitConfig = mExplicitConfig;
        this.mProcessParms = mProcessParms;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb2Nlc3Nvci9Qcm9jZXNzb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBRXhDLG9DQUFpQztBQUNqQyxxQ0FBcUM7QUFDckMsNkJBQTZCO0FBRTdCLDRDQUF5QztBQUN6QywrQkFBK0I7QUFFL0IsaURBQThDO0FBQzlDLCtCQUF5QztBQUV6QyxxQ0FBa0M7QUFDbEMsb0ZBQWlGO0FBU2pGLE1BQWEsU0FBUztJQVVYLE1BQU0sQ0FBQyxHQUFHLENBQ2IsT0FBeUIsRUFDekIsY0FBaUMsRUFDakMsS0FBcUI7UUFFckIsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BFLENBQUM7SUFpQkQsWUFDWSxRQUEwQixFQUMxQixlQUFrQyxFQUNsQyxhQUE2QjtRQUY3QixhQUFRLEdBQVIsUUFBUSxDQUFrQjtRQUMxQixvQkFBZSxHQUFmLGVBQWUsQ0FBbUI7UUFDbEMsa0JBQWEsR0FBYixhQUFhLENBQWdCO0lBQ3RDLENBQUM7SUFRSSxRQUFRO1FBQ1osTUFBTSxVQUFVLEdBQWdCLEVBQUUsQ0FBQztRQUduQyxJQUFJLElBQUEsd0JBQWlCLEVBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN2QztRQWFELE1BQU0sTUFBTSxHQUFHLElBQUksZUFBTSxDQUNyQixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxlQUFlLEVBQ3BCLElBQUksQ0FBQyxhQUFhLENBQ3JCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFHaEIsVUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ25DLFVBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvRCxVQUFVLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztRQUNwQyxVQUFVLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBR2hFLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRTtZQUNuRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1lBQ3JELFVBQVUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUN6QyxJQUFJLEVBQ0osQ0FBQyxDQUNKLENBQUM7U0FDTDtRQUdELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXRFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU1RCxJQUFJLE1BQU0sQ0FBQywyQkFBMkIsSUFBSSxJQUFJLEVBQUU7WUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1NBQ25FO1FBRUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFPTyxxQkFBcUIsQ0FDekIsU0FBaUIsRUFDakIsT0FBeUI7UUFFekIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUN2QyxJQUFJLFVBQVUsQ0FBQyxlQUFlLEVBQUU7Z0JBQzVCLFVBQVUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQzFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUU7d0JBQ2xELElBQ0ksT0FBTyxjQUFjLEtBQUssUUFBUTs0QkFDbEMsaURBQXVCLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxFQUN0RDs0QkFDRSxNQUFNLGFBQWEsR0FDZixpREFBdUIsQ0FBQyxrQkFBa0IsQ0FDdEMsY0FBYyxDQUNqQixDQUFDOzRCQUNOLE1BQU0sYUFBYSxHQUNmLGlEQUF1QixDQUFDLGtCQUFrQixDQUN0QyxjQUFjLENBQ2pCLENBQUM7NEJBRU4sSUFBSSxPQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dDQUM5QixPQUFFLENBQUMsVUFBVSxDQUNULFNBQVM7b0NBQ0wscUJBQVMsQ0FBQyx1QkFBdUIsQ0FDeEMsQ0FBQztnQ0FFRixNQUFNLG1CQUFtQixHQUNyQixTQUFTO29DQUNULHFCQUFTLENBQUMsdUJBQXVCO29DQUNqQyxhQUFhLENBQUM7Z0NBQ2xCLE9BQUUsQ0FBQyxZQUFZLENBQ1gsYUFBYSxFQUNiLG1CQUFtQixDQUN0QixDQUFDOzZCQUNMO3lCQUNKO29CQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFVTyxjQUFjLENBQ2xCLFNBQWlCLEVBQ2pCLFVBQXVCLEVBQ3ZCLEtBQW9CO1FBR3BCLE9BQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFHekIsT0FBRSxDQUFDLGFBQWEsQ0FDWixTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQ2pELFVBQVUsQ0FBQyxVQUFVLENBQ3hCLENBQUM7UUFHRixJQUFJLFVBQVUsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLEVBQUU7WUFDaEQsT0FBRSxDQUFDLGFBQWEsQ0FDWixTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFDMUQsVUFBVSxDQUFDLGtCQUFrQixDQUNoQyxDQUFDO1NBQ0w7UUFHRCxJQUNJLFVBQVUsQ0FBQyxZQUFZO1lBQ3ZCLFVBQVUsQ0FBQyxlQUFlLENBQUMsb0JBQW9CLEVBQ2pEO1lBQ0UsT0FBRSxDQUFDLGFBQWEsQ0FDWixTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFDM0QsVUFBVSxDQUFDLFlBQVksQ0FDMUIsQ0FBQztTQUNMO1FBR0QsSUFDSSxVQUFVLENBQUMsZUFBZSxDQUFDLE1BQU0sSUFBSSxJQUFJO1lBQ3pDLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQ3BDO1lBQ0UsT0FBTztTQUNWO1FBR0QsT0FBRSxDQUFDLGFBQWEsQ0FDWixTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQ2pELFFBQVEsQ0FBQyxNQUFNLENBQ1gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxFQUMzQyxVQUFVLENBQ2IsQ0FDSixDQUFDO1FBR0YsTUFBTSxNQUFNLEdBQUcsU0FBUyxHQUFHLHFCQUFTLENBQUMsT0FBTyxDQUFDO1FBQzdDLE9BQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsT0FBRSxDQUFDLGFBQWEsQ0FDWixNQUFNLEdBQUcscUJBQVMsQ0FBQyxjQUFjLEVBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQVMsQ0FBQyxjQUFjLENBQUMsQ0FDL0MsQ0FBQztRQUdGLE1BQU0sS0FBSyxHQUFHLFNBQVMsR0FBRyxxQkFBUyxDQUFDLE1BQU0sQ0FBQztRQUMzQyxPQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQUUsQ0FBQyxhQUFhLENBQ1osS0FBSyxHQUFHLHFCQUFTLENBQUMsYUFBYSxFQUMvQixJQUFJLENBQUMsa0JBQWtCLENBQUMscUJBQVMsQ0FBQyxhQUFhLENBQUMsQ0FDbkQsQ0FBQztRQUdGLDJCQUFZLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFFekQsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM3RCxpQkFBaUIsQ0FBQyxTQUFTLEdBQUcsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7WUFDL0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO1FBR0gsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSTtZQUNBLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUTtnQkFDbkIsQ0FBQyxDQUFDLHFCQUFTLENBQUMsU0FBUztnQkFDckIsQ0FBQyxDQUFDLHFCQUFTLENBQUMsc0JBQXNCLENBQUM7UUFDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ1oscUJBQVMsQ0FBQyxJQUFJO1lBQ1YsSUFBSTtZQUNKLHFCQUFTLENBQUMsV0FBVztZQUNyQixTQUFTO1lBQ1QsVUFBVSxDQUFDLGVBQWUsQ0FBQyxVQUFVO1lBQ3JDLHFCQUFTLENBQUMsTUFBTSxDQUN2QixDQUFDO0lBQ04sQ0FBQztJQVlPLE9BQU8sQ0FDWCxZQUE4QixFQUM5QixVQUFvQjtRQUVwQixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtZQUNoQyxJQUFJLFNBQVMsS0FBSyxxQkFBUyxDQUFDLElBQUksRUFBRTtnQkFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQ2IsMkNBQTJDO29CQUN2QyxzRUFBc0UsQ0FDN0UsQ0FBQztnQkFDRixTQUFTO2FBQ1o7WUFDRCxJQUFJO2dCQUNBLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ1oscUJBQVMsQ0FBQyxJQUFJO29CQUNWLDBDQUEwQztvQkFDMUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLEdBQUcsQ0FBQztvQkFDbEMscUJBQVMsQ0FBQyxNQUFNLENBQ3ZCLENBQUM7YUFDTDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNiLHlDQUF5QztvQkFDckMsU0FBUztvQkFDVCxJQUFJO29CQUNKLENBQUMsQ0FDUixDQUFDO2FBQ0w7U0FDSjtJQUNMLENBQUM7SUFRYSxhQUFhLENBQUMsVUFBaUM7O1lBQ3pELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQzVCLFVBQVUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FDMUMsQ0FBQztZQUNGLE1BQU0sT0FBRSxDQUFDLGFBQWEsQ0FDbEIsVUFBVSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUN0QyxPQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUM1QixDQUFDO1FBQ04sQ0FBQztLQUFBO0lBUU8sYUFBYSxDQUFDLElBQVk7UUFDOUIsT0FBTyxPQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFRTyxrQkFBa0IsQ0FBQyxJQUFZO1FBQ25DLE9BQU8sT0FBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBT0QsSUFBSSxNQUFNLENBQUMsTUFBYztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBUUQsSUFBSSxNQUFNO1FBQ04sSUFBSSxJQUFBLHdCQUFpQixFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZUFBTSxFQUFFLENBQUM7U0FDOUI7UUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBdlZELDhCQXVWQyJ9