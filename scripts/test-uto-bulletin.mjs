// 宇土市の災害臨時号を、紙面と違う内容にしないための検査。
//
// 手で書いたページなので、金額・日付・電話番号を写し間違える余地がある。
// PDFから読み取って作ったデータ（data/reconstruction/uto-bulletin-vol1.json）と
// ページを双方向に突き合わせ、
//   ・データにある数値がページから落ちていないか
//   ・ページにデータに無い数値が混ざっていないか（勝手に足していないか）
// の両方を見る。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const data = JSON.parse(read("data/reconstruction/uto-bulletin-vol1.json"));
const html = read("uto-bulletin.html");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// ---- 出典 -------------------------------------------------------------------
assert.match(html, /https:\/\/www\.city\.uto\.lg\.jp\/article\/view\/1310\/16632\.html/, "元の記事へのリンクが必要です");
assert.ok(html.includes(data.source.pdfUrl), "紙面PDFへのリンクが必要です");
assert.match(text, /2026年8月17日/, "発行日を示す必要があります");
assert.match(text, /発行時点/, "発行時点の内容であることの断りが必要です");
assert.match(text, /宇土市の公式サイトではありません/, "公式サイトでないことの明示が必要です");
// 紙面に無いものを作らない
assert.match(text, /紙面に書かれていることだけを載せています/, "何を載せているかの宣言が必要です");
assert.match(text, /二次元コード/, "紙面の二次元コードを再現できないことの断りが必要です");

// ---- 電話番号：データ→ページ、ページ→データ ---------------------------------
const tels = new Set();
const walk = node => {
  if (Array.isArray(node)) return node.forEach(walk);
  if (node && typeof node === "object") {
    for (const tel of node.tels || []) tels.add(tel);
    Object.values(node).forEach(walk);
  }
};
walk(data.sections);
tels.add(data.broadcastPhone.tel);

for (const tel of tels) {
  assert.ok(text.includes(tel), `電話番号 ${tel} がページにありません`);
  // 掛けられる形になっていること
  const href = `tel:${tel.replace(/-/g, "")}`;
  assert.ok(html.includes(href), `電話番号 ${tel} が発信できるリンクになっていません`);
}
// ページ側に、データに無い番号が混ざっていないこと
for (const match of text.matchAll(/0\d{1,3}-\d{2,4}-\d{3,4}/g)) {
  assert.ok(tels.has(match[0]), `ページに紙面から確認していない電話番号 ${match[0]} があります`);
}

// ---- 金額・期限 -------------------------------------------------------------
for (const amount of ["56,400", "757,000", "367,000"]) {
  assert.ok(text.includes(amount), `限度額 ${amount}円 がページにありません`);
}
// 逆に、紙面にない金額を書いていないこと
const KNOWN_AMOUNTS = new Set(["56,400", "757,000", "367,000"]);
for (const match of text.matchAll(/\d{1,3},\d{3}/g)) {
  assert.ok(KNOWN_AMOUNTS.has(match[0]), `ページに紙面から確認していない金額 ${match[0]} があります`);
}
for (const deadline of data.deadlines) {
  const [, month, day] = deadline.date.split("-");
  const printed = `${Number(month)}月${Number(day)}日`;
  assert.ok(text.includes(printed), `期限 ${printed}（${deadline.label}）がページにありません`);
}
// 延長見込みは省略しない（期限だけ見て諦めさせない）
assert.match(text, /※?延長見込み/, "住宅の応急修理の「延長見込み」を落としてはいけません");

// ---- 未定の項目を、決まっているように見せない --------------------------------
const pendingTitles = [];
const collectPending = node => {
  if (Array.isArray(node)) return node.forEach(collectPending);
  if (node && typeof node === "object") {
    if (node.pending && node.title) pendingTitles.push(node.title);
    Object.values(node).forEach(collectPending);
  }
};
collectPending(data.sections);
assert.ok(pendingTitles.length >= 5, `未定の項目が${pendingTitles.length}件しか拾えていません`);
for (const title of pendingTitles) {
  assert.ok(text.includes(title), `「${title}」がページにありません`);
}
assert.match(text, /決まり次第/, "未定であることを紙面の言い方で示す必要があります");
const pendingMarks = (html.match(/bulletin-pending/g) || []).length;
assert.ok(pendingMarks >= 5, `未定の印が${pendingMarks}箇所しかありません`);

// ---- 見落とすと不利になる注意書き --------------------------------------------
for (const warning of [
  "業者に代金を支払ってしまうとこの制度は利用できません",
  "コンビニ交付で証明書を取得する場合には免除の対応が出来ません",
  "廃家電は持ち込みできません",
  "入場券",
  "本人確認書類"
]) {
  assert.ok(text.includes(warning), `注意書き「${warning}」がページにありません`);
}

// ---- 足した言葉と、紙面の言葉を混ぜない --------------------------------------
// 「こんなときに」と絵記号はこちらで付けたもの。紙面の言葉と区別できるよう、
// 付けたことを1か所で断り、見た目も分ける。
assert.match(text, /「こんなときに」と絵記号は、探しやすくするためによか隊ネット熊本が付けたもの/,
  "こちらで足した言葉であることの断りが必要です");
assert.match(text, /制度の内容・金額・期限・電話番号は紙面のとおりで、書き換えていません/,
  "紙面の内容を変えていないことの明示が必要です");
const situations = (html.match(/class="bulletin-situations"/g) || []).length;
assert.equal(situations, data.sections.length, `「こんなときに」が${situations}件で章の数と合いません`);
const icons = (html.match(/class="bulletin-art"/g) || []).length;
assert.equal(icons, data.sections.length, `章のイラストが${icons}件で章の数と合いません`);
// 主要な項目にもイラストを置く
const cardArt = (html.match(/class="bulletin-card-art"/g) || []).length;
assert.ok(cardArt >= 8, `項目のイラストが${cardArt}件しかありません`);
assert.equal((html.match(/class="deadline-art"/g) || []).length, data.deadlines.length,
  "期限それぞれにカレンダーのイラストが必要です");
// イラストは読み上げの対象にしない
for (const match of html.matchAll(/<span class="(?:bulletin-art|bulletin-card-art|deadline-art)"([^>]*)>/g)) {
  assert.match(match[1], /aria-hidden="true"/, "イラストは aria-hidden にしてください");
}
// uto-waste と同じ配色の語彙を使う（宇土市の2ページを揃えるため）
const bulletinCss = read("uto-bulletin.css");
for (const tone of ["art-teal", "art-orange", "art-blue", "art-yellow", "art-slate"]) {
  assert.ok(bulletinCss.includes(`.${tone}{`), `${tone} の配色定義が必要です`);
  assert.ok(html.includes(`class="${tone}"`), `${tone} を使ったイラストがありません`);
}

// ---- 残り日数は、日付を書き換えずに足したものであること ------------------------
const script = read("uto-bulletin.js");
for (const [date] of data.deadlines.map(item => [item.date])) {
  assert.ok(html.includes(`data-deadline="${date}"`), `期限 ${date} に残り日数の目印がありません`);
}
// 過ぎた期限を残っているように見せない
assert.match(script, /期限を過ぎています/, "期限切れの表示が必要です");
assert.match(script, /延長されている場合があるため、担当課へご確認ください/, "期限切れのときの案内が必要です");
assert.match(script, /本日まで/, "当日の表示が必要です");
// いつ時点の計算かを示す
assert.match(script, /時点の計算です/, "残り日数がいつ時点かを示す必要があります");
assert.match(script, /紙面の日付そのものは変えていません/, "日付を変えていないことの明示が必要です");
// JavaScript が無くても日付は読めること（残り日数だけが増えない）
for (const deadline of data.deadlines) {
  const [, month, day] = deadline.date.split("-");
  assert.ok(text.includes(`${Number(month)}月${Number(day)}日`), `${deadline.label} の日付が本文にありません`);
}
assert.ok(!/あと\d+日/.test(html), "残り日数をHTMLに書き込んではいけません（古い日数が残ります）");

// ---- 章 ---------------------------------------------------------------------
for (const section of data.sections) {
  assert.ok(html.includes(`id="${section.id}"`), `${section.label} の章がありません`);
  assert.ok(text.includes(section.label), `${section.label} の見出しがありません`);
}

// ---- 到達性 -----------------------------------------------------------------
const pages = fs.readdirSync(new URL("..", import.meta.url)).filter(file => file.endsWith(".html"));
const inbound = pages.filter(page => page !== "uto-bulletin.html" && read(page).includes('href="uto-bulletin.html'));
assert.ok(inbound.length >= 2, `他ページからのリンクが${inbound.length}件しかありません`);

console.log(`宇土市 災害臨時号vol.1: 章${data.sections.length}（イラスト${icons}＋項目${cardArt}・こんなときに${situations}） / 電話${tels.size}件・限度額3件・期限${data.deadlines.length}件を紙面と一致 / 未定${pendingTitles.length}件を未定として表示 / 導線${inbound.length}ページ OK`);
