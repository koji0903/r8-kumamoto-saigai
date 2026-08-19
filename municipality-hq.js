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
//     ・数字には意味を添える（申請と交付の差＝待っている人）
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
      plain: "実際に証明書が渡された件数です。申請との差が、待っている人の多さです。" },
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
  // 数字も本文も無い関心事は出さない（空の見出しが並ぶと探しにくくなる）
  const themes = (data.themes || []).filter(theme =>
    METRICS.some(metric => metric.theme === theme.id && series(metric.key).length)
    || municipality.meetings.some(meeting => (meeting.blocks || []).some(block => block.theme === theme.id)));


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
      body: `交付は申請の${rate}%です。差し引き${num(applied.value - issued.value)}件が、調査や判定を待っている状態にあたります。`,
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

  // ---- 知りたいことから -----------------------------------------------------
  $("#hqThemeNav").innerHTML = themes.map(theme => `
    <a href="#theme-${esc(theme.id)}" class="tone-${esc(theme.id)}">
      <b>${esc(theme.label)}</b><span>${esc(theme.question)}</span>
    </a>`).join("");

  // ---- 関心事ごとのまとまり -------------------------------------------------
  const sparkline = (points, unit) => {
    const peak = Math.max(...points.map(point => point.value)) || 1;
    return points.map(point => {
      const height = Math.max(3, Math.round((point.value / peak) * 100));
      return `<span style="height:${height}%" title="第${point.meeting}回 ${day(point.date)} ${num(point.value)}${unit}"></span>`;
    }).join("");
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
        <p class="hq-metric-when">第${latest.meeting}回（${day(latest.date)}）時点</p>
        ${points.length >= 2 ? `<div class="hq-spark" role="img" aria-label="第${points[0].meeting}回${num(points[0].value)}${metric.unit}から第${latest.meeting}回${num(latest.value)}${metric.unit}まで">${sparkline(points, metric.unit)}</div>` : ""}
        ${points.length >= 2 ? `<dl class="hq-metric-range">
          <div><dt>はじめ</dt><dd>${num(points[0].value)}</dd></div>
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
    changeRows.push({ meeting: current, moved, fresh });
  }
  $("#hqChanges").innerHTML = [...changeRows].reverse().map(row => `
    <li>
      <div class="hq-change-when"><b>${day(row.meeting.date)}</b><span>第${row.meeting.meeting}回</span></div>
      <div class="hq-change-body">
        ${row.moved.length ? `<ul class="hq-change-moved">${row.moved.map(text => `<li>${esc(text)}</li>`).join("")}</ul>` : ""}
        ${row.fresh.length ? `<p class="hq-change-fresh"><b>この回から新しく載った項目</b>${row.fresh.map(title => `<span>${esc(title)}</span>`).join("")}</p>` : ""}
      </div>
    </li>`).join("");
  $("#hqChangesLead").textContent = changeRows.length
    ? `資料に載った数字が前の回から動いたところと、その回から新しく出てきた項目を並べています。${changeRows.length}回ぶん。`
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
