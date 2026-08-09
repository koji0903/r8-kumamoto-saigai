(()=>{
  const path=location.pathname.split('/').pop()||'index.html';
  if(path==='index.html'){
    document.title='一般社団法人よか隊ネット熊本｜災害支援・生活再建・地域づくり';
    const description=document.querySelector('meta[name="description"]');
    if(description)description.content='一般社団法人よか隊ネット熊本は、2016年熊本地震をきっかけに活動を開始した災害支援・地域支援団体です。令和8年熊本地震の生活再建情報、支援情報、防災・地域づくりに関する情報を提供しています。';
  }
  const structured=document.createElement('script');structured.type='application/ld+json';structured.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'一般社団法人よか隊ネット熊本',address:{'@type':'PostalAddress',postalCode:'869-0404',addressRegion:'熊本県',addressLocality:'宇土市',streetAddress:'走潟町2235'},telephone:'090-2719-4037',email:'info.yokatai@gmail.com'});document.head.append(structured);
  const css=document.createElement('link');css.rel='stylesheet';css.href='org-site.css';document.head.append(css);
  const header=document.querySelector('.site-header');
  if(header){header.innerHTML=`<a class="brand" href="index.html"><img class="org-logo" src="yokatai-logo.png" alt="一般社団法人よか隊ネット熊本"></a><nav aria-label="メインメニュー"><a href="index.html"${path==='index.html'?' aria-current="page"':''}>ホーム</a><a class="org-nav-cta" href="affected.html">令和8年熊本地震 支援情報</a><a href="reconstruction.html">生活再建</a><a href="about.html"${path==='about.html'?' aria-current="page"':''}>私たちについて</a><a href="join.html"${path==='join.html'?' aria-current="page"':''}>支援・協力する</a><a href="contact.html"${path==='contact.html'?' aria-current="page"':''}>お問い合わせ</a></nav>`}
  if(path==='index.html'){
    const main=document.querySelector('main');
    if(main&&!main.querySelector('.org-intro'))main.insertAdjacentHTML('afterbegin',`<section class="org-intro" aria-labelledby="org-intro-title"><div class="org-intro-brand"><img src="yokatai-logo.png" alt="一般社団法人よか隊ネット熊本"><div><p>熊本の地域と暮らしを支える情報・支援プラットフォーム</p><h1 id="org-intro-title">災害支援から、<br>これからの地域づくりへ。</h1><p>必要な人に、必要な支援を。<br>そして、そのつながりを地域の力へ。</p></div></div><div class="emergency-cta"><div><span>現在、災害対応期です</span><h2>令和8年熊本地震 支援・生活再建情報</h2><p>必要な制度・相談先・次にすることへ迷わず進むための入口です。</p></div><div><a class="button primary" href="affected.html">今必要な支援情報を見る</a><a class="button ghost" href="reconstruction.html">生活再建支援を確認する</a></div></div></section>`)
  }
  const footer=document.querySelector('footer');
  if(footer){footer.className='org-footer';footer.innerHTML=`<div><img src="yokatai-logo.png" alt="一般社団法人よか隊ネット熊本"><p>〒869-0404<br>熊本県宇土市走潟町2235<br>代表：土黒 功司</p></div><div><b>サイト案内</b><a href="index.html">ホーム</a><a href="affected.html">支援情報</a><a href="about.html#activities">活動について</a><a href="about.html#profile">団体概要</a><a href="contact.html">お問い合わせ</a></div><div><b>連絡先</b><a href="mailto:info.yokatai@gmail.com">info.yokatai@gmail.com</a><a href="tel:09027194037">090-2719-4037</a><a href="privacy.html">プライバシーポリシー</a></div><p class="operator">本サイトは一般社団法人よか隊ネット熊本が運営する支援情報サイトです。行政機関の公式サイトではありません。制度の判断・申請時はリンク先の公的機関で最新情報をご確認ください。</p>`}
})();
