// よか隊ネット熊本への寄付口座情報および連絡先注意書きが正確に掲載されているかを検証するテスト。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

// ---- 1. join.html の検証 ----------------------------------------------------
const joinHtml = read("join.html");
const joinText = joinHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// 肥後銀行
assert.match(joinText, /肥後銀行/, "join.html: 肥後銀行の記載が必要です");
assert.match(joinText, /小峯支店/, "join.html: 小峯支店の記載が必要です");
assert.match(joinText, /170/, "join.html: 店番号170の記載が必要です");
assert.match(joinText, /499035/, "join.html: 口座番号499035の記載が必要です");
assert.match(joinText, /一般社団法人\s*よか隊ネット熊本\s*代表理事\s*土黒\s*功司/, "join.html: 肥後銀行の口座名義が必要です");

// ゆうちょ銀行
assert.match(joinText, /ゆうちょ銀行/, "join.html: ゆうちょ銀行の記載が必要です");
assert.match(joinText, /17190/, "join.html: ゆうちょ記号17190の記載が必要です");
assert.match(joinText, /39339331/, "join.html: ゆうちょ番号39339331の記載が必要です");
assert.match(joinText, /七一八/, "join.html: ゆうちょ他行店名「七一八」の記載が必要です");
assert.match(joinText, /718/, "join.html: ゆうちょ店番718の記載が必要です");
assert.match(joinText, /3933933/, "join.html: ゆうちょ他行口座番号3933933の記載が必要です");
assert.match(joinText, /シャ）ヨカタイネットクマモト/, "join.html: ゆうちょ通帳表記の記載が必要です");

// メール連絡の注意書き
assert.match(joinText, /info\.yokatai@gmail\.com/, "join.html: 連絡先メールアドレスの記載が必要です");
assert.match(joinText, /振込.*ご連絡|連絡.*お願い/, "join.html: 寄付後メール連絡のお願いが必要です");

// ---- 2. supporters.html の検証 ----------------------------------------------
const supportersHtml = read("supporters.html");
const supportersText = supportersHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

assert.match(supportersText, /肥後銀行/, "supporters.html: 肥後銀行の記載が必要です");
assert.match(supportersText, /499035/, "supporters.html: 肥後銀行口座番号が必要です");
assert.match(supportersText, /ゆうちょ銀行/, "supporters.html: ゆうちょ銀行の記載が必要です");
assert.match(supportersText, /39339331|3933933/, "supporters.html: ゆうちょ口座番号が必要です");
assert.match(supportersText, /info\.yokatai@gmail\.com/, "supporters.html: 連絡先メールが必要です");

// ---- 3. 各ページからの導線検証 ----------------------------------------------
const aboutHtml = read("about.html");
assert.ok(aboutHtml.includes("join.html#donation") || aboutHtml.includes("ご寄付"), "about.html: 寄付への導線が必要です");

const disasterHtml = read("disaster.html");
assert.ok(disasterHtml.includes("join.html#donation"), "disaster.html: 寄付への導線が必要です");

const contactHtml = read("contact.html");
assert.ok(contactHtml.includes("join.html#donation") || contactHtml.includes("寄付"), "contact.html: 寄付に関する記述が必要です");

console.log("寄付口座情報テスト: 肥後銀行 / ゆうちょ銀行（2方式） / メール連絡注意書き / 導線 OK");
