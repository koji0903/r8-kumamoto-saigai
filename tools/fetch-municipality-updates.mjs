#!/usr/bin/env node
// 市町村公式サイトから令和8年熊本地震に関する記事リンクを収集する。
// 本文の自動要約は行わず、公式記事の表題・日付・URLだけを保存する。
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "sources/official/municipalities");
const GENERATED = join(ROOT, "data/generated/municipality-updates.js");
const UA = "Mozilla/5.0 (compatible; r8-kumamoto-saigai/1.1; +https://github.com/koji0903/r8-kumamoto-saigai)";
const DISASTER_DATE = "2026-07-28";
const END_DATE = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
const MAX_PAGES_PER_SITE = 80;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const municipalities = [
  ["熊本市", "https://www.city.kumamoto.jp/", ["https://www.city.kumamoto.jp/list04828.html"]],
  ["八代市", "https://www.city.yatsushiro.lg.jp/", ["https://www.city.yatsushiro.lg.jp/bousai/kiji00326750/index.html", "https://www.city.yatsushiro.lg.jp/kinkyu.html"]],
  ["水俣市", "https://localcms.city.minamata.lg.jp/", []],
  ["山鹿市", "https://www.city.yamaga.kumamoto.jp/", ["https://www.city.yamaga.kumamoto.jp/kiji0033159/index.html"]],
  ["菊池市", "https://www.city.kikuchi.lg.jp/", []],
  ["宇土市", "https://www.city.uto.lg.jp/", ["https://www.city.uto.lg.jp/category/list/1301.html"]],
  ["上天草市", "https://www.city.kamiamakusa.kumamoto.jp/", ["https://www.city.kamiamakusa.kumamoto.jp/q/new.html?pg=0"]],
  ["宇城市", "https://www.city.uki.kumamoto.jp/", [
    "https://www.city.uki.kumamoto.jp/toppage/kinkyu/2606699",
    "https://www.city.uki.kumamoto.jp/toppage/important"
  ]],
  ["天草市", "https://www.city.amakusa.kumamoto.jp/default.html?site=1", ["https://www.city.amakusa.kumamoto.jp/bousai/kiji00313681/index.html"]],
  ["合志市", "https://www.city.koshi.lg.jp/", [], ["https://www.city.koshi.lg.jp/bousai/kiji00325658/index.html"]],
  ["美里町", "https://www.town.kumamoto-misato.lg.jp/", ["https://www.town.kumamoto-misato.lg.jp/kurashi_tetsuzuki/gou-saigai_1/index.html"]],
  ["大津町", "https://www.town.ozu.kumamoto.jp/", [], ["https://www.town.ozu.kumamoto.jp/page/26598.html"]],
  ["菊陽町", "https://www.town.kikuyo.lg.jp/", ["https://www.town.kikuyo.lg.jp/bousai/list00733.html"]],
  ["西原村", "https://www.vill.nishihara.kumamoto.jp/", []],
  ["御船町", "https://www.town.mifune.kumamoto.jp/", []],
  ["嘉島町", "https://www.town.kumamoto-kashima.lg.jp/", []],
  ["益城町", "https://www.town.mashiki.lg.jp/", ["https://www.town.mashiki.lg.jp/list00538.html", "https://www.town.mashiki.lg.jp/new_list.html"]],
  ["甲佐町", "https://www.town.kosa.lg.jp/", ["https://www.town.kosa.lg.jp/q/aview/55/13531.html"], ["https://www.town.kosa.lg.jp/q/aview/120/10636.html", "https://www.town.kosa.lg.jp/q/aview/119/6336.html"]],
  ["氷川町", "https://www.town.hikawa.kumamoto.jp/", [
    "https://www.town.hikawa.kumamoto.jp/list00849.html",
    "https://www.town.hikawa.kumamoto.jp/kinkyu.html"
  ]],
  ["芦北町", "https://www.town.ashikita.lg.jp/", []],
  ["津奈木町", "https://www.town.tsunagi.lg.jp/", []]
].map(([name, officialUrl, hubs, details = []]) => ({ name, officialUrl, hubs, details }));
// 宇土市の当該ページは、市が今回の災害情報だけを分類して掲載する専用集約ページ。
// 「市民の皆様へ」等、表題だけでは地震関連性を判定できない記事も公式の掲載判断を尊重する。
municipalities.find(municipality => municipality.name === "宇土市").trustAllHub = true;
// 集約ページから外れた後も、過去に公式原文と日付を確認済みの資料はアーカイブとして保持する。
municipalities.find(municipality => municipality.name === "八代市").preserved = [{
  title: "避難所開設状況一覧（再編）（R8.8.1 12時時点）（PDF：479.6キロバイト）",
  url: "https://www.city.yatsushiro.lg.jp/kiji00326799/3_26799_157902_up_xi1jezri.pdf",
  date: "2026-08-01", time: null, category: "避難・安全"
}];
municipalities.find(municipality => municipality.name === "甲佐町").preserved = [
  { title: "甲佐町『やな場』について", url: "https://www.town.kosa.lg.jp/q/aview/120/10636.html", date: "2026-07-29", time: null, category: "施設・学校" },
  { title: "古民家交流拠点施設（『宿屋kugurido』・『trattoria San Vito』）", url: "https://www.town.kosa.lg.jp/q/aview/119/6336.html", date: "2026-07-29", time: null, category: "施設・学校" }
];

const decode = value => value
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;|&ensp;|&emsp;/gi, " ").replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
const text = html => decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/[\s\u3000]+/g, " ").trim();
const clean = value => value.replace(/\s*[|｜].*?(市|町|村|ホームページ).*$/u, "").replace(/\s+/g, " ").trim();
const excluded = value => /平成\s*[２2]8年|平成28年|令和\s*[７7]年|2025年|10年|１０年|耐震|防災計画|訓練|復興記録|追悼|議会報告会/u.test(value);
const relevant = value => /令和\s*[８8]年熊本地震|熊本地震|地震|震度|避難|罹災|り災|被災|災害ごみ|災害廃棄物|給水|断水|濁り水|停電|ガス供給|災害ボランティア|災害救助法|応急住宅|ブルーシート|通行止|運休/u.test(value) && !excluded(value);
// 地震特設ページ内では、表題に「地震」と書かれない生活情報も対象になる。
// ただし特設ページの共通ナビゲーションを取り込まないよう、影響・支援を示す語を必須とする。
const contextual = value => /ごみ|廃棄物|し尿|入浴|シャワー|休園|休校|休館|閉館|利用.*(?:中止|制限|再開)|施設.*(?:中止|制限|再開)|窓口|証明|手数料|住宅|住まい|相談|支援|義援|寄附|物資|炊き出し|農地|農業|道路|交通|バス|タクシー|保険証|医療|保育|学校|公民館|体育|公園|水道|下水道/u.test(value) && !excluded(value);
const navigation = value => /^(トップ|ホーム|一覧|記事一覧を見る|詳細|こちら|戻る|次へ|前へ|もっと見る|メニュー|新着情報|緊急情報|防災情報|関連情報|サイトマップ)$/u.test(value);
const category = value => /避難|安全|震度|通行止|道路|強風|落雷|火の取り扱い/u.test(value) ? "避難・安全" : /給水|断水|水道|飲料水|生活用水|濁り水|通水|配水|停電|ガス/u.test(value) ? "ライフライン" : /罹災|り災|被災証明|住まい|住家|住宅|緊急修理|応急修理|ブルーシート/u.test(value) ? "住まい・証明" : /ごみ|廃棄物|し尿|入浴|シャワー/u.test(value) ? "ごみ・生活" : /鉄道|バス|タクシー|市電|交通|運休|運行/u.test(value) ? "交通" : /休館|閉館|休校|学校|保育|施設|中止/u.test(value) ? "施設・学校" : /支援|相談|救助法|ボランティア|寄附|義援|物資配布|無料貸出/u.test(value) ? "支援・制度" : "その他";

function parseDate(value) {
  value = value.replace(/[０-９]/g, digit => String("０１２３４５６７８９".indexOf(digit)));
  // 見出しには「7月28日発生…8月7日20時35分更新」のように複数の日付が
  // 含まれる。掲載・更新日時として末尾側の日付を採用し、時刻はその日付の
  // 直後に書かれたものだけを結び付ける（本文中の発災時刻等を拾わない）。
  const candidates = [];
  for (const match of value.matchAll(/(2026|令和\s*[８8])\s*[年./-]\s*(\d{1,2})\s*[月./-]\s*(\d{1,2})\s*日?/gu)) {
    candidates.push({ index: match.index, end: match.index + match[0].length, month: match[2], day: match[3] });
  }
  for (const match of value.matchAll(/[RＲ]\s*8\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{1,2})/gu)) {
    candidates.push({ index: match.index, end: match.index + match[0].length, month: match[1], day: match[2] });
  }
  for (const match of value.matchAll(/(?:^|[^\d])(7|8)\s*月\s*(\d{1,2})\s*日/gu)) {
    candidates.push({ index: match.index, end: match.index + match[0].length, month: match[1], day: match[2] });
  }
  for (const match of value.matchAll(/(?:^|[^\dRrＲ])(7|8)\s*[./-]\s*(\d{1,2})(?:日)?/gu)) {
    candidates.push({ index: match.index, end: match.index + match[0].length, month: match[1], day: match[2] });
  }
  candidates.sort((a, b) => a.index - b.index);
  const chosen = candidates.at(-1);
  const iso = chosen ? `2026-${String(chosen.month).padStart(2, "0")}-${String(chosen.day).padStart(2, "0")}` : null;
  const clockText = chosen ? value.slice(chosen.end, chosen.end + 32) : "";
  const colonClock = clockText.match(/^\s*(?:[T（(、,・／/]?\s*)([0-2]?\d):([0-5]\d)/u);
  const japaneseClock = clockText.match(/^\s*(?:[T（(、,・／/]?\s*)([0-2]?\d)\s*時(?:\s*([0-5]?\d)\s*分)?/u);
  const clockMatch = colonClock || japaneseClock;
  const clock = clockMatch ? `${String(clockMatch[1]).padStart(2, "0")}:${String(clockMatch[2] || "0").padStart(2, "0")}` : null;
  const valid = iso && /^2026-(07|08)-(0[1-9]|[12]\d|3[01])$/.test(iso);
  return valid && iso >= DISASTER_DATE && iso <= END_DATE ? { date: iso, time: clock } : null;
}
function parseLeadingDate(value) {
  const normalized = value.replace(/[０-９]/g, digit => String("０１２３４５６７８９".indexOf(digit)));
  const match = normalized.match(/^(?:2026|令和\s*8)\s*[年./-]\s*(\d{1,2})\s*[月./-]\s*(\d{1,2})\s*日?/u);
  if (!match) return null;
  const date = `2026-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
  if (date < DISASTER_DATE || date > END_DATE) return null;
  const parsed = parseDate(value);
  return { date, time: parsed?.date === date ? parsed.time : null };
}
function allowed(url, official) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const officialHost = new URL(official).hostname.replace(/^www\./, "");
  return host === officialHost || host.endsWith(`.${officialHost}`);
}
function articleLike(url) {
  return /(?:\/kiji\d+|\/article\/view\/|\/q\/aview\/|\/page\d+|\/kinkyu\/|\/news\/|\/topics\/)/iu.test(new URL(url).pathname);
}
function hubLike(url) {
  return /(?:\/category\/list\/|\/list\d+\.html|\/new(?:_list)?\.html|\/q\/new\.html)/iu.test(new URL(url).pathname);
}
function canonicalArticleKey(url) {
  const parsed = new URL(url);
  const viewId = parsed.pathname.match(/\/q\/aview\/\d+\/(\d+)\.html$/i)?.[1];
  const articleId = parsed.pathname.match(/\/article\/view\/\d+\/(\d+)\.html$/i)?.[1];
  return viewId ? `${parsed.hostname}/q/aview/${viewId}` : articleId ? `${parsed.hostname}/article/view/${articleId}` : url;
}
async function get(url) {
  const response = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const type = response.headers.get("content-type") || "";
  if (!type.includes("html")) throw new Error(`HTMLではありません: ${type}`);
  const bytes = await response.arrayBuffer();
  const declared = type.match(/charset=([^;\s]+)/i)?.[1];
  const head = new TextDecoder("latin1").decode(bytes.slice(0, 4000));
  const meta = head.match(/charset=["']?([^"'\s/>;]+)/i)?.[1];
  const charset = (declared || meta || "utf-8").replace(/shift[-_]?jis|x-sjis|windows-31j/i, "shift_jis");
  let html;
  try { html = new TextDecoder(charset).decode(bytes); } catch { html = new TextDecoder("utf-8").decode(bytes); }
  return { html, finalUrl: response.url };
}
function anchors(html, base, config) {
  const result = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const title = clean(text(match[2]));
    if (!title || title.length < 3 || title.length > 180 || navigation(title) || excluded(title)) continue;
    let url;
    try { url = new URL(decode(match[1]), base); } catch { continue; }
    url.hash = "";
    if (!/^https?:$/.test(url.protocol) || !allowed(url.href, config.officialUrl) || /\.(?:jpg|jpeg|png|gif|zip|docx?|xlsx?)$/i.test(url.pathname)) continue;
    const context = text(html.slice(Math.max(0, match.index - 320), match.index + match[0].length + 320));
    result.push({ title, url: url.href, parsedDate: parseDate(context) });
  }
  return result;
}
function selfRecord(html, url, trustedByHub, verifiedDetail = false) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const ogTitle = html.match(/<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)/i)?.[1];
  const titleTag = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const title = clean(text(h1?.[1] || ogTitle || titleTag || ""));
  if (!title || excluded(title) || /くらし・手続き\s+健康・福祉/u.test(title) || (!verifiedDetail && !relevant(title) && !(trustedByHub && contextual(title)))) return null;
  const structuredDates = [...html.matchAll(/(?:datePublished|dateModified|datetime)["'=:\s]+([0-9T:+-]{10,})/gi)]
    .map(match => parseDate(match[1])).filter(Boolean).sort((a, b) => `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`));
  const around = h1 ? html.slice(Math.max(0, h1.index - 1000), Math.min(html.length, h1.index + h1[0].length + 2600)) : html.slice(0, 7000);
  // 見出しに「更新」と明記された日付を最優先し、次に構造化メタデータの
  // 最終日時を使う。ページ本文からの推定は最後の手段とする。
  const statedTitleDate = parseLeadingDate(title) || (/更新|時点|現在|掲載|発表/u.test(title) ? parseDate(title) : null);
  const date = statedTitleDate || structuredDates.at(-1) || parseDate(text(around)) || parseDate(text(html.slice(0, 18000)));
  return date ? { title, url, ...date, category: category(title) } : null;
}
// 八代市・氷川町の緊急情報は個別ページではなく、1ページ内の article 単位で更新される。
// 各記事の公式アンカーを原文リンクとして保存する。
function inlineEmergencyRecords(html, url) {
  const page = new URL(url);
  if (page.pathname !== "/kinkyu.html" || !/(?:city\.yatsushiro|town\.hikawa)\.kumamoto\.jp$/u.test(page.hostname)) return [];
  const records = [];
  for (const match of html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)) {
    const block = match[1];
    const id = block.match(/\bid=["'](kid\d+)["']/i)?.[1];
    const heading = block.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
    const timeElement = block.match(/<time\b[^>]*>([\s\S]*?)<\/time>/i)?.[1];
    const title = heading ? clean(text(heading)) : "";
    const parsedDate = timeElement ? parseDate(text(timeElement)) : null;
    if (!id || !title || !parsedDate || excluded(title)) continue;
    records.push({ title, url: `${page.origin}/kinkyu.html#${id}`, ...parsedDate, category: category(title) });
  }
  return records;
}
function pagination(html, base, config) {
  const urls = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    if (!/もっと見る|次へ|pagerhandler|[?&](?:pg|page)=\d+/iu.test(`${text(match[2])} ${match[1]}`)) continue;
    try {
      const url = new URL(decode(match[1]), base); url.hash = "";
      if (allowed(url.href, config.officialUrl)) urls.push(url.href);
    } catch {}
  }
  return urls;
}

const checkedAt = new Date().toISOString();
const records = [];
// 緊急情報一覧から削除された後も、取得済みの公式アンカー記録は時系列アーカイブに残す。
const preservedEmergency = new Map();
try {
  const previous = JSON.parse(await readFile(join(OUT, "municipality-updates.json"), "utf8"));
  for (const municipality of previous.municipalities || []) {
    preservedEmergency.set(municipality.name, municipality.updates
      ?.filter(update => /\/kinkyu\.html#kid/u.test(update.url)) || []);
  }
} catch {}
for (const config of municipalities) {
  const queue = [
    { url: config.officialUrl, kind: "home", trustedByHub: false },
    ...config.hubs.map(url => ({ url, kind: "hub", trustedByHub: true })),
    // details は公式検索と原文確認を経て登録した個別記事。
    ...config.details.map(url => ({ url, kind: "detail", trustedByHub: true, verifiedDetail: true }))
  ];
  const seen = new Set(), queued = new Set(queue.map(item => item.url)), updates = new Map(), errors = [];
  for (const update of config.preserved || []) updates.set(update.url, update);
  for (const update of preservedEmergency.get(config.name) || []) updates.set(update.url, update);
  let fetched = 0;
  while (queue.length && fetched < MAX_PAGES_PER_SITE) {
    const item = queue.shift();
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    try {
      const { html, finalUrl } = await get(item.url);
      fetched++;
      for (const update of inlineEmergencyRecords(html, finalUrl)) updates.set(update.url, update);
      const self = selfRecord(html, finalUrl, item.trustedByHub && item.kind === "detail", item.verifiedDetail);
      if (self) updates.set(self.url, self);
      const found = anchors(html, finalUrl, config);
      for (const link of found) {
        if (link.parsedDate && (relevant(link.title) || (item.kind === "hub" && (contextual(link.title) || config.trustAllHub)))) {
          updates.set(link.url, { title: link.title, url: link.url, ...link.parsedDate, category: category(link.title) });
        }
        // PDF等は一覧上の日付と表題を掲載できるが、HTML本文検査の巡回対象にはしない。
        const discoveredHub = hubLike(link.url) && relevant(link.title);
        if (discoveredHub && !seen.has(link.url) && !queued.has(link.url)) {
          queue.push({ url: link.url, kind: "hub", trustedByHub: true }); queued.add(link.url);
        }
        const shouldInspect = !discoveredHub && !/\.(?:pdf|docx?|xlsx?|zip)$/i.test(new URL(link.url).pathname) && articleLike(link.url) && (relevant(link.title) || (item.kind === "hub" && (contextual(link.title) || config.trustAllHub)));
        if (shouldInspect && !seen.has(link.url) && !queued.has(link.url)) {
          queue.push({ url: link.url, kind: "detail", trustedByHub: item.kind === "hub" });
          queued.add(link.url);
        }
      }
      if (item.kind === "hub") for (const url of pagination(html, finalUrl, config).reverse()) {
        // 一覧のページ送りを個別記事より先に確認し、古い発信を取りこぼさない。
        if (!seen.has(url) && !queued.has(url)) { queue.unshift({ url, kind: "hub", trustedByHub: true }); queued.add(url); }
      }
    } catch (error) { errors.push(`${item.url}: ${error.message}`); }
    await wait(180);
  }
  const canonicalUpdates = new Map();
  for (const update of updates.values()) {
    const key = canonicalArticleKey(update.url), previous = canonicalUpdates.get(key);
    if (!previous || update.date > previous.date || (update.date === previous.date && update.title.length > previous.title.length)) canonicalUpdates.set(key, update);
  }
  const sorted = [...canonicalUpdates.values()]
    // 一覧周辺の別の日付より、記事タイトル自身が明示する更新日・時点を優先する。
    // 「8月6日から」「8月31日まで」のような実施期間は掲載日ではないため対象外。
    .map(update => {
      const stated = parseLeadingDate(update.title) || (/更新|時点|現在|掲載|発表/u.test(update.title) ? parseDate(update.title) : null);
      return stated ? { ...update, ...stated } : update;
    })
    .filter(update => !/^(スポーツ|行政サイト|トップページ|アクセス|くらし・手続き|>>>.*一覧へ|月\d+日更新）)$/u.test(update.title) && !/(?:\/q\/list\/|\/category\/list\/|\/list\d+\.html)/i.test(new URL(update.url).pathname))
    .sort((a, b) => `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`));
  const unique = [], keys = new Set();
  for (const update of sorted) {
    // 緊急情報は同日に同じ見出しで複数回更新されるため、公式アンカーごとに保存する。
    const key = update.url.includes("/kinkyu.html#kid") ? update.url : `${update.date}|${update.title}`;
    if (!keys.has(key)) { keys.add(key); unique.push(update); }
  }
  records.push({ name: config.name, officialUrl: config.officialUrl, checkedAt, status: unique.length ? "confirmed" : fetched ? "not-found-by-collector" : "fetch-error", updates: unique, sourcesChecked: [...seen], pagesFetched: fetched, errors });
  console.log(`${config.name}: ${unique.length}件 (${fetched}ページ取得)`);
}

const dataset = {
  metadata: {
    event: "令和8年熊本地震", disasterDate: DISASTER_DATE, retrievedAt: checkedAt,
    scope: "各市町村の公式トップページ、確認済みの地震情報集約ページ、そのページに掲載された個別記事、および集約ページのページ送りを確認。令和8年7月28日以降の日付を公式ページ上で確認できた記事リンク",
    caveat: "公式サイトの構造・公開方式・検索可否により網羅性は保証できません。未検出は情報が存在しないことを意味しません。内容と最新状況はリンク先の一次情報で確認してください。",
    categoryNote: "分類は記事タイトルに基づく閲覧用の便宜的な分類です。"
  },
  municipalities: records
};
await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, "municipality-updates.json"), JSON.stringify(dataset, null, 2) + "\n");
await writeFile(GENERATED, "// 生成物・直接編集しない。生成: node tools/fetch-municipality-updates.mjs\nwindow.MUNICIPALITY_UPDATES = " + JSON.stringify(dataset) + ";\n");
console.log(`合計 ${records.reduce((sum, record) => sum + record.updates.length, 0)}件`);
