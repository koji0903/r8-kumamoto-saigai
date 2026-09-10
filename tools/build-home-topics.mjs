#!/usr/bin/env node
/**
 * トップページ（index.html）のトピックスセクションを自動生成・同期する。
 * 
 * 1. sources/site-topics.json（サイト内更新・ガイド新着情報）
 * 2. sources/official/topics/latest-topics.json（自治体等からの最新収集情報）
 * を統合し、
 * ・data/generated/home-topics.js を生成
 * ・index.html 内のトピックスセクションを最新の静的HTMLとして自動更新
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_TOPICS_PATH = join(ROOT, "sources/site-topics.json");
const OFFICIAL_TOPICS_PATH = join(ROOT, "sources/official/topics/latest-topics.json");
const GENERATED_JS_PATH = join(ROOT, "data/generated/home-topics.js");
const INDEX_HTML_PATH = join(ROOT, "index.html");

const checkOnly = process.argv.includes("--check");

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const formatDate = dateStr => {
  if (!dateStr) return "";
  const m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  return `${Number(m[2])}月${Number(m[3])}日`;
};

async function main() {
  const [siteTopicsRaw, officialTopicsRaw, indexHtml] = await Promise.all([
    readFile(SITE_TOPICS_PATH, "utf8"),
    readFile(OFFICIAL_TOPICS_PATH, "utf8").catch(() => "{}"),
    readFile(INDEX_HTML_PATH, "utf8")
  ]);

  const siteTopics = JSON.parse(siteTopicsRaw);
  const officialTopics = JSON.parse(officialTopicsRaw);

  const municipalities = officialTopics.municipalities || [];
  const national = officialTopics.national || [];
  const prefecture = officialTopics.prefecture || [];

  const checkedAt = officialTopics.metadata?.retrievedAt
    ? new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(officialTopics.metadata.retrievedAt))
    : "";

  const latestSiteDate = siteTopics[0]?.date || "2026-09-10";
  const retrievedAt = officialTopics.metadata?.retrievedAt || `${latestSiteDate}T00:00:00.000Z`;

  // 1. data/generated/home-topics.js の生成
  const homeTopicsData = {
    retrievedAt,
    officialCheckedAt: checkedAt,
    siteTopics: siteTopics.slice(0, 6),
    municipalityUpdates: municipalities.slice(0, 8),
    prefectureUpdates: prefecture.slice(0, 3),
    nationalUpdates: national.slice(0, 3)
  };

  const generatedJsContent = `// 生成物・直接編集しない。生成: node tools/build-home-topics.mjs\nwindow.HOME_TOPICS = ${JSON.stringify(homeTopicsData, null, 2)};\n`;
  const currentJs = await readFile(GENERATED_JS_PATH, "utf8").catch(() => "");
  let jsChanged = currentJs !== generatedJsContent;
  if (!checkOnly && jsChanged) {
    await writeFile(GENERATED_JS_PATH, generatedJsContent);
  }

  // 2. index.html 内のトピックスセクション HTML を生成
  const siteTopicsHtml = siteTopics.slice(0, 5).map(item => `            <article class="home-topic-card">
              <div class="home-topic-meta">
                <time datetime="${esc(item.date)}">${formatDate(item.date)}</time>
                <span class="home-topic-badge">${esc(item.badge || item.category)}</span>
                <span class="home-topic-cat">${esc(item.category)}</span>
              </div>
              <h3 class="home-topic-title">
                <a href="${esc(item.url)}">${esc(item.title)} <span aria-hidden="true">→</span></a>
              </h3>
              <p class="home-topic-desc">${esc(item.description)}</p>
            </article>`).join("\n");

  const officialItems = municipalities.slice(0, 6);
  const officialTopicsHtml = officialItems.map(item => `            <article class="home-official-card">
              <div class="home-official-meta">
                <time datetime="${esc(item.date)}">${formatDate(item.date)}</time>
                <span class="home-official-muni">${esc(item.municipality)}</span>
                <span class="home-official-tag">${esc(item.category || "公式発表")}</span>
              </div>
              <h4 class="home-official-title">
                <a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)} <span class="ext-arrow" aria-hidden="true">↗</span></a>
              </h4>
            </article>`).join("\n");

  const topicsSectionHtml = `<!-- TOPICS_START -->
    <section class="home-topics-v2" aria-labelledby="home-topics-title">
      <div class="home-topics-shell">
        <header class="home-topics-header">
          <div class="home-topics-heading">
            <p class="kicker">TOPICS &amp; RECENT UPDATES</p>
            <h2 id="home-topics-title">被災地と支援の「いま」がわかる最新トピックス</h2>
            <p class="home-topics-lead">サイト内で更新・公開された重要ガイド・支援制度の最新情報と、自治体から収集された最新公式発表をまとめています。</p>
          </div>
          <div class="home-topics-status">
            <span class="topics-status-badge">自動収集連動中</span>
            <small class="topics-status-time">${checkedAt ? `自治体発信 ${checkedAt} 確認済` : "随時更新"}</small>
          </div>
        </header>

        <div class="home-topics-grid">
          <div class="home-topics-col home-topics-site">
            <div class="home-topics-col-head">
              <span class="col-icon" aria-hidden="true">📌</span>
              <div>
                <h3>サイト更新・重要支援ガイド</h3>
                <small>何が新しくなり、何がわかるかを要約</small>
              </div>
            </div>
            <div class="home-topic-list">
${siteTopicsHtml}
            </div>
            <div class="home-topics-more">
              <a href="disaster.html">支援情報ポータルを開く <span aria-hidden="true">→</span></a>
            </div>
          </div>

          <div class="home-topics-col home-topics-official">
            <div class="home-topics-col-head">
              <span class="col-icon" aria-hidden="true">📢</span>
              <div>
                <h3>自治体からの最新収集情報</h3>
                <small>市町村公式サイトの公表発表タイムライン</small>
              </div>
            </div>
            <div class="home-official-list">
${officialTopicsHtml}
            </div>
            <div class="home-topics-more">
              <a href="municipalities.html?tab=updates">市町村の公式発信一覧（21自治体）を見る <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- TOPICS_END -->`;

  let newIndexHtml = indexHtml;
  if (newIndexHtml.includes("<!-- TOPICS_START -->") && newIndexHtml.includes("<!-- TOPICS_END -->")) {
    newIndexHtml = newIndexHtml.replace(/<!-- TOPICS_START -->[\s\S]*?<!-- TOPICS_END -->/, topicsSectionHtml.trim());
  } else {
    // home-current-v2 の直前に挿入
    newIndexHtml = newIndexHtml.replace(/(<section class="home-current-v2")/i, `${topicsSectionHtml}\n\n    $1`);
  }

  let htmlChanged = newIndexHtml !== indexHtml;
  if (!checkOnly && htmlChanged) {
    await writeFile(INDEX_HTML_PATH, newIndexHtml, "utf8");
  }

  if (checkOnly && (jsChanged || htmlChanged)) {
    throw new Error("トップページのトピックス生成物が未更新です。node tools/build-home-topics.mjs を実行してください。");
  }

  console.log(`トップページ トピックス: サイト更新 ${siteTopics.length}件 / 自治体収集 ${municipalities.length}件 ${checkOnly ? "検査OK" : "を更新"}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
