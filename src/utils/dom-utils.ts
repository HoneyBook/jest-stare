import * as fs from "fs";
import * as path from "path";

export function getDOMSnapshot({ domSnapshotsDir, testPath, testFullName }) {
    const fileName = testPath.split("/").pop();
    const testId = `${fileName}__${testFullName}`;
    const snapshotPath = path.join(domSnapshotsDir, `${testId}.json`);

    let data;
    try {
        data = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    } catch (e) {
        console.error(
            `[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`
        );
        return "";
    }
    return data?.domSnapshot || "";
}
