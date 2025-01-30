"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
const Constants_1 = require("../Constants");
const AnsiParser = require("ansi-parser");
const TestDifference_1 = require("../diff/TestDifference");
const ImageSnapshotDifference_1 = require("../diff/ImageSnapshotDifference");
const DEMO_HTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Iframe Full Page</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            h1 { color: blue; }
        </style>
    </head>
    <body>
        <h1>Hello from Full HTML Iframe</h1>
        <p>This content is replacing the entire document.</p>
    </body>
    </html>
`;
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
            console.log("here1", innerTestResult);
            const iframe = createIframeWithContent();
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
            iframe.onload = () => {
                var _a;
                const doc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
                if (doc) {
                    doc.open();
                    doc.write(innerTestResult.domSnapshot);
                    doc.close();
                }
            };
            const iframeVisibilityCheckbox = createIframeVisibilityCheckbox(iframe);
            secondDiv.appendChild(iframeVisibilityCheckbox);
            secondDiv.appendChild(iframe);
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
function createIframeWithContent() {
    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
        width: "100%",
        height: "1100px",
        border: "1px solid black",
    });
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
    checkbox.setAttribute("style", "cursor: pointer;");
    const label = document.createElement("label");
    label.htmlFor = checkboxId;
    label.textContent = "Show DOM Snapshot";
    label.setAttribute("style", "cursor: pointer;");
    const container = document.createElement("div");
    container.appendChild(checkbox);
    container.appendChild(label);
    container.setAttribute("style", "display: flex; gap: 4px; margin-bottom: 6px;");
    return container;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZW5kZXIvdGVzdHMvVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0Q0FBeUM7QUFDekMsMENBQTBDO0FBQzFDLDJEQUF3RDtBQUN4RCw2RUFBMEU7QUFHMUUsTUFBTSxTQUFTLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUJqQixDQUFDO0FBT0YsTUFBYSxJQUFJO0lBU04sTUFBTSxDQUFDLE1BQU0sQ0FDaEIsZUFBMkM7UUFFM0MsSUFBSSxLQUFLLEdBQUcscUJBQVMsQ0FBQyxRQUFRLENBQUM7UUFDL0IsSUFBSSxlQUFlLEdBQUcscUJBQVMsQ0FBQyxXQUFXLENBQUM7UUFDNUMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRW5CLFFBQVEsZUFBZSxDQUFDLE1BQU0sRUFBRTtZQUM1QixLQUFLLHFCQUFTLENBQUMsZ0JBQWdCO2dCQUMzQixLQUFLLEdBQUcscUJBQVMsQ0FBQyxRQUFRLENBQUM7Z0JBQzNCLGVBQWUsR0FBRyxxQkFBUyxDQUFDLFdBQVcsQ0FBQztnQkFDeEMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDZCxNQUFNO1lBQ1YsS0FBSyxxQkFBUyxDQUFDLGdCQUFnQjtnQkFDM0IsS0FBSyxHQUFHLHFCQUFTLENBQUMsV0FBVyxDQUFDO2dCQUM5QixlQUFlLEdBQUcscUJBQVMsQ0FBQyxZQUFZLENBQUM7Z0JBQ3pDLE1BQU07WUFDVixLQUFLLHFCQUFTLENBQUMsZ0JBQWdCO2dCQUMzQixLQUFLLEdBQUcscUJBQVMsQ0FBQyxRQUFRLENBQUM7Z0JBQzNCLGVBQWUsR0FBRyxxQkFBUyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsTUFBTTtZQUNWLEtBQUsscUJBQVMsQ0FBQyxnQkFBZ0I7Z0JBQzNCLE1BQU07WUFDVjtnQkFDSSxNQUFNO1NBQ2I7UUFFRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBbUIs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