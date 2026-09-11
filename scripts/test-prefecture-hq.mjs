import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync("sources/official/hq-index.json", "utf8"));
const response = catalog.meetings.filter(m => (m.meetingType || "response") === "response");
const recovery = catalog.meetings.filter(m => m.meetingType === "recovery");

assert.ok(response.length >= 29, `災害対策本部会議が${response.length}回しかありません`);
assert.ok(recovery.length >= 3, `復旧・復興本部会議が${recovery.length}回しかありません`);
assert.ok(Math.max(...recovery.map(m => m.meeting)) >= 3, "第3回以降の復旧・復興本部会議がありません");
assert.ok(recovery.every(m => m.sourceUrl && m.documents.length), "復旧・復興本部会議の資料または掲載元がありません");
assert.ok(recovery.flatMap(m => m.documents).some(d => d.title.includes("人的被害等の状況（9月11日")), "9月11日の人的被害資料がありません");
const keys = catalog.meetings.map(m => `${m.meetingType || "response"}:${m.meeting}`);
assert.equal(new Set(keys).size, keys.length, "県本部会議の種別・回数が重複しています");
console.log(`県本部会議: 災害対策 ${response.length}回 / 復旧・復興 ${recovery.length}回`);
