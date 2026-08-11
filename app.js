// data/report-data.js は日々手で編集する。構文エラーや読み込み失敗で全ページが白紙になるのを避けるため、
// 描画全体を try で囲み、失敗したら公式サイトへの導線を出して知らせる。
const showDataError=err=>{
  console.error("[火の国レポート] データの読み込み・描画に失敗しました",err);
  document.body?.insertAdjacentHTML("afterbegin",
    `<div class="data-error" role="alert"><b>情報を表示できませんでした</b>`+
    `<p>ページの読み込みに問題が発生しています。お急ぎの場合は公式サイトをご確認ください。</p>`+
    `<a href="https://portal.bousai.pref.kumamoto.jp/" target="_blank" rel="noopener">防災情報くまもと ↗</a></div>`);
};

try{

document.body.classList.add("modern-site");

const {days,metrics,officialSources,municipalities,municipalEvents,supportCategories,supportEvents}=window.REPORT_DATA;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
// 自治体間に表示上の序列を設けず、市町村名順で統一する。
const orderedMunicipalities=[...municipalities].sort((a,b)=>a.name.localeCompare(b.name,"ja"));
const municipalityReconstructionIds={"熊本市":"municipality_kumamoto","八代市":"municipality_yatsushiro","水俣市":"municipality_minamata","山鹿市":"municipality_yamaga","菊池市":"municipality_kikuchi","宇土市":"municipality_uto","上天草市":"municipality_kamiamakusa","宇城市":"municipality_uki","天草市":"municipality_amakusa","合志市":"municipality_koshi","美里町":"municipality_misato","大津町":"municipality_ozu","菊陽町":"municipality_kikuyo","西原村":"municipality_nishihara","御船町":"municipality_mifune","嘉島町":"municipality_kashima","益城町":"municipality_mashiki","甲佐町":"municipality_kosa","氷川町":"municipality_hikawa","芦北町":"municipality_ashikita","津奈木町":"municipality_tsunagi"};
const municipalityNote=document.querySelector(".municipality-equality-note");
if(municipalityNote){const officialFeedLink=document.createElement("a");officialFeedLink.className="button";officialFeedLink.href="municipality-updates.html";officialFeedLink.textContent="市町村の公式発信を時系列で見る →";municipalityNote.append(officialFeedLink)}
const fmt=n=>n==null?"調査中":n.toLocaleString("ja-JP");
const statDisplay=(day,key)=>key==="outages"&&day.stats.outageStatus?day.stats.outageStatus:key==="waterOutages"&&day.stats[key]==null?"資料記載なし":fmt(day.stats[key]);
const dateLabel=(iso,full=true)=>new Intl.DateTimeFormat("ja-JP",full?{year:"numeric",month:"long",day:"numeric",weekday:"short"}:{month:"numeric",day:"numeric"}).format(new Date(`${iso}T00:00:00+09:00`));
const latest=days.at(-1);
const SITE_NAME="よか隊ネット熊本　災害・支援状況レポート";

// 全ページ共通の名称・位置づけ。HTMLに残る旧名称やページ固有タイトルも表示時に統一する。
document.querySelectorAll(".brand").forEach(brand=>{
  const mark=brand.querySelector(".brand-mark");
  const label=brand.querySelector("span:last-child");
  if(mark) mark.textContent="よ";
  if(label) label.innerHTML=`よか隊ネット熊本<br><b>災害・支援状況レポート</b>`;
});
document.title=document.title.includes("｜")
  ? `${document.title.split("｜")[0]}｜${SITE_NAME}`
  : SITE_NAME;
document.querySelector('meta[property="og:site_name"]')?.setAttribute("content",SITE_NAME);
document.querySelector('meta[property="og:title"]')?.setAttribute("content",document.title);
document.querySelector('meta[property="og:image:alt"]')?.setAttribute("content",`${SITE_NAME}｜令和8年熊本地震の災害・支援情報アーカイブ`);
const labelTranslations={
  "CURRENT SITUATION":"現在の状況","INFORMATION MENU":"情報メニュー","OFFICIAL INFORMATION":"公的情報",
  "BY MUNICIPALITY":"市町村別","OFFICIAL MUNICIPAL UPDATES":"市町村の公式発信","COVERAGE":"収集状況",
  "METHOD & SOURCE":"掲載基準と出典","FOR AFFECTED PEOPLE":"被災された方へ","FOR SUPPORTERS":"支援する方へ",
  "DAILY ARCHIVE":"日ごとの記録","MEETING ARCHIVE":"会議記録","SUPPORT BY FIELD":"支援分野別",
  "PUBLIC INFORMATION":"公的情報","DISASTER GUIDE":"制度・生活再建","DISASTER TERMS":"災害用語"
};
document.querySelectorAll(".kicker,.eyebrow").forEach(label=>{const translated=labelTranslations[label.textContent.trim()];if(translated)label.textContent=translated});

const siteHeader=document.querySelector(".site-header");
const headerNav=siteHeader?.querySelector("nav");
const hasOrganizationHeader=Boolean(siteHeader?.querySelector(".org-header-inner"));
if(!hasOrganizationHeader&&headerNav&&!headerNav.querySelector('a[href="municipality-updates.html"]')){
  const link=document.createElement("a");link.href="municipality-updates.html";link.textContent="市町村公式発信";
  if(location.pathname.endsWith("municipality-updates.html"))link.setAttribute("aria-current","page");
  headerNav.querySelector("a")?.after(link);
}
if(!hasOrganizationHeader&&siteHeader&&headerNav&&!siteHeader.querySelector(".mobile-menu-toggle")){
  headerNav.id="mainNavigation";headerNav.classList.add("enhanced-nav");
  const toggle=document.createElement("button");toggle.type="button";toggle.className="mobile-menu-toggle";toggle.setAttribute("aria-controls",headerNav.id);toggle.setAttribute("aria-expanded","false");
  toggle.innerHTML='<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="close-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg><span>メニュー</span>';
  toggle.onclick=()=>{const open=toggle.getAttribute("aria-expanded")!=="true";toggle.setAttribute("aria-expanded",String(open));headerNav.classList.toggle("is-open",open)};
  siteHeader.insertBefore(toggle,headerNav);
}
if(siteHeader&&!document.querySelector(".archive-source-policy")){
  const policy=document.createElement("aside");
  policy.className="archive-source-policy";
  policy.setAttribute("aria-label","本サイトの位置づけと一次情報の確認");
  policy.innerHTML=`<div><b>本サイトは災害・支援情報のアーカイブです</b><p>「火の国会議」議事録を中核に、熊本県災害対策本部と各市町村の公式情報を、出典・確認時点とともに整理しています。本サイト自体は行政機関等が発信する一次情報ではありません。</p></div><nav aria-label="一次情報へのリンク"><a href="meetings.html">火の国会議議事録</a><a href="municipality-updates.html">市町村公式発信</a><a href="official.html">国・県・市町村の一次情報</a><a href="https://portal.bousai.pref.kumamoto.jp/" target="_blank" rel="noopener">防災情報くまもと ↗</a></nav><p class="archive-source-warning"><b>参照時の注意</b> 避難、安否、支援活動、制度申請などの判断前には、リンク先の一次情報で発表時刻・対象地域・受付条件を必ず再確認してください。</p>`;
  const disasterPortal=document.querySelector(".disaster-portal");
  if(location.pathname.endsWith("disaster.html")&&disasterPortal){
    disasterPortal.after(policy);
  }else{
    document.querySelector("main")?.after(policy);
  }
}

const topNotice=document.querySelector(".notice p");
if(topNotice) topNotice.innerHTML=`<b>火の国会議の生の現場情報を軸に、公的な一次情報を紐づけて保存しています。</b> このページは記録・検索のためのアーカイブであり、緊急情報や行政の公式発表に代わるものではありません。`;

if($("#officialTopicsGrid")){
  const topics=window.OFFICIAL_TOPICS;
  const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const compactDate=item=>{const date=new Date(`${item.date}T00:00:00+09:00`);return `<time datetime="${esc(item.date)}">${date.getMonth()+1}/${date.getDate()}</time>${item.time?`<small>${esc(item.time)}</small>`:""}`};
  const topicItem=(item,label)=>`<a class="topic-item" href="${esc(item.url)}" target="_blank" rel="noopener"><span class="topic-date">${compactDate(item)}</span><span class="topic-copy"><span class="topic-chip">${esc(label)}</span><b>${esc(item.title)}</b></span><span class="topic-arrow" aria-hidden="true">↗</span></a>`;
  const icons={national:'<path d="M4 20h16M6 20V9l6-5 6 5v11M9 12h6M9 16h6"/>',prefecture:'<path d="M4 20h16M6 20V6h12v14M9 10h2m2 0h2m-6 4h2m2 0h2"/>',municipal:'<path d="M3 20h18M5 20V10l7-5 7 5v10M9 20v-6h6v6"/>'};
  const group=(key,title,items,moreUrl,moreLabel)=>`<section class="topics-group ${key}"><header><div class="topics-group-title"><span class="topics-group-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[key]}</svg></span><h3>${title}</h3></div><a href="${moreUrl}">${moreLabel} →</a></header><div class="topic-list">${items.map(item=>topicItem(item,key==="municipal"?`${item.municipality}・${item.category}`:item.kind)).join("")}</div></section>`;
  if(topics?.national?.length&&topics?.prefecture?.length){
    $("#officialTopicsGrid").innerHTML=group("national","国からの最新情報",topics.national,"official.html","国の情報一覧")+group("prefecture","熊本県からの最新情報",topics.prefecture,"https://www.pref.kumamoto.jp/soshiki/1/274517.html","熊本県")+group("municipal","市町村からの最新発表",topics.municipalities.slice(0,8),"municipality-updates.html","全自治体");
    const retrieved=new Date(topics.metadata.retrievedAt);
    $("#officialTopicsUpdated").textContent=`公式サイト確認：${new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(retrieved)}`;
  }else{
    $("#officialTopicsGrid").innerHTML='<p class="topics-loading">最新トピックスを表示できません。公的情報一覧から一次情報をご確認ください。</p>';
  }
}

// メインメニューは各HTMLに静的に置いてある（JS無効でも動く）。ここでは組み立てない。

// ここはサイト全体の更新時刻ではなく、主要集計の基準日を示す。
// 自治体発信・避難所はそれぞれのページで、公式データの取得日時に置き換える。
if($("#updated")){
  const hq=window.HQ_LATEST;
  $("#updated").textContent=hq
    ? `県集計 ${dateLabel(hq.date)} ${hq.time}時点`
    : `会議記録 ${dateLabel(latest.date)}時点`;
}
if($("#latest-title")){
  $("#latest-title").textContent=latest.headline;
  $("#latest-time").textContent=`${dateLabel(latest.date)} 第${latest.meeting}回会議時点`;
  $("#latestPdf").href=`meetings.html?meeting=${latest.meeting}`;
  $("#latest-stats").innerHTML=[["避難者",latest.stats.evacuees,"人"],["避難所",latest.stats.shelters,"か所"],["住家被害",latest.stats.homes,"棟"],["断水",latest.stats.waterOutages,"戸"]].map(([l,v,u])=>`<div><dt>${l}</dt><dd>${fmt(v)}<small>${u}</small></dd></div>`).join("");
}
const heroActions=document.querySelector(".summary-hero .hero-actions");
if(heroActions&&!heroActions.querySelector('a[href="municipality-updates.html"]'))heroActions.insertAdjacentHTML("afterbegin",'<a class="button official-feed-button" href="municipality-updates.html">市町村の公式発信を見る</a>');
const homeHero=document.querySelector(".summary-hero");
if(homeHero&&!homeHero.querySelector(".home-search")){
  document.body.classList.add("home-redesign");
  const heroTitle=homeHero.querySelector("h1");
  if(heroTitle)heroTitle.innerHTML='令和8年熊本地震<br><em>被災地のいまを知り、支援につなぐ</em>';
  const lead=homeHero.querySelector(".lead");
  if(lead)lead.textContent="火の国会議の現場情報と、県・市町村の一次情報を統合し、現在進行中の被災状況と支援の動きをお伝えします。";
  const icon=paths=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
  const categories=[
    ["避難・安全","避難所・道路・安全情報","shelters.html","sky",icon('<path d="M12 3 4.5 6v5.4c0 4.7 3.2 8 7.5 9.6 4.3-1.6 7.5-4.9 7.5-9.6V6L12 3Z"/><path d="m9 12 2 2 4-4"/>')],
    ["ライフライン","断水・給水・電気・ガス","#situationTitle","cyan",icon('<path d="M12 2.8S6.5 9.1 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.1 12 2.8 12 2.8Z"/><path d="M9.5 15.2a2.8 2.8 0 0 0 2.5 1.5"/>')],
    ["住まい・証明","住宅支援・罹災証明","guide.html","amber",icon('<path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z"/><path d="M9 20v-6h6v6M8 8.5h8"/>')],
    ["ごみ・生活","災害ごみ・入浴・暮らし","support.html","emerald",icon('<path d="M4 7h16M9 3h6l1 4H8l1-4ZM6.5 7l1 14h9l1-14M10 11v6M14 11v6"/>')],
    ["施設・学校","公共施設・学校・保育","municipality-updates.html","violet",icon('<path d="M3 10 12 5l9 5-9 5-9-5Z"/><path d="M6 12.2V17c3.5 2.4 8.5 2.4 12 0v-4.8M21 10v6"/>')],
    ["支援・制度","相談・給付・支援活動","affected.html","rose",icon('<path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z"/><path d="M8.5 12h7M12 8.5v7"/>')]
  ];
  const discovery=document.createElement("div");discovery.className="home-discovery";
  discovery.innerHTML=`<form class="home-search" action="timeline.html" role="search"><label for="homeSearch">アーカイブ内を検索</label><div>${icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>')}<input id="homeSearch" name="q" type="search" placeholder="地域名、避難所、断水、罹災証明など"><button type="submit">検索</button></div></form><nav class="visual-category-nav" aria-label="主要カテゴリ">${categories.map(([name,description,url,tone,svg])=>`<a href="${url}" class="tone-${tone}"><span class="visual-icon">${svg}</span><span><b>${name}</b><small>${description}</small></span><svg class="category-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a>`).join("")}</nav>`;
  homeHero.querySelector(".hero-copy")?.append(discovery);
}
if($("#casualtySummary")){
  // 人的被害はライフラインの数値と並べず、独立した枠で示す
  $("#casualtySummary").innerHTML=
    `<h3>人的被害</h3><div><p><span>人的被害（死亡を含む）</span><strong>${fmt(latest.stats.injured)}<small>人</small></strong></p>`+
    `<p><span>うち死者</span><strong>${fmt(latest.stats.deaths)}<small>人</small></strong></p></div>`+
    `<small>${dateLabel(latest.date)} 第${latest.meeting}回会議時点の県内合計。「人的被害」は死者を含む原資料の集計です。災害関連死の認定など、今後の調査により変動します。</small>`;
}
if($("#situationSnapshot")){
  const maxEvac=[...days].sort((a,b)=>b.stats.evacuees-a.stats.evacuees)[0],evacChange=latest.stats.evacuees-maxEvac.stats.evacuees;
  // 断水の内訳自治体は data/report-data.js の waterOutageAreas から出す（記載を忘れた日は範囲を断定しない）
  const waterAreas=latest.stats.waterOutageAreas;
  const waterAreaNote=waterAreas?.length
    ? `${waterAreas.map(n=>n.replace(/[市町村]$/,"")).join("・")}の${waterAreas.length}${[...new Set(waterAreas.map(n=>n.slice(-1)))].join("")}合計`
    : "会議資料に記載された県内の合計";
  $("#situationAsOf").textContent=`${dateLabel(latest.date)} 第${latest.meeting}回`;
  $("#situationPdf").href=encodeURI(latest.pdf);
  $("#situationSnapshot").innerHTML=`<article><span>最新会議の避難者</span><strong>${fmt(latest.stats.evacuees)}<small>人</small></strong><p>記録期間内最多の${dateLabel(maxEvac.date,false)}から ${fmt(Math.abs(evacChange))}人減</p></article><article><span>最新会議の開設避難所</span><strong>${fmt(latest.stats.shelters)}<small>か所</small></strong><p>${dateLabel(days[0].date,false)}の${fmt(days[0].stats.shelters)}か所から減少</p></article><article><span>住家被害</span><strong>${fmt(latest.stats.homes)}<small>棟</small></strong><p>最新資料の推定値。判定済み棟数とは定義が異なります</p></article><article><span>断水</span><strong>${fmt(latest.stats.waterOutages)}<small>戸</small></strong><p>${waterAreaNote}</p></article>`;
}

if($("#sectionLinks")){
  const links=[
    ["日ごとのまとめ","火の国会議から現場の変化を追う","timeline.html","日"],
    ["市町村の公式発信","7月28日以降の自治体発表を時系列で確認","municipality-updates.html","公"],
    ["自治体別に見る","被災市町村の情報を同じ基準で確認","municipalities.html","市"],
    ["議事録を読む","県の報告・災害VC・現地の声を回ごとに","meetings.html","録"]
  ];
  $("#sectionLinks").innerHTML=links.map(([h,p,u,m])=>`<a href="${u}"><span>${m}</span><div><h3>${h}</h3><p>${p}</p></div><b>→</b></a>`).join("");
  const icons={"日":'<svg viewBox="0 0 24 24"><path d="M6 3v3M18 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg>',"公":'<svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V9l6-5 6 5v11M9 12h6M9 15h6"/></svg>',"市":'<svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V6h8v14M14 10h4v10M9 9h2M9 13h2M9 17h2"/></svg>',"録":'<svg viewBox="0 0 24 24"><path d="M7 3h10v4H7zM5 5H3v16h14v-2M8 10h9M8 14h9M8 18h6M17 6h4v15H7"/></svg>'};
  $$("#sectionLinks>a>span").forEach(span=>{span.innerHTML=icons[span.textContent]||span.textContent});
}
const municipalitySummary=document.querySelector(".municipality-summary");
if(municipalitySummary&&!municipalitySummary.querySelector('a[href="municipality-updates.html"]'))municipalitySummary.querySelector(".municipality-caveat")?.insertAdjacentHTML("beforebegin",'<a class="button official-feed-button" href="municipality-updates.html">市町村公式発信の時系列を見る</a>');
const supporterNeeds=document.querySelector(".supporter-needs");
if(supporterNeeds&&!supporterNeeds.querySelector('a[href="volunteer-centers.html"]'))supporterNeeds.insertAdjacentHTML("afterbegin",'<a href="volunteer-centers.html"><span>VC</span><h3>災害ボランティアセンター</h3><p>自治体別に設置場所・活動状況・公式募集を確認</p><b>VC情報を見る →</b></a>');
const officialShortcut=document.querySelector(".official-shortcut");
if(officialShortcut&&!officialShortcut.querySelector('a[href="municipality-updates.html"]'))officialShortcut.insertAdjacentHTML("beforeend",'<a class="button ghost" href="municipality-updates.html">市町村の発信記録へ</a>');
if($("#audienceUpdates")){
  const recent=[...supportEvents].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  $("#audienceUpdates").innerHTML=recent.map(e=>`<article><time>${dateLabel(e.date)}</time><span>${supportCategories.find(c=>c.key===e.category)?.label||e.category}</span><h3>${e.title}</h3><p>${e.detail}</p><a href="${encodeURI(`${e.pdf}#page=${e.page}`)}" target="_blank" rel="noopener">会議資料 p.${e.page} ↗</a></article>`).join("");
}

const footer=document.querySelector("footer");
if(footer&&!document.querySelector(".site-directory")){
  const directory=document.createElement("section");directory.className="site-directory";directory.setAttribute("aria-label","サイト内リンク");
  directory.innerHTML=`<div><b>火の国会議</b><a href="timeline.html">日ごとのまとめ</a><a href="meetings.html">議事録（全文）</a></div><div><b>被災された方</b><a href="shelters.html">稼働避難所</a><a href="guide.html">制度・生活再建</a><a href="terms.html">災害用語集</a></div><div><b>支援する方</b><a href="volunteer-centers.html">災害ボランティアセンター</a><a href="support.html">支援分野別</a><a href="municipalities.html">自治体別</a><a href="supporters.html">支援者向け入口</a></div><div><b>一次情報・出典</b><a href="municipality-updates.html">市町村の公式発信</a><a href="official.html">国・熊本県・市町村</a><a href="meetings.html">火の国会議 原本PDF</a><a href="https://portal.bousai.pref.kumamoto.jp/" target="_blank" rel="noopener">防災情報くまもと ↗</a></div>`;
  footer.before(directory);
}
if($("#recentUpdates")) $("#recentUpdates").innerHTML=[...days].reverse().slice(0,3).map(d=>`<article><time datetime="${d.date}">${dateLabel(d.date)}</time><span>第${d.meeting}回</span><h3>${d.headline}</h3><p>${d.summary}</p><a href="timeline.html">詳細を見る →</a></article>`).join("");
if($("#metricTabs")){
  let activeMetric="evacuees";
  // 集計定義が変わった箇所では折れ線をつながない。前後の値は直接比較できない。
  const metricBreakDates={outages:new Set(["2026-08-01"]),homes:new Set(["2026-08-03"])};
  const renderMetrics=()=>{$("#metricTabs").innerHTML=metrics.map(m=>`<button class="metric-button ${m.key===activeMetric?"active":""}" data-key="${m.key}" aria-pressed="${m.key===activeMetric}"><span>${m.label}</span><strong>${statDisplay(latest,m.key)}</strong>${latest.stats[m.key]==null?"":` ${m.unit}`}</button>`).join("");$$('.metric-button').forEach(b=>b.onclick=()=>{activeMetric=b.dataset.key;renderMetrics();renderChart()})};
  // 変化量の起点(baseIdx)は指標ごとに違う（住家被害は7/31〜、断水は8/3〜）。
  // 「記録開始比」だと全期間の変化に見えるので、比較の起点になった日を表示する。
  const renderChart=()=>{const metric=metrics.find(m=>m.key===activeMetric),values=days.map(d=>d.stats[activeMetric]),valid=values.filter(v=>v!=null),max=Math.max(...valid)*1.12,W=1000,H=220,pad=22,pts=values.map((v,i)=>v==null?null:{x:pad+i*(W-pad*2)/(values.length-1),y:H-pad-(v/max)*(H-pad*2),v});const segs=[];let cur=[];pts.forEach((p,i)=>{if(metricBreakDates[activeMetric]?.has(days[i].date)&&cur.length){segs.push(cur);cur=[]}if(p)cur.push(p);else if(cur.length){segs.push(cur);cur=[]}});if(cur.length)segs.push(cur);$("#chart").innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="M${pad} ${H-pad}H${W-pad}" stroke="#d9ded8"/>${segs.map(s=>`<polyline fill="none" stroke="${metric.color}" stroke-width="5" points="${s.map(p=>`${p.x},${p.y}`).join(' ')}"/>`).join('')}${pts.map(p=>p?`<g><circle cx="${p.x}" cy="${p.y}" r="7" fill="#fff" stroke="${metric.color}" stroke-width="4"/><text x="${p.x}" y="${p.y-16}" text-anchor="middle" font-size="13">${fmt(p.v)}</text></g>`:'').join('')}</svg>`;$("#chartDates").style.gridTemplateColumns=`repeat(${days.length},1fr)`;$("#chartDates").innerHTML=days.map(d=>`<span>${dateLabel(d.date,false)}</span>`).join('');$("#chartLabel").textContent=metric.label;$("#chartLatest").textContent=latest.stats[activeMetric]==null?statDisplay(latest,activeMetric):`${fmt(latest.stats[activeMetric])} ${metric.unit}`;const baseIdx=values.findIndex(v=>v!=null),diff=valid.at(-1)-valid[0],hasDefinitionBreak=metricBreakDates[activeMetric]?.size;$("#chartChange").textContent=latest.stats[activeMetric]==null?"最新報告は定量値なし":hasDefinitionBreak?"定義変更箇所で折れ線を分割":`${dateLabel(days[baseIdx].date,false)}比 ${diff>0?"+":""}${fmt(diff)} ${metric.unit}`;if($("#trendTable"))$("#trendTable").innerHTML=`<table><thead><tr><th>会議日</th><th>会議</th><th>${metric.label}</th></tr></thead><tbody>${days.map(d=>`<tr><td>${dateLabel(d.date,false)}</td><td>第${d.meeting}回</td><td>${d.stats[activeMetric]==null?statDisplay(d,activeMetric):`${fmt(d.stats[activeMetric])} ${metric.unit}`}</td></tr>`).join('')}</tbody></table>`};
  renderMetrics();renderChart();
}

if($("#timelineList")){
  const timelineTools=document.querySelector(".timeline-tools");
  if(timelineTools&&!document.querySelector(".timeline-reading-guide"))timelineTools.insertAdjacentHTML("beforebegin",`<aside class="timeline-reading-guide" aria-label="日々の記録の読み方"><div><span>1</span><p><b>日付と発災日</b><small>いつの記録かを確認</small></p></div><div><span>2</span><p><b>状況と主な対応</b><small>数値と動きを大きく表示</small></p></div><div><span>3</span><p><b>現場報告と原資料</b><small>詳しい根拠まで確認できます</small></p></div></aside>`);
  const topics=["すべて",...new Set(days.flatMap(d=>d.topics))];let activeTopic="すべて";
  const dailyDetails=d=>{const support=supportEvents.filter(event=>event.date===d.date),municipal=municipalEvents.filter(event=>event.date===d.date);return support.length?support:municipal.map(event=>({...event,category:event.category,page:event.page||1,pdf:event.pdf||d.pdf}))};
  const metricDefs=[["evacuees","避難者","人"],["shelters","避難所","か所"],["deaths","死者","人"],["injured","人的被害","人"],["homes","住家被害","棟"],["waterOutages","断水","戸"]];
  const changeLabel=(d,key,value)=>{const index=days.findIndex(day=>day.date===d.date),previous=days[index-1],definitionChanged=(key==="homes"&&d.date==="2026-08-03")||(key==="outages"&&d.date==="2026-08-01");if(definitionChanged)return"集計定義変更";const before=previous?.stats?.[key];if(typeof value!=="number"||typeof before!=="number")return"会議時点の値";const diff=value-before;return`前日比 ${diff>0?"+":""}${fmt(diff)}`};
  const renderStats=d=>`<section class="daily-snapshot" aria-label="${dateLabel(d.date,false)}の主な数値"><header><b>この日の状況</b><span>火の国会議の報告時点</span></header><dl>${metricDefs.map(([key,label,unit])=>{const value=d.stats[key];return value==null?"":`<div><dt>${label}</dt><dd>${fmt(value)}<small>${unit}</small></dd><span>${changeLabel(d,key,value)}</span></div>`}).join("")}${d.stats.outageStatus?`<div><dt>停電</dt><dd class="status-value">${d.stats.outageStatus}</dd><span>0件とは扱いません</span></div>`:""}</dl></section>`;
  const renderDetails=d=>{const events=dailyDetails(d);if(!events.length)return"";const cards=events.map(event=>{const category=supportCategories.find(item=>item.key===event.category)?.label||event.category;return `<article><div><span>${category}</span>${event.areas?.length?`<small>${event.areas.join("・")}</small>`:""}</div><h4>${event.title}</h4><p>${event.detail}</p><a href="${encodeURI(`${event.pdf}#page=${event.page}`)}" target="_blank" rel="noopener">議事録 p.${event.page} ↗</a></article>`});return `<section class="daily-field-report"><header><div><b>この日の現場報告</b><span>議事録で共有された支援・課題</span></div><strong>${events.length}件</strong></header><div>${cards.slice(0,4).join("")}</div>${cards.length>4?`<details><summary>その他${cards.length-4}件の報告を見る</summary><div>${cards.slice(4).join("")}</div></details>`:""}</section>`};
  const renderTimeline=()=>{const q=$("#search").value.trim().toLowerCase(),filtered=[...days].reverse().filter(d=>{const detailText=dailyDetails(d).map(event=>`${event.title}${event.detail}${event.areas?.join("")||""}`).join("");return(activeTopic==="すべて"||d.topics.includes(activeTopic))&&`${d.headline}${d.summary}${d.actions.join('')}${d.note}${d.topics.join('')}${detailText}`.toLowerCase().includes(q)});$("#timelineList").innerHTML=filtered.map(d=>`<article class="day-card"><div class="date-block"><time datetime="${d.date}">${dateLabel(d.date)}</time><strong>発災 ${d.disasterDay}日目</strong><span>第${d.meeting}回 火の国会議</span></div><div class="day-content"><div class="tags">${d.topics.map(t=>`<span class="tag">${t}</span>`).join('')}</div><h3>${d.headline}</h3><p>${d.summary}</p>${renderStats(d)}<section class="daily-actions"><header><b>この日に進んだ対応</b><span>前日からの主な動き</span></header><ul class="actions">${d.actions.map(a=>`<li>${a}</li>`).join('')}</ul></section>${renderDetails(d)}<div class="related-official"><span>関連する自治体の公式情報</span><div>${d.areas.map(name=>{const m=municipalities.find(x=>x.name===name);return `<a href="${m.url}" target="_blank" rel="noopener">${name} ↗</a>`}).join('')}</div></div><p class="day-note">注：${d.note}</p><div class="day-links"><a class="day-link" href="meetings.html?meeting=${d.meeting}">第${d.meeting}回の議事録を読む →</a><a class="day-link sub" href="${encodeURI(d.pdf)}" target="_blank" rel="noopener">原本PDF ↗</a></div></div></article>`).join('');$("#noResults").hidden=filtered.length>0};
  const renderFilters=()=>{$("#topicFilters").innerHTML=topics.map(t=>`<button class="filter ${t===activeTopic?"active":""}" data-topic="${t}">${t}</button>`).join('');$$('.filter').forEach(b=>b.onclick=()=>{activeTopic=b.dataset.topic;renderFilters();renderTimeline()})};
  const initialQuery=new URLSearchParams(location.search).get("q");
  if(initialQuery)$("#search").value=initialQuery;
  $("#search").addEventListener("input",renderTimeline);renderFilters();renderTimeline();
}

if($("#archive")) $("#archive").innerHTML=[...days].reverse().map(d=>`<a class="archive-row" href="${encodeURI(d.pdf)}" target="_blank" rel="noopener"><time datetime="${d.date}">${dateLabel(d.date,false)}</time><span>第${d.meeting}回</span><b>${d.headline}</b><i>PDFを開く ↗</i></a>`).join('');
if($("#situationSource")) $("#situationSource").textContent=`出典：第${days[0].meeting}〜${latest.meeting}回 火の国会議資料。速報値を含み、調査・判定の進展で変動します。`;

if($("#officialPrimary")){
  const officialPrimary=$("#officialPrimary");
  if(!document.querySelector(".official-reading-guide"))officialPrimary.insertAdjacentHTML("beforebegin",`<aside class="official-reading-guide" aria-label="公的情報の確認方法"><div><span>国</span><p><b>政府の対応・支援制度</b><small>内閣府などの公式資料</small></p></div><div><span>県</span><p><b>熊本県全体の被害状況</b><small>災害対策本部の会議資料</small></p></div><div><span>市</span><p><b>避難・申請・地域情報</b><small>お住まいの市町村で確認</small></p></div></aside>`);
  $("#officialPrimary").innerHTML=officialSources.map(s=>`<a class="official-card" href="${s.url}" target="_blank" rel="noopener"><span>${s.level}</span><h3>${s.name}</h3><p>${s.description}</p><b>公式サイトを開く ↗</b></a>`).join('');
  const cabinet=document.createElement("section");cabinet.className="section official-section";cabinet.innerHTML=`<div class="hq-section-head"><div><p class="kicker">CABINET OFFICE</p><h2>内閣府の最新情報</h2><p>被害・政府対応のほか、非常災害対策本部と生活・生業再建支援チームの公式資料を確認できます。</p></div></div><div class="official-primary"><a class="official-card" href="https://www.bousai.go.jp/updates/r8kumamoto_jishin/status/index.html" target="_blank" rel="noopener"><span>8月7日 08:00現在</span><h3>被害状況・政府の対応</h3><p>内閣府の日次報告と過去分を確認できます。</p><b>公式資料一覧 ↗</b></a><a class="official-card" href="https://www.bousai.go.jp/updates/r8kumamoto_jishin/taisakukaigi.html" target="_blank" rel="noopener"><span>8月7日・第8回</span><h3>非常災害対策本会議</h3><p>政府の対応方針と省庁横断の取組資料です。</p><b>会議資料・議事録 ↗</b></a><a class="official-card" href="https://www.bousai.go.jp/updates/r8kumamoto_jishin/hisaisya_shien.html" target="_blank" rel="noopener"><span>8月7日・第6回</span><h3>生活・生業再建支援</h3><p>被災者生活と事業再建に関する政府チームの概要です。</p><b>支援チーム資料 ↗</b></a></div>`;
  $(".hq-meetings-section")?.before(cabinet);
  const renderMunicipalities=()=>{const q=$("#municipalitySearch").value.trim();$("#municipalityGrid").innerHTML=orderedMunicipalities.filter(m=>m.name.includes(q)).map(m=>`<a href="${m.url}" target="_blank" rel="noopener"><span>${m.name}</span><b>公式サイト ↗</b></a>`).join('')};
  $("#municipalitySearch").addEventListener("input",renderMunicipalities);renderMunicipalities();
}

if($("#municipalityDetail")){
  const municipalitySection=document.querySelector(".municipality-section");
  if(municipalitySection&&!document.querySelector(".municipality-reading-guide"))municipalitySection.insertAdjacentHTML("beforebegin",`<section class="municipality-reading-guide" aria-label="自治体別情報の見方"><div><span>1</span><p><b>自治体を選ぶ</b><small>検索または一覧からお住まいの地域を選択</small></p></div><div><span>2</span><p><b>被害状況を確認</b><small>熊本県の災害対策本部資料による数値</small></p></div><div><span>3</span><p><b>地域の動きを見る</b><small>会議記録と自治体公式サイトへ移動</small></p></div></section>`);
  let selectedMunicipality=new URLSearchParams(location.search).get("name")||orderedMunicipalities[0].name;if(!municipalities.some(m=>m.name===selectedMunicipality))selectedMunicipality=orderedMunicipalities[0].name;
  const renderDetail=()=>{const municipality=municipalities.find(m=>m.name===selectedMunicipality),municipalityId=municipalityReconstructionIds[selectedMunicipality],events=municipalEvents.filter(e=>e.areas.includes(selectedMunicipality)).sort((a,b)=>b.date.localeCompare(a.date)),specific=events.filter(e=>e.category!=="制度"),latestDate=events[0]?.date,featured=selectedMunicipality==="宇土市"?`<div class="municipality-feature-list"><a class="municipality-feature" href="uto-housing.html"><span class="municipality-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m3 12 9-8 9 8v9H3Z"/><path d="M8 21v-6h8v6M15 8l4-4 2 2-4 4"/></svg></span><span><small>宇土市｜住まいの重要情報</small><b>住まいの相談・再建支援ガイド</b><em>応急修理・みなし仮設・相談窓口を、現在の状況から確認</em></span><i>案内を見る →</i></a><a class="municipality-feature" href="uto-waste.html"><span class="municipality-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM8 7V4h8v3M9 11v5m6-5v5"/></svg></span><span><small>宇土市｜暮らしの重要情報</small><b>災害ごみの持ち込み案内</b><em>ごみの種類から持込先を探す・仮置場と入場券配布場所の地図を見る</em></span><i>案内を見る →</i></a></div>`:"";$("#municipalityDetail").innerHTML=`<header><div><p>自治体別 災害・支援情報</p><h3>${selectedMunicipality}</h3><span>会議記録 ${events.length}件${latestDate?` ｜ 最終確認 ${dateLabel(latestDate)}`:''}</span></div><a href="${municipality.url}" target="_blank" rel="noopener">${selectedMunicipality}公式サイト ↗</a></header><aside class="municipality-reconstruction-entry"><div><b>暮らしの再建</b><p>住まい、お金、手続き、健康、家族、仕事など、被災後の困りごとから必要な情報を整理できます。</p></div><a href="reconstruction.html?municipality=${municipalityId}">${selectedMunicipality}の情報を引き継いで確認する →</a></aside>${featured}<div class="hq-panel" id="hqPanel"></div><div class="municipality-scope"><b>掲載範囲</b><p>下の一覧は会議議事録で自治体名が明記された事項のみです。上の被害状況は県災害対策本部会議の資料によるもので、出所が異なります。</p></div>${specific.length?`<div class="municipal-category-summary">${[...new Set(specific.map(e=>e.category))].map(c=>`<span>${c}<b>${specific.filter(e=>e.category===c).length}</b></span>`).join('')}</div>`:`<div class="municipality-empty"><b>個別情報は確認できていません</b><p>災害救助法の適用は確認されています。公式サイトで最新情報をご確認ください。</p></div>`}<div class="municipal-events">${events.map(e=>`<article><div class="event-meta"><time>${dateLabel(e.date)}</time><span>${e.category}</span></div><h4>${e.title}</h4><p>${e.detail}</p><a href="${encodeURI(`${e.pdf}#page=${e.page}`)}" target="_blank" rel="noopener">第${e.meeting}回議事録 p.${e.page} ↗</a></article>`).join('')}</div>`;
    // 県公式データは hq.js が描く。読み込めていなくても会議由来の情報は出る。
    window.renderHqPanel?.(selectedMunicipality)};
  const renderPicker=()=>{const q=$("#municipalityDashboardSearch").value.trim(),matches=orderedMunicipalities.filter(m=>m.name.includes(q));$("#municipalityPickerList").innerHTML=matches.map(m=>`<button type="button" aria-pressed="${m.name===selectedMunicipality}" class="${m.name===selectedMunicipality?'active':''}" data-name="${m.name}"><span>${m.name}</span><b>${municipalEvents.filter(e=>e.areas.includes(m.name)).length}件</b></button>`).join('');$$('#municipalityPickerList button').forEach(b=>b.onclick=()=>{selectedMunicipality=b.dataset.name;history.replaceState(null,'',`?name=${encodeURIComponent(selectedMunicipality)}`);renderPicker();renderDetail()})};
  $("#municipalityDashboardSearch").addEventListener("input",renderPicker);renderPicker();renderDetail();
}

if($("#supportDetail")){
  let selectedSupport=new URLSearchParams(location.search).get("category")||supportCategories[0].key;
  if(!supportCategories.some(c=>c.key===selectedSupport))selectedSupport=supportCategories[0].key;
  const renderSupportDetail=()=>{const category=supportCategories.find(c=>c.key===selectedSupport),events=supportEvents.filter(e=>e.category===selectedSupport).sort((a,b)=>b.date.localeCompare(a.date));$("#supportDetail").innerHTML=`<header><p>支援分野別情報</p><h2>${category.label}</h2><span>${category.description} ｜ 会議記録 ${events.length}件</span></header><div class="support-scope"><b>掲載基準</b><p>保存済み議事録に明記された活動・ニーズのみ。件数や人数は会議報告時点で、支援全体を網羅するものではありません。</p></div><div class="support-events">${events.map(e=>`<article><div class="event-meta"><time>${dateLabel(e.date)}</time>${e.areas.length?`<span>${e.areas.join("・")}</span>`:""}</div><h3>${e.title}</h3><p>${e.detail}</p><a href="${encodeURI(`${e.pdf}#page=${e.page}`)}" target="_blank" rel="noopener">第${e.meeting}回議事録 p.${e.page} ↗</a></article>`).join("")}</div>`};
  const renderSupportPicker=()=>{$("#supportCategoryList").innerHTML=supportCategories.map(c=>`<button type="button" aria-pressed="${c.key===selectedSupport}" class="${c.key===selectedSupport?"active":""}" data-key="${c.key}"><span>${c.label}</span><b>${supportEvents.filter(e=>e.category===c.key).length}件</b><small>${c.description}</small></button>`).join("");$$("#supportCategoryList button").forEach(b=>b.onclick=()=>{selectedSupport=b.dataset.key;history.replaceState(null,"",`?category=${selectedSupport}`);renderSupportPicker();renderSupportDetail()})};
  renderSupportPicker();renderSupportDetail();
}

}catch(err){ showDataError(err); }
