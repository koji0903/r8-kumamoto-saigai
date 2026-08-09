(()=>{
  const path=location.pathname.split('/').pop()||'index.html';
  document.body.classList.add('organization-site');
  if(path==='index.html'){
    document.title='一般社団法人よか隊ネット熊本｜災害支援から、これからの地域づくりへ。';
    const description=document.querySelector('meta[name="description"]');
    if(description)description.content='一般社団法人よか隊ネット熊本は、2016年熊本地震をきっかけに活動を開始した災害支援・地域支援団体です。令和8年熊本地震の生活再建情報、支援情報、防災・地域づくりに関する情報を提供しています。';
  }
  const structured=document.createElement('script');structured.type='application/ld+json';structured.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'一般社団法人よか隊ネット熊本',address:{'@type':'PostalAddress',postalCode:'869-0404',addressRegion:'熊本県',addressLocality:'宇土市',streetAddress:'走潟町2235'},telephone:'090-2719-4037',email:'info.yokatai@gmail.com'});document.head.append(structured);
  const css=document.createElement('link');css.rel='stylesheet';css.href='org-site.css?v=20260809-5';document.head.append(css);
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
  const footer=document.querySelector('footer');
  if(footer){footer.className='org-footer';footer.innerHTML=`<div><img src="yokatai-logo.png" alt="一般社団法人よか隊ネット熊本"><p>〒869-0404<br>熊本県宇土市走潟町2235<br>代表：土黒 功司</p></div><div><b>サイト案内</b><a href="index.html">ホーム</a><a href="affected.html">支援情報</a><a href="about.html#activities">活動について</a><a href="about.html#profile">団体概要</a><a href="contact.html">お問い合わせ</a></div><div><b>連絡先</b><a href="mailto:info.yokatai@gmail.com">info.yokatai@gmail.com</a><a href="tel:09027194037">090-2719-4037</a><a href="privacy.html">プライバシーポリシー</a></div><p class="operator">本サイトは一般社団法人よか隊ネット熊本が運営する支援情報サイトです。行政機関の公式サイトではありません。制度の判断・申請時はリンク先の公的機関で最新情報をご確認ください。</p>`}
})();
