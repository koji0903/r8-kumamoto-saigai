// 議事録ビューア（meetings.html 専用）
// data/minutes-data.js の構造をそのまま描画する。data/report-data.js とは独立して動く。
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
  const searchLabel = $("#minutesSearchLabel");
  if(searchLabel) searchLabel.textContent = `${meetings.length}回分の議事録を横断検索`;

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
          ${m.attendanceNote ? `<p class="minutes-attendance-note">注：${esc(m.attendanceNote)}</p>` : ""}
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

  // ---- 時系列フェーズ概要 ---------------------------------------------------
  const PHASES = [
    {
      id: "phase1",
      shortTitle: "Phase 1: 救助・応急対応",
      dateRange: "7/29〜8/4",
      title: "Phase 1: 初期救助・避難所開設・応急対応期",
      period: "7月29日〜8月4日（第492回〜第498回・発災2〜8日目）",
      targetMeeting: 492,
      badge: "発災直後〜第1週",
      situation: [
        "広域断水が発生（最大約8.8万戸・熊本市/宇土市/宇城市/八代市など）。",
        "県内約3.5万戸で停電。給水車・電源車の緊急配備を調整・発送。",
        "避難所数がピークの432か所、避難者数約9,450人に達する。"
      ],
      focus: [
        "人命救助・安否確認と避難所の迅速な開設・運営確保。",
        "熱中症対策（スポットクーラー・発電機）やパン等の緊急食糧配布。",
        "県内11市町社協による災害ボランティアセンター（VC）立ち上げ準備。"
      ],
      topics: [
        "先遣隊の派遣と各市町村社協職員の安否確認",
        "在宅・車中泊被災者の初期アセスメントと水・食糧配給",
        "受入ボランティアのマッチングと安全管理体制の構築"
      ]
    },
    {
      id: "phase2",
      shortTitle: "Phase 2: 避難生活・VC本格化",
      dateRange: "8/5〜8/15",
      title: "Phase 2: 避難生活環境改善・災害VC本格化期",
      period: "8月5日〜8月15日（第499回〜第508回・発災9〜19日目）",
      targetMeeting: 499,
      badge: "発災第2〜3週前半",
      situation: [
        "停電は概ね解消。断水は県南（宇城・八代・氷川）中心に継続（3.4万戸→2.6万戸）。",
        "避難所の集約・統合が進み、避難者は3,700人規模（80か所）へ減少。",
        "住家被害調査が進み、全壊1,200棟超含む30,000棟以上の被害を確認。"
      ],
      focus: [
        "避難所の生活環境改善（福祉避難所・ダンボールベッド・アレルギー配慮食）。",
        "災害VCが11市町で本格稼働。家具搬出・泥出し・ブルーシート張り作業開始。",
        "DWAT（災害派遣福祉チーム）や各種NPO等の専門支援チーム本格投入。"
      ],
      topics: [
        "在宅避難者・車中泊者への訪問調査と個別ニーズ拾い上げ",
        "応急仮設住宅の建設場所・着工計画の提示",
        "子どもの居場所・学習支援と猛暑下のボランティア熱中症対策"
      ]
    },
    {
      id: "phase3",
      shortTitle: "Phase 3: 上水道復旧・再建移行",
      dateRange: "8/16〜8/25",
      title: "Phase 3: 上水道応急復旧・生活再建移行期",
      period: "8月16日〜8月25日（第509回〜第517回・発災20〜29日目）",
      targetMeeting: 509,
      badge: "発災第3週後半〜第4週",
      situation: [
        "試験通水により上水道の応急復旧が急ピッチ進行（断水2.6万戸→2,320戸へ激減）。",
        "避難者数は2,600人規模に減少。在宅避難やみなし仮設への移動が進む。",
        "住家被害の確認件数が約3.9万棟へ拡大。罹災証明書の発行が順次本格化。"
      ],
      focus: [
        "応急避難から在宅避難・応急仮設住宅・みなし仮設住宅へのスムーズな移行支援。",
        "罹災証明書の交付手続き、家屋の応急修理・公費解体に関する相談支援。",
        "技術系ボランティア（重機・屋根保全）と福祉ボランティアの連携維持。"
      ],
      topics: [
        "長期化する在宅避難者の健康管理と孤立防止アプローチ",
        "公費解体申請・罹災証明発行窓口の混雑緩和と情報周知",
        "お盆期間後のボランティア確保とニーズのミスマッチ解消"
      ]
    },
    {
      id: "phase4",
      shortTitle: "Phase 4: 断水解消・中長期支援",
      dateRange: "8/26〜9/4",
      title: "Phase 4: 断水概ね解消・仮設入居・中長期支援期",
      period: "8月26日〜9月4日（第518回〜第524回・発災30〜39日目）",
      targetMeeting: 518,
      badge: "発災第5週以降",
      situation: [
        "主要な断水区域の応急通水が完了し、断水が概ね解消。",
        "避難所は38か所・1,970人に縮小。応急仮設住宅への入居がスタート。",
        "住家被害の全体像が定着（一部破損含む64,000棟超の被害把握）。"
      ],
      focus: [
        "応急仮設住宅の自治会形成・入居者見守り・コミュニティ再生。",
        "災害VCの平日/休日体制見直しと、常設社協・地域密着型事業への引き継ぎ。",
        "中長期的な個別生活再建ケース管理（高齢者・要支援者の継続見守り）。"
      ],
      topics: [
        "仮設住宅での生活スタートと集会所・ボランティア拠点の設営",
        "広域VCから地域サテライト・個別訪問支援へのシフト",
        "被災者総合相談窓口・各種助成制度の周知徹底"
      ]
    }
  ];

  let activePhaseId = "phase1";
  const phaseOverviewRoot = document.querySelector("#phaseOverview");

  const renderPhases = () => {
    if(!phaseOverviewRoot) return;
    const tabsContainer = phaseOverviewRoot.querySelector("#phaseTabs");
    const contentContainer = phaseOverviewRoot.querySelector("#phaseCardContent");
    if(!tabsContainer || !contentContainer) return;

    tabsContainer.innerHTML = PHASES.map(p => `
      <button type="button" class="phase-tab ${p.id === activePhaseId ? "active" : ""}" data-phase="${p.id}" aria-pressed="${p.id === activePhaseId}">
        <span class="phase-tab-badge">${esc(p.badge)}</span>
        <b>${esc(p.shortTitle)}</b>
        <small>${esc(p.dateRange)}</small>
      </button>`).join("");

    const activeP = PHASES.find(p => p.id === activePhaseId) || PHASES[0];

    contentContainer.innerHTML = `
      <article class="phase-card">
        <div class="phase-card-header">
          <div>
            <span class="phase-badge">${esc(activeP.badge)}</span>
            <h3>${esc(activeP.title)}</h3>
            <p class="phase-period">${esc(activeP.period)}</p>
          </div>
          <button type="button" class="phase-jump-btn" data-target="${activeP.targetMeeting}">
            この時期の議事録を見る（第${activeP.targetMeeting}回〜） ↗
          </button>
        </div>
        <div class="phase-grid">
          <div class="phase-col situation-col">
            <h4><span class="phase-icon" aria-hidden="true">⚠️</span>災害状況の推移</h4>
            <ul>${activeP.situation.map(item => `<li>${esc(item)}</li>`).join("")}</ul>
          </div>
          <div class="phase-col focus-col">
            <h4><span class="phase-icon" aria-hidden="true">🎯</span>支援・議題の焦点</h4>
            <ul>${activeP.focus.map(item => `<li>${esc(item)}</li>`).join("")}</ul>
          </div>
          <div class="phase-col topics-col">
            <h4><span class="phase-icon" aria-hidden="true">💬</span>主な動き・トピックス</h4>
            <ul>${activeP.topics.map(item => `<li>${esc(item)}</li>`).join("")}</ul>
          </div>
        </div>
      </article>`;

    tabsContainer.querySelectorAll(".phase-tab").forEach(b => {
      b.onclick = () => {
        activePhaseId = b.dataset.phase;
        renderPhases();
      };
    });

    contentContainer.querySelectorAll(".phase-jump-btn").forEach(b => {
      b.onclick = () => {
        const q = Number(b.dataset.target);
        if(q && meetings.some(m => m.meeting === q)){
          selected = q;
          history.replaceState(null, "", `?meeting=${selected}`);
          renderPicker();
          renderDoc();
          $("#minutesDoc")?.scrollIntoView({ block: "start", behavior: "smooth" });
        }
      };
    });
  };

  renderPicker(); renderDoc(); renderThemes(); renderResults(); renderPhases();
}

}catch(err){
  console.error("[火の国レポート] 議事録の描画に失敗しました", err);
  document.querySelector("#minutesApp")?.insertAdjacentHTML("afterbegin",
    `<div class="data-error" role="alert"><b>議事録を表示できませんでした</b>`+
    `<p>下の「議事録原本（PDF）」から原資料をご確認ください。</p></div>`);
}
