// 5つの対応の流れが、自治体の優劣の比較にすり替わらないことを守る。
//
// 節目（◆）は一次資料の実日付なので比較に耐えるが、発信（○）は広報の
// 仕方を表すにすぎない。両者を混ぜずに示し、並び順も発信量では決めない。
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const data = JSON.parse(fs.readFileSync(new URL("../public-data/reconstruction/response-tracks.json", import.meta.url), "utf8"));
const html = fs.readFileSync(new URL("../official-response-tracks.html", import.meta.url), "utf8");
const code = fs.readFileSync(new URL("../official-response-tracks.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../official-response-tracks.css", import.meta.url), "utf8");
const builder = fs.readFileSync(new URL("./build-response-tracks.mjs", import.meta.url), "utf8");

// 5つの流れをすべて扱うこと
const expected = ["water", "certificate", "volunteer", "waste", "consultation"];
assert.deepEqual(data.tracks.map(track => track.id), expected, "5つの対応の流れが揃っていません");
for (const track of data.tracks) {
  assert.ok(track.label && track.color && track.summary, `${track.id}: 表示名・色・説明が必要です`);
}

// 21市町村すべてを扱い、情報がない市町村も落とさないこと
assert.equal(data.municipalities.length, 21, "21市町村すべてを扱う必要があります");
for (const municipality of data.municipalities) {
  assert.match(municipality.officialUrl, /^https?:\/\//, `${municipality.name}: 公式サイトの退避先が必要です`);
  for (const id of expected) assert.ok(municipality.tracks[id], `${municipality.name}: ${id} のレーンがありません`);
}

// 節目は一次資料の実日付。出典を必ず持つこと。
const milestones = data.municipalities.flatMap(item => Object.values(item.tracks).flatMap(track => track.milestones || []));
assert.ok(milestones.length >= 30, `一次資料の節目が${milestones.length}件しかありません`);
for (const milestone of milestones) {
  assert.match(milestone.date, /^2026-\d{2}-\d{2}$/, "節目の日付が不正です");
  assert.ok(milestone.day >= 1, "節目が発災前になっています");
  assert.ok(milestone.source?.label, "節目には出典が必要です");
  assert.ok(["prefecture", "minutes"].includes(milestone.source.kind), "節目の出典は県資料か議事録である必要があります");
}
// 罹災証明と災害VCは実日付が取れるはずの流れ
assert.ok(milestones.some(item => item.trackId === "certificate"), "罹災証明の実日付を取り込めていません");
assert.ok(milestones.some(item => item.trackId === "volunteer"), "災害VCの実日付を取り込めていません");
assert.ok(data.sources?.certificate?.url, "罹災証明の節目の出典URLが必要です");

// 発信と節目を混ぜないこと
const publications = data.municipalities.flatMap(item => Object.values(item.tracks).flatMap(track => track.publications || []));
for (const publication of publications) {
  assert.match(publication.url, /^https?:\/\//, "発信のURLが不正です");
  assert.ok(!("source" in publication), "発信に一次資料の出典を付けてはいけません");
}

// 並び順を発信量で決めていないこと
assert.match(builder, /発信量で並べると広報の熱心さの順位に見えてしまう/, "並び順の根拠の記述が必要です");
const counts = data.municipalities.map(item => Object.values(item.tracks).reduce((total, track) => total + track.count, 0));
assert.ok(!counts.every((value, index) => index === 0 || value <= counts[index - 1]),
  "発信数の降順に並んでいます。発信量で順位づけしてはいけません");

// 誤読を防ぐ表示
assert.ok((data.caveats || []).length >= 3, "但し書きが不足しています");
assert.match(html, /対応の優劣を示すものではありません/, "優劣ではない旨の明示が必要です");
assert.match(html, /発信がないことは対応がないことを意味せず/, "発信の有無に関する但し書きが必要です");
assert.match(html, /一次資料に書かれた、実際に始まった日/, "節目の意味の説明が必要です");
assert.match(code, /tracksCaveats/, "但し書きを画面に出す必要があります");
assert.match(code, /catch\(/, "読み込み失敗時の代替導線が必要です");
assert.match(html, /<noscript>/, "JavaScript無効時の導線が必要です");
assert.match(css, /@media\(max-width:700px\)/, "狭い画面への対応が必要です");
assert.match(css, /@media print/, "印刷への対応が必要です");

const build = spawnSync(process.execPath, ["scripts/build-response-tracks.mjs"], { encoding: "utf8" });
assert.equal(build.status, 0, build.stderr);
assert.match(build.stdout, /対応の流れ/);

console.log(`5つの対応の流れ: 節目${milestones.length}件（出典つき）/ 発信${publications.length}件 / 21市町村 / 優劣にしない・節目と発信を分ける・発信量で並べない OK`);
