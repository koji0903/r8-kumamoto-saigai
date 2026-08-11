(() => {
  "use strict";
  const concerns={
    school:{title:"学校・登校のことを確認したい",lead:"休校、学校再開、登校、授業、学校施設、転校、就学、教育相談、学校生活に関する今回災害の公式情報を探します。",filter:"学校|登校|休校|再開|授業|学校施設|転校|就学|教育相談"},
    childcare:{title:"保育園・こども園などを確認したい",lead:"保育所、認定こども園、幼稚園、放課後児童クラブ、学童保育等の公式情報を探します。開所状況はリンク先で確認してください。",filter:"保育|こども園|幼稚園|児童クラブ|学童|子育て施設"},
    supplies:{title:"学用品や子どもの生活で困っている",lead:"学用品、教材、制服、通学、就学援助、学校生活、子どもの居場所に関する公式情報を探します。制度の存在は推測しません。",filter:"学用品|教材|制服|通学|就学援助|学校生活|居場所"},
    family:{title:"子育て・家族の支援を確認したい",lead:"子育て、家族、ひとり親、福祉、相談に関する公式情報を探します。家庭状況や対象条件の判定は行いません。",filter:"子育て|家族|ひとり親|児童|福祉|相談"},
    maternal:{title:"妊娠中・乳幼児のことで確認したい",lead:"妊産婦、乳幼児、母子保健、健診、予防接種、授乳、育児、保健相談に関する公式情報を探します。医療判断は行いません。",filter:"妊産婦|妊娠|乳幼児|母子|健診|予防接種|授乳|育児|保健相談"},
    unsure:{title:"どこへ相談すればよいか分からない",lead:"分からないままで大丈夫です。子ども・家族分野の公式情報全体を確認できます。個別情報がない場合は自治体公式サイトへ進めます。",filter:""}
  };
  const detail=document.querySelector("#family-detail"),title=document.querySelector("#family-detail-title"),lead=document.querySelector("#family-detail-lead"),nav=document.querySelector("[data-municipality-official-nav]");
  document.querySelectorAll("[data-family-concern]").forEach(button=>button.addEventListener("click",()=>{const concern=concerns[button.dataset.familyConcern];if(!concern)return;document.querySelectorAll("[data-family-concern]").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));title.textContent=concern.title;lead.textContent=concern.lead;detail.hidden=false;nav.dataset.titleFilter=concern.filter;nav.dispatchEvent(new CustomEvent("municipality-nav:filter",{detail:{titleFilter:concern.filter}}));detail.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});detail.focus({preventScroll:true})}));
  nav.addEventListener("municipality-nav:rendered",event=>{document.querySelectorAll("[data-related-category]").forEach(link=>{const url=new URL(link.getAttribute("href"),location.href);if(event.detail.municipalityId)url.searchParams.set("municipality",event.detail.municipalityId);else url.searchParams.delete("municipality");link.href=`${url.pathname.split("/").pop()}${url.search}`})});
})();
