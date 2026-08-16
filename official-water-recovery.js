// 水の復旧と、統計に表れない水の問題（official-water-recovery.html）
(() => {
  "use strict";
  const host = document.querySelector("#waterMeasured");
  if (!host) return;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const num = value => Number(value ?? 0).toLocaleString("ja-JP");
  const dateLabel = iso => new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" })
    .format(new Date(`${iso}T00:00:00+09:00`));

  // 対応の種類ごとの色。断水の折れ線（青）と重ねても見分けられる色にする。
  const RESPONSE_COLORS = {
    status: "#7a6a63", deliver: "#3b8a78", restrict: "#d39b2b", well: "#a8577a",
    restored: "#5b8c3a", repair: "#6577a6", relief: "#e45e35", hygiene: "#2d79a8", other: "#9aa5a0"
  };

  fetch("public-data/reconstruction/water-recovery.json", { credentials: "same-origin" })
    .then(response => { if (!response.ok) throw new Error(); return response.json(); })
    .then(data => {
      const axis = data.axis || [];

      // ---- 全体の状況 ----------------------------------------------------
      const asOf = data.measuredAsOf || {};
      document.querySelector("#waterSummary").innerHTML = `
        <div class="water-summary-item"><span>ピーク時の断水</span><b>${num(data.totals.peak)}<small>戸</small></b></div>
        <div class="water-summary-item"><span>${esc(dateLabel(asOf.date))}時点</span><b>${num(data.totals.latest)}<small>戸</small></b></div>
        <div class="water-summary-item"><span>断水が計上された市町村</span><b>${data.totals.affectedMunicipalities}<small>市町村</small></b></div>
        <div class="water-summary-item is-remaining"><span>まだ断水が残る市町村</span><b>${data.totals.remainingMunicipalities}<small>市町村</small></b></div>`;
      const sourceLink = document.querySelector("#waterSourceLink");
      if (asOf.url) { sourceLink.href = asOf.url; sourceLink.textContent = `熊本県 第${asOf.meeting}回災害対策本部会議資料（${dateLabel(asOf.date)} ${asOf.time}時点）`; }

      // ---- 市町村ごとの推移 ----------------------------------------------
      const peakMax = Math.max(...data.measured.map(item => item.peak), 1);
      const W = 300, H = 54, pad = 3;
      // 発信を市町村ごとにまとめ、断水の折れ線と同じ時間軸に落とす
      const firstDay = axis[0]?.day ?? 1, lastDay = axis.at(-1)?.day ?? 1;
      const dayToX = day => pad + ((Math.min(Math.max(day, firstDay), lastDay) - firstDay) / Math.max(1, lastDay - firstDay)) * (W - pad * 2);
      const eventsByMunicipality = new Map();
      for (const item of data.publications || []) {
        const list = eventsByMunicipality.get(item.municipalityName) || [];
        list.push(item); eventsByMunicipality.set(item.municipalityName, list);
      }
      host.innerHTML = data.measured.map(item => {
        const points = item.series.map((value, index) => {
          if (value == null) return null;
          const x = pad + (index / Math.max(1, item.series.length - 1)) * (W - pad * 2);
          const y = H - pad - (value / peakMax) * (H - pad * 2);
          return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
        });
        // 値が無い時点は線を切る（0と区別する）
        const segments = []; let current = [];
        for (const point of points) { if (point) current.push(point); else if (current.length) { segments.push(current); current = []; } }
        if (current.length) segments.push(current);
        const ongoing = item.latest > 0;
        return `<article class="water-row ${ongoing ? "is-ongoing" : "is-resolved"}">
          <div class="water-row-name">
            <b>${esc(item.name)}</b>
            <span>ピーク ${num(item.peak)}戸</span>
          </div>
          <svg class="water-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"
               aria-label="${esc(item.name)}の断水戸数は、ピーク${num(item.peak)}戸から${esc(dateLabel(asOf.date))}時点で${num(item.latest)}戸">
            <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#e0e4de"/>
            ${segments.map(segment => `<polyline fill="none" stroke="${ongoing ? "#2d79a8" : "#9fb3ab"}" stroke-width="2.5" points="${segment.join(" ")}"/>`).join("")}
            ${(eventsByMunicipality.get(item.name) || []).map(event =>
              `<circle cx="${Math.round(dayToX(event.day) * 10) / 10}" cy="${H - pad}" r="3.4"
                       fill="${RESPONSE_COLORS[event.response] || RESPONSE_COLORS.other}" stroke="#fff" stroke-width="1.2"><title>発災${event.day}日目 ${event.responseLabel}：${event.title}</title></circle>`).join("")}
          </svg>
          <div class="water-row-state">
            ${ongoing
              ? `<b>${num(item.latest)}<small>戸</small></b><span class="water-tag is-ongoing">継続中（ピークの${item.remainingRate}%）</span>`
              : `<b class="is-zero">0<small>戸</small></b><span class="water-tag is-resolved">${esc(dateLabel(item.resolvedDate))}に解消（発災${item.resolvedDay}日目）</span>`}
          </div>
        </article>`;
      }).join("")
        + `<p class="water-axis-note">横軸は ${esc(dateLabel(axis[0]?.date))}（発災${axis[0]?.day}日目）〜 ${esc(dateLabel(axis.at(-1)?.date))}（発災${axis.at(-1)?.day}日目）。縦軸は全市町村で共通です。`
          + `折れ線の下の丸は、その日にその市町村が出した水に関する発信で、色は対応の種類を表します。</p>`
        + `<div class="water-response-legend">${(data.responseTypes || []).map(type =>
            `<span><i style="background:${RESPONSE_COLORS[type.id] || RESPONSE_COLORS.other}"></i>${esc(type.label)}${type.invisible ? "<b>断水戸数に出ない</b>" : ""}</span>`).join("")}</div>`;

      // ---- 統計に表れない状態 ---------------------------------------------
      const invisible = (data.publications || []).filter(item => item.invisibleInStats);
      document.querySelector("#waterInvisible").innerHTML = invisible.length
        ? invisible.map(item => `<a class="water-invisible-item" href="${esc(item.url)}" target="_blank" rel="noopener">
            <span class="water-state-tag">${esc(item.responseLabel)}</span>
            <span class="water-invisible-meta">${esc(item.municipalityName)} ／ ${esc(dateLabel(item.date))}（発災${item.day}日目）</span>
            <span class="water-invisible-title">${esc(item.title)} ↗</span>
          </a>`).join("")
        : `<p class="water-empty">該当する発信を確認できていません。</p>`;

      document.querySelector("#waterNotes").innerHTML = (data.notes || []).length
        ? `<b class="water-notes-head">火の国会議で共有された、水にまつわる現場の報告</b>`
          + (data.notes || []).map(note => `<blockquote class="water-note">
              <p>${esc(note.text)}</p>
              <cite>${note.speaker ? `${esc(note.speaker)}／` : ""}第${note.meeting}回 火の国会議（発災${note.day}日目）
                <a href="${esc(note.pdf)}#page=${note.page}" target="_blank" rel="noopener">議事録 p.${note.page} ↗</a></cite>
            </blockquote>`).join("")
        : "";

      // ---- 発信の記録 ------------------------------------------------------
      const byMunicipality = new Map();
      for (const item of data.publications || []) {
        const list = byMunicipality.get(item.municipalityName) || [];
        list.push(item); byMunicipality.set(item.municipalityName, list);
      }
      const measuredOrder = data.measured.map(item => item.name);
      const ordered = [...byMunicipality.entries()].sort((a, b) => {
        const rankA = measuredOrder.indexOf(a[0]), rankB = measuredOrder.indexOf(b[0]);
        return (rankA < 0 ? 99 : rankA) - (rankB < 0 ? 99 : rankB) || a[0].localeCompare(b[0], "ja");
      });
      document.querySelector("#waterPublications").innerHTML = ordered.map(([name, items]) => `
        <section class="water-pub-group">
          <h3>${esc(name)}<span>${items.length}件</span></h3>
          <ul>${items.map(item => `<li>
            <span class="water-pub-day">発災${item.day}日目</span>
            <span><span class="water-pub-response" style="border-left:3px solid ${RESPONSE_COLORS[item.response] || RESPONSE_COLORS.other}">${esc(item.responseLabel)}</span>
            <a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)} ↗</a></span>
          </li>`).join("")}</ul>
        </section>`).join("");

      document.querySelector("#waterCaveats").innerHTML = (data.caveats || [])
        .map(caveat => `<li>${esc(caveat)}</li>`).join("");
    })
    .catch(() => {
      host.innerHTML = `<div class="timeline-error"><b>断水の推移を読み込めませんでした。</b>`
        + `<p><a href="municipalities.html">自治体別ページ</a>で被害状況をご確認いただけます。</p></div>`;
    });
})();
