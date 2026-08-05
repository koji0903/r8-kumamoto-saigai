#!/usr/bin/env node
// 熊本県「令和8年熊本地震に係る災害対策本部会議」ページから資料PDFを取得する。
//
//   node tools/fetch-hq.mjs
//
// 生成物
//   source-files/official/hq-index.json   会議回ごとの資料カタログ（コミットする）
//   source-files/official/hq/*.pdf        資料PDF本体（.gitignore 済み・コミットしない）
//
// PDFをリポジトリに入れないのは、全82件で約84MBあるためです。県の公開URLは
// 添付ファイルIDで安定しているので、サイトからは県のURLへ直接リンクしています。

import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_URL = "https://www.pref.kumamoto.jp/soshiki/222/274487.html";
const ORIGIN = "https://www.pref.kumamoto.jp";
const OUT_DIR = join(ROOT, "source-files/official");
const PDF_DIR = join(OUT_DIR, "hq");
const UA = "Mozilla/5.0 (compatible; r8-kumamoto-saigai/1.0; +https://github.com/koji0903/r8-kumamoto-saigai)";

const get = async (url, as = "text") => {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return as === "text" ? res.text() : Buffer.from(await res.arrayBuffer());
};

const strip = s => s.replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .trim();

// 「〇第7回政府非常災害現地対策本部会議、第14回災害対策本部会議」から回数を取り出す
const parseHeading = text => ({
  heading: text.replace(/^[〇○]/, "").trim(),
  meeting: Number(text.match(/第(\d+)回災害対策本部会議/)?.[1]) || null,
  govMeeting: Number(text.match(/第(\d+)回政府非常災害現地対策本部会議/)?.[1]) || null
});

const html = await get(INDEX_URL);

// 見出しとPDFリンクを出現順に拾い、直前の見出しをその資料の所属会議とする
const token = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>|<a[^>]+href="(\/uploaded\/attachment\/\d+\.pdf)"[^>]*>([\s\S]*?)<\/a>/g;
const meetings = [];
let current = null, match;
while ((match = token.exec(html))) {
  if (match[1] !== undefined) {
    const text = strip(match[1]);
    if (!/災害対策本部会議/.test(text)) continue;
    current = { ...parseHeading(text), documents: [] };
    meetings.push(current);
  } else if (current) {
    const label = strip(match[3]);
    current.documents.push({
      // 「議事録（PDFファイル：147KB）」→ 「議事録」
      title: label.replace(/（PDFファイル：[^）]*）/g, "").trim(),
      label,
      file: match[2].split("/").pop(),
      url: ORIGIN + match[2]
    });
  }
}

if (!meetings.length) throw new Error("会議の見出しを1件も拾えませんでした。ページ構成が変わった可能性があります。");
const total = meetings.reduce((n, m) => n + m.documents.length, 0);
if (!total) throw new Error("PDFリンクを1件も拾えませんでした。ページ構成が変わった可能性があります。");

await mkdir(PDF_DIR, { recursive: true });
const catalog = { source: INDEX_URL, retrievedAt: new Date().toISOString(), meetings };
await writeFile(join(OUT_DIR, "hq-index.json"), JSON.stringify(catalog, null, 2) + "\n");

// official.html が資料一覧を出すために読む（生成物・直接編集しない）
await writeFile(join(ROOT, "hq-index.js"),
  "// 生成物・直接編集しない。生成: node tools/fetch-hq.mjs\n"
  + "window.HQ_INDEX = " + JSON.stringify({
      source: catalog.source, retrievedAt: catalog.retrievedAt,
      meetings: meetings.map(m => ({
        meeting: m.meeting, govMeeting: m.govMeeting,
        documents: m.documents.map(d => ({ title: d.title, url: d.url }))
      }))
    }) + ";\n");

let fetched = 0, skipped = 0;
for (const meeting of meetings) {
  for (const doc of meeting.documents) {
    const path = join(PDF_DIR, doc.file);
    try { await access(path); skipped++; continue; } catch {}
    await writeFile(path, await get(doc.url, "bin"));
    fetched++;
    await new Promise(r => setTimeout(r, 400)); // 県のサーバに負荷をかけない
  }
}

console.log(`会議 ${meetings.length}回 / 資料 ${total}件`);
console.log(`  取得 ${fetched}件、既存 ${skipped}件 → ${PDF_DIR}`);
console.log(`  カタログ → source-files/official/hq-index.json`);
