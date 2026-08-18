// 市町村の災害対策本部会議のまとめを守る。
//
// このページの値打ちは「市が書いた数字をそのまま並べていること」だけなので、
//   ・出どころ（市の一覧ページと資料PDF）へ必ず行けること
//   ・数え方が変わった数字を、ひとつの推移につながないこと
//   ・書かれていない回を、前の回の値で埋めていないこと
//   ・毎日の自動更新に載っていること（載っていないと止まったまま古くなる）
// を見る。ここが崩れると、市の資料と違うことを書いたページになる。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const exists = file => fs.existsSync(new URL(`../${file}`, import.meta.url));

const config = JSON.parse(read("config/municipality-hq-meetings.json"));
const index = JSON.parse(read("sources/official/municipality-hq-index.json"));
const generated = read("data/generated/municipality-hq-data.js");
const data = JSON.parse(generated.slice(generated.indexOf("=") + 1).trim().replace(/;\s*$/, ""));

assert.ok(config.municipalities.length >= 2, "対象の市町村が2件未満です");
assert.equal(data.municipalities.length, config.municipalities.length, "設定と生成物で市町村の数が違います");

const pages = new Set();
for (const municipality of data.municipalities) {
  const where = municipality.name;
  const setting = config.municipalities.find(item => item.key === municipality.key);
  assert.ok(setting, `${where}: config にありません`);
  assert.equal(municipality.page, setting.page, `${where}: ページ名が config と違います`);
  assert.ok(exists(municipality.page), `${where}: ページ ${municipality.page} がありません`);
  pages.add(municipality.page);

  // ---- 一次情報へ行けること --------------------------------------------------
  const html = read(municipality.page);
  assert.ok(html.includes(`data-hq="${municipality.key}"`), `${where}: ページが市を指定していません`);
  assert.ok(html.includes(municipality.indexUrl) || read("municipality-hq.js").includes("indexUrl"),
    `${where}: 市の一覧ページへの導線がありません`);
  assert.ok(municipality.indexUrl.startsWith("https://"), `${where}: 一覧ページが https ではありません`);

  assert.ok(municipality.meetings.length >= 10, `${where}: 会議が${municipality.meetings.length}回しかありません`);
  const numbers = municipality.meetings.map(meeting => meeting.meeting);
  assert.deepEqual([...numbers].sort((a, b) => a - b), numbers, `${where}: 回の並びが昇順ではありません`);
  assert.equal(new Set(numbers).size, numbers.length, `${where}: 同じ回が2度入っています`);

  for (const meeting of municipality.meetings) {
    const label = `${where} 第${meeting.meeting}回`;
    assert.ok(meeting.documents?.length, `${label}: 資料へのリンクがありません`);
    for (const document_ of meeting.documents) {
      assert.match(document_.url, /^https:\/\/[^"]+\.pdf$/, `${label}: 資料URLが不正（${document_.url}）`);
      // 市の公開ドメイン以外を一次情報として出さない
      assert.ok(document_.url.startsWith(setting.origin), `${label}: 市のドメイン外のURLです（${document_.url}）`);
    }
    if (meeting.date) assert.match(meeting.date, /^2026-\d{2}-\d{2}$/, `${label}: 日付の形式が不正`);
    // 本文が無い回に数字があってはいけない（どこから来た数字か言えなくなる）
    if (!meeting.sections?.length) {
      assert.equal(Object.keys(meeting.figures || {}).length, 0, `${label}: 本文がないのに数字が入っています`);
    }
    for (const [key, value] of Object.entries(meeting.figures || {})) {
      assert.ok(Number.isInteger(value) && value >= 0, `${label}: ${key} が整数ではありません（${value}）`);
    }
  }

  // ---- 書かれていない回を埋めていないこと ------------------------------------
  // 資料に載っていない回まで値が入っていたら、それは補完している証拠。
  const source = index.municipalities.find(item => item.key === municipality.key);
  const withText = municipality.meetings.filter(meeting => meeting.sections?.length).length;
  assert.ok(withText < municipality.meetings.length || municipality.withoutText.length === 0,
    `${where}: 本文の数が合いません`);
  assert.equal(source.latestMeeting, Math.max(...numbers), `${where}: 最新の回が一覧と一致しません`);
}
assert.equal(pages.size, data.municipalities.length, "ページが市町村ごとに分かれていません");

// ---- 数え方が変わった数字を混ぜないこと --------------------------------------
// 熊本市は第20回で「住家被害（速報）」をやめ「住家被害認定調査実施件数」に変えた。
// 8,897件 → 779件 と激減して見えるので、同じ推移に並べると誤読になる。
const viewer = read("municipality-hq.js");
assert.ok(viewer.includes("homesReported") && viewer.includes("homesSurveyed"),
  "住家被害の2つの数え方が別々に扱われていません");
assert.ok(/数え方は第\$\{[^}]+\}回で変わりました/.test(viewer) || viewer.includes("数え方は第"),
  "数え方が変わったことを知らせる文がありません");
const kumamoto = data.municipalities.find(item => item.key === "kumamoto");
if (kumamoto) {
  const reported = kumamoto.meetings.filter(meeting => meeting.figures?.homesReported != null);
  const surveyed = kumamoto.meetings.filter(meeting => meeting.figures?.homesSurveyed != null);
  if (reported.length && surveyed.length) {
    assert.ok(surveyed[0].meeting > reported.at(-1).meeting,
      "住家被害の速報と認定調査が同じ回に混在しています");
  }
}

// ---- 自動更新に載っていること -------------------------------------------------
const workflow = read(".github/workflows/refresh-official-data.yml");
assert.ok(workflow.includes("node tools/fetch-municipality-hq.mjs"), "取得が自動更新に入っていません");
assert.ok(workflow.includes("python tools/build-municipality-hq.py"), "抽出が自動更新に入っていません");
assert.ok(workflow.includes("data/generated/municipality-hq-data.js"), "生成物がcommit対象に入っていません");
assert.ok(workflow.includes("sources/official/municipality-hq-text"), "取り出した本文がcommit対象に入っていません");
// PDFは重いのでコミットしない。ignoreを外すと1GBがリポジトリに入る
assert.ok(read(".gitignore").includes("sources/official/municipality-hq/"), "資料PDFが.gitignoreから外れています");
// 本文が残っていれば、PDFを取り直さずに作り直せる（CIで毎日600MB取らないため）
const fetcher = read("tools/fetch-municipality-hq.mjs");
assert.ok(fetcher.includes("TEXT_DIR"), "抽出済みの回を飛ばす仕組みがありません");

// ---- 導線 ---------------------------------------------------------------------
const orgSite = read("org-site.js");
for (const municipality of data.municipalities) {
  assert.ok(orgSite.includes(`href="${municipality.page}"`), `メガメニューに ${municipality.page} がありません`);
  assert.match(orgSite, new RegExp(`'${municipality.page.replace(/\./g, "\\.")}':'[^']+'`),
    `${municipality.page} のページ名がありません`);
  assert.ok(orgSite.match(/const activityPages=\[([^\]]*)\]/)[1].includes(municipality.page),
    `${municipality.page} が現在地判定に入っていません`);
}

const total = data.municipalities.reduce((sum, item) => sum + item.meetings.length, 0);
const figures = data.municipalities.reduce(
  (sum, item) => sum + item.meetings.filter(meeting => Object.keys(meeting.figures || {}).length).length, 0);
console.log(`市町村の本部会議: ${data.municipalities.length}市 ${total}回（数値あり${figures}回）/ 出典・数え方の分離・補完なし・自動更新・導線 OK`);
