(() => {
  "use strict";
  if(!document.querySelector('link[href^="reconstruction-action-nav.css"]')){const stylesheet=document.createElement("link");stylesheet.rel="stylesheet";stylesheet.href="reconstruction-action-nav.css?v=20260812-2";document.head.append(stylesheet)}
  if(!document.querySelector('script[src^="reconstruction-action-nav.js"]')){const script=document.createElement("script");script.src="reconstruction-action-nav.js?v=20260812-2";script.defer=true;document.head.append(script)}
  const topics = {
    housing:{label:"住まい",prompt:"家に住めない・修理したい",title:"住まいのことで困っていますか？",lead:"家に住めない、修理したい、仮の住まいを探している方へ。",checks:["今の家で安全に生活できるか","修理が必要な場所を記録できているか","市町村へ相談できているか"],links:[{label:"宇土市の住まい支援を確認する",href:"uto-housing.html"},{label:"自治体別情報を見る",href:"municipalities.html"}]},
    money:{label:"お金・支払い",prompt:"生活費や支払いが心配",title:"生活費や支払いが心配ですか？",lead:"収入や毎月の支払いへの影響を、一つずつ整理します。",checks:["収入や仕事に変化があるか","住まいにも被害があるか","続いている支払いに心配があるか"],links:[{label:"お金・支払いを詳しく整理する",href:"reconstruction-money.html"}]},
    paperwork:{label:"証明・申請",prompt:"罹災証明や申請が分からない",title:"被害の証明や申請で困っていますか？",lead:"制度名を知らなくても、必要な手続きの入口を確認できます。",checks:["被害の状況を写真に残しているか","お住まいの市町村の案内を確認したか","申請前に必要な書類を確認したか"],links:[{label:"証明・申請を詳しく整理する",href:"reconstruction-documents.html"},{label:"制度・生活支援を見る",href:"guide.html"}]},
    health:{label:"健康・介護",prompt:"健康・介護のことが心配",title:"健康や介護のことで心配がありますか？",lead:"本人や家族の健康、高齢者、介護、障がい、心のケアについて整理します。",checks:["いつもの通院や薬を続けられているか","介護や福祉サービスに変化があるか","本人や家族が一人で抱え込んでいないか"],links:[{label:"健康・介護を詳しく整理する",href:"reconstruction-health-care.html"}]},
    family:{label:"子ども・家族",prompt:"子どもや家族のことで困っている",title:"子どもや家族のことで困っていますか？",lead:"学校、保育、学用品、子育て、家族の生活について整理します。",checks:["学校や保育の予定を確認できているか","子どもの生活用品に不足があるか","家族それぞれに別の困りごとがないか"],links:[{label:"子ども・家族を詳しく整理する",href:"reconstruction-family.html"}]},
    work:{label:"仕事・事業",prompt:"仕事や事業への影響がある",title:"仕事や事業を続けることで困っていますか？",lead:"働くことへの影響と、店舗・会社・事業の再開を分けて整理します。",checks:["雇用や収入に影響があるか","店舗、設備、在庫に被害があるか","仕事と住まいの両方に影響があるか"],links:[{label:"仕事・事業を詳しく整理する",href:"reconstruction-work-business.html"}]},
    primary:{label:"農業・漁業",prompt:"農業・漁業への影響がある",title:"農業・漁業の再開で困っていますか？",lead:"生産設備、農地、漁具、経営への影響を整理します。",checks:["農地、船、設備などに被害があるか","生産や出荷を続けられるか","住まいや生活費にも影響があるか"],links:[{label:"農業・漁業を詳しく整理する",href:"reconstruction-agriculture-fishery.html"}]},
    daily:{label:"暮らし・移動",prompt:"車・移動・日常生活で困っている",title:"移動や日常生活で困っていますか？",lead:"車、交通、ごみ、水道、日用品など、毎日の暮らしへの影響を整理します。",checks:["移動する手段を確保できているか","水道やごみなど自治体情報を確認したか","必要な日用品が不足していないか"],links:[{label:"自治体別情報を見る",href:"municipalities.html"},{label:"市町村の公式発信を見る",href:"municipality-updates.html"}]}
  };
  const topicCategories={housing:"home",money:"money",paperwork:"documents",health:"health_care",family:"family_education",work:"work_business",primary:"agriculture_fishery",daily:"daily_life"};
  const categoryTopics=Object.fromEntries(Object.entries(topicCategories).map(([topic,category])=>[category,topic]));
  const topicSummaries={housing:"家の修理や仮の住まい",money:"生活費や支払い",paperwork:"被害の証明や申請",health:"通院や介護",family:"学校・保育や家族の生活",work:"雇用や事業の再開",primary:"生産や経営の再開",daily:"車や移動・日常生活"};
  const relationConfigPromise=fetch("config/reconstruction-category-relations.json",{credentials:"same-origin"}).then(response=>{if(!response.ok)throw Error();return response.json()}).catch(()=>({categories:{},confirmationGroups:[]}));
  const municipalitySlugs=new Set(["kumamoto","yatsushiro","minamata","yamaga","kikuchi","uto","kamiamakusa","uki","amakusa","koshi","misato","ozu","kikuyo","nishihara","mifune","kashima","mashiki","kosa","hikawa","ashikita","tsunagi"]);
  const municipalityNames={kumamoto:"熊本市",yatsushiro:"八代市",minamata:"水俣市",yamaga:"山鹿市",kikuchi:"菊池市",uto:"宇土市",kamiamakusa:"上天草市",uki:"宇城市",amakusa:"天草市",koshi:"合志市",misato:"美里町",ozu:"大津町",kikuyo:"菊陽町",nishihara:"西原村",mifune:"御船町",kashima:"嘉島町",mashiki:"益城町",kosa:"甲佐町",hikawa:"氷川町",ashikita:"芦北町",tsunagi:"津奈木町"};
  const currentMunicipality=(()=>{const raw=new URLSearchParams(location.search).get("municipality")||"";const slug=raw.replace(/^municipality_/,"");return municipalitySlugs.has(slug)?`municipality_${slug}`:""})();
  const officialNavHref=id=>`reconstruction-official.html?category=${topicCategories[id]}${currentMunicipality?`&municipality=${currentMunicipality}`:""}`;
  const generalConsultationHref=`reconstruction-official.html?view=general_consultation${currentMunicipality?`&municipality=${currentMunicipality}`:""}`;
  const withMunicipality=href=>{
    if(!currentMunicipality)return href;
    if(/^reconstruction-[a-z-]+\.html$/.test(href))return `${href}?municipality=${currentMunicipality}`;
    // municipalities.html と municipality-updates.html は ?name=市町村名 を読む。
    // 選択済みの自治体を引き継がないと、利用者が同じ選択をやり直すことになる。
    if(/^municipality-updates\.html$/.test(href)||/^municipalities\.html$/.test(href)){
      const name=municipalityNames[currentMunicipality.replace(/^municipality_/,"")];
      return name?`${href}?name=${encodeURIComponent(name)}`:href;
    }
    return href;
  };
  const detail = document.querySelector("#topic-detail");
  const detailTitle = document.querySelector("#topic-detail-title");
  const detailBody = document.querySelector("#topic-detail-body");
  const organizer = document.querySelector("#organizer");
  const organizerOptions = document.querySelector("#organizer-options");
  const organizerResult = document.querySelector("#organizer-result");
  const consultation = document.querySelector("#consultation");
  if(currentMunicipality){const slug=currentMunicipality.replace("municipality_","");document.querySelector(".rebuild-provider")?.insertAdjacentHTML("afterend",`<p class="rebuild-municipality-context"><b>${municipalityNames[slug]}</b>を選択中です。カテゴリへ進んでもこの自治体を引き継ぎます。 <a href="municipalities.html?name=${encodeURIComponent(municipalityNames[slug])}">自治体別ページへ戻る</a></p>`)}
  const focusSection = section => { section.hidden=false; section.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"}); section.focus({preventScroll:true}); };
  const publicReferenceLinks = '<div class="detail-links"><a href="municipalities.html">市町村の公的窓口を探す <span aria-hidden="true">→</span></a><a href="official.html">国・熊本県の公的情報を見る <span aria-hidden="true">→</span></a></div>';
  const detailMarkup = (topic,id) => {const links=id==="housing"&&currentMunicipality!=="municipality_uto"?topic.links.filter(link=>link.href!=="uto-housing.html"):topic.links;return `<p class="detail-lead">${topic.lead}</p><section class="action-nav" data-reconstruction-action-nav data-action-category="${topicCategories[id]}" aria-label="次に確認すること"><noscript><h3>次に確認すること</h3><p>この分野の詳しい手順は、自治体等の公式情報をご確認ください。</p><a href="${officialNavHref(id)}">公式情報ナビへ進む →</a></noscript></section><h3>まず確認すること</h3><ul class="detail-checks">${topic.checks.map(item=>`<li>${item}</li>`).join("")}</ul><div class="detail-links"><a href="${officialNavHref(id)}">${topic.label}の自治体公式情報を見る <span aria-hidden="true">→</span></a>${links.map(link=>`<a href="${withMunicipality(link.href)}">${link.label} <span aria-hidden="true">→</span></a>`).join("")}</div>`};
  const openTopic = id => { const topic=topics[id]; if(!topic)return; organizer.hidden=true; detailTitle.textContent=topic.title; detailBody.innerHTML=detailMarkup(topic,id); const actionRoot=detailBody.querySelector("[data-reconstruction-action-nav]");window.ReconstructionActionNav?.render(actionRoot,{category:topicCategories[id],municipalityId:currentMunicipality});focusSection(detail); };
  document.querySelectorAll("[data-topic]").forEach(button=>button.addEventListener("click",()=>openTopic(button.dataset.topic)));
  const resetOrganizer = () => { document.querySelectorAll('#organizer input[name="topics"]').forEach(input=>{input.checked=false}); organizerResult.hidden=true; organizerResult.innerHTML=""; };
  document.querySelectorAll("[data-open-organizer]").forEach(button=>button.addEventListener("click",()=>{detail.hidden=true;focusSection(organizer)}));
  document.querySelectorAll("[data-open-consultation]").forEach(button=>button.addEventListener("click",()=>{consultation.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});consultation.querySelector("a")?.focus({preventScroll:true})}));
  document.querySelector("[data-back-to-needs]")?.addEventListener("click",()=>{detail.hidden=true;document.querySelector("#needs-title")?.scrollIntoView({behavior:"smooth"});document.querySelector("[data-topic]")?.focus({preventScroll:true})});
  document.querySelector("[data-consult-without-selection]")?.addEventListener("click",()=>{consultation.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});consultation.querySelector("a")?.focus({preventScroll:true})});
  document.querySelector("[data-close-organizer]")?.addEventListener("click",()=>{organizer.hidden=true;document.querySelector("#special-title")?.scrollIntoView({behavior:"smooth"});document.querySelector("[data-open-organizer]")?.focus({preventScroll:true})});
  organizerOptions.innerHTML=Object.entries(topics).map(([id,topic])=>`<label><input type="checkbox" name="topics" value="${id}"><span><b>${topic.label}</b><small>${topic.prompt}</small></span></label>`).join("")+`<label><input type="checkbox" name="topics" value="other"><span><b>その他</b><small>うまく説明できない</small></span></label>`;
  document.querySelector("#organizer-form")?.addEventListener("submit",async event=>{
    event.preventDefault();
    const selected=[...event.currentTarget.querySelectorAll('input[name="topics"]:checked')].map(input=>input.value);
    if(!selected.length){organizerResult.innerHTML=`<p class="print-memo-title">暮らしの再建 確認メモ</p><h3>選べなくても大丈夫です</h3><p>入力する必要はありません。お住まいの自治体の災害関連情報や、今回の災害に関係する総合相談の公式情報を確認できます。</p><div class="result-topic-actions"><a href="${generalConsultationHref}">総合相談の公式情報を見る</a><a href="municipalities.html">自治体の災害関連公式情報を見る</a></div><div class="result-actions"><button type="button" data-reset-organizer>選び直す</button></div>`;organizerResult.hidden=false;organizerResult.querySelector("[data-reset-organizer]")?.addEventListener("click",()=>{resetOrganizer();organizer.focus()});organizerResult.focus();return}
    const known=selected.filter(id=>topics[id]);
    const labels=selected.map(id=>topics[id]?.prompt||"その他・うまく説明できない");
    const config=await relationConfigPromise;const selectedCategories=new Set(known.map(id=>topicCategories[id]));
    const groups=(config.confirmationGroups||[]).filter(group=>group.categories.every(category=>selectedCategories.has(category)));
    const suggestedCategories=[];for(const category of selectedCategories)for(const relation of config.categories?.[category]||[])if(!selectedCategories.has(relation.category)&&!suggestedCategories.includes(relation.category))suggestedCategories.push(relation.category);const suggestions=suggestedCategories.slice(0,3).map(category=>categoryTopics[category]).filter(Boolean);
    const selectedCards=known.map(id=>`<button type="button" data-result-topic="${id}"><b>${topics[id].label}</b><small>${topicSummaries[id]}</small><span>この分野を確認 <span aria-hidden="true">→</span></span></button>`).join("");
    const groupMarkup=groups.length?`<section class="confirmation-groups" aria-labelledby="confirmation-groups-title"><h4 id="confirmation-groups-title">一緒に確認しやすいまとまり</h4><p>制度の判定や優先順位ではありません。関係する情報を見落としにくくするための整理です。</p><div>${groups.map(group=>`<article><b>${group.title}</b><span>${group.description}</span></article>`).join("")}</div></section>`:"";
    const suggestionMarkup=suggestions.length?`<section class="related-suggestions" aria-labelledby="related-suggestions-title"><h4 id="related-suggestions-title">ほかにも気になる場合</h4><p>選んでいない分野を、あなたの困りごととして自動追加することはありません。</p><div>${suggestions.map(id=>`<button type="button" data-result-topic="${id}">${topics[id].label}も見る</button>`).join("")}</div></section>`:"";
    const otherMarkup=selected.includes("other")?`<section class="other-guidance"><h4>うまく説明できなくても大丈夫です</h4><p>文章を入力する必要はありません。自治体の災害関連情報や、総合相談の公式情報を確認できます。</p><div class="result-topic-actions"><a href="${generalConsultationHref}">総合相談の公式情報を見る</a><a href="municipalities.html">自治体の災害関連公式情報を見る</a></div></section>`:"";
    organizerResult.innerHTML=`<p class="print-memo-title">暮らしの再建 確認メモ</p><h3>${labels.length}つのことを選びました</h3><p><b>気になるところから、一つずつ確認できます。</b>全部を一度に見る必要はありません。表示順に優先順位の意味はありません。</p><ul class="selected-needs">${labels.map(label=>`<li><span aria-hidden="true">✓</span>${label}</li>`).join("")}</ul>${groupMarkup}<h4>どこから確認しますか？</h4><div class="selected-topic-cards">${selectedCards}</div>${suggestionMarkup}${otherMarkup}<div class="result-consult"><h4>どこへ相談すればよいか分からないとき</h4><p>分野ごとの公的・専門機関を確認してください。このサイトやよか隊ネット熊本が相談を受け付けるものではありません。</p><div class="result-topic-actions"><a href="${generalConsultationHref}">総合相談の公式情報を見る</a><a href="official.html">国・熊本県の公的情報を見る</a></div></div><aside class="result-supporter"><b>相談を受けながら使っている方へ</b><p>住宅だけなど一つに決めつけず、ほかにも生活上の困りごとがないか、本人と一緒に短く確認できます。所得、病気、借入、家族関係などを最初から聞くための聞き取り票ではありません。</p></aside><div class="result-actions"><button type="button" data-reset-organizer>選び直す</button><button type="button" data-print-organizer>確認メモを印刷する</button></div>`;
    organizerResult.hidden=false;organizerResult.querySelectorAll("[data-result-topic]").forEach(button=>button.addEventListener("click",()=>openTopic(button.dataset.resultTopic)));organizerResult.querySelector("[data-reset-organizer]")?.addEventListener("click",()=>{resetOrganizer();organizer.focus()});const memoButton=organizerResult.querySelector("[data-print-organizer]");if(memoButton){memoButton.textContent="確認メモを見る";memoButton.addEventListener("click",()=>window.openReconstructionConsultationMemo?.({categories:known.map(id=>topicCategories[id]),municipalityId:currentMunicipality}))}organizerResult.focus();
  });
  if(location.hash==="#organizer"){detail.hidden=true;focusSection(organizer)}
})();
