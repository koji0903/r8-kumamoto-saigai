// 八代市 災害援護資金貸付ガイドの整合性検査
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const html = read("yatsushiro-loan.html");
const js = read("yatsushiro-loan.js");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// 1. 公式ページおよび添付Excelファイルリンクの検査
const officialUrls = [
  "https://www.city.yatsushiro.lg.jp/bousai/kiji00324914/index.html",
  "https://www.city.yatsushiro.lg.jp/bousai/kiji00324914/3_24914_158539_up_mvkt7ihv.xlsx"
];

for (const url of officialUrls) {
  assert.ok(html.includes(url), `公式URL ${url} へのリンクがありません`);
}

// 2. 重要な制度数値（限度額・金利・期間・期限・電話番号）の検査
assert.ok(html.includes("350万円"), "最大貸付限度額350万円の記載が必要です");
assert.ok(html.includes("無利子"), "無利子条件の記載が必要です");
assert.ok(html.includes("1.0％") || html.includes("1%"), "通常年利1.0%の記載が必要です");
assert.ok(html.includes("据置期間"), "据置期間（3年/5年）の記載が必要です");
assert.ok(html.includes("10年"), "償還期間（10年）の記載が必要です");
assert.ok(html.includes("令和8年11月2日"), "申請期限（令和8年11月2日）の記載が必要です");
assert.ok(html.includes("0965-33-4003"), "健康福祉政策課の電話番号が必要です");
assert.ok(html.includes("tel:0965334003"), "健康福祉政策課への発信リンクが必要です");

// 3. 重要要件・ルールの記載確認（所得基準、住居滅失特例、保証人要件、返済義務等）
assert.ok(text.includes("貸付金"), "返済義務がある貸付金であることの明記が必要です");
assert.ok(text.includes("1,270万円") || text.includes("1270万円"), "住居滅失時の特例所得限度額（1,270万円）の記載が必要です");
assert.ok(text.includes("220万円"), "単身所得基準（220万円）の記載が必要です");
assert.ok(text.includes("430万円"), "2人世帯所得基準（430万円）の記載が必要です");
assert.ok(text.includes("620万円"), "3人世帯所得基準（620万円）の記載が必要です");
assert.ok(text.includes("730万円"), "4人世帯所得基準（730万円）の記載が必要です");

// 4. JavaScriptシミュレーターのデータ整合性
assert.ok(js.includes("INCOME_LIMITS"), "シミュレーター内に所得限度額定義が必要です");
assert.ok(js.includes("calculateLoan"), "シミュレーター計算関数が必要です");
assert.ok(js.includes("maxAmount"), "限度額計算が必要です");
assert.ok(js.includes("1270") || js.includes("1,270"), "滅失特例がJS内に定義されている必要があります");

// 5. 相互リンク整合性
assert.ok(html.includes('href="yatsushiro-support.html"'), "yatsushiro-support.html への導線が必要です");
assert.ok(html.includes('href="yatsushiro-rebuild.html"'), "yatsushiro-rebuild.html への導線が必要です");

const yatsushiroSupport = read("yatsushiro-support.html");
assert.ok(yatsushiroSupport.includes("yatsushiro-loan.html"), "yatsushiro-support.html から本ガイドへのリンクが必要です");

const moneyPage = read("reconstruction-money.html");
assert.ok(moneyPage.includes("yatsushiro-loan.html"), "reconstruction-money.html から本ガイドへのリンクが必要です");

const siteTopics = JSON.parse(read("sources/site-topics.json"));
assert.ok(siteTopics.some(t => t.url === "yatsushiro-loan.html"), "sources/site-topics.json に yatsushiro-loan.html が登録されている必要があります");

console.log("八代市 災害援護資金貸付ガイド検査 OK");
