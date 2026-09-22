// 暮らしの支援ガイド（4市町）の掲載カバー率を調べる共通処理。
// 自治体公式の制度一覧・カテゴリ索引から制度候補を抽出し、ページ掲載分と突き合わせる。
// ネットワークアクセスはしない（呼び出し側が取得したHTMLを渡す）。

import fs from "node:fs";
import path from "node:path";

// 制度名に含まれうる語。索引ページのナビゲーションと区別するために使う。
const PROGRAM_WORDS = /補助|助成|給付|支援金|貸付|融資|手当|祝金|奨学|免除|減免|無償|貸与|利子補給|交付金|支給/;
// 索引・ナビゲーション由来の行を落とす。
const NOISE_TITLE = /^(ホーム|トップ|サイトマップ|お問い合わせ|プライバシー|アクセシビリティ|Foreign|文字サイズ|背景色|検索|前の記事|次の記事|一覧|\d+)$/;
// 制度一覧ページ（curated）で拾わないナビゲーション見出し。
const CURATED_NAVIGATION = /^(移住定住情報|空き家バンク|お知らせ|新着情報|支援制度一覧|支援制度について|移住相談・定住支援|登録物件情報|イベントカレンダー(から)?|申請書(ダウンロード|検索)|組織から|分類から|サイトマップから|ライフイベントから|ランキングから|前の記事へ|次の記事へ|町の紹介|市の紹介|プライバシーポリシー|アクセシビリティ|Foreign Language|消費生活センター|.*公共交通|医療機関.*事業所)$/;
// 制度個別ページらしいURLの形（curatedで使う）。
const ARTICLE_URL = /(kiji\d+|article\/view|q\/aview|\/\d{6,7})(\/|$|\.)/;

export const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));

// 索引は文字列URL、または { url, curated } で指定できる。
export const indexEntry = index => (typeof index === "string" ? { url: index, curated: false } : { url: index.url, curated: Boolean(index.curated) });

export const decodeEntities = value => value
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&rArr;|&rarr;/g, "")
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

// 「令和８年度」のような全角数字・英字を半角に揃える。
export const toHalfWidth = value => value.replace(/[０-９Ａ-Ｚａ-ｚ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xFEE0));

export const plainText = html => decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

// 「令和8年度」「（〜）」「事業」などの揺れを落として突合するためのキー。
export function normalizeTitle(title) {
  return toHalfWidth(decodeEntities(title))
    .replace(/^\d{4}年\d{1,2}月\d{1,2}日/, "")
    .replace(/^(令和|平成)\d+年度?/, "")
    .replace(/[（(][^)）]*[)）]/g, "")
    .replace(/【[^】]*】/g, "")
    .replace(/[\s　・,，.。!！?？"'"']/g, "")
    .replace(/(事業|制度|補助金|助成金|給付金|について|のお知らせ|のご案内|します|ます|等)/g, "");
}

// curated=true の索引（自治体が作った制度一覧）では、制度名に補助・助成等の語が
// 含まれない制度（住宅リフォーム等促進事業、病児・病後児保育事業など）も拾う。
export const isProgramTitle = (title, { curated = false, url = "" } = {}) => {
  const text = decodeEntities(title).trim();
  if (text.length < 5 || NOISE_TITLE.test(text)) return false;
  if (PROGRAM_WORDS.test(text)) return true;
  if (!curated) return false;
  if (CURATED_NAVIGATION.test(text)) return false;
  return ARTICLE_URL.test(url);
};

// 同じ記事がカテゴリ違いのURLで出てくるため、記事IDを取り出して突合キーにする。
export function urlKey(url) {
  const kiji = url.match(/kiji(\d+)/);
  if (kiji) return `kiji${kiji[1]}`;
  const article = url.match(/\/(?:article\/view|q\/aview)\/\d+\/(\d+)\.html/);
  if (article) return `article${article[1]}`;
  const numeric = url.match(/\/(\d{6,8})(?:[/?#]|$)/);
  if (numeric) return `id${numeric[1]}`;
  return url.replace(/\/$/, "");
}

// 索引の一覧表示に混ざる日付や「キーワードマッチ」を落とす。
export function cleanTitle(title) {
  return title
    .replace(/^キーワードマッチ\s*/, "")
    .replace(/^\d{4}年\d{1,2}月\d{1,2}日\s*/, "")
    .replace(/^(?:令和|平成)\s*[\d０-９]+年\s*\d{1,2}月\s*\d{1,2}日\s*/, "")
    .replace(/[.．]{2,}$|[…‥]$/, "")
    .trim();
}

// ページ内の制度カード（タイトルと公式リンク）を取り出す。
export function readCards(file) {
  const html = fs.readFileSync(file, "utf8");
  return html.split('<article class="uto-card"').slice(1).map(part => {
    const body = part.split("</article>")[0];
    const title = plainText((body.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] || "");
    const links = [...body.matchAll(/<a class="uto-card-link"[^>]*href="([^"]+)"/g)].map(match => match[1]);
    return { title, links };
  }).filter(card => card.title);
}

// 索引ページのHTMLから制度候補（タイトルとURL）を抽出する。
export function extractCandidates(html, { indexUrl, origin, curated = false }) {
  const found = new Map();
  for (const match of html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const title = cleanTitle(plainText(match[2]));
    let href = match[1];
    if (/^(javascript:|mailto:|tel:|#)/i.test(href)) continue;
    if (href.startsWith("//")) href = `https:${href}`;
    else if (href.startsWith("/")) href = `${origin}${href}`;
    else if (!/^https?:/i.test(href)) href = new URL(href, indexUrl).href;
    if (!href.startsWith(origin)) continue;
    if (!isProgramTitle(title, { curated, url: href })) continue;
    if (!found.has(title)) found.set(title, href);
  }
  return [...found].map(([title, url]) => ({ title, url }));
}

// 候補がページ（および姉妹ページ）に載っているかを判定する。
export function classifyCandidate(candidate, { cards, cardUrls, siblingTexts, knownKeys }) {
  const key = normalizeTitle(candidate.title);
  if (!key) return { coverage: "ignored", reason: "タイトルを正規化できません" };
  if ([...knownKeys].some(known => known && (known === key || key.includes(known) || known.includes(key)))) {
    return { coverage: "known", reason: "対象外として登録済み" };
  }
  if (cardUrls.has(urlKey(candidate.url))) return { coverage: "listed", reason: "同じ記事を参照するカードがあります" };
  for (const card of cards) {
    const cardKey = normalizeTitle(card.title);
    if (!cardKey) continue;
    if (cardKey.includes(key) || key.includes(cardKey)) return { coverage: "listed", reason: `カード「${card.title}」と一致` };
  }
  const key2 = urlKey(candidate.url);
  const sibling = siblingTexts.find(entry => entry.text.includes(candidate.url) || entry.keys?.has(key2));
  if (sibling) return { coverage: "sibling", reason: `${sibling.file} に掲載` };
  return { coverage: "unlisted", reason: "" };
}

// WAFやレート制限による403・429・5xxは「リンク切れ」ではなく判定不能として扱う。
export const isDeadStatus = status => status === 404 || status === 410 || status === 0;

export function buildReport({ config, fetched, now, deadLinks, blockedLinks, indexErrorDetails }) {
  const municipalities = [];
  for (const municipality of config.municipalities) {
    const cards = readCards(municipality.page);
    const cardUrls = new Set(cards.flatMap(card => card.links).map(urlKey));
    const siblingTexts = (municipality.siblingPages || [])
      .filter(file => fs.existsSync(file))
      .map(file => {
        const text = fs.readFileSync(file, "utf8");
        const keys = new Set([...text.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(match => urlKey(match[1])));
        return { file, text, keys };
      });
    const knownKeys = new Set((config.known || [])
      .filter(item => !item.municipality || item.municipality === municipality.id)
      .map(item => normalizeTitle(item.title)));

    const candidates = new Map();
    for (const index of municipality.indexes) {
      const { url: indexUrl, curated } = indexEntry(index);
      const html = fetched.get(indexUrl);
      if (typeof html !== "string") continue;
      for (const candidate of extractCandidates(html, { indexUrl, origin: municipality.origin, curated })) {
        if (!candidates.has(candidate.url) || candidates.get(candidate.url).title.length > candidate.title.length) {
          candidates.set(candidate.url, candidate);
        }
      }
    }

    const classified = [...candidates.values()].map(candidate => ({
      ...candidate,
      ...classifyCandidate(candidate, { cards, cardUrls, siblingTexts, knownKeys })
    }));
    const count = coverage => classified.filter(item => item.coverage === coverage).length;
    municipalities.push({
      id: municipality.id,
      name: municipality.name,
      page: municipality.page,
      cardCount: cards.length,
      candidateCount: classified.length,
      listedCount: count("listed"),
      siblingCount: count("sibling"),
      knownCount: count("known"),
      indexErrors: municipality.indexes.map(index => indexEntry(index).url).filter(url => typeof fetched.get(url) !== "string"),
      unlisted: classified.filter(item => item.coverage === "unlisted" || item.coverage === "sibling")
        .map(({ title, url, coverage, reason }) => ({ title, url, coverage, reason }))
        .sort((a, b) => a.title.localeCompare(b.title, "ja"))
    });
  }
  return {
    schemaVersion: "1.0.0",
    generatedAt: now,
    municipalities,
    deadLinks: deadLinks || [],
    blockedLinks: blockedLinks || [],
    indexErrorDetails: indexErrorDetails || [],
    summary: {
      cardCount: municipalities.reduce((total, item) => total + item.cardCount, 0),
      unlistedCount: municipalities.reduce((total, item) => total + item.unlisted.length, 0),
      deadLinkCount: (deadLinks || []).length,
      blockedLinkCount: (blockedLinks || []).length,
      indexErrorCount: municipalities.reduce((total, item) => total + item.indexErrors.length, 0)
    }
  };
}

// 候補URLの死活確認の結果を反映する。自治体側で消えた記事は掲載漏れではないため分ける。
export function applyCandidateStatuses(report, statusByUrl) {
  for (const municipality of report.municipalities) {
    const stale = [];
    municipality.unlisted = municipality.unlisted.filter(entry => {
      const status = statusByUrl.get(entry.url);
      if (status === undefined || status === 200) return true;
      stale.push({ ...entry, status });
      return false;
    });
    municipality.staleCandidates = stale;
  }
  report.summary.unlistedCount = report.municipalities.reduce((total, item) => total + item.unlisted.length, 0);
  report.summary.staleCandidateCount = report.municipalities.reduce((total, item) => total + (item.staleCandidates?.length || 0), 0);
  return report;
}

// 前回レポートと比べて新規に現れた未掲載制度・リンク切れを返す。
export function diffReports(previous, current) {
  const previousUnlisted = new Set((previous?.municipalities || []).flatMap(item => item.unlisted.map(entry => `${item.id}\t${entry.url}`)));
  const previousDead = new Set((previous?.deadLinks || []).map(entry => `${entry.page}\t${entry.url}`));
  const newUnlisted = current.municipalities.flatMap(item => item.unlisted
    .filter(entry => !previousUnlisted.has(`${item.id}\t${entry.url}`))
    .map(entry => ({ municipality: item.name, ...entry })));
  const newDeadLinks = current.deadLinks.filter(entry => !previousDead.has(`${entry.page}\t${entry.url}`));
  return { newUnlisted, newDeadLinks };
}

export function formatSummary(report) {
  const lines = [`## 暮らしの支援ガイド 掲載カバー率（${report.generatedAt}）`];
  for (const municipality of report.municipalities) {
    lines.push(`- ${municipality.name}（${municipality.page}）: 掲載 ${municipality.cardCount}件 / 公式候補 ${municipality.candidateCount}件 / 未掲載 ${municipality.unlisted.length}件`
      + (municipality.indexErrors.length ? ` / 索引取得失敗 ${municipality.indexErrors.length}件` : ""));
    for (const entry of municipality.unlisted) {
      lines.push(`    ${entry.coverage === "sibling" ? "△" : "●"} ${entry.title}${entry.reason ? `（${entry.reason}）` : ""}`);
      lines.push(`       ${entry.url}`);
    }
  }
  if (report.deadLinks.length) {
    lines.push(`- リンク切れ ${report.deadLinks.length}件`);
    for (const entry of report.deadLinks) lines.push(`    ✕ [${entry.status}] ${entry.page} → ${entry.url}`);
  } else {
    lines.push("- リンク切れ: なし");
  }
  if (report.blockedLinks?.length) {
    lines.push(`- 判定不能（403・429・5xx等） ${report.blockedLinks.length}件：実行環境からのアクセスが拒否された可能性があります`);
    for (const entry of report.blockedLinks.slice(0, 5)) lines.push(`    ? [${entry.status}] ${entry.url}`);
    if (report.blockedLinks.length > 5) lines.push(`    …ほか ${report.blockedLinks.length - 5}件`);
  }
  if (report.indexErrorDetails?.length) {
    lines.push(`- 索引の取得に失敗 ${report.indexErrorDetails.length}件：この自治体は掲載漏れを検出できていません`);
    for (const entry of report.indexErrorDetails.slice(0, 5)) lines.push(`    ! [${entry.status}] ${entry.url}`);
    if (report.indexErrorDetails.length > 5) lines.push(`    …ほか ${report.indexErrorDetails.length - 5}件`);
  }
  return lines.join("\n");
}

export const reportPath = path.join("reports", "living-support-coverage.json");
export const configPath = path.join("sources", "living-support-coverage-targets.json");
