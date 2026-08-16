// 発信でたどる被災地の局面（official-timeline.html）
// public-data/reconstruction/official-timeline.json を読んで、分野構成の推移・
// 局面ごとの解説・話題の広がりを描く。自治体ごとの比較は描かない。
(() => {
  "use strict";
  const root = document.querySelector("#timelineComposition");
  if (!root) return;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const dateLabel = iso => new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" })
    .format(new Date(`${iso}T00:00:00+09:00`));

  const fail = message => {
    root.innerHTML = `<div class="timeline-error"><b>${esc(message)}</b>`
      + `<p>市町村の公式発信は<a href="municipality-updates.html">一覧ページ</a>からご確認いただけます。</p></div>`;
  };

  fetch("public-data/reconstruction/official-timeline.json", { credentials: "same-origin" })
    .then(response => { if (!response.ok) throw new Error(); return response.json(); })
    .then(data => {
      const categories = data.categories || [];
      const colorOf = id => categories.find(item => item.id === id)?.color || "#999";
      const labelOf = id => categories.find(item => item.id === id)?.label || id;

      // ---- 分野構成の推移（積み上げ帯） ----------------------------------
      root.innerHTML = (data.windows || []).map(window => {
        // 割合の小さい分野まで刻むと読めなくなるため、3%未満は「その他」にまとめる
        const parts = categories
          .map(category => ({ id: category.id, share: window.shares[category.id]?.share || 0 }))
          .filter(part => part.share > 0)
          .sort((a, b) => b.share - a.share);
        const shown = parts.filter(part => part.share >= 3);
        const restShare = Math.round((parts.filter(part => part.share < 3).reduce((total, part) => total + part.share, 0)) * 10) / 10;
        const segments = shown.map(part =>
          `<span class="timeline-seg" style="width:${part.share}%;background:${colorOf(part.id)}" title="${esc(labelOf(part.id))} ${part.share}%">`
          + `<b>${part.share >= 12 ? esc(labelOf(part.id)) : ""}</b></span>`).join("")
          + (restShare > 0 ? `<span class="timeline-seg is-rest" style="width:${restShare}%" title="その他 ${restShare}%"></span>` : "");
        return `<div class="timeline-window">
          <div class="timeline-window-label">
            <b>発災${window.startDay}〜${window.endDay}日目</b>
            <span>${esc(dateLabel(window.startDate))}〜${esc(dateLabel(window.endDate))}</span>
            <small>${window.pageCount}件 / ${window.municipalityCount}市町村</small>
          </div>
          <div class="timeline-bar" role="img" aria-label="発災${window.startDay}〜${window.endDay}日目の分野構成：${shown.map(part => `${labelOf(part.id)}${part.share}パーセント`).join("、")}">${segments}</div>
        </div>`;
      }).join("");

      document.querySelector("#timelineLegend").innerHTML = categories
        .map(category => `<span><i style="background:${category.color}"></i>${esc(category.label)}</span>`).join("")
        + `<span><i class="is-rest"></i>3%未満</span>`;

      // ---- 局面 ----------------------------------------------------------
      document.querySelector("#timelinePhases").innerHTML = (data.phases || []).map((phase, index) => `
        <article class="timeline-phase">
          <header>
            <span class="timeline-phase-no">${index + 1}</span>
            <div>
              <h3>${esc(phase.label)}</h3>
              <p class="timeline-phase-range">発災${phase.startDay}〜${phase.endDay}日目 ／ ${phase.pageCount}件・${phase.municipalityCount}市町村が発信</p>
            </div>
          </header>
          <p class="timeline-phase-reading">${esc(phase.reading)}</p>
          <ul class="timeline-phase-top">
            ${(phase.topCategories || []).map(item => `<li>
              <i style="background:${colorOf(item.category)}"></i>
              <b>${esc(labelOf(item.category))}</b>
              <span>${item.share}%</span>
              <small>${item.municipalities}市町村が発信</small>
            </li>`).join("")}
          </ul>
          ${(phase.examples || []).length ? `<div class="timeline-examples">
            <b>この時期に実際に出された情報</b>
            ${phase.examples.map(example => `<a href="${esc(example.url)}" target="_blank" rel="noopener">
              <span class="timeline-example-meta"><i style="background:${colorOf(example.category)}"></i>${esc(example.categoryLabel)} ／ ${esc(example.municipalityName)} ／ 発災${example.day}日目</span>
              <span class="timeline-example-title">${esc(example.title)} ↗</span>
            </a>`).join("")}
          </div>` : ""}
        </article>`).join("");

      // ---- 話題の広がり（累積の市町村数） ---------------------------------
      const total = data.totals?.municipalityTotal || 21;
      const spreadRows = categories
        .map(category => ({ category, spread: data.spread?.[category.id] }))
        .filter(row => row.spread && row.spread.total > 0)
        .sort((a, b) => b.spread.total - a.spread.total);
      const width = 520, height = 34, pad = 2;
      document.querySelector("#timelineSpread").innerHTML = spreadRows.map(({ category, spread }) => {
        const series = spread.series || [];
        const points = series.map((value, index) => {
          const x = pad + (index / Math.max(1, series.length - 1)) * (width - pad * 2);
          const y = height - pad - (value / total) * (height - pad * 2);
          return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
        }).join(" ");
        return `<div class="timeline-spread-row">
          <div class="timeline-spread-label"><i style="background:${category.color}"></i><b>${esc(category.label)}</b></div>
          <svg class="timeline-spread-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
            <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#e0e4de"/>
            <polyline fill="none" stroke="${category.color}" stroke-width="2.5" points="${points}"/>
          </svg>
          <div class="timeline-spread-value">
            <b>${spread.total}</b><span>/${total}市町村</span>
            <small>${spread.firstDay ? `発災${spread.firstDay}日目から` : ""}</small>
          </div>
        </div>`;
      }).join("");

      // ---- 但し書きと集計対象 ---------------------------------------------
      document.querySelector("#timelineCaveats").innerHTML = (data.caveats || [])
        .map(caveat => `<li>${esc(caveat)}</li>`).join("");
      document.querySelector("#timelineTotals").textContent =
        `${data.totals?.pageCount ?? 0}件の公式ページ（${data.totals?.municipalityCount ?? 0}市町村・発災${data.lastDay}日目まで）`;
    })
    .catch(() => fail("局面の図を読み込めませんでした。"));
})();
