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
    // 災害VCを運営するのは社協。社協サイトの発信を第一に、市の発信を補助として並べる。
    // 出所が違うため、どちらの発信かを画面上でも区別する。
    const council = (window.VOLUNTEER_CENTER_UPDATES?.councils || []).find(item => item.municipality === row.name);
    const councilUpdates = (council?.updates || []).map(update => ({ ...update, from: "council", fromLabel: council.name }));
    const cityUpdates = (municipality?.updates || [])
      .filter(update => /災害(?:VC|ボランティアセンター)|ボランティア募集/u.test(update.title))
      .map(update => ({ ...update, from: "municipality", fromLabel: `${row.name}（市町村）` }));
    const updates = [...councilUpdates, ...cityUpdates]
      .sort((a,b) => `${b.date} ${b.time || ""}`.localeCompare(`${a.date} ${a.time || ""}`));
    const history = tables.map(item => ({meeting:item.meeting.meeting,date:item.meeting.date,pdf:item.meeting.pdf,page:item.table.page,row:item.table.rows.find(candidate => candidate.name === row.name)})).filter(item => item.row).filter((item,index,items) => index === 0 || `${item.row.status}|${item.row.detail}` !== `${items[index-1].row.status}|${items[index-1].row.detail}`);
    const place = row.detail.split("。")[0];
    return {...row, municipality, council, updates, history, place};
  });
  const statusTone = status => /活動開始|活動中/.test(status) ? "active" : /予定|決定|目標/.test(status) ? "scheduled" : "preparing";
  if ($("#updated")) $("#updated").textContent = `会議資料 ${latest.meeting.date.replaceAll("-","/")} 時点`;
  $("#vcStats").innerHTML = `<span><b>${centers.length}</b>災害VC</span><span><b>${centers.filter(center => /活動開始/.test(center.status)).length}</b>活動開始の記載</span><span><b>${centers.reduce((sum,center)=>sum+center.updates.length,0)}</b>公式記事</span>`;
  $("#vcOverview").innerHTML = centers.map(center => `<a class="status-${statusTone(center.status)}" href="#${encodeURIComponent(center.name)}"><span>${esc(center.name)}</span><b>${esc(center.status)}</b><small>${esc(center.place)}</small></a>`).join("");
  const render = () => {
    const query = $("#vcSearch").value.trim().toLowerCase();
    const filtered = centers.filter(center => `${center.name}${center.status}${center.detail}${center.updates.map(update=>update.title).join("")}`.toLowerCase().includes(query));
    $("#vcList").innerHTML = filtered.map(center => {
      const mapQuery = encodeURIComponent(`熊本県 ${center.name} ${center.place}`);
      const officialLink=center.municipality?.url?`<a href="${esc(center.municipality.url)}" target="_blank" rel="noopener">${esc(center.name)}公式サイト ↗</a>`:"";
      // 災害VCの運営主体は社協。記事の有無にかかわらず一次情報源として示す。
      const councilLink=center.council?.url?`<a href="${esc(center.council.url)}" target="_blank" rel="noopener">${esc(center.council.name)} ↗</a>`:"";
      const updateItem=update=>`<a href="${esc(update.url)}" target="_blank" rel="noopener"><time datetime="${esc(update.date)}">${esc(update.date.replaceAll("-","/"))}${update.time?` ${esc(update.time)}`:""}</time><b>${esc(update.title)}</b><span class="vc-update-from is-${esc(update.from||"municipality")}">${esc(update.fromLabel||"公式ページ")} ↗</span></a>`;
      const shown=center.updates.slice(0,6), rest=center.updates.slice(6);
      return `<article class="vc-card status-${statusTone(center.status)}" id="${encodeURIComponent(center.name)}"><header><div><span>${esc(center.name)}</span><h2>${esc(center.name)}災害ボランティアセンター</h2></div><b>${esc(center.status)}</b></header><div class="vc-card-body"><section class="vc-place"><span>設置場所（会議記載）</span><h3>${esc(center.place)}</h3><p>${esc(center.detail)}</p><div><a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener">地図で場所を確認 ↗</a>${officialLink}</div></section><section class="vc-updates"><header><b>募集・活動の公式発信</b><span>${center.updates.length}件</span></header>${center.updates.length?shown.map(updateItem).join("")+(rest.length?`<details class="vc-update-more"><summary>これより前の発信をすべて見る（${rest.length}件）</summary>${rest.map(updateItem).join("")}</details>`:""):`<div class="vc-no-update"><b>災害VCの記事は未収集です</b><p>募集がないという意味ではありません。運営する社会福祉協議会のサイトやSNSで最新情報をご確認ください。</p>${councilLink}${officialLink}</div>`}${councilLink&&center.updates.length?`<p class="vc-council-note">この災害VCを運営しているのは${esc(center.council.name)}です。${councilLink}</p>`:""}</section></div><details class="vc-history"><summary>活動状況の推移と会議原本（${center.history.length}件）</summary><ol>${[...center.history].reverse().map(item=>`<li><time>${esc(item.date.replaceAll("-","/"))}</time><div><b>${esc(item.row.status)}</b><p>${esc(item.row.detail)}</p><a href="${encodeURI(`${item.pdf}#page=${item.page}`)}" target="_blank" rel="noopener">第${item.meeting}回 p.${item.page} ↗</a></div></li>`).join("")}</ol></details></article>`;
    }).join("") || '<p class="vc-empty">条件に合う災害ボランティアセンターはありません。</p>';
  };
  $("#vcSearch").addEventListener("input", render);
  render();
})();
