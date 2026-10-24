#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const window = {};
new Function("window", read("data/minutes-data.js"))(window);

const meeting = window.MINUTES_DATA.meetings.find(item => item.meeting === 538);
assert.ok(meeting, "火の国会議第538回が構造化議事録に必要です");
assert.equal(meeting.date, "2026-10-23");
assert.equal(meeting.series, 47);
assert.equal(meeting.pages, 20);
assert.equal(meeting.attendance.total, 35);

const serialized = JSON.stringify(meeting);
const flyers = [
  "被災家屋対処説明会チラシ_宇城.pdf",
  "被災家屋対処説明会チラシ_観行寺.pdf",
  "被災家屋対処説明会チラシ_氷川町pdf.pdf",
  "被災家屋対処説明会チラシ_妙見.pdf"
];
for (const flyer of flyers) {
  assert.ok(fs.existsSync(path.join(root, "sources/hinokuni-meetings", flyer)), `${flyer} が保存されていません`);
  assert.ok(serialized.includes(flyer), `${flyer} が第538回の構造化議事録から参照できません`);
}

const html = read("meetings.html");
for (const flyer of flyers) assert.ok(html.includes(flyer), `${flyer} が meetings.html から参照できません`);
assert.match(html, /第538回（10月23日）議事録PDF/, "JavaScript無効時にも第538回PDFを参照できる必要があります");
assert.match(html, /正しくは\s*<a href="tel:08047538384">080-4753-8384<\/a>/, "氷川町チラシの正しい電話番号を表示する必要があります");
assert.doesNotMatch(html, /tel:09047538384/, "氷川町チラシの誤った電話番号を電話リンクにしてはいけません");
assert.match(serialized, /チラシ記載の先頭090は誤りで、第538回議事録に正しくは080と明記/, "氷川町チラシの電話番号訂正根拠が必要です");

const topics = JSON.parse(read("sources/site-topics.json"));
assert.ok(topics.some(item => item.url === "meetings.html?meeting=538"), "第538回の更新情報がトップページ用データに必要です");

console.log("火の国会議第538回・被災家屋対処説明会チラシ4件・氷川町電話番号訂正の検査 OK");
