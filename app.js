const { days, metrics, officialSources, municipalities, municipalEvents } = window.REPORT_DATA;
const $ = (s) => document.querySelector(s);
const fmt = (n) => n == null ? "調査中" : n.toLocaleString("ja-JP");
const statDisplay = (day,key) => key==="outages"&&day.stats.outageStatus ? day.stats.outageStatus : fmt(day.stats[key]);
const dateLabel = (iso, full = true) => new Intl.DateTimeFormat("ja-JP", full ? {year:"numeric",month:"long",day:"numeric",weekday:"short"}:{month:"numeric",day:"numeric"}).format(new Date(`${iso}T00:00:00+09:00`));
const latest = days.at(-1);

$("#updated").textContent = `最終更新 ${dateLabel(latest.date)}`;
$("#latest-title").textContent = latest.headline;
$("#latest-time").textContent = `${dateLabel(latest.date)} 第${latest.meeting}回会議時点`;
$("#latestPdf").href = encodeURI(latest.pdf);
$("#latest-stats").innerHTML = [["避難者", latest.stats.evacuees, "人"],["避難所",latest.stats.shelters,"か所"],["住家被害",latest.stats.homes,"棟"],["断水",latest.stats.waterOutages,"戸"]].map(([l,v,u])=>`<div><dt>${l}</dt><dd>${fmt(v)}<small>${u}</small></dd></div>`).join("");

let activeMetric = "evacuees";
function renderMetrics(){
  $("#metricTabs").innerHTML = metrics.map(m=>`<button class="metric-button ${m.key===activeMetric?"active":""}" data-key="${m.key}" aria-pressed="${m.key===activeMetric}"><span>${m.label}</span><strong>${statDisplay(latest,m.key)}</strong>${latest.stats[m.key]==null?"":` ${m.unit}`}</button>`).join("");
  document.querySelectorAll(".metric-button").forEach(b=>b.onclick=()=>{activeMetric=b.dataset.key;renderMetrics();renderChart()});
}
function renderChart(){
  const metric=metrics.find(m=>m.key===activeMetric), values=days.map(d=>d.stats[activeMetric]);
  const valid=values.filter(v=>v!=null), max=Math.max(...valid)*1.12, W=1000,H=220,pad=22;
  const pts=values.map((v,i)=>v==null?null:{x:pad+i*(W-pad*2)/(values.length-1),y:H-pad-(v/max)*(H-pad*2),v});
  const segments=[];let current=[];pts.forEach(p=>{if(p)current.push(p);else if(current.length){segments.push(current);current=[]}});if(current.length)segments.push(current);
  const lines=segments.map(seg=>`<polyline fill="none" stroke="${metric.color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" points="${seg.map(p=>`${p.x},${p.y}`).join(" ")}"/>`).join("");
  const circles=pts.map((p,i)=>p?`<g><circle cx="${p.x}" cy="${p.y}" r="7" fill="#fff" stroke="${metric.color}" stroke-width="4"/><text x="${p.x}" y="${p.y-16}" text-anchor="middle" font-size="13" font-weight="700" fill="#17231f">${fmt(p.v)}</text></g>`:"").join("");
  $("#chart").innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="M${pad} ${H-pad}H${W-pad}" stroke="#d9ded8"/><path d="M${pad} ${H/2}H${W-pad}" stroke="#edf0ed" stroke-dasharray="5 8"/>${lines}${circles}</svg>`;
  $("#chart").setAttribute("aria-label",`${metric.label}の推移：${days.map((d,i)=>`${dateLabel(d.date,false)} ${d.stats[activeMetric]==null?statDisplay(d,activeMetric):fmt(values[i])+metric.unit}`).join("、")}`);
  $("#chartDates").style.gridTemplateColumns=`repeat(${days.length},1fr)`;$("#chartDates").innerHTML=days.map(d=>`<span>${dateLabel(d.date,false)}</span>`).join("");
  $("#chartLabel").textContent=metric.label;$("#chartLatest").textContent=latest.stats[activeMetric]==null?statDisplay(latest,activeMetric):`${fmt(latest.stats[activeMetric])} ${metric.unit}`;
  const first=valid[0],last=valid.at(-1),diff=last-first;$("#chartChange").textContent=latest.stats[activeMetric]==null?"最新報告は定量値なし":`記録開始比 ${diff>0?"+":""}${fmt(diff)} ${metric.unit}`;
}
$("#insights").innerHTML=[
  ["避難者は7月30日が最多","9,450人をピークに8月4日は7,646人。5日間で1,804人減少しました。"],
  ["避難所の集約が進む","432か所から146か所へ。ただし、避難生活の環境と在宅避難者への継続支援が必要です。"],
  ["被害の全容は調査途上","住家被害は8月3日から推定値に変更され、8月4日は13,393棟。定義変更を含むため単純比較には注意が必要です。"]
].map(([h,p])=>`<article class="insight"><b>${h}</b><p>${p}</p></article>`).join("");

const topics=["すべて",...new Set(days.flatMap(d=>d.topics))];let activeTopic="すべて";
function renderFilters(){$("#topicFilters").innerHTML=topics.map(t=>`<button class="filter ${t===activeTopic?"active":""}" data-topic="${t}" aria-pressed="${t===activeTopic}">${t}</button>`).join("");document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{activeTopic=b.dataset.topic;renderFilters();renderTimeline()})}
function renderTimeline(){
  const q=$("#search").value.trim().toLowerCase();
  const filtered=[...days].reverse().filter(d=>(activeTopic==="すべて"||d.topics.includes(activeTopic))&&`${d.headline}${d.summary}${d.actions.join("")}${d.note}${d.topics.join("")}`.toLowerCase().includes(q));
  $("#timelineList").innerHTML=filtered.map(d=>`<article class="day-card"><div class="date-block"><time datetime="${d.date}">${dateLabel(d.date)}</time><strong>発災 ${d.disasterDay}日目</strong><span>第${d.meeting}回 火の国会議</span></div><div class="day-content"><div class="tags">${d.topics.map(t=>`<span class="tag">${t}</span>`).join("")}</div><h3>${d.headline}</h3><p>${d.summary}</p><ul class="actions">${d.actions.map(a=>`<li>${a}</li>`).join("")}</ul><div class="related-official"><span>関連する自治体の公式情報</span><div>${d.areas.map(name=>{const m=municipalities.find(x=>x.name===name);return `<a href="${m.url}" target="_blank" rel="noopener">${name} ↗</a>`}).join("")}</div></div><p class="day-note">注：${d.note}</p><a class="day-link" href="${encodeURI(d.pdf)}" target="_blank" rel="noopener">この日の議事録を見る（PDF） →</a></div></article>`).join("");
  $("#noResults").hidden=filtered.length>0;
}
$("#search").addEventListener("input",renderTimeline);
$("#archive").innerHTML=[...days].reverse().map(d=>`<a class="archive-row" href="${encodeURI(d.pdf)}" target="_blank" rel="noopener"><time datetime="${d.date}">${dateLabel(d.date,false)}</time><span>第${d.meeting}回</span><b>${d.headline}</b><i>PDFを開く ↗</i></a>`).join("");
$("#officialPrimary").innerHTML=officialSources.map(s=>`<a class="official-card" href="${s.url}" target="_blank" rel="noopener"><span>${s.level}</span><h3>${s.name}</h3><p>${s.description}</p><b>公式サイトを開く ↗</b></a>`).join("");
function renderMunicipalities(){const q=$("#municipalitySearch").value.trim();$("#municipalityGrid").innerHTML=municipalities.filter(m=>m.name.includes(q)).map(m=>`<a href="${m.url}" target="_blank" rel="noopener"><span>${m.name}</span><b>公式サイト ↗</b></a>`).join("")}
$("#municipalitySearch").addEventListener("input",renderMunicipalities);renderMunicipalities();
let selectedMunicipality="熊本市";
function renderMunicipalityPicker(){
  const q=$("#municipalityDashboardSearch").value.trim();
  $("#municipalityPickerList").innerHTML=municipalities.filter(m=>m.name.includes(q)).map(m=>`<button role="option" aria-selected="${m.name===selectedMunicipality}" class="${m.name===selectedMunicipality?"active":""}" data-name="${m.name}"><span>${m.name}</span><b>${municipalEvents.filter(e=>e.areas.includes(m.name)).length}件</b></button>`).join("");
  document.querySelectorAll("#municipalityPickerList button").forEach(b=>b.onclick=()=>{selectedMunicipality=b.dataset.name;renderMunicipalityPicker();renderMunicipalityDetail()});
}
function renderMunicipalityDetail(){
  const municipality=municipalities.find(m=>m.name===selectedMunicipality);
  const events=municipalEvents.filter(e=>e.areas.includes(selectedMunicipality)).sort((a,b)=>b.date.localeCompare(a.date));
  const specific=events.filter(e=>e.category!=="制度");
  const latestDate=events[0]?.date;
  $("#municipalityDetail").innerHTML=`<header><div><p>自治体別 災害・支援情報</p><h3>${selectedMunicipality}</h3><span>会議記録 ${events.length}件${latestDate?` ｜ 最終確認 ${dateLabel(latestDate)}`:""}</span></div><a href="${municipality.url}" target="_blank" rel="noopener">${selectedMunicipality}公式サイト ↗</a></header><div class="municipality-scope"><b>掲載範囲</b><p>火の国会議議事録で自治体名が明記された事項のみ。数値は会議報告時点で、自治体の全被害・全支援を網羅するものではありません。</p></div>${specific.length?`<div class="municipal-category-summary">${[...new Set(specific.map(e=>e.category))].map(c=>`<span>${c}<b>${specific.filter(e=>e.category===c).length}</b></span>`).join("")}</div>`:`<div class="municipality-empty"><b>個別情報は確認できていません</b><p>災害救助法の適用は確認されていますが、保存済み会議記録にはこの自治体単位の被害・支援情報がありません。公式サイトで最新情報をご確認ください。</p></div>`}<div class="municipal-events">${events.map(e=>`<article><div class="event-meta"><time datetime="${e.date}">${dateLabel(e.date)}</time><span>${e.category}</span></div><h4>${e.title}</h4><p>${e.detail}</p><a href="${encodeURI(`${e.pdf}#page=${e.page}`)}" target="_blank" rel="noopener">第${e.meeting}回議事録 p.${e.page} ↗</a></article>`).join("")}</div>`;
}
$("#municipalityDashboardSearch").addEventListener("input",renderMunicipalityPicker);renderMunicipalityPicker();renderMunicipalityDetail();
renderMetrics();renderChart();renderFilters();renderTimeline();
