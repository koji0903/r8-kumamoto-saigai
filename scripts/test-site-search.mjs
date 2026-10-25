import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

// 1. site-search-index.json の検証
const indexPath = path.join(root, "public-data/site-search-index.json");
const indexData = JSON.parse(await readFile(indexPath, "utf8"));

assert.equal(indexData.version, 2, "インデックスのバージョンは2であること");
assert.ok(indexData.count >= 70, `インデックス件数が70件以上であること（実際: ${indexData.count}）`);
assert.equal(indexData.items.length, indexData.count, "items長とcountが一致すること");

for (const item of indexData.items) {
  assert.ok(item.url, "urlが存在すること");
  assert.ok(item.title, `titleが存在すること: ${item.url}`);
  assert.ok(item.description, `descriptionが存在すること: ${item.url}`);
  assert.ok(item.category, `categoryが存在すること: ${item.url}`);
  assert.ok(item.area, `areaが存在すること: ${item.url}`);
  assert.ok(typeof item.priority === "number", `priorityが数値であること: ${item.url}`);
  assert.ok(Array.isArray(item.headings), `headingsが配列であること: ${item.url}`);
}

// 2. 代表的ページのカテゴリ・エリア検証
const wellRepair = indexData.items.find(i => i.url === "yatsushiro-well-repair.html");
assert.ok(wellRepair, "yatsushiro-well-repair.htmlがインデックスに存在すること");
assert.equal(wellRepair.area, "八代市");
assert.equal(wellRepair.category, "住まい・解体");

const compare = indexData.items.find(i => i.url === "municipality-support-compare.html");
assert.ok(compare, "municipality-support-compare.htmlがインデックスに存在すること");
assert.equal(compare.category, "支援制度・お金");

const shelters = indexData.items.find(i => i.url === "shelters.html");
assert.ok(shelters, "shelters.htmlがインデックスに存在すること");
assert.equal(shelters.category, "被害・避難所");

const meetings = indexData.items.find(i => i.url === "meetings.html");
assert.ok(meetings, "meetings.htmlがインデックスに存在すること");
assert.equal(meetings.category, "日々の記録・会議");

const vc = indexData.items.find(i => i.url === "volunteer-centers.html");
assert.ok(vc, "volunteer-centers.htmlがインデックスに存在すること");
assert.equal(vc.category, "支援活動・VC");

// 3. site-search.js のUI要素・同義語チェック
const jsContent = await readFile(path.join(root, "site-search.js"), "utf8");
for (const term of [
  "data-site-search-open",
  "site-search-dialog",
  "site-search-filter-tabs",
  "site-search-chips",
  "site-search-intent-cards",
  "どんな支援",
  "現在の状況",
  "支援状況",
  "八代",
  "井戸",
  "公費修理",
  "公費解体"
]) {
  assert.ok(jsContent.includes(term), `site-search.jsに「${term}」が含まれていること`);
}

// 4. site-search.css のレスポンシブ・スタイルチェック
const cssContent = await readFile(path.join(root, "site-search.css"), "utf8");
for (const style of [
  ".site-search-dialog",
  ".site-search-filter-tabs",
  ".site-search-chips",
  ".site-search-card",
  ".cat-money",
  ".cat-house",
  ".cat-shelter",
  "@media"
]) {
  assert.ok(cssContent.includes(style), `site-search.cssに「${style}」が含まれていること`);
}

console.log("サイト内検索（site-search）テスト OK（インデックス・UI・同義語辞書・スタイルの検証完了）");
