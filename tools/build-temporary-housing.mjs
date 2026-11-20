#!/usr/bin/env node
/**
 * tools/build-temporary-housing.mjs
 * 
 * 建設型応急住宅・みなし仮設ガイド（temporary-housing.html）の自動生成・同期スクリプト。
 * 
 * 1. sources/official/municipalities/municipality-updates.json（自治体公式新着発信）
 * 2. sources/official/articles/archive-index.json（サイト内保存済み記事インデックス）
 * 3. sources/official/topics/latest-topics.json（自動収集メタデータ）
 * 
 * を統合し、
 * ・temporary-housing.html 内に「自治体公式 仮設住宅・みなし仮設の最新募集・発表タイムライン」を自動埋め込み・更新する。
 * 
 * 使い方:
 *   node tools/build-temporary-housing.mjs          # 生成・更新
 *   node tools/build-temporary-housing.mjs --check  # 差分検査
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MUNI_UPDATES_PATH = join(ROOT, "sources/official/municipalities/municipality-updates.json");
const ARCHIVE_INDEX_PATH = join(ROOT, "sources/official/articles/archive-index.json");
const OFFICIAL_TOPICS_PATH = join(ROOT, "sources/official/topics/latest-topics.json");
const HTML_PATH = join(ROOT, "temporary-housing.html");

const checkOnly = process.argv.includes("--check");
const OFFICIAL_URL_OVERRIDES = new Map([
  ["https://www.city.uto.lg.jp/article/view/1307/16820.html", "https://www.city.uto.lg.jp/"],
  ["https://www.city.uto.lg.jp/article/view/1007/16820.html", "https://www.city.uto.lg.jp/"],
  ["https://www.city.uto.lg.jp/d?q=d48942a8dec649b6d65971ddb4dae5b4.docx", "https://www.city.uto.lg.jp/"]
]);

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const formatDate = dateStr => {
  if (!dateStr) return "";
  const m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  return `${Number(m[2])}月${Number(m[3])}日`;
};

const normalizeGeneratedText = value => String(value)
  .replace(/\r\n?/g, "\n")
  .replace(/[\t ]+$/gm, "");

async function main() {
  const [muniUpdatesRaw, archiveIndexRaw, officialTopicsRaw, htmlContent] = await Promise.all([
    readFile(MUNI_UPDATES_PATH, "utf8").catch(() => '{"municipalities":[]}'),
    readFile(ARCHIVE_INDEX_PATH, "utf8").catch(() => "{}"),
    readFile(OFFICIAL_TOPICS_PATH, "utf8").catch(() => "{}"),
    readFile(HTML_PATH, "utf8")
  ]);

  const muniUpdates = JSON.parse(muniUpdatesRaw);
  const archiveIndex = JSON.parse(archiveIndexRaw);
  const officialTopics = JSON.parse(officialTopicsRaw);

  const checkedAt = officialTopics.metadata?.retrievedAt
    ? new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(officialTopics.metadata.retrievedAt))
    : "";

  // 1. 仮設住宅・応急住宅・みなし仮設関連の公式発表を自動抽出
  const keywords = /(仮設|応急住宅|みなし仮設|プレハブ|木造仮設|賃貸型応急住宅|建設型応急住宅)/u;
  const rawUpdates = [];
  for (const muni of muniUpdates.municipalities || []) {
    for (const update of muni.updates || []) {
      if (keywords.test(update.title)) {
        rawUpdates.push({
          municipality: muni.name,
          date: update.date,
          time: update.time || null,
          title: update.title,
          url: update.url,
          category: update.category || "住まい・仮設"
        });
      }
    }
  }

  // 重複排除 (URL単位) & 日付降順ソート
  const seenUrls = new Set();
  const sortedUpdates = rawUpdates
    .filter(item => {
      if (seenUrls.has(item.url)) return false;
      seenUrls.add(item.url);
      return true;
    })
    .sort((a, b) => `${b.date} ${b.time || ""}`.localeCompare(`${a.date} ${a.time || ""}`))
    .slice(0, 16);

  // 2. タイムラインHTMLの生成
  const cardsHtml = sortedUpdates.map(item => {
    const art = archiveIndex[item.url];
    const currentOfficialUrl = OFFICIAL_URL_OVERRIDES.get(item.url) || item.url;
    const targetUrl = art ? art.htmlPath : currentOfficialUrl;
    const isArchived = Boolean(art);
    return `        <article class="portal-update-card">
          <div class="portal-update-meta">
            <time datetime="${esc(item.date)}">${formatDate(item.date)}</time>
            <span class="portal-update-muni">${esc(item.municipality)}</span>
            <span class="portal-update-tag">${esc(item.category)}</span>
            ${isArchived ? '<span class="portal-update-archive-badge" title="リンク切れ防止のためサイト内に全文保存済み">保存済</span>' : ""}
          </div>
          <h3 class="portal-update-title">
            <a href="${esc(targetUrl)}"${isArchived ? "" : ' target="_blank" rel="noopener"'}>${esc(item.title)} <span aria-hidden="true">${isArchived ? "→" : "↗"}</span></a>
          </h3>
          ${isArchived ? `          <div class="portal-update-sublink">
            <small><a href="${esc(currentOfficialUrl)}" target="_blank" rel="noopener">自治体公式の現行案内 ↗</a></small>
          </div>` : ""}
        </article>`;
  }).join("\n");

  const updatesSectionHtml = `<!-- HOUSING_UPDATES_START -->
  <section class="th-section" id="housing-official-updates" aria-labelledby="housing-updates-title" style="padding-top:24px;">
    <header class="th-heading">
      <p class="kicker">OFFICIAL TIMELINE &amp; RECRUITMENT</p>
      <h2 id="housing-updates-title">自治体公式 仮設住宅・みなし仮設の最新募集・公表タイムライン</h2>
      <p>各市町村公式サイトから自動収集された建設型仮設・みなし仮設（賃貸型応急住宅）の募集・入居・支援に関する最新発信です（自動更新）。</p>
    </header>

    <div class="portal-updates-shell">
      <div class="portal-updates-status-bar">
        <span class="portal-updates-status-badge">自治体公式発表 連動更新中</span>
        <small class="portal-updates-status-time">${checkedAt ? `市町村発信 ${checkedAt} 自動確認` : "随時更新"}</small>
      </div>
      <div class="portal-updates-grid">
${cardsHtml}
      </div>
    </div>
  </section>
  <!-- HOUSING_UPDATES_END -->`;

  // 3. temporary-housing.html への置換
  let nextHtml = htmlContent;

  // ナビゲーションリンクの追加確認
  if (!nextHtml.includes('href="#housing-official-updates"')) {
    nextHtml = nextHtml.replace(
      /(<a href="#overview">全体像<\/a>)/,
      `<a href="#housing-official-updates">最新募集・公式発表</a>$1`
    );
  }

  // セクションの置換
  if (nextHtml.includes("<!-- HOUSING_UPDATES_START -->")) {
    nextHtml = nextHtml.replace(
      /<!-- HOUSING_UPDATES_START -->[\s\S]*?<!-- HOUSING_UPDATES_END -->/,
      updatesSectionHtml
    );
  } else {
    // <aside class="th-scope">...</aside> の直後に挿入
    nextHtml = nextHtml.replace(
      /(<\/aside>\s*)(<section class="th-section" id="overview">)/,
      `$1\n  ${updatesSectionHtml}\n\n  $2`
    );
  }

  const normalizedNext = normalizeGeneratedText(nextHtml);
  const normalizedCurrent = normalizeGeneratedText(htmlContent);
  const changed = normalizedNext !== normalizedCurrent;

  if (checkOnly) {
    if (changed) {
      console.error("temporary-housing.html が未更新です。node tools/build-temporary-housing.mjs を実行してください。");
      process.exit(1);
    }
    console.log("仮設住宅ガイド生成物: 一致しています OK");
    return;
  }

  if (changed) {
    await writeFile(HTML_PATH, normalizedNext);
    console.log("temporary-housing.html を更新しました。");
  } else {
    console.log("temporary-housing.html は最新です。");
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
