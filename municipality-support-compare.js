(()=>{
  "use strict";
  const labels={home:"住まい",money:"お金・支払い",documents:"証明・申請",health_care:"健康・介護",family_education:"子ども・家族",work_business:"仕事・事業",agriculture_fishery:"農業・漁業",daily_life:"暮らし・移動"};
  const defaults=["municipality_uki","municipality_uto","municipality_hikawa"];
  const clean=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const root=document.querySelector("[data-compare-results]");
  const municipalityOptions=document.querySelector("[data-municipality-options]");
  const categoryOptions=document.querySelector("[data-category-options]");
  if(!root||!municipalityOptions||!categoryOptions)return;
  fetch("public-data/reconstruction/municipality-official-navigation.json",{credentials:"same-origin"}).then(response=>{if(!response.ok)throw Error("load");return response.json()}).then(data=>{
    const municipalities=data.municipalities||[];
    let selected=defaults.filter(id=>municipalities.some(item=>item.municipalityId===id));
    let category="home";
    municipalityOptions.innerHTML=municipalities.map(item=>`<label><input type="checkbox" value="${clean(item.municipalityId)}" ${selected.includes(item.municipalityId)?"checked":""}><span>${clean(item.municipalityName)}</span></label>`).join("")+`<p class="compare-limit" data-limit-message hidden>比較できる自治体は4つまでです。</p>`;
    categoryOptions.innerHTML=Object.entries(labels).map(([id,label])=>`<label><input type="radio" name="compare-category" value="${id}" ${id===category?"checked":""}><span>${label}</span></label>`).join("");
    const confirmedPages=municipality=>(municipality.updates||[]).filter(update=>update.status==="active"&&(update.classification||[]).some(item=>item.category===category&&item.confidence!=="low")).sort((a,b)=>String(b.publishedAt||"").localeCompare(String(a.publishedAt||"")));
    const render=()=>{
      const chosen=selected.map(id=>municipalities.find(item=>item.municipalityId===id)).filter(Boolean);
      root.style.setProperty("--compare-columns",Math.min(Math.max(chosen.length,1),4));
      document.querySelector("[data-result-title]").textContent=`${labels[category]}の公式情報を比較`;
      if(!chosen.length){root.innerHTML='<p class="compare-error">比較する自治体を1つ以上選んでください。</p>';return;}
      root.innerHTML=chosen.map(municipality=>{const pages=confirmedPages(municipality);const links=pages.slice(0,3).map(page=>`<li><a href="${clean(page.url)}" target="_blank" rel="noopener noreferrer">${clean(page.displayTitle||page.officialTitle)}<small>${page.publishedAt?clean(page.publishedAt.replaceAll("-","/")):"公開日未確認"}</small></a></li>`).join("");const hub=municipality.disasterHub||{url:municipality.officialUrl,label:`${municipality.municipalityName}公式サイト`};return `<article class="compare-card"><header><h3>${clean(municipality.municipalityName)}</h3><span class="compare-card-status ${pages.length?"":"is-checking"}">${pages.length?"公式ページを確認":"確認中"}</span></header>${pages.length?`<p class="compare-card-count"><b>${pages.length}件</b>確認できた公式ページ</p><ul class="compare-links">${links}</ul>`:`<p class="compare-empty">この分野の個別ページを現在確認しています。支援制度がないという意味ではありません。</p>`}<a class="compare-fallback" href="${clean(hub.url)}" target="_blank" rel="noopener noreferrer">${clean(hub.label)}を確認 ↗</a></article>`}).join("");
    };
    municipalityOptions.addEventListener("change",event=>{const input=event.target.closest('input[type="checkbox"]');if(!input)return;const message=municipalityOptions.querySelector("[data-limit-message]");if(input.checked&&selected.length>=4){input.checked=false;message.hidden=false;return;}message.hidden=true;selected=input.checked?[...selected,input.value]:selected.filter(id=>id!==input.value);render()});
    categoryOptions.addEventListener("change",event=>{const input=event.target.closest('input[type="radio"]');if(!input)return;category=input.value;render()});
    document.querySelector("[data-generated-at]").textContent=`データ確認：${String(data.generatedAt||"").slice(0,10).replaceAll("-","/")}`;
    render();
  }).catch(()=>{municipalityOptions.innerHTML="";root.innerHTML='<p class="compare-error">自治体の公式情報を読み込めませんでした。<a href="municipalities.html">自治体別情報</a>をご利用ください。</p>'});
})();
