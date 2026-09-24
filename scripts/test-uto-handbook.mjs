// 宇土市 被災者支援制度ハンドブック検索ガイドが市公式ハンドブック（令和8年9月24日現在・全69制度）に
// 準拠しているかを検証するテスト。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const exists = file => fs.existsSync(new URL(`../${file}`, import.meta.url));

for (const file of [
  "uto-handbook.html",
  "uto-handbook.css",
  "uto-handbook.js",
  "ogp-uto-handbook.png",
  "sources/official/uto/uto-handbook.txt"
]) {
  assert.ok(exists(file), `${file} が存在しません`);
}

const html = read("uto-handbook.html");
const css = read("uto-handbook.css");
const js = read("uto-handbook.js");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// ---- 基本メタ ---------------------------------------------------------------
assert.match(html, /<title>[^<]*被災者支援制度ハンドブック[^<]*<\/title>/, "適切なタイトルが設定されていません");
assert.match(html, /<meta\s+name=["']description["']\s+content=["'][^"']+["']/, "descriptionメタタグが設定されていません");

// ---- 出典 -------------------------------------------------------------------
const pdf = "https://www.city.uto.lg.jp/d?q=64a2f70ed8565cbae8ab6cc0030be8e7.pdf";
assert.ok(html.includes(pdf), "ハンドブック原本PDFへのリンクが必要です");
assert.match(text, /令和8年9月24日現在/, "ハンドブックの基準日（令和8年9月24日現在）の明記が必要です");
assert.match(text, /75ページ/, "原本のページ数の明記が必要です");

// ---- 制度カードの総数と構造 --------------------------------------------------
const cards = [...html.matchAll(/<article class="uh-card[^"]*"[^>]*>/g)].map(m => m[0]);
assert.equal(cards.length, 69, `制度カードは69件である必要があります（現在 ${cards.length} 件）`);

const ids = [...html.matchAll(/<article class="uh-card[^"]*" id="(p-[^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, 69, "全カードにidが必要です");
assert.equal(new Set(ids).size, 69, "カードidが重複しています");

// すべてのカードが絞り込み用の属性を持つこと
for (const attr of ["data-cat", "data-type", "data-who", "data-damage", "data-noapply", "data-deadline", "data-search"]) {
  const count = cards.filter(card => card.includes(attr)).length;
  assert.equal(count, 69, `${attr} が全カードに必要です（現在 ${count} 件）`);
}

// ---- 分野ごとの件数（ハンドブックの章立てと一致させる） ----------------------
const catCounts = {
  cert: 2, money: 6, house: 8, life: 3, cash: 4, work: 3,
  tax: 17, private: 3, medical: 5, business: 12, other: 6
};
assert.equal(Object.values(catCounts).reduce((a, b) => a + b, 0), 69, "分野別件数の合計が69になりません");
for (const [cat, expected] of Object.entries(catCounts)) {
  const actual = cards.filter(card => card.includes(`data-cat="${cat}"`)).length;
  assert.equal(actual, expected, `分野 ${cat} は${expected}件である必要があります（現在 ${actual} 件）`);
  assert.ok(html.includes(`id="sec-${cat}"`), `分野 ${cat} のセクションが必要です`);
}

// ---- 被害の程度によらず使える制度が53件（ヒーローの数字と一致させる） --------
const anyDamage = cards.filter(card => card.includes('data-damage="any"')).length;
assert.equal(anyDamage, 53, `判定を問わない制度は53件である必要があります（現在 ${anyDamage} 件）`);
assert.match(text, /53\s*件/, "判定を問わず使える制度数（53件）の明記が必要です");
assert.match(text, /69\s*件|全69/, "収録制度数（69件）の明記が必要です");

// ---- 申請不要の制度は2件（市税等の減免・介護保険料の減免） -------------------
const noapply = cards.filter(card => card.includes('data-noapply="1"')).length;
assert.equal(noapply, 2, `申請不要の制度は2件である必要があります（現在 ${noapply} 件）`);
assert.ok(html.includes('id="p-shizei"') && html.includes('id="p-kaigo-hokenryo"'), "申請不要の2制度が必要です");

// ---- 期限のある制度 ---------------------------------------------------------
const withDeadline = cards.filter(card => card.includes('data-deadline="1"')).length;
assert.equal(withDeadline, 11, `期限があり受付中の制度は11件である必要があります（現在 ${withDeadline} 件。期限経過の1件を除く）`);
for (const d of ["9月30日", "10月9日", "10月16日", "10月27日", "11月4日", "12月28日"]) {
  assert.ok(text.includes(d), `期限「${d}」の記載が必要です`);
}

// ---- 主要制度の金額（ハンドブック記載どおり） --------------------------------
const amounts = [
  ["被災者生活再建支援金", "最大100万円"],
  ["被災者生活再建支援金（加算）", "最大200万円"],
  ["災害弔慰金", "500万円"],
  ["災害障害見舞金", "250万円"],
  ["災害援護資金", "350万円"],
  ["住家の緊急修理", "56,400円"],
  ["住宅の応急修理", "757,000円"],
  ["住宅の応急修理（準半壊）", "367,000円"],
  ["みなし仮設（1人）", "5.5万円"],
  ["緊急小口資金", "10万円"],
  ["持続化補助金（直接被害）", "200万円"],
  ["営農再開支援事業", "9/10"]
];
for (const [label, value] of amounts) {
  assert.ok(text.includes(value), `${label} の金額「${value}」の記載が必要です`);
}

// ---- 主要な連絡先 -----------------------------------------------------------
for (const tel of [
  "0964-27-6647", // すまい再建支援室
  "0964-27-3317", // 福祉課 福祉政策係
  "0964-27-3313", // 税務課 市民税係
  "0964-27-3332", // 都市整備課 建築住宅係
  "0964-23-3756", // 社協・災害ボランティアセンター
  "0964-22-5555", // 宇土市商工会
  "0964-27-3325"  // 農林政策課 農林振興係
]) {
  assert.ok(text.includes(tel), `電話番号 ${tel} の記載が必要です`);
  assert.ok(html.includes(`tel:${tel.replace(/-/g, "")}`), `${tel} は tel: リンクにする必要があります`);
}

// ハンドブックと市の電話番号一覧で表記が異なる点を明示していること
assert.match(text, /農林施策課/, "ハンドブックの表記（農林施策課）との差異の注記が必要です");
assert.match(text, /農林政策課/, "市の一覧の表記（農林政策課）を採用している旨が必要です");
assert.match(text, /0964-27-6602/, "被害認定調査室の直通番号の記載が必要です");

// ---- 被災者目線の導線 -------------------------------------------------------
for (const phrase of ["写真", "り災証明書", "被災証明書", "自己判定方式", "土日祝"]) {
  assert.ok(text.includes(phrase), `被災者向けの案内に「${phrase}」が必要です`);
}
assert.ok(html.includes('id="finder"'), "絞り込みセクションが必要です");
assert.ok(html.includes('id="deadline"'), "期限セクションが必要です");
assert.ok(html.includes('id="directory"'), "担当課の電話番号一覧が必要です");

// ---- 絞り込みUIとJS ---------------------------------------------------------
for (const id of ["fDamage", "fCat", "fType", "fWho", "fSearch", "fDeadline", "fNoapply", "fReset", "fCount"]) {
  assert.ok(html.includes(`id="${id}"`), `絞り込み要素 ${id} が必要です`);
  assert.ok(js.includes(id), `JSで ${id} を扱う必要があります`);
}
assert.ok(js.includes("damageMatches"), "り災判定による絞り込みロジックが必要です");
// 入力内容を保存・送信しない
for (const forbidden of ["localStorage", "sessionStorage", "document.cookie", "gtag(", "dataLayer", "fetch("]) {
  assert.ok(!js.includes(forbidden), `${forbidden} で入力内容を保存・送信しないでください`);
}

// ---- アクセシビリティ・印刷・モバイル ---------------------------------------
assert.match(css, /@media print/, "印刷用スタイルが必要です");
assert.match(css, /max-width:\s*768px/, "モバイル用スタイルが必要です");
assert.match(css, /:focus-visible/, "フォーカス表示のスタイルが必要です");
assert.match(html, /aria-live="polite"/, "件数表示にaria-liveが必要です");

// ---- サイト内導線 -----------------------------------------------------------
const siteTopics = JSON.parse(read("sources/site-topics.json"));
assert.ok(siteTopics.some(t => t.url === "uto-handbook.html"), "sources/site-topics.json にトピック登録が必要です");

const orgSite = read("org-site.js");
assert.match(orgSite, /'uto-handbook\.html':'[^']+'/, "org-site.js にSEOタイトル登録が必要です");
assert.ok(orgSite.includes("'uto-handbook.html',"), "org-site.js の supportPages への登録が必要です");

const appJs = read("app.js");
assert.ok(appJs.includes("uto-handbook.html"), "app.js の宇土市の支援ページ一覧への登録が必要です");

const disasterHtml = read("disaster.html");
assert.ok(disasterHtml.includes("uto-handbook.html"), "disaster.html からの導線が必要です");

console.log("宇土市 被災者支援制度ハンドブック検索ガイド: 全69制度・11分野・判定53件・期限・申請不要・連絡先・絞り込み・導線 OK");
