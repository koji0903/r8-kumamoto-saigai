#!/usr/bin/env node
// 各地区の災害ボランティアセンター（市町村社会福祉協議会）の発信を収集する。
//
//   node tools/fetch-volunteer-centers.mjs
//
// 災害VCを運営するのは市町村社協で、市町村の公式サイトとはドメインが別。
// 熊本県社協の特設ページは「各センターのHPやSNSで確認を」と案内するだけで
// 個別サイトの一覧を持たないため、社協ごとにURLを登録して巡回する。
//
// 収集するのは表題・日付・URLのみ。本文の要約や転載は行わない。

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeVolunteerCenterHistory } from "./volunteer-center-history.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "sources/official/volunteer-centers");
const GENERATED = join(ROOT, "data/generated/volunteer-center-updates.js");
const UA = "Mozilla/5.0 (compatible; r8-kumamoto-saigai/1.1; +https://github.com/koji0903/r8-kumamoto-saigai)";
const DISASTER_DATE = "2026-07-28";
const END_DATE = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
const MAX_PAGES = 40;

// 定期巡回は「今見える一覧」ではなく「発災後の発信履歴」を更新する。
// 外部サイトの一時障害で検証済み記事を消さないため、現在の生成物を
// 差分取得の基準として読み込む。
let previousPayload = null;
try {
  previousPayload = JSON.parse(await readFile(join(OUT, "volunteer-center-updates.json"), "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") console.warn(`既存の災害VC発信履歴を読み込めません: ${error.message}`);
}
const previousByMunicipality = new Map(
  (previousPayload?.councils || []).map(council => [council.municipality, council.updates || []])
);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// 市町村社協の公式サイト。確認日を添える（サイト移転に気づけるようにするため）。
// hubs は災害・ボランティア関連の一覧ページ。空ならトップから辿る。
// URLの出どころは熊本県社会福祉協議会「市町村社協を探す」
// https://www.fukushi-kumamoto.or.jp/pages/53/ （氷川町・芦北町は一覧にURLの
// 記載がないため、各社協サイトを個別に確認した）。
const councils = [
  { municipality: "熊本市", name: "熊本市社会福祉協議会", url: "https://www.kumamoto-city-csw.or.jp/", hubs: ["https://www.kumamoto-city-csw.or.jp/news/"], confirmedAt: "2026-08-16" },
  { municipality: "八代市", name: "八代市社会福祉協議会", url: "https://www.yatsushiro-shakyo.jp/", hubs: ["https://www.yatsushiro-shakyo.jp/homepage_new/R08_saigai_vc_home.html"], confirmedAt: "2026-08-16" },
  { municipality: "宇土市", name: "宇土市社会福祉協議会", url: "https://www.utoshakyou.jp/", hubs: ["https://www.utoshakyou.jp/volunteer2026.html"], confirmedAt: "2026-08-16" },
  { municipality: "宇城市", name: "宇城市社会福祉協議会", url: "https://www.shakyou-uki.jp/", hubs: ["https://www.shakyou-uki.jp/category/oshirase/"], confirmedAt: "2026-08-16" },
  { municipality: "益城町", name: "益城町社会福祉協議会", url: "https://www.mashiki-shakyo.or.jp/", hubs: ["https://www.mashiki-shakyo.or.jp/news"], confirmedAt: "2026-08-16" },
  { municipality: "氷川町", name: "氷川町社会福祉協議会", url: "https://hikawa-syakyo.jp/", hubs: ["https://hikawa-syakyo.jp/news/"], confirmedAt: "2026-08-16" },
  { municipality: "芦北町", name: "芦北町社会福祉協議会", url: "https://www.ashikita-shakyo.com/", hubs: ["https://www.ashikita-shakyo.com/news/"], confirmedAt: "2026-08-16" },
  { municipality: "美里町", name: "美里町社会福祉協議会", url: "http://misatoshakyo.or.jp/", hubs: ["http://misatoshakyo.or.jp/pages/372/detail=1/b_id=889/view=list/block889_limit=20#block889"], confirmedAt: "2026-08-16" },
  { municipality: "御船町", name: "御船町社会福祉協議会", url: "https://mifune-shakyo.jp/", hubs: ["https://mifune-shakyo.jp/pages/51/detail=1/b_id=269/view=list/block269_limit=20#block269"], confirmedAt: "2026-08-16" },
  { municipality: "嘉島町", name: "嘉島町社会福祉協議会", url: "http://kashima-shakyo.or.jp/", hubs: ["http://kashima-shakyo.or.jp/publics/index/1/detail=1/b_id=1/view=list/block1_limit=20#block1"], confirmedAt: "2026-08-16" },
  { municipality: "甲佐町", name: "甲佐町社会福祉協議会", url: "http://kosa-shakyo.or.jp/", hubs: ["http://kosa-shakyo.or.jp/pages/50/", "http://kosa-shakyo.or.jp/pages/53/", "http://kosa-shakyo.or.jp/pages/61/detail=1/b_id=5/view=list/block5_limit=20#block5"], confirmedAt: "2026-08-16" }
];

const get = async url => {
  const response = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  // 社協サイトは Shift_JIS や EUC-JP のことがある。charset を見て復号する。
  const head = buffer.subarray(0, 4000).toString("latin1");
  const charset = head.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1]?.toLowerCase() || "utf-8";
  const encoding = /shift|sjis|x-sjis|windows-31j/.test(charset) ? "shift_jis"
    : /euc/.test(charset) ? "euc-jp" : "utf-8";
  return { html: new TextDecoder(encoding).decode(buffer), finalUrl: response.url };
};

const decode = value => value
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  // 絵文字は &#x1f64c; のように16進で書かれることがある
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&nbsp;/g, " ");
// 一覧では「2026-08-14 災害ボラ 第2期…」のように表題の前に日付や区分が付く。
// 日付は別に持つため、表題からは落として読みやすくする。
const cleanTitle = value => value
  .replace(/^\s*(?:(?:20\d{2}[-/.年]\s*)?\d{1,2}[-/.月]\s*\d{1,2}日?)\s*/u, "")
  // 「災害ボラ 第2期…」のような区分ラベルだけを落とす。直後に空白か区切りが
  // ないものは「災害ボランティア募集」等の本文なので削らない。
  .replace(/^\s*(?:災害ボラ|お知らせ|新着情報|NEW)(?=[\s:：])\s*[:：]?\s*/u, "")
  .trim();
const text = value => decode(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")).replace(/[\s　]+/g, " ").trim();

// トップページだけでは新着の数件しか見えない。「お知らせ一覧」「新着情報」
// といった一覧ページとページ送りだけを辿る。個別記事は辿らない（表題・日付・
// URLは一覧側で取れるうえ、たどると巡回が際限なく広がるため）。
// ※ NetCommons等の view=list は一覧ページとして辿る。
const detailLike = url => (!/view=list/i.test(url) && (/detail=1/i.test(url) || /r_id=/i.test(url))) || /\.pdf($|\?)/i.test(url);
const listLike = (url, title) =>
  !detailLike(url)
  && (/(?:news|topics|oshirase|whatsnew|information|blog|archive|category|page[\/=]\d+|p=\d+|view=list)/i.test(url)
    || /一覧|もっと見る|新着|お知らせ|バックナンバー|過去の|次へ|次の/u.test(title));

// 災害VC・地域支え合い・被災者支援の発信として拾う表題。ボランティア募集・活動状況・ニーズ受付・地域支え合いセンターが中心。
const isOtherDisaster = value =>
  /平成28年|令和\s*[1-79]年|令和\s*0?9年|202[0-57-9]年|ベネズエラ|ミャンマー|トルコ|シリア|ウクライナ|能登|東日本|北海道|台湾|豪雨災害義援金/u.test(value);

const relevant = (value, url = "") =>
  !isOtherDisaster(value)
  && (/災害ボランティア|災害VC|ボランティアセンター|ボランティア募集|ボランティア活動|活動報告|活動状況|ニーズ|支援活動|熊本地震|地震|被災|災害|第[0-9０-９一二三四五六七八九十]+[期弾]|地域支え合い|支え合いセンター|生活支援相談員/u.test(value)
    || /volunteer|shien|jishin|saigai/i.test(url))
  // 社協サイトは他の災害の救援金募集も並べている。今回の地震の発信だけを拾う。
  && !/募集要項の見直し|入札/u.test(value);

const parseDate = (value, url) => {
  if (!value) return null;
  const normalized = value.replace(/[０-９]/g, digit => "０１２３４５６７８９".indexOf(digit).toString());
  for (const pattern of [
    /(2026|令和\s*8)\s*[年./-]\s*(\d{1,2})\s*[月./-]\s*(\d{1,2})/u,
    /(?:^|[^\d])(0?[7-9]|1[0-2])\s*[月/.]\s*(\d{1,2})\s*日?/u
  ]) {
    const match = normalized.match(pattern);
    if (!match) continue;
    const [month, day] = match.length === 4 ? [match[2], match[3]] : [match[1], match[2]];
    const iso = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (iso >= DISASTER_DATE && iso <= END_DATE) return iso;
  }
  if (url) {
    const urlMatch = url.match(/(?:2026|r8)(0[7-9]|1[0-2])(\d{2})/i);
    if (urlMatch) {
      const iso = `2026-${urlMatch[1]}-${urlMatch[2]}`;
      if (iso >= DISASTER_DATE && iso <= END_DATE) return iso;
    }
  }
  return null;
};

const results = [];
for (const council of councils) {
  const origin = new URL(council.url).hostname;
  const queue = [council.url, ...council.hubs];
  const seen = new Set(), updates = new Map();
  let fetched = 0, issue = null;
  while (queue.length && fetched < MAX_PAGES) {
    const target = queue.shift();
    if (seen.has(target)) continue;
    seen.add(target);
    let page;
    try { page = await get(target); fetched++; } catch (error) { if (!issue) issue = String(error.message); continue; }
    for (const match of page.html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const title = text(match[2]);
      if (!title || title.length > 160) continue;
      let url;
      try { url = new URL(decode(match[1]), page.finalUrl); } catch { continue; }
      // ページ内アンカーのうち、コンテンツ特定用（第○弾アンカーやブロックID）以外は削る
      if (url.hash && !/(?:voboshuu|dantai|block\d+)/i.test(url.hash)) {
        url.hash = "";
      }
      if (!/^https?:$/.test(url.protocol)) continue;
      if (url.hostname !== origin && !url.hostname.endsWith(`.${origin}`)) continue;
      if (isOtherDisaster(title)) continue;
      let isRel = relevant(title, url.href);
      let sasaeaiMatch = /地域支え合い|支え合いセンター|生活支援相談員/u.test(title);
      // 職員採用系リンクの場合、地域支え合いセンター等の関連か個別ページを確認
      if (!isRel && /職員|採用/u.test(title) && !/入札/u.test(title) && !detailLike(url.href)) {
        try {
          const detail = await get(url.href);
          const detailText = text(detail.html);
          if (!isOtherDisaster(detailText) && /地域支え合い|生活支援相談員|災害ボランティア/u.test(detailText)) {
            isRel = true;
            sasaeaiMatch = true;
          }
        } catch {}
      }
      if (!isRel) {
        // 表題が災害と無関係でも、一覧ページなら辿る（その先に発信がある）
        if (listLike(url.href, title) && !seen.has(url.href) && !queue.includes(url.href)) queue.push(url.href);
        continue;
      }
      if (title.length < 4) continue;
      // 表題またはその前後・URLから日付を拾う（表題に日付があれば最優先）
      const around = text(page.html.slice(Math.max(0, match.index - 260), match.index + match[0].length + 260));
      const date = parseDate(title, url.href) || parseDate(around, url.href);
      if (!date) {
        if (listLike(url.href, title) && !seen.has(url.href) && !queue.includes(url.href)) queue.push(url.href);
        continue;
      }
      let cleaned = cleanTitle(title) || title;
      cleaned = cleaned.replace(/を追加しました$/u, "").trim();
      if (/^第[0-9０-９一二三四五六七八九十]+[期弾]募集$/.test(cleaned)) {
        cleaned = `災害ボランティア ${cleaned}`;
      }
      if (sasaeaiMatch && !/地域支え合い|支え合い/u.test(cleaned)) {
        cleaned = `地域支え合いセンター ${cleaned}`;
      }
      if (!updates.has(url.href) || date > updates.get(url.href).date) {
        updates.set(url.href, { title: cleaned, url: url.href, date });
      }
    }
    await wait(300);
  }
  const current = [...updates.values()];
  const previous = previousByMunicipality.get(council.municipality) || [];
  const list = mergeVolunteerCenterHistory(previous, current).filter(update => !isOtherDisaster(update.title));
  const retainedCount = list.filter(update => !updates.has(update.url)).length;
  results.push({ ...council, checkedAt: new Date().toISOString(), pagesFetched: fetched, retrievalIssue: issue, retainedCount, updates: list });
  console.log(`${council.name}: ${list.length}件 (今回${current.length}件・履歴保持${retainedCount}件 / ${fetched}ページ取得)${issue ? ` ⚠ ${issue}` : ""}`);
}

const total = results.reduce((sum, item) => sum + item.updates.length, 0);
const payload = {
  schemaVersion: "1.0.0",
  retrievedAt: new Date().toISOString(),
  event: "令和8年熊本地震",
  disasterDate: DISASTER_DATE,
  note: "災害ボランティアセンターを運営する市町村社会福祉協議会の公式サイトから、表題・日付・URLのみを収集しています。本文の転載や要約は行っていません。",
  councils: results
};
await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, "volunteer-center-updates.json"), `${JSON.stringify(payload, null, 2)}\n`);
await mkdir(dirname(GENERATED), { recursive: true });
await writeFile(GENERATED,
  "// 生成物・直接編集しない。生成: node tools/fetch-volunteer-centers.mjs\n"
  + `window.VOLUNTEER_CENTER_UPDATES = ${JSON.stringify(payload)};\n`);

console.log(`合計 ${total}件 / ${results.length}社協`);
