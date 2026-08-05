// 熊本県災害対策本部会議「人的被害等の状況」の描画。
//
// hq-damage-data.js（生成物）を読み、市町村ごとの現在値・推移・罹災証明の日程を出す。
// app.js とは疎結合にしてあり、このファイルや hq-damage-data.js が落ちても
// 会議由来の情報（data.js）はそのまま表示される。
try{

const HQ = window.HQ_DAMAGE;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

// ---- 災害対策本部会議の資料一覧（official.html） ------------------------------
// 被害状況データ（hq-damage-data.js は152KB）を読まないページでも出せるよう、
// カタログ（hq-index.js）だけで完結させる。
const indexHost = document.querySelector("#hqMeetingIndex");
if(indexHost && window.HQ_INDEX){
  // よく参照される順に並べ、それ以外は資料の掲載順のまま
  const rank = t => ["議事録", "人的被害等の状況", "本部会議資料", "各部説明資料", "各部報告資料", "知事コメント"]
    .findIndex(k => t.includes(k));
  indexHost.innerHTML = [...window.HQ_INDEX.meetings].reverse().map(m => `
    <article>
      <header>
        <b>第${m.meeting}回</b>
        ${m.govMeeting ? `<span>政府非常災害現地対策本部会議 第${m.govMeeting}回 と合同</span>` : ""}
      </header>
      <div>${[...m.documents]
        .sort((a, b) => (rank(a.title) < 0 ? 99 : rank(a.title)) - (rank(b.title) < 0 ? 99 : rank(b.title)))
        .map(d => `<a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.title.replace(/^令和8年熊本地震による/, ""))} ↗</a>`)
        .join("")}</div>
    </article>`).join("");
}

if(HQ){
  const fmt = n => n == null ? "—" : n.toLocaleString("ja-JP");
  const snapshots = HQ.snapshots;
  const latest = snapshots.at(-1);
  const dateLabel = (iso, full = true) => new Intl.DateTimeFormat("ja-JP", full
    ? { year:"numeric", month:"long", day:"numeric" }
    : { month:"numeric", day:"numeric" }).format(new Date(`${iso}T00:00:00+09:00`));
  const asOf = s => `${dateLabel(s.date)} ${s.time}`;

  // 値がない＝資料にその列がなかった、を 0 と混同しないよう常に区別する
  const valueOf = (snap, name, key) =>
    snap.columns.includes(key) ? (snap.municipalities[name]?.[key] ?? 0) : null;
  const totalOf = (snap, key) => snap.columns.includes(key) ? (snap.totals[key] ?? 0) : null;

  const homesBreakdown = (snap, name) => [
    ["全壊", "homesFull"], ["大規模半壊", "homesLargeHalf"], ["半壊", "homesHalf"],
    ["一部破損", "homesPartial"], ["分類未確定", "homesUnclassified"]
  ].map(([label, key]) => ({ label, value: valueOf(snap, name, key) }))
   .filter(x => x.value != null);

  const homesTotalOf = (snap, name) => {
    const direct = valueOf(snap, name, "homesTotal");
    if(direct != null) return direct;
    const parts = homesBreakdown(snap, name);
    return parts.length ? parts.reduce((a, x) => a + x.value, 0) : null;
  };

  // 折れ線1本。値が取れない時点は線を切って、0 と同じに見えないようにする
  const sparkline = (series, color) => {
    const valid = series.filter(p => p.v != null);
    if(valid.length < 2) return "";
    const max = Math.max(...valid.map(p => p.v)) || 1;
    const W = 240, H = 46, pad = 3;
    const pts = series.map((p, i) => p.v == null ? null : {
      x: pad + i * (W - pad * 2) / (series.length - 1),
      y: H - pad - (p.v / max) * (H - pad * 2)
    });
    const segs = []; let cur = [];
    pts.forEach(p => { if(p) cur.push(p); else if(cur.length){ segs.push(cur); cur = []; } });
    if(cur.length) segs.push(cur);
    const last = pts.filter(Boolean).at(-1);
    return `<svg class="hq-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">`
      + segs.map(s => `<polyline fill="none" stroke="${color}" stroke-width="2.5" points="${s.map(p => `${p.x},${p.y}`).join(" ")}"/>`).join("")
      + `<circle cx="${last.x}" cy="${last.y}" r="3.5" fill="${color}"/></svg>`;
  };

  const metricCard = (label, value, unit, series, color, note) => `
    <article class="hq-metric">
      <span>${esc(label)}</span>
      <strong>${fmt(value)}<small>${esc(unit)}</small></strong>
      ${sparkline(series, color)}
      ${note ? `<p>${esc(note)}</p>` : ""}
    </article>`;

  // ---- 自治体別ページ --------------------------------------------------------
  window.renderHqPanel = name => {
    const host = document.querySelector("#hqPanel");
    if(!host) return;
    const series = key => snapshots.map(s => ({ v: valueOf(s, name, key) }));
    const homesSeries = snapshots.map(s => ({ v: homesTotalOf(s, name) }));
    const homes = homesTotalOf(latest, name);
    const parts = homesBreakdown(latest, name);
    const cert = HQ.certification[name];
    const certAsOf = HQ.metadata.certificationAsOf;

    // 資料に一度も数字が出ていない自治体は、0 を並べるより言葉で伝えたほうが正確
    const everReported = snapshots.some(s => Object.values(s.municipalities[name] || {}).some(v => v > 0));

    host.innerHTML = `
      <div class="hq-head">
        <div>
          <p class="hq-eyebrow">熊本県 災害対策本部会議（公式）</p>
          <h4>${esc(name)}の被害状況</h4>
          <span>${asOf(latest)}時点 ／ 第${latest.meeting}回${latest.govMeeting ? `・政府第${latest.govMeeting}回` : ""}</span>
        </div>
        <a href="${esc(latest.sourceUrl)}" target="_blank" rel="noopener">この資料（PDF） ↗</a>
      </div>
      ${everReported ? `
        <div class="hq-metrics">
          ${metricCard("避難者", valueOf(latest, name, "evacuees"), "人", series("evacuees"), "#e45e35")}
          ${metricCard("避難所", valueOf(latest, name, "shelters"), "か所", series("shelters"), "#d39b2b")}
          ${metricCard("住家被害", homes, "棟", homesSeries, "#6577a6", parts.length ? parts.map(p => `${p.label}${fmt(p.value)}`).join("・") : "")}
          ${metricCard("断水", valueOf(latest, name, "waterOutages"), "戸", series("waterOutages"), "#2d79a8")}
          ${metricCard("給水所", valueOf(latest, name, "waterStations"), "か所", series("waterStations"), "#3b8a78")}
          ${metricCard("死亡", valueOf(latest, name, "deaths"), "人", series("deaths"), "#7a6a63")}
        </div>
        <p class="hq-spark-note">折れ線は${dateLabel(snapshots[0].date, false)}以降の推移です。資料に列がなかった時点は線を切っています。</p>
      ` : `<p class="hq-empty">この市町村について、県の資料に計上された被害はこれまで報告されていません（すべて0）。</p>`}
      ${cert ? `
        <div class="hq-cert">
          <b>罹災証明・住家被害認定調査</b>
          <div>
            <span>罹災証明書発行申請 受付窓口設置<b>${esc(cert.window || "記載なし")}</b></span>
            <span>住家被害認定調査 実施<b>${esc(cert.survey || "記載なし")}</b></span>
          </div>
          <small>${certAsOf ? `${dateLabel(certAsOf.date)} ${certAsOf.time}時点の資料より。` : ""}実際の受付日時・場所は${esc(name)}の公式発表をご確認ください。</small>
        </div>` : ""}`;
  };

  // app.js のほうが先に走るため、初回描画だけはここから呼ぶ。
  // 以降の市町村切り替えは app.js 側の renderDetail から呼ばれる。
  if(document.querySelector("#hqPanel")){
    const selected = document.querySelector("#municipalityPickerList button.active")?.dataset.name;
    if(selected) window.renderHqPanel(selected);
  }

  // ---- トップページのサマリー ------------------------------------------------
  const summaryHost = document.querySelector("#hqSummary");
  if(summaryHost){
    const totalSeries = key => snapshots.map(s => ({ v: totalOf(s, key) }));
    const homesTotalSeries = snapshots.map(s => ({
      v: totalOf(s, "homesTotal") ?? (["homesFull","homesLargeHalf","homesHalf","homesPartial","homesUnclassified"]
        .some(k => s.columns.includes(k))
        ? ["homesFull","homesLargeHalf","homesHalf","homesPartial","homesUnclassified"].reduce((a, k) => a + (s.totals[k] || 0), 0)
        : null)
    }));
    const waterAreas = HQ.municipalityOrder.filter(n => (valueOf(latest, n, "waterOutages") || 0) > 0);

    document.querySelector("#hqAsOf").textContent = `${asOf(latest)}時点`;
    document.querySelector("#hqSource").href = latest.sourceUrl;
    summaryHost.innerHTML = `
      ${metricCard("避難者", totalOf(latest, "evacuees"), "人", totalSeries("evacuees"), "#e45e35")}
      ${metricCard("避難所", totalOf(latest, "shelters"), "か所", totalSeries("shelters"), "#d39b2b")}
      ${metricCard("住家被害", homesTotalSeries.at(-1).v, "棟", homesTotalSeries, "#6577a6")}
      ${metricCard("断水", totalOf(latest, "waterOutages"), "戸", totalSeries("waterOutages"), "#2d79a8",
        waterAreas.length ? `${waterAreas.join("・")}で継続` : "")}`;
  }

  // ---- 断水が続いている市町村の一覧 ------------------------------------------
  const waterHost = document.querySelector("#hqWaterList");
  if(waterHost){
    const rows = HQ.municipalityOrder
      .map(name => ({ name, v: valueOf(latest, name, "waterOutages") || 0, s: valueOf(latest, name, "waterStations") || 0 }))
      .filter(r => r.v > 0 || r.s > 0)
      .sort((a, b) => b.v - a.v);
    // 断水0でも給水所だけ残っている市町村がある。0戸と書くと誤読を招くので分けて出す。
    waterHost.innerHTML = rows.length
      ? rows.map(r => `<div class="${r.v ? "" : "is-stations-only"}"><b>${esc(r.name)}</b>`
          + (r.v ? `<span>断水 ${fmt(r.v)}戸</span>` : `<span>断水の計上なし</span>`)
          + (r.s ? `<span>給水所 ${fmt(r.s)}か所</span>` : "")
          + `</div>`).join("")
      : `<p>${asOf(latest)}時点で、断水・給水所が計上されている市町村はありません。</p>`;
  }
}

}catch(err){
  console.error("[火の国レポート] 県公式データの描画に失敗しました", err);
}
