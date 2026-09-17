// 八代市 被災者生活再建支援金ガイドの整合性検査
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const html = read("yatsushiro-rebuild.html");
const js = read("yatsushiro-rebuild.js");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// 1. 公式ページおよび添付PDFリンクの検査
const officialUrls = [
  "https://www.city.yatsushiro.lg.jp/bousai/kiji00324854/index.html",
  "https://www.city.yatsushiro.lg.jp/bousai/kiji00324854/3_24854_143539_up_ccqwa3jo.pdf",
  "https://www.city.yatsushiro.lg.jp/bousai/kiji00324854/3_24854_143540_up_tbxqgj6s.pdf",
  "https://www.city.yatsushiro.lg.jp/bousai/kiji00324854/3_24854_143541_up_y2cuhz7u.pdf",
  "https://www.city.yatsushiro.lg.jp/bousai/kiji00324854/3_24854_143542_up_qheqpm0t.pdf",
  "https://www.tkai.jp/reconstruction/tabid/82/Default.aspx"
];

for (const url of officialUrls) {
  assert.ok(html.includes(url), `公式URL ${url} へのリンクがありません`);
}

// 2. 重要な制度数値（上限額・期間・電話番号）の検査
assert.ok(html.includes("300万円"), "最大支給額300万円の記載が必要です");
assert.ok(html.includes("225万円"), "単数世帯最大支給額225万円の記載が必要です");
assert.ok(html.includes("13か月"), "基礎支援金期限（13か月）の記載が必要です");
assert.ok(html.includes("37か月"), "加算支援金期限（37か月）の記載が必要です");
assert.ok(html.includes("0965-33-8722"), "生活援護課直通電話番号が必要です");
assert.ok(html.includes("tel:0965338722"), "生活援護課への発信リンクが必要です");

// 3. 重要ルールの記載確認（半壊解体、借家対象、大家対象外、非課税、マイナンバー省略等）
assert.ok(text.includes("全部解体"), "半壊解体の全部解体ルールが必要です");
assert.ok(text.includes("解体工事の前に"), "解体工事前の事前相談の注意喚起が必要です");
assert.ok(text.includes("確定申告"), "確定申告不要（非課税）の記載が必要です");
assert.ok(text.includes("マイナンバー"), "マイナンバーによる添付省略の案内が必要です");
assert.ok(text.includes("公金受取口座"), "公金受取口座利用の案内が必要です");

// 4. JavaScriptシミュレーターのデータ整合性
assert.ok(js.includes("AMOUNTS"), "シミュレーター内に金額定義が必要です");
assert.ok(js.includes("full: { base: 100"), "全壊基礎100万円の定義が必要です");
assert.ok(js.includes("full: { base: 75"), "全壊単身基礎75万円の定義が必要です");
assert.ok(js.includes("demolish:"), "解体世帯の定義が必要です");
assert.ok(js.includes("middle:"), "中規模半壊の定義が必要です");

// 5. 相互リンク整合性
assert.ok(html.includes('href="yatsushiro-support.html"'), "yatsushiro-support.html への導線が必要です");
assert.ok(html.includes('href="municipalities.html?name=八代市"'), "八代市ダッシュボードへの導線が必要です");

const yatsushiroSupport = read("yatsushiro-support.html");
assert.ok(yatsushiroSupport.includes("yatsushiro-rebuild.html"), "yatsushiro-support.html から本ガイドへのリンクが必要です");

const siteTopics = JSON.parse(read("sources/site-topics.json"));
assert.ok(siteTopics.some(t => t.url === "yatsushiro-rebuild.html"), "sources/site-topics.json に yatsushiro-rebuild.html が登録されている必要があります");

console.log("八代市 被災者生活再建支援金ガイド検査 OK");
