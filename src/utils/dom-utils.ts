import * as fs from "fs";
import * as path from "path";

export function getDOMSnapshot({ domSnapshotsDir, testPath, testFullName }) {
    console.log(
        `[Jest Stare]: Getting snapshot. domSnapshotsDir: ${domSnapshotsDir}, testPath: ${testPath}, testFullName: ${testFullName}`
    );

    let data, snapshotPath;
    try {
        const fileName = testPath.split("/").pop();
        const testId = `domSnapshot__${fileName}__${testFullName}`;
        snapshotPath = path.join(domSnapshotsDir, `${testId}.json`);

        console.log(
            "[Jest Stare]: Reading snapshot file at path:",
            snapshotPath
        );

        data = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    } catch (e) {
        console.error(
            `[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`
        );
        return "";
    }
    return data?.domSnapshot || "";
}
