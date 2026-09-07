import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const source = fs.readFileSync("tools/fetch-municipality-updates.mjs", "utf8");
const functions = source.slice(source.indexOf("function parseDate("), source.indexOf("function allowed("));
const context = vm.createContext({ DISASTER_DATE: "2026-07-28", END_DATE: "2026-12-31" });
vm.runInContext(functions, context);
for (const [title, date] of [["2026年9月7日更新", "2026-09-07"], ["9月7日更新", "2026-09-07"], ["12/31更新", "2026-12-31"], ["令和8年10月1日更新", "2026-10-01"]]) {
  assert.equal(context.parseDate(title)?.date, date, title);
}
for (const title of ["2026年9月31日", "2026年7月27日", "2026年13月1日"]) assert.equal(context.parseDate(title), null, title);
console.log("公式記事の日付: 9月・10月・12月・不正日・発災前を検証 OK");
