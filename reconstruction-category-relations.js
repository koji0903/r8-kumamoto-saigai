(() => {
  "use strict";
  const labels={home:"住まい",money:"お金・支払い",documents:"証明・申請",health_care:"健康・介護",family_education:"子ども・家族",work_business:"仕事・事業",agriculture_fishery:"農業・漁業",daily_life:"暮らし・移動"};
  const params=new URLSearchParams(location.search);
  const municipality=params.get("municipality")||"";
  const href=category=>`reconstruction-official.html?category=${category}${municipality?`&municipality=${encodeURIComponent(municipality)}`:""}`;
  fetch("config/reconstruction-category-relations.json",{credentials:"same-origin"}).then(response=>{if(!response.ok)throw Error();return response.json()}).then(config=>{
    document.querySelectorAll("[data-category-relations]").forEach(root=>{
      const select=document.querySelector("[data-category-select]");
      const render=()=>{
        const category=select?.value||params.get("category")||root.dataset.categoryRelations;
        const relations=config.categories?.[category]||[];
        root.innerHTML=`<header><p>ほかにも気になることがありますか？</p><h2>${labels[category]||"選んだ分野"}と一緒に確認できること</h2><p>支援対象という意味ではありません。気になる項目だけ確認してください。</p></header><div>${relations.map(item=>`<a href="${href(item.category)}"><b>${labels[item.category]}</b><span>${item.prompt}</span></a>`).join("")}</div><a class="cross-category-organizer" href="reconstruction.html#organizer">暮らし全体の困りごとを整理する →</a>`;
      };
      select?.addEventListener("change",render);render();
    });
  }).catch(()=>document.querySelectorAll("[data-category-relations]").forEach(root=>root.innerHTML='<a class="cross-category-organizer" href="reconstruction.html#organizer">暮らし全体の困りごとを整理する →</a>'));
})();
