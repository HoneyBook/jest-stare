"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDOMSnapshot = void 0;
const fs = require("fs");
const path = require("path");
function getDOMSnapshot({ logger, domSnapshotsDir, testPath, testFullName, }) {
    const fileName = testPath.split("/").pop();
    const testId = `${fileName}__${testFullName}`;
    const snapshotPath = path.join(domSnapshotsDir, `${testId}.json`);
    console.log("[Jest Stare]: Reading snapshot file at path:", snapshotPath);
    logger.info("[Jest Stare]: Generating report...");
    let data;
    try {
        data = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    }
    catch (e) {
        console.error(`[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`);
        logger.error(`[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`);
        return "";
    }
    return (data === null || data === void 0 ? void 0 : data.domSnapshot) || "";
}
exports.getDOMSnapshot = getDOMSnapshot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2RvbS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCLFNBQWdCLGNBQWMsQ0FBQyxFQUMzQixNQUFNLEVBQ04sZUFBZSxFQUNmLFFBQVEsRUFDUixZQUFZLEdBQ2Y7SUFDRyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzNDLE1BQU0sTUFBTSxHQUFHLEdBQUcsUUFBUSxLQUFLLFlBQVksRUFBRSxDQUFDO0lBQzlDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUMsQ0FBQztJQUVsRSxPQUFPLENBQUMsR0FBRyxDQUFDLDhDQUE4QyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztJQUVsRCxJQUFJLElBQUksQ0FBQztJQUNULElBQUk7UUFDQSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQzVEO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUNULHNEQUFzRCxZQUFZLEVBQUUsQ0FDdkUsQ0FBQztRQUNGLE1BQU0sQ0FBQyxLQUFLLENBQ1Isc0RBQXNELFlBQVksRUFBRSxDQUN2RSxDQUFDO1FBQ0YsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUNELE9BQU8sQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsV0FBVyxLQUFJLEVBQUUsQ0FBQztBQUNuQyxDQUFDO0FBMUJELHdDQTBCQyJ9