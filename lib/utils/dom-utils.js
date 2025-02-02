"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDOMSnapshot = void 0;
const fs = require("fs");
const path = require("path");
function getDOMSnapshot({ logger, domSnapshotsDir, testPath, testFullName, }) {
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
    }
    catch (e) {
        console.error(`[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`);
        logger.error(`[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`);
        return "";
    }
    return (data === null || data === void 0 ? void 0 : data.domSnapshot) || "";
}
exports.getDOMSnapshot = getDOMSnapshot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2RvbS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCLFNBQWdCLGNBQWMsQ0FBQyxFQUMzQixNQUFNLEVBQ04sZUFBZSxFQUNmLFFBQVEsRUFDUixZQUFZLEdBQ2Y7SUFDRyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzNDLE1BQU0sTUFBTSxHQUFHLEdBQUcsUUFBUSxLQUFLLFlBQVksRUFBRSxDQUFDO0lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUU3QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLE1BQU0sT0FBTyxDQUFDLENBQUM7SUFFbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4Q0FBOEMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUMxRSxNQUFNLENBQUMsSUFBSSxDQUFDLDhDQUE4QyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBRTFFLElBQUksSUFBSSxDQUFDO0lBQ1QsSUFBSTtRQUNBLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7S0FDNUQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxLQUFLLENBQ1Qsc0RBQXNELFlBQVksRUFBRSxDQUN2RSxDQUFDO1FBQ0YsTUFBTSxDQUFDLEtBQUssQ0FDUixzREFBc0QsWUFBWSxFQUFFLENBQ3ZFLENBQUM7UUFDRixPQUFPLEVBQUUsQ0FBQztLQUNiO0lBQ0QsT0FBTyxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxXQUFXLEtBQUksRUFBRSxDQUFDO0FBQ25DLENBQUM7QUE3QkQsd0NBNkJDIn0=