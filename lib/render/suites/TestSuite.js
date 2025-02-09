"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSuite = void 0;
const Constants_1 = require("../Constants");
const Test_1 = require("../tests/Test");
class TestSuite {
    static create(results) {
        const elements = [];
        results.testResults.forEach((testResult) => {
            if (testResult.testResults == null) {
                console.error("Unexpected testResults field missing");
                if (testResult.assertionResults != null) {
                    console.warn("Attempting to use assertionResults: results are unpredictable");
                    testResult.testResults = testResult.assertionResults;
                }
            }
            let testStatusClass;
            const testSectionStatus = new Map();
            for (const result of testResult.testResults) {
                testStatusClass = TestSuite.asignStatus(testStatusClass, result, testSectionStatus);
            }
            if (testStatusClass === undefined) {
                testStatusClass = Constants_1.Constants.PASSED_TEST;
            }
            const accordionCard = TestSuite.buildAccordionCard(testResult, testStatusClass);
            const divMap = new Map();
            testResult.testResults.forEach((test) => {
                const element = Test_1.Test.create(test);
                if (test.ancestorTitles.length > 0) {
                    test.ancestorTitles.forEach((title, index) => {
                        const titlesCopy = test.ancestorTitles.slice();
                        titlesCopy.splice(index + 1);
                        const key = titlesCopy.join(TestSuite.JOIN_CHAR);
                        if (divMap.has(key)) {
                            divMap.get(key).appendChild(element);
                        }
                        else {
                            const nestDiv = document.createElement("div");
                            const statusClass = testSectionStatus.get(key) ||
                                Constants_1.Constants.PASSED_TEST;
                            nestDiv.classList.add("my-3", "p-3", "bg-white", "rounded", "box-shadow", statusClass);
                            const h6 = document.createElement("h6");
                            h6.classList.add("border-bottom", "pb-2", "mb-0", "display-6");
                            h6.textContent = title;
                            nestDiv.appendChild(h6);
                            nestDiv.appendChild(element);
                            nestDiv.id = key;
                            divMap.set(key, nestDiv);
                            if (index === 0) {
                                accordionCard
                                    .querySelector(".card-body")
                                    .appendChild(nestDiv);
                            }
                            else {
                                titlesCopy.pop();
                                const parentKey = titlesCopy.join(TestSuite.JOIN_CHAR);
                                divMap.get(parentKey).appendChild(nestDiv);
                            }
                        }
                    });
                }
                else {
                    accordionCard
                        .querySelector(".card-body")
                        .appendChild(element);
                }
            });
            elements.push(accordionCard);
        });
        return elements;
    }
    static asignStatus(testStatusClass, result, testSectionStatus) {
        const currentStatus = TestSuite.getStatusClassFromJestStatus(result.status);
        if (!testStatusClass) {
            testStatusClass = currentStatus;
        }
        else if (testStatusClass !== currentStatus) {
            testStatusClass = TestSuite.mixStatus(currentStatus, testStatusClass);
        }
        else {
            testStatusClass = currentStatus;
        }
        for (let index = 0; index < result.ancestorTitles.length; index++) {
            const titlesCopy = result.ancestorTitles.slice();
            titlesCopy.splice(index + 1);
            const key = titlesCopy.join(TestSuite.JOIN_CHAR);
            if (testSectionStatus.has(key)) {
                if (testStatusClass !== currentStatus) {
                    testSectionStatus.set(key, TestSuite.mixStatus(currentStatus, testStatusClass));
                }
                else {
                    testSectionStatus.set(key, currentStatus);
                }
            }
            else {
                testSectionStatus.set(key, currentStatus);
            }
        }
        return testStatusClass;
    }
    static getStatusClassFromJestStatus(jestStatus) {
        if (jestStatus === Constants_1.Constants.TEST_STATUS_PEND) {
            return Constants_1.Constants.PENDING_TEST;
        }
        else if (jestStatus === Constants_1.Constants.TEST_STATUS_FAIL) {
            return Constants_1.Constants.FAILED_TEST;
        }
        else {
            return Constants_1.Constants.PASSED_TEST;
        }
    }
    static mixStatus(currentStatus, oldStatus) {
        const statusArray = oldStatus.split(TestSuite.JOIN_CHAR);
        statusArray.push(currentStatus);
        const sortedUniqueStatusArray = [...new Set(statusArray)].sort();
        return sortedUniqueStatusArray.join(TestSuite.JOIN_CHAR);
    }
    static buildAccordionCard(testResult, testStatusClass) {
        const accordionCard = document.createElement("div");
        accordionCard.classList.add("my-3", "p-3", "bg-white", "rounded", "box-shadow", "card", testStatusClass);
        const cardHeader = TestSuite.buildAccordionCardHeader(testResult.testFilePath, testResult.numPassingTests, testResult.numFailingTests, testResult.numPendingTests, testResult.numTodoTests);
        accordionCard.appendChild(cardHeader);
        const cardBody = TestSuite.buildAccordionCardBody(testResult.testFilePath);
        accordionCard.appendChild(cardBody);
        return accordionCard;
    }
    static buildAccordionCardHeader(testFilePath, passCount, failCount, pendingCount, todoCount) {
        const fileName = TestSuite.sanitizeFilePath(testFilePath);
        const cardHeader = document.createElement("div");
        cardHeader.classList.add("card-header");
        cardHeader.classList.add("text-center");
        cardHeader.id = `${fileName}_header`;
        const h5 = document.createElement("h5");
        h5.classList.add("border-bottom", "pb-2", "mb-0", "display-5");
        const btn = document.createElement("button");
        btn.style.userSelect = "text";
        btn.classList.add("btn", "btn-block");
        btn.setAttribute("data-bs-toggle", "collapse");
        btn.setAttribute("data-bs-target", `#${fileName}_detail`);
        btn.textContent = testFilePath;
        const resultCounts = document.createElement("div");
        resultCounts.style.userSelect = "none";
        const passBadge = document.createElement("span");
        passBadge.classList.add("badge", "bg-success", "border");
        passBadge.textContent = passCount.toString();
        resultCounts.appendChild(passBadge);
        const failBadge = document.createElement("span");
        failBadge.classList.add("badge", "bg-danger", "border");
        failBadge.textContent = failCount.toString();
        resultCounts.appendChild(failBadge);
        const skipBadge = document.createElement("span");
        skipBadge.classList.add("badge", "bg-warning", "border");
        skipBadge.textContent = pendingCount.toString();
        resultCounts.appendChild(skipBadge);
        const todoBadge = document.createElement("span");
        todoBadge.classList.add("badge", "bg-info", "border");
        todoBadge.textContent = todoCount.toString();
        resultCounts.appendChild(todoBadge);
        btn.appendChild(resultCounts);
        h5.appendChild(btn);
        cardHeader.appendChild(h5);
        return cardHeader;
    }
    static buildAccordionCardBody(testFilePath) {
        const fileName = TestSuite.sanitizeFilePath(testFilePath);
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("collapse");
        cardContainer.setAttribute("data-parent", "#accordion");
        cardContainer.id = `${fileName}_detail`;
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardContainer.appendChild(cardBody);
        return cardContainer;
    }
    static sanitizeFilePath(testFilePath) {
        return testFilePath.replace(/(\/)|\\|(:)|(\s)|\.|(@)/g, "_");
    }
}
exports.TestSuite = TestSuite;
TestSuite.JOIN_CHAR = ".";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdFN1aXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3JlbmRlci9zdWl0ZXMvVGVzdFN1aXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDRDQUF5QztBQUN6Qyx3Q0FBcUM7QUFZckMsTUFBYSxTQUFTO0lBY1gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUF5QjtRQUMxQyxNQUFNLFFBQVEsR0FBa0IsRUFBRSxDQUFDO1FBRW5DLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFPdkMsSUFBSSxVQUFVLENBQUMsV0FBVyxJQUFJLElBQUksRUFBRTtnQkFFaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO2dCQUN0RCxJQUFLLFVBQWtCLENBQUMsZ0JBQWdCLElBQUksSUFBSSxFQUFFO29CQUU5QyxPQUFPLENBQUMsSUFBSSxDQUNSLCtEQUErRCxDQUNsRSxDQUFDO29CQUNGLFVBQVUsQ0FBQyxXQUFXLEdBQ2xCLFVBQ0gsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDdEI7YUFDSjtZQUVELElBQUksZUFBZSxDQUFDO1lBRXBCLE1BQU0saUJBQWlCLEdBQXdCLElBQUksR0FBRyxFQUduRCxDQUFDO1lBQ0osS0FBSyxNQUFNLE1BQU0sSUFBSSxVQUFVLENBQUMsV0FBVyxFQUFFO2dCQUN6QyxlQUFlLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FDbkMsZUFBZSxFQUNmLE1BQU0sRUFDTixpQkFBaUIsQ0FDcEIsQ0FBQzthQUNMO1lBRUQsSUFBSSxlQUFlLEtBQUssU0FBUyxFQUFFO2dCQUMvQixlQUFlLEdBQUcscUJBQVMsQ0FBQyxXQUFXLENBQUM7YUFDM0M7WUFHRCxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQzlDLFVBQVUsRUFDVixlQUFlLENBQ2xCLENBQUM7WUFPRixNQUFNLE1BQU0sR0FBNkIsSUFBSSxHQUFHLEVBRzdDLENB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