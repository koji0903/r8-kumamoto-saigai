(() => {
  "use strict";
  const concerns={
    income:{title:"仕事を休んでいる・収入が減った",lead:"雇用保険、休業、賃金、就労支援等に関する今回災害の公式情報を探します。生活費や支払いは、お金カテゴリでも確認できます。",filter:"雇用|休業|賃金|収入|就労|労働"},
    workplace:{title:"職場や勤務先のことで困っている",lead:"勤務先の被災、休業、勤務条件、労働相談に関する公式情報を探します。労働法上の判断は行いません。",filter:"職場|勤務|休業|労働|雇用|事業所"},
    employment:{title:"仕事を探したい・働き方を相談したい",lead:"災害後の就職、再就職、職業相談、求人、雇用支援に関する公的な公式情報を探します。",filter:"就職|再就職|職業|求人|ハローワーク|雇用支援"},
    damage:{title:"店・会社・事業所が被災した",lead:"店舗、事務所、設備、在庫、営業、休業、事業継続に関する今回災害の公式情報を探します。",filter:"店舗|会社|事業所|設備|在庫|営業|休業|事業継続|商工"},
    restart:{title:"事業を再開したい・資金繰りが心配",lead:"融資、保証、補助、助成、税、事業再建、経営相談に関する確認可能な公式情報を探します。審査や採択の判断は行いません。",filter:"融資|保証|補助|助成|資金|事業再建|経営|相談窓口"},
    unsure:{title:"何に当てはまるか分からない",lead:"分からないままで大丈夫です。仕事・事業分野の公式情報全体を確認できます。個別情報がない場合は自治体公式サイトへ進めます。",filter:""}
  };
  const detail=document.querySelector("#work-detail"),title=document.querySelector("#work-detail-title"),lead=document.querySelector("#work-detail-lead"),nav=document.querySelector("[data-municipality-official-nav]");
  document.querySelectorAll("[data-work-concern]").forEach(button=>button.addEventListener("click",()=>{const concern=concerns[button.dataset.workConcern];if(!concern)return;document.querySelectorAll("[data-work-concern]").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));title.textContent=concern.title;lead.textContent=concern.lead;detail.hidden=false;nav.dataset.titleFilter=concern.filter;nav.dispatchEvent(new CustomEvent("municipality-nav:filter",{detail:{titleFilter:concern.filter}}));detail.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});detail.focus({preventScroll:true})}));
  nav.addEventListener("municipality-nav:rendered",event=>{document.querySelectorAll("[data-related-category]").forEach(link=>{const url=new URL(link.getAttribute("href"),location.href);if(event.detail.municipalityId)url.searchParams.set("municipality",event.detail.municipalityId);else url.searchParams.delete("municipality");link.href=`${url.pathname.split("/").pop()}${url.search}`})});
})();
