import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const exists = file => fs.existsSync(new URL(`../${file}`, import.meta.url));

const ARCHIVE_INDEX_PATH = "sources/official/articles/archive-index.json";
const ARTICLES_INDEX_HTML = "official-articles/index.html";

assert.ok(exists(ARCHIVE_INDEX_PATH), `${ARCHIVE_INDEX_PATH} が存在しません`);
assert.ok(exists(ARTICLES_INDEX_HTML), `${ARTICLES_INDEX_HTML} が存在しません`);

const archiveIndex = JSON.parse(read(ARCHIVE_INDEX_PATH));
const urls = Object.keys(archiveIndex);
assert.ok(urls.length >= 10, `アーカイブ記事は最低10件以上必要です（現在: ${urls.length}件）`);

let checkedCount = 0;
for (const [url, item] of Object.entries(archiveIndex)) {
  assert.ok(item.id, `記事アイテムに id がありません: ${url}`);
  assert.ok(item.title, `記事アイテムに title がありません: ${item.id}`);
  assert.ok(item.municipality, `記事アイテムに municipality がありません: ${item.id}`);
  assert.ok(item.htmlPath, `記事アイテムに htmlPath がありません: ${item.id}`);
  assert.ok(exists(item.htmlPath), `アーカイブHTML ${item.htmlPath} が存在しません`);

  const html = read(item.htmlPath);
  assert.ok(html.includes(item.title), `${item.htmlPath} にタイトルが含まれていません`);
  assert.ok(html.includes(url), `${item.htmlPath} に自治体公式元URL（${url}）が含まれていません`);
  checkedCount++;
}

console.log(`自治体公式記事アーカイブ検査: 全${checkedCount}件のHTML・元URLリンク・目録 OK`);
