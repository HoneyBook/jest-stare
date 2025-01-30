"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Render = void 0;
const $ = require("jquery");
const Switch_1 = require("./navigation/Switch");
const Constants_1 = require("./Constants");
const Status_1 = require("./charts/Status");
const Doughnut_1 = require("./charts/Doughnut");
const TestSuite_1 = require("./suites/TestSuite");
const TestSummary_1 = require("./summary/TestSummary");
const util_1 = require("util");
class Render {
    static init() {
        document.addEventListener("DOMContentLoaded", () => {
            const config = JSON.parse($("#test-config").text());
            const results = JSON.parse($("#test-results").text());
            try {
                const globalConfig = JSON.parse($("#test-global-config").text());
                const regex = new RegExp(Render.escapeRegExp(globalConfig.rootDir), "g");
                results.testResults.forEach((testResult) => {
                    testResult.testFilePath = testResult.testFilePath.replace(regex, "");
                });
            }
            catch (e) {
            }
            Render.show(results, config);
        });
    }
    static escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
    static show(results, config) {
        const labels = [Constants_1.Constants.PASSED_LABEL, Constants_1.Constants.FAILED_LABEL];
        const backgroundColor = [Constants_1.Constants.PASS, Constants_1.Constants.FAIL];
        Render.setReportTitle(config);
        Render.setReportHeadline(config);
        Render.setCoverageLink(config);
        if (!config.disableCharts) {
            const suitesData = Render.buildChartsData(results.numPassedTestSuites, results.numFailedTestSuites, results.numPendingTestSuites);
            Doughnut_1.Doughnut.createChart($("#test-suites-canvas"), suitesData);
            const testsChart = Render.buildChartsData(results.numPassedTests, results.numFailedTests, results.numPendingTests, results.numTodoTests);
            Doughnut_1.Doughnut.createChart($("#tests-canvas"), testsChart);
            let snapshotChart = Render.buildChartsData(results.snapshot.matched, results.snapshot.unmatched);
            snapshotChart = Render.addSnapshotChartData(results, snapshotChart);
            Doughnut_1.Doughnut.createChart($("#snapshots-canvas"), snapshotChart);
        }
        this.updateStatusArea(results);
        const tableHtml = TestSuite_1.TestSuite.create(results);
        $("#loading-info").hide();
        $("#test-results").replaceWith($(tableHtml));
        if (config.reportSummary) {
            const testSummary = TestSummary_1.TestSummary.create(results);
            $("#test-summary").replaceWith($(testSummary));
        }
        if (config.hidePassing) {
            $("#lab-passoff-switch").prop("checked", false);
            $(`.${Constants_1.Constants.PASSED_TEST}`).hide();
        }
        if (config.hideFailing) {
            $("#lab-failoff-switch").prop("checked", false);
            $(`.${Constants_1.Constants.FAILED_TEST}`).hide();
        }
        if (config.hidePending) {
            $("#lab-pendingoff-switch").prop("checked", false);
            $(`.${Constants_1.Constants.PENDING_TEST}`).hide();
        }
        if (config.hideTodo) {
            $("#lab-todooff-switch").prop("checked", false);
            $(`.${Constants_1.Constants.TODO_TEST}`).hide();
        }
        if (config.hideFailing && config.hidePassing) {
            $(`.${Constants_1.Constants.FAILED_TEST}\\.${Constants_1.Constants.PASSED_TEST}`).hide();
        }
        if (config.hidePending && config.hidePassing) {
            $(`.${Constants_1.Constants.PASSED_TEST}\\.${Constants_1.Constants.PENDING_TEST}`).hide();
        }
        if (config.hideFailing && config.hidePending) {
            $(`.${Constants_1.Constants.FAILED_TEST}\\.${Constants_1.Constants.PENDING_TEST}`).hide();
        }
        if (config.hideFailing && config.hidePassing && config.hidePending) {
            $(`.${Constants_1.Constants.FAILED_TEST}\\.${Constants_1.Constants.PASSED_TEST}\\.${Constants_1.Constants.PENDING_TEST}`).hide();
        }
        const allCheckArray = new Array();
        allCheckArray.push($("#lab-passoff-switch"));
        allCheckArray.push($("#lab-failoff-switch"));
        allCheckArray.push($("#lab-pendingoff-switch"));
        allCheckArray.push($("#lab-todooff-switch"));
        const allStylesArray = [
            Constants_1.Constants.PASSED_TEST,
            Constants_1.Constants.FAILED_TEST,
            Constants_1.Constants.PENDING_TEST,
            Constants_1.Constants.TODO_TEST,
        ];
        const allSwitchArray = [
            "#lab-passoff-switch",
            "#lab-failoff-switch",
            "#lab-pendingoff-switch",
            "#lab-todooff-switch",
        ];
        allStylesArray.forEach((style, index) => {
            const checksMinusCurrentOne = allCheckArray.slice();
            checksMinusCurrentOne.splice(index, 1);
            const stylesMinusCurrentOne = allStylesArray.slice();
            stylesMinusCurrentOne.splice(index, 1);
            const switchElement = new Switch_1.Switch($(allSwitchArray[index]), $("." + style), style, checksMinusCurrentOne, stylesMinusCurrentOne);
        });
    }
    static updateStatusArea(results) {
        Status_1.Status.setResultsClass($("#test-suites-results"), results.numPassedTestSuites, results.numTotalTestSuites -
            results.numPassedTestSuites -
            results.numPendingTestSuites);
        Status_1.Status.setResultsClass($("#tests-results"), results.numPassedTests, results.numTotalTests -
            results.numPassedTests -
            results.numPendingTests);
        Status_1.Status.setResultsClass($("#snapshots-results"), results.snapshot.matched, results.snapshot.unmatched);
        if (results.snapshot.added === 0 &&
            results.snapshot.matched === 0 &&
            results.snapshot.unchecked === 0 &&
            results.snapshot.unmatched === 0 &&
            results.snapshot.updated === 0) {
            $("#snapshots-group").hide();
        }
    }
    static setReportTitle(config) {
        const tabTitle = !(0, util_1.isNullOrUndefined)(config.reportTitle)
            ? config.reportTitle
            : "jest-stare!";
        document.title = tabTitle;
    }
    static setReportHeadline(config) {
        const brandTitle = !(0, util_1.isNullOrUndefined)(config.reportHeadline)
            ? config.reportHeadline
            : "jest-stare";
        const a = $("#navbar-title");
        a.text(brandTitle);
    }
    static setCoverageLink(config) {
        if (!(0, util_1.isNullOrUndefined)(config.coverageLink)) {
            const a = $("#coverage-link");
            a.addClass("active");
            a.removeClass("disabled");
            a.attr("href", config.coverageLink);
        }
    }
    static buildChartsData(passedTests, failedTests, pendingTests, todoTests) {
        const chartData = {
            labels: [],
            backgroundColor: [],
            data: [],
        };
        if (passedTests > 0) {
            chartData.labels.push(Constants_1.Constants.PASSED_LABEL);
            chartData.backgroundColor.push(Constants_1.Constants.PASS);
            chartData.data.push(passedTests);
        }
        if (failedTests > 0) {
            chartData.labels.push(Constants_1.Constants.FAILED_LABEL);
            chartData.backgroundColor.push(Constants_1.Constants.FAIL);
            chartData.data.push(failedTests);
        }
        if (pendingTests > 0) {
            chartData.labels.push(Constants_1.Constants.PENDING_LABEL);
            chartData.backgroundColor.push(Constants_1.Constants.PENDING);
            chartData.data.push(pendingTests);
        }
        if (todoTests > 0) {
            chartData.labels.push(Constants_1.Constants.TODO_LABEL);
            chartData.backgroundColor.push(Constants_1.Constants.TODO);
            chartData.data.push(todoTests);
        }
        return chartData;
    }
    static addSnapshotChartData(results, snapshotChart) {
        if (results.snapshot.filesAdded > 0) {
            snapshotChart.labels.push(Constants_1.Constants.ADDED_LABEL);
            snapshotChart.backgroundColor.push(Constants_1.Constants.ADDED);
            snapshotChart.data.push(results.snapshot.filesAdded);
        }
        if (results.snapshot.unchecked > 0) {
            if (results.snapshot.didUpdate) {
                snapshotChart.labels.push(Constants_1.Constants.UPDATED_SNAPSHOT_TEST_LABEL);
                snapshotChart.backgroundColor.push(Constants_1.Constants.UPDATED_SNAPSHOT_TEST);
                snapshotChart.data.push(results.snapshot.unchecked);
            }
            else {
                snapshotChart.labels.push(Constants_1.Constants.OBSOLETE_SNAPSHOT_TEST_LABEL);
                snapshotChart.backgroundColor.push(Constants_1.Constants.OBSOLETE_SNAPSHOT_TEST);
                snapshotChart.data.push(results.snapshot.unchecked);
            }
        }
        if (results.snapshot.updated > 0) {
            snapshotChart.labels.push(Constants_1.Constants.CHANGED_LABEL);
            snapshotChart.backgroundColor.push(Constants_1.Constants.CHANGED);
            snapshotChart.data.push(results.snapshot.updated);
        }
        if (results.snapshot.filesRemoved > 0) {
            if (results.snapshot.didUpdate) {
                snapshotChart.labels.push(Constants_1.Constants.REMOVED_OBSOLETE_SNAPSHOT_FILE_LABEL);
                snapshotChart.backgroundColor.push(Constants_1.Constants.REMOVED_OBSOLETE_SNAPSHOT_FILE);
                snapshotChart.data.push(results.snapshot.filesRemoved);
            }
            else {
                snapshotChart.labels.push(Constants_1.Constants.OBSOLETE_SNAPSHOT_FILE_LABEL);
                snapshotChart.backgroundColor.push(Constants_1.Constants.OBSOLETE_SNAPSHOT_FILE);
                snapshotChart.data.push(results.snapshot.filesRemoved);
            }
        }
        return snapshotChart;
    }
}
exports.Render = Render;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JlbmRlci9SZW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNEJBQTRCO0FBQzVCLGdEQUE2QztBQUM3QywyQ0FBd0M7QUFDeEMsNENBQXlDO0FBQ3pDLGdEQUE2QztBQUM3QyxrREFBK0M7QUFDL0MsdURBQW9EO0FBR3BELCtCQUF5QztBQVN6QyxNQUFhLE1BQU07SUFPUixNQUFNLENBQUMsSUFBSTtRQUNkLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7WUFDL0MsTUFBTSxNQUFNLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQ3ZDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FDM0IsQ0FBQztZQUNGLE1BQU0sT0FBTyxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUN4QyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQzVCLENBQUM7WUFFRixJQUFJO2dCQUNBLE1BQU0sWUFBWSxHQUEwQixJQUFJLENBQUMsS0FBSyxDQUNsRCxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FDbEMsQ0FBQztnQkFDRixNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FDcEIsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQ3pDLEdBQUcsQ0FDTixDQUFDO2dCQUNGLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQ3ZDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQ3JELEtBQUssRUFDTCxFQUFFLENBQ0wsQ0FBQztnQkFDTixDQUFDLENBQUMsQ0FBQzthQUNOO1lBQUMsT0FBTyxDQUFDLEVBQUU7YUFFWDtZQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxF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QUkscUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3pDO1FBR0QsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLElBQUkscUJBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzFDO1FBR0QsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLElBQUkscUJBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3ZDO1FBRUQsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDMUMsQ0FBQyxDQUFDLElBQUkscUJBQVMsQ0FBQyxXQUFXLE1BQU0scUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3BFO1FBRUQsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDMUMsQ0FBQyxDQUFDLElBQUkscUJBQVMsQ0FBQyxXQUFXLE1BQU0scUJBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3JFO1FBRUQsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDMUMsQ0FBQyxDQUFDLElBQUkscUJBQVMsQ0FBQyxXQUFXLE1BQU0scUJBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3JFO1FBRUQsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRTtZ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