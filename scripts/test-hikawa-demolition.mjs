// 氷川町の公費解体・自費解体ガイドを、公式資料と違う内容にしないための検査。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const data = JSON.parse(read("data/reconstruction/hikawa-demolition.json"));
const html = read("hikawa-demolition.html");
const js = read("hikawa-demolition.js");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const shown = `${html}\n${js}`;

// ---- 出典・自治体 -----------------------------------------------------------
assert.equal(data.municipality, "氷川町", "自治体名は氷川町である必要があります");
assert.ok(html.includes(data.officialUrl), "氷川町公式ページへのリンクが必要です");
assert.match(text, /竜北体育センター/, "受付場所（竜北体育センター）の記載が必要です");

// ---- 電話番号 ---------------------------------------------------------------
for (const tel of data.phones.reservation) {
  const cleanTel = tel.replaceAll("-", "");
  assert.ok(html.includes(`tel:${cleanTel}`), `予約電話番号 ${tel} の発信リンクがありません`);
}
const inquiryClean = data.phones.inquiry.replaceAll("-", "");
assert.ok(html.includes(`tel:${inquiryClean}`), `問合せ電話番号 ${data.phones.inquiry} の発信リンクがありません`);

// ---- 受付ルール・注意点 -----------------------------------------------------
assert.match(text, /完全電話予約制|完全予約制/, "完全予約制の明記が必要です");
assert.match(text, /解体工事の日程ではありません|解体工事の実施日/, "予約は書類提出日であり工事日ではない注意が必要です");
assert.match(text, /土日祝日も受付/, "土日祝対応の案内が必要です");

// ---- 判定対象 ---------------------------------------------------------------
for (const criteria of data.eligibility.damageCriteria) {
  assert.ok(text.includes(criteria), `対象判定「${criteria}」が必要です`);
}
assert.match(text, /準半壊/, "準半壊に関する説明が必要です");
assert.match(text, /一部損壊/, "一部損壊に関する説明が必要です");

// ---- 様式ファイル（全10点）のリンクと保存 -----------------------------------
assert.equal(data.forms.length, 5, "様式は第1号〜第5号の5種類です");
for (const form of data.forms) {
  assert.ok(html.includes(form.docUrl), `${form.number} のWordリンクがありません`);
  assert.ok(html.includes(form.sampleUrl), `${form.number} の記載例PDFリンクがありません`);
  assert.ok(fs.existsSync(new URL(`../${form.localDocPath}`, import.meta.url)), `${form.localDocPath} が保存されていません`);
  assert.ok(fs.existsSync(new URL(`../${form.localSamplePath}`, import.meta.url)), `${form.localSamplePath} が保存されていません`);
}

// ---- ライフライン切断手配（事前立会い時） -------------------------------------
assert.match(text, /水道/, "水道休止の手配案内が必要です");
assert.match(text, /電気/, "電気引込線撤去の手配案内が必要です");
assert.match(text, /エアコン/, "エアコンガス抜きの手配案内が必要です");
assert.match(text, /浄化槽/, "浄化槽汲取り清掃の手配案内が必要です");

// ---- 自費解体（費用償還） ---------------------------------------------------
assert.match(text, /自費解体/, "自費解体に関する説明が必要です");
assert.match(text, /写真/, "写真保管の案内が必要です");
assert.match(text, /領収書/, "領収書保管の案内が必要です");
assert.match(text, /マニフェスト/, "マニフェスト保管の案内が必要です");

// ---- サイト内導線 -----------------------------------------------------------
const hikawaSupport = read("hikawa-support.html");
assert.ok(hikawaSupport.includes("hikawa-demolition.html"), "hikawa-support.html から公費解体ガイドへの導線が必要です");

const siteTopics = JSON.parse(read("sources/site-topics.json"));
assert.ok(siteTopics.some(t => t.url === "hikawa-demolition.html"), "sources/site-topics.json に公費解体ガイドのトピックスが必要です");

const orgSite = read("org-site.js");
assert.match(orgSite, /'hikawa-demolition\.html':'[^']+'/, "org-site.js にSEOタイトル登録が必要です");

console.log(`氷川町 公費解体ガイド: 電話${data.phones.reservation.length + 1}件 / 様式・記載例10点 / 対象判定4区分 / ライフライン手配 / 自費解体保管書類 / 導線 OK`);
