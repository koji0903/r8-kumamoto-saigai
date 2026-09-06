import assert from "node:assert/strict";
import { isValidTopicDate } from "../tools/official-topic-date.mjs";

for (const date of ["2026-07-28", "2026-08-31", "2026-09-06", "2026-12-31", "2027-01-01", "2028-02-29"]) {
  assert.equal(isValidTopicDate(date), true, `${date}は有効な日付`);
}
for (const date of [null, undefined, 20260906, "", "2026-9-6", "2026-00-01", "2026-13-01", "2026-09-00", "2026-09-31", "2026-02-29", "2026-09-06T00:00:00Z"]) {
  assert.equal(isValidTopicDate(date), false, `${date}は不正な日付`);
}
console.log("トピックス日付: 月越し・年越し・閏日・不正日付の検査 OK");
