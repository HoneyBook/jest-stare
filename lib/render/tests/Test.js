"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
const Constants_1 = require("../Constants");
const AnsiParser = require("ansi-parser");
const TestDifference_1 = require("../diff/TestDifference");
const ImageSnapshotDifference_1 = require("../diff/ImageSnapshotDifference");
class Test {
    static create(innerTestResult) {
        let color = Constants_1.Constants.PASS_RAW;
        let testStatusClass = Constants_1.Constants.PASSED_TEST;
        let failed = false;
        switch (innerTestResult.status) {
            case Constants_1.Constants.TEST_STATUS_FAIL:
                color = Constants_1.Constants.FAIL_RAW;
                testStatusClass = Constants_1.Constants.FAILED_TEST;
                failed = true;
                break;
            case Constants_1.Constants.TEST_STATUS_PEND:
                color = Constants_1.Constants.PENDING_RAW;
                testStatusClass = Constants_1.Constants.PENDING_TEST;
                break;
            case Constants_1.Constants.TEST_STATUS_TODO:
                color = Constants_1.Constants.TODO_RAW;
                testStatusClass = Constants_1.Constants.TODO_TEST;
                break;
            case Constants_1.Constants.TEST_STATUS_PASS:
                break;
            default:
                break;
        }
        const firstDiv = document.createElement("div");
        firstDiv.classList.add("media", "text-muted", "pt-3", testStatusClass);
        const img = document.createElement("img");
        img.classList.add("mr-2", "rounded");
        img.alt = "";
        img.setAttribute("data-src", "holder.js/32x32?theme=thumb&bg=" +
            color +
            "&fg=" +
            color +
            "&size=1");
        firstDiv.appendChild(img);
        const secondDiv = document.createElement("div");
        secondDiv.classList.add("media-body", "pb-3", "mb-0", "small", "lh-125", "border-bottom", "overflow-auto");
        firstDiv.appendChild(secondDiv);
        const thirdDiv = document.createElement("div");
        thirdDiv.classList.add("d-flex", "justify-content-between", "align-items-center", "w-100");
        secondDiv.appendChild(thirdDiv);
        const strong = document.createElement("strong");
        strong.classList.add("text-gray-dark");
        strong.textContent = innerTestResult.title;
        const titleId = innerTestResult.title
            .replace(/\s+/g, "-")
            .toLowerCase();
        const diffId = titleId + "-diff";
        thirdDiv.appendChild(strong);
        const small = document.createElement("small");
        small.classList.add("d-block", "text-right", "mt-3");
        const conversionValu = 1000;
        small.textContent =
            innerTestResult.duration / conversionValu + "s";
        thirdDiv.appendChild(small);
        const span = document.createElement("span");
        span.classList.add("d-block", "mb-2");
        span.textContent = innerTestResult.status;
        secondDiv.appendChild(span);
        if (failed) {
            const failMessage = AnsiParser.removeAnsi(innerTestResult.failureMessages[0]);
            const failMessageSplit = failMessage.split("\n");
            let show = true;
            if (failMessage.search(TestDifference_1.TestDifference.DIFF_INDICATOR) >= 0) {
                const diffHtml = TestDifference_1.TestDifference.generate(failMessage);
                secondDiv.appendChild(diffHtml);
                show = false;
            }
            if (ImageSnapshotDifference_1.ImageSnapshotDifference.containsDiff(failMessage)) {
                const diffHtml = ImageSnapshotDifference_1.ImageSnapshotDifference.generate(failMessage);
                secondDiv.appendChild(diffHtml);
                show = false;
            }
            const collapseDiv = document.createElement("div");
            collapseDiv.classList.add("d-flex", "justify-content-between", "align-items-center", "w-100");
            const worthlessDiv = document.createElement("div");
            secondDiv.appendChild(collapseDiv);
            collapseDiv.appendChild(worthlessDiv);
            const button = document.createElement("button");
            button.classList.add("btn", "btn-light", "btn-sm");
            button.type = "button";
            button.setAttribute("data-bs-toggle", "collapse");
            button.setAttribute("data-bs-target", "#" + diffId);
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-controls", diffId);
            button.textContent = "raw";
            collapseDiv.appendChild(button);
            const pre = document.createElement("pre");
            secondDiv.appendChild(pre);
            pre.classList.add("collapse");
            if (show) {
                pre.classList.add("show");
            }
            pre.id = diffId;
            const code = document.createElement("code");
            pre.appendChild(code);
            if (innerTestResult.domSnapshot) {
                const iframe = createIframeForDOMSnapshot(innerTestResult.domSnapshot);
                const iframeVisibilityCheckbox = createIframeVisibilityCheckbox(iframe);
                secondDiv.appendChild(iframeVisibilityCheckbox);
                secondDiv.appendChild(iframe);
            }
            failMessageSplit.forEach((entry, index) => {
                const codeSpan = document.createElement("span");
                if (entry[0] === "+") {
                    codeSpan.setAttribute("style", "color:" + Constants_1.Constants.PASS);
                    codeSpan.textContent = entry;
                }
                else if (entry[0] === "-") {
                    codeSpan.setAttribute("style", "color:" + Constants_1.Constants.FAIL);
                    codeSpan.textContent = entry;
                }
                else {
                    codeSpan.textContent = entry;
                }
                const spanDiv = document.createElement("div");
                spanDiv.appendChild(codeSpan);
                code.appendChild(spanDiv);
            });
        }
        firstDiv.id = titleId;
        return firstDiv;
    }
}
exports.Test = Test;
function createIframeForDOMSnapshot(content) {
    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
        width: "100%",
        height: "1100px",
        border: "1px solid black",
    });
    iframe.onload = () => {
        var _a;
        const doc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
        if (doc) {
            doc.open();
            doc.write(content);
            doc.close();
        }
    };
    return iframe;
}
function createIframeVisibilityCheckbox(iframe) {
    const checkboxId = `iframe-visibility"_${Math.random()
        .toString(36)
        .substring(7)}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = checkboxId;
    checkbox.checked = true;
    checkbox.addEventListener("change", (event) => {
        const checked = event.target.checked;
        iframe.style.display = checked ? "" : "none";
    });
    Object.assign(checkbox.style, {
        cursor: "pointer",
    });
    const label = document.createElement("label");
    label.htmlFor = checkboxId;
    label.textContent = "Show DOM Snapshot";
    Object.assign(label.style, {
        cursor: "pointer",
    });
    const container = document.createElement("div");
    container.appendChild(checkbox);
    container.appendChild(label);
    Object.assign(container.style, {
        display: "flex",
        gap: "4px",
        marginBottom: "6px",
    });
    return container;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZW5kZXIvdGVzdHMvVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0Q0FBeUM7QUFDekMsMENBQTBDO0FBQzFDLDJEQUF3RDtBQUN4RCw2RUFBMEU7QUFRMUUsTUFBYSxJQUFJO0lBU04sTUFBTSxDQUFDLE1BQU0sQ0FDaEIsZUFBMkM7UUFFM0MsSUFBSSxLQUFLLEdBQUcscUJBQVMsQ0FBQyxRQUFRLENBQUM7UUFDL0IsSUFBSSxlQUFlLEdBQUcscUJBQVMsQ0FBQyxXQUFXLENBQUM7UUFDNUMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRW5CLFFBQVEsZUFBZSxDQUFDLE1BQU0sRUFBRTtZQUM1QixLQUFLLHFCQUFTLENBQUMsZ0JBQWdCO2dCQUMzQixLQUFLLEdBQUcscUJBQVMsQ0FBQyxRQUFRLENBQUM7Z0JBQzNCLGVBQWUsR0FBRyxxQkFBUyxDQUFDLFdBQVcsQ0FBQztnQkFDeEMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDZCxNQUFNO1lBQ1YsS0FBSyxxQkFBUyxDQUFDLGdCQUFnQjtnQkFDM0IsS0FBSyxHQUFHLHFCQUFTLENBQUMsV0FBVyxDQUFDO2dCQUM5QixlQUFlLEdBQUcscUJBQVMsQ0FBQyxZQUFZLENBQUM7Z0JBQ3pDLE1BQU07WUFDVixLQUFLLHFCQUFTLENBQUMsZ0JBQWdCO2dCQUMzQixLQUFLLEdBQUcscUJBQVMsQ0FBQyxRQUFRLENBQUM7Z0JBQzNCLGVBQWUsR0FBRyxxQkFBUyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsTUFBTTtZQUNWLEtBQUsscUJBQVMsQ0FBQyxnQkFBZ0I7Z0JBQzNCLE1BQU07WUFDVjtnQkFDSSxNQUFNO1NBQ2I7UUFFRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBbUIsQ0FBQztRQUNqRSxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztRQUV2RSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBcUIsQ0FBQztRQUM5RCxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDckMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFFYixHQUFHLENBQUMsWUFBWSxDQUNaLFVBQVUsRUFDVixpQ0FBaUM7WUFDN0IsS0FBSztZQUNMLE1BQU07WUFDTixLQUFLO1lBQ0wsU0FBUyxDQUNoQixDQUFDO1FBRUYsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUxQixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBbUIsQ0FBQztRQUNsRSxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FDbkIsWUFBWSxFQUNaLE1BQU0sRUFDTixNQUFNLEVBQ04sT0FBTyxFQUNQLFFBQVEsRUFDUixlQUFlLEVBQ2YsZUFBZSxDQUNsQixDQUFDO1FBRUYsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVoQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBbUIsQ0FBQztRQUNqRSxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FDbEIsUUFBUSxFQUNSLHlCQUF5QixFQUN6QixvQkFBb0IsRUFDcEIsT0FBTyxDQUNWLENBQUM7UUFFRixTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWhDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFnQixDQUFDO1FBQy9ELE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdkMsTUFBTSxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDO1FBRzNDLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxLQUFLO2FBQ2hDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO2FBQ3BCLFdBQVcsRUFBRSxDQUFDO1FBQ25CLE1BQU0sTUFBTSxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDakMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU3QixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBZ0IsQ0FBQztRQUM3RCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3JELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztRQUM1QixLQUFLLENBQUMsV0FBVztZQUNaLGVBQWUsQ0FBQyxRQUFnQixHQUFHLGNBQWMsR0FBRyxHQUFHLENBQUM7UUFFN0QsUUFBUSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU1QixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBb0IsQ0FBQztRQUMvRCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDO1FBRTFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUIsSUFBSSxNQUFNLEVBQUU7WUFDUixNQUFNLFdBQVcsR0FBVyxVQUFVLENBQUMsVUFBVSxDQUM3QyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUNyQyxDQUFDO1lBQ0YsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWpELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztZQUdoQixJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsK0JBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3hELE1BQU0sUUFBUSxHQUFHLCtCQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN0RCxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLEdBQUcsS0FBSyxDQUFDO2FBQ2hCO1lBRUQsSUFBSSxpREFBdUIsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ25ELE1BQU0sUUFBUSxHQUFHLGlEQUF1QixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDL0QsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxHQUFHLEtBQUssQ0FBQzthQUNoQjtZQUVELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFtQixDQUFDO1lBQ3BFLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUNyQixRQUFRLEVBQ1IseUJBQXlCLEVBQ3pCLG9CQUFvQixFQUNwQixPQUFPLENBQ1YsQ0FBQztZQUNGLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQ3ZDLEtBQUssQ0FDVSxDQUFDO1lBQ3BCLFNBQVMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUV0QyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUNqQyxRQUFRLENBQ1UsQ0FBQztZQUN2QixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDM0IsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVoQyxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBbUIsQ0FBQztZQUM1RCxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlCLElBQUksSUFBSSxFQUFFO2dCQUNOLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzdCO1lBQ0QsR0FBRyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7WUFFaEIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQWdCLENBQUM7WUFDM0QsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV0QixJQUFJLGVBQWUsQ0FBQyxXQUFXLEVBQUU7Z0JBQzdCLE1BQU0sTUFBTSxHQUFHLDBCQUEwQixDQUNyQyxlQUFlLENBQUMsV0FBVyxDQUM5QixDQUFDO2dCQUNGLE1BQU0sd0JBQXdCLEdBQzFCLDhCQUE4QixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQyxTQUFTLENBQUMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLENBQUM7Z0JBQ2hELFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDakM7WUFFRCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ3RDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQ25DLE1BQU0sQ0FDVSxDQUFDO2dCQUNyQixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7b0JBQ2xCLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFFBQVEsR0FBRyxxQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMxRCxRQUFRLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztpQkFDaEM7cUJBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO29CQUN6QixRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxRQUFRLEdBQUcscUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDMUQsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7aUJBQ2hDO3FCQUFNO29CQUNILFFBQVEsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO2lCQUNoQztnQkFDRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBbUIsQ0FBQztnQkFDaEUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztTQUNOO1FBRUQsUUFBUSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFdEIsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBaE1ELG9CQWdNQztBQUVELFNBQVMsMEJBQTBCLENBQUMsT0FBZTtJQUMvQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWhELE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtRQUN4QixLQUFLLEVBQUUsTUFBTTtRQUNiLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLE1BQU0sRUFBRSxpQkFBaUI7S0FDNUIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7O1FBQ2pCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxlQUFlLEtBQUksTUFBQSxNQUFNLENBQUMsYUFBYSwwQ0FBRSxRQUFRLENBQUEsQ0FBQztRQUNyRSxJQUFJLEdBQUcsRUFBRTtZQUNMLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNYLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkIsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2Y7SUFDTCxDQUFDLENBQUM7SUFFRixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBUyw4QkFBOEIsQ0FBQyxNQUFNO0lBQzFDLE1BQU0sVUFBVSxHQUFHLHNCQUFzQixJQUFJLENBQUMsTUFBTSxFQUFFO1NBQ2pELFFBQVEsQ0FBQyxFQUFFLENBQUM7U0FDWixTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVwQixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELFFBQVEsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO0lBQzNCLFFBQVEsQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDO0lBQ3pCLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUMxQyxNQUFNLE9BQU8sR0FBSSxLQUFLLENBQUMsTUFBMkIsQ0FBQyxPQUFPLENBQUM7UUFDM0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtRQUMxQixNQUFNLEVBQUUsU0FBUztLQUNwQixDQUFDLENBQUM7SUFFSCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLEtBQUssQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO0lBQzNCLEtBQUssQ0FBQyxXQUFXLEdBQUcsbUJBQW1CLENBQUM7SUFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO1FBQ3ZCLE1BQU0sRUFBRSxTQUFTO0tBQ3BCLENBQUMsQ0FBQztJQUVILE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEQsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoQyxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRTtRQUMzQixPQUFPLEVBQUUsTUFBTTtRQUNmLEdBQUcsRUFBRSxLQUFLO1FBQ1YsWUFBWSxFQUFFLEtBQUs7S0FDdEIsQ0FBQyxDQUFDO0lBRUgsT0FBTyxTQUFTLENBQUM7QUFDckIsQ0FBQyJ9