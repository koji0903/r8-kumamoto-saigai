(()=>{
  // Google Analytics is loaded from this shared site script so every content
  // page, including future pages using org-site.js, receives the same tag.
  const googleTagId='G-ZPDRHTGZCR';
  if(!window.__yokataiGoogleTagLoaded){
    window.__yokataiGoogleTagLoaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
    window.gtag('js',new Date());
    window.gtag('config',googleTagId);
    const googleTagScript=document.createElement('script');
    googleTagScript.async=true;
    googleTagScript.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleTagId)}`;
    document.head.append(googleTagScript);
  }
  const path=location.pathname.split('/').pop()||'index.html';
  document.body.classList.add('organization-site');
  document.body.classList.add('illustrated-site');
  document.body.classList.add(`page-${path.replace(/\.html$/,'').replace(/[^a-z0-9-]/g,'-')||'index'}`);
  if(path==='index.html'){
    document.title='一般社団法人よか隊ネット熊本｜災害支援から、これからの地域づくりへ。';
    const description=document.querySelector('meta[name="description"]');
    if(description)description.content='一般社団法人よか隊ネット熊本は、2016年熊本地震をきっかけに活動を開始した災害支援・地域支援団体です。令和8年熊本地震の生活再建情報、支援情報、防災・地域づくりに関する情報を提供しています。';
  }
  const seoTitles={'index.html':'ホーム','disaster.html':'令和8年熊本地震 支援情報','affected.html':'困りごとから探す','guide.html':'制度・生活支援','shelters.html':'開設中の避難所','municipalities.html':'自治体別情報','municipality-updates.html':'市町村からの公式発信','official.html':'国・県の公的情報','reconstruction.html':'暮らしの再建','reconstruction-money.html':'お金・支払い','reconstruction-documents.html':'証明・申請','reconstruction-health-care.html':'健康・介護','reconstruction-family.html':'子ども・家族','reconstruction-work-business.html':'仕事・事業','reconstruction-agriculture-fishery.html':'農業・漁業','supporters.html':'支援する方へ','support.html':'支援分野別','volunteer-centers.html':'災害ボランティアセンター','alert-channels.html':'お知らせの受け取り方','timeline.html':'日々の記録','meetings.html':'火の国会議 議事録','official-timeline.html':'発信でたどる被災地の局面','official-water-recovery.html':'水の復旧と、統計に表れない水の問題','official-response-tracks.html':'5つの対応の流れ','terms.html':'災害用語集','about.html':'私たちについて','join.html':'支援・協力','contact.html':'お問い合わせ','privacy.html':'プライバシーポリシー','accessibility.html':'アクセシビリティ方針','404.html':'ページが見つかりません','uto-waste.html':'宇土市 災害ごみ持ち込み案内','uto-housing.html':'宇土市 住まいの相談・再建支援','uto-bulletin.html':'宇土市 広報うと 災害臨時号vol.1','hq-kumamoto.html':'熊本市 災害対策本部会議','hq-yatsushiro.html':'八代市 災害対策本部会議'};
  const canonical=path==='index.html'?'https://www.yokatainet.jp/':`https://www.yokatainet.jp/${path}`;
  const graph=[{'@type':'Organization','@id':'https://www.yokatainet.jp/#organization',name:'一般社団法人よか隊ネット熊本',url:'https://www.yokatainet.jp/',logo:'https://www.yokatainet.jp/yokatai-logo.png',address:{'@type':'PostalAddress',postalCode:'869-0404',addressRegion:'熊本県',addressLocality:'宇土市',streetAddress:'走潟町2235'},telephone:'090-2719-4037',email:'info.yokatai@gmail.com'},{'@type':'WebSite','@id':'https://www.yokatainet.jp/#website',url:'https://www.yokatainet.jp/',name:'一般社団法人よか隊ネット熊本',publisher:{'@id':'https://www.yokatainet.jp/#organization'},inLanguage:'ja'}];
  if(path!=='index.html')graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'ホーム',item:'https://www.yokatainet.jp/'},{'@type':'ListItem',position:2,name:seoTitles[path]||document.title.split('｜')[0],item:canonical}]});
  const structured=document.createElement('script');structured.type='application/ld+json';structured.textContent=JSON.stringify({'@context':'https://schema.org','@graph':graph});document.head.append(structured);
  const supportPages=['disaster.html','affected.html','guide.html','shelters.html','terms.html','municipalities.html','municipality-updates.html','official.html','uto-waste.html','uto-housing.html','uto-bulletin.html','hikawa-support.html','support.html','supporters.html','volunteer-centers.html','alert-channels.html'];
  const reconstructionPages=['reconstruction.html','reconstruction-money.html','reconstruction-documents.html','reconstruction-health-care.html','reconstruction-family.html','reconstruction-work-business.html','reconstruction-agriculture-fishery.html','reconstruction-official.html'];
  const activityPages=['timeline.html','meetings.html','official-timeline.html','official-water-recovery.html','official-response-tracks.html','hq-kumamoto.html','hq-yatsushiro.html'];
  const organizationPages=['about.html','join.html','contact.html','privacy.html','accessibility.html'];
  const standardMotionPages=['join.html','contact.html','supporters.html'];
  const storyMotionPages=['index.html','about.html'];
  const motionPreset=storyMotionPages.includes(path)?'story':standardMotionPages.includes(path)?'standard':'subtle';
  document.body.dataset.motionPreset=motionPreset;
  const affectedPages=['affected.html','guide.html','shelters.html','terms.html','municipalities.html','municipality-updates.html','official.html','alert-channels.html','uto-waste.html','uto-housing.html','uto-bulletin.html'];
  const supporterPages=['supporters.html','support.html','volunteer-centers.html'];
  const active=key=>key==='home'?path==='index.html':key==='support'?supportPages.includes(path):key==='portal'?path==='disaster.html':key==='affected'?affectedPages.includes(path):key==='supporters'?supporterPages.includes(path):key==='reconstruction'?reconstructionPages.includes(path):key==='activity'?activityPages.includes(path):key==='organization'?organizationPages.includes(path):false;
  const currentAttr=key=>active(key)?' aria-current="page"':'';
  const currentClass=key=>active(key)?' is-current':'';
  const header=document.querySelector('.site-header');
  if(header){header.innerHTML=`<div class="org-header-inner"><a class="brand" href="index.html"><img class="org-logo" src="yokatai-logo.png" alt="一般社団法人よか隊ネット熊本"><span>熊本の地域と暮らしを支える<br><b>情報・支援プラットフォーム</b></span></a><button class="org-menu-toggle" type="button" aria-expanded="false" aria-controls="org-global-nav"><span aria-hidden="true"></span><b>メニュー</b></button><nav id="org-global-nav" aria-label="メインメニュー"><a class="org-nav-home" href="index.html"${currentAttr('home')}>ホーム</a><details class="org-nav-group org-nav-emergency${currentClass('support')}"><summary>令和8年熊本地震<span aria-hidden="true">⌄</span></summary><div class="org-mega-menu"><div class="org-mega-intro"><b>災害・支援情報</b><p>いま必要な情報を、目的から探せます。</p><a href="disaster.html">支援情報トップへ →</a></div><div class="org-mega-links"><a href="affected.html"><b>困りごとから探す</b><small>被災された方・ご家族へ</small></a><a href="shelters.html"><b>避難所を確認</b><small>開設中の施設と地図</small></a><a href="municipalities.html"><b>自治体別情報</b><small>お住まいの地域から探す</small></a><a href="official.html"><b>公的情報</b><small>国・県・市町村の発信</small></a><a href="supporters.html"><b>支援する方へ</b><small>支援方法・ボランティア</small></a><a href="volunteer-centers.html"><b>災害ボランティアセンター</b><small>各地の開設状況と募集</small></a><a href="alert-channels.html"><b>お知らせの受け取り方</b><small>公式LINE・メール・防災無線</small></a></div></div></details><a class="org-nav-reconstruction" href="reconstruction.html"${currentAttr('reconstruction')}>暮らしの再建</a><details class="org-nav-group${currentClass('activity')}"><summary>記録・資料<span aria-hidden="true">⌄</span></summary><div class="org-mega-menu org-mega-compact org-mega-records"><div class="org-mega-intro"><b>被災地の記録</b><p>原資料そのものと、そこから読み取れることの両方を置いています。</p></div><div class="org-mega-links"><b class="org-mega-head">原資料をたどる</b><a href="timeline.html"><b>日々の記録</b><small>状況と支援経過</small></a><a href="meetings.html"><b>火の国会議 議事録</b><small>会議記録と原本PDF</small></a><a href="hq-kumamoto.html"><b>熊本市 災害対策本部会議</b><small>市の資料を回ごとに整理</small></a><a href="hq-yatsushiro.html"><b>八代市 災害対策本部会議</b><small>市の資料を回ごとに整理</small></a><a href="municipality-updates.html"><b>市町村の公式発信</b><small>自治体発表を時系列で確認</small></a><a href="terms.html"><b>災害用語集</b><small>難しい言葉を調べる</small></a><b class="org-mega-head">発信から読み解く</b><a href="official-timeline.html"><b>被災地の局面</b><small>何が話題になっていたかの移り変わり</small></a><a href="official-water-recovery.html"><b>水の復旧</b><small>断水戸数に表れない水の問題</small></a><a href="official-response-tracks.html"><b>5つの対応の流れ</b><small>断水・罹災証明・災害VC・ごみ・相談</small></a></div></div></details><details class="org-nav-group${currentClass('organization')}"><summary>団体情報<span aria-hidden="true">⌄</span></summary><div class="org-mega-menu org-mega-compact org-mega-right"><div class="org-mega-intro"><b>よか隊ネット熊本</b><p>活動、連携、お問い合わせはこちら。</p></div><div class="org-mega-links"><a href="about.html"><b>私たちについて</b><small>理念・活動・団体概要</small></a><a href="join.html"><b>支援・協力する</b><small>一緒にできること</small></a><a href="contact.html"><b>お問い合わせ</b><small>メール・電話</small></a><a href="privacy.html"><b>プライバシーポリシー</b><small>個人情報の取り扱い</small></a></div></div></details></nav></div>`;
    header.querySelector('.brand')?.insertAdjacentHTML('afterend','<button class="org-search-toggle" type="button" data-site-search-open aria-expanded="false"><span aria-hidden="true">⌕</span><b>検索</b></button>');
    const searchStyle=document.createElement('link');searchStyle.rel='stylesheet';searchStyle.href='site-search.css?v=20260821-1';document.head.append(searchStyle);
    const searchScript=document.createElement('script');searchScript.src='site-search.js?v=20260821-1';searchScript.defer=true;document.head.append(searchScript);
    const primaryNav=header.querySelector('#org-global-nav');
    const emergencyMenu=primaryNav?.querySelector('.org-nav-emergency');
    emergencyMenu?.insertAdjacentHTML('beforebegin',`<a class="org-nav-portal" href="disaster.html"${currentAttr('portal')}>支援情報</a><a class="org-nav-audience org-nav-affected" href="affected.html"${currentAttr('affected')}><span>被災された方</span><small>困りごとから探す</small></a><a class="org-nav-audience org-nav-supporters" href="supporters.html"${currentAttr('supporters')}><span>支援する方</span><small>活動前に確認</small></a>`);
    emergencyMenu?.remove();
    primaryNav?.querySelector('.org-nav-reconstruction')?.after(primaryNav.querySelector('.org-nav-supporters'));
    const toggle=header.querySelector('.org-menu-toggle'),nav=header.querySelector('nav');
    toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true',next=!open;toggle.setAttribute('aria-expanded',String(next));nav.classList.toggle('is-open',next);if(next)nav.querySelector('.org-nav-group.is-current')?.setAttribute('open','')});
    nav?.addEventListener('click',event=>{if(event.target.closest('a')){toggle?.setAttribute('aria-expanded','false');nav.classList.remove('is-open');nav.querySelectorAll('details[open]').forEach(item=>item.removeAttribute('open'))}});
    header.addEventListener('keydown',event=>{if(event.key==='Escape'){header.querySelectorAll('details[open]').forEach(item=>item.removeAttribute('open'));toggle?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open')}});
    document.addEventListener('click',event=>{if(!header.contains(event.target))header.querySelectorAll('details[open]').forEach(item=>item.removeAttribute('open'))});
    header.querySelectorAll('.org-nav-group').forEach(group=>group.addEventListener('toggle',()=>{if(group.open)header.querySelectorAll('.org-nav-group[open]').forEach(other=>{if(other!==group)other.removeAttribute('open')})}));
    if(path!=='index.html'&&organizationPages.includes(path))header.insertAdjacentHTML('afterend',`<div class="org-context-bar org-context-general"><div><p><a href="index.html">ホーム</a><span aria-hidden="true">›</span><b>団体情報</b></p><nav aria-label="団体情報のショートカット"><a href="about.html">私たちについて</a><a href="join.html">支援・協力</a><a href="contact.html">お問い合わせ</a></nav></div></div>`);
    else if(path!=='index.html'&&path!=='404.html')header.insertAdjacentHTML('afterend',`<div class="org-context-bar"><div><p><b>令和8年熊本地震</b><span>立場や目的を選ぶと、必要な情報へ移動できます</span></p><nav aria-label="立場と目的から探す"><a href="affected.html"${currentAttr('affected')}>被災された方</a><a href="supporters.html"${currentAttr('supporters')}>支援する方</a><a href="municipalities.html">地域から探す</a><a href="official.html">公式情報を確認</a></nav></div></div>`)
  }
  if(path!=='index.html'){
    const supportParent=supportPages.includes(path);
    const reconstructionParent=reconstructionPages.includes(path);
    const detailParent=['uto-waste.html','uto-housing.html','uto-bulletin.html','hikawa-support.html'].includes(path);
    const crumbs=[['index.html','ホーム']];
    if(supportParent&&path!=='disaster.html')crumbs.push(['disaster.html','令和8年熊本地震']);
    if(reconstructionParent&&path!=='reconstruction.html')crumbs.push(['reconstruction.html','暮らしの再建']);
    if(detailParent)crumbs.push(['municipalities.html','自治体別情報']);
    if(organizationPages.includes(path)&&path!=='about.html')crumbs.push(['about.html','団体情報']);
    crumbs.push(['',seoTitles[path]||document.querySelector('h1')?.textContent.trim()||'現在のページ']);
    const breadcrumb=`<nav class="site-breadcrumb" aria-label="パンくずリスト"><ol>${crumbs.map(([href,label],index)=>`<li>${href&&index<crumbs.length-1?`<a href="${href}">${label}</a>`:`<span aria-current="page">${label}</span>`}</li>`).join('')}</ol></nav>`;
    const context=document.querySelector('.org-context-bar');
    (context||header)?.insertAdjacentHTML('afterend',breadcrumb);
  }
  if(path==='disaster.html'){
    document.title='令和8年熊本地震 支援情報ポータル｜一般社団法人よか隊ネット熊本';
    const main=document.querySelector('main');
    const previousTitle=main?.querySelector('h1');
    if(previousTitle){const sectionTitle=document.createElement('h2');[...previousTitle.attributes].forEach(attribute=>sectionTitle.setAttribute(attribute.name,attribute.value));sectionTitle.innerHTML=previousTitle.innerHTML;previousTitle.replaceWith(sectionTitle)}
    main?.insertAdjacentHTML('afterbegin',`<section class="disaster-portal" aria-labelledby="disaster-portal-title"><div class="disaster-portal-heading"><p class="kicker">2026 KUMAMOTO EARTHQUAKE</p><h1 id="disaster-portal-title">令和8年熊本地震 <em>支援情報ポータル</em></h1><p>被災された方、地域の方、支援に関わる方が、必要な情報へ迷わず進むための入口です。</p></div><div class="disaster-portal-priority"><p>立場・目的から選ぶ</p><a href="affected.html"><span>被災された方・ご家族</span><b>困りごとから情報を探す</b><i>→</i></a><a href="reconstruction.html"><span>暮らし全体を整理したい方</span><b>暮らしの再建ナビを開く</b><i>→</i></a><a href="supporters.html"><span>支援する方・支援団体</span><b>現場ニーズと活動前の確認</b><i>→</i></a></div><nav class="disaster-service-grid" aria-label="令和8年熊本地震の情報メニュー"><a href="shelters.html"><span>01</span><b>避難所</b><small>開設中の避難所を確認</small></a><a href="municipalities.html"><span>02</span><b>自治体別情報</b><small>市町村ごとの被害・支援</small></a><a href="municipality-updates.html"><span>03</span><b>市町村の公式発信</b><small>自治体発表を時系列で確認</small></a><a href="timeline.html"><span>04</span><b>日ごとの動き</b><small>被災地の状況と支援経過</small></a><a href="meetings.html"><span>05</span><b>火の国会議 議事録</b><small>現場報告と原資料</small></a><a href="official.html"><span>06</span><b>国・県の公式情報</b><small>公的機関の一次情報</small></a><a href="volunteer-centers.html"><span>07</span><b>ボランティア</b><small>災害VCの募集・活動状況</small></a><a href="supporters.html"><span>08</span><b>支援する方へ</b><small>現場ニーズと支援情報</small></a></nav></section>`);
    const policy=document.querySelector('.archive-source-policy');
    const portal=document.querySelector('.disaster-portal');
    if(policy&&portal)portal.after(policy);
  }
  if(path==='about.html'){
    document.body.classList.add('about-page');
    const hero=document.querySelector('.org-hero');
    hero?.classList.add('about-hero');
    hero?.querySelector('div')?.insertAdjacentHTML('beforeend',`<div class="about-hero-signature"><span>2016</span><i aria-hidden="true"></i><span>2020</span><i aria-hidden="true"></i><span>2026</span><b>支援から、つながりへ。</b></div>`);
    const sections=document.querySelectorAll('.org-section');
    sections[0]?.classList.add('about-intro');
    sections[1]?.classList.add('about-history');
    sections[2]?.classList.add('about-values');
    sections[3]?.classList.add('about-profile');
    const intro=sections[0]?.querySelector('div');
    intro?.insertAdjacentHTML('afterbegin',`<div class="about-intro-heading"><p class="kicker">WHO WE ARE</p><span>災害の規模ではなく、<br>一人ひとりの暮らしを見る。</span></div>`);
    const cards=sections[2]?.querySelectorAll('.org-card');
    ['暮','結','支','届'].forEach((mark,index)=>cards[index]?.insertAdjacentHTML('afterbegin',`<span class="value-mark" aria-hidden="true">${mark}</span>`));
  }
  if(path==='join.html'){
    document.body.classList.add('join-page');
    const hero=document.querySelector('.org-hero');
    hero?.classList.add('join-hero');
    hero?.querySelector('div')?.insertAdjacentHTML('beforeend',`<div class="join-hero-panel"><span aria-hidden="true">＋</span><p><b>できることを、必要な場所へ。</b><br>それぞれの立場や得意なことを生かした関わり方を一緒に考えます。</p></div>`);
    const section=document.querySelector('.org-section');
    section?.classList.add('join-section');
    const inner=section?.querySelector(':scope > div');
    inner?.insertAdjacentHTML('afterbegin',`<div class="join-heading"><div><p class="kicker">WAYS TO SUPPORT</p><span>支援のかたちは、ひとつではありません。</span></div><p>現地の状況と活動内容を確認しながら、無理なく続けられる協力の形をご案内します。</p></div>`);
    const cards=section?.querySelectorAll('.org-card');
    const marks=[
      ['01','<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M18 8v8m-4-4h8"/></svg>'],
      ['02','<svg viewBox="0 0 24 24"><path d="M7.5 12 4 10a2 2 0 0 0-3 1l6 6.5A3 3 0 0 0 9 18h3M16.5 12l3.5-2a2 2 0 0 1 3 1l-6 6.5a3 3 0 0 1-2 .5h-3"/><path d="M12 14 8 9.8A3 3 0 0 1 12 5a3 3 0 0 1 4 4.8Z"/></svg>'],
      ['03','<svg viewBox="0 0 24 24"><path d="M3 21V8l7-4 7 4v13M1 21h22M7 11h2m3 0h2m-7 4h2m3 0h2"/><path d="M17 12h4v9"/></svg>'],
      ['04','<svg viewBox="0 0 24 24"><path d="M4 14V9l12-5v15L4 14Z"/><path d="M16 9h3a3 3 0 0 1 0 6h-3M6 15l1.5 5h4L10 16"/></svg>']
    ];
    marks.forEach(([number,icon],index)=>cards[index]?.insertAdjacentHTML('afterbegin',`<div class="join-card-mark"><span>${number}</span><b aria-hidden="true">${icon}</b></div>`));
    inner?.querySelector('.contact-actions')?.insertAdjacentHTML('beforebegin',`<div class="join-flow"><span>お問い合わせ</span><i aria-hidden="true">→</i><span>内容を確認</span><i aria-hidden="true">→</i><span>関わり方をご相談</span></div>`);
  }
  if(path==='contact.html'){
    document.querySelector('.contact-section')?.insertAdjacentHTML('beforebegin',`<section class="contact-topics" aria-labelledby="contact-topics-title"><div><p class="kicker">相談内容から確認</p><h2 id="contact-topics-title">このようなご相談を受け付けています</h2><ul><li><b>支援について</b><span>被災地支援や生活再建に関する連携</span></li><li><b>活動について</b><span>活動内容や参加方法の確認</span></li><li><b>企業・団体連携</b><span>専門性・物資・場所を生かした協力</span></li><li><b>取材・情報提供</b><span>活動への取材、地域の支援情報</span></li></ul></div></section>`);
  }
  const visualIcon=(type)=>{
    const icons={
      shelter:'<path d="M3 11 12 4l9 7v9H3z"/><path d="M8 20v-6h8v6M12 7v4m-2-2h4"/>',
      municipality:'<path d="M4 20h16M6 20V8h8v12M14 11h4v9M9 11h2m-2 3h2m-2 3h2"/>',
      news:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
      timeline:'<circle cx="7" cy="6" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="7" cy="18" r="2"/><path d="M9 6h9M9 12h9M9 18h9"/>',
      meeting:'<path d="M4 5h16v12H9l-5 4z"/><path d="M8 9h8m-8 4h6"/>',
      official:'<path d="M3 20h18M5 9l7-5 7 5M6 9h12v11M9 12v5m6-5v5"/>',
      volunteer:'<path d="M12 20s-7-4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 6-7 10-7 10Z"/><path d="M9 12h6m-3-3v6"/>',
      support:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 2-7 5-7s5 3 5 7m0-4c1-2 2-3 4-3 3 0 4 3 4 6"/>',
      home:'<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
      document:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4M9 12h6m-6 4h6"/>',
      search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
      phone:'<path d="M7 3 4 5c0 8 6 14 14 14l2-3-4-3-2 2c-3-1-5-3-6-6l2-2z"/>',
      people:'<circle cx="8" cy="7" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M2 20c0-5 2-8 6-8s6 3 6 8m0-5c1-2 2-3 4-3 3 0 4 3 4 7"/>',
      info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
      safety:'<path d="M12 3 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6z"/><path d="m8 12 3 3 5-6"/>',
      waste:'<path d="M5 7h14l-1 14H6zM8 7l1-4h6l1 4M9 11v6m6-6v6"/>'
    };
    return `<span class="visual-pictogram" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[type]||icons.info}</svg></span>`;
  };
  const iconType=(element)=>{
    const key=`${element.getAttribute?.('href')||''} ${element.textContent||''}`;
    if(/shelter|避難所|安全な場所/.test(key))return'shelter';
    if(/municipalities|自治体別|自分のまち/.test(key))return'municipality';
    if(/municipality-updates|公式発信/.test(key))return'news';
    if(/timeline|日ごと/.test(key))return'timeline';
    if(/meeting|議事録/.test(key))return'meeting';
    if(/official|公的|国・県/.test(key))return'official';
    if(/volunteer|ボランティア/.test(key))return'volunteer';
    if(/support|支援する|協力/.test(key))return'support';
    if(/reconstruction|住まい|家が壊れ|生活再建/.test(key))return'home';
    if(/guide|手続き|制度/.test(key))return'document';
    if(/terms|言葉|探す/.test(key))return'search';
    if(/contact|電話/.test(key))return'phone';
    if(/ごみ|waste/.test(key))return'waste';
    if(/人|つなが|活動/.test(key))return'people';
    return'info';
  };
  const decorateVisualCards=()=>{
    const selector=['.disaster-service-grid>a','.need-grid>a','.source-actions>a','.home-history-grid article','.about-values .org-card','.join-section .org-card','.official-card','.section-links>a','.guide-card','.audience-updates article','.recent-updates article','.support-paths>a','.contact-method'].join(',');
    document.querySelectorAll(selector).forEach(card=>{if(card.querySelector(':scope > .visual-pictogram'))return;card.classList.add('illustration-card');card.insertAdjacentHTML('afterbegin',visualIcon(iconType(card)))});
  };
  decorateVisualCards();
  setTimeout(decorateVisualCards,0);
  setTimeout(decorateVisualCards,400);
  const setupHomeMotion=()=>{
    if(path!=='index.html'||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const root=document.documentElement;
    const hero=document.querySelector('.home-hero-v2');
    const sections=[...document.querySelectorAll('.home-story>section:not(.home-hero-v2):not(.home-contact-v2)')];
    const mark=(container,items,variant='')=>items.filter(Boolean).forEach((item,index)=>{
      item.classList.add('motion-item');
      if(variant)item.classList.add(variant);
      item.style.setProperty('--motion-order',Math.min(index,8));
    });
    if(hero){
      mark(hero,[hero.querySelector('.kicker'),hero.querySelector('.home-role'),hero.querySelector('h1'),hero.querySelector('.home-hero-lead'),hero.querySelector('.home-hero-actions'),hero.querySelector('.home-hero-art')]);
      hero.classList.add('motion-section');
    }
    sections.forEach(section=>{
      section.classList.add('motion-section');
      if(section.matches('.home-current-v2'))mark(section,[section.querySelector('.kicker'),section.querySelector('.home-current-label'),section.querySelector('h2'),section.querySelector('.home-current-heading>p:last-of-type'),...section.querySelectorAll('.home-current-visual li')]);
      else if(section.matches('.home-about-v2'))mark(section,[...section.querySelectorAll(':scope>div>*')]);
      else if(section.matches('.home-principle-v2'))mark(section,[section.querySelector('.kicker'),section.querySelector('h2'),section.querySelector('blockquote'),...section.querySelectorAll('.principle-flow li')]);
      else if(section.matches('.home-information-v2'))mark(section,[...section.querySelectorAll(':scope>div:first-child>*'),...section.querySelectorAll('.information-path>*')]);
      else if(section.matches('.home-history-v2'))mark(section,[...section.querySelectorAll(':scope>header>*'),...section.querySelectorAll('.history-timeline article'),section.querySelector('.home-story-link')]);
      else if(section.matches('.home-work-v2'))mark(section,[...section.querySelectorAll(':scope>header>*'),...section.querySelectorAll('.home-work-grid a')]);
    });
    root.classList.add('home-motion-ready');
    requestAnimationFrame(()=>requestAnimationFrame(()=>hero?.classList.add('is-visible')));
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }),{rootMargin:'0px 0px -7% 0px',threshold:.08});
    sections.forEach(section=>observer.observe(section));
  };
  setupHomeMotion();
  const localNavPages=['affected.html','supporters.html','reconstruction.html','guide.html','support.html','municipalities.html','official.html','meetings.html','timeline.html','volunteer-centers.html'];
  if(localNavPages.includes(path)){
    const main=document.querySelector('main');
    const headings=[...(main?.querySelectorAll('h2')||[])].filter(heading=>heading.textContent.trim()).slice(0,7);
    if(headings.length>=3){
      headings.forEach((heading,index)=>{if(!heading.id)heading.id=`section-${index+1}`});
      const localNav=document.createElement('nav');
      localNav.className='page-local-nav';
      localNav.setAttribute('aria-label','このページの情報');
      localNav.innerHTML=`<b>このページの情報</b><div>${headings.map(heading=>`<a href="#${heading.id}">${heading.textContent.trim()}</a>`).join('')}</div>`;
      const hero=[...main.children].find(element=>element.querySelector?.('h1')||element.matches?.(':has(h1)'));
      hero?.after(localNav);
    }
  }
  const setupSiteMotion=()=>{
    if(path==='index.html'||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const main=document.querySelector('main');
    if(!main)return;
    const candidates=[...main.querySelectorAll(':scope > section, :scope > .policy-content, :scope > nav.reading-set')].filter(section=>{
      if(section.matches('[aria-live]'))return false;
      return section.getBoundingClientRect().height>0;
    });
    document.documentElement.dataset.motion='enabled';
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }),{rootMargin:'0px 0px -5% 0px',threshold:.04});
    candidates.forEach((section,sectionIndex)=>{
      section.classList.add('site-reveal');
      if(motionPreset!=='subtle'){
        const cards=[...section.querySelectorAll('.org-card,.activity-card,.contact-method,.illustration-card,.join-flow span')].slice(0,6);
        cards.forEach((card,index)=>{card.classList.add('site-stagger-item');card.style.setProperty('--stagger-order',index%3)});
      }
      if(sectionIndex===0&&section.getBoundingClientRect().top<innerHeight*.9)requestAnimationFrame(()=>requestAnimationFrame(()=>section.classList.add('is-revealed')));
      else observer.observe(section);
    });
  };
  setupSiteMotion();
  const footer=document.querySelector('footer');
  if(footer){footer.className='org-footer';footer.innerHTML=`<div class="org-footer-brand"><img src="yokatai-logo.png" alt="一般社団法人よか隊ネット熊本"><p>〒869-0404<br>熊本県宇土市走潟町2235<br>代表：土黒 功司</p><a href="mailto:info.yokatai@gmail.com">info.yokatai@gmail.com</a><a href="tel:09027194037">090-2719-4037</a></div><nav class="org-footer-sitemap" aria-label="フッターサイトマップ"><section><b>令和8年熊本地震</b><a href="disaster.html">支援情報トップ</a><a href="affected.html">困りごとから探す</a><a href="shelters.html">避難所</a><a href="municipalities.html">自治体別情報</a><a href="official.html">国・県の公的情報</a><a href="municipality-updates.html">市町村の公式発信</a></section><section><b>暮らし・支援</b><a href="reconstruction.html">暮らしの再建</a><a href="guide.html">制度・生活支援</a><a href="supporters.html">支援する方へ</a><a href="support.html">支援分野別</a><a href="volunteer-centers.html">災害ボランティアセンター</a></section><section><b>記録・資料</b><a href="timeline.html">日々の記録</a><a href="meetings.html">火の国会議 議事録</a><a href="hq-kumamoto.html">熊本市 災害対策本部会議</a><a href="hq-yatsushiro.html">八代市 災害対策本部会議</a><a href="terms.html">災害用語集</a></section><section><b>団体情報</b><a href="about.html">私たちについて</a><a href="about.html#activities">活動について</a><a href="join.html">支援・協力</a><a href="contact.html">お問い合わせ</a><a href="privacy.html">プライバシーポリシー</a><a href="accessibility.html">アクセシビリティ方針</a></section></nav><div class="org-footer-actions"><a href="disaster.html">災害支援情報を確認する</a><a href="official.html">専門機関・公的機関の情報を見る</a></div><p class="operator">本サイトは一般社団法人よか隊ネット熊本が運営する支援情報サイトです。行政機関の公式サイトではありません。制度の判断・申請時はリンク先の公的機関で最新情報をご確認ください。</p>`}
})();
