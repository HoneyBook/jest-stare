"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDOMSnapshot = void 0;
const fs = require("fs");
const path = require("path");
function getDOMSnapshot({ domSnapshotsDir, testPath, testFullName }) {
    console.log(`[Jest Stare]: Getting snapshot. domSnapshotsDir: ${domSnapshotsDir}, testPath: ${testPath}, testFullName: ${testFullName}`);
    let data, snapshotPath;
    try {
        const fileName = testPath.split("/").pop();
        const testId = `domSnapshot__${fileName}__${testFullName}`;
        snapshotPath = path.join(domSnapshotsDir, `${testId}.json`);
        console.log("[Jest Stare]: Reading snapshot file at path:", snapshotPath);
        data = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    }
    catch (e) {
        console.error(`[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`);
        return "";
    }
    return (data === null || data === void 0 ? void 0 : data.domSnapshot) || "";
}
exports.getDOMSnapshot = getDOMSnapshot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2RvbS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCLFNBQWdCLGNBQWMsQ0FBQyxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFO0lBQ3RFLE9BQU8sQ0FBQyxHQUFHLENBQ1Asb0RBQW9ELGVBQWUsZUFBZSxRQUFRLG1CQUFtQixZQUFZLEVBQUUsQ0FDOUgsQ0FBQztJQUVGLElBQUksSUFBSSxFQUFFLFlBQVksQ0FBQztJQUN2QixJQUFJO1FBQ0EsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMzQyxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsUUFBUSxLQUFLLFlBQVksRUFBRSxDQUFDO1FBQzNELFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLE1BQU0sT0FBTyxDQUFDLENBQUM7UUFFNUQsT0FBTyxDQUFDLEdBQUcsQ0FDUCw4Q0FBOEMsRUFDOUMsWUFBWSxDQUNmLENBQUM7UUFFRixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQzVEO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUNULHNEQUFzRCxZQUFZLEVBQUUsQ0FDdkUsQ0FBQztRQUNGLE9BQU8sRUFBRSxDQUFDO0tBQ2I7SUFDRCxPQUFPLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFdBQVcsS0FBSSxFQUFFLENBQUM7QUFDbkMsQ0FBQztBQXhCRCx3Q0F3QkMifQ==