// 議事録ビューア（meetings.html 専用）
// minutes-data.js の構造をそのまま描画する。data.js とは独立して動く。
try{

const MINUTES = window.MINUTES_DATA;
const root = document.querySelector("#minutesApp");

if(root && MINUTES){
  const { sectionDefs, themes, meetings } = MINUTES;
  const $ = s => root.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  const sectionDef = key => sectionDefs.find(d => d.key === key);
  const themeDef = key => themes.find(t => t.key === key);
  const dateLabel = (iso, full = true) => new Intl.DateTimeFormat("ja-JP", full
    ? { year:"numeric", month:"long", day:"numeric", weekday:"short" }
    : { month:"numeric", day:"numeric" }).format(new Date(`${iso}T00:00:00+09:00`));
  const pdfHref = (m, page) => encodeURI(page ? `${m.pdf}#page=${page}` : m.pdf);
  const ordered = [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  const latest = ordered[0];

  // ---- 横断検索用のフラットな索引 -------------------------------------------
  // 1項目 = 1発言／1数値。どの回・どの議題・PDFの何ページから来たかを持たせる。
  const index = [];
  meetings.forEach(m => {
    m.sections.forEach(section => {
      if(section.vcTable){
        section.vcTable.rows.forEach(row => index.push({
          meeting: m, sectionKey: section.key, groupTitle: section.vcTable.heading,
          page: section.vcTable.page, theme: null,
          speaker: row.name, text: `${row.status}${row.detail ? ` ／ ${row.detail}` : ""}`
        }));
      }
      (section.groups || []).forEach(group => {
        group.items.forEach(item => index.push({
          meeting: m, sectionKey: section.key, groupTitle: group.title,
          page: group.page || section.page, theme: group.theme || null,
          speaker: item.speaker || item.label || null, text: item.text || item.link?.label || "",
          link: item.link, isLabel: !!item.label
        }));
      });
    });
  });

  let selected = (() => {
    const q = Number(new URLSearchParams(location.search).get("meeting"));
    return meetings.some(m => m.meeting === q) ? q : latest.meeting;
  })();
  let query = "";
  let activeTheme = "";

  // ---- 部品 -----------------------------------------------------------------
  const pageLink = (m, page, label) =>
    page ? `<a class="minutes-pagelink" href="${pdfHref(m, page)}" target="_blank" rel="noopener">${label || `p.${page}`} ↗</a>` : "";

  const itemHtml = item => {
    const who = item.speaker || item.label;
    const cls = item.speaker ? "is-voice" : item.label ? "is-stat" : "";
    const link = item.link
      ? `<a class="minutes-link" href="${esc(item.link.url)}" target="_blank" rel="noopener">${esc(item.link.label)} ↗</a>`
      : "";
    return `<li class="${cls}">${who ? `<b>${esc(who)}</b>` : ""}<div>${item.text ? `<p>${esc(item.text)}</p>` : ""}${link}</div></li>`;
  };

  const groupHtml = (m, group) => `
    <div class="minutes-group">
      <div class="minutes-group-head">
        <h4>${esc(group.title)}${group.theme ? `<span class="minutes-theme-tag">${esc(themeDef(group.theme)?.group || "")}</span>` : ""}</h4>
        ${pageLink(m, group.page)}
      </div>
      ${group.source ? `<p class="minutes-source">${esc(group.source)}</p>` : ""}
      <ul class="minutes-items">${group.items.map(itemHtml).join("")}</ul>
    </div>`;

  const vcTableHtml = (m, table) => `
    <div class="minutes-group minutes-vc">
      <div class="minutes-group-head">
        <h4>${esc(table.heading)}</h4>
        ${pageLink(m, table.page)}
      </div>
      <div class="minutes-table-scroll">
        <table>
          <thead><tr><th>市町村</th><th>開所・活動状況</th><th>会場と補足</th></tr></thead>
          <tbody>${table.rows.map(r => `<tr><th scope="row">${esc(r.name)}</th><td><span class="vc-status">${esc(r.status)}</span></td><td>${esc(r.detail)}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      ${table.normal ? `<p class="minutes-vc-normal"><b>${esc(table.normal.label)}</b>${table.normal.names.map(n => `<span>${esc(n)}</span>`).join("")}</p>` : ""}
      ${table.note ? `<p class="minutes-source">${esc(table.note)}</p>` : ""}
    </div>`;

  const sectionHtml = (m, section) => {
    const def = sectionDef(section.key) || { title: section.key, no: "", description: "" };
    const body = `${section.vcTable ? vcTableHtml(m, section.vcTable) : ""}${(section.groups || []).map(g => groupHtml(m, g)).join("")}`;
    return `
      <section class="minutes-section" id="sec-${esc(section.key)}">
        <header class="minutes-section-head">
          <span class="minutes-no">${esc(def.no)}</span>
          <div><h3>${esc(def.title)}</h3><p>${esc(def.description)}</p></div>
        </header>
        ${body}
      </section>`;
  };

  // ---- 会議の選択（日付タブ） -----------------------------------------------
  const renderPicker = () => {
    $("#minutesPicker").innerHTML = ordered.map(m => `
      <button type="button" data-meeting="${m.meeting}" class="${m.meeting === selected ? "active" : ""}" aria-pressed="${m.meeting === selected}">
        <time datetime="${m.date}">${dateLabel(m.date, false)}</time>
        <b>第${m.meeting}回</b>
        <small>発災${m.disasterDay}日目</small>
      </button>`).join("");
    root.querySelectorAll("#minutesPicker button").forEach(b => b.onclick = () => {
      selected = Number(b.dataset.meeting);
      history.replaceState(null, "", `?meeting=${selected}`);
      renderPicker(); renderDoc();
      $("#minutesDoc").scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  // ---- 1回分の議事録 --------------------------------------------------------
  const renderDoc = () => {
    const m = meetings.find(x => x.meeting === selected);
    const att = m.attendance;
    const attendanceText = [
      att.total != null ? `参加${att.total.toLocaleString("ja-JP")}人` : null,
      att.onsite != null ? `現地${att.onsite}人` : null,
      att.online != null ? `オンライン${att.online.toLocaleString("ja-JP")}人` : null
    ].filter(Boolean).join("・") || "参加人数は資料に記載なし";

    $("#minutesDoc").innerHTML = `
      <header class="minutes-doc-head">
        <div>
          <p class="minutes-eyebrow">第${m.meeting}回 火の国会議 ／ 令和8年熊本地震 第${m.series}回</p>
          <h2>${dateLabel(m.date)} 18:00〜</h2>
          <p class="minutes-doc-meta"><span>発災${m.disasterDay}日目</span><span>${esc(attendanceText)}</span><span>全${m.pages}ページ</span></p>
          <p class="minutes-venue">${esc(m.venue)}</p>
        </div>
        <a class="minutes-pdf" href="${pdfHref(m)}" target="_blank" rel="noopener">議事録PDF全文 ↗</a>
      </header>
      <nav class="minutes-index" aria-label="議事次第">
        ${m.sections.map(s => {
          const def = sectionDef(s.key) || {};
          return `<a href="#sec-${esc(s.key)}"><b>${esc(def.no || "")}</b>${esc(def.short || def.title || s.key)}</a>`;
        }).join("")}
      </nav>
      <div class="minutes-sections">${m.sections.map(s => sectionHtml(m, s)).join("")}</div>
      <div class="minutes-orgs">
        <b>参加団体（順不同・${m.orgs.length}団体）</b>
        <div>${m.orgs.map(o => `<span>${esc(o)}</span>`).join("")}</div>
      </div>`;
  };

  // ---- 分野フィルタ ---------------------------------------------------------
  const renderThemes = () => {
    const groups = [...new Set(themes.map(t => t.group))];
    $("#minutesThemes").innerHTML = groups.map(g => `
      <div class="minutes-theme-group">
        <span>${esc(g)}</span>
        ${themes.filter(t => t.group === g).map(t =>
          `<button type="button" data-theme="${t.key}" class="${t.key === activeTheme ? "active" : ""}" aria-pressed="${t.key === activeTheme}">${esc(t.label)}</button>`).join("")}
      </div>`).join("");
    root.querySelectorAll("#minutesThemes button").forEach(b => b.onclick = () => {
      activeTheme = activeTheme === b.dataset.theme ? "" : b.dataset.theme;
      renderThemes(); renderResults();
    });
  };

  // ---- 横断検索・分野別の結果 -----------------------------------------------
  const renderResults = () => {
    const q = query.trim().toLowerCase();
    const filtering = q.length > 0 || activeTheme !== "";
    $("#minutesResults").hidden = !filtering;
    $("#minutesBrowser").hidden = filtering;
    if(!filtering) return;

    const hits = index.filter(row =>
      (!activeTheme || row.theme === activeTheme) &&
      (!q || `${row.speaker || ""}${row.text}${row.groupTitle}`.toLowerCase().includes(q))
    );

    // 新しい回から順に、回ごとにまとめて出す
    const byMeeting = ordered
      .map(m => ({ m, rows: hits.filter(h => h.meeting.meeting === m.meeting) }))
      .filter(x => x.rows.length);

    const heading = [
      activeTheme ? `分野「${themeDef(activeTheme).label}」` : null,
      q ? `「${query.trim()}」` : null
    ].filter(Boolean).join(" × ");

    $("#minutesResults").innerHTML = `
      <div class="minutes-results-head">
        <h2>${esc(heading)}</h2>
        <p>${hits.length}件 ／ ${byMeeting.length}回の議事録${hits.length ? "" : "（該当なし）"}</p>
        <button type="button" id="minutesReset">絞り込みを解除</button>
      </div>
      ${byMeeting.map(({ m, rows }) => `
        <section class="minutes-result-day">
          <header>
            <time datetime="${m.date}">${dateLabel(m.date)}</time>
            <b>第${m.meeting}回</b>
            <span>発災${m.disasterDay}日目</span>
            <a href="?meeting=${m.meeting}">この回の全文へ →</a>
          </header>
          <ul class="minutes-items">${rows.map(r => `
            <li class="${r.speaker ? (r.isLabel ? "is-stat" : "is-voice") : ""}">
              ${r.speaker ? `<b>${esc(r.speaker)}</b>` : ""}
              <div>
                <p>${esc(r.text)}</p>
                <p class="minutes-crumb">${esc(sectionDef(r.sectionKey)?.title || r.sectionKey)} ／ ${esc(r.groupTitle)} ${pageLink(m, r.page)}</p>
              </div>
            </li>`).join("")}</ul>
        </section>`).join("")}`;

    const reset = root.querySelector("#minutesReset");
    if(reset) reset.onclick = () => {
      query = ""; activeTheme = "";
      $("#minutesSearch").value = "";
      renderThemes(); renderResults();
    };
  };

  $("#minutesSearch").addEventListener("input", e => { query = e.target.value; renderResults(); });
  renderPicker(); renderDoc(); renderThemes(); renderResults();
}

}catch(err){
  console.error("[火の国レポート] 議事録の描画に失敗しました", err);
  document.querySelector("#minutesApp")?.insertAdjacentHTML("afterbegin",
    `<div class="data-error" role="alert"><b>議事録を表示できませんでした</b>`+
    `<p>下の「議事録原本（PDF）」から原資料をご確認ください。</p></div>`);
}
