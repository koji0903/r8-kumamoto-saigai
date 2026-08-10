(() => {
  "use strict";
  const topics = {
    housing:{label:"住まい",title:"住まいのことで困っていますか？",lead:"家に住めない、修理したい、仮の住まいを探している方へ。",checks:["今の家で安全に生活できるか","修理が必要な場所を記録できているか","市町村へ相談できているか"],links:[{label:"宇土市の住まいについて詳しく見る",href:"uto-housing.html"},{label:"自治体別情報を見る",href:"municipalities.html"}]},
    money:{label:"お金・支払い",title:"生活費や支払いが心配ですか？",lead:"収入や毎月の支払いへの影響を、一つずつ整理します。",checks:["収入や仕事に変化があるか","住まいにも被害があるか","続いている支払いに心配があるか"],links:[{label:"制度・生活支援を見る",href:"guide.html"}]},
    paperwork:{label:"証明・手続き",title:"被害の証明や申請で困っていますか？",lead:"制度名を知らなくても、必要な手続きの入口を確認できます。",checks:["被害の状況を写真に残しているか","お住まいの市町村の案内を確認したか","申請前に必要な書類を確認したか"],links:[{label:"制度・生活支援を見る",href:"guide.html"},{label:"自治体別情報を見る",href:"municipalities.html"}]},
    health:{label:"健康・介護",title:"健康や介護のことで心配がありますか？",lead:"本人や家族の健康、高齢者、介護、障がい、心のケアについて整理します。",checks:["いつもの通院や薬を続けられているか","介護や福祉サービスに変化があるか","本人や家族が一人で抱え込んでいないか"],links:[]},
    family:{label:"子ども・家族",title:"子どもや家族のことで困っていますか？",lead:"学校、保育、学用品、子育て、家族の生活について整理します。",checks:["学校や保育の予定を確認できているか","子どもの生活用品に不足があるか","家族それぞれに別の困りごとがないか"],links:[{label:"自治体別情報を見る",href:"municipalities.html"}]},
    work:{label:"仕事・事業",title:"仕事や事業を続けることで困っていますか？",lead:"働くことへの影響と、店舗・会社・事業の再開を分けて整理します。",checks:["雇用や収入に影響があるか","店舗、設備、在庫に被害があるか","仕事と住まいの両方に影響があるか"],links:[]},
    primary:{label:"農業・漁業",title:"農業・漁業の再開で困っていますか？",lead:"生産設備、農地、漁具、経営への影響を整理します。",checks:["農地、船、設備などに被害があるか","生産や出荷を続けられるか","住まいや生活費にも影響があるか"],links:[]},
    daily:{label:"暮らし・移動",title:"移動や日常生活で困っていますか？",lead:"車、交通、ごみ、水道、日用品など、毎日の暮らしへの影響を整理します。",checks:["移動する手段を確保できているか","水道やごみなど自治体情報を確認したか","必要な日用品が不足していないか"],links:[{label:"自治体別情報を見る",href:"municipalities.html"},{label:"市町村の公式発信を見る",href:"municipality-updates.html"}]}
  };
  const detail = document.querySelector("#topic-detail");
  const detailTitle = document.querySelector("#topic-detail-title");
  const detailBody = document.querySelector("#topic-detail-body");
  const organizer = document.querySelector("#organizer");
  const organizerOptions = document.querySelector("#organizer-options");
  const organizerResult = document.querySelector("#organizer-result");
  const consultation = document.querySelector("#consultation");
  const focusSection = section => { section.hidden=false; section.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"}); section.focus({preventScroll:true}); };
  const detailMarkup = topic => `<p class="detail-lead">${topic.lead}</p><h3>まず確認すること</h3><ul class="detail-checks">${topic.checks.map(item=>`<li>${item}</li>`).join("")}</ul>${topic.links.length?`<div class="detail-links">${topic.links.map(link=>`<a href="${link.href}">${link.label} <span aria-hidden="true">→</span></a>`).join("")}</div>`:`<p class="detail-preparing"><b>この分野の詳しい案内は現在準備中です。</b><br>困りごとを一人で抱えず、相談先が分からない場合は、よか隊ネット熊本へご相談ください。</p><div class="detail-links"><a href="contact.html">相談先を一緒に整理する <span aria-hidden="true">→</span></a></div>`}`;
  const openTopic = id => { const topic=topics[id]; if(!topic)return; organizer.hidden=true; detailTitle.textContent=topic.title; detailBody.innerHTML=detailMarkup(topic); focusSection(detail); };
  document.querySelectorAll("[data-topic]").forEach(button=>button.addEventListener("click",()=>openTopic(button.dataset.topic)));
  document.querySelectorAll("[data-open-organizer]").forEach(button=>button.addEventListener("click",()=>{detail.hidden=true;focusSection(organizer)}));
  document.querySelectorAll("[data-open-consultation]").forEach(button=>button.addEventListener("click",()=>{consultation.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});consultation.querySelector("a")?.focus({preventScroll:true})}));
  document.querySelector("[data-back-to-needs]")?.addEventListener("click",()=>{detail.hidden=true;document.querySelector("#needs-title")?.scrollIntoView({behavior:"smooth"});document.querySelector("[data-topic]")?.focus({preventScroll:true})});
  organizerOptions.innerHTML=Object.entries(topics).map(([id,topic])=>`<label><input type="checkbox" name="topics" value="${id}"><span>${topic.label}</span></label>`).join("")+`<label><input type="checkbox" name="topics" value="unknown"><span>まだ分からない</span></label><label><input type="checkbox" name="topics" value="other"><span>その他</span></label>`;
  document.querySelector("#organizer-form")?.addEventListener("submit",event=>{
    event.preventDefault();
    const selected=[...event.currentTarget.querySelectorAll('input[name="topics"]:checked')].map(input=>input.value);
    if(!selected.length){organizerResult.innerHTML="<h3>一つ以上選んでください</h3><p>今気になっていることに近いものを選んでください。「まだ分からない」でも大丈夫です。</p>";organizerResult.hidden=false;organizerResult.focus();return}
    const known=selected.filter(id=>topics[id]);
    const labels=selected.map(id=>topics[id]?.label||(id==="unknown"?"まだ分からない":"その他"));
    organizerResult.innerHTML=`<h3>選んだ困りごと</h3><ol>${labels.map(label=>`<li>${label}</li>`).join("")}</ol><p>まずは、この${labels.length}つを一つずつ確認してみましょう。これは制度の対象判定や緊急度の判定ではありません。</p><div>${known.map(id=>`<button type="button" data-result-topic="${id}">${topics[id].label}を見る</button>`).join("")}${selected.some(id=>!topics[id])?'<a href="contact.html">相談先を一緒に整理する</a>':''}</div>`;
    organizerResult.hidden=false;organizerResult.querySelectorAll("[data-result-topic]").forEach(button=>button.addEventListener("click",()=>openTopic(button.dataset.resultTopic)));organizerResult.focus();
  });
})();
