(() => {
  'use strict';
  const data = window.MUNICIPALITY_HQ;
  const city = data?.municipalities.find(m => m.key === 'uto');
  if (!city) return;
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = d => d ? `${Number(d.slice(5,7))}月${Number(d.slice(8))}日` : '日時未確認';
  const pdf = (m, p=1) => `${m.documents[0].url}#page=${p}`;
  const link = (m,p=1,label='原PDFを開く') => `<a href="${esc(pdf(m,p))}" target="_blank" rel="noopener">${esc(label)} ↗</a>`;
  const meetings = city.meetings;
  const latest = meetings.at(-1);
  const reviewed = city.editorial.reviewedThrough;
  const summaries = new Map(city.editorial.meetings.map(m=>[m.meeting,m]));
  const totalPages = meetings.reduce((n,m)=>n+m.pages,0);
  $('#utoCoverage').innerHTML = `<span><b>${meetings.length}</b>本のPDF</span><span><b>${totalPages}</b>ページ</span><span>第${meetings[0].meeting}〜${latest.meeting}回<br>${fmt(meetings[0].date)}〜${fmt(latest.date)}</span>`;
  $('#utoLatestTitle').textContent = `第${latest.meeting}回・${fmt(latest.date)}${latest.writtenReport?'（書面報告）':` ${latest.time||''}`}`;
  $('#utoLatest').innerHTML = `<article><span>避難者数</span><b>${latest.figures.evacuees ?? '—'}<small>人</small></b><p>${esc(latest.figureAsOf)}時点</p>${link(latest,2,'避難者一覧')}</article><article><span>避難世帯数</span><b>${latest.figures.households ?? '—'}<small>世帯</small></b><p>総務部の避難者一覧による</p>${link(latest,2,'集計の原資料')}</article><article><span>市の対応</span><h3>${esc(summaries.get(latest.meeting)?.title || '新しい会議資料を公開')}</h3><p>${esc(summaries.get(latest.meeting)?.summary || 'この回の編集要約は未確認です。下の全ページの本文とPDFをご確認ください。')}</p>${link(latest)}</article>`;
  const phases = [
    ['07/28〜08/03','初動と生活の応急対応','給水・物資・証明窓口の体制を整え、被害認定調査が始まる。',6,10],
    ['08/04〜08/12','避難生活と住まいの支援','すまいの総合窓口を開き、避難所を市民体育館へ集約。',14,19],
    ['08/13〜08/21','被害把握と支援体制の整備','名簿や住まいの状況を確認。復旧宣言と避難指示解除の段階へ。',20,26],
    ['08/22〜09/04','生活再建と支援の引き継ぎ','仮設住宅の着工・入居募集、学校再開、見守り支援への移行を進める。',28,33]
  ];
  const phaseStarts = ['2026-07-28','2026-08-04','2026-08-13','2026-08-22'];
  const elapsed = date => Math.round((Date.parse(date)-Date.parse('2026-07-28'))/86400000);
  $('#hqPhases').innerHTML = `<div class="uto-origin"><b>7月28日 発災</b><span>ここから市の対応をたどる</span></div><ol class="uto-phase-list">${phases.map(([date,title,body,a,b],i)=>{
    const entries = meetings.filter(m=>m.date >= phaseStarts[i] && (!phaseStarts[i+1] || m.date < phaseStarts[i+1]) && summaries.has(m.meeting)).sort((a,b)=>a.date.localeCompare(b.date)||a.meeting-b.meeting);
    return `<li class="uto-phase-step"><div class="uto-phase-time"><span class="uto-phase-num">0${i+1}</span><b>${date}</b><span>${i===0?'発災当日':`発災から${elapsed(phaseStarts[i])}日後〜`}</span></div><div class="uto-phase-body"><h3>${title}</h3><p>${body}</p><details${i===0?' open':''}><summary>この期間の動きを日付順に見る（${entries.length}回）</summary><ol class="uto-phase-events">${entries.map(m=>{const item=summaries.get(m.meeting);return `<li><div><time datetime="${m.date}">${fmt(m.date)}</time><span>${m.writtenReport?'書面報告':esc(m.time||'')} · 第${m.meeting}回</span></div><h4>${esc(item.title)}</h4><p>${esc(item.summary)}</p>${link(m,item.page||1,'会議資料を確認')}</li>`;}).join('')}</ol></details><p class="uto-note">期間の参考資料：${[a,b].map(n=>link(meetings.find(m=>m.meeting===n),1,`第${n}回`)).join(' · ')}</p></div></li>`;
  }).join('')}</ol><p class="uto-timeline-end">編集要約は第${reviewed}回まで。以降の公開資料は「全会議の記録」で確認できます。</p>`;

  const points=meetings.filter(m=>Number.isFinite(m.figures.evacuees));
  const start=Date.parse(meetings[0].date), end=Date.parse(latest.date), ymax=Math.ceil(Math.max(...points.map(m=>m.figures.evacuees))/100)*100;
  const x=m=>62+(Date.parse(m.date)-start)/(end-start||1)*840;
  const y=n=>245-n/ymax*195;
  const ticks=[0,ymax/2,ymax];
  const segments=points.slice(1).map((m,i)=>`<line x1="${x(points[i])}" y1="${y(points[i].figures.evacuees)}" x2="${x(m)}" y2="${y(m.figures.evacuees)}" ${Date.parse(m.date)-Date.parse(points[i].date)>86400000?'stroke-dasharray="5 5"':''}/>`).join('');
  $('#utoChart').innerHTML=`<svg viewBox="0 0 950 300" role="img" aria-label="各会議の避難者数。集計時刻と値は下の表でも確認できます。">${ticks.map(n=>`<line x1="62" y1="${y(n)}" x2="902" y2="${y(n)}" stroke="#ddd"/><text x="48" y="${y(n)+5}" text-anchor="end">${n}人</text>`).join('')}<g stroke="#286c61" stroke-width="2.5">${segments}</g>${points.map(m=>`<circle cx="${x(m)}" cy="${y(m.figures.evacuees)}" r="4" fill="#286c61"><title>第${m.meeting}回 ${m.figureAsOf} ${m.figures.evacuees}人</title></circle>`).join('')}${points.filter((m,i)=>i%5===0||i===points.length-1).map(m=>`<text x="${x(m)}" y="274" text-anchor="middle">${fmt(m.date)}</text>`).join('')}</svg>`;
  $('#utoNumbers').innerHTML=`<table><caption>総務部の避難者一覧・最終列（人数を補完していません）</caption><thead><tr><th>会議</th><th>集計日時</th><th>世帯</th><th>人数</th><th>出典</th></tr></thead><tbody>${meetings.map(m=>`<tr><th>第${m.meeting}回</th><td>${esc(m.figureAsOf||'一覧なし')}</td><td>${m.figures.households??'—'}</td><td>${m.figures.evacuees??'—'}</td><td>${link(m,m.figureSourcePage||1,'PDF')}</td></tr>`).join('')}</tbody></table>`;
  const damagePoints = meetings.filter(m => m.damageSourcePage).sort((a,b) => a.date.localeCompare(b.date));
  const damageSeries = [
    ['utoHomesTotal','把握した住家被害の計','#286c61'],
    ['utoHomesUnclassified','分類未確定','#7b687e'],
    ['utoHomesPartial','一部損壊（準半壊含む）','#337d95'],
    ['utoHomesHalf','半壊（中規模含む）','#a56b27'],
    ['utoHomesLargeHalf','大規模半壊','#aa554b'],
    ['utoHomesFull','全壊','#754a40']
  ];
  $('#utoDamageCharts').innerHTML = damageSeries.map(([key,label,color]) => {
    const rows = damagePoints.filter(m => Number.isFinite(m.figures[key]));
    if (!rows.length) return `<article><h4>${label}</h4><p>数値の記録はありません。</p></article>`;
    const first = rows[0], last = rows.at(-1), delta = last.figures[key] - first.figures[key];
    const maximum = Math.max(...rows.map(m => m.figures[key]), 1);
    const step = 10 ** Math.floor(Math.log10(maximum));
    const ceiling = Math.ceil(maximum / step) * step;
    const beginning = Date.parse(damagePoints[0].date), ending = Date.parse(damagePoints.at(-1).date);
    const dx = m => 55 + (Date.parse(m.date)-beginning)/(ending-beginning || 1)*335;
    const dy = n => 170 - n/ceiling*130;
    const num = n => n.toLocaleString('ja-JP');
    const description = rows.map(m => `${fmt(m.date)} ${num(m.figures[key])}件`).join('、');
    return `<article class="uto-damage-card"><h4>${label}</h4><div class="uto-damage-value"><b>${num(last.figures[key])}<small>件</small></b><span>${fmt(last.date)}時点<br>${fmt(first.date)}比 ${delta>0?'+':''}${num(delta)}件</span></div><svg viewBox="0 0 440 215" role="img" aria-label="${esc(label+'。'+description)}"><title>${esc(label)}</title>${[0,ceiling/2,ceiling].map(n=>`<line x1="55" y1="${dy(n)}" x2="390" y2="${dy(n)}" stroke="#dce6e1"/><text x="47" y="${dy(n)+4}" text-anchor="end">${num(n)}</text>`).join('')}${rows.slice(1).map((m,i)=>`<line x1="${dx(rows[i])}" y1="${dy(rows[i].figures[key])}" x2="${dx(m)}" y2="${dy(m.figures[key])}" stroke="${color}" stroke-width="2.5"/>`).join('')}${rows.map(m=>`<circle cx="${dx(m)}" cy="${dy(m.figures[key])}" r="4" fill="${color}"><title>${fmt(m.date)}：${num(m.figures[key])}件</title></circle>`).join('')}${[damagePoints[0],damagePoints.at(-1)].filter((m,i,a)=>i===0||m!==a[0]).map(m=>`<text x="${dx(m)}" y="198" text-anchor="middle">${fmt(m.date)}</text>`).join('')}</svg></article>`;
  }).join('');
  $('#utoDamage').innerHTML=`<table><caption>会議日の13時時点・物的被害（住家）の表</caption><thead><tr><th>会議日</th><th>全壊</th><th>大規模半壊</th><th>半壊（中規模含む）</th><th>一部損壊（準半壊含む）</th><th>分類未確定</th><th>計</th><th>出典</th></tr></thead><tbody>${meetings.filter(m=>m.damageSourcePage).map(m=>`<tr><th>${fmt(m.date)}</th>${['utoHomesFull','utoHomesLargeHalf','utoHomesHalf','utoHomesPartial','utoHomesUnclassified','utoHomesTotal'].map(k=>`<td>${m.figures[k].toLocaleString('ja-JP')}</td>`).join('')}<td>${link(m,m.damageSourcePage,'PDF')}</td></tr>`).join('')}</tbody></table>`;
  $('#hqCadence').textContent='開催の変化：発災当日は3回、翌日は2回。8月13〜16日は書面報告。8月19日の資料で以後は原則週3回（月・水・金）と記載されています。9月2日も書面報告です。';
  document.querySelectorAll('[data-source-meeting]').forEach(el=>{const n=Number(el.dataset.sourceMeeting);el.innerHTML=link(meetings.find(m=>m.meeting===n),1,el.textContent);});
  const render = () => {
    const query=$('#utoSearch').value.trim().normalize('NFKC').toLowerCase();
    const filtered=meetings.filter(m=>!query||JSON.stringify([summaries.get(m.meeting),m.sections]).normalize('NFKC').toLowerCase().includes(query));
    if($('#utoOrder').value==='desc')filtered.reverse();
    $('#utoResultCount').textContent=`${filtered.length}回 / 全${meetings.length}回（編集要約は第${reviewed}回まで確認）`;
    $('#utoMeetings').innerHTML=filtered.map(m=>{const s=summaries.get(m.meeting);return `<article class="uto-meeting" id="meeting-${m.meeting}"><div class="uto-meeting-date"><b>第${m.meeting}回</b><time datetime="${m.date}">${fmt(m.date)}</time><span>${m.writtenReport?'書面報告':esc(m.time)}</span></div><div><h3>${esc(s?.title||'編集要約は未確認')}</h3><p>${esc(s?.summary||'公開資料の本文とPDFを確認できます。')}</p><p>${link(m,s?.page||1,`第${m.meeting}回のPDF（全${m.pages}ページ）`)} · <a href="#meeting-${m.meeting}">この回へのリンク</a></p><details class="uto-full"><summary>全部署・全${m.pages}ページの抽出本文を確認する</summary><p class="uto-note">表の列・赤字はPDFを確認してください。以下はPDFから抽出した本文です。</p>${m.sections.map(p=>`<details><summary>${esc(p.title)}</summary>${link(m,p.page,`PDF p.${p.page}`)}<pre>${esc(p.text)}</pre></details>`).join('')}</details></div></article>`;}).join('')||'<p>一致する記録がありません。別の言葉で検索してください。</p>';
  };
  $('#utoOrder').addEventListener('change',render);$('#utoSearch').addEventListener('input',render);render();
  $('#utoRetrieved').textContent=`資料一覧の取得：${new Date(data.retrievedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})}（日本時間）。編集要約：第${reviewed}回まで。`;
})();
