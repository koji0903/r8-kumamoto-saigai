(() => {
  "use strict";
  const labels={home:"住まい",money:"お金・支払い",documents:"証明・手続き",health_care:"健康・介護",family_education:"子ども・家族",work_business:"仕事・事業",agriculture_fishery:"農業・漁業",daily_life:"暮らし・移動"};
  const validCategories=Object.keys(labels); const params=new URLSearchParams(location.search);
  const clean=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  document.querySelectorAll("[data-municipality-official-nav]").forEach(root=>{
    const select=root.querySelector("[data-municipality-select]"); const results=root.querySelector("[data-municipality-results]"); const categorySelect=root.querySelector("[data-category-select]");
    fetch("public-data/reconstruction/municipality-official-navigation.json",{credentials:"same-origin"}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
      const municipalities=data.municipalities||[]; select.insertAdjacentHTML("beforeend",municipalities.map(m=>`<option value="${clean(m.municipalityId)}">${clean(m.municipalityName)}</option>`).join(""));
      const requestedMunicipality=params.get("municipality"); const requestedRecord=municipalities.find(m=>m.municipalityId===requestedMunicipality||m.municipalityId===`municipality_${requestedMunicipality}`); if(requestedRecord)select.value=requestedRecord.municipalityId;
      const requestedCategory=params.get("category"); if(categorySelect&&validCategories.includes(requestedCategory))categorySelect.value=requestedCategory;
      const render=()=>{const municipality=municipalities.find(m=>m.municipalityId===select.value);const category=validCategories.includes(categorySelect?.value)?categorySelect.value:(validCategories.includes(root.dataset.category)?root.dataset.category:"money");if(!municipality){results.innerHTML="<p>お住まいの市町村を選んでください。21市町村の情報を混ぜずに表示します。</p>";return;}
        const pages=(municipality.updates||[]).filter(u=>u.categories.includes(category)&&u.classification.some(c=>c.category===category&&c.confidence!=="low")).sort((a,b)=>(b.disasterRelevance==="direct")-(a.disasterRelevance==="direct")||String(b.publishedAt||"").localeCompare(String(a.publishedAt||"")));
        const visible=pages.slice(0,5),more=pages.slice(5);const cards=items=>items.map(u=>`<li><a href="${clean(u.url)}" target="_blank" rel="noopener noreferrer"><span>${clean(u.displayTitle)}</span><small>${clean(municipality.municipalityName)}公式${u.publishedAt?` / ${clean(u.publishedAt.slice(0,10).replaceAll("-","/"))}`:""}</small><b>公式サイトで確認 <span aria-hidden="true">↗</span></b></a></li>`).join("");
        const fallback=`<a class="municipality-fallback" href="${clean(municipality.officialUrl)}" target="_blank" rel="noopener noreferrer">${clean(municipality.municipalityName)}公式サイトを見る <span aria-hidden="true">↗</span></a>`;
        results.innerHTML=`<h3>${clean(municipality.municipalityName)}の「${clean(labels[category])}」公式情報</h3>${visible.length?`<ul>${cards(visible)}</ul>${more.length?`<details><summary>ほかの公式情報を見る（${more.length}件）</summary><ul>${cards(more)}</ul></details>`:""}`:`<div class="municipality-safe-empty"><b>この分野の個別情報を現在確認しています。</b><p>制度や支援がないという意味ではありません。</p></div>`}${category==="home"&&municipality.municipalityId==="municipality_uto"?'<a class="municipality-special" href="uto-housing.html">宇土市の住まい支援を分かりやすく見る →</a>':""}${fallback}`;
        const url=new URL(location.href);url.searchParams.set("municipality",municipality.municipalityId);if(categorySelect)url.searchParams.set("category",category);history.replaceState(null,"",url);
      };
      select.addEventListener("change",render);categorySelect?.addEventListener("change",render);render();
    }).catch(()=>{results.innerHTML='<div class="municipality-safe-empty"><b>公式情報一覧を読み込めませんでした。</b><p><a href="municipalities.html">市町村の公的情報一覧</a>をご利用ください。</p></div>';});
  });
})();
