const {days,metrics,officialSources,municipalities,municipalEvents}=window.REPORT_DATA;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const fmt=n=>n==null?"調査中":n.toLocaleString("ja-JP");
const statDisplay=(day,key)=>key==="outages"&&day.stats.outageStatus?day.stats.outageStatus:fmt(day.stats[key]);
const dateLabel=(iso,full=true)=>new Intl.DateTimeFormat("ja-JP",full?{year:"numeric",month:"long",day:"numeric",weekday:"short"}:{month:"numeric",day:"numeric"}).format(new Date(`${iso}T00:00:00+09:00`));
const latest=days.at(-1);

if($("#updated")) $("#updated").textContent=`最終更新 ${dateLabel(latest.date)}`;
if($("#latest-title")){
  $("#latest-title").textContent=latest.headline;
  $("#latest-time").textContent=`${dateLabel(latest.date)} 第${latest.meeting}回会議時点`;
  $("#latestPdf").href=encodeURI(latest.pdf);
  $("#latest-stats").innerHTML=[["避難者",latest.stats.evacuees,"人"],["避難所",latest.stats.shelters,"か所"],["住家被害",latest.stats.homes,"棟"],["断水",latest.stats.waterOutages,"戸"]].map(([l,v,u])=>`<div><dt>${l}</dt><dd>${fmt(v)}<small>${u}</small></dd></div>`).join("");
}

if($("#sectionLinks")){
  const links=[
    ["時系列で見る","日々の被害と支援の変化","timeline.html","日"],
    ["自治体別に見る","21市町村ごとの確認情報","municipalities.html","市"],
    ["公的情報を見る","国・県・市町村の公式発表","official.html","公"],
    ["議事録を見る","すべての原資料PDF","meetings.html","録"]
  ];
  $("#sectionLinks").innerHTML=links.map(([h,p,u,m])=>`<a href="${u}"><span>${m}</span><div><h3>${h}</h3><p>${p}</p></div><b>→</b></a>`).join("");
}
if($("#recentUpdates")) $("#recentUpdates").innerHTML=[...days].reverse().slice(0,3).map(d=>`<article><time datetime="${d.date}">${dateLabel(d.date)}</time><span>第${d.meeting}回</span><h3>${d.headline}</h3><p>${d.summary}</p><a href="timeline.html">詳細を見る →</a></article>`).join("");

if($("#metricTabs")){
  let activeMetric="evacuees";
  const renderMetrics=()=>{$("#metricTabs").innerHTML=metrics.map(m=>`<button class="metric-button ${m.key===activeMetric?"active":""}" data-key="${m.key}" aria-pressed="${m.key===activeMetric}"><span>${m.label}</span><strong>${statDisplay(latest,m.key)}</strong>${latest.stats[m.key]==null?"":` ${m.unit}`}</button>`).join("");$$('.metric-button').forEach(b=>b.onclick=()=>{activeMetric=b.dataset.key;renderMetrics();renderChart()})};
  const renderChart=()=>{const metric=metrics.find(m=>m.key===activeMetric),values=days.map(d=>d.stats[activeMetric]),valid=values.filter(v=>v!=null),max=Math.max(...valid)*1.12,W=1000,H=220,pad=22,pts=values.map((v,i)=>v==null?null:{x:pad+i*(W-pad*2)/(values.length-1),y:H-pad-(v/max)*(H-pad*2),v});const segs=[];let cur=[];pts.forEach(p=>{if(p)cur.push(p);else if(cur.length){segs.push(cur);cur=[]}});if(cur.length)segs.push(cur);$("#chart").innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="M${pad} ${H-pad}H${W-pad}" stroke="#d9ded8"/>${segs.map(s=>`<polyline fill="none" stroke="${metric.color}" stroke-width="5" points="${s.map(p=>`${p.x},${p.y}`).join(' ')}"/>`).join('')}${pts.map(p=>p?`<g><circle cx="${p.x}" cy="${p.y}" r="7" fill="#fff" stroke="${metric.color}" stroke-width="4"/><text x="${p.x}" y="${p.y-16}" text-anchor="middle" font-size="13">${fmt(p.v)}</text></g>`:'').join('')}</svg>`;$("#chartDates").style.gridTemplateColumns=`repeat(${days.length},1fr)`;$("#chartDates").innerHTML=days.map(d=>`<span>${dateLabel(d.date,false)}</span>`).join('');$("#chartLabel").textContent=metric.label;$("#chartLatest").textContent=latest.stats[activeMetric]==null?statDisplay(latest,activeMetric):`${fmt(latest.stats[activeMetric])} ${metric.unit}`;$("#chartChange").textContent=latest.stats[activeMetric]==null?"最新報告は定量値なし":`記録開始比 ${fmt(valid.at(-1)-valid[0])} ${metric.unit}`};
  renderMetrics();renderChart();
}

if($("#timelineList")){
  const topics=["すべて",...new Set(days.flatMap(d=>d.topics))];let activeTopic="すべて";
  const renderTimeline=()=>{const q=$("#search").value.trim().toLowerCase(),filtered=[...days].reverse().filter(d=>(activeTopic==="すべて"||d.topics.includes(activeTopic))&&`${d.headline}${d.summary}${d.actions.join('')}${d.note}${d.topics.join('')}`.toLowerCase().includes(q));$("#timelineList").innerHTML=filtered.map(d=>`<article class="day-card"><div class="date-block"><time datetime="${d.date}">${dateLabel(d.date)}</time><strong>発災 ${d.disasterDay}日目</strong><span>第${d.meeting}回 火の国会議</span></div><div class="day-content"><div class="tags">${d.topics.map(t=>`<span class="tag">${t}</span>`).join('')}</div><h3>${d.headline}</h3><p>${d.summary}</p><ul class="actions">${d.actions.map(a=>`<li>${a}</li>`).join('')}</ul><div class="related-official"><span>関連する自治体の公式情報</span><div>${d.areas.map(name=>{const m=municipalities.find(x=>x.name===name);return `<a href="${m.url}" target="_blank" rel="noopener">${name} ↗</a>`}).join('')}</div></div><p class="day-note">注：${d.note}</p><a class="day-link" href="${encodeURI(d.pdf)}" target="_blank" rel="noopener">この日の議事録を見る（PDF） →</a></div></article>`).join('');$("#noResults").hidden=filtered.length>0};
  const renderFilters=()=>{$("#topicFilters").innerHTML=topics.map(t=>`<button class="filter ${t===activeTopic?"active":""}" data-topic="${t}">${t}</button>`).join('');$$('.filter').forEach(b=>b.onclick=()=>{activeTopic=b.dataset.topic;renderFilters();renderTimeline()})};
  $("#search").addEventListener("input",renderTimeline);renderFilters();renderTimeline();
}

if($("#archive")) $("#archive").innerHTML=[...days].reverse().map(d=>`<a class="archive-row" href="${encodeURI(d.pdf)}" target="_blank" rel="noopener"><time datetime="${d.date}">${dateLabel(d.date,false)}</time><span>第${d.meeting}回</span><b>${d.headline}</b><i>PDFを開く ↗</i></a>`).join('');

if($("#officialPrimary")){
  $("#officialPrimary").innerHTML=officialSources.map(s=>`<a class="official-card" href="${s.url}" target="_blank" rel="noopener"><span>${s.level}</span><h3>${s.name}</h3><p>${s.description}</p><b>公式サイトを開く ↗</b></a>`).join('');
  const renderMunicipalities=()=>{const q=$("#municipalitySearch").value.trim();$("#municipalityGrid").innerHTML=municipalities.filter(m=>m.name.includes(q)).map(m=>`<a href="${m.url}" target="_blank" rel="noopener"><span>${m.name}</span><b>公式サイト ↗</b></a>`).join('')};
  $("#municipalitySearch").addEventListener("input",renderMunicipalities);renderMunicipalities();
}

if($("#municipalityDetail")){
  let selectedMunicipality=new URLSearchParams(location.search).get("name")||"熊本市";if(!municipalities.some(m=>m.name===selectedMunicipality))selectedMunicipality="熊本市";
  const renderDetail=()=>{const municipality=municipalities.find(m=>m.name===selectedMunicipality),events=municipalEvents.filter(e=>e.areas.includes(selectedMunicipality)).sort((a,b)=>b.date.localeCompare(a.date)),specific=events.filter(e=>e.category!=="制度"),latestDate=events[0]?.date;$("#municipalityDetail").innerHTML=`<header><div><p>自治体別 災害・支援情報</p><h3>${selectedMunicipality}</h3><span>会議記録 ${events.length}件${latestDate?` ｜ 最終確認 ${dateLabel(latestDate)}`:''}</span></div><a href="${municipality.url}" target="_blank" rel="noopener">${selectedMunicipality}公式サイト ↗</a></header><div class="municipality-scope"><b>掲載範囲</b><p>会議議事録で自治体名が明記された事項のみ。自治体の全被害・全支援を網羅するものではありません。</p></div>${specific.length?`<div class="municipal-category-summary">${[...new Set(specific.map(e=>e.category))].map(c=>`<span>${c}<b>${specific.filter(e=>e.category===c).length}</b></span>`).join('')}</div>`:`<div class="municipality-empty"><b>個別情報は確認できていません</b><p>災害救助法の適用は確認されています。公式サイトで最新情報をご確認ください。</p></div>`}<div class="municipal-events">${events.map(e=>`<article><div class="event-meta"><time>${dateLabel(e.date)}</time><span>${e.category}</span></div><h4>${e.title}</h4><p>${e.detail}</p><a href="${encodeURI(`${e.pdf}#page=${e.page}`)}" target="_blank" rel="noopener">第${e.meeting}回議事録 p.${e.page} ↗</a></article>`).join('')}</div>`};
  const renderPicker=()=>{const q=$("#municipalityDashboardSearch").value.trim();$("#municipalityPickerList").innerHTML=municipalities.filter(m=>m.name.includes(q)).map(m=>`<button role="option" aria-selected="${m.name===selectedMunicipality}" class="${m.name===selectedMunicipality?'active':''}" data-name="${m.name}"><span>${m.name}</span><b>${municipalEvents.filter(e=>e.areas.includes(m.name)).length}件</b></button>`).join('');$$('#municipalityPickerList button').forEach(b=>b.onclick=()=>{selectedMunicipality=b.dataset.name;history.replaceState(null,'',`?name=${encodeURIComponent(selectedMunicipality)}`);renderPicker();renderDetail()})};
  $("#municipalityDashboardSearch").addEventListener("input",renderPicker);renderPicker();renderDetail();
}
