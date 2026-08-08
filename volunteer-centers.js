(() => {
  const minutes = window.MINUTES_DATA?.meetings || [];
  const official = window.MUNICIPALITY_UPDATES?.municipalities || [];
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const tables = minutes.map(meeting => ({meeting, table: meeting.sections?.find(section => section.key === "vc")?.vcTable})).filter(item => item.table);
  const latest = tables.at(-1);
  if (!latest) { $("#vcList").innerHTML = '<p class="vc-empty">保存済み議事録から災害VC情報を読み込めませんでした。</p>'; return; }
  const centers = latest.table.rows.map(row => {
    const municipality = official.find(item => item.name === row.name);
    const updates = (municipality?.updates || []).filter(update => /災害(?:VC|ボランティアセンター)|ボランティア募集/u.test(update.title)).sort((a,b) => `${b.date} ${b.time || ""}`.localeCompare(`${a.date} ${a.time || ""}`));
    const history = tables.map(item => ({meeting:item.meeting.meeting,date:item.meeting.date,pdf:item.meeting.pdf,page:item.table.page,row:item.table.rows.find(candidate => candidate.name === row.name)})).filter(item => item.row).filter((item,index,items) => index === 0 || `${item.row.status}|${item.row.detail}` !== `${items[index-1].row.status}|${items[index-1].row.detail}`);
    const place = row.detail.split("。")[0];
    return {...row, municipality, updates, history, place};
  });
  $("#updated").textContent = `会議資料 ${latest.meeting.date.replaceAll("-","/")} 時点`;
  $("#vcStats").innerHTML = `<span><b>${centers.length}</b>災害VC</span><span><b>${centers.filter(center => /活動開始/.test(center.status)).length}</b>活動開始の記載</span><span><b>${centers.reduce((sum,center)=>sum+center.updates.length,0)}</b>公式記事</span>`;
  const render = () => {
    const query = $("#vcSearch").value.trim().toLowerCase();
    const filtered = centers.filter(center => `${center.name}${center.status}${center.detail}${center.updates.map(update=>update.title).join("")}`.toLowerCase().includes(query));
    $("#vcList").innerHTML = filtered.map(center => {
      const mapQuery = encodeURIComponent(`熊本県 ${center.name} ${center.place}`);
      return `<article class="vc-card" id="${encodeURIComponent(center.name)}"><header><div><span>${esc(center.name)}</span><h2>${esc(center.name)}災害ボランティアセンター</h2></div><b>${esc(center.status)}</b></header><div class="vc-card-body"><section class="vc-place"><span>設置場所（会議記載）</span><h3>${esc(center.place)}</h3><p>${esc(center.detail)}</p><div><a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener">Googleマップで場所を確認 ↗</a><a href="municipality-updates.html?name=${encodeURIComponent(center.name)}">${esc(center.name)}の公式発信 →</a></div></section><section class="vc-updates"><header><b>最新の公式発信</b><span>${center.updates.length}件</span></header>${center.updates.length?center.updates.slice(0,4).map(update=>`<a href="${esc(update.url)}" target="_blank" rel="noopener"><time datetime="${esc(update.date)}">${esc(update.date.replaceAll("-","/"))}${update.time?` ${esc(update.time)}`:""}</time><b>${esc(update.title)}</b><span>公式ページ ↗</span></a>`).join(""):'<p>自治体の収集対象ページで、災害VC名が明記された記事をまだ確認できていません。情報がないという意味ではありません。</p>'}</section></div><details class="vc-history"><summary>火の国会議での状況変化（${center.history.length}件）</summary><ol>${[...center.history].reverse().map(item=>`<li><time>${esc(item.date.replaceAll("-","/"))}</time><div><b>${esc(item.row.status)}</b><p>${esc(item.row.detail)}</p><a href="${encodeURI(`${item.pdf}#page=${item.page}`)}" target="_blank" rel="noopener">第${item.meeting}回 p.${item.page} ↗</a></div></li>`).join("")}</ol></details></article>`;
    }).join("") || '<p class="vc-empty">条件に合う災害ボランティアセンターはありません。</p>';
  };
  $("#vcSearch").addEventListener("input", render);
  render();
})();
