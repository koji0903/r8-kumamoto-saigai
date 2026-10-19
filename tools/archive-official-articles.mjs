#!/usr/bin/env node
/**
 * 自治体からの最新収集情報をアーカイブし、サイト内記事ページを自動生成する。
 *
 * 目的:
 * 自治体公式サイト側で時間が経過して記事が移動・削除・404になっても、
 * 発災当時の配信内容が当サイト内で永続的に参照できるようにする。
 * （※各記事ページには自治体の一次情報元URLを明確に記載・リンクする）
 *
 * 生成物:
 * - official-articles/{id}.html (各記事のHTMLページ)
 * - official-articles/index.html (全アーカイブ記事の一覧ページ)
 * - sources/official/articles/{id}.json (抽出された本文・メタデータ)
 * - sources/official/articles/archive-index.json (記事IDと元URLのマッピング目録)
 * - data/generated/official-articles-index.js (フロントエンド用インデックス)
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const execFileAsync = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_JSON = join(ROOT, "sources/official/topics/latest-topics.json");
const MUNI_UPDATES_JSON = join(ROOT, "sources/official/municipalities/municipality-updates.json");
const ARTICLES_HTML_DIR = join(ROOT, "official-articles");
const ARTICLES_DATA_DIR = join(ROOT, "sources/official/articles");
const ARCHIVE_INDEX_JSON = join(ARTICLES_DATA_DIR, "archive-index.json");
const GENERATED_INDEX_JS = join(ROOT, "data/generated/official-articles-index.js");

const UA = "Mozilla/5.0 (compatible; r8-kumamoto-saigai/1.1; +https://github.com/koji0903/r8-kumamoto-saigai)";

// 自治体名から英名キーへのマッピング
const MUNI_KEYS = {
  "熊本市": "kumamoto", "八代市": "yatsushiro", "宇土市": "uto", "宇城市": "uki",
  "氷川町": "hikawa", "益城町": "mashiki", "菊陽町": "kikuyo", "合志市": "koshi",
  "甲佐町": "kosa", "美里町": "misato", "御船町": "mifune", "嘉島町": "kashima",
  "西原村": "nishihara", "山鹿市": "yamaga", "菊池市": "kikuchi", "玉名市": "tamana",
  "天草市": "amakusa", "上天草市": "kamiamakusa", "水俣市": "minamata", "芦北町": "ashikita",
  "津奈木町": "tsunagi"
};

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const fileExists = async path => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

// URLから安全で一意なIDを生成
function generateArticleId(muniName, dateStr, url) {
  const muniKey = MUNI_KEYS[muniName] || "muni";
  const cleanDate = (dateStr || "2026-00-00").replace(/-/g, "");
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 8);
  return `${muniKey}-${cleanDate}-${hash}`;
}

// curl による取得フォールバック（宇土市等の403対策）
async function fetchWithCurl(url) {
  try {
    const { stdout } = await execFileAsync("curl", [
      "--fail", "--silent", "--show-error", "--location",
      "--connect-timeout", "15", "--max-time", "35",
      "--user-agent", UA, url
    ], { encoding: "buffer", maxBuffer: 32 * 1024 * 1024, timeout: 40000 });
    return new TextDecoder("utf-8").decode(stdout);
  } catch (error) {
    return null;
  }
}

// ページ取得
async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) {
      if ([403, 429, 500, 502, 503].includes(res.status)) {
        const curlHtml = await fetchWithCurl(url);
        if (curlHtml) return { type: "html", content: curlHtml, status: 200 };
      }
      return { type: "error", status: res.status, content: null };
    }
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/pdf") || url.toLowerCase().endsWith(".pdf")) {
      return { type: "pdf", url, status: 200 };
    }
    const content = await res.text();
    return { type: "html", content, status: 200 };
  } catch (error) {
    const curlHtml = await fetchWithCurl(url);
    if (curlHtml) return { type: "html", content: curlHtml, status: 200 };
    return { type: "error", error: error.message, content: null };
  }
}

// 相対リンク・画像URLを絶対URLに正規化
function resolveUrls(html, baseUrl) {
  return html.replace(/\b(href|src)=["']([^"']+)["']/gi, (match, attr, path) => {
    if (path.startsWith("#") || path.startsWith("javascript:") || path.startsWith("mailto:") || path.startsWith("tel:")) {
      return match;
    }
    try {
      const abs = new URL(path, baseUrl).href;
      return `${attr}="${abs}"`;
    } catch {
      return match;
    }
  });
}

// 自治体HTMLからメインコンテンツを抽出
function extractArticleContent(rawHtml, baseUrl) {
  if (!rawHtml) return null;

  // 不要タグの削除
  let clean = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // 主要なコンテンツブロックのセレクタ探索
  const contentPatterns = [
    /<div[^>]+class=["'][^"']*article-view[^"']*["'][^>]*>([\s\S]*?)<\/div>(?=\s*<(?:div|footer|nav)|\s*$)/i,
    /<div[^>]+id=["']kiji_detail["'][^>]*>([\s\S]*?)<\/div>(?=\s*<(?:div|footer|nav)|\s*$)/i,
    /<div[^>]+class=["'][^"']*kiji-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]+id=["']main-content["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]+id=["']detail["'][^>]*>([\s\S]*?)<\/div>/i,
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]+class=["'][^"']*mol_contents[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]+id=["']contents["'][^>]*>([\s\S]*?)<\/div>/i
  ];

  let bodyHtml = "";
  for (const pattern of contentPatterns) {
    const match = clean.match(pattern);
    if (match && match[1] && match[1].replace(/<[^>]+>/g, "").trim().length > 100) {
      bodyHtml = match[1];
      break;
    }
  }

  // フォールバック: bodyの中身
  if (!bodyHtml) {
    const bodyMatch = clean.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    bodyHtml = bodyMatch ? bodyMatch[1] : clean;
  }

  // ヘッダー、ナビ、フッター、検索フォーム、アクセシビリティバー等の不要パーツを除去
  bodyHtml = bodyHtml
    .replace(/<header\b[\s\S]*?<\/header>/gi, "")
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, "")
    .replace(/<form\b[\s\S]*?<\/form>/gi, "")
    .replace(/<div[^>]+class=["'][^"']*(?:breadcrumb|header|footer|sns|share|print|content-search|search-box|site-search)[^"']*["'][\s\S]*?<\/div>/gi, "")
    .replace(/<div[^>]+id=["'](?:skiplink|site-header|site-footer|header|footer)["'][\s\S]*?<\/div>/gi, "");

  // URLを絶対パスに補正
  bodyHtml = resolveUrls(bodyHtml, baseUrl);

  // 外部リンクに target="_blank" と rel="noopener" を付与
  bodyHtml = bodyHtml.replace(/<a\b([^>]*href=["']https?:\/\/[^"']+["'][^>]*)>/gi, (m, attrs) => {
    if (!attrs.includes("target=")) attrs += ' target="_blank" rel="noopener noreferrer"';
    return `<a ${attrs}>`;
  });

  return bodyHtml.trim();
}

// 記事ページHTMLテンプレート
function renderArticleHtml(article) {
  const { id, title, municipality, category, date, time, url, bodyHtml, retrievedAt, isPdf } = article;
  const pageTitle = `【${municipality}】${title}（自治体公式情報アーカイブ）`;
  const desc = `${municipality}公式発表「${title}」（${date}）。自治体公式サイトの配信情報を発災時の記録およびリンク切れ防止のために保存したアーカイブページです。`;

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(pageTitle)}｜よか隊ネット熊本</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="icon" href="../favicon.png" sizes="32x32">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="stylesheet" href="../styles.css?v=20260817-4">
  <link rel="stylesheet" href="../design-system.css?v=20260810-1">
  <link rel="stylesheet" href="../org-site.css?v=20260907-2">
  <link rel="stylesheet" href="official-article.css?v=20261020-1">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:site_name" content="よか隊ネット熊本　災害・支援状況レポート">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="https://www.yokatainet.jp/official-articles/${esc(id)}.html">
  <meta name="twitter:card" content="summary">
</head>
<body class="organization-site official-article-page">
  <a class="skip" href="#main">本文へ移動</a>

  <header class="site-header">
    <a class="brand" href="../index.html">
      <span class="brand-mark" aria-hidden="true">よ</span>
      <span>よか隊ネット熊本<br><b>災害・支援状況レポート</b></span>
    </a>
    <nav aria-label="メインメニュー">
      <a href="../disaster.html">支援情報トップ</a>
      <a href="../affected.html">被災された方</a>
      <a href="../supporters.html">支援する方</a>
      <a href="../municipalities.html">地域・避難所</a>
      <a href="../reconstruction.html">暮らしの再建</a>
      <a href="../timeline.html">日々の記録</a>
      <a href="../meetings.html">議事録</a>
    </nav>
  </header>

  <main id="main">
    <div class="article-container">
      <nav class="breadcrumb" aria-label="パンくずリスト">
        <a href="../index.html">ホーム</a> &gt;
        <a href="index.html">自治体公式情報アーカイブ</a> &gt;
        <span class="current">${esc(title)}</span>
      </nav>

      <!-- アーカイブ告知バナー -->
      <div class="archive-notice-banner">
        <span class="archive-notice-icon">🏛</span>
        <div class="archive-notice-text">
          <strong>自治体公式発表アーカイブ（一次情報保全）</strong>
          <p>この記事は、${esc(municipality)}が公表した公式配信情報を、発災時の記録および自治体サイト側の更新・リンク切れに備えて保存したアーカイブです。</p>
        </div>
      </div>

      <article class="official-article-card">
        <header class="article-header">
          <div class="article-meta-bar">
            <span class="muni-badge">${esc(municipality)}</span>
            <time class="article-date" datetime="${esc(date)}">${esc(date)}${time ? ` ${esc(time)}` : ""}</time>
            <span class="category-tag">${esc(category || "公式発表")}</span>
          </div>
          <h1>${esc(title)}</h1>

          <div class="official-source-box">
            <span class="source-label">自治体公式元リンク（一次情報）：</span>
            <a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="source-link">
              ${esc(url)} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </header>

        <div class="article-body">
          ${isPdf ? `
          <div class="attachment-box">
            <div class="attachment-title">📄 PDF形式の公式資料です</div>
            <p>この配信情報はPDFファイルとして自治体より公開されています。下記の公式リンクより直接ダウンロード・閲覧いただけます。</p>
            <ul class="attachment-list">
              <li>
                <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">
                  ${esc(title)} を開く（PDF） ↗
                </a>
              </li>
            </ul>
          </div>
          ` : (bodyHtml || `
          <p>本文のテキスト抽出が完了していません。最新の内容については下記の自治体公式サイトよりご確認ください。</p>
          `)}
        </div>

        <footer class="article-footer">
          <div class="official-action-area">
            <p class="action-desc">
              発表元：<b>${esc(municipality)}</b><br>
              取得日時：${new Date(retrievedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
            </p>
            <a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="btn-official-external">
              自治体の公式元ページを開く ↗
            </a>
          </div>

          <div class="archive-disclaimer">
            <p>※自治体サイト側のページ再編や終了等により、元リンクが変更または削除（リンク切れ）となっている場合があります。</p>
            <p>※制度の詳細・受付期間・最新の申請状況については、${esc(municipality)}の担当窓口へ直接ご確認ください。</p>
          </div>
        </footer>
      </article>

      <div class="article-back-nav">
        <a href="../index.html">← トップページに戻る</a>
        <a href="index.html">自治体公式アーカイブ一覧へ →</a>
      </div>
    </div>
  </main>

  <footer class="site-footer">
    <div class="site-footer-inner">
      <p>一般社団法人よか隊ネット熊本　災害・支援状況レポート</p>
      <p class="footer-sub">自治体や関係機関の一次情報をもとに、被災者支援と生活再建に必要な情報を整理・発信しています。</p>
    </div>
  </footer>
</body>
</html>
`;
}

// アーカイブ目録（一覧）ページのHTMLテンプレート
function renderArchiveIndexHtml(articles) {
  const muniGroups = {};
  for (const art of articles) {
    if (!muniGroups[art.municipality]) muniGroups[art.municipality] = [];
    muniGroups[art.municipality].push(art);
  }

  const muniCardsHtml = Object.entries(muniGroups).map(([muni, items]) => `
    <section class="muni-archive-group" id="muni-${esc(MUNI_KEYS[muni] || 'other')}">
      <h3>${esc(muni)} （${items.length}件）</h3>
      <div class="archive-list">
        ${items.map(item => `
          <div class="archive-item">
            <div class="item-meta">
              <time datetime="${esc(item.date)}">${esc(item.date)}</time>
              <span class="category-tag">${esc(item.category || "公式発表")}</span>
            </div>
            <h4>
              <a href="${esc(item.id)}.html">${esc(item.title)}</a>
            </h4>
            <div class="item-ext">
              <a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" title="自治体元リンク">公式元ページ ↗</a>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `).join("");

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>自治体公式発表アーカイブ（一次情報保全）｜よか隊ネット熊本</title>
  <meta name="description" content="熊本県内の被災自治体から配信された公式発表・支援情報・生活関連情報のアーカイブ一覧。自治体サイトのリンク切れ防止および発災時記録として保存。">
  <link rel="icon" href="../favicon.png" sizes="32x32">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="stylesheet" href="../styles.css?v=20260817-4">
  <link rel="stylesheet" href="../design-system.css?v=20260810-1">
  <link rel="stylesheet" href="../org-site.css?v=20260907-2">
  <link rel="stylesheet" href="official-article.css?v=20261020-1">
  <style>
    .archive-hub-header { margin-bottom: 2rem; border-left: 5px solid #0f766e; padding-left: 1.25rem; }
    .archive-hub-header h1 { font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; }
    .archive-hub-header p { font-size: 0.98rem; color: #475569; margin: 0; line-height: 1.6; }
    .muni-quick-jump { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 1.5rem 0 2rem; background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; }
    .muni-jump-btn { font-size: 0.85rem; font-weight: 700; color: #0f766e; background: #f0fdfa; border: 1px solid #ccfbf1; padding: 0.3rem 0.65rem; border-radius: 4px; text-decoration: none; }
    .muni-jump-btn:hover { background: #0f766e; color: #ffffff; }
    .muni-archive-group { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .muni-archive-group h3 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .archive-list { display: flex; flex-direction: column; gap: 0.85rem; }
    .archive-item { display: flex; flex-direction: column; gap: 0.25rem; padding-bottom: 0.85rem; border-bottom: 1px dashed #e2e8f0; }
    .archive-item:last-child { border-bottom: none; padding-bottom: 0; }
    .item-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #64748b; }
    .archive-item h4 { font-size: 1.02rem; font-weight: 700; margin: 0; line-height: 1.4; }
    .archive-item h4 a { color: #0284c7; text-decoration: none; }
    .archive-item h4 a:hover { text-decoration: underline; color: #0369a1; }
    .item-ext { font-size: 0.8rem; }
    .item-ext a { color: #64748b; text-decoration: none; }
    .item-ext a:hover { text-decoration: underline; }
  </style>
</head>
<body class="organization-site official-article-page">
  <header class="site-header">
    <a class="brand" href="../index.html">
      <span class="brand-mark" aria-hidden="true">よ</span>
      <span>よか隊ネット熊本<br><b>災害・支援状況レポート</b></span>
    </a>
    <nav aria-label="メインメニュー">
      <a href="../disaster.html">支援情報トップ</a>
      <a href="../affected.html">被災された方</a>
      <a href="../supporters.html">支援する方</a>
      <a href="../municipalities.html">地域・避難所</a>
      <a href="../reconstruction.html">暮らしの再建</a>
      <a href="../timeline.html">日々の記録</a>
      <a href="../meetings.html">議事録</a>
    </nav>
  </header>

  <main id="main">
    <div class="article-container">
      <nav class="breadcrumb" aria-label="パンくずリスト">
        <a href="../index.html">ホーム</a> &gt;
        <span class="current">自治体公式発表アーカイブ</span>
      </nav>

      <div class="archive-hub-header">
        <h1>自治体公式発表アーカイブ（一次情報保全）</h1>
        <p>熊本県内の各市町村から発信された公式発表・支援情報・生活情報を取得・アーカイブしています。自治体サイト側でリンクが切れたり終了した記事も、発災時の記録としていつでも参照できます。</p>
      </div>

      <div class="muni-quick-jump">
        ${Object.keys(muniGroups).map(muni => `
          <a class="muni-jump-btn" href="#muni-${esc(MUNI_KEYS[muni] || 'other')}">${esc(muni)}</a>
        `).join("")}
      </div>

      ${muniCardsHtml}
    </div>
  </main>

  <footer class="site-footer">
    <div class="site-footer-inner">
      <p>一般社団法人よか隊ネット熊本　災害・支援状況レポート</p>
    </div>
  </footer>
</body>
</html>
`;
}

async function main() {
  await mkdir(ARTICLES_HTML_DIR, { recursive: true });
  await mkdir(ARTICLES_DATA_DIR, { recursive: true });

  const [topicsRaw, muniUpdatesRaw] = await Promise.all([
    readFile(TOPICS_JSON, "utf8").catch(() => "{}"),
    readFile(MUNI_UPDATES_JSON, "utf8").catch(() => "{}")
  ]);

  const topics = JSON.parse(topicsRaw);
  const muniUpdates = JSON.parse(muniUpdatesRaw);

  // 対象記事を収集（重複はURL単位で排除）
  const candidates = [];
  const seenUrls = new Set();

  if (Array.isArray(topics.municipalities)) {
    for (const item of topics.municipalities) {
      if (item.url && !seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        candidates.push(item);
      }
    }
  }

  // 既存のアーカイブインデックスを読み込み
  let existingIndex = {};
  if (await fileExists(ARCHIVE_INDEX_JSON)) {
    try {
      existingIndex = JSON.parse(await readFile(ARCHIVE_INDEX_JSON, "utf8"));
    } catch {}
  }

  console.log(`アーカイブ対象候補: ${candidates.length}件`);

  const archivedArticles = [];

  for (const item of candidates) {
    const id = generateArticleId(item.municipality, item.date, item.url);
    const htmlPath = join(ARTICLES_HTML_DIR, `${id}.html`);
    const jsonPath = join(ARTICLES_DATA_DIR, `${id}.json`);

    let articleRecord = null;

    // キャッシュ確認: 既に保存済みであれば再取得しない
    if (await fileExists(htmlPath) && await fileExists(jsonPath)) {
      try {
        articleRecord = JSON.parse(await readFile(jsonPath, "utf8"));
      } catch {}
    }

    // 未取得の場合はフェッチして本文抽出
    if (!articleRecord) {
      console.log(`[アーカイブ取得] ${item.municipality}: ${item.title}`);
      const fetched = await fetchPage(item.url);
      const retrievedAt = new Date().toISOString();

      let bodyHtml = "";
      let isPdf = fetched.type === "pdf";

      if (fetched.type === "html" && fetched.content) {
        bodyHtml = extractArticleContent(fetched.content, item.url);
      }

      articleRecord = {
        id,
        url: item.url,
        title: item.title,
        municipality: item.municipality,
        category: item.category || "その他",
        date: item.date,
        time: item.time || null,
        retrievedAt,
        bodyHtml,
        isPdf
      };

      await writeFile(jsonPath, JSON.stringify(articleRecord, null, 2) + "\n", "utf8");
      const pageHtml = renderArticleHtml(articleRecord);
      await writeFile(htmlPath, pageHtml, "utf8");

      // サーバー負荷軽減のウェイト
      await sleep(400);
    }

    archivedArticles.push(articleRecord);
    existingIndex[item.url] = {
      id,
      htmlPath: `official-articles/${id}.html`,
      title: item.title,
      municipality: item.municipality,
      date: item.date,
      retrievedAt: articleRecord.retrievedAt
    };
  }

  // インデックスの保存
  await writeFile(ARCHIVE_INDEX_JSON, JSON.stringify(existingIndex, null, 2) + "\n", "utf8");

  // 日付順にソートして一覧ページを生成
  archivedArticles.sort((a, b) => `${b.date} ${b.time || ""}`.localeCompare(`${a.date} ${a.time || ""}`));
  const indexHtml = renderArchiveIndexHtml(archivedArticles);
  await writeFile(join(ARTICLES_HTML_DIR, "index.html"), indexHtml, "utf8");

  // JSインデックスの生成（フロントエンドやビルドツール用）
  const jsContent = `// 生成物・直接編集しない。生成: node tools/archive-official-articles.mjs\nwindow.OFFICIAL_ARTICLES_INDEX = ${JSON.stringify(existingIndex, null, 2)};\n`;
  await writeFile(GENERATED_INDEX_JS, jsContent, "utf8");

  console.log(`アーカイブ完了: 全 ${archivedArticles.length} 件の記事ページを生成・更新しました。`);
}

main().catch(error => {
  console.error("アーカイブ処理エラー:", error);
  process.exit(1);
});
