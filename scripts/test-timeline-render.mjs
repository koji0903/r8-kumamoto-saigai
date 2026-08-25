import assert from "node:assert/strict";
import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const html=read("timeline.html");
const app=read("app.js");
const data=read("data/report-data.js");

assert.match(html,/id="timelineList"[^>]*>[\s\S]*timeline-loading/,
  "JavaScriptの読み込み中も空白にしないでください");
assert.match(html,/data\/report-data\.js\?v=\d{8}-\d+/,
  "タイムラインデータにキャッシュ更新番号が必要です");
assert.match(html,/app\.js\?v=\d{8}-\d+/,
  "描画スクリプトにキャッシュ更新番号が必要です");
assert.match(app,/if\(\$\("#timelineList"\)\)/);
assert.match(app,/renderFilters\(\);renderTimeline\(\)/);
assert.match(data,/window\.REPORT_DATA\s*=/);
console.log("日々の記録: 初期表示 / データ・描画キャッシュ更新 / 描画導線 OK");
