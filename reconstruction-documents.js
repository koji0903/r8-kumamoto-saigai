(() => {
  "use strict";
  const concerns={
    damage:{title:"家の被害を証明したい",lead:"罹災証明、被災証明、被害認定などに関する自治体公式ページを探します。名称や扱いは自治体の案内で確認してください。",filter:"罹災証明|り災証明|被災証明|被害認定"},
    unknown:{title:"どんな申請が必要か分からない",lead:"手続きは暮らしの困りごとによって異なります。下の関連カテゴリから、まず確認したい分野を選べます。",filter:""},
    papers:{title:"必要な書類を確認したい",lead:"必要書類は自治体や手続きごとに異なります。公式ページに掲載された申請書・必要書類の案内を確認してください。",filter:"必要書類|申請書|書類"},
    deadline:{title:"申請期限が心配",lead:"期限は高リスク情報のため、未確認の期限を本サイトで推測しません。最新の受付期間を公式ページで確認してください。",filter:"期限|締切|受付期間"},
    online:{title:"オンラインで申請できるか知りたい",lead:"オンライン申請、電子申請、マイナポータル等を公式タイトルで確認できたページだけを表示します。",filter:"オンライン|電子申請|マイナポータル|ぴったりサービス"},
    unsure:{title:"何に当てはまるか分からない",lead:"分からないままで大丈夫です。自治体の証明・申請情報全体を確認するか、暮らし整理ナビで困りごとを整理できます。",filter:""}
  };
  const detail=document.querySelector("#documents-detail"),title=document.querySelector("#documents-detail-title"),lead=document.querySelector("#documents-detail-lead"),nav=document.querySelector("[data-municipality-official-nav]");
  document.querySelectorAll("[data-documents-concern]").forEach(button=>button.addEventListener("click",()=>{const concern=concerns[button.dataset.documentsConcern];if(!concern)return;document.querySelectorAll("[data-documents-concern]").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));title.textContent=concern.title;lead.textContent=concern.lead;detail.hidden=false;nav.dataset.titleFilter=concern.filter;nav.dispatchEvent(new CustomEvent("municipality-nav:filter",{detail:{titleFilter:concern.filter}}));detail.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});detail.focus({preventScroll:true})}));
  nav.addEventListener("municipality-nav:rendered",event=>{document.querySelectorAll("[data-related-category]").forEach(link=>{const url=new URL(link.getAttribute("href"),location.href);if(event.detail.municipalityId)url.searchParams.set("municipality",event.detail.municipalityId);else url.searchParams.delete("municipality");link.href=`${url.pathname.split("/").pop()}${url.search}`})});
})();
