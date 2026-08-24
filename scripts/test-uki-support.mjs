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
assert.match(text, /内容は変更される場合/);
assert.match(text, /宇城市の公式情報を読みやすく整理/);
assert.match(text, /対象可否を独自に判定するページではありません/);

for (const id of ["quick-damage", "first-steps", "damage-guide", "housing", "money", "daily-life", "cleanup", "contacts"]) {
  assert.ok(html.includes(`id="${id}"`), `${id} の章がありません`);
}
for (const title of ["罹災証明書", "被災者生活再建支援金", "被災住宅の緊急修理", "被災住宅の応急修理", "賃貸型応急住宅", "建設型応急住宅", "公費解体", "災害ごみ仮置場", "医療費の窓口負担", "介護サービス利用料"]) {
  assert.ok(text.includes(title), `${title} がありません`);
}
for (const warning of ["工事契約・支払い・解体の前に相談してください", "準備中", "罹災証明書の提示は不要", "食費・居住費は対象外"]) {
  assert.ok(text.includes(warning), `重要な注意「${warning}」がありません`);
}
assert.equal((html.match(/<ol class="uki-all-menus">[\s\S]*?<\/ol>/)?.[0].match(/<li>/g) || []).length, 36, "全36制度を一覧に残す必要があります");
assert.ok((html.match(/href="tel:/g) || []).length >= 16, "電話リンクが不足しています");
assert.ok((html.match(/city\.uki\.kumamoto\.jp/g) || []).length >= 13, "宇城市の個別制度ページと2つのPDFへのリンクが必要です");
for (const damage of ["全壊", "大規模半壊", "中規模半壊", "半壊", "準半壊", "一部損壊"]) assert.ok(text.includes(damage), `${damage} の判定案内がありません`);
for (const id of ["damage-full", "damage-large", "damage-middle", "damage-half", "damage-semi", "damage-minor"]) assert.ok(html.includes(`id="${id}"`), `${id} のスマホ向け判定カードがありません`);
for (const amount of ["56,400円", "757,000円", "367,000円", "148,600円", "300万円", "13か月以内", "37か月以内"]) assert.ok(text.includes(amount), `${amount} の金額・期限情報がありません`);
for (const document of ["施工前写真", "修理見積書", "マニフェスト", "罹災証明書の写し", "本人確認書類"]) assert.ok(text.includes(document), `${document} の必要書類案内がありません`);
assert.equal((html.match(/class="uki-damage-table"/g) || []).length, 1, "被害判定別比較表が必要です");
assert.ok((html.match(/class="uki-official-link"/g) || []).length >= 10, "制度別の公式リンクが不足しています");
assert.match(app, /selectedMunicipality==="宇城市"[\s\S]*uki-support\.html/);
assert.match(reconstruction, /rebuild-uki-entry[\s\S]*uki-support\.html/);
assert.match(reconstructionJs, /slug==="uki"[\s\S]*rebuild-uki-entry/);
assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /@media\(max-width:760px\)[\s\S]*\.uki-table-scroll\{display:none\}/, "スマホでは横長表より判定カードを優先してください");
assert.match(css, /@media print/);
assert.doesNotMatch(`${html}\n${css}`, /localStorage|sessionStorage|document\.cookie|fetch\(/);

const pages = fs.readdirSync(new URL("..", import.meta.url)).filter(file => file.endsWith(".html"));
const inbound = pages.filter(page => page !== "uki-support.html" && read(page).includes('href="uki-support.html'));
assert.ok(inbound.length >= 1, "別ページから宇城市支援ガイドへ到達できません");

console.log(`宇城市 被災者支援制度ガイド: 36制度 / 6判定 / 個別公式リンク${(html.match(/class="uki-official-link"/g) || []).length}件 / 電話${(html.match(/href="tel:/g) || []).length}件 / 導線${inbound.length}ページ OK`);
