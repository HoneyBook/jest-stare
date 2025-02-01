import * as fs from "fs";
import * as path from "path";

export function getDOMSnapshot({ testPath, testFullName }) {
    const fileName = testPath.split("/").pop();
    const testId = `${fileName}__${testFullName}`;
    const snapshotPath = path.join(__dirname, `${testId}.json`);

    let data;
    try {
        data = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    } catch (e) {
        console.error(
            `[Jest Stare]: Error reading snapshot file: ${snapshotPath}`
        );
        return "";
    }
    return data?.domSnapshot || "";
}
