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
const dom_utils_1 = require("../utils/dom-utils");
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
        this.mResults.testResults.forEach((testSuite) => {
            testSuite.testResults.forEach((test) => {
                if (test.status === "failed") {
                    test.domSnapshot = (0, dom_utils_1.getDOMSnapshot)({
                        testPath: testSuite.testFilePath,
                        testFullName: test.fullName,
                    });
                }
            });
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb2Nlc3Nvci9Qcm9jZXNzb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBRXhDLG9DQUFpQztBQUNqQyxxQ0FBcUM7QUFDckMsNkJBQTZCO0FBRTdCLDRDQUF5QztBQUN6QywrQkFBK0I7QUFFL0IsaURBQThDO0FBQzlDLCtCQUF5QztBQUV6QyxxQ0FBa0M7QUFDbEMsb0ZBQWlGO0FBRWpGLGtEQUFvRDtBQU9wRCxNQUFhLFNBQVM7SUFVWCxNQUFNLENBQUMsR0FBRyxDQUNiLE9BQXlCLEVBQ3pCLGNBQWlDLEVBQ2pDLEtBQXFCO1FBRXJCLE9BQU8sSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwRSxDQUFDO0lBaUJELFlBQ1ksUUFBMEIsRUFDMUIsZUFBa0MsRUFDbEMsYUFBNkI7UUFGN0IsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7UUFDMUIsb0JBQWUsR0FBZixlQUFlLENBQW1CO1FBQ2xDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtJQUN0QyxDQUFDO0lBUUksUUFBUTtRQUNaLE1BQU0sVUFBVSxHQUFnQixFQUFFLENBQUM7UUFHbkMsSUFBSSxJQUFBLHdCQUFpQixFQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdkM7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUM1QyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNuQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFO29CQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUEsMEJBQWMsRUFBQzt3QkFDOUIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxZQUFZO3dCQUNoQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVE7cUJBQzlCLENBQUMsQ0FBQztpQkFDTjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FDckIsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsZUFBZSxFQUNwQixJQUFJLENBQUMsYUFBYSxDQUNyQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBR2hCLFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNuQyxVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0QsVUFBVSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7UUFDcEMsVUFBVSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUdoRSxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUU7WUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztZQUNyRCxVQUFVLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFDekMsSUFBSSxFQUNKLENBQUMsQ0FDSixDQUFDO1NBQ0w7UUFHRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV0RSxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFNUQsSUFBSSxNQUFNLENBQUMsMkJBQTJCLElBQUksSUFBSSxFQUFFO1lBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUNuRTtRQUVELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBT08scUJBQXFCLENBQ3pCLFNBQWlCLEVBQ2pCLE9BQXlCO1FBRXpCLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDdkMsSUFBSSxVQUFVLENBQUMsZUFBZSxFQUFFO2dCQUM1QixVQUFVLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO29CQUMxQyxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFFO3dCQUNsRCxJQUNJLE9BQU8sY0FBYyxLQUFLLFFBQVE7NEJBQ2xDLGlEQUF1QixDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsRUFDdEQ7NEJBQ0UsTUFBTSxhQUFhLEdBQ2YsaURBQXVCLENBQUMsa0JBQWtCLENBQ3RDLGNBQWMsQ0FDakIsQ0FBQzs0QkFDTixNQUFNLGFBQWEsR0FDZixpREFBdUIsQ0FBQyxrQkFBa0IsQ0FDdEMsY0FBYyxDQUNqQixDQUFDOzRCQUVOLElBQUksT0FBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQ0FDOUIsT0FBRSxDQUFDLFVBQVUsQ0FDVCxTQUFTO29DQUNMLHFCQUFTLENBQUMsdUJBQXVCLENBQ3hDLENBQUM7Z0NBRUYsTUFBTSxtQkFBbUIsR0FDckIsU0FBUztvQ0FDVCxxQkFBUyxDQUFDLHVCQUF1QjtvQ0FDakMsYUFBYSxDQUFDO2dDQUNsQixPQUFFLENBQUMsWUFBWSxDQUNYLGFBQWEsRUFDYixtQkFBbUIsQ0FDdEIsQ0FBQzs2QkFDTDt5QkFDSjtvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQzthQUNOO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBVU8sY0FBYyxDQUNsQixTQUFpQixFQUNqQixVQUF1QixFQUN2QixLQUFvQjtRQUdwQixPQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBR3pCLE9BQUUsQ0FBQyxhQUFhLENBQ1osU0FBUyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUNqRCxVQUFVLENBQUMsVUFBVSxDQUN4QixDQUFDO1FBR0YsSUFBSSxVQUFVLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFO1lBQ2hELE9BQUUsQ0FBQyxhQUFhLENBQ1osU0FBUyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLEVBQzFELFVBQVUsQ0FBQyxrQkFBa0IsQ0FDaEMsQ0FBQztTQUNMO1FBR0QsSUFDSSxVQUFVLENBQUMsWUFBWTtZQUN2QixVQUFVLENBQUMsZUFBZSxDQUFDLG9CQUFvQixFQUNqRDtZQUNFLE9BQUUsQ0FBQyxhQUFhLENBQ1osU0FBUyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsb0JBQW9CLEVBQzNELFVBQVUsQ0FBQyxZQUFZLENBQzFCLENBQUM7U0FDTDtRQUdELElBQ0ksVUFBVSxDQUFDLGVBQWUsQ0FBQyxNQUFNLElBQUksSUFBSTtZQUN6QyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUNwQztZQUNFLE9BQU87U0FDVjtRQUdELE9BQUUsQ0FBQyxhQUFhLENBQ1osU0FBUyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUNqRCxRQUFRLENBQUMsTUFBTSxDQUNYLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQVMsQ0FBQyxhQUFhLENBQUMsRUFDM0MsVUFBVSxDQUNiLENBQ0osQ0FBQztRQUdGLE1BQU0sTUFBTSxHQUFHLFNBQVMsR0FBRyxxQkFBUyxDQUFDLE9BQU8sQ0FBQztRQUM3QyxPQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RCLE9BQUUsQ0FBQyxhQUFhLENBQ1osTUFBTSxHQUFHLHFCQUFTLENBQUMsY0FBYyxFQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFTLENBQUMsY0FBYyxDQUFDLENBQy9DLENBQUM7UUFHRixNQUFNLEtBQUssR0FBRyxTQUFTLEdBQUcscUJBQVMsQ0FBQyxNQUFNLENBQUM7UUFDM0MsT0FBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixPQUFFLENBQUMsYUFBYSxDQUNaLEtBQUssR0FBRyxxQkFBUyxDQUFDLGFBQWEsRUFDL0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHFCQUFTLENBQUMsYUFBYSxDQUFDLENBQ25ELENBQUM7UUFHRiwyQkFBWSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBRXpELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsaUJBQWlCLENBQUMsU0FBUyxHQUFHLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1lBQy9ELElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztRQUdILElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUk7WUFDQSxLQUFLLElBQUksS0FBSyxDQUFDLFFBQVE7Z0JBQ25CLENBQUMsQ0FBQyxxQkFBUyxDQUFDLFNBQVM7Z0JBQ3JCLENBQUMsQ0FBQyxxQkFBUyxDQUFDLHNCQUFzQixDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNaLHFCQUFTLENBQUMsSUFBSTtZQUNWLElBQUk7WUFDSixxQkFBUyxDQUFDLFdBQVc7WUFDckIsU0FBUztZQUNULFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVTtZQUNyQyxxQkFBUyxDQUFDLE1BQU0sQ0FDdkIsQ0FBQztJQUNOLENBQUM7SUFZTyxPQUFPLENBQ1gsWUFBOEIsRUFDOUIsVUFBb0I7UUFFcEIsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7WUFDaEMsSUFBSSxTQUFTLEtBQUsscUJBQVMsQ0FBQyxJQUFJLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNiLDJDQUEyQztvQkFDdkMsc0VBQXNFLENBQzdFLENBQUM7Z0JBQ0YsU0FBUzthQUNaO1lBQ0QsSUFBSTtnQkFDQSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNaLHFCQUFTLENBQUMsSUFBSTtvQkFDViwwQ0FBMEM7b0JBQzFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxHQUFHLENBQUM7b0JBQ2xDLHFCQUFTLENBQUMsTUFBTSxDQUN2QixDQUFDO2FBQ0w7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDYix5Q0FBeUM7b0JBQ3JDLFNBQVM7b0JBQ1QsSUFBSTtvQkFDSixDQUFDLENBQ1IsQ0FBQzthQUNMO1NBQ0o7SUFDTCxDQUFDO0lBUWEsYUFBYSxDQUFDLFVBQWlDOztZQUN6RCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUM1QixVQUFVLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQzFDLENBQUM7WUFDRixNQUFNLE9BQUUsQ0FBQyxhQUFhLENBQ2xCLFVBQVUsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksRUFDdEMsT0FBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FDNUIsQ0FBQztRQUNOLENBQUM7S0FBQTtJQVFPLGFBQWEsQ0FBQyxJQUFZO1FBQzlCLE9BQU8sT0FBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBUU8sa0JBQWtCLENBQUMsSUFBWTtRQUNuQyxPQUFPLE9BQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQU9ELElBQUksTUFBTSxDQUFDLE1BQWM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQVFELElBQUksTUFBTTtRQUNOLElBQUksSUFBQSx3QkFBaUIsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sRUFBRSxDQUFDO1NBQzlCO1FBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQXZWRCw4QkF1VkMifQ==