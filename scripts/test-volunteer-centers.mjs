// 災害ボランティアセンターの発信が、出所を偽らずに載ることを守る。
//
// 災害VCを運営するのは市町村社会福祉協議会で、市町村役場とは別の組織・別の
// ドメイン。両方の発信を1枚のカードに並べる以上、どちらが出したものかを
// 画面で区別できなければならない。また、記事が集まらなかった災害VCを
// 「募集していない」と読ませないための退避先も欠かせない。
import assert from "node:assert/strict";
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../sources/official/volunteer-centers/volunteer-center-updates.json", import.meta.url), "utf8"));
const generated = fs.readFileSync(new URL("../data/generated/volunteer-center-updates.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../volunteer-centers.html", import.meta.url), "utf8");
const code = fs.readFileSync(new URL("../volunteer-centers.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../volunteer-centers.css", import.meta.url), "utf8");
const collector = fs.readFileSync(new URL("../tools/fetch-volunteer-centers.mjs", import.meta.url), "utf8");

// ---- 収集データ -------------------------------------------------------------
assert.ok(data.councils?.length >= 11, `社協が${data.councils?.length}件しかありません`);
assert.match(data.note, /表題・日付・URL/, "何を収集しているかの但し書きが必要です");

for (const council of data.councils) {
  assert.ok(council.municipality && council.name, "社協には市町村名と名称が必要です");
  assert.match(council.url, /^https?:\/\//, `${council.name}: 公式サイトのURLが必要です`);
  // URLを推測で書いていないことの担保。確認日を残す運用にしている。
  assert.match(council.confirmedAt, /^\d{4}-\d{2}-\d{2}$/, `${council.name}: URLの確認日が必要です`);
  const origin = new URL(council.url).hostname;
  for (const update of council.updates) {
    assert.match(update.date, /^2026-(07|08|09|10|11|12)-\d{2}$/, `${council.name}: 日付が不正です（${update.date}）`);
    assert.ok(update.date >= data.disasterDate, `${council.name}: 発災前の記事が混ざっています（${update.title}）`);
    assert.ok(update.title.trim().length >= 4, `${council.name}: 表題が短すぎます（${update.title}）`);
    // 表題の頭が欠けていないこと（区分ラベルの除去が本文を削った事故があった）
    assert.ok(!/^(?:ンティ|ンテイ|ランテ|ィア)/u.test(update.title), `${council.name}: 表題の先頭が欠けています（${update.title}）`);
    assert.doesNotMatch(update.title, /&#x?[0-9a-f]+;/i, `${council.name}: 実体参照が残っています（${update.title}）`);
    // 他の災害の救援金募集を今回の発信として並べない
    assert.doesNotMatch(update.title, /ベネズエラ|ミャンマー|トルコ|能登|東日本|平成28年/u, `${council.name}: 他災害の記事です（${update.title}）`);
    const host = new URL(update.url).hostname;
    assert.ok(host === origin || host.endsWith(`.${origin}`), `${council.name}: 社協サイト外のURLです（${update.url}）`);
  }
}

// 実際に発信を拾えている社協が大半であること（収集器が壊れたら気づけるように）
const withUpdates = data.councils.filter(council => council.updates.length > 0);
assert.ok(withUpdates.length >= 10, `発信を取得できた社協が${withUpdates.length}件しかありません`);
const total = data.councils.reduce((sum, council) => sum + council.updates.length, 0);
assert.ok(total >= 40, `収集件数が${total}件しかありません`);

// ---- 生成物 -----------------------------------------------------------------
assert.match(generated, /^\/\/ 生成物・直接編集しない/, "生成物である旨の注記が必要です");
assert.match(generated, /window\.VOLUNTEER_CENTER_UPDATES = /, "window に載せる作法に合わせる必要があります");
assert.match(html, /data\/generated\/volunteer-center-updates\.js/, "ページが収集データを読み込んでいません");

// ---- 表示 -------------------------------------------------------------------
// 社協の発信と市町村の発信を混ぜたまま出所を隠さないこと
assert.match(code, /from: "council"/, "社協の発信に出所の印が必要です");
assert.match(code, /from: "municipality"/, "市町村の発信に出所の印が必要です");
assert.match(code, /vc-update-from/, "出所を画面に出す必要があります");
assert.match(css, /\.vc-update-from\.is-council/, "社協の発信を見分けられる装飾が必要です");

// 記事が無い災害VCを「募集なし」と読ませないこと
assert.match(code, /募集がないという意味ではありません/, "未収集の断り書きが必要です");
assert.match(code, /councilLink/, "未収集のときに社協サイトへ逃がす必要があります");

// 収集していないもの（本文）を書かないこと
assert.match(collector, /本文の要約や転載は行わない/, "収集範囲の宣言が必要です");
for (const council of data.councils) {
  for (const update of council.updates) {
    assert.deepEqual(Object.keys(update).sort(), ["date", "title", "url"],
      `${council.name}: 表題・日付・URL以外を保存しています（${update.title}）`);
  }
}

console.log(`災害VC: ${data.councils.length}社協 / 発信${total}件 / 発信を取得できた社協${withUpdates.length}件 — OK`);
