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
    logger.info("[Jest Stare]: Reading snapshot file at path:", snapshotPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2RvbS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCLFNBQWdCLGNBQWMsQ0FBQyxFQUMzQixNQUFNLEVBQ04sZUFBZSxFQUNmLFFBQVEsRUFDUixZQUFZLEdBQ2Y7SUFDRyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzNDLE1BQU0sTUFBTSxHQUFHLEdBQUcsUUFBUSxLQUFLLFlBQVksRUFBRSxDQUFDO0lBQzlDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUMsQ0FBQztJQUVsRSxPQUFPLENBQUMsR0FBRyxDQUFDLDhDQUE4QyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFFMUUsSUFBSSxJQUFJLENBQUM7SUFDVCxJQUFJO1FBQ0EsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUM1RDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEtBQUssQ0FDVCxzREFBc0QsWUFBWSxFQUFFLENBQ3ZFLENBQUM7UUFDRixNQUFNLENBQUMsS0FBSyxDQUNSLHNEQUFzRCxZQUFZLEVBQUUsQ0FDdkUsQ0FBQztRQUNGLE9BQU8sRUFBRSxDQUFDO0tBQ2I7SUFDRCxPQUFPLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFdBQVcsS0FBSSxFQUFFLENBQUM7QUFDbkMsQ0FBQztBQTFCRCx3Q0EwQkMifQ==