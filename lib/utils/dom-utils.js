"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDOMSnapshot = void 0;
const fs = require("fs");
const path = require("path");
function getDOMSnapshot({ domSnapshotsDir, testPath, testFullName }) {
    const fileName = testPath.split("/").pop();
    const testId = `${fileName}__${testFullName}`;
    const snapshotPath = path.join(domSnapshotsDir, `${testId}.json`);
    let data;
    try {
        data = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    }
    catch (e) {
        console.error(`[Jest Stare]: Error reading snapshot file at path: ${snapshotPath}`);
        return "";
    }
    return (data === null || data === void 0 ? void 0 : data.domSnapshot) || "";
}
exports.getDOMSnapshot = getDOMSnapshot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2RvbS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCLFNBQWdCLGNBQWMsQ0FBQyxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFO0lBQ3RFLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDM0MsTUFBTSxNQUFNLEdBQUcsR0FBRyxRQUFRLEtBQUssWUFBWSxFQUFFLENBQUM7SUFDOUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxDQUFDO0lBRWxFLElBQUksSUFBSSxDQUFDO0lBQ1QsSUFBSTtRQUNBLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7S0FDNUQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxLQUFLLENBQ1Qsc0RBQXNELFlBQVksRUFBRSxDQUN2RSxDQUFDO1FBQ0YsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUNELE9BQU8sQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsV0FBVyxLQUFJLEVBQUUsQ0FBQztBQUNuQyxDQUFDO0FBZkQsd0NBZUMifQ==