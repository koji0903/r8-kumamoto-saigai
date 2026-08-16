// 「水の復旧と、統計に表れない水の問題」が、実測値と発信を取り違えないことを守る。
//
// 復旧の差は県の実測値（断水戸数）で示す。発信の件数から被害を逆算しては
// いけない。氷川町は発災19日目でも断水が残るが水の発信は2件しかない。
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const data = JSON.parse(fs.readFileSync(new URL("../public-data/reconstruction/water-recovery.json", import.meta.url), "utf8"));
const html = fs.readFileSync(new URL("../official-water-recovery.html", import.meta.url), "utf8");
const code = fs.readFileSync(new URL("../official-water-recovery.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../official-water-recovery.css", import.meta.url), "utf8");

// 実測値が主役であること
assert.ok(data.measured?.length >= 5, "断水の実測値が不足しています");
assert.ok(data.axis?.length >= 10, "時間軸の点が不足しています");
assert.ok(data.measuredAsOf?.url, "実測値の出典URLが必要です");
for (const item of data.measured) {
  assert.equal(item.series.length, data.axis.length, `${item.name}: 系列と時間軸の長さが一致しません`);
  assert.ok(item.peak > 0, `${item.name}: ピークが0です`);
  assert.ok(item.latest <= item.peak, `${item.name}: 最新値がピークを超えています`);
  // 解消済みなら最新値は0、継続中なら解消日を持たない
  if (item.latest === 0) assert.ok(item.resolvedDate, `${item.name}: 解消日が必要です`);
  else assert.equal(item.resolvedDate, null, `${item.name}: 継続中なのに解消日があります`);
}
// 復旧に差があることがこのページの主題。全部同じなら成り立たない。
assert.ok(data.measured.some(item => item.latest > 0) && data.measured.some(item => item.latest === 0),
  "継続中と解消済みの両方がなければ復旧の差を示せません");

// 統計に表れない状態を必ず扱うこと
assert.ok(data.invisibleStates?.length >= 3, "統計に表れない状態の定義が不足しています");
const invisible = (data.publications || []).filter(item => item.invisibleInStats);
assert.ok(invisible.length >= 1, "統計に表れない状態の発信が1件もありません");
for (const item of invisible) assert.match(item.url, /^https?:\/\//, "発信のURLが不正です");
assert.ok((data.notes || []).length >= 1, "会議記録からの補足が必要です");
for (const note of data.notes) {
  assert.ok(note.pdf && note.page, "会議記録には原本と該当ページが必要です");
  assert.ok(note.meeting && note.day, "会議記録には回数と発災日が必要です");
}

// 誤読を防ぐ但し書き
assert.ok((data.caveats || []).length >= 3, "但し書きが不足しています");
assert.ok(data.caveats.some(text => /発信の件数は被害の大きさを表しません/.test(text)),
  "発信量から被害を逆算しない旨の但し書きが必要です");
assert.match(html, /断水戸数に表れない水の問題/, "統計に表れない問題の見出しが必要です");
assert.match(html, /統計上0戸として扱われます/, "0戸として扱われる説明が必要です");

// 画面側
assert.match(code, /water-recovery\.json/, "生成データを読む必要があります");
assert.match(code, /waterCaveats/, "但し書きを画面に出す必要があります");
assert.match(code, /catch\(/, "読み込み失敗時の代替導線が必要です");
assert.match(html, /<noscript>/, "JavaScript無効時の導線が必要です");
assert.match(css, /@media\(max-width:700px\)/, "狭い画面への対応が必要です");
assert.match(css, /@media print/, "印刷への対応が必要です");

const build = spawnSync(process.execPath, ["scripts/build-water-recovery.mjs"], { encoding: "utf8" });
assert.equal(build.status, 0, build.stderr);
assert.match(build.stdout, /上水道の復旧/);

const remaining = data.measured.filter(item => item.latest > 0).length;
console.log(`水の復旧: 実測${data.measured.length}市町村（継続中${remaining}）/ 統計に出ない状態${invisible.length}件 / 会議記録${data.notes.length}件 / 逆算しない・出典・fallback OK`);
