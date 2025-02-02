import * as fs from "fs";
import * as path from "path";

export function getDOMSnapshot({
    logger,
    domSnapshotsDir,
    testPath,
    testFullName,
}) {
    const fileName = testPath.split("/").pop();
    const testId = `${fileName}__${testFullName}`;
    console.log("[Jest Stare]: fileName:", fileName);
    console.log("[Jest Stare]: testId:", testId);

    const snapshotPath = path.join(domSnapshotsDir, `${testId}.json`);

    console.log("[Jest Stare]: Reading snapshot file at path:", snapshotPath);
    logger.info("[Jest Stare]: Reading snapshot file at path:", snapshotPath);

    let data;
    try {
        data = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    } catch (e) {
        console.error(
            `[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`
        );
        logger.error(
            `[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`
        );
        return "";
    }
    return data?.domSnapshot || "";
}
