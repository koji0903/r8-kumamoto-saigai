// 宇土市の応急修理ガイドを、公式資料と違う内容にしないための検査。
//
// 手で書いたページなので、金額・期限・電話番号・様式のリンクを写し間違える余地がある。
// 資料から読み取ったデータ（data/reconstruction/uto-emergency-repair.json）と突き合わせ、
//   ・データにある数値・リンクがページから落ちていないか
//   ・ページにデータに無い金額・電話番号が混ざっていないか
//   ・保存した一次資料が実在するか
// を見る。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const data = JSON.parse(read("data/reconstruction/uto-emergency-repair.json"));
const html = read("uto-repair.html");
const js = read("uto-repair.js");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const shown = `${html}\n${js}`;

// ---- 出典 -------------------------------------------------------------------
assert.ok(html.includes(data.source.pageUrl), "宇土市公式ページへのリンクが必要です");
assert.match(text, /宇土市の公式サイトではありません/, "公式サイトでないことの明示が必要です");
assert.match(text, /2026年8月27日/, "公式ページの掲載日を示す必要があります");
assert.match(text, /2026年9月13日/, "確認日を示す必要があります");

// 公開されたファイルは全部リンクし、全部保存してあること
for (const file of data.files) {
  assert.ok(html.includes(`href="${file.url}"`), `${file.name} へのリンクがありません`);
  assert.ok(fs.existsSync(new URL(`../${data.source.savedDir}/${file.saved}`, import.meta.url)), `${file.saved} が保存されていません`);
}
assert.equal(data.files.length, 16, "公式ページの資料・様式は16点です");

// ---- 金額：データ→ページ、ページ→データ -------------------------------------
for (const limit of data.limits) {
  assert.ok(shown.includes(limit.display), `上限額 ${limit.display} がありません`);
}
const allowedYen = new Set(data.limits.map(limit => limit.yen));
for (const [, digits] of shown.matchAll(/(\d{1,3}(?:,\d{3})+)\s*円/g)) {
  assert.ok(allowedYen.has(Number(digits.replaceAll(",", ""))), `資料に無い金額 ${digits}円 があります`);
}

// ---- 期限 -------------------------------------------------------------------
assert.ok(text.includes(data.deadline.display), "完了期限が必要です");
assert.ok(!/10月27日/.test(text), "延長前の期限（10月27日）が残っています");

// ---- 電話番号 ---------------------------------------------------------------
const allowedTel = new Set([...data.tels.map(t => t.tel.replaceAll("-", "")), "188"]);
for (const { tel } of data.tels) {
  assert.ok(html.includes(`tel:${tel.replaceAll("-", "")}`), `${tel} の発信リンクがありません`);
}
for (const [, tel] of shown.matchAll(/href="tel:(\d+)"/g)) {
  assert.ok(allowedTel.has(tel), `資料に無い電話番号 ${tel} があります`);
}

// ---- 必要書類 ---------------------------------------------------------------
for (const doc of data.applicantDocuments) {
  const core = doc.replace(/（.*?）/g, "");
  assert.ok(text.includes(core), `必要書類「${doc}」がページにありません`);
}

// ---- 判定の中身 ---------------------------------------------------------------
// 資力に関する申出書は中規模半壊・半壊・準半壊だけ（様式第1号・チェックシート）
assert.match(js, /needsMeans=d=>\["medium","half","semi"\]\.includes\(d\)/, "資力申出書の対象判定が資料と違います");
// 代金を払った後は対象外、という最重要の注意
assert.match(text, /代金を支払ってしまうと、この制度は使えません/, "支払い後は対象外の注意が必要です");

// ---- 導線 -------------------------------------------------------------------
for (const page of ["uto-housing.html", "uto-bulletin.html", "app.js"]) {
  assert.ok(read(page).includes("uto-repair.html"), `${page} から応急修理ガイドへの導線がありません`);
}
const housing = read("uto-housing.html");
assert.ok(!housing.includes("2026年10月27日"), "uto-housing.html に延長前の期限が残っています");
assert.ok(housing.includes("2027年1月27日"), "uto-housing.html に延長後の期限が必要です");
const orgSite = read("org-site.js");
assert.match(orgSite, /'uto-repair\.html':'[^']+'/, "パンくずのページ名がありません");

console.log(`宇土市 応急修理ガイド: 資料${data.files.length}点のリンクと保存 / 上限額${data.limits.length}件 / 電話${data.tels.length}件 / 必要書類${data.applicantDocuments.length}件 / 期限 OK`);
