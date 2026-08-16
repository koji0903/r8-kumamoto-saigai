// 5つの対応の流れ（official-response-tracks.html）
(() => {
  "use strict";
  const matrix = document.querySelector("#tracksMatrix");
  if (!matrix) return;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  fetch("public-data/reconstruction/response-tracks.json", { credentials: "same-origin" })
    .then(response => { if (!response.ok) throw new Error(); return response.json(); })
    .then(data => {
      const tracks = data.tracks || [];
      const lastDay = data.lastDay || 21;
      // 発災1日目を左端、最終日を右端にした百分率で置く
      const percent = day => ((Math.min(Math.max(day, 1), lastDay) - 1) / Math.max(1, lastDay - 1)) * 100;

      document.querySelector("#tracksSummary").innerHTML = tracks.map(track => {
        const milestones = data.municipalities.reduce((total, item) => total + (item.tracks[track.id]?.milestones.length || 0), 0);
        const publications = data.municipalities.reduce((total, item) => total + (item.tracks[track.id]?.count || 0), 0);
        const reached = data.municipalities.filter(item => item.tracks[track.id]?.firstDay != null).length;
        return `<article class="tracks-summary-item" style="border-top-color:${track.color}">
          <h3>${esc(track.label)}</h3>
          <p>${esc(track.summary)}</p>
          <dl>
            <div><dt>動きのあった市町村</dt><dd>${reached}<small>/${data.municipalities.length}</small></dd></div>
            <div><dt>一次資料の節目</dt><dd>${milestones}<small>件</small></dd></div>
            <div><dt>公式発信</dt><dd>${publications}<small>件</small></dd></div>
          </dl>
        </article>`;
      }).join("");

      // ---- 市町村ごとの5レーン --------------------------------------------
      matrix.innerHTML = `<div class="tracks-axis" aria-hidden="true">
          ${[1, 5, 10, 15, 20].filter(day => day <= lastDay)
            .map(day => `<span style="left:${percent(day)}%">発災${day}日目</span>`).join("")}
        </div>`
        + data.municipalities.map(municipality => {
        const hasAny = tracks.some(track => municipality.tracks[track.id]?.firstDay != null);
        return `<section class="tracks-municipality${hasAny ? "" : " is-empty"}">
          <header>
            <h3>${esc(municipality.name)}</h3>
            <a href="${esc(municipality.officialUrl)}" target="_blank" rel="noopener">公式サイト ↗</a>
          </header>
          ${hasAny ? tracks.map(track => {
            const lane = municipality.tracks[track.id] || {};
            const marks = lane.milestones || [], pubs = lane.publications || [];
            if (!marks.length && !pubs.length) {
              return `<div class="tracks-lane is-none">
                <span class="tracks-lane-name">${esc(track.label)}</span>
                <span class="tracks-lane-empty">この分野の発信は確認できていません</span>
              </div>`;
            }
            return `<div class="tracks-lane">
              <span class="tracks-lane-name" style="border-left-color:${track.color}">${esc(track.label)}</span>
              <div class="tracks-lane-line">
                <i class="tracks-rule"></i>
                ${pubs.map(item => `<a class="tracks-dot" style="left:${percent(item.day)}%;background:${track.color}"
                    href="${esc(item.url)}" target="_blank" rel="noopener"
                    title="発災${item.day}日目（${esc(item.date)}）${esc(item.title)}"><span class="tracks-sr">${esc(item.title)}</span></a>`).join("")}
                ${marks.map(item => `<span class="tracks-diamond" style="left:${percent(item.day)}%;background:${track.color}"
                    title="発災${item.day}日目（${esc(item.date)}）${esc(item.label)}${item.note ? `／資料の記載：${esc(item.note)}` : ""}"></span>`).join("")}
              </div>
            </div>`;
          }).join("") : `<p class="tracks-none">この市町村の対応に関する公式情報を確認できていません。<a href="${esc(municipality.officialUrl)}" target="_blank" rel="noopener">公式サイト ↗</a>で最新情報をご確認ください。</p>`}
          ${hasAny ? `<details class="tracks-details">
            <summary>この市町村の節目と発信をすべて見る</summary>
            ${tracks.map(track => {
              const lane = municipality.tracks[track.id] || {};
              const rows = [
                ...(lane.milestones || []).map(item => ({ ...item, kind: "milestone" })),
                ...(lane.publications || []).map(item => ({ ...item, kind: "publication" }))
              ].sort((a, b) => a.day - b.day);
              if (!rows.length) return "";
              return `<div class="tracks-detail-block">
                <b style="border-left-color:${track.color}">${esc(track.label)}</b>
                <ul>${rows.map(row => row.kind === "milestone"
                  ? `<li><span class="tracks-detail-day">発災${row.day}日目</span>
                       <span class="tracks-detail-mark">◆ ${esc(row.label)}</span>
                       ${row.source?.url ? `<a href="${esc(row.source.url)}" target="_blank" rel="noopener">${esc(row.source.label)} ↗</a>` : `<span class="tracks-detail-source">${esc(row.source?.label ?? "")}</span>`}</li>`
                  : `<li><span class="tracks-detail-day">発災${row.day}日目</span>
                       <a href="${esc(row.url)}" target="_blank" rel="noopener">${esc(row.title)} ↗</a></li>`).join("")}</ul>
              </div>`;
            }).join("")}
          </details>` : ""}
        </section>`;
      }).join("");

      document.querySelector("#tracksCaveats").innerHTML = (data.caveats || [])
        .map(caveat => `<li>${esc(caveat)}</li>`).join("");
      document.querySelector("#tracksSources").innerHTML = Object.entries(data.sources || {})
        .filter(([, source]) => source)
        .map(([id, source]) => {
          const track = tracks.find(item => item.id === id);
          return `<p><b style="color:${track?.color}">${esc(track?.label ?? id)}</b>の節目の出典：`
            + (source.url ? `<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.label)} ↗</a>` : esc(source.label)) + "</p>";
        }).join("");
    })
    .catch(() => {
      matrix.innerHTML = `<div class="timeline-error"><b>対応の流れを読み込めませんでした。</b>`
        + `<p><a href="municipalities.html">自治体別ページ</a>で各市町村の情報をご確認いただけます。</p></div>`;
    });
})();
