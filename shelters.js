(()=>{
  const dataset=window.SHELTER_DATA, report=window.REPORT_DATA;
  if(!dataset||!document.querySelector("#shelterMap"))return;
  const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const dateLabel=iso=>new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"long",day:"numeric"}).format(new Date(`${iso}T00:00:00+09:00`));
  const official=name=>report.municipalities.find(m=>m.name===name)?.url;
  const priority=["宇土市","宇城市","氷川町","八代市"],features=dataset.features, muni=[...new Set(features.map(f=>f.municipality))].sort((a,b)=>{const ai=priority.indexOf(a),bi=priority.indexOf(b);return (ai<0?99:ai)-(bi<0?99:bi)||a.localeCompare(b,"ja")});
  let filtered=features, shown=40, selected=null, map=null, layer=null, markers=new Map();
  $("#shelterMunicipality").insertAdjacentHTML("beforeend",`<optgroup label="重点地域">${muni.filter(n=>priority.includes(n)).map(n=>`<option>${esc(n)}</option>`).join("")}</optgroup><optgroup label="その他の開設地域">${muni.filter(n=>!priority.includes(n)).map(n=>`<option>${esc(n)}</option>`).join("")}</optgroup>`);
  const dateTimeLabel=value=>new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(value));
  const retrieved=dateTimeLabel(dataset.metadata.retrievedAt);
  const retrievedAgeHours=(Date.now()-new Date(dataset.metadata.retrievedAt).getTime())/36e5;
  const sourceIsStale=retrievedAgeHours>6;
  $("#shelterSourceDate").textContent=`取得 ${retrieved} ｜ 開設中 ${features.length.toLocaleString("ja-JP")}件`;
  $("#shelterSourceLink").href=dataset.metadata.sourceUrl;
  if(sourceIsStale){
    const alert=document.querySelector(".shelter-alert");
    alert?.classList.add("is-stale");
    alert?.querySelector("div")?.insertAdjacentHTML("beforeend",`<p><b>掲載データの取得から6時間以上経過しています。地図上の開設状況を現在情報として使用せず、県・自治体へ再確認してください。</b></p>`);
  }
  const supplements=f=>(f.supplements||[]).map(s=>`<article><time>${dateLabel(s.date)}</time><p>${esc(s.text)}</p><a href="${encodeURI(`${s.pdf}#page=${s.page}`)}" target="_blank" rel="noopener">第${s.meeting}回議事録 p.${s.page} ↗</a></article>`).join("");
  const detail=f=>{selected=f;const u=official(f.municipality);$("#shelterDetail").innerHTML=`<button class="detail-close" type="button" aria-label="詳細を閉じる">×</button><header><span>${esc(f.municipality)} ｜ 取得時点で開設中</span><h2>${esc(f.name)}</h2><p>${esc(f.address)}</p></header><dl><div><dt>開設日時</dt><dd>${dateTimeLabel(f.openedAt)}</dd></div><div><dt>県データ施設ID</dt><dd>${esc(f.id)}</dd></div></dl><div class="detail-warning"><b>${sourceIsStale?"掲載データは取得から6時間以上経過":"取得時点で開設中"}</b><p>${retrieved}に県公式データから確認。状況変更の可能性があるため、支援活動前に再確認してください。</p></div><div class="detail-official"><h3>公式情報</h3><a href="${dataset.metadata.sourceUrl}" target="_blank" rel="noopener">熊本県の最新避難所情報 ↗</a><a href="${u}" target="_blank" rel="noopener">${esc(f.municipality)}公式サイト ↗</a></div><div class="detail-supplements"><h3>火の国会議の補足 <small>${(f.supplements||[]).length}件</small></h3>${f.supplements?.length?supplements(f):"<p>保存済み資料では、この施設名を明記した補足情報を確認できていません。</p>"}</div>`;$("#shelterDetail").classList.add("open");$("#shelterDetail .detail-close").onclick=()=>$("#shelterDetail").classList.remove("open");};
  const renderList=()=>{$("#shelterCount").textContent=filtered.length.toLocaleString("ja-JP");const items=filtered.slice(0,shown);$("#shelterList").innerHTML=items.map(f=>`<button type="button" data-id="${esc(f.id)}" class="${selected?.id===f.id?"active":""}"><span>${esc(f.municipality)} ｜ 開設 ${dateTimeLabel(f.openedAt)}</span><h3>${esc(f.name)}</h3><p>${esc(f.address)}</p>${f.supplements?.length?`<b>会議補足 ${f.supplements.length}件</b>`:""}</button>`).join("")||`<p class="shelter-empty">条件に一致する開設中避難所はありません。</p>`;$("#loadMoreShelters").hidden=shown>=filtered.length;$("#shelterList").querySelectorAll("button").forEach(b=>b.onclick=()=>{const f=features.find(x=>x.id===b.dataset.id);detail(f);markers.get(f.id)?.openTooltip();map?.flyTo([f.lat,f.lng],15);renderList();});};
  const renderMap=()=>{if(!map)return;layer.clearLayers();markers.clear();filtered.forEach(f=>{const has=f.supplements?.length;const m=L.circleMarker([f.lat,f.lng],{radius:has?7:5,color:has?"#9a321b":"#174c41",weight:2,fillColor:has?"#e45e35":"#fff",fillOpacity:.92}).bindTooltip(`<b>${esc(f.name)}</b><br>${esc(f.municipality)}`,{direction:"top"}).on("click",()=>detail(f));m.addTo(layer);markers.set(f.id,m);});if(filtered.length){const bounds=L.latLngBounds(filtered.map(f=>[f.lat,f.lng]));map.fitBounds(bounds.pad(.08),{maxZoom:14});}};
  const apply=()=>{const m=$("#shelterMunicipality").value,q=$("#shelterSearch").value.trim().toLowerCase(),notes=$("#shelterSupplementOnly").checked;filtered=features.filter(f=>(!m||f.municipality===m)&&(!q||`${f.name}${f.address}`.toLowerCase().includes(q))&&(!notes||f.supplements?.length));shown=40;renderList();renderMap();};
  try{map=L.map("shelterMap",{minZoom:7}).setView([32.55,130.75],9);L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{attribution:'地図：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>',maxZoom:18}).addTo(map);layer=L.layerGroup().addTo(map);}catch(e){$("#shelterMap").hidden=true;$("#mapFallback").hidden=false;}
  ["#shelterMunicipality","#shelterSupplementOnly"].forEach(s=>$(s).addEventListener("change",apply));$("#shelterSearch").addEventListener("input",apply);$("#loadMoreShelters").onclick=()=>{shown+=40;renderList();};apply();
})();
