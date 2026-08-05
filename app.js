const {days,metrics,officialSources,municipalities,municipalEvents,supportCategories,supportEvents}=window.REPORT_DATA;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const priorityMunicipalities=["宇土市","宇城市","氷川町","八代市"];
const municipalityRank=name=>{const i=priorityMunicipalities.indexOf(name);return i<0?99:i};
const orderedMunicipalities=[...municipalities].sort((a,b)=>municipalityRank(a.name)-municipalityRank(b.name)||a.name.localeCompare(b.name,"ja"));
const fmt=n=>n==null?"調査中":n.toLocaleString("ja-JP");
const statDisplay=(day,key)=>key==="outages"&&day.stats.outageStatus?day.stats.outageStatus:key==="waterOutages"&&day.stats[key]==null?"資料記載なし":fmt(day.stats[key]);
const dateLabel=(iso,full=true)=>new Intl.DateTimeFormat("ja-JP",full?{year:"numeric",month:"long",day:"numeric",weekday:"short"}:{month:"numeric",day:"numeric"}).format(new Date(`${iso}T00:00:00+09:00`));
const latest=days.at(-1);

const nav=document.querySelector(".site-header nav");
if(nav){
  const page=location.pathname.split("/").pop()||"index.html";
  const groups={
    "index.html":"index.html","timeline.html":"timeline.html","meetings.html":"meetings.html",
    "affected.html":"affected.html","guide.html":"affected.html","terms.html":"affected.html","official.html":"affected.html",
    "supporters.html":"supporters.html","support.html":"supporters.html",
    "municipalities.html":"municipalities.html","shelters.html":"municipalities.html"
  };
  const items=[["サマリー","index.html"],["火の国会議","timeline.html"],["被災された方","affected.html"],["支援する方","supporters.html"],["地域・避難所","municipalities.html"],["議事録原本","meetings.html"]];
  nav.innerHTML=items.map(([label,url])=>`<a href="${url}"${groups[page]===url?' aria-current="page"':''}>${label}</a>`).join("");
}

if($("#updated")) $("#updated").textContent=`最終更新 ${dateLabel(latest.date)}`;
if($("#latest-title")){
  $("#latest-title").textContent=latest.headline;
  $("#latest-time").textContent=`${dateLabel(latest.date)} 第${latest.meeting}回会議時点`;
  $("#latestPdf").href=encodeURI(latest.pdf);
  $("#latest-stats").innerHTML=[["避難者",latest.stats.evacuees,"人"],["避難所",latest.stats.shelters,"か所"],["住家被害",latest.stats.homes,"棟"],["断水",latest.stats.waterOutages,"戸"]].map(([l,v,u])=>`<div><dt>${l}</dt><dd>${fmt(v)}<small>${u}</small></dd></div>`).join("");
}
if($("#situationSnapshot")){
  const maxEvac=[...days].sort((a,b)=>b.stats.evacuees-a.stats.evacuees)[0],evacChange=latest.stats.evacuees-maxEvac.stats.evacuees;
  $("#situationAsOf").textContent=`${dateLabel(latest.date)} 第${latest.meeting}回`;
  $("#situationPdf").href=encodeURI(latest.pdf);
  $("#situationSnapshot").innerHTML=`<article><span>最新会議の避難者</span><strong>${fmt(latest.stats.evacuees)}<small>人</small></strong><p>記録期間内最多の${dateLabel(maxEvac.date,false)}から ${fmt(Math.abs(evacChange))}人減</p></article><article><span>最新会議の開設避難所</span><strong>${fmt(latest.stats.shelters)}<small>か所</small></strong><p>${dateLabel(days[0].date,false)}の${fmt(days[0].stats.shelters)}か所から減少</p></article><article><span>住家被害</span><strong>${fmt(latest.stats.homes)}<small>棟</small></strong><p>最新資料の推定値。判定済み棟数とは定義が異なります</p></article><article><span>断水</span><strong>${fmt(latest.stats.waterOutages)}<small>戸</small></strong><p>宇城・甲佐・八代・氷川の4市町合計</p></article>`;
}

if($("#sectionLinks")){
  const links=[
    ["日ごとのまとめ","火の国会議から現場の変化を追う","timeline.html","日"],
    ["重点4地域を見る","宇土・宇城・氷川・八代を中心に確認","municipalities.html","市"],
    ["議事録原本を見る","保存した火の国会議PDFを確認","meetings.html","録"]
  ];
  $("#sectionLinks").innerHTML=links.map(([h,p,u,m])=>`<a href="${u}"><span>${m}</span><div><h3>${h}</h3><p>${p}</p></div><b>→</b></a>`).join("");
}
if($("#audienceUpdates")){
  const recent=[...supportEvents].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  $("#audienceUpdates").innerHTML=recent.map(e=>`<article><time>${dateLabel(e.date)}</time><span>${supportCategories.find(c=>c.key===e.category)?.label||e.category}</span><h3>${e.title}</h3><p>${e.detail}</p><a href="${encodeURI(`${e.pdf}#page=${e.page}`)}" target="_blank" rel="noopener">会議資料 p.${e.page} ↗</a></article>`).join("");
}

const footer=document.querySelector("footer");
if(footer&&!document.querySelector(".site-directory")){
  const directory=document.createElement("section");directory.className="site-directory";directory.setAttribute("aria-label","サイト内リンク");
  directory.innerHTML=`<div><b>火の国会議</b><a href="timeline.html">日ごとのまとめ</a><a href="meetings.html">議事録原本</a></div><div><b>被災された方</b><a href="shelters.html">稼働避難所</a><a href="guide.html">制度・生活再建</a><a href="terms.html">災害用語集</a></div><div><b>支援する方</b><a href="support.html">支援分野別</a><a href="municipalities.html">自治体別</a><a href="supporters.html">支援者向け入口</a></div><div><b>一次情報</b><a href="official.html">国・県・市町村</a><a href="https://portal.bousai.pref.kumamoto.jp/" target="_blank" rel="noopener">防災情報くまもと ↗</a></div>`;
  footer.before(directory);
}
if($("#recentUpdates")) $("#recentUpdates").innerHTML=[...days].reverse().slice(0,3).map(d=>`<article><time datetime="${d.date}">${dateLabel(d.date)}</time><span>第${d.meeting}回</span><h3>${d.headline}</h3><p>${d.summary}</p><a href="timeline.html">詳細を見る →</a></article>`).join("");
if($("#priorityRegions")) $("#priorityRegions").innerHTML=priorityMunicipalities.map(name=>{const events=municipalEvents.filter(e=>e.areas.includes(name)),latestEvent=[...events].sort((a,b)=>b.date.localeCompare(a.date))[0];return `<a href="municipalities.html?name=${encodeURIComponent(name)}"><span>重点地域</span><h3>${name}</h3><p>${latestEvent?`${dateLabel(latestEvent.date)}までに会議記録${events.length}件`:`会議記録を確認`}</p><b>地域情報を見る →</b></a>`}).join("");

if($("#metricTabs")){
  let activeMetric="evacuees";
  const renderMetrics=()=>{$("#metricTabs").innerHTML=metrics.map(m=>`<button class="metric-button ${m.key===activeMetric?"active":""}" data-key="${m.key}" aria-pressed="${m.key===activeMetric}"><span>${m.label}</span><strong>${statDisplay(latest,m.key)}</strong>${latest.stats[m.key]==null?"":` ${m.unit}`}</button>`).join("");$$('.metric-button').forEach(b=>b.onclick=()=>{activeMetric=b.dataset.key;renderMetrics();renderChart()})};
  const renderChart=()=>{const metric=metrics.find(m=>m.key===activeMetric),values=days.map(d=>d.stats[activeMetric]),valid=values.filter(v=>v!=null),max=Math.max(...valid)*1.12,W=1000,H=220,pad=22,pts=values.map((v,i)=>v==null?null:{x:pad+i*(W-pad*2)/(values.length-1),y:H-pad-(v/max)*(H-pad*2),v});const segs=[];let cur=[];pts.forEach(p=>{if(p)cur.push(p);else if(cur.length){segs.push(cur);cur=[]}});if(cur.length)segs.push(cur);$("#chart").innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="M${pad} ${H-pad}H${W-pad}" stroke="#d9ded8"/>${segs.map(s=>`<polyline fill="none" stroke="${metric.color}" stroke-width="5" points="${s.map(p=>`${p.x},${p.y}`).join(' ')}"/>`).join('')}${pts.map(p=>p?`<g><circle cx="${p.x}" cy="${p.y}" r="7" fill="#fff" stroke="${metric.color}" stroke-width="4"/><text x="${p.x}" y="${p.y-16}" text-anchor="middle" font-size="13">${fmt(p.v)}</text></g>`:'').join('')}</svg>`;$("#chartDates").style.gridTemplateColumns=`repeat(${days.length},1fr)`;$("#chartDates").innerHTML=days.map(d=>`<span>${dateLabel(d.date,false)}</span>`).join('');$("#chartLabel").textContent=metric.label;$("#chartLatest").textContent=latest.stats[activeMetric]==null?statDisplay(latest,activeMetric):`${fmt(latest.stats[activeMetric])} ${metric.unit}`;$("#chartChange").textContent=latest.stats[activeMetric]==null?"最新報告は定量値なし":`記録開始比 ${fmt(valid.at(-1)-valid[0])} ${metric.unit}`;if($("#trendTable"))$("#trendTable").innerHTML=`<table><thead><tr><th>会議日</th><th>会議</th><th>${metric.label}</th></tr></thead><tbody>${days.map(d=>`<tr><td>${dateLabel(d.date,false)}</td><td>第${d.meeting}回</td><td>${d.stats[activeMetric]==null?statDisplay(d,activeMetric):`${fmt(d.stats[activeMetric])} ${metric.unit}`}</td></tr>`).join('')}</tbody></table>`};
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
  const renderMunicipalities=()=>{const q=$("#municipalitySearch").value.trim();$("#municipalityGrid").innerHTML=orderedMunicipalities.filter(m=>m.name.includes(q)).map(m=>`<a class="${priorityMunicipalities.includes(m.name)?'priority-municipality':''}" href="${m.url}" target="_blank" rel="noopener"><span>${m.name}${priorityMunicipalities.includes(m.name)?'<small>重点地域</small>':''}</span><b>公式サイト ↗</b></a>`).join('')};
  $("#municipalitySearch").addEventListener("input",renderMunicipalities);renderMunicipalities();
}

if($("#municipalityDetail")){
  let selectedMunicipality=new URLSearchParams(location.search).get("name")||"宇土市";if(!municipalities.some(m=>m.name===selectedMunicipality))selectedMunicipality="宇土市";
  const renderDetail=()=>{const municipality=municipalities.find(m=>m.name===selectedMunicipality),events=municipalEvents.filter(e=>e.areas.includes(selectedMunicipality)).sort((a,b)=>b.date.localeCompare(a.date)),specific=events.filter(e=>e.category!=="制度"),latestDate=events[0]?.date;$("#municipalityDetail").innerHTML=`<header><div><p>${priorityMunicipalities.includes(selectedMunicipality)?"重点地域":"その他の対象地域"} ｜ 自治体別 災害・支援情報</p><h3>${selectedMunicipality}</h3><span>会議記録 ${events.length}件${latestDate?` ｜ 最終確認 ${dateLabel(latestDate)}`:''}</span></div><a href="${municipality.url}" target="_blank" rel="noopener">${selectedMunicipality}公式サイト ↗</a></header><div class="municipality-scope"><b>掲載範囲</b><p>会議議事録で自治体名が明記された事項のみ。自治体の全被害・全支援を網羅するものではありません。</p></div>${specific.length?`<div class="municipal-category-summary">${[...new Set(specific.map(e=>e.category))].map(c=>`<span>${c}<b>${specific.filter(e=>e.category===c).length}</b></span>`).join('')}</div>`:`<div class="municipality-empty"><b>個別情報は確認できていません</b><p>災害救助法の適用は確認されています。公式サイトで最新情報をご確認ください。</p></div>`}<div class="municipal-events">${events.map(e=>`<article><div class="event-meta"><time>${dateLabel(e.date)}</time><span>${e.category}</span></div><h4>${e.title}</h4><p>${e.detail}</p><a href="${encodeURI(`${e.pdf}#page=${e.page}`)}" target="_blank" rel="noopener">第${e.meeting}回議事録 p.${e.page} ↗</a></article>`).join('')}</div>`};
  const renderPicker=()=>{const q=$("#municipalityDashboardSearch").value.trim(),matches=orderedMunicipalities.filter(m=>m.name.includes(q)),priority=matches.filter(m=>priorityMunicipalities.includes(m.name)),others=matches.filter(m=>!priorityMunicipalities.includes(m.name)),buttons=list=>list.map(m=>`<button role="option" aria-selected="${m.name===selectedMunicipality}" class="${m.name===selectedMunicipality?'active':''}" data-name="${m.name}"><span>${m.name}</span><b>${municipalEvents.filter(e=>e.areas.includes(m.name)).length}件</b></button>`).join('');$("#municipalityPickerList").innerHTML=`${priority.length?`<p class="municipality-group-label">重点地域</p>${buttons(priority)}`:''}${others.length?`<p class="municipality-group-label sub">その他の対象地域</p>${buttons(others)}`:''}`;$$('#municipalityPickerList button').forEach(b=>b.onclick=()=>{selectedMunicipality=b.dataset.name;history.replaceState(null,'',`?name=${encodeURIComponent(selectedMunicipality)}`);renderPicker();renderDetail()})};
  $("#municipalityDashboardSearch").addEventListener("input",renderPicker);renderPicker();renderDetail();
}

if($("#supportDetail")){
  let selectedSupport=new URLSearchParams(location.search).get("category")||supportCategories[0].key;
  if(!supportCategories.some(c=>c.key===selectedSupport))selectedSupport=supportCategories[0].key;
  const renderSupportDetail=()=>{const category=supportCategories.find(c=>c.key===selectedSupport),events=supportEvents.filter(e=>e.category===selectedSupport).sort((a,b)=>b.date.localeCompare(a.date));$("#supportDetail").innerHTML=`<header><p>支援分野別情報</p><h2>${category.label}</h2><span>${category.description} ｜ 会議記録 ${events.length}件</span></header><div class="support-scope"><b>掲載基準</b><p>保存済み議事録に明記された活動・ニーズのみ。件数や人数は会議報告時点で、支援全体を網羅するものではありません。</p></div><div class="support-events">${events.map(e=>`<article><div class="event-meta"><time>${dateLabel(e.date)}</time>${e.areas.length?`<span>${e.areas.join("・")}</span>`:""}</div><h3>${e.title}</h3><p>${e.detail}</p><a href="${encodeURI(`${e.pdf}#page=${e.page}`)}" target="_blank" rel="noopener">第${e.meeting}回議事録 p.${e.page} ↗</a></article>`).join("")}</div>`};
  const renderSupportPicker=()=>{$("#supportCategoryList").innerHTML=supportCategories.map(c=>`<button role="option" aria-selected="${c.key===selectedSupport}" class="${c.key===selectedSupport?"active":""}" data-key="${c.key}"><span>${c.label}</span><b>${supportEvents.filter(e=>e.category===c.key).length}件</b><small>${c.description}</small></button>`).join("");$$("#supportCategoryList button").forEach(b=>b.onclick=()=>{selectedSupport=b.dataset.key;history.replaceState(null,"",`?category=${selectedSupport}`);renderSupportPicker();renderSupportDetail()})};
  renderSupportPicker();renderSupportDetail();
}
