// お知らせの受け取り方（alert-channels.html）
//
// 配信された本文はこのサイトでは持たない。LINEの配信は友だちのトーク画面に
// だけ届き、第三者が読む手段がないため。ここで案内するのは受け取り方だけ。
(() => {
  "use strict";
  const select = document.querySelector("#channelSelect");
  if (!select) return;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  fetch("public-data/reconstruction/alert-channels.json", { credentials: "same-origin" })
    .then(response => { if (!response.ok) throw new Error(); return response.json(); })
    .then(data => {
      const types = Object.fromEntries((data.channelTypes || []).map(type => [type.id, type]));
      const list = data.municipalities || [];
      const withChannels = list.filter(item => item.channels.length);

      select.innerHTML = `<option value="">選択してください</option>`
        + list.map(item => `<option value="${esc(item.municipalityId)}">${esc(item.municipalityName)}${item.channels.length ? "" : "（未確認）"}</option>`).join("");

      const card = item => {
        if (!item.channels.length) {
          return `<div class="channels-empty">
            <b>${esc(item.municipalityName)}の受け取り方は確認できていません</b>
            <p>手段が無いという意味ではありません。公式サイトから辿れる範囲で見つけられませんでした。お住まいの市町村の公式サイトで「公式LINE」「メール配信」「防災行政無線」をお探しください。</p>
            <a href="${esc(item.officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.municipalityName)}公式サイトを見る <span aria-hidden="true">↗</span></a>
          </div>`;
        }
        return `<ul class="channels-list">${item.channels.map(channel => {
          const type = types[channel.type] || {};
          return `<li class="channels-item is-${esc(channel.type)}">
            <span class="channels-type">${esc(type.label || channel.type)}</span>
            <b>${esc(channel.name)}</b>
            ${type.hint ? `<small>${esc(type.hint)}</small>` : ""}
            ${channel.note ? `<p>${esc(channel.note)}</p>` : ""}
            <dl>
              ${channel.lineId ? `<div><dt>LINE ID</dt><dd>${esc(channel.lineId)}</dd></div>` : ""}
              ${channel.tel ? `<div><dt>電話</dt><dd><a href="tel:${esc(channel.tel.replace(/-/g, ""))}">${esc(channel.tel)}</a></dd></div>` : ""}
            </dl>
            <div class="channels-actions">
              ${channel.url ? `<a class="channels-primary" href="${esc(channel.url)}" target="_blank" rel="noopener noreferrer">友だち追加・登録ページを開く <span aria-hidden="true">↗</span></a>` : ""}
              <a href="${esc(channel.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(channel.sourceLabel)}（出典） <span aria-hidden="true">↗</span></a>
            </div>
          </li>`;
        }).join("")}</ul>
        <a class="channels-official" href="${esc(item.officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.municipalityName)}公式サイトを見る <span aria-hidden="true">↗</span></a>`;
      };

      const result = document.querySelector("#channelResult");
      const render = () => {
        const item = list.find(entry => entry.municipalityId === select.value);
        if (!item) { result.innerHTML = `<p class="channels-prompt">お住まいの市町村を選んでください。21市町村を混ぜずに表示します。</p>`; return; }
        result.innerHTML = `<h3>${esc(item.municipalityName)}の受け取り方</h3>${card(item)}`;
        const url = new URL(location.href);
        url.searchParams.set("municipality", item.municipalityId);
        history.replaceState(null, "", url);
      };
      const requested = new URLSearchParams(location.search).get("municipality");
      if (list.some(item => item.municipalityId === requested)) select.value = requested;
      select.addEventListener("change", render);
      render();

      // ---- 21市町村の状況 --------------------------------------------------
      const lineCount = list.filter(item => item.channels.some(channel => channel.type === "line")).length;
      document.querySelector("#channelSummary").textContent =
        `公式サイトから辿れる範囲で、${withChannels.length}市町村の受け取り方を確認しました。うち${lineCount}市町村で公式LINEを確認しています。残り${list.length - withChannels.length}市町村は確認できていません（手段が無いという意味ではありません）。`;

      document.querySelector("#channelOverview").innerHTML = list.map(item => `
        <a class="channels-overview-item${item.channels.length ? "" : " is-unknown"}"
           href="alert-channels.html?municipality=${encodeURIComponent(item.municipalityId)}">
          <b>${esc(item.municipalityName)}</b>
          <span>${item.channels.length
            ? [...new Set(item.channels.map(channel => types[channel.type]?.label || channel.type))].map(label => `<i>${esc(label)}</i>`).join("")
            : `<i class="is-unknown">未確認</i>`}</span>
        </a>`).join("");

      document.querySelector("#channelCaveats").innerHTML = (data.caveats || [])
        .map(caveat => `<li>${esc(caveat)}</li>`).join("");
    })
    .catch(() => {
      document.querySelector("#channelResult").innerHTML =
        `<div class="timeline-error"><b>受け取り方の一覧を読み込めませんでした。</b>`
        + `<p><a href="municipalities.html">自治体別ページ</a>から各市町村の公式サイトをご確認ください。</p></div>`;
    });
})();
