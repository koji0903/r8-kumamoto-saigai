(() => {
  "use strict";
  if (!document.querySelector('link[href^="reconstruction-action-nav.css"]')) {
    const stylesheet=document.createElement("link");stylesheet.rel="stylesheet";stylesheet.href="reconstruction-action-nav.css?v=20260812-2";document.head.append(stylesheet);
  }
  document.querySelectorAll("[data-municipality-official-nav]").forEach(nav=>{
    if(nav.previousElementSibling?.matches("[data-reconstruction-action-nav]"))return;
    const actionRoot=document.createElement("section");actionRoot.className="action-nav";actionRoot.dataset.reconstructionActionNav="";actionRoot.dataset.actionCategory=nav.dataset.category||new URLSearchParams(location.search).get("category")||"home";actionRoot.setAttribute("aria-label","次に確認すること");nav.before(actionRoot);
  });
  if (!document.querySelector('script[src^="reconstruction-action-nav.js"]')) {
    const script=document.createElement("script");script.src="reconstruction-action-nav.js?v=20260812-2";script.defer=true;document.head.append(script);
  }
  const labels={home:"住まい",money:"お金・支払い",documents:"証明・申請",health_care:"健康・介護",family_education:"子ども・家族",work_business:"仕事・事業",agriculture_fishery:"農業・漁業",daily_life:"暮らし・移動"};
  const validCategories=Object.keys(labels); const params=new URLSearchParams(location.search); const generalConsultation=params.get("view")==="general_consultation";
  const clean=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  document.querySelectorAll("[data-municipality-official-nav]").forEach(root=>{
    const select=root.querySelector("[data-municipality-select]"); const results=root.querySelector("[data-municipality-results]"); const categorySelect=root.querySelector("[data-category-select]");
    // 士業団体・専門家の支援は、国・県・市町村の公式情報とは出所が異なる。
    // 混ぜると「行政の発表」と「専門家の支援」を取り違えるため、別ブロックで描く。
    let professional=null;
    const professionalHtml=category=>{
      if(!professional)return "";
      const items=(professional.items||[]).filter(item=>(item.categories||[]).includes(category));
      if(!items.length)return "";
      const types=professional.providerTypes||{};
      const contactHtml=item=>(item.contacts||[]).map(contact=>`<li><b>${clean(contact.label)}</b>${contact.phone?`<a class="professional-phone" href="tel:${clean(contact.phone.replace(/[^0-9]/g,""))}">${clean(contact.phone)}</a>`:""}${contact.hours?`<span>${clean(contact.hours)}</span>`:""}${contact.period?`<span>${clean(contact.period)}</span>`:""}${contact.note?`<small>${clean(contact.note)}</small>`:""}</li>`).join("");
      return `<section class="professional-support" aria-label="専門家による無料相談">
        <h3>専門家による無料相談</h3>
        <p class="professional-scope">国・県・市町村の発表ではありません。専門家の団体等が被災された方向けに行っている支援です。制度の適用可否や申請の受付は、お住まいの市町村の窓口で確認してください。</p>
        ${items.map(item=>`<article>
          <header><b>${clean(item.name)}</b><span>${clean(types[item.providerType]||"")}</span></header>
          <h4>${clean(item.title)}</h4>
          <p>${clean(item.summary)}</p>
          ${item.operator?`<p class="professional-operator">運営：${clean(item.operator)}</p>`:""}
          ${contactHtml(item)?`<ul class="professional-contacts">${contactHtml(item)}</ul>`:""}
          ${item.fee?`<p class="professional-fee">費用：${clean(item.fee)}</p>`:""}
          ${item.caution?`<p class="professional-caution">${clean(item.caution)}</p>`:""}
          <a href="${clean(item.url)}" target="_blank" rel="noopener">${clean(item.name)}の案内を見る ↗</a>
          ${(item.officialReferences||[]).map(ref=>`<a class="professional-reference" href="${clean(ref.url)}" target="_blank" rel="noopener">${clean(ref.publisher)}の掲載ページ ↗</a>`).join("")}
        </article>`).join("")}
      </section>`;
    };
    fetch("data/reconstruction/professional-support.json",{credentials:"same-origin"})
      .then(r=>r.ok?r.json():null).then(data=>{professional=data}).catch(()=>{professional=null});
    fetch("public-data/reconstruction/municipality-official-navigation.json",{credentials:"same-origin"}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
      const municipalities=data.municipalities||[]; select.insertAdjacentHTML("beforeend",municipalities.map(m=>`<option value="${clean(m.municipalityId)}">${clean(m.municipalityName)}</option>`).join(""));
      const requestedMunicipality=params.get("municipality"); const requestedRecord=municipalities.find(m=>m.municipalityId===requestedMunicipality||m.municipalityId===`municipality_${requestedMunicipality}`); if(requestedRecord)select.value=requestedRecord.municipalityId;
      const requestedCategory=params.get("category"); if(categorySelect&&validCategories.includes(requestedCategory))categorySelect.value=requestedCategory;
      if(generalConsultation&&categorySelect?.closest("label")){categorySelect.closest("label").hidden=true;root.querySelector(".rebuild-heading")?.insertAdjacentHTML("beforeend",'<p class="municipality-general-note"><b>困りごとを分けにくいときの公式情報</b><br>今回の災害に関係する総合相談・被災者相談の公式ページだけを表示します。</p>')}
      const render=()=>{const municipality=municipalities.find(m=>m.municipalityId===select.value);const category=validCategories.includes(categorySelect?.value)?categorySelect.value:(validCategories.includes(root.dataset.category)?root.dataset.category:"money");if(!municipality){results.innerHTML="<p>お住まいの市町村を選んでください。21市町村の情報を混ぜずに表示します。</p>";root.dispatchEvent(new CustomEvent("municipality-nav:rendered",{detail:{municipalityId:null,category,count:0}}));return;}
        const terms=(root.dataset.titleFilter||"").split("|").map(x=>x.trim()).filter(Boolean);const pages=(municipality.updates||[]).filter(u=>generalConsultation?u.serviceTags?.includes("general_consultation"):u.categories.includes(category)&&u.classification.some(c=>c.category===category&&c.confidence!=="low")).filter(u=>!terms.length||terms.some(term=>u.officialTitle.includes(term))).sort((a,b)=>(b.disasterRelevance==="direct")-(a.disasterRelevance==="direct")||String(b.publishedAt||"").localeCompare(String(a.publishedAt||"")));
        const visible=pages.slice(0,5),more=pages.slice(5);const cards=items=>items.map(u=>`<li><a href="${clean(u.url)}" target="_blank" rel="noopener noreferrer"><span>${clean(u.displayTitle)}</span><small>${clean(municipality.municipalityName)}公式（自治体）${u.publishedAt?` / ${clean(u.publishedAt.slice(0,10).replaceAll("-","/"))}`:""}</small><b>公式サイトで確認 <span aria-hidden="true">↗</span></b></a></li>`).join("");
        const fallback=`<a class="municipality-fallback" href="${clean(municipality.officialUrl)}" target="_blank" rel="noopener noreferrer">${clean(municipality.municipalityName)}公式サイトを見る <span aria-hidden="true">↗</span></a><a class="municipality-return" href="municipalities.html?name=${encodeURIComponent(municipality.municipalityName)}">${clean(municipality.municipalityName)}の自治体別ページへ戻る</a>`;
        const heading=generalConsultation?`${municipality.municipalityName}の総合相談に関する公式情報`:`${municipality.municipalityName}の「${labels[category]}」公式情報`;const empty=generalConsultation?"今回の災害に関係する総合相談の個別ページを現在確認しています。":"この分野の個別情報を現在確認しています。";
        results.innerHTML=`<h3>${clean(heading)}</h3>${visible.length?`<ul>${cards(visible)}</ul>${more.length?`<details><summary>ほかの公式情報を見る（${more.length}件）</summary><ul>${cards(more)}</ul></details>`:""}`:`<div class="municipality-safe-empty"><b>${empty}</b><p>制度や支援がないという意味ではありません。自治体の災害関連公式サイトも確認してください。</p></div>`}${!generalConsultation&&category==="home"&&municipality.municipalityId==="municipality_uto"?'<a class="municipality-special" href="uto-housing.html">宇土市の住まい支援を分かりやすく見る →</a>':""}${fallback}${professionalHtml(category)}`;
        const url=new URL(location.href);url.searchParams.set("municipality",municipality.municipalityId);if(generalConsultation){url.searchParams.set("view","general_consultation");url.searchParams.delete("category")}else if(categorySelect)url.searchParams.set("category",category);history.replaceState(null,"",url);root.dispatchEvent(new CustomEvent("municipality-nav:rendered",{detail:{municipalityId:municipality.municipalityId,category:generalConsultation?"general_consultation":category,count:pages.length}}));
      };
      root.addEventListener("municipality-nav:filter",event=>{root.dataset.titleFilter=event.detail?.titleFilter||"";render()});select.addEventListener("change",render);categorySelect?.addEventListener("change",render);render();
    }).catch(()=>{results.innerHTML='<div class="municipality-safe-empty"><b>公式情報一覧を読み込めませんでした。</b><p><a href="municipalities.html">市町村の公的情報一覧</a>をご利用ください。</p></div>';});
  });
})();
