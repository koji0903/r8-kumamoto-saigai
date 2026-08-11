(() => {
  "use strict";
  const concerns={
    farmland:{title:"農地・農業施設が被災した",lead:"農地、農道、用排水、ハウス、倉庫、農業施設、共同利用施設に関する今回災害の公式情報を探します。",filter:"農地|農道|用排水|ハウス|倉庫|農業施設|共同利用施設"},
    farming:{title:"農機・資材・作物・家畜に被害がある",lead:"農機、農業資材、作物、家畜、畜産施設、飼料、生産資材に関する公式情報を探します。",filter:"農機|農業用機械|農業資材|農作物|作物|家畜|畜産|飼料|生産資材"},
    fishery:{title:"漁船・漁具・漁港などに被害がある",lead:"漁船、漁具、漁港、水産施設、共同施設、操業再開に関する公式情報を探します。",filter:"漁船|漁具|漁港|水産施設|共同施設|操業|漁業"},
    aquaculture:{title:"養殖施設・水産物に影響がある",lead:"養殖施設、網、支柱、筏、漁場、種苗、水産物、海苔等に関する今回災害の公式情報を探します。",filter:"養殖|漁網|網|支柱|筏|漁場|種苗|水産物|海苔"},
    restart:{title:"生産再開・資金繰りが心配",lead:"復旧、生産再開、融資、保証、補助、猶予、相談に関する確認可能な公式情報を探します。審査や経営診断は行いません。",filter:"復旧|生産再開|融資|保証|補助|猶予|資金|相談"},
    unsure:{title:"どこへ相談すればよいか分からない",lead:"分からないままで大丈夫です。農業・漁業分野の公式情報全体を確認できます。個別情報がない場合は自治体公式サイトへ進めます。",filter:""}
  };
  const detail=document.querySelector("#agriculture-detail"),title=document.querySelector("#agriculture-detail-title"),lead=document.querySelector("#agriculture-detail-lead"),nav=document.querySelector("[data-municipality-official-nav]");
  document.querySelectorAll("[data-agriculture-concern]").forEach(button=>button.addEventListener("click",()=>{const concern=concerns[button.dataset.agricultureConcern];if(!concern)return;document.querySelectorAll("[data-agriculture-concern]").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));title.textContent=concern.title;lead.textContent=concern.lead;detail.hidden=false;nav.dataset.titleFilter=concern.filter;nav.dispatchEvent(new CustomEvent("municipality-nav:filter",{detail:{titleFilter:concern.filter}}));detail.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});detail.focus({preventScroll:true})}));
  nav.addEventListener("municipality-nav:rendered",event=>{document.querySelectorAll("[data-related-category]").forEach(link=>{const url=new URL(link.getAttribute("href"),location.href);if(event.detail.municipalityId)url.searchParams.set("municipality",event.detail.municipalityId);else url.searchParams.delete("municipality");link.href=`${url.pathname.split("/").pop()}${url.search}`})});
})();
