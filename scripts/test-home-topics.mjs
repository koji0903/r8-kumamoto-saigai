import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const exists = file => fs.existsSync(new URL(`../${file}`, import.meta.url));

const indexHtml = read("index.html");
const siteTopicsRaw = read("sources/site-topics.json");
const homeTopicsJs = read("data/generated/home-topics.js");

// 1. sources/site-topics.json の検査
const siteTopics = JSON.parse(siteTopicsRaw);
assert.ok(Array.isArray(siteTopics) && siteTopics.length >= 5, "sources/site-topics.json に5件以上の更新トピックスが必要です");
for (const item of siteTopics) {
  assert.ok(item.date, "date が必要です");
  assert.ok(item.category, "category が必要です");
  assert.ok(item.title, "title が必要です");
  assert.ok(item.url, "url が必要です");
  assert.ok(item.description, "description が必要です");
  assert.ok(item.targetPage, "targetPage が必要です");
  assert.ok(exists(item.targetPage), `対象ページ ${item.targetPage} が存在しません`);
}

// 2. index.html 内のトピックスセクションの検査
assert.ok(indexHtml.includes('class="home-topics-v2"'), "index.html に home-topics-v2 セクションがありません");
assert.ok(indexHtml.includes('id="home-topics-title"'), "home-topics-title がありません");
assert.ok(indexHtml.includes('class="home-topic-card"'), "サイト更新カードがありません");
assert.ok(indexHtml.includes('class="home-official-card"'), "自治体公式発表カードがありません");

const siteCards = indexHtml.match(/class="home-topic-card"/g) || [];
assert.equal(siteCards.length, 10, `サイト更新カードは最新10件である必要があります（現在${siteCards.length}件）`);

const officialCards = indexHtml.match(/class="home-official-card"/g) || [];
assert.equal(officialCards.length, 15, `自治体発表カードは最新15件である必要があります（現在${officialCards.length}件）`);

// 3. 各カードの要素検証
assert.ok(indexHtml.includes('class="home-topic-meta"'), "home-topic-meta がありません");
assert.ok(indexHtml.includes('class="home-topic-title"'), "home-topic-title がありません");
assert.ok(!indexHtml.includes('class="home-topic-desc"'), "概要説明（home-topic-desc）は非表示である必要があります");
assert.ok(indexHtml.includes('class="home-official-muni"'), "home-official-muni がありません");

// 4. data/generated/home-topics.js の構文・構造検証
const sandboxWindow = {};
new Function("window", homeTopicsJs)(sandboxWindow);
assert.ok(sandboxWindow.HOME_TOPICS, "window.HOME_TOPICS が定義されていません");
assert.ok(Array.isArray(sandboxWindow.HOME_TOPICS.siteTopics), "HOME_TOPICS.siteTopics が配列ではありません");
assert.equal(sandboxWindow.HOME_TOPICS.siteTopics.length, 10, `siteTopics は最新10件である必要があります（現在${sandboxWindow.HOME_TOPICS.siteTopics.length}件）`);
assert.ok(Array.isArray(sandboxWindow.HOME_TOPICS.municipalityUpdates), "HOME_TOPICS.municipalityUpdates が配列ではありません");
assert.equal(sandboxWindow.HOME_TOPICS.municipalityUpdates.length, 15, `municipalityUpdates は15件である必要があります（現在${sandboxWindow.HOME_TOPICS.municipalityUpdates.length}件）`);

console.log(`トップページ トピックス検査: サイト更新${siteCards.length}件 / 自治体収集${officialCards.length}件 / 生成物・リンク整合性 OK`);
