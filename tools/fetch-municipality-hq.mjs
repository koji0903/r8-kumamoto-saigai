#!/usr/bin/env node
// 市町村が公開している災害対策本部会議資料を取得する。
//
//   node tools/fetch-municipality-hq.mjs            新しい回だけ取得する
//   node tools/fetch-municipality-hq.mjs --list     一覧だけ更新し、PDFは取得しない
//   node tools/fetch-municipality-hq.mjs --all      すでにある回も取り直す
//
// 対象は config/municipality-hq-meetings.json に書く。市町村が資料ページを
// 作ったらそこへ足せば、このツールとページの両方が追随する。
//
// 生成物
//   sources/official/municipality-hq-index.json  回ごとのカタログと本文（コミットする）
//   sources/official/municipality-hq/*.pdf       資料PDF本体（.gitignore 済み）
//
// 市によって載せ方が違う（config の source）
//   html … 熊本市。一覧ページに会議ごとの本文が載っているのでPDFは落とさない。
//   pdf  … 八代市。一覧はリンクだけなので、資料PDFを取ってから数値を読む。
//
// PDFをリポジトリに入れないのは、1回ぶんが20〜35MBあり全体で1GBを超えるため。
// 公開URLは添付ファイルIDで安定しているので、サイトからは市の公開URLへ直接
// リンクする。手元にPDFが要るのは数値を取り出すときだけ。
//
// 毎日1回ずつ増えていく前提なので、既に取得済みの回は触らない。市のサーバに
// 同じファイルを何度も取りに行かないための約束。

import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = join(ROOT, "config/municipality-hq-meetings.json");
const OUT_INDEX = join(ROOT, "sources/official/municipality-hq-index.json");
const PDF_DIR = join(ROOT, "sources/official/municipality-hq");
const TEXT_DIR = join(ROOT, "sources/official/municipality-hq-text");
const UA = "Mozilla/5.0 (compatible; r8-kumamoto-saigai/1.0; +https://github.com/koji0903/r8-kumamoto-saigai)";

const mode = process.argv.includes("--all") ? "all" : process.argv.includes("--list") ? "list" : "new";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const get = async (url, as = "text") => {
  const response = await fetch(url, { headers: { "user-agent": UA } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} — ${url}`);
  return as === "text" ? response.text() : Buffer.from(await response.arrayBuffer());
};

const strip = value => value.replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/\s+/g, " ").trim();

// 全角数字は半角に。市によって「第２３回」「第23回」と揺れる
const toHalf = value => value.replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0));

// 「令和８年８月１８日（火曜日）午後４時００分」→ 2026-08-18 / 16:00
const parseDateTime = label => {
  // 熊本市は「令和8年（2026年）8月17日(月)15時00分」と西暦を挟む
  const text = toHalf(label).replace(/（\s?\d{4}\s?年\s?）/g, "");
  const date = text.match(/令和(\d+)年\s?(\d+)月\s?(\d+)日/);
  if (!date) return { date: null, time: null };
  const [, era, month, day] = date.map(Number);
  const iso = `${2018 + era}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const clock = text.match(/(午前|午後)?\s?(\d+)時\s?(\d+)分/);
  let time = null;
  if (clock) {
    let hour = Number(clock[2]);
    if (clock[1] === "午後" && hour < 12) hour += 12;
    if (clock[1] === "午前" && hour === 12) hour = 0;
    time = `${String(hour).padStart(2, "0")}:${clock[3].padStart(2, "0")}`;
  }
  return { date: iso, time };
};

// 「（PDF：27.07メガバイト）」→ 27.07MB。市の表記をそのまま数字にするだけ
const parseSize = label => {
  const match = toHalf(label).match(/PDF：([\d.]+)(メガバイト|キロバイト)/);
  if (!match) return null;
  return Math.round(Number(match[1]) * (match[2] === "メガバイト" ? 1024 * 1024 : 1024));
};

// 見出しと本文をそのまま取り出す。要約せず、市が書いた文をそのまま残す。
const readSections = (html, startIndex, endIndex) => {
  const body = html.slice(startIndex, endIndex);
  const parts = body.split(/<h[2-5][^>]*>/);
  const sections = [];
  // 先頭（見出しの直後〜最初の小見出しまで）は会議の日時・場所
  const head = plain(parts[0]);
  for (const part of parts.slice(1)) {
    const title = plain(part.slice(0, part.search(/<\/h[2-5]>/)));
    const text = plain(part.slice(part.search(/<\/h[2-5]>/)));
    if (title) sections.push({ title, text });
  }
  return { head, sections };
};

// タグを外して行に戻す。改行の意味を持つタグだけ改行にする
const plain = html => html
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/(p|li|div|tr|h[2-5])>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .split("\n").map(line => line.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");

const config = JSON.parse(await readFile(CONFIG, "utf8"));
const previous = await readFile(OUT_INDEX, "utf8").then(JSON.parse).catch(() => ({ municipalities: [] }));
await mkdir(PDF_DIR, { recursive: true });

const result = [];
let downloaded = 0;
for (const municipality of config.municipalities) {
  const html = await get(municipality.indexUrl);
  const meetings = [];
  // 資料ページのPDFリンクを出現順に拾う。回数はリンク文言から読む
  for (const match of html.matchAll(/<a[^>]+href="([^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const label = strip(match[2]);
    // 「災害」の誤記（熊本市 第15回は「第害対策本部会議」）でも落とさないよう、
    // 両方に共通する「対策本部会議」で見る
    if (!/対策本部会議/.test(label)) continue;
    const meeting = Number(toHalf(label).match(/第\s?(\d+)\s?回/)?.[1]);
    if (!Number.isInteger(meeting)) continue;
    // 熊本市の第7回のように1回が2ファイルに分かれることがある
    const part = Number(toHalf(label).match(/資料\s?\((\d)\)/)?.[1]) || null;
    const url = new URL(match[1], municipality.indexUrl).toString();
    meetings.push({
      meeting, part, label,
      ...parseDateTime(label),
      url,
      file: `${municipality.key}-${String(meeting).padStart(3, "0")}${part ? `-${part}` : ""}.pdf`,
      declaredBytes: parseSize(label)
    });
  }
  if (!meetings.length) throw new Error(`${municipality.name}: 資料リンクが1件も取れませんでした（ページの作りが変わった可能性）`);
  meetings.sort((a, b) => a.meeting - b.meeting || (a.part || 0) - (b.part || 0));

  // 一覧ページに会議ごとの本文がある市は、そこから読む（PDFは落とさない）
  if (municipality.source === "html") {
    const heads = [...html.matchAll(/<(h[2-5])[^>]*>([\s\S]*?)<\/\1>/g)]
      .map(match => ({ start: match.index, end: match.index + match[0].length, title: strip(match[2]) }));
    // 「第22回熊本市災害対策本部会議」「熊本市第13回災害対策本部会議」の両方の並び
    const anchors = heads
      .map((head, index) => ({ ...head, index, meeting: Number(toHalf(head.title).match(/第\s?(\d+)\s?回/)?.[1]) }))
      .filter(head => head.meeting && /対策本部会議$/.test(head.title));
    for (const [order, anchor] of anchors.entries()) {
      const target = meetings.find(item => item.meeting === anchor.meeting);
      if (!target) continue;
      // 節は自分の資料PDFへのリンクで終わる。最後の回だけは次の見出しがなく、
      // 放っておくとページ末尾のお問い合わせまで飲み込むので必ずここで切る
      // リンクのURLではなく、その <a を開くところで切る（切れ端のタグを残さない）
      const own = meetings.filter(entry => entry.meeting === anchor.meeting)
        .map(entry => html.indexOf(entry.url, anchor.end))
        .filter(index => index > 0)
        .map(index => html.lastIndexOf("<", index));
      const stop = Math.min(anchors[order + 1]?.start ?? html.length, ...(own.length ? own : [html.length]));
      const { head, sections } = readSections(html, anchor.end, stop);
      const when = parseDateTime(head);
      for (const item of meetings.filter(entry => entry.meeting === anchor.meeting)) {
        item.date = when.date; item.time = when.time;
        item.venue = head.split("\n").find(line => line.startsWith("場所"))?.replace(/^場所[：:]\s*/, "") || null;
        item.sections = sections;
      }
    }
    const missing = meetings.filter(item => !item.sections?.length).map(item => item.meeting);
    if (missing.length) console.log(`  ${municipality.name}: 本文が見つからない回 ${missing.join("、")}（資料PDFのみ）`);
  }

  for (const item of meetings) {
    if (municipality.source === "html") { item.bytes = null; continue; }
    const path = join(PDF_DIR, item.file);
    const have = await stat(path).then(stats => stats.size, () => 0);
    item.bytes = have || null;
    if (mode === "list") continue;
    if (have && mode !== "all") continue;
    // 取り出した文字がもうあるなら、PDFは要らない。これがないと、PDFを
    // 置かない環境（CI）で毎回すべて取り直すことになる（1回600MB近い）
    const extracted = join(TEXT_DIR, `${municipality.key}-${String(item.meeting).padStart(3, "0")}.json`);
    // カタログには残さない（--list と通常実行で中身が変わってしまうため）
    if (mode !== "all" && await stat(extracted).then(() => true, () => false)) continue;
    process.stdout.write(`  取得 ${municipality.name} 第${item.meeting}回${item.part ? `(${item.part})` : ""} …`);
    const pdf = await get(item.url, "buffer");
    await writeFile(path, pdf);
    item.bytes = pdf.length;
    downloaded += 1;
    console.log(` ${(pdf.length / 1024 / 1024).toFixed(1)}MB`);
    await sleep(1500); // 市のサーバに連続で当てない
  }

  const before = previous.municipalities.find(entry => entry.key === municipality.key);
  const added = before ? meetings.filter(item => !before.meetings.some(old => old.url === item.url)) : meetings;
  result.push({
    key: municipality.key, name: municipality.name, page: municipality.page,
    source: municipality.source,
    indexUrl: municipality.indexUrl, indexTitle: municipality.indexTitle,
    department: municipality.department, documentKind: municipality.documentKind,
    note: municipality.note,
    latestMeeting: meetings.at(-1).meeting,
    meetings
  });
  console.log(`${municipality.name}: ${meetings.length}件（新着${added.length}件 / 最新は第${meetings.at(-1).meeting}回）`);
}

await writeFile(OUT_INDEX, `${JSON.stringify({
  schemaVersion: "1.0.0",
  retrievedAt: new Date().toISOString(),
  disasterDate: config.disasterDate,
  municipalities: result
}, null, 2)}\n`);

const total = result.reduce((sum, entry) => sum + entry.meetings.length, 0);
console.log(`市町村の本部会議資料 ${total}件 / ${result.length}市 を ${mode === "list" ? "一覧のみ" : `取得（今回${downloaded}件ダウンロード）`}`);
