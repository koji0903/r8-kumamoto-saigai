// 八代市 セーフティネット保証4号利用ガイドの整合性検査
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const html = read("yatsushiro-safetynet4.html");
const js = read("yatsushiro-safetynet4.js");
const css = read("yatsushiro-safetynet4.css");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// 1. 公式ページおよび添付様式・資料リンクの検査
const officialUrls = [
  "https://www.city.yatsushiro.lg.jp/kiji00326866/index.html",
  "https://www.city.yatsushiro.lg.jp/kiji00326866/3_26866_158086_up_dri55ug6.pdf", // 様式4-①
  "https://www.city.yatsushiro.lg.jp/kiji00326866/3_26866_158087_up_0wbdxb04.pdf", // 様式4-②
  "https://www.city.yatsushiro.lg.jp/kiji00326866/3_26866_158088_up_4ocnokk1.pdf", // 様式4-③
  "https://www.city.yatsushiro.lg.jp/kiji00326866/3_26866_158083_up_hsm1gq8w.xls",  // 月別売上表
  "https://www.city.yatsushiro.lg.jp/kiji00326866/3_26866_158084_up_hsm1gq8w.pdf", // 委任状
  "https://www.chusho.meti.go.jp/kinyu/sefu_net_4gou.html"                         // 中小企業庁
];

for (const url of officialUrls) {
  assert.ok(html.includes(url), `公式URL ${url} へのリンクがありません`);
}

// 2. 重要な制度数値（保証割合・限度額・期間・要件・電話番号）の検査
assert.ok(html.includes("100％") || html.includes("100%"), "保証割合100%の記載が必要です");
assert.ok(html.includes("8,000万円") || html.includes("8000万円"), "無担保8,000万円別枠の記載が必要です");
assert.ok(html.includes("令和8年12月17日"), "八代市指定期間（令和8年12月17日）の記載が必要です");
assert.ok(html.includes("30日間") || html.includes("30日"), "認定書有効期間30日間の記載が必要です");
assert.ok(html.includes("20％") || html.includes("20%"), "売上減少要件20%以上の記載が必要です");
assert.ok(html.includes("0965-33-8513"), "商工政策課の電話番号が必要です");
assert.ok(html.includes("tel:0965338513"), "商工政策課への発信リンクが必要です");

// 3. 制度の本質解説と注意事項
assert.ok(text.includes("信用保証協会"), "信用保証協会の説明が必要です");
assert.ok(text.includes("別枠"), "一般保証とは別枠であることの明記が必要です");
assert.ok(text.includes("融資決定") || text.includes("融資の審査"), "市の認定＝融資決定ではないことの注記が必要です");
assert.ok(text.includes("経済産業") || text.includes("中小企業庁"), "国による地域指定の説明が必要です");
assert.ok(text.includes("19市町"), "熊本県内19市町が指定地域となった背景の説明が必要です");
assert.ok(text.includes("メインバンク") || text.includes("金融機関"), "金融機関への事前相談の推奨が必要です");

// 4. JavaScriptシミュレーターとCSSスタイル
assert.ok(js.includes("simPattern"), "シミュレーター内にパターン切り替えロジックが必要です");
assert.ok(js.includes("rateRecent"), "最近1か月の減少率計算が必要です");
assert.ok(js.includes("rate3Months"), "3か月全体の減少率計算が必要です");
assert.ok(js.includes("様式4-①") && js.includes("様式4-②") && js.includes("様式4-③"), "各様式の推薦ロジックが必要です");
assert.ok(css.includes(".safetynet-page"), "CSSにsafetynet-pageのスタイル定義が必要です");

// 5. サイト内相互リンクの検査
assert.ok(html.includes('href="yatsushiro-support.html"'), "yatsushiro-support.html への導線が必要です");
assert.ok(html.includes('href="yatsushiro-loan.html"'), "yatsushiro-loan.html への導線が必要です");
assert.ok(html.includes('href="uto-jizokuka.html"'), "uto-jizokuka.html への導線が必要です");

const yatsushiroSupport = read("yatsushiro-support.html");
assert.ok(yatsushiroSupport.includes("yatsushiro-safetynet4.html"), "yatsushiro-support.html から本ガイドへのリンクが必要です");

const workBusiness = read("reconstruction-work-business.html");
assert.ok(workBusiness.includes("yatsushiro-safetynet4.html"), "reconstruction-work-business.html から本ガイドへのリンクが必要です");

const utoJizokuka = read("uto-jizokuka.html");
assert.ok(utoJizokuka.includes("yatsushiro-safetynet4.html"), "uto-jizokuka.html から本ガイドへのリンクが必要です");

const prioritySupport = read("priority-support-summary.html");
assert.ok(prioritySupport.includes("yatsushiro-safetynet4.html"), "priority-support-summary.html から本ガイドへのリンクが必要です");

const siteTopics = JSON.parse(read("sources/site-topics.json"));
assert.ok(siteTopics.some(t => t.url === "yatsushiro-safetynet4.html"), "sources/site-topics.json に yatsushiro-safetynet4.html が登録されている必要があります");

console.log("八代市 セーフティネット保証4号ガイド検査 OK");
