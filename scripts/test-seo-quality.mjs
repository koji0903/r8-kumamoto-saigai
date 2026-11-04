import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://www.yokatainet.jp";
const pages = fs.readdirSync(root)
  .filter(file => file.endsWith(".html") && !/^google/i.test(file))
  .sort();
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const value = (html, pattern) => html.match(pattern)?.[1]?.trim() || "";
const sitemap = read("sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>(https:\/\/www\.yokatainet\.jp\/[^<]*)<\/loc>/g)]
  .map(match => match[1]);
const sitemapSet = new Set(sitemapUrls);
assert.equal(sitemapSet.size, sitemapUrls.length, "sitemap.xml に重複URLがあります");

const indexed = [];
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

for (const file of pages) {
  const html = read(file);
  const title = value(html, /<title>([\s\S]*?)<\/title>/i);
  const description = value(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const robots = value(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
  const canonical = value(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const isNoindex = /\bnoindex\b/i.test(robots);

  assert.match(html, /<html\s+lang="ja"/i, `${file}: html lang="ja" がありません`);
  assert.ok(title, `${file}: title がありません`);
  assert.ok(description, `${file}: description がありません`);
  assert.ok(title.length >= 12 && title.length <= 75, `${file}: title は12〜75文字にしてください（${title.length}文字）`);
  assert.ok(description.length >= 45 && description.length <= 180, `${file}: description は45〜180文字にしてください（${description.length}文字）`);
  assert.equal(h1Count, 1, `${file}: h1 は1個にしてください（${h1Count}個）`);
  assert.ok(canonical.startsWith(`${origin}/`), `${file}: canonical は本番の絶対URLにしてください`);
  assert.ok(robots, `${file}: robots指定がありません`);
  assert.equal(/<meta\s+http-equiv=["']refresh["']/i.test(html) && !isNoindex, false, `${file}: meta refreshページをindex対象にしないでください`);

  if (isNoindex) {
    const ownUrl = file === "index.html" ? `${origin}/` : `${origin}/${file}`;
    assert.equal(sitemapSet.has(ownUrl), false, `${file}: noindexページをサイトマップへ掲載しないでください`);
    continue;
  }

  indexed.push(file);
  const expectedCanonical = file === "index.html" ? `${origin}/` : `${origin}/${file}`;
  assert.equal(canonical, expectedCanonical, `${file}: canonical が公開URLと一致しません`);
  assert.ok(sitemapSet.has(canonical), `${file}: index対象ページがサイトマップにありません`);
  assert.equal(titles.has(title), false, `${file}: title が ${titles.get(title)} と重複しています`);
  assert.equal(descriptions.has(description), false, `${file}: description が ${descriptions.get(description)} と重複しています`);
  assert.equal(canonicals.has(canonical), false, `${file}: canonical が ${canonicals.get(canonical)} と重複しています`);
  titles.set(title, file);
  descriptions.set(description, file);
  canonicals.set(canonical, file);
}

const search = JSON.parse(read("public-data/site-search-index.json"));
const searchUrls = new Set(search.items.map(item => item.url));
assert.equal(searchUrls.size, search.items.length, "サイト内検索インデックスに重複URLがあります");
for (const file of indexed) assert.ok(searchUrls.has(file), `${file}: index対象ページがサイト内検索にありません`);
for (const item of search.items) assert.ok(indexed.includes(item.url), `${item.url}: noindexまたは未確認ページがサイト内検索に含まれています`);

const crawlSources = [...pages.map(read), read("org-site.js")].join("\n");
const inbound = new Map(indexed.map(file => [file, 0]));
for (const match of crawlSources.matchAll(/href=["']([^"']+)["']/gi)) {
  const raw = match[1];
  if (/^(?:https?:|mailto:|tel:|javascript:|#)/i.test(raw)) continue;
  const target = raw.split(/[?#]/)[0].replace(/^\.\//, "");
  if (inbound.has(target)) inbound.set(target, inbound.get(target) + 1);
  if (target.endsWith(".html") && !target.includes("${") && !target.startsWith("../")) {
    assert.ok(fs.existsSync(path.join(root, target)), `内部リンク先がありません: ${raw}`);
  }
}
for (const [file, count] of inbound) {
  if (file !== "index.html") assert.ok(count > 0, `${file}: 他ページからたどれない孤立ページです`);
}

assert.ok(sitemapSet.has(`${origin}/official-articles/`), "公式記事アーカイブ目録がサイトマップにありません");
assert.equal(searchUrls.has("municipality-updates.html"), false, "旧自治体更新ページをサイト内検索へ含めないでください");
console.log(`SEO品質: index対象${indexed.length}ページ / title・description重複なし / H1 / sitemap / サイト内検索 / 内部リンク OK`);
