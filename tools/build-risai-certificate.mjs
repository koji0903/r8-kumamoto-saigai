#!/usr/bin/env node
/**
 * tools/build-risai-certificate.mjs
 * 
 * り災証明書・被災証明書総合ガイド（risai-certificate.html）の自動生成・同期スクリプト。
 * 
 * 1. sources/risai-certificate-data.json（直近の期限・受付状況マスター）
 * 2. sources/official/municipalities/municipality-updates.json（自治体公式新着発信）
 * 3. sources/official/articles/archive-index.json（サイト内保存済み記事インデックス）
 * 4. sources/official/topics/latest-topics.json（自動収集メタデータ）
 * 
 * を統合し、
 * ・risai-certificate.html 内に「直近の申請期限・受付アラート」および「自治体公式 り災・被災証明書の最新発表タイムライン」を自動埋め込み・更新する。
 * 
 * 使い方:
 *   node tools/build-risai-certificate.mjs          # 生成・更新
 *   node tools/build-risai-certificate.mjs --check  # 差分検査
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RISAI_DATA_PATH = join(ROOT, "sources/risai-certificate-data.json");
const MUNI_UPDATES_PATH = join(ROOT, "sources/official/municipalities/municipality-updates.json");
const ARCHIVE_INDEX_PATH = join(ROOT, "sources/official/articles/archive-index.json");
const OFFICIAL_TOPICS_PATH = join(ROOT, "sources/official/topics/latest-topics.json");
const HTML_PATH = join(ROOT, "risai-certificate.html");

const checkOnly = process.argv.includes("--check");
const OFFICIAL_URL_OVERRIDES = new Map([
  ["https://www.city.uki.kumamoto.jp/kurashi/bosaiinfo/sonota_bousai/2515854", "https://www.city.uki.kumamoto.jp/kurashi/bosaiinfo/earthquake/2624365"],
  ["https://www.city.uki.kumamoto.jp/toppage/important/2515854", "https://www.city.uki.kumamoto.jp/kurashi/bosaiinfo/earthquake/2624365"]
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
  const [risaiDataRaw, muniUpdatesRaw, archiveIndexRaw, officialTopicsRaw, htmlContent] = await Promise.all([
    readFile(RISAI_DATA_PATH, "utf8"),
    readFile(MUNI_UPDATES_PATH, "utf8").catch(() => '{"municipalities":[]}'),
    readFile(ARCHIVE_INDEX_PATH, "utf8").catch(() => "{}"),
    readFile(OFFICIAL_TOPICS_PATH, "utf8").catch(() => "{}"),
    readFile(HTML_PATH, "utf8")
  ]);

  const risaiData = JSON.parse(risaiDataRaw);
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

  const lastConfirmedFormatted = risaiData.metadata.lastConfirmed.replace(
    /(\d{4})-(\d{2})-(\d{2})/,
    (_, y, m, d) => `${y}年${Number(m)}月${Number(d)}日`
  );

  // 1. 証明書関連の公式発表を自動抽出
  const keywords = /(り災証明|罹災証明|被災証明|被害認定調査|り災届出)/u;
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
          category: update.category || "住まい・証明"
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

  // 2. 直近アラートHTML
  const alertsHtml = `<!-- RISAI_ALERT_START -->
      <section class="risai-deadline-alert" aria-label="直近の申請期限・受付終了注意" style="margin:20px 0 24px;padding:16px 20px;border-left:5px solid #d8552f;background:#fff7ed;border-radius:8px;">
        <div class="risai-shell">
          <strong style="display:block;margin-bottom:8px;font-size:16px;color:#c2410c;">【重要】り災証明書・被災証明書の申請期限・受付終了にご注意ください（${lastConfirmedFormatted}確認）</strong>
          <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.75;color:#431407;">
${risaiData.alerts.map(a => `            <li><b>${esc(a.muni)}：</b>${a.text}</li>`).join("\n")}
          </ul>
        </div>
      </section>
      <!-- RISAI_ALERT_END -->`;

  // 3. タイムラインHTML
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

  const updatesSectionHtml = `<!-- RISAI_UPDATES_START -->
      <section id="risai-official-updates" class="risai-section risai-shell" style="padding-top:24px;">
        <header class="section-head">
          <span>NEW</span>
          <div>
            <p>自治体公式発表タイムライン</p>
            <h2>り災証明・被災証明に関する最新情報</h2>
          </div>
        </header>
        <p style="margin:-10px 0 16px;font-size:14px;color:#4d6d66;">各市町村公式サイトから自動収集された証明書の交付申請・新規受付期限・被害認定調査に関する最新発信です（自動連動）。</p>
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
      <!-- RISAI_UPDATES_END -->`;

  // 4. risai-certificate.html への置換
  let nextHtml = htmlContent;

  // ヒーローの確認日表示
  if (nextHtml.includes("<!-- RISAI_CONFIRMED_DATE_START -->")) {
    nextHtml = nextHtml.replace(
      /<!-- RISAI_CONFIRMED_DATE_START -->[\s\S]*?<!-- RISAI_CONFIRMED_DATE_END -->/,
      `<!-- RISAI_CONFIRMED_DATE_START --><p class="eyebrow">令和8年熊本地震 / ${lastConfirmedFormatted}確認</p><!-- RISAI_CONFIRMED_DATE_END -->`
    );
  } else {
    nextHtml = nextHtml.replace(
      /<p class="eyebrow">[^<]*<\/p>/,
      `<!-- RISAI_CONFIRMED_DATE_START --><p class="eyebrow">令和8年熊本地震 / ${lastConfirmedFormatted}確認</p><!-- RISAI_CONFIRMED_DATE_END -->`
    );
  }

  // ナビゲーションリンクの追加確認
  if (!nextHtml.includes('href="#risai-official-updates"')) {
    nextHtml = nextHtml.replace(
      /(<a href="#meaning">何の書類？<\/a>)/,
      `<a href="#risai-official-updates">最新発表・期限注意</a>$1`
    );
  }

  // アラートの置換
  if (nextHtml.includes("<!-- RISAI_ALERT_START -->")) {
    nextHtml = nextHtml.replace(
      /<!-- RISAI_ALERT_START -->[\s\S]*?<!-- RISAI_ALERT_END -->/,
      alertsHtml
    );
  } else {
    // <nav class="risai-quick risai-shell" ...> の直後に挿入
    nextHtml = nextHtml.replace(
      /(<\/nav>\s*)(<section class="risai-alert">)/,
      `$1${alertsHtml}\n\n      $2`
    );
  }

  // タイムラインの置換
  if (nextHtml.includes("<!-- RISAI_UPDATES_START -->")) {
    nextHtml = nextHtml.replace(
      /<!-- RISAI_UPDATES_START -->[\s\S]*?<!-- RISAI_UPDATES_END -->/,
      updatesSectionHtml
    );
  } else {
    // <section class="risai-alert">...</section> の直後に挿入
    nextHtml = nextHtml.replace(
      /(<\/section>\s*)(<section id="meaning")/,
      `$1\n      ${updatesSectionHtml}\n\n      $2`
    );
  }

  const normalizedNext = normalizeGeneratedText(nextHtml);
  const normalizedCurrent = normalizeGeneratedText(htmlContent);
  const changed = normalizedNext !== normalizedCurrent;

  if (checkOnly) {
    if (changed) {
      console.error("risai-certificate.html が未更新です。node tools/build-risai-certificate.mjs を実行してください。");
      process.exit(1);
    }
    console.log("り災証明書ガイド生成物: 一致しています OK");
    return;
  }

  if (changed) {
    await writeFile(HTML_PATH, normalizedNext);
    console.log("risai-certificate.html を更新しました。");
  } else {
    console.log("risai-certificate.html は最新です。");
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
