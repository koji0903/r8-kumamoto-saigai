(() => {
  "use strict";
  const concerns={
    condition:{title:"体調や受診のことが心配",lead:"医療機関、診療、保健、健康相談、災害医療に関する今回災害の自治体公式情報を探します。",filter:"医療|診療|病院|受診|健康相談|災害医療|保健"},
    medicine:{title:"薬や治療を続けられるか心配",lead:"薬の変更や服用を本サイトでは判断しません。薬、治療、受診に関する公式案内を探します。",filter:"薬|服薬|治療|受診|処方|難病"},
    care:{title:"高齢者の生活・介護が心配",lead:"介護サービス、高齢者福祉、介護保険、福祉用具、在宅生活に関する公式情報を探します。",filter:"介護|高齢|福祉用具|在宅|介護保険"},
    disability:{title:"障がいのある方の支援を確認したい",lead:"障がい福祉、福祉サービス、補装具、相談支援に関する公式情報を探します。認定や対象判定は行いません。",filter:"障がい|障害|補装具|福祉サービス|相談支援"},
    mental:{title:"こころの負担や不安が大きい",lead:"心理状態の入力や診断は行わず、こころのケアや公的保健機関の公式情報を探します。",filter:"こころ|心のケア|精神|メンタル"},
    unsure:{title:"何に当てはまるか分からない",lead:"分からないままで大丈夫です。健康・介護分野の公式情報全体を確認できます。個別情報がない場合は自治体公式サイトへ進めます。",filter:""}
  };
  const detail=document.querySelector("#health-detail"),title=document.querySelector("#health-detail-title"),lead=document.querySelector("#health-detail-lead"),nav=document.querySelector("[data-municipality-official-nav]");
  document.querySelectorAll("[data-health-concern]").forEach(button=>button.addEventListener("click",()=>{const concern=concerns[button.dataset.healthConcern];if(!concern)return;document.querySelectorAll("[data-health-concern]").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));title.textContent=concern.title;lead.textContent=concern.lead;detail.hidden=false;nav.dataset.titleFilter=concern.filter;nav.dispatchEvent(new CustomEvent("municipality-nav:filter",{detail:{titleFilter:concern.filter}}));detail.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});detail.focus({preventScroll:true})}));
  nav.addEventListener("municipality-nav:rendered",event=>{document.querySelectorAll("[data-related-category]").forEach(link=>{const url=new URL(link.getAttribute("href"),location.href);if(event.detail.municipalityId)url.searchParams.set("municipality",event.detail.municipalityId);else url.searchParams.delete("municipality");link.href=`${url.pathname.split("/").pop()}${url.search}`})});
})();
