import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const exists = file => fs.existsSync(new URL(`../${file}`, import.meta.url));

const ARCHIVE_INDEX_PATH = "sources/official/articles/archive-index.json";
const ARTICLES_INDEX_HTML = "official-articles/index.html";
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));
const assertNoTrailingWhitespace = (content, file) => {
  assert.equal(content.includes("\r"), false, `${file} にCR改行があります`);
  const line = content.split("\n").findIndex(value => /[\t ]+$/.test(value));
  assert.equal(line, -1, `${file}:${line + 1} に行末空白があります`);
};

assert.ok(exists(ARCHIVE_INDEX_PATH), `${ARCHIVE_INDEX_PATH} が存在しません`);
assert.ok(exists(ARTICLES_INDEX_HTML), `${ARTICLES_INDEX_HTML} が存在しません`);
assertNoTrailingWhitespace(read(ARTICLES_INDEX_HTML), ARTICLES_INDEX_HTML);

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

  const articleDataPath = `sources/official/articles/${item.id}.json`;
  assert.ok(exists(articleDataPath), `アーカイブデータ ${articleDataPath} が存在しません`);
  const articleData = JSON.parse(read(articleDataPath));
  assert.equal(url, articleData.url, `${item.id}: 目録と保存データの公式元URLが一致しません`);
  assert.equal(item.title, articleData.title, `${item.id}: 目録と保存データのタイトルが一致しません`);
  assert.equal(item.municipality, articleData.municipality, `${item.id}: 目録と保存データの自治体が一致しません`);
  assert.equal(item.date, articleData.date, `${item.id}: 目録と保存データの日付が一致しません`);

  const html = read(item.htmlPath);
  assertNoTrailingWhitespace(html, item.htmlPath);
  assert.ok(html.includes(escapeHtml(item.title)), `${item.htmlPath} にタイトルが含まれていません`);
  assert.ok(html.includes(escapeHtml(url)), `${item.htmlPath} に自治体公式元URL（${url}）が含まれていません`);
  checkedCount++;
}

console.log(`自治体公式記事アーカイブ検査: 全${checkedCount}件のHTML・元URLリンク・目録 OK`);
