(()=>{
  const path=location.pathname.split('/').pop()||'index.html';
  document.body.classList.add('organization-site');
  document.body.classList.add('illustrated-site');
  document.body.classList.add(`page-${path.replace(/\.html$/,'').replace(/[^a-z0-9-]/g,'-')||'index'}`);
  if(path==='index.html'){
    document.title='一般社団法人よか隊ネット熊本｜災害支援から、これからの地域づくりへ。';
    const description=document.querySelector('meta[name="description"]');
    if(description)description.content='一般社団法人よか隊ネット熊本は、2016年熊本地震をきっかけに活動を開始した災害支援・地域支援団体です。令和8年熊本地震の生活再建情報、支援情報、防災・地域づくりに関する情報を提供しています。';
  }
  const structured=document.createElement('script');structured.type='application/ld+json';structured.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'一般社団法人よか隊ネット熊本',address:{'@type':'PostalAddress',postalCode:'869-0404',addressRegion:'熊本県',addressLocality:'宇土市',streetAddress:'走潟町2235'},telephone:'090-2719-4037',email:'info.yokatai@gmail.com'});document.head.append(structured);
  const supportPages=['disaster.html','affected.html','guide.html','shelters.html','terms.html','municipalities.html','municipality-updates.html','official.html','uto-waste.html'];
  const activityPages=['timeline.html','meetings.html','support.html','supporters.html','volunteer-centers.html'];
  const active=key=>key==='home'?path==='index.html':key==='support'?supportPages.includes(path):key==='reconstruction'?path==='reconstruction.html':key==='activity'?activityPages.includes(path):key==='about'?path==='about.html':key==='join'?path==='join.html':key==='contact'?path==='contact.html':false;
  const currentAttr=key=>active(key)?' aria-current="page"':'';
  const header=document.querySelector('.site-header');
  if(header){header.innerHTML=`<div class="org-header-inner"><a class="brand" href="index.html"><img class="org-logo" src="yokatai-logo.png" alt="一般社団法人よか隊ネット熊本"><span>熊本の地域と暮らしを支える<br><b>情報・支援プラットフォーム</b></span></a><button class="org-menu-toggle" type="button" aria-expanded="false" aria-controls="org-global-nav"><span aria-hidden="true"></span><b>メニュー</b></button><nav id="org-global-nav" aria-label="メインメニュー"><a href="index.html"${currentAttr('home')}>ホーム</a><a class="org-nav-cta" href="disaster.html"${currentAttr('support')}>令和8年熊本地震 支援情報</a><a href="reconstruction.html"${currentAttr('reconstruction')}>生活再建</a><a href="timeline.html"${currentAttr('activity')}>活動・情報</a><a href="about.html"${currentAttr('about')}>私たちについて</a><a href="join.html"${currentAttr('join')}>支援・協力</a><a href="contact.html"${currentAttr('contact')}>お問い合わせ</a></nav></div>`;
    const toggle=header.querySelector('.org-menu-toggle'),nav=header.querySelector('nav');
    toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));nav.classList.toggle('is-open',!open)});
    nav?.addEventListener('click',event=>{if(event.target.closest('a')){toggle?.setAttribute('aria-expanded','false');nav.classList.remove('is-open')}});
    if(path!=='index.html')header.insertAdjacentHTML('afterend',`<div class="org-context-bar"><div><p><b>令和8年熊本地震</b><span>一般社団法人よか隊ネット熊本が運営する支援情報サイトです</span></p><nav aria-label="災害支援のショートカット"><a href="disaster.html">支援情報トップ</a><a href="affected.html">困りごとから探す</a><a href="reconstruction.html">生活再建</a><a href="official.html">公的機関の情報</a></nav></div></div>`)
  }
  if(path==='disaster.html'){
    document.title='令和8年熊本地震 支援情報ポータル｜一般社団法人よか隊ネット熊本';
    const main=document.querySelector('main');
    main?.insertAdjacentHTML('afterbegin',`<section class="disaster-portal" aria-labelledby="disaster-portal-title"><div class="disaster-portal-heading"><p class="kicker">2026 KUMAMOTO EARTHQUAKE</p><h1 id="disaster-portal-title">令和8年熊本地震<br><em>支援情報ポータル</em></h1><p>被災された方、地域の方、支援に関わる方が、必要な情報へ迷わず進むための入口です。</p></div><div class="disaster-portal-priority"><p>まず確認したい方へ</p><a href="affected.html"><span>被災された方・ご家族</span><b>困りごとから情報を探す</b><i>→</i></a><a href="reconstruction.html"><span>住まいの被害を受けた方</span><b>生活再建支援を確認する</b><i>→</i></a></div><nav class="disaster-service-grid" aria-label="令和8年熊本地震の情報メニュー"><a href="shelters.html"><span>01</span><b>避難所</b><small>開設中の避難所を確認</small></a><a href="municipalities.html"><span>02</span><b>自治体別情報</b><small>市町村ごとの被害・支援</small></a><a href="municipality-updates.html"><span>03</span><b>市町村の公式発信</b><small>自治体発表を時系列で確認</small></a><a href="timeline.html"><span>04</span><b>日ごとの動き</b><small>被災地の状況と支援経過</small></a><a href="meetings.html"><span>05</span><b>火の国会議 議事録</b><small>現場報告と原資料</small></a><a href="official.html"><span>06</span><b>国・県の公式情報</b><small>公的機関の一次情報</small></a><a href="volunteer-centers.html"><span>07</span><b>ボランティア</b><small>災害VCの募集・活動状況</small></a><a href="supporters.html"><span>08</span><b>支援する方へ</b><small>現場ニーズと支援情報</small></a></nav></section>`);
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
    const marks=[['01','人'],['02','手'],['03','組'],['04','情']];
    marks.forEach(([number,mark],index)=>cards[index]?.insertAdjacentHTML('afterbegin',`<div class="join-card-mark"><span>${number}</span><b aria-hidden="true">${mark}</b></div>`));
    inner?.querySelector('.contact-actions')?.insertAdjacentHTML('beforebegin',`<div class="join-flow"><span>お問い合わせ</span><i aria-hidden="true">→</i><span>内容を確認</span><i aria-hidden="true">→</i><span>関わり方をご相談</span></div>`);
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
  const footer=document.querySelector('footer');
  if(footer){footer.className='org-footer';footer.innerHTML=`<div><img src="yokatai-logo.png" alt="一般社団法人よか隊ネット熊本"><p>〒869-0404<br>熊本県宇土市走潟町2235<br>代表：土黒 功司</p></div><div><b>サイト案内</b><a href="index.html">ホーム</a><a href="affected.html">支援情報</a><a href="about.html#activities">活動について</a><a href="about.html#profile">団体概要</a><a href="contact.html">お問い合わせ</a></div><div><b>連絡先</b><a href="mailto:info.yokatai@gmail.com">info.yokatai@gmail.com</a><a href="tel:09027194037">090-2719-4037</a><a href="privacy.html">プライバシーポリシー</a></div><p class="operator">本サイトは一般社団法人よか隊ネット熊本が運営する支援情報サイトです。行政機関の公式サイトではありません。制度の判断・申請時はリンク先の公的機関で最新情報をご確認ください。</p>`}
})();
