import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const html = read("uki-support.html");
const css = read("uki-support.css");
const app = read("app.js");
const reconstruction = read("reconstruction.html");
const reconstructionJs = read("reconstruction.js");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

assert.match(html, /<title>[^<]+<\/title>/);
assert.match(html, /<meta name="description" content="[^"]+">/);
assert.match(text, /令和8年8月19日現在/);
assert.match(text, /支援内容・実施予定日・受付場所は変更になる場合/);

for (const id of ["certificates", "housing", "money", "health", "cleanup", "reductions", "contacts"]) {
  assert.ok(html.includes(`id="${id}"`), `${id} の章がありません`);
}
for (const title of ["罹災証明書", "被災者生活再建支援金", "被災住宅の緊急修理", "被災住宅の応急修理", "賃貸型応急住宅", "建設型応急住宅", "公費解体", "災害ごみ仮置場", "医療費の窓口負担", "介護サービス利用料"]) {
  assert.ok(text.includes(title), `${title} がありません`);
}
for (const warning of ["先に自分で業者へ依頼・支払いをしないでください", "現在準備中", "罹災証明書の提示は不要", "食費・居住費は対象外"]) {
  assert.ok(text.includes(warning), `重要な注意「${warning}」がありません`);
}
assert.equal((html.match(/<ol class="uki-all-menus">[\s\S]*?<\/ol>/)?.[0].match(/<li>/g) || []).length, 36, "全36制度を一覧に残す必要があります");
assert.ok((html.match(/href="tel:/g) || []).length >= 16, "電話リンクが不足しています");
assert.ok((html.match(/city\.uki\.kumamoto\.jp/g) || []).length >= 3, "宇城市の公式ページと2つのPDFへのリンクが必要です");
assert.match(app, /selectedMunicipality==="宇城市"[\s\S]*uki-support\.html/);
assert.match(reconstruction, /rebuild-uki-entry[\s\S]*uki-support\.html/);
assert.match(reconstructionJs, /slug==="uki"[\s\S]*rebuild-uki-entry/);
assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /@media print/);
assert.doesNotMatch(`${html}\n${css}`, /localStorage|sessionStorage|document\.cookie|fetch\(/);

const pages = fs.readdirSync(new URL("..", import.meta.url)).filter(file => file.endsWith(".html"));
const inbound = pages.filter(page => page !== "uki-support.html" && read(page).includes('href="uki-support.html'));
assert.ok(inbound.length >= 1, "別ページから宇城市支援ガイドへ到達できません");

console.log(`宇城市 被災者支援制度ガイド: 36制度 / 6入口 / 公式資料3リンク / 電話${(html.match(/href="tel:/g) || []).length}件 / 導線${inbound.length}ページ OK`);
