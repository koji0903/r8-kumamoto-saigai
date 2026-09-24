// 宇城市 営農再開支援事業（ハード事業）ガイドが市公式ページ・必要書類確認表に準拠しているかを検証するテスト。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const exists = file => fs.existsSync(new URL(`../${file}`, import.meta.url));

// ---- ファイル存在確認 --------------------------------------------------------
for (const file of [
  "uki-einou-saikai.html",
  "uki-einou-saikai.css",
  "uki-einou-saikai.js",
  "ogp-uki-einou-saikai.png",
  "sources/official/subsidy/uki-einou-saikai.txt",
  "sources/official/subsidy/uki-einou-saikai-checklist.txt"
]) {
  assert.ok(exists(file), `${file} が存在しません`);
}

const html = read("uki-einou-saikai.html");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const js = read("uki-einou-saikai.js");

// ---- 基本メタ ---------------------------------------------------------------
assert.match(html, /<title>[^<]*営農再開支援事業[^<]*<\/title>/, "適切なタイトルが設定されていません");
assert.match(html, /<meta\s+name=["']description["']\s+content=["'][^"']+["']/, "descriptionメタタグが設定されていません");

// ---- 公式出典リンク ---------------------------------------------------------
const officialPages = {
  "https://www.city.uki.kumamoto.jp/jigyosha/sangyo/nogyo/2634814": "ハード事業の記事",
  "https://www.city.uki.kumamoto.jp/jigyosha/sangyo/nogyo/2632940": "ソフト事業の記事",
  "https://www.city.uki.kumamoto.jp/jigyosha/sangyo/nogyo/2637693": "農家向けワンストップ窓口の記事",
  "https://www.city.uki.kumamoto.jp/toppage/kinkyu/2621876": "被災農業者のための利子補給の記事"
};
for (const [url, label] of Object.entries(officialPages)) {
  assert.ok(html.includes(url), `${label}へのリンクが含まれていません`);
}
assert.ok(html.includes("https://logoform.jp/form/432130/1800554"), "説明会の申込フォームへのリンクが必要です");
assert.match(text, /2026年9月19日/, "出典の更新日（2026年9月19日）の明記が必要です");
assert.match(text, /農地利用効率化等支援事業/, "国の事業名（農地利用効率化等支援事業 被災農業者支援タイプ）の記載が必要です");

// ---- 補助率（市公表値） -----------------------------------------------------
// 機械・畜舎等（園芸施設共済の加入対象外）9/10、ハウス等（加入対象）7/10、補強7/10、撤去8/10
assert.match(text, /9\/10/, "農業用機械・畜舎等の補助率9/10の記載が必要です");
assert.match(text, /7\/10/, "農業用ハウス等・補強の補助率7/10の記載が必要です");
assert.match(text, /8\/10/, "被災施設等の撤去の補助率8/10の記載が必要です");
assert.match(text, /園芸施設共済/, "園芸施設共済の加入対象かどうかで補助率が分かれる旨の記載が必要です");
assert.match(text, /原形復旧/, "原形復旧が基本である旨の記載が必要です");

// ---- 事前着工・受付状況 -----------------------------------------------------
assert.match(text, /令和8年7月28日/, "事前着工の起算日（令和8年7月28日）の記載が必要です");
assert.match(text, /事前着工/, "事前着工の説明が必要です");
assert.match(text, /準備中/, "受付が準備中である旨の記載が必要です");

// ---- 助成対象者 -------------------------------------------------------------
assert.match(text, /自家消費のみは対象外/, "自家消費のみが対象外である旨の記載が必要です");
assert.match(text, /被災証明書/, "宇城市が発行する被災証明書の要件が必要です");
assert.match(text, /農業経営の維持/, "成果目標（被災農業者の農業経営の維持）の記載が必要です");

// ---- 説明会（4回・事前申込制） ----------------------------------------------
for (const venue of ["ラ・ポート", "豊野支所", "宇城市役所 3階大会議室"]) {
  assert.ok(text.includes(venue), `説明会会場「${venue}」の記載が必要です`);
}
for (const day of ["10月6日", "10月7日", "10月10日"]) {
  assert.ok(text.includes(day), `説明会日程「${day}」の記載が必要です`);
}
assert.match(text, /事前申し込み制|事前申込制/, "説明会が事前申し込み制である旨の記載が必要です");

// ---- 必要書類（確認表の要点） -----------------------------------------------
for (const item of ["修繕不能証明", "建築士等", "メーカー等", "撮影日時", "残存期間", "施設面積"]) {
  assert.ok(text.includes(item), `必要書類の要点「${item}」の記載が必要です`);
}
assert.match(text, /3社以上/, "見積書は原則3社以上である旨の記載が必要です");
assert.match(text, /一式/, "「〇〇工事一式」が不可である旨の記載が必要です");
assert.match(text, /税込/, "事業費は税込みで記入する旨の記載が必要です");
assert.match(text, /農機具共済|民間保険/, "復旧後の共済・保険加入義務の記載が必要です");

// ---- 関連制度・窓口 ---------------------------------------------------------
assert.match(text, /ワンストップ窓口/, "農家向けワンストップ窓口の案内が必要です");
assert.match(text, /0964-32-1641/, "宇城市農政課の電話番号が必要です");
assert.match(text, /0964-32-0351/, "県 宇城地域振興局 農業普及・振興課の電話番号が必要です");

// ---- シミュレーター ---------------------------------------------------------
assert.ok(js.includes("calculate"), "補助額計算ロジック（calculate）がJSに含まれている必要があります");
assert.match(html, /id=["']simMenu["']/, "HTMLに支援メニュー選択（simMenu）が必要です");
assert.match(html, /id=["']simCost["']/, "HTMLに事業費の入力欄（simCost）が必要です");
assert.match(html, /id=["']simOver["']/, "HTMLに原形復旧超過分の入力欄（simOver）が必要です");
for (const value of ["0.9", "0.7", "0.7b", "0.8"]) {
  assert.ok(html.includes(`<option value="${value}"`), `シミュレーターの補助率 ${value} の選択肢が必要です`);
}

// ---- サイト内導線確認 -------------------------------------------------------
const disasterHtml = read("disaster.html");
assert.ok(disasterHtml.includes("uki-einou-saikai.html"), "disaster.html からの導線が必要です");

const agricultureHtml = read("reconstruction-agriculture-fishery.html");
assert.ok(agricultureHtml.includes("uki-einou-saikai.html"), "reconstruction-agriculture-fishery.html からの導線が必要です");

const siteTopics = JSON.parse(read("sources/site-topics.json"));
assert.ok(siteTopics.some(t => t.url === "uki-einou-saikai.html"), "sources/site-topics.json にトピック登録が必要です");

const orgSite = read("org-site.js");
assert.match(orgSite, /'uki-einou-saikai\.html':'[^']+'/, "org-site.js にSEOタイトル登録が必要です");
assert.ok(orgSite.includes("'uki-einou-saikai.html',"), "org-site.js の supportPages への登録が必要です");

const appJs = read("app.js");
assert.ok(appJs.includes("uki-einou-saikai.html"), "app.js の宇城市の支援ページ一覧への登録が必要です");

console.log("宇城市 営農再開支援事業（ハード事業）ガイド: 補助率・対象者・説明会・必要書類・窓口・シミュレーター・導線 OK");
