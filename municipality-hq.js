// 市町村の災害対策本部会議のまとめ（hq-kumamoto.html / hq-yatsushiro.html）
//
// データは data/generated/municipality-hq-data.js（生成物）。どの市を出すかは
// <body data-hq="kumamoto"> で決める。
//
// このページが引き受けていること
//   本部会議の資料は、その市でいま何が起きていて行政が何をしているかを、
//   いちばん細かく毎日たどれる一次情報。ただし書き方が行政向けで、そのまま
//   出しても市民には読めない。そこで
//     ・「知りたいこと」から入れるようにする（家・避難所・水・支援…）
//     ・数字には意味を添える（申請と交付の差など、単純比較の限界も示す）
//     ・前の回から何が変わったかを文にする（時間軸で追えるように）
//     ・行政の言葉に説明を添える（資料の文字は書き換えない）
//   資料の文そのものは一字も変えない。足すのは説明と並べ替えだけ。
//
// 気をつけていること
//   ・資料に書かれた数字だけを出す。書かれていない回は線をつなげない。
//   ・数え方が変わった数字は同じ推移に入れない。
//   ・気づきや変化の文は、その場でデータから計算する。書き置きにすると、
//     毎日増える会議に対して古いままになる。
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
  // 資料の全角数字は読みにくいので、表示のときだけ半角にする。文そのものは変えない
  const readable = text => String(text ?? "")
    .replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/：/g, "：").replace(/，/g, ",");
  const lines = text => esc(readable(text)).replace(/\n/g, "<br>");

  // 「停電：市内復旧済み」「ガス：7月31日復旧完了」のように、資料が
  // ラベルと内容で書いている行は表にする。段落のまま出すと読み飛ばされる。
  const LABELLED = /^([^\s：:]{2,10})[：:]\s*(.*)$/;
  const labelled = text => {
    const rows = [];
    for (const line of readable(text).split("\n")) {
      const match = LABELLED.exec(line.trim());
      if (match && match[1] && !/^[0-9]/.test(match[1])) rows.push({ label: match[1], value: match[2] });
      else if (rows.length) rows.at(-1).value += `\n${line.trim()}`;
      else rows.push({ label: "", value: line.trim() });
    }
    if (rows.filter(row => row.label).length < 2) return `<p class="hq-block-text">${lines(text)}</p>`;
    return `<dl class="hq-facts">${rows.map(row => row.label
      ? `<div><dt>${esc(row.label)}</dt><dd>${esc(row.value).replace(/\n/g, "<br>") || "—"}</dd></div>`
      : `<div class="is-note"><dd>${esc(row.value)}</dd></div>`).join("")}</dl>`;
  };

  // 資料に出てくる項目。label は資料の言い方、plain は市民向けの言い換え。
  const METRICS = [
    { key: "evacuees", label: "避難している人", unit: "人", theme: "shelter", lead: true,
      plain: "いま避難所で過ごしている人数です。" },
    { key: "households", label: "避難している世帯", unit: "世帯", theme: "shelter" },
    { key: "shelters", label: "開いている避難所", unit: "か所", theme: "shelter", lead: true,
      plain: "その時点で開いている避難所の数です。集約されて減っていきます。" },
    { key: "evacueesPeak", label: "いちばん多かったときの避難者", unit: "人", theme: "shelter" },
    { key: "certificateApplications", label: "り災証明 申請", unit: "件", theme: "home", lead: true,
      plain: "家の被害を証明してほしいと申し込まれた件数です。" },
    { key: "certificateIssued", label: "り災証明 交付", unit: "件", theme: "home", lead: true,
      plain: "実際に証明書が渡された件数です。申請との差は進み具合を見る目安ですが、未交付の人数そのものではありません。" },
    { key: "homesSurveyed", label: "被害認定調査 実施", unit: "件", theme: "home",
      note: "職員が現地で見て判定した件数。届出をもとにした速報の続きではありません。" },
    { key: "homesReported", label: "住家被害（届出の速報）", unit: "件", theme: "home",
      note: "被害の届出をもとにした速報。調査で判定した件数とは数え方が違います。" },
    { key: "homesFull", label: "うち全壊", unit: "件", theme: "home" },
    { key: "homesPartial", label: "うち一部損壊", unit: "件", theme: "home" },
    { key: "homesUnclassified", label: "うち分類未確定", unit: "件", theme: "home",
      plain: "まだ区分が決まっていないもの。これが減ると判定が進んでいます。" },
    { key: "lifeline", label: "ライフラインの被害", unit: "件", theme: "lifeline" },
    { key: "deaths", label: "亡くなった方", unit: "名", theme: "people" },
    { key: "cardiacArrest", label: "心肺停止", unit: "名", theme: "people" },
    { key: "missing", label: "安否不明", unit: "名", theme: "people" },
    { key: "injuredSevere", label: "重傷", unit: "名", theme: "people" },
    { key: "injuredModerate", label: "中等症", unit: "名", theme: "people" },
    { key: "injuredMinor", label: "軽傷", unit: "名", theme: "people" },
    { key: "injuredUnclassified", label: "分類未確定（人）", unit: "名", theme: "people" }
  ];
  const metricOf = key => METRICS.find(item => item.key === key);
  const meetings = municipality.meetings.filter(meeting => meeting.date);
  const withText = meetings.filter(meeting => (meeting.blocks || []).length);
  const first = meetings[0], last = meetings.at(-1);
  function series(key) {
    return meetings
      .filter(meeting => meeting.figures?.[key] != null)
      .map(meeting => ({ meeting: meeting.meeting, date: meeting.date, value: meeting.figures[key] }));
  }
  const latestFigure = key => series(key).at(-1) || null;

  // ---- 時間軸 ---------------------------------------------------------------
  // 会議の「回」ではなく「日付」で並べる。回を等間隔に並べると、1日に3回
  // 開かれた日も、2日空いた区間も同じ幅になり、状況の動きが読めなくなる。
  const DAY_MS = 86400000;
  const dayOf = date => Math.round(
    (Date.parse(`${date}T00:00:00+09:00`) - Date.parse(`${data.disasterDate}T00:00:00+09:00`)) / DAY_MS) + 1;
  const lastDay = dayOf(last.date);
  // 同じ日に複数回開かれた日は、その日の最後の回（＝その日の締めの数字）を使う
  const byDate = points => {
    const map = new Map();
    for (const point of points) map.set(point.date, point);
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  };

  // SVGの塗りにはCSS変数が使えない場面があるので、色は表で持つ（CSSと同じ値）
  const TONE_COLOR = {
    shelter: "#0f766e", home: "#b26a12", lifeline: "#1f6ea8",
    support: "#4f8f2f", people: "#b2436c", city: "#5f57a0", other: "#5c6d68"
  };
  const colorOf = id => TONE_COLOR[id] || TONE_COLOR.other;

  const CHART = { width: 720, height: 190, left: 52, right: 14, top: 16, bottom: 34 };
  const plotX = (index, left = CHART.left) =>
    left + ((index - 1) / Math.max(1, lastDay - 1)) * (CHART.width - left - CHART.right);
  const plotY = (value, peak) => CHART.top + (1 - value / (peak || 1)) * (CHART.height - CHART.top - CHART.bottom);

  // 横軸の目盛り。発災1日目を起点に7日ごと＋最終日
  const axisTicks = () => {
    const marks = [];
    for (let index = 1; index <= lastDay; index += 7) marks.push(index);
    if (marks.at(-1) !== lastDay) marks.push(lastDay);
    return marks;
  };
  const dateOfDay = index => {
    const date = new Date(Date.parse(`${data.disasterDate}T00:00:00+09:00`) + (index - 1) * DAY_MS);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const niceTop = value => {
    if (value <= 10) return Math.max(1, value);
    const scale = 10 ** (String(Math.round(value)).length - 2);
    return Math.ceil(value / scale) * scale;
  };

  // 折れ線。会議が2日以上あいた区間は破線にして、間が空いたことを見せる
  const lineChart = (seriesList, { peak, label, tall }) => {
    const top = niceTop(peak);
    const height = tall ? CHART.height + 40 : CHART.height;
    const bottomY = CHART.top + (height - CHART.top - CHART.bottom);
    const y = value => CHART.top + (1 - value / top) * (height - CHART.top - CHART.bottom);
    const grid = [0, top / 2, top].map(value => `
      <line x1="${CHART.left}" y1="${y(value)}" x2="${CHART.width - CHART.right}" y2="${y(value)}" stroke="#e2eae7"/>
      <text x="${CHART.left - 8}" y="${y(value) + 4}" text-anchor="end" class="hq-axis">${num(Math.round(value))}</text>`).join("");
    const ticks = axisTicks().map(index => `
      <text x="${plotX(index)}" y="${bottomY + 18}" text-anchor="middle" class="hq-axis">${dateOfDay(index)}</text>
      <text x="${plotX(index)}" y="${bottomY + 30}" text-anchor="middle" class="hq-axis hq-axis-day">${index}日目</text>`).join("");
    const paths = seriesList.map(item => {
      const points = byDate(item.points);
      const segments = points.slice(1).map((point, order) => {
        const previous = points[order];
        const gap = dayOf(point.date) - dayOf(previous.date);
        return `<line x1="${plotX(dayOf(previous.date))}" y1="${y(previous.value)}" x2="${plotX(dayOf(point.date))}" y2="${y(point.value)}"
          stroke="${item.color}" stroke-width="2.5" stroke-linecap="round"${gap > 1 ? ' stroke-dasharray="3 4"' : ""}/>`;
      }).join("");
      const dots = points.map(point =>
        `<circle cx="${plotX(dayOf(point.date))}" cy="${y(point.value)}" r="3.5" fill="${item.color}"><title>${dateOfDay(dayOf(point.date))} ${num(point.value)}</title></circle>`).join("");
      return segments + dots;
    }).join("");
    // 狭い画面では図を縮めず、箱ごと横に送れるようにする（縮めると軸の文字が
    // 5px相当まで潰れて読めなくなる）
    return `<div class="hq-chart-scroll"><svg viewBox="0 0 ${CHART.width} ${height}" class="hq-chart" role="img" aria-label="${esc(label)}">
      ${grid}${ticks}${paths}
    </svg></div>`;
  };
  // 数字も本文も無い関心事は出さない（空の見出しが並ぶと探しにくくなる）
  const themes = (data.themes || []).filter(theme =>
    METRICS.some(metric => metric.theme === theme.id && series(metric.key).length)
    || municipality.meetings.some(meeting => (meeting.blocks || []).some(block => block.theme === theme.id)));


  // 会議の開かれ方そのものが、市の動きの段階を表す。1日に何回開いたかを
  // 日付軸の棒で出し、開かれなかった日は空けたままにする。
  const meetingsByDay = new Map();
  for (const meeting of meetings) meetingsByDay.set(dayOf(meeting.date), (meetingsByDay.get(dayOf(meeting.date)) || 0) + 1);
  const cadenceChart = () => {
    const height = 130, bottomY = height - 34, maxCount = Math.max(...meetingsByDay.values());
    const barWidth = Math.max(4, (CHART.width - CHART.left - CHART.right) / lastDay - 3);
    const bars = [];
    for (let index = 1; index <= lastDay; index += 1) {
      const count = meetingsByDay.get(index) || 0;
      const barHeight = count ? (count / maxCount) * (bottomY - CHART.top) : 0;
      bars.push(count
        ? `<rect x="${plotX(index) - barWidth / 2}" y="${bottomY - barHeight}" width="${barWidth}" height="${barHeight}" rx="2" fill="var(--tone)"><title>${dateOfDay(index)} ${count}回</title></rect>`
        : `<rect x="${plotX(index) - barWidth / 2}" y="${bottomY - 3}" width="${barWidth}" height="3" rx="1.5" fill="#e2eae7"><title>${dateOfDay(index)} 開催なし</title></rect>`);
    }
    const ticks = axisTicks().map(index => `
      <text x="${plotX(index)}" y="${bottomY + 18}" text-anchor="middle" class="hq-axis">${dateOfDay(index)}</text>
      <text x="${plotX(index)}" y="${bottomY + 30}" text-anchor="middle" class="hq-axis hq-axis-day">${index}日目</text>`).join("");
    return `<div class="hq-chart-scroll"><svg viewBox="0 0 ${CHART.width} ${height}" class="hq-chart" role="img" aria-label="日ごとの会議の開催回数">
      <line x1="${CHART.left}" y1="${bottomY}" x2="${CHART.width - CHART.right}" y2="${bottomY}" stroke="#e2eae7"/>
      ${bars.join("")}${ticks}</svg></div>`;
  };

  // どの話題が、いつ資料に載っていたか。市の検討内容の移り変わりを見るための帯。
  const themeDays = new Map();
  for (const meeting of withText) {
    for (const block of meeting.blocks || []) {
      if (!block.theme) continue;
      if (!themeDays.has(block.theme)) themeDays.set(block.theme, new Set());
      themeDays.get(block.theme).add(dayOf(meeting.date));
    }
  }
  const topicStrip = () => {
    const rows = themes.filter(theme => themeDays.has(theme.id));
    // 話題名は「水・電気・ごみ・交通」まであるので、左の余白を広く取る
    const left = 132;
    const rowHeight = 30, height = rows.length * rowHeight + 40;
    const cellWidth = Math.max(4, (CHART.width - left - CHART.right) / lastDay - 2);
    const body = rows.map((theme, order) => {
      const y = 10 + order * rowHeight;
      const cells = [];
      for (let index = 1; index <= lastDay; index += 1) {
        const on = themeDays.get(theme.id).has(index);
        cells.push(`<rect x="${plotX(index, left) - cellWidth / 2}" y="${y}" width="${cellWidth}" height="18" rx="3"
          fill="${on ? colorOf(theme.id) : "#eef2f1"}"><title>${dateOfDay(index)} ${esc(theme.label)}${on ? "：資料に記載あり" : "：記載なし"}</title></rect>`);
      }
      return `<text x="${left - 10}" y="${y + 13}" text-anchor="end" class="hq-axis hq-axis-row">${esc(theme.label)}</text>${cells.join("")}`;
    }).join("");
    const bottomY = 10 + rows.length * rowHeight;
    const ticks = axisTicks().map(index => `
      <text x="${plotX(index, left)}" y="${bottomY + 14}" text-anchor="middle" class="hq-axis">${dateOfDay(index)}</text>
      <text x="${plotX(index, left)}" y="${bottomY + 26}" text-anchor="middle" class="hq-axis hq-axis-day">${index}日目</text>`).join("");
    return `<div class="hq-chart-scroll"><svg viewBox="0 0 ${CHART.width} ${height}" class="hq-chart hq-chart-strip" role="img" aria-label="話題ごとに、資料へ載っていた日">${body}${ticks}</svg></div>`;
  };

  // ---- 見出し ---------------------------------------------------------------
  $("#hqTitle").textContent = `${municipality.name}の災害対策本部会議`;
  $("#hqLead").textContent =
    `${municipality.name}が災害対策本部会議で使った資料を、第${first.meeting}回から第${last.meeting}回まで並べています。`
    + "行政向けの書き方のままでは読みにくいので、知りたいことから入れるようにし、数字には意味を、言葉には説明を添えました。"
    + "資料の文そのものは変えていません。";
  $("#hqRange").innerHTML = [
    [`${meetings.length}回`, "公開されている会議"],
    [`${day(first.date)}〜${day(last.date)}`, `発災${disasterDay(first.date)}日目〜${disasterDay(last.date)}日目`],
    [`第${last.meeting}回`, `いちばん新しい回（${day(last.date)}${last.time ? ` ${last.time}` : ""}）`]
  ].map(([value, label]) => `<div><b>${esc(value)}</b><span>${esc(label)}</span></div>`).join("");

  // ---- いまの状況 -----------------------------------------------------------
  // 最新の回に書かれていることを、そのまま平たい文にする。
  const now = [];
  const shelters = latestFigure("shelters"), evacuees = latestFigure("evacuees"), households = latestFigure("households");
  if (shelters && evacuees) {
    now.push({
      theme: "shelter", headline: `避難所は${num(shelters.value)}か所、${num(evacuees.value)}人`,
      body: `${households ? `${num(households.value)}世帯 ` : ""}${num(evacuees.value)}人が避難しています。`
        + `第${evacuees.meeting}回（${day(evacuees.date)}）の資料の数字です。`,
      note: "避難所は集約されていきます。行く前に市の最新の開設状況をご確認ください。"
    });
  }
  const applied = latestFigure("certificateApplications"), issued = latestFigure("certificateIssued");
  if (applied && issued) {
    const rate = Math.round((issued.value / applied.value) * 1000) / 10;
    now.push({
      theme: "home", headline: `り災証明は${num(applied.value)}件の申請のうち${num(issued.value)}件が交付済み`,
      body: `交付数は申請数の${rate}%です。単純な差は${num(applied.value - issued.value)}件ですが、申請と交付の集計時点などが異なるため、未交付件数そのものとは限りません。`,
      bar: rate,
      note: "り災証明は、支援金・住宅の応急修理・税の減免などの申請で必要になります。"
    });
  }
  const reported = latestFigure("homesReported"), unclassifiedHomes = latestFigure("homesUnclassified");
  if (reported && unclassifiedHomes) {
    now.push({
      theme: "home", headline: `住家被害${num(reported.value)}件のうち${num(unclassifiedHomes.value)}件は区分がこれから`,
      body: `届出は${num(reported.value)}件で、うち${num(unclassifiedHomes.value)}件はまだ全壊・半壊などの区分が決まっていません。`
        + "総数が変わらないまま内訳だけが動くのは、判定が進んでいるためです。",
      note: null
    });
  }
  const lifelineBlock = (last.blocks || []).find(block => block.theme === "lifeline");
  if (lifelineBlock) {
    now.push({
      theme: "lifeline", headline: "水・電気・ガス・交通の状況",
      body: null, raw: lifelineBlock.text,
      note: "資料に書かれたままの記載です。"
    });
  }
  $("#hqNow").innerHTML = now.map(item => `
    <article class="hq-now tone-${esc(item.theme)}${item.raw ? " is-wide" : ""}">
      <h3>${esc(item.headline)}</h3>
      ${item.body ? `<p>${esc(item.body)}</p>` : ""}
      ${item.bar != null ? `<div class="hq-bar" role="img" aria-label="交付は申請の${item.bar}%"><span style="width:${Math.min(100, item.bar)}%"></span></div>` : ""}
      ${item.raw ? `<div class="hq-now-raw">${labelled(item.raw)}</div>` : ""}
      ${item.note ? `<p class="hq-now-note">${esc(item.note)}</p>` : ""}
    </article>`).join("");
  $("#hqNowWhen").textContent = `第${last.meeting}回（${day(last.date)}${last.time ? ` ${last.time}` : ""}）の資料より`;

  // 局面名は市の公式区分ではなく、日付・話題・数値を追いやすくするための案内。
  const phaseDefinitions = [
    { start: 1, end: 3, label: "緊急対応", description: "本部設置、避難、救助、被害の第一報を集める段階" },
    { start: 4, end: 7, label: "避難生活と応急対応", description: "避難所・食事・ライフラインなど、生活を維持する対応を広げる段階" },
    { start: 8, end: 14, label: "被害把握と制度の立ち上げ", description: "住家被害の把握、り災証明、支援制度へ対応の軸が移る段階" },
    { start: 15, end: lastDay, label: "生活再建への移行", description: "避難生活を続けながら、被害認定・証明交付・住まい再建を進める段階" }
  ];
  const phaseMetricKeys = ["evacuees", "shelters", "homesReported", "homesSurveyed", "certificateApplications", "certificateIssued"];
  const phaseMetric = (subset, key) => {
    const metric = metricOf(key), points = subset.filter(meeting => meeting.figures?.[key] != null);
    if (!metric || !points.length) return null;
    const startValue = points[0].figures[key], endValue = points.at(-1).figures[key];
    return `<span><b>${esc(metric.label)}</b>${points.length > 1 && startValue !== endValue ? `${num(startValue)}→${num(endValue)}${metric.unit}` : `${num(endValue)}${metric.unit}`}</span>`;
  };
  const phaseCards = phaseDefinitions.map((phase, order) => {
    if (phase.end < phase.start) return "";
    const subset = meetings.filter(meeting => dayOf(meeting.date) >= phase.start && dayOf(meeting.date) <= phase.end);
    if (!subset.length) return "";
    const topicCounts = new Map();
    for (const meeting of subset) for (const block of meeting.blocks || []) if (block.theme) topicCounts.set(block.theme, (topicCounts.get(block.theme) || 0) + 1);
    const topics = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => themes.find(theme => theme.id === id)).filter(Boolean);
    const metrics = phaseMetricKeys.map(key => phaseMetric(subset, key)).filter(Boolean).slice(0, 3);
    const actualStart = dayOf(subset[0].date), actualEnd = dayOf(subset.at(-1).date);
    return `<article class="hq-phase"><div class="hq-phase-number" aria-hidden="true">${order + 1}</div><div class="hq-phase-body">
      <p class="hq-phase-date">発災${actualStart}${actualEnd !== actualStart ? `〜${actualEnd}` : ""}日目・${day(subset[0].date)}${subset.at(-1).date !== subset[0].date ? `〜${day(subset.at(-1).date)}` : ""}</p>
      <h3>${esc(phase.label)}</h3><p>${esc(phase.description)}</p><p class="hq-phase-count">この期間の公開会議 ${subset.length}回</p>
      ${topics.length ? `<div class="hq-phase-topics" aria-label="資料に多く現れた話題">${topics.map(topic => `<span class="tone-${esc(topic.id)}">${esc(topic.label)}</span>`).join("")}</div>` : ""}
      ${metrics.length ? `<div class="hq-phase-metrics">${metrics.join("")}</div>` : ""}</div></article>`;
  }).filter(Boolean);
  $("#hqPhases").innerHTML = `<ol class="hq-phase-list">${phaseCards.map(card => `<li>${card}</li>`).join("")}</ol><p class="hq-reading-note">「4つの局面」は、このサイトが会議資料を読みやすくするために設けた区分で、市の公式な区分ではありません。</p>`;

  const forwardPattern = /(今後|予定|見込み|準備|調整|検討|進め|努め|継続|調査中)/;
  const officialActions = [];
  for (const meeting of [...meetings].reverse().slice(0, 7)) {
    for (const block of meeting.blocks || []) for (const line of block.text.split("\n").map(item => item.trim()).filter(Boolean)) {
      if (!forwardPattern.test(line) || officialActions.some(item => item.text === line)) continue;
      officialActions.push({ text: line, meeting, url: meeting.documents?.[0]?.url });
      if (officialActions.length >= 5) break;
    }
    if (officialActions.length >= 5) break;
  }
  const challenges = [];
  if (evacuees?.value > 0) challenges.push(`${num(evacuees.value)}人が避難所で生活しており、避難所運営と生活環境への対応が続く状況です。`);
  if (applied && issued) challenges.push(`申請${num(applied.value)}件と交付${num(issued.value)}件の差は${num(applied.value - issued.value)}件です。調査・交付が続く段階ですが、この差は未交付件数や人数そのものとは限りません。`);
  const surveyedSeries = series("homesSurveyed");
  if (surveyedSeries.length >= 2) challenges.push(`住家の被害認定調査は前回掲載値から${num(surveyedSeries.at(-1).value - surveyedSeries.at(-2).value)}件増え、累計${num(surveyedSeries.at(-1).value)}件です。`);
  const unclassifiedPeople = latestFigure("injuredUnclassified");
  if (unclassifiedPeople?.value > 0) challenges.push(`人的被害では分類未確定${num(unclassifiedPeople.value)}名が最新資料に残っています。`);
  if (shelters?.value > 0) challenges.push(`避難所は${num(shelters.value)}か所が開設中で、状況に応じた運営・集約が引き続き必要な段階です。`);
  $("#hqDirection").innerHTML = `<article class="hq-direction-card is-official"><p class="hq-direction-label">資料に明記された今後の対応</p>${officialActions.length
    ? `<ul>${officialActions.map(item => `<li><p>${esc(readable(item.text))}</p><a href="${esc(item.url)}" target="_blank" rel="noopener">第${item.meeting.meeting}回（${day(item.meeting.date)}）の資料PDF</a></li>`).join("")}</ul>`
    : `<p class="hq-direction-empty">直近7回の資料には、「今後の対応」として読める記述を確認できませんでした。</p>`}</article>
    <article class="hq-direction-card is-reading"><p class="hq-direction-label">数値から見える継続課題</p><ul>${challenges.slice(0, 4).map(text => `<li>${esc(text)}</li>`).join("")}</ul><p class="hq-reading-note">会議資料の数値を比較した、このサイトの読み取りです。行政の計画・決定事項ではありません。</p></article>`;

  // ---- 時間の流れで見る -----------------------------------------------------
  // 「第何回」ではなく「発災から何日目」で並べる。回を等間隔に並べると、
  // 1日に3回開かれた日も2日空いた区間も同じ幅になり、動きが読めなくなる。
  const charts = [];
  const evacueeSeries = series("evacuees");
  if (evacueeSeries.length >= 2) {
    const peak = evacueeSeries.reduce((best, point) => point.value > best.value ? point : best, evacueeSeries[0]);
    const now = evacueeSeries.at(-1);
    charts.push({
      theme: "shelter", title: "避難している人の数",
      lead: `発災${dayOf(peak.date)}日目（${day(peak.date)}）の${num(peak.value)}人がいちばん多く、`
        + `${dayOf(now.date)}日目（${day(now.date)}）は${num(now.value)}人です。`
        + `いちばん多かったときの${Math.round((now.value / peak.value) * 100)}%にあたります。`,
      svg: lineChart([{ points: evacueeSeries, color: colorOf("shelter") }],
        { peak: Math.max(...evacueeSeries.map(point => point.value)), label: `避難者数の推移。発災${dayOf(evacueeSeries[0].date)}日目${num(evacueeSeries[0].value)}人から${dayOf(now.date)}日目${num(now.value)}人へ`, tall: true })
    });
  }
  const shelterSeries = series("shelters");
  if (shelterSeries.length >= 2) {
    const peak = shelterSeries.reduce((best, point) => point.value > best.value ? point : best, shelterSeries[0]);
    const now = shelterSeries.at(-1);
    charts.push({
      theme: "shelter", title: "開いている避難所の数",
      lead: `発災${dayOf(peak.date)}日目（${day(peak.date)}）の${num(peak.value)}か所から、`
        + `${dayOf(now.date)}日目（${day(now.date)}）は${num(now.value)}か所になりました。`
        + "避難所は少しずつ閉じて集約されていきます。行く前に市の最新の開設状況をご確認ください。",
      svg: lineChart([{ points: shelterSeries, color: colorOf("shelter") }],
        { peak: peak.value, label: `開設避難所数の推移。発災${dayOf(peak.date)}日目${num(peak.value)}か所から${dayOf(now.date)}日目${num(now.value)}か所へ`, tall: true })
    });
  }
  const applySeries = series("certificateApplications"), issueSeries = series("certificateIssued");
  if (applySeries.length >= 2 && issueSeries.length >= 2) {
    const start = applySeries[0], nowApply = applySeries.at(-1), nowIssue = issueSeries.at(-1);
    charts.push({
      theme: "home", title: "り災証明の申請と交付",
      lead: `申請の件数が資料に載り始めたのは発災${dayOf(start.date)}日目（${day(start.date)}）です。`
        + `${dayOf(nowApply.date)}日目には申請${num(nowApply.value)}件・交付${num(nowIssue.value)}件。`
        + "2本の線の開きは手続きの進み具合を見る目安ですが、未交付の人数そのものではありません。",
      legend: [["申請", colorOf("home")], ["交付", "#e0a94f"]],
      svg: lineChart([
        { points: applySeries, color: colorOf("home") },
        { points: issueSeries, color: "#e0a94f" }
      ], { peak: Math.max(...applySeries.map(point => point.value)), label: `り災証明の申請と交付の推移。${dayOf(nowApply.date)}日目で申請${num(nowApply.value)}件・交付${num(nowIssue.value)}件`, tall: true })
    });
  }
  const breakdown = [["homesFull", "全壊"], ["homesPartial", "一部損壊"], ["homesUnclassified", "分類未確定"]]
    .map(([key, label], order) => ({ key, label, points: series(key), color: [colorOf("home"), "#e0a94f", "#c7b299"][order] }))
    .filter(item => item.points.length >= 2);
  if (breakdown.length >= 2) {
    const unclassified = breakdown.find(item => item.key === "homesUnclassified");
    charts.push({
      theme: "home", title: "住家被害の内訳が決まっていく動き",
      lead: unclassified
        ? `区分がまだ決まっていないものは、発災${dayOf(unclassified.points[0].date)}日目の${num(unclassified.points[0].value)}件から`
          + `${dayOf(unclassified.points.at(-1).date)}日目の${num(unclassified.points.at(-1).value)}件へ減りました。`
          + "総数が動かないまま内訳だけが移っていくのは、判定が進んでいるためです。"
        : "区分ごとの件数の移り変わりです。",
      legend: breakdown.map(item => [item.label, item.color]),
      svg: lineChart(breakdown, { peak: Math.max(...breakdown.flatMap(item => item.points.map(point => point.value))), label: "住家被害の区分ごとの推移", tall: true })
    });
  }
  $("#hqCharts").innerHTML = charts.map(chart => `
    <article class="hq-chart-card tone-${esc(chart.theme)}">
      <h3>${esc(chart.title)}</h3>
      <p>${esc(chart.lead)}</p>
      ${chart.legend ? `<p class="hq-legend">${chart.legend.map(([label, color]) => `<span><i style="background:${color}"></i>${esc(label)}</span>`).join("")}</p>` : ""}
      ${chart.svg}
    </article>`).join("");

  // 会議の開かれ方
  const busiest = [...meetingsByDay].reduce((best, item) => item[1] > best[1] ? item : best, [0, 0]);
  const missing = [];
  for (let index = dayOf(first.date); index <= lastDay; index += 1) if (!meetingsByDay.has(index)) missing.push(index);
  $("#hqCadence").innerHTML = `
    <p>${esc(`発災${dayOf(first.date)}日目から${lastDay}日目までの${lastDay - dayOf(first.date) + 1}日間に${meetings.length}回。`
      + `いちばん多い日は${busiest[0] === 1 ? "発災当日" : `発災${busiest[0]}日目`}（${dateOfDay(busiest[0])}）の${busiest[1]}回です。`
      + (missing.length
        ? `開催がなかったのは${missing.map(index => `${dateOfDay(index)}（発災${index}日目）`).join("・")}の${missing.length}日です。`
        : "いまのところ、開催がなかった日はありません。"))}</p>
    ${cadenceChart()}
    <p class="hq-chart-note">棒の高さはその日の開催回数、細い線は開催のなかった日です。開く回数そのものが、市の対応の段階を表します。</p>`;

  // 話題の移り変わり
  // 「いつからいつまで」だけだと、どの話題もだいたい同じ答えになって情報に
  // ならない。会議のあった日のうち何日載ったか、直近はどうかで濃さを示す。
  const meetingDays = [...new Set(withText.map(meeting => dayOf(meeting.date)))].sort((a, b) => a - b);
  const recentDays = meetingDays.slice(-7);
  const spans = [...themeDays].map(([id, days]) => {
    const sorted = [...days].sort((a, b) => a - b);
    const theme = themes.find(item => item.id === id);
    const items = withText.reduce((sum, meeting) =>
      sum + (meeting.blocks || []).filter(block => block.theme === id).length, 0);
    return {
      id, label: theme?.label || id, from: sorted[0], to: sorted.at(-1),
      days: sorted.length, items,
      recent: recentDays.filter(dayIndex => days.has(dayIndex)).length
    };
  }).sort((a, b) => b.recent - a.recent || b.days - a.days);
  $("#hqTopics").innerHTML = `
    ${topicStrip()}
    <ul class="hq-spans">${spans.map(span => `<li class="tone-${esc(span.id)}">
      <b>${esc(span.label)}</b>
      <span>会議のあった${meetingDays.length}日のうち<b>${span.days}日</b>に記載（項目${num(span.items)}件）。
      直近${recentDays.length}日では${span.recent}日。
      発災${span.from}日目（${dateOfDay(span.from)}）から${span.to === lastDay ? "いまも" : `${span.to}日目（${dateOfDay(span.to)}）まで`}。</span>
    </li>`).join("")}</ul>
    <p class="hq-chart-note">色が付いた日は、その話題が資料に載っていた日です。載らない日があるのは、その日の資料に記載がなかったということで、対応が止まったという意味ではありません。</p>`;

  // ---- 知りたいことから -----------------------------------------------------
  $("#hqThemeNav").innerHTML = themes.map(theme => `
    <a href="#theme-${esc(theme.id)}" class="tone-${esc(theme.id)}">
      <b>${esc(theme.label)}</b><span>${esc(theme.question)}</span>
    </a>`).join("");

  // ---- 関心事ごとのまとまり -------------------------------------------------
  // 小さな推移も日付軸で描く。棒を回ごとに等間隔に並べると、1日3回の日と
  // 2日空いた区間が同じ幅になり、時間の流れが読めなくなる。
  const miniChart = (points, { color, unit }) => {
    const width = 260, height = 54, peak = Math.max(...points.map(point => point.value)) || 1;
    const at = point => ({
      x: 3 + ((dayOf(point.date) - 1) / Math.max(1, lastDay - 1)) * (width - 6),
      y: 5 + (1 - point.value / peak) * (height - 10)
    });
    const daily = byDate(points);
    const segments = daily.slice(1).map((point, order) => {
      const previous = daily[order], a = at(previous), b = at(point);
      const gap = dayOf(point.date) - dayOf(previous.date);
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="2" stroke-linecap="round"${gap > 1 ? ' stroke-dasharray="2 3"' : ""}/>`;
    }).join("");
    const dots = daily.map(point => {
      const spot = at(point);
      return `<circle cx="${spot.x}" cy="${spot.y}" r="2.4" fill="${color}"><title>${dateOfDay(dayOf(point.date))} ${num(point.value)}${unit}</title></circle>`;
    }).join("");
    return `<svg viewBox="0 0 ${width} ${height}" class="hq-mini" role="img" aria-label="発災${dayOf(daily[0].date)}日目${num(daily[0].value)}${unit}から${dayOf(daily.at(-1).date)}日目${num(daily.at(-1).value)}${unit}までの推移">${segments}${dots}</svg>`;
  };

  const metricCard = metric => {
    const points = series(metric.key);
    if (points.length < 1) return "";
    const latest = points.at(-1), peak = Math.max(...points.map(point => point.value));
    const missing = withText.length - points.length;
    return `
      <article class="hq-metric${metric.lead ? " is-lead" : ""}">
        <h4>${esc(metric.label)}</h4>
        <p class="hq-metric-latest"><b>${num(latest.value)}</b><small>${esc(metric.unit)}</small></p>
        <p class="hq-metric-when">発災${dayOf(latest.date)}日目（${day(latest.date)}）時点・第${latest.meeting}回</p>
        ${points.length >= 2 ? miniChart(points, { color: colorOf(metric.theme), unit: metric.unit }) : ""}
        ${points.length >= 2 ? `<dl class="hq-metric-range">
          <div><dt>はじめ</dt><dd>発災${dayOf(points[0].date)}日目 ${num(points[0].value)}</dd></div>
          <div><dt>いちばん多いとき</dt><dd>${num(peak)}</dd></div>
          <div><dt>資料に記載</dt><dd>${points.length}回${missing > 0 ? `<small>／${missing}回はなし</small>` : ""}</dd></div>
        </dl>` : ""}
        ${metric.plain ? `<p class="hq-metric-plain">${esc(metric.plain)}</p>` : ""}
        ${metric.note ? `<p class="hq-metric-note">${esc(metric.note)}</p>` : ""}
      </article>`;
  };

  $("#hqThemes").innerHTML = themes.map(theme => {
    const cards = METRICS.filter(metric => metric.theme === theme.id).map(metricCard).join("");
    const blocks = (last.blocks || []).filter(block => block.theme === theme.id);
    return `
      <section class="hq-theme tone-${esc(theme.id)}" id="theme-${esc(theme.id)}">
        <div class="hq-theme-head">
          <h3>${esc(theme.label)}</h3>
          <p>${esc(theme.question)}</p>
        </div>
        ${cards ? `<div class="hq-metrics">${cards}</div>` : ""}
        ${blocks.length ? `<div class="hq-theme-latest">
          <b>いちばん新しい回（第${last.meeting}回）の記載</b>
          ${blocks.map(block => `
            <div class="hq-block">
              <h4>${esc(block.title)}</h4>
              ${block.hint ? `<p class="hq-block-hint">${esc(block.hint)}</p>` : ""}
              ${labelled(block.text)}
            </div>`).join("")}
        </div>` : ""}
      </section>`;
  }).join("");

  // ---- 日ごとの変化 ---------------------------------------------------------
  // 前の回と比べて動いた数字と、新しく載った項目を文にする。
  const CHANGE_WORDS = {
    shelters: ["避難所", "か所"], evacuees: ["避難している人", "人"], households: ["避難している世帯", "世帯"],
    certificateApplications: ["り災証明の申請", "件"], certificateIssued: ["り災証明の交付", "件"],
    homesSurveyed: ["被害認定調査", "件"], homesReported: ["住家被害の届出", "件"],
    homesFull: ["全壊の判定", "件"], homesPartial: ["一部損壊の判定", "件"], homesUnclassified: ["区分が未確定のもの", "件"],
    deaths: ["亡くなった方", "名"], injuredSevere: ["重傷", "名"], injuredModerate: ["中等症", "名"], injuredMinor: ["軽傷", "名"]
  };
  // 見出しから、回ごとに変わる数字・日付・注記を落として比べるための形にする
  // 「人的被害 ：死者数 0名」のように、見出しと中身が続けて書かれた回がある。
  // 「：」の前までを項目名とみなすと、書き方が変わった回をまたいで同じ項目と
  // して扱える（そうしないと、書き方が変わっただけで新項目に見えてしまう）。
  // 括弧の外にある「：」の前までを項目名とする。括弧の中の「6：00時点」で
  // 切ってしまうと、同じ項目が回ごとに別物に見えてしまう。
  const headOf = title => {
    const text = String(title || "");
    let depth = 0;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if ("（(".includes(char)) depth += 1;
      else if ("）)".includes(char)) depth = Math.max(0, depth - 1);
      else if (depth === 0 && "：:".includes(char)) return text.slice(0, index).trim();
    }
    return text.trim();
  };
  const titleKey = title => {
    // 括弧は入れ子になる（「（8月11日(火)6：00時点）」）。内側から繰り返し外す
    let text = headOf(title), before;
    do { before = text; text = text.replace(/[（(][^（()）]*[）)]/g, ""); } while (text !== before);
    return text
      .replace(/[0-9０-９,，.．]/g, "")
      .replace(/(計|速報値|時点|現在|前日差|前回差)/g, "")
      .replace(/[＋+−\-▲△※、。：:（()）]/g, "")
      .replace(/\s+/g, "");
  };
  const changeRows = [];
  for (let index = 1; index < withText.length; index += 1) {
    const previous = withText[index - 1], current = withText[index];
    const moved = [];
    for (const [key, [label, unit]] of Object.entries(CHANGE_WORDS)) {
      const before = previous.figures?.[key], after = current.figures?.[key];
      if (before == null || after == null || before === after) continue;
      const diff = after - before;
      moved.push(`${label}が${num(before)}${unit}から${num(after)}${unit}へ（${diff > 0 ? "＋" : "−"}${num(Math.abs(diff))}）`);
    }
    // 見出しには「り災証明書申請件数計10,759件」のように数字が入る回がある。
    // そのまま比べると毎回すべてが新項目になるので、数字と括弧を外して見る。
    // また、前の回だけでなくそれ以前すべてと比べる（初めて載った回だけを出す）。
    const seen = new Set(withText.slice(0, index).flatMap(meeting => (meeting.blocks || []).map(block => titleKey(block.title))));
    // 40字を超える見出しは、資料側で見出しと本文が続けて書かれているもの。
    // 項目名として並べても読めないので、新しく載った項目には数えない。
    const fresh = (current.blocks || [])
      .filter(block => block.title && headOf(block.title).length <= 40)
      .filter(block => titleKey(block.title) && !seen.has(titleKey(block.title)))
      // 項目名として並べるので、末尾の件数は落とす（数字は変化の行で見せる）
      .map(block => headOf(block.title).replace(/\s*計?\s*[0-9０-９,，]+\s*[件棟人名か世]\S*.*$/, "").trim() || headOf(block.title));
    if (!moved.length && !fresh.length) continue;
    changeRows.push({ meeting: current, moved, fresh, gap: dayOf(current.date) - dayOf(previous.date) });
  }
  $("#hqChanges").innerHTML = [...changeRows].reverse().map(row => `
    <li>
      <div class="hq-change-when">
        <b>発災${dayOf(row.meeting.date)}日目</b>
        <span>${day(row.meeting.date)}・第${row.meeting.meeting}回</span>
        ${row.gap > 1 ? `<i>前の会議から${row.gap}日</i>` : ""}
      </div>
      <div class="hq-change-body">
        ${row.moved.length ? `<ul class="hq-change-moved">${row.moved.map(text => `<li>${esc(text)}</li>`).join("")}</ul>` : ""}
        ${row.fresh.length ? `<p class="hq-change-fresh"><b>この回から新しく載った項目</b>${row.fresh.map(title => `<span>${esc(title)}</span>`).join("")}</p>` : ""}
      </div>
    </li>`).join("");
  $("#hqChangesLead").textContent = changeRows.length
    ? `発災からの日数で並べています。資料に載った数字が前の回から動いたところと、その回から新しく出てきた項目です。`
      + `${changeRows.length}回ぶん。会議が2日以上あいたところは、間隔も書き添えています。`
    : "前の回と比べられる数字がまだありません。";

  // ---- 言葉の説明 -----------------------------------------------------------
  // 資料に出てくる行政の言い方を、災害用語集（terms.html と共有）から拾う。
  const allText = municipality.meetings.flatMap(meeting => (meeting.blocks || [])
    .map(block => `${block.title} ${block.text}`)).join(" ");
  const used = (window.GLOSSARY || []).filter(term =>
    [term.term, ...String(term.reading || "").split(/\s+/)]
      .flatMap(word => String(word).split("・"))
      .some(word => word.length >= 2 && allText.includes(word)));
  $("#hqGlossary").innerHTML = used.map(term => `
    <details class="hq-term">
      <summary><b>${esc(term.term)}</b><span>${esc(term.short)}</span></summary>
      <div>
        <p>${esc(term.body)}</p>
        ${term.diff ? `<p class="hq-term-diff">ちがい：${esc(term.diff)}</p>` : ""}
        ${term.official ? `<a href="${esc(term.official[1])}" target="_blank" rel="noopener">${esc(term.official[0])} ↗</a>` : ""}
      </div>
    </details>`).join("");
  $("#hqGlossaryLead").textContent = used.length
    ? `この市の資料に出てくる言葉のうち、${used.length}語について説明があります。用語集にも同じ説明を載せています。`
    : "";

  // ---- 会議ごとの記録 -------------------------------------------------------
  const themeLabel = id => (data.themes || []).find(theme => theme.id === id)?.label || "その他";
  const records = [...municipality.meetings].reverse().map(meeting => {
    const figures = METRICS
      .filter(metric => meeting.figures?.[metric.key] != null)
      .map(metric => `<div><dt>${esc(metric.label)}</dt><dd>${num(meeting.figures[metric.key])}<small>${esc(metric.unit)}</small></dd></div>`)
      .join("");
    const grouped = new Map();
    for (const block of meeting.blocks || []) {
      const id = block.theme || "other";
      if (!grouped.has(id)) grouped.set(id, []);
      grouped.get(id).push(block);
    }
    const body = [...grouped].map(([id, blocks]) => `
      <div class="hq-record-theme tone-${esc(id)}">
        <b>${esc(themeLabel(id))}</b>
        ${blocks.map(block => `
          <div class="hq-block">
            <h4>${esc(block.title)}</h4>
            ${block.hint ? `<p class="hq-block-hint">${esc(block.hint)}</p>` : ""}
            ${labelled(block.text)}
          </div>`).join("")}
      </div>`).join("");
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
          ${body || `<p class="hq-record-empty">この回は本文が公開されていません。資料PDFをご確認ください。</p>`}
          ${meeting.sourcePage ? `<p class="hq-record-page">数字と本文は資料PDFの${meeting.sourcePage}ページ目（全${meeting.pages}ページ）から写しました。</p>` : ""}
          <p class="hq-record-links">${documents}</p>
        </div>
      </details>`;
  }).join("");
  $("#hqRecords").innerHTML = records;
  $("#hqRecordCount").textContent = `${municipality.meetings.length}回ぶん。新しい順に並べ、回の中は関心事ごとにまとめています。`;

  // ---- 出典とページの作り方 -------------------------------------------------
  $("#hqSource").innerHTML = `
    <b>一次情報</b>
    <p>数字も本文も、${esc(municipality.name)}が公開している資料そのものです。判断の前に必ず市の発表をご確認ください。</p>
    <a href="${esc(municipality.indexUrl)}" target="_blank" rel="noopener">${esc(municipality.indexTitle)}（${esc(municipality.name)}）→</a>
    ${last.documents?.length ? `<a href="${esc(last.documents[0].url)}" target="_blank" rel="noopener">いちばん新しい第${last.meeting}回の資料（PDF）→</a>` : ""}`;

  $("#hqMethod").innerHTML = `
    <li>${esc(municipality.note)}</li>
    <li>資料の文は書き換えていません。足しているのは、関心事ごとの並べ替えと、言葉の説明と、数字の意味づけだけです。</li>
    <li>読みやすさのため、表示のときだけ全角の数字を半角にしています（資料の文字そのものは変えていません）。</li>
    <li>数字は資料に書かれたものだけを写しています。書かれていない項目は空欄にし、前の回の値で埋めることはしません。</li>
    <li>資料に載っている前回との差（＋12、▲7 など）は取り込まず、その回に書かれた値そのものを並べています。変化の文はこちらで計算したものです。</li>
    <li>取得日時：${esc(new Date(data.retrievedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }))}。毎日の自動更新で、新しい回が公開され次第ここに増えます。</li>`;

  const other = data.municipalities.filter(item => item.key !== municipality.key);
  $("#hqOther").innerHTML = other.length
    ? `<b>ほかの市の本部会議</b>${other.map(item => `<a href="${esc(item.page)}">${esc(item.name)}の災害対策本部会議 →</a>`).join("")}`
    : "";
})();
