// 市町村の災害対策本部会議のまとめ（hq-kumamoto.html / hq-yatsushiro.html）
//
// データは data/generated/municipality-hq-data.js（生成物）。どの市を出すかは
// <body data-hq="kumamoto"> で決める。
//
// 気をつけていること
//   ・資料に書かれた数字だけを出す。書かれていない回は「記載なし」と出して、
//     線をつなげない。つなぐと、載っていない日も同じ値だったように見える。
//   ・数え方が変わった数字は同じ推移に入れない。熊本市は途中から「住家被害
//     （速報）」をやめて「住家被害認定調査実施件数」を載せるようになった。
//   ・気づいたことは、その場でデータから計算する。書き置きにすると、毎日
//     増える会議に対して古いままになる。
(() => {
  "use strict";
  const data = window.MUNICIPALITY_HQ;
  const root = document.querySelector("[data-hq]");
  if (!data || !root) return;
  const municipality = data.municipalities.find(item => item.key === root.dataset.hq);
  if (!municipality) return;

  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const num = value => value.toLocaleString("ja-JP");
  const day = date => {
    if (!date) return "";
    const [, month, dayOfMonth] = date.split("-");
    return `${Number(month)}月${Number(dayOfMonth)}日`;
  };
  const disasterDay = date => Math.round(
    (new Date(`${date}T00:00:00+09:00`) - new Date(`${data.disasterDate}T00:00:00+09:00`)) / 86400000) + 1;

  // 資料に出てくる項目名。ここにない項目は推移に出さない（意味を確かめてから足す）
  const METRICS = [
    { key: "evacuees", label: "避難者数", unit: "人", lead: true },
    { key: "shelters", label: "開設避難所数", unit: "か所", lead: true },
    { key: "households", label: "避難世帯数", unit: "世帯" },
    { key: "homesReported", label: "住家被害（速報）", unit: "件", note: "被害の届出をもとにした速報。調査で判定した件数とは数え方が違う。" },
    { key: "homesSurveyed", label: "住家被害認定調査 実施件数", unit: "件", note: "職員が現地で調査して判定した件数。速報の続きではない。" },
    { key: "homesFull", label: "うち全壊", unit: "件" },
    { key: "homesPartial", label: "うち一部損壊", unit: "件" },
    { key: "homesUnclassified", label: "うち分類未確定", unit: "件" },
    { key: "certificateApplications", label: "り災証明書 申請", unit: "件", lead: true },
    { key: "certificateIssued", label: "り災証明書 交付", unit: "件", lead: true },
    { key: "lifeline", label: "ライフライン被害", unit: "件" },
    { key: "deaths", label: "死者", unit: "名" },
    { key: "injuredSevere", label: "重傷", unit: "名" },
    { key: "injuredModerate", label: "中等症", unit: "名" },
    { key: "injuredMinor", label: "軽傷", unit: "名" },
    { key: "injuredUnclassified", label: "分類未確定（人）", unit: "名" }
  ];

  const meetings = municipality.meetings.filter(meeting => meeting.date);
  const withFigures = meetings.filter(meeting => Object.keys(meeting.figures || {}).length);
  const series = key => meetings
    .filter(meeting => meeting.figures?.[key] != null)
    .map(meeting => ({ meeting: meeting.meeting, date: meeting.date, value: meeting.figures[key] }));

  // ---- 見出し ---------------------------------------------------------------
  const first = meetings[0], last = meetings.at(-1);
  $("#hqTitle").textContent = `${municipality.name} 災害対策本部会議`;
  $("#hqLead").textContent =
    `${municipality.name}が公開している${municipality.documentKind}を、第${first.meeting}回から第${last.meeting}回まで並べました。`
    + `資料に書かれた数字と本文をそのまま写しています。`;
  $("#hqRange").innerHTML = [
    `<b>${meetings.length}回</b><span>公開されている会議</span>`,
    `<b>${day(first.date)}〜${day(last.date)}</b><span>発災${disasterDay(first.date)}日目〜${disasterDay(last.date)}日目</span>`,
    `<b>第${last.meeting}回</b><span>最新（${day(last.date)}${last.time ? ` ${last.time}` : ""}）</span>`
  ].map(item => `<div>${item}</div>`).join("");

  $("#hqSource").innerHTML = `
    <b>一次情報</b>
    <p>数字も本文も、${esc(municipality.name)}が公開している資料そのものです。判断の前に必ず市の発表をご確認ください。</p>
    <a href="${esc(municipality.indexUrl)}" target="_blank" rel="noopener">${esc(municipality.indexTitle)}（${esc(municipality.name)}）→</a>
    ${last.documents?.length ? `<a href="${esc(last.documents[0].url)}" target="_blank" rel="noopener">最新 第${last.meeting}回の資料（PDF）→</a>` : ""}`;

  // ---- 数字でたどる ---------------------------------------------------------
  const cards = [];
  for (const metric of METRICS) {
    const points = series(metric.key);
    if (points.length < 2) continue;
    const values = points.map(point => point.value);
    const peak = Math.max(...values), latest = points.at(-1);
    const bars = points.map(point => {
      const height = peak ? Math.max(2, Math.round((point.value / peak) * 100)) : 2;
      return `<span style="height:${height}%" title="第${point.meeting}回 ${day(point.date)} ${num(point.value)}${metric.unit}"></span>`;
    }).join("");
    const missing = withFigures.length - points.length;
    cards.push(`
      <article class="hq-metric${metric.lead ? " is-lead" : ""}">
        <h3>${esc(metric.label)}</h3>
        <p class="hq-metric-latest"><b>${num(latest.value)}</b><small>${esc(metric.unit)}</small></p>
        <p class="hq-metric-when">第${latest.meeting}回（${day(latest.date)}）時点</p>
        <div class="hq-spark" role="img" aria-label="第${points[0].meeting}回${num(points[0].value)}${metric.unit}から第${latest.meeting}回${num(latest.value)}${metric.unit}までの推移">${bars}</div>
        <dl class="hq-metric-range">
          <div><dt>最初</dt><dd>第${points[0].meeting}回 ${num(points[0].value)}</dd></div>
          <div><dt>最大</dt><dd>${num(peak)}</dd></div>
          <div><dt>記載</dt><dd>${points.length}回${missing > 0 ? `<small>／${missing}回は記載なし</small>` : ""}</dd></div>
        </dl>
        ${metric.note ? `<p class="hq-metric-note">${esc(metric.note)}</p>` : ""}
      </article>`);
  }
  $("#hqMetrics").innerHTML = cards.join("") ||
    `<p class="hq-empty">推移として並べられる数字が、まだ資料から取れていません。上の一次情報から資料をご確認ください。</p>`;

  // ---- 気づいたこと（その場で計算する）---------------------------------------
  const findings = [];
  const evacuees = series("evacuees");
  if (evacuees.length >= 2) {
    const peak = evacuees.reduce((best, point) => point.value > best.value ? point : best, evacuees[0]);
    const latest = evacuees.at(-1);
    findings.push(`避難者数は第${peak.meeting}回（${day(peak.date)}）の${num(peak.value)}人が最も多く、第${latest.meeting}回（${day(latest.date)}）は${num(latest.value)}人です。`);
  }
  const shelters = series("shelters");
  if (shelters.length >= 2) {
    const peak = Math.max(...shelters.map(point => point.value));
    findings.push(`開設避難所は最大${num(peak)}か所から、第${shelters.at(-1).meeting}回時点で${num(shelters.at(-1).value)}か所になっています。`);
  }
  // 数え方が変わったところ（前の項目が止まり、別の項目が始まる回）
  const reported = series("homesReported"), surveyed = series("homesSurveyed");
  if (reported.length && surveyed.length && surveyed[0].meeting > reported.at(-1).meeting) {
    findings.push(`住家被害の数え方は第${surveyed[0].meeting}回で変わりました。第${reported.at(-1).meeting}回までは届出をもとにした速報（${num(reported.at(-1).value)}件）、第${surveyed[0].meeting}回からは現地調査で判定した件数（${num(surveyed[0].value)}件）です。数が減ったわけではないので、続きの数字として読まないでください。`);
  }
  // 同じ値が続いている項目。手続きが進むはずの数字が止まっているときだけ出す。
  // 死者や負傷者が同じ数のまま続くのは当たり前で、書くと本当の気づきが埋もれる。
  const HOLD_WATCH = ["homesReported", "homesSurveyed", "certificateApplications", "certificateIssued", "shelters"];
  const BREAKDOWN = ["homesFull", "homesPartial", "homesUnclassified"];
  for (const key of HOLD_WATCH) {
    const metric = METRICS.find(item => item.key === key);
    const points = series(key);
    if (points.length < 4) continue;
    let held = 1;
    for (let index = points.length - 1; index > 0 && points[index].value === points[index - 1].value; index -= 1) held += 1;
    if (held < 4) continue;
    const from = points.at(-held);
    // 総数が止まっていても、内訳が動いていれば「進んでいない」わけではない。
    // 内訳を持つのは住家被害だけなので、ほかの項目には付けない
    const moved = (key.startsWith("homes") ? BREAKDOWN : []).filter(inner => {
      const values = series(inner).filter(point => point.meeting >= from.meeting).map(point => point.value);
      return new Set(values).size > 1;
    }).map(inner => METRICS.find(item => item.key === inner).label.replace("うち", ""));
    findings.push(`${metric.label}は第${from.meeting}回（${day(from.date)}）から${held}回続けて${num(points.at(-1).value)}${metric.unit}のままです。`
      + (moved.length ? `総数は据え置きのまま、${moved.join("・")}の内訳だけが動いています。` : ""));
  }
  const blank = municipality.meetings.filter(meeting => !meeting.sections?.length).map(meeting => meeting.meeting);
  if (blank.length) {
    findings.push(`第${blank.join("、")}回は、この市のページに本文が載っておらず資料PDFのみです。数字はここには出していません。`);
  }
  $("#hqFindings").innerHTML = findings.map(text => `<li>${esc(text)}</li>`).join("");

  // ---- 会議ごとの記録 -------------------------------------------------------
  const list = [...municipality.meetings].reverse().map(meeting => {
    const figures = METRICS
      .filter(metric => meeting.figures?.[metric.key] != null)
      .map(metric => `<div><dt>${esc(metric.label)}</dt><dd>${num(meeting.figures[metric.key])}<small>${esc(metric.unit)}</small></dd></div>`)
      .join("");
    const sections = (meeting.sections || []).map(section => `
      <section class="hq-record-section">
        <h4>${esc(section.title)}</h4>
        <p>${esc(section.text).replace(/\n/g, "<br>")}</p>
      </section>`).join("");
    const documents = (meeting.documents || [])
      .map(document_ => `<a href="${esc(document_.url)}" target="_blank" rel="noopener">${esc(document_.label.replace(/\s*（PDF[^）]*）\s*/, ""))}（PDF）→</a>`)
      .join("");
    return `
      <details class="hq-record" ${meeting.meeting === last.meeting ? "open" : ""}>
        <summary>
          <b>第${meeting.meeting}回</b>
          <span>${meeting.date ? `${day(meeting.date)}${meeting.time ? ` ${meeting.time}` : ""}` : "日付の記載なし"}</span>
          ${meeting.date ? `<i>発災${disasterDay(meeting.date)}日目</i>` : ""}
        </summary>
        <div class="hq-record-body">
          ${meeting.venue ? `<p class="hq-record-venue">${esc(meeting.venue)}</p>` : ""}
          ${figures ? `<dl class="hq-record-figures">${figures}</dl>` : ""}
          ${sections || `<p class="hq-record-empty">この回は本文が公開されていません。資料PDFをご確認ください。</p>`}
          ${meeting.sourcePage ? `<p class="hq-record-page">数字と本文は資料PDFの${meeting.sourcePage}ページ目（全${meeting.pages}ページ）から写しました。</p>` : ""}
          <p class="hq-record-links">${documents}</p>
        </div>
      </details>`;
  }).join("");
  $("#hqRecords").innerHTML = list;
  $("#hqRecordCount").textContent = `${municipality.meetings.length}回ぶん。新しい順に並べています。`;

  $("#hqMethod").innerHTML = `
    <li>${esc(municipality.note)}</li>
    <li>数字は資料に書かれたものだけを写しています。書かれていない項目は空欄にし、前の回の値で埋めることはしません。</li>
    <li>資料に載っている前回との差（＋12、▲7 など）は取り込んでいません。差ではなく、その回に書かれた値そのものを並べています。</li>
    <li>取得日時：${esc(new Date(data.retrievedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }))}。毎日の自動更新で、新しい回が公開され次第ここに増えます。</li>`;

  const other = data.municipalities.filter(item => item.key !== municipality.key);
  $("#hqOther").innerHTML = other.length
    ? `<b>ほかの市の本部会議</b>${other.map(item => `<a href="${esc(item.page)}">${esc(item.name)} 災害対策本部会議 →</a>`).join("")}`
    : "";
})();
