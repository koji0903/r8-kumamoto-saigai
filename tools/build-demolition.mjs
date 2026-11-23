#!/usr/bin/env node
/**
 * tools/build-demolition.mjs
 * 
 * 公費解体 総合進捗ダッシュボード（demolition.html）の自動生成・同期スクリプト。
 * 
 * 1. sources/demolition-data.json（制度マスター・ステータス・期限・窓口）
 * 2. sources/official/municipalities/municipality-updates.json（自治体公式新着発信）
 * 3. sources/official/articles/archive-index.json（サイト内保存済み記事インデックス）
 * 4. sources/official/topics/latest-topics.json（自動収集メタデータ）
 * 
 * を統合し、
 * ・data/generated/demolition-data.js を生成
 * ・demolition.html 内の各セクション（アラート、メトリクス、自治体公式解体新着、比較表、確認日）を自動更新・同期する。
 * 
 * 使い方:
 *   node tools/build-demolition.mjs          # 生成・更新
 *   node tools/build-demolition.mjs --check  # 差分検査
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEMOLITION_DATA_PATH = join(ROOT, "sources/demolition-data.json");
const MUNI_UPDATES_PATH = join(ROOT, "sources/official/municipalities/municipality-updates.json");
const ARCHIVE_INDEX_PATH = join(ROOT, "sources/official/articles/archive-index.json");
const OFFICIAL_TOPICS_PATH = join(ROOT, "sources/official/topics/latest-topics.json");
const DEMOLITION_HTML_PATH = join(ROOT, "demolition.html");
const GENERATED_JS_PATH = join(ROOT, "data/generated/demolition-data.js");

const INDIVIDUAL_PAGES = [
  { id: "uto", name: "宇土市", file: "uto-demolition.html" },
  { id: "uki", name: "宇城市", file: "uki-demolition.html" },
  { id: "yatsushiro", name: "八代市", file: "yatsushiro-demolition.html" },
  { id: "hikawa", name: "氷川町", file: "hikawa-demolition.html" },
  { id: "kumamoto", name: "熊本市", file: "kumamoto-demolition.html" }
];

const checkOnly = process.argv.includes("--check");
const OFFICIAL_URL_OVERRIDES = new Map([
  ["https://www.city.uki.kumamoto.jp/kurashi/kankyo/gomi/2641256", "https://www.city.uki.kumamoto.jp/toppage/important/2641256"]
]);
const canonicalizeOfficialUrl = url => OFFICIAL_URL_OVERRIDES.get(url) || url;

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const formatDate = dateStr => {
  if (!dateStr) return "";
  const m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  return `${Number(m[2])}月${Number(m[3])}日`;
};

// 収集内容に左右されず git diff --check を通せるよう正規化
const normalizeGeneratedText = value => String(value)
  .replace(/\r\n?/g, "\n")
  .replace(/[\t ]+$/gm, "");

async function main() {
  const [demolitionDataRaw, muniUpdatesRaw, archiveIndexRaw, officialTopicsRaw, demolitionHtml] = await Promise.all([
    readFile(DEMOLITION_DATA_PATH, "utf8"),
    readFile(MUNI_UPDATES_PATH, "utf8").catch(() => '{"municipalities":[]}'),
    readFile(ARCHIVE_INDEX_PATH, "utf8").catch(() => "{}"),
    readFile(OFFICIAL_TOPICS_PATH, "utf8").catch(() => "{}"),
    readFile(DEMOLITION_HTML_PATH, "utf8")
  ]);

  const demolitionData = JSON.parse(demolitionDataRaw);
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

  const lastConfirmedFormatted = demolitionData.metadata.lastConfirmed.replace(
    /(\d{4})-(\d{2})-(\d{2})/,
    (_, y, m, d) => `${y}年${Number(m)}月${Number(d)}日`
  );

  // --- 1. 自治体公式の公費解体関連新着を自動抽出 ---
  const demolitionKeywords = /(解体|被災家屋|倒壊家屋|家屋撤去|自費解体|公費解体|被災建物)/u;
  const rawUpdates = [];
  for (const muni of muniUpdates.municipalities || []) {
    for (const update of muni.updates || []) {
      // 判定: 公費解体に関連するタイトルか、または被災証明書のうち解体用と明記されたもの
      const isDemolitionRelated = demolitionKeywords.test(update.title) ||
        (/被災証明/u.test(update.title) && /解体/u.test(update.title));
      
      // 除外判定（義援金のみや通常被害報告のみ等）
      if (isDemolitionRelated) {
        rawUpdates.push({
          municipality: muni.name,
          date: update.date,
          time: update.time || null,
          title: update.title,
          url: canonicalizeOfficialUrl(update.url),
          category: update.category || "公式発表"
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
    .slice(0, 16); // 最新16件

  // --- 2. data/generated/demolition-data.js の生成 ---
  const generatedData = {
    metadata: {
      ...demolitionData.metadata,
      retrievedAt: officialTopics.metadata?.retrievedAt || new Date().toISOString(),
      officialCheckedAt: checkedAt
    },
    alerts: demolitionData.alerts,
    metrics: demolitionData.metrics,
    recentOfficialUpdates: sortedUpdates.map(item => {
      const art = archiveIndex[item.url];
      return {
        ...item,
        archiveId: art ? art.id : null,
        archiveUrl: art ? art.htmlPath : null
      };
    }),
    municipalities: demolitionData.municipalities
  };

  const generatedJsContent = `// 生成物・直接編集しない。生成: node tools/build-demolition.mjs\nwindow.DEMOLITION_DATA = ${JSON.stringify(generatedData, null, 2)};\n`;
  const currentJs = await readFile(GENERATED_JS_PATH, "utf8").catch(() => "");
  let jsChanged = currentJs !== generatedJsContent;
  if (!checkOnly && jsChanged) {
    await writeFile(GENERATED_JS_PATH, generatedJsContent);
  }

  // --- 3. demolition.html 内の各セクションHTML生成 ---

  // A. 直近アラート
  const alertsHtml = `<!-- DEMOLITION_ALERT_START -->
    <aside class="demolition-current-alert" aria-label="${lastConfirmedFormatted}の重要更新">
      <strong>直近の重要更新・期限注意（${lastConfirmedFormatted}確認）</strong>
      <ul>
${demolitionData.alerts.map(alert => `        <li><b>${esc(alert.muni)}：</b>${alert.text}</li>`).join("\n")}
      </ul>
    </aside>
    <!-- DEMOLITION_ALERT_END -->`;

  // B. ダッシュボード指標（メトリクス）
  const metricsHtml = `<!-- DEMOLITION_METRICS_START -->
      <div class="dashboard-metrics">
${demolitionData.metrics.map(metric => `        <div class="metric-card${metric.accent ? " accent" : ""}">
          <div class="metric-header">${esc(metric.header)}</div>
          <div class="metric-number">${esc(metric.number)}</div>
          <div class="metric-sub">${esc(metric.sub)}</div>
        </div>`).join("\n")}
      </div>
      <!-- DEMOLITION_METRICS_END -->`;

  // C. 自治体公式 公費解体新着タイムライン
  const updatesCardsHtml = sortedUpdates.map(item => {
    const art = archiveIndex[item.url];
    const targetUrl = art ? art.htmlPath : item.url;
    const isArchived = Boolean(art);
    return `        <article class="demolition-update-card">
          <div class="demolition-update-meta">
            <time datetime="${esc(item.date)}">${formatDate(item.date)}</time>
            <span class="demolition-update-muni">${esc(item.municipality)}</span>
            <span class="demolition-update-tag">${esc(item.category)}</span>
            ${isArchived ? '<span class="demolition-update-archive-badge" title="リンク切れ防止のためサイト内に全文保存済み">保存済</span>' : ""}
          </div>
          <h3 class="demolition-update-title">
            <a href="${esc(targetUrl)}"${isArchived ? "" : ' target="_blank" rel="noopener"'}>${esc(item.title)} <span aria-hidden="true">${isArchived ? "→" : "↗"}</span></a>
          </h3>
          ${isArchived ? `          <div class="demolition-update-sublink">
            <small><a href="${esc(item.url)}" target="_blank" rel="noopener">自治体公式元 ↗</a></small>
          </div>` : ""}
        </article>`;
  }).join("\n");

  const updatesSectionHtml = `<!-- DEMOLITION_UPDATES_START -->
    <section class="waste-section" id="demolition-official-updates" aria-labelledby="updates-title">
      <header class="section-title">
        <p>OFFICIAL UPDATES &amp; TIMELINE</p>
        <h2 id="updates-title">自治体公式 公費解体・被災家屋撤去の最新発表タイムライン</h2>
        <span>各市町村公式サイトから自動収集された公費解体・自費解体・被災建物撤去に関する最新発信です（自動更新）。</span>
      </header>

      <div class="demolition-updates-shell">
        <div class="demolition-updates-status-bar">
          <span class="topics-status-badge">自治体公式発表 連動更新中</span>
          <small class="topics-status-time">${checkedAt ? `市町村発信 ${checkedAt} 自動確認` : "随時更新"}</small>
        </div>
        <div class="demolition-updates-grid">
${updatesCardsHtml}
        </div>
      </div>
    </section>
    <!-- DEMOLITION_UPDATES_END -->`;

  // D. 自治体別制度比較一覧表（テーブル）
  const tableRowsHtml = demolitionData.municipalities.map(muni => {
    const phoneDisplay = muni.phones.map(p => `<a href="tel:${esc(p.tel)}">${esc(p.display)}</a>`).join("<br>");
    const phoneFull = muni.phoneNote ? `${phoneDisplay}<br><small>${esc(muni.phoneNote)}</small>` : phoneDisplay;
    const detailLink = muni.isExternal
      ? `<a class="doc-link" href="${esc(muni.detailUrl)}" target="_blank" rel="noopener">${esc(muni.detailLabel)}</a>`
      : `<a class="doc-link" href="${esc(muni.detailUrl)}">${esc(muni.detailLabel)}</a>`;
    const statusSubHtml = muni.statusSub ? `<br><small>${esc(muni.statusSub)}</small>` : "";

    return `            <tr>
              <td><b>${esc(muni.name)}</b></td>
              <td>${esc(muni.damageCriteria)}</td>
              <td>${muni.period}</td>
              <td><span class="status-badge ${esc(muni.statusBadge)}">${esc(muni.statusLabel)}</span>${statusSubHtml}</td>
              <td>${muni.desk}</td>
              <td>${phoneFull}</td>
              <td>${muni.selfDemolition}</td>
              <td>${detailLink}</td>
            </tr>`;
  }).join("\n");

  const tableSectionHtml = `<!-- DEMOLITION_TABLE_START -->
        <table class="demolition-table" aria-label="自治体別公費解体受付状況一覧">
          <thead>
            <tr>
              <th scope="col">自治体名</th>
              <th scope="col">対象判定</th>
              <th scope="col">申請受付期間</th>
              <th scope="col">受付方式</th>
              <th scope="col">受付窓口</th>
              <th scope="col">専用問い合わせ・予約電話</th>
              <th scope="col">自費解体の契約・申請期限</th>
              <th scope="col">個別詳細</th>
            </tr>
          </thead>
          <tbody>
${tableRowsHtml}
          </tbody>
        </table>
        <!-- DEMOLITION_TABLE_END -->`;

  // E. 最終確認日表示
  const dateNoteHtml = `<!-- DEMOLITION_DATE_START -->
      <p class="source-checked-note"><b>公式情報の確認日：${lastConfirmedFormatted}</b><br>受付終了日が公式ページに明記されていない自治体は「公式窓口へ確認」と表示しています。制度は変更されることがあるため、申請・契約・着工の前に各自治体のリンク先で最新情報をご確認ください。</p>
      <!-- DEMOLITION_DATE_END -->`;

  // --- 4. demolition.html への置換・反映 ---
  let nextHtml = demolitionHtml;

  // アラートの置換
  if (nextHtml.includes("<!-- DEMOLITION_ALERT_START -->")) {
    nextHtml = nextHtml.replace(
      /<!-- DEMOLITION_ALERT_START -->[\s\S]*?<!-- DEMOLITION_ALERT_END -->/,
      alertsHtml
    );
  } else {
    // 既存の <aside class="demolition-current-alert" ...> を置換
    nextHtml = nextHtml.replace(
      /<aside class="demolition-current-alert"[\s\S]*?<\/aside>/,
      alertsHtml
    );
  }

  // メトリクスの置換
  if (nextHtml.includes("<!-- DEMOLITION_METRICS_START -->")) {
    nextHtml = nextHtml.replace(
      /<!-- DEMOLITION_METRICS_START -->[\s\S]*?<!-- DEMOLITION_METRICS_END -->/,
      metricsHtml
    );
  } else {
    nextHtml = nextHtml.replace(
      /<div class="dashboard-metrics">[\s\S]*?<\/div>(\s*<!-- 進捗フェーズのタイムライン -->)/,
      `${metricsHtml}\n\n$1`
    );
  }

  // テーブルの置換
  if (nextHtml.includes("<!-- DEMOLITION_TABLE_START -->")) {
    nextHtml = nextHtml.replace(
      /<!-- DEMOLITION_TABLE_START -->[\s\S]*?<!-- DEMOLITION_TABLE_END -->/,
      tableSectionHtml
    );
  } else {
    nextHtml = nextHtml.replace(
      /<table class="demolition-table"[\s\S]*?<\/table>/,
      tableSectionHtml
    );
  }

  // 確認日の置換
  if (nextHtml.includes("<!-- DEMOLITION_DATE_START -->")) {
    nextHtml = nextHtml.replace(
      /<!-- DEMOLITION_DATE_START -->[\s\S]*?<!-- DEMOLITION_DATE_END -->/,
      dateNoteHtml
    );
  } else {
    nextHtml = nextHtml.replace(
      /<p class="source-checked-note">[\s\S]*?<\/p>/,
      dateNoteHtml
    );
  }

  // 自治体公式公費解体新着タイムライン（Updatesセクション）の配置
  // テーブルセクションの前、またはダッシュボードの直後に挿入
  if (nextHtml.includes("<!-- DEMOLITION_UPDATES_START -->")) {
    nextHtml = nextHtml.replace(
      /<!-- DEMOLITION_UPDATES_START -->[\s\S]*?<!-- DEMOLITION_UPDATES_END -->/,
      updatesSectionHtml
    );
  } else {
    // <!-- 自治体別制度比較一覧表 --> の直前に挿入
    nextHtml = nextHtml.replace(
      /(\s*<!-- 自治体別制度比較一覧表 -->)/,
      `\n\n    ${updatesSectionHtml}\n$1`
    );
  }

  const normalizedNextHtml = normalizeGeneratedText(nextHtml);
  const normalizedCurrentHtml = normalizeGeneratedText(demolitionHtml);
  const htmlChanged = normalizedNextHtml !== normalizedCurrentHtml;

  // --- 5. 個別5市町ページの公式新着タイムライン自動生成・同期 ---
  let individualChanged = false;
  for (const page of INDIVIDUAL_PAGES) {
    const pagePath = join(ROOT, page.file);
    const content = await readFile(pagePath, "utf8").catch(() => null);
    if (!content) continue;

    const muniUpdatesFiltered = rawUpdates.filter(u => u.municipality === page.name);
    let muniUpdatesHtml = "";
    if (muniUpdatesFiltered.length > 0) {
      const cards = muniUpdatesFiltered.map(item => {
        const art = archiveIndex[item.url];
        const targetUrl = art ? art.htmlPath : item.url;
        const isArchived = Boolean(art);
        return `        <article class="demolition-update-card">
          <div class="demolition-update-meta">
            <time datetime="${esc(item.date)}">${formatDate(item.date)}</time>
            <span class="demolition-update-muni">${esc(item.municipality)}</span>
            <span class="demolition-update-tag">${esc(item.category)}</span>
            ${isArchived ? '<span class="demolition-update-archive-badge" title="リンク切れ防止のためサイト内に全文保存済み">保存済</span>' : ""}
          </div>
          <h3 class="demolition-update-title">
            <a href="${esc(targetUrl)}"${isArchived ? "" : ' target="_blank" rel="noopener"'}>${esc(item.title)} <span aria-hidden="true">${isArchived ? "→" : "↗"}</span></a>
          </h3>
          ${isArchived ? `          <div class="demolition-update-sublink">
            <small><a href="${esc(item.url)}" target="_blank" rel="noopener">自治体公式元 ↗</a></small>
          </div>` : ""}
        </article>`;
      }).join("\n");

      muniUpdatesHtml = `<!-- MUNI_DEMOLITION_UPDATES_START -->
    <section class="waste-section" id="muni-demolition-updates" aria-labelledby="muni-updates-title" style="margin-top:20px;">
      <header class="section-title">
        <p>OFFICIAL UPDATES</p>
        <h2 id="muni-updates-title">${esc(page.name)}公式 解体・被災家屋撤去の最新発表</h2>
        <span>市町村公式サイトから自動収集された解体・撤去関連の公表情報です（自動連動）。</span>
      </header>
      <div class="demolition-updates-shell">
        <div class="demolition-updates-status-bar">
          <span class="topics-status-badge">${esc(page.name)}公式発表 連動更新中</span>
          <small class="topics-status-time">${checkedAt ? `${page.name}発信 ${checkedAt} 自動確認` : "随時更新"}</small>
        </div>
        <div class="demolition-updates-grid">
${cards}
        </div>
      </div>
    </section>
    <!-- MUNI_DEMOLITION_UPDATES_END -->`;
    }

    let nextContent = content;
    if (muniUpdatesHtml) {
      if (nextContent.includes("<!-- MUNI_DEMOLITION_UPDATES_START -->")) {
        nextContent = nextContent.replace(
          /<!-- MUNI_DEMOLITION_UPDATES_START -->[\s\S]*?<!-- MUNI_DEMOLITION_UPDATES_END -->/,
          muniUpdatesHtml
        );
      } else {
        nextContent = nextContent.replace(
          /(<\/section>\s*)(<!-- [^>]*前の3つの約束)/,
          `$1\n\n    ${muniUpdatesHtml}\n\n    $2`
        );
      }
    }

    const normNext = normalizeGeneratedText(nextContent);
    const normCur = normalizeGeneratedText(content);
    if (normNext !== normCur) {
      individualChanged = true;
      if (!checkOnly) {
        await writeFile(pagePath, normNext);
        console.log(`${page.file} を更新しました。`);
      }
    }
  }

  if (checkOnly) {
    if (jsChanged || htmlChanged || individualChanged) {
      console.error("demolition.html、個別ガイドまたは data/generated/demolition-data.js が未更新です。node tools/build-demolition.mjs を実行してください。");
      process.exit(1);
    }
    console.log("公費解体ダッシュボード＆個別ガイド生成物: データと一致しています OK");
    return;
  }

  if (htmlChanged) {
    await writeFile(DEMOLITION_HTML_PATH, normalizedNextHtml);
    console.log("demolition.html を更新しました。");
  } else {
    console.log("demolition.html は最新です。");
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
