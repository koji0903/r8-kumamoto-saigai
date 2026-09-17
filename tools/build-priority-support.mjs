#!/usr/bin/env node

/**
 * tools/build-priority-support.mjs
 * 5市町（熊本市・宇土市・宇城市・氷川町・八代市）の災害支援制度まとめ・比較ページを
 * sources/priority-support-matrix.json および自治体公式新着情報から自動生成・同期する。
 *
 * 使い方:
 *   node tools/build-priority-support.mjs          # 生成・更新
 *   node tools/build-priority-support.mjs --check  # 差分検査
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const matrixFile = path.join(root, "sources/priority-support-matrix.json");
const htmlFile = path.join(root, "priority-support-summary.html");
const navFile = path.join(root, "public-data/reconstruction/municipality-official-navigation.json");

const checkOnly = process.argv.includes("--check");

if (!fs.existsSync(matrixFile) || !fs.existsSync(htmlFile)) {
  console.error("必要なファイルが存在しません。");
  process.exit(1);
}

const matrix = JSON.parse(fs.readFileSync(matrixFile, "utf8"));
let nav = null;
if (fs.existsSync(navFile)) {
  try {
    nav = JSON.parse(fs.readFileSync(navFile, "utf8"));
  } catch {
    // nav が一時的に不正でもビルドを落とさない
  }
}

// 1. 最新公式発信（nav）からの自動検知・ステータス同期
if (nav && Array.isArray(nav.municipalities)) {
  const yatsushiro = nav.municipalities.find(m => m.municipalityName === "八代市");
  if (yatsushiro && Array.isArray(yatsushiro.updates)) {
    // 八代市の固定資産税・市県民税減免が受付開始されたか確認
    const taxUpdate = yatsushiro.updates.find(u => /(?:固定資産税|市県民税).*減免/u.test(u.displayTitle || ""));
    const taxProg = matrix.programs.find(p => p.id === "tax-reduction");
    if (taxUpdate && taxProg && taxProg.data.yatsushiro.status === "pending") {
      taxProg.data.yatsushiro.status = "active";
      taxProg.data.yatsushiro.desc = "家屋被害に応じた減免受付開始。";
      taxProg.data.yatsushiro.link = taxUpdate.url;
      taxProg.data.yatsushiro.linkText = "八代市公式 ↗";
      console.log("【自動検知】八代市の固定資産税・市税減免の受付開始を反映しました。");
    }
  }
}

// 2. HTMLの生成ロジック
function renderStatusBadge(status) {
  switch (status) {
    case "guide":
      return '<span class="status-badge status-guide">特設ガイドあり</span>';
    case "active":
      return '<span class="status-badge status-active">公式で受付中</span>';
    case "pending":
      return '<span class="status-badge status-pending">準備中・詳細未定</span>';
    case "na":
    default:
      return '<span class="status-badge status-na">対象外・非実施</span>';
  }
}

// マトリクステーブルのtbodyを生成
function generateMatrixTbody(matrix) {
  const lines = [];
  lines.push("            <tbody>");

  for (const cat of matrix.categories) {
    lines.push(`              <!-- 分野${cat.num}: ${cat.name} -->`);
    lines.push(`              <tr class="cat-divider"><th colspan="7" scope="colgroup" id="matrix-${cat.id}">${cat.num}. ${cat.name}</th></tr>`);

    const catPrograms = matrix.programs.filter(p => p.categoryId === cat.id);
    catPrograms.forEach((prog, pIndex) => {
      lines.push(`              <tr data-program="${prog.id}">`);
      if (pIndex === 0) {
        lines.push(`                <th scope="row" class="row-cat" rowspan="${catPrograms.length}">${cat.shortName}</th>`);
      }
      lines.push(`                <td class="cell-program">`);
      lines.push(`                  <a href="#card-${prog.id}" class="program-link"><b>${prog.name}</b><small>${prog.subName}</small></a>`);
      lines.push(`                </td>`);

      for (const muni of matrix.municipalities) {
        const mData = prog.data[muni.key] || { status: "na", desc: "情報なし" };
        const badge = renderStatusBadge(mData.status);
        const linkHtml = mData.link ? `<a href="${mData.link}">${mData.linkText || "詳細 →"}</a>` : "";
        lines.push(`                <td class="cell-muni col-${muni.key}">`);
        lines.push(`                  ${badge}`);
        lines.push(`                  <p class="cell-desc">${mData.desc}${linkHtml ? " " + linkHtml : ""}</p>`);
        lines.push(`                </td>`);
      }
      lines.push(`              </tr>`);
    });
  }

  lines.push("            </tbody>");
  return lines.join("\n");
}

// 制度詳細カードセクションを生成
function generateDetailsSection(matrix) {
  const lines = [];
  lines.push('    <section class="summary-details-section" aria-labelledby="details-title">');
  lines.push('      <div class="summary-shell">');
  lines.push('        <header class="section-head">');
  lines.push('          <p class="summary-subkicker">PROGRAM DETAILS</p>');
  lines.push('          <h2 id="details-title">各制度の内容・条件と5市町の窓口一覧</h2>');
  lines.push('          <p class="section-caption">知りたい制度をタップすると、5市町それぞれの受付状況、支給額・条件、問い合わせ先を確認できます。</p>');
  lines.push('        </header>');

  for (const cat of matrix.categories) {
    lines.push(`        <!-- カテゴリ${cat.num}: ${cat.name} -->`);
    lines.push(`        <div class="category-block" id="${cat.id}">`);
    lines.push(`          <h3 class="category-title"><span class="cat-num">${cat.num}</span> ${cat.name}</h3>`);

    const catPrograms = matrix.programs.filter(p => p.categoryId === cat.id);
    for (const prog of catPrograms) {
      lines.push(`          <!-- ${prog.name} -->`);
      lines.push(`          <article class="program-card" id="card-${prog.id}">`);
      lines.push(`            <header class="card-header">`);
      lines.push(`              <div class="card-badge-row">`);
      lines.push(`                <span class="cat-pill">${cat.shortName}</span>`);
      
      // 代表ステータスバッジ
      const hasGuide = Object.values(prog.data).some(d => d.status === "guide");
      if (hasGuide) {
        lines.push(`                <span class="status-badge status-guide">特設ガイドあり</span>`);
      } else {
        lines.push(`                <span class="status-badge status-active">公式情報あり</span>`);
      }
      lines.push(`              </div>`);
      lines.push(`              <h4 class="card-title">${prog.name}</h4>`);
      lines.push(`              <p class="card-lead">${prog.lead}</p>`);
      lines.push(`            </header>`);

      if (prog.points && prog.points.length) {
        lines.push(`            <div class="card-summary-points">`);
        for (const pt of prog.points) {
          lines.push(`              <div class="point-item">${pt}</div>`);
        }
        lines.push(`            </div>`);
      }

      lines.push(`            <div class="muni-comparison-grid">`);
      for (const muni of matrix.municipalities) {
        const mData = prog.data[muni.key] || { status: "na", desc: "情報なし" };
        const isHighlight = mData.status === "guide";
        const badge = renderStatusBadge(mData.status);
        const colClass = isHighlight ? `muni-col highlight-col` : `muni-col`;
        const linkHtml = mData.link
          ? `<div class="muni-links"><a href="${mData.link}"${isHighlight ? ' class="primary-btn"' : ""}>${mData.linkText || "詳細を見る →"}</a></div>`
          : "";

        lines.push(`              <div class="${colClass}" data-muni="${muni.key}">`);
        lines.push(`                <h5>${muni.name}</h5>`);
        lines.push(`                ${badge}`);
        lines.push(`                <p>${mData.desc}</p>`);
        if (linkHtml) lines.push(`                ${linkHtml}`);
        lines.push(`              </div>`);
      }
      lines.push(`            </div>`);
      lines.push(`          </article>`);
    }
    lines.push(`        </div>`);
  }

  lines.push("      </div>");
  lines.push("    </section>");
  return lines.join("\n");
}

// 総合窓口セクションを生成
function generateContactsSection(matrix) {
  const lines = [];
  lines.push('    <!-- 5市町 総合窓口・相談先一覧 -->');
  lines.push('    <section class="summary-contacts-section" aria-labelledby="contacts-title">');
  lines.push('      <div class="summary-shell">');
  lines.push('        <header class="section-head">');
  lines.push('          <p class="summary-subkicker">OFFICIAL CONTACTS</p>');
  lines.push('          <h2 id="contacts-title">各自治体の総合被災者支援窓口・公式情報</h2>');
  lines.push('          <p class="section-caption">手続きの不明点や申請窓口の場所は、各市町の総合相談ダイヤルへ直接お問い合わせください。</p>');
  lines.push('        </header>');
  lines.push('        <div class="contacts-grid">');

  for (const muni of matrix.municipalities) {
    lines.push('          <article class="contact-card">');
    lines.push(`            <h3>${muni.name}</h3>`);
    lines.push(`            <p class="contact-desk">${muni.desk}</p>`);
    lines.push(`            <p class="contact-phone">電話：<a href="tel:${muni.phone.replace(/[^0-9]/g, "")}">${muni.phone}</a></p>`);
    lines.push(`            <p class="contact-hours">受付：${muni.hours}</p>`);
    lines.push('            <div class="contact-links">');
    lines.push(`              <a href="${muni.guideUrl}">${muni.name}支援ガイド →</a>`);
    lines.push(`              <a href="${muni.officialUrl}" target="_blank" rel="noopener">${muni.name}公式窓口案内 ↗</a>`);
    lines.push('            </div>');
    lines.push('          </article>');
  }

  lines.push('        </div>');
  lines.push('      </div>');
  lines.push('    </section>');
  return lines.join("\n");
}

// 3. HTMLファイルの更新・検査
let html = fs.readFileSync(htmlFile, "utf8");

const newTbody = generateMatrixTbody(matrix);
const newDetails = generateDetailsSection(matrix);
const newContacts = generateContactsSection(matrix);

// 置換対象の正規表現
const tbodyRegex = /<tbody>[\s\S]*?<\/tbody>/;
const detailsRegex = /<section class="summary-details-section"[\s\S]*?<\/section>/;
const contactsRegex = /<!-- 5市町 総合窓口・相談先一覧 -->[\s\S]*?<\/section>/;

if (!tbodyRegex.test(html) || !detailsRegex.test(html) || !contactsRegex.test(html)) {
  console.error("priority-support-summary.html の置換マークが見つかりません。");
  process.exit(1);
}

const updatedHtml = html
  .replace(tbodyRegex, newTbody.trim())
  .replace(detailsRegex, newDetails.trim())
  .replace(contactsRegex, newContacts.trim());

if (checkOnly) {
  if (html !== updatedHtml) {
    console.error("priority-support-summary.html が sources/priority-support-matrix.json と一致していません。node tools/build-priority-support.mjs を実行してください。");
    process.exit(1);
  }
  console.log("5市町 災害支援制度まとめ・比較ページ: データと一致しています OK");
  process.exit(0);
}

// 書き込み
fs.writeFileSync(htmlFile, updatedHtml, "utf8");
// matrix json も更新された場合は保存
fs.writeFileSync(matrixFile, JSON.stringify(matrix, null, 2) + "\n", "utf8");
console.log("5市町 災害支援制度まとめ・比較ページ（マトリクス表・詳細カード・窓口）を更新しました。");
