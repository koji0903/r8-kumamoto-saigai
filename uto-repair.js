(()=>{
  // 絵は uto-waste.js と同じ語彙（viewBox 120×82・線は currentColor・面は art-* の色）
  const art=(body)=>`<svg viewBox="0 0 120 82" aria-hidden="true">${body}</svg>`;

  // ---- わたしは使える？ ------------------------------------------------------
  // 条件は「01_1 被災者の皆様へ」「申込チェックシート」「様式第1号・第2号」の記載どおり。
  const questions=[
    {key:"damage",label:"罹災証明書の判定は？",options:[
      ["total","全壊"],["large","大規模半壊"],["medium","中規模半壊"],["half","半壊"],["semi","準半壊"],["partial","一部損壊"],["none","まだ受け取っていない"]
    ]},
    {key:"home",label:"住まいは？",options:[["own","持ち家"],["rent","借家（賃貸）"]]},
    {key:"paid",label:"修理代金は？",options:[["notyet","まだ支払っていない"],["paid","すでに業者に支払った"]]}
  ];
  const answers={};
  const LIMIT_HALF="757,000円",LIMIT_SEMI="367,000円";
  const needsMeans=d=>["medium","half","semi"].includes(d);
  const halfOrMore=d=>["total","large","medium","half"].includes(d);

  const judge=()=>{
    const {damage,home,paid}=answers;
    if(!damage||!home||!paid)return null;
    if(paid==="paid")return {tone:"ng",title:"この制度は使えません",body:"修理が終わって代金を業者に支払った場合は、制度の対象外と宇土市が案内しています。これから別の箇所を修理する予定がある場合は、支払う前に宇土市へ相談してください。"};
    if(damage==="none")return {tone:"wait",title:"まず罹災証明書を申請してください",body:"判定（全壊〜準半壊）によって、使えるかどうかと上限額が決まります。修理を急ぐ場合も、写真を撮って代金を払う前に宇土市へ相談してください。",link:["risai-certificate.html","罹災証明書の案内を見る →"]};
    if(damage==="partial")return {tone:"ng",title:"対象の判定に含まれていません",body:"資料で対象とされているのは、全壊・大規模半壊・中規模半壊・半壊・準半壊です。判定に疑問がある場合は、罹災証明書について宇土市へ相談してください。"};
    const limit=damage==="semi"?LIMIT_SEMI:LIMIT_HALF;
    const docs=["応急修理申込書（様式第1号）","住宅の被害状況に関する申出書（様式第1号の2）","罹災証明書（写し）","修理前の被害状況が分かる写真","修理見積書（様式第3号）＋工事内訳　※業者が作成"];
    if(needsMeans(damage))docs.push("資力に関する申出書（様式第2号）");
    docs.push("申込チェックシート");
    const notes=[];
    if(damage==="total")notes.push("全壊は原則として対象外ですが、応急修理で住めるようになる場合は対象になります。");
    if(needsMeans(damage))notes.push("自分のお金（資力）では修理できないことが条件です。");
    else notes.push("資力に関する申出書は、資料では中規模半壊・半壊・準半壊の場合とされています。提出の要否は窓口で確認すると確実です。");
    if(home==="rent")notes.push("借家は原則として所有者が修理します。所有者に資力がなく修理できない場合などに限り、所有者の同意を得て対象になる場合があります。所有者が法人の場合は対象外です。資力に関する申出書には貸主の理由記入・署名・押印が必要です。");
    if(halfOrMore(damage))notes.push("修理が1か月を超える見込みで自宅に住めない場合、修理の間に賃貸型応急住宅（みなし仮設）を使える場合があります。");
    return {tone:home==="rent"?"wait":"ok",title:home==="rent"?"条件を満たせば対象になる場合があります":"対象になる可能性があります",limit,docs,notes,body:"そのままでは住めないこと、修理すれば住み続けられることも条件です。最終的な判断は宇土市が行います。"};
  };

  const qBox=document.querySelector("#repairQuestions"),rBox=document.querySelector("#repairResult");
  const renderCheck=()=>{
    qBox.innerHTML=questions.map((q,i)=>`<fieldset class="check-question"><legend><span>${i+1}</span>${q.label}</legend><div>${q.options.map(([value,label])=>`<button type="button" data-q="${q.key}" data-v="${value}" aria-pressed="${answers[q.key]===value}">${label}</button>`).join("")}</div></fieldset>`).join("");
    const result=judge();
    if(!result){
      const left=questions.filter(q=>!answers[q.key]).length;
      rBox.innerHTML=`<div class="check-waiting">あと${left}問に答えると、目安を表示します。</div>`;
    }else{
      rBox.innerHTML=`<article class="check-card tone-${result.tone}"><header><span aria-hidden="true">${result.tone==="ok"?"○":result.tone==="wait"?"△":"×"}</span><div><p>回答からの目安</p><h3>${result.title}</h3></div></header>`+
        (result.limit?`<div class="check-limit"><span>上限額（1世帯・税込）</span><strong>${result.limit}</strong></div>`:"")+
        `<p class="check-body">${result.body}</p>`+
        (result.docs?`<div class="check-docs"><b>申込みに必要な書類</b><ol>${result.docs.map(d=>`<li>${d}</li>`).join("")}</ol></div>`:"")+
        (result.notes?`<ul class="check-notes">${result.notes.map(n=>`<li>${n}</li>`).join("")}</ul>`:"")+
        (result.link?`<a class="waste-button secondary" href="${result.link[0]}">${result.link[1]}</a>`:"")+
        `<p class="check-contact">相談：すまい再建支援室 <a href="tel:0964276647">0964-27-6647</a></p></article>`;
    }
    qBox.querySelectorAll("button").forEach(b=>b.onclick=()=>{answers[b.dataset.q]=b.dataset.v;renderCheck()});
  };
  renderCheck();

  // ---- この修理は対象になる？ -------------------------------------------------
  // 出典：別紙1「住宅の応急修理に係る工事例」、01_2「修理業者の皆様へ」
  const items=[
    {key:"roof",label:"屋根",status:"ok",art:art('<path class="art-orange" d="M8 44 60 12l52 32Z"/><path class="art-slate" d="M20 44h80v30H20z"/><path d="M34 30h14M62 22h14M76 32h14"/><path class="art-yellow" d="M50 52h20v22H50z"/>'),
      yes:["壊れた屋根の補修","瓦屋根を鋼板屋根に変えるなど、屋根材の変更を含む補修"],no:["古くなった屋根材の取替え"],note:"屋根の下地材が壊れている、雨漏りで天井・内壁・床に大きな被害があり1部屋以上使えない、といった状態が目安です。屋根の撮影は危険なので業者に依頼してください。"},
    {key:"structure",label:"柱・はり・基礎",status:"ok",art:art('<path class="art-slate" d="M10 66h100v10H10z"/><path class="art-orange" d="M24 18h12v48H24zM84 18h12v48H84z"/><path class="art-yellow" d="M18 12h84v10H18z"/><path d="m36 22 48 44M84 22 36 66"/>'),
      yes:["傾いた柱の家起こし（筋交いの取替え、耐震合板の打ち付けなど耐震性を確保する措置を伴うものに限る）","破損した柱・はり等の構造部材の取替え","壊れた基礎の補修（無筋基礎の場合は鉄筋コンクリートによる耐震補強を含む）","柱の応急修理ができない場合に、壁を新しく作る"],no:[],note:""},
    {key:"floor",label:"床・畳",status:"cond",art:art('<path class="art-yellow" d="M10 40h100v22H10z"/><path d="M35 40v22M60 40v22M85 40v22"/><path class="art-orange" d="M10 62h100v10H10z"/><path d="m44 48 8 6-6 5"/>'),
      yes:["床組（骨組み）や下地板が壊れた床の補修","床の修理と一緒に行わざるを得ない畳・フローリングの補修","畳の部屋を板張りにするなど、代わりの直し方"],no:["仕上材だけの不具合（表面の傷など）","単に古くなった畳の補修"],note:"床の骨組みか下地まで壊れているかが分かれ目です。"},
    {key:"wall",label:"壁・壁紙",status:"cond",art:art('<path class="art-blue" d="M14 12h92v62H14z"/><path d="M14 32h92M14 52h92M44 12v20M74 32v20M44 52v22"/><path class="art-orange" d="m62 16-8 14 9 6-7 12"/>'),
      yes:["柱・はりや下地板が壊れた壁の補修","壁の修理と一緒に行う断熱材・壁紙の補修","土壁を板壁に変えるなど、壁材の変更を含む補修"],no:["壁紙がはがれているだけ","古くなった壁紙の貼り替え"],note:"壁紙は、壁そのものの修理と一緒なら対象です。"},
    {key:"openings",label:"ドア・窓・ガラス",status:"ok",art:art('<path class="art-orange" d="M14 10h36v64H14z"/><circle cx="42" cy="44" r="3"/><path class="art-blue" d="M64 16h46v44H64z"/><path d="M87 16v44M64 38h46"/><path d="m70 22 10 12-6 4 8 8"/>'),
      yes:["壊れた建具の補修（破損したガラス、アルミサッシ、玄関扉）","割れたガラスの取替え（複層ガラス・ペアガラスでも可）"],no:["障子・襖の張替え（地震で骨組みが壊れた・反り返った場合は対象）"],note:""},
    {key:"pipes",label:"水道・電気・ガス",status:"ok",art:art('<path class="art-blue" d="M8 26h40v12H8zM36 38h12v36H36z"/><path class="art-teal" d="M62 18h14v16H62z"/><path d="M69 34v16h24"/><path class="art-yellow" d="M92 42h20v20H92z"/><circle cx="102" cy="52" r="3"/><path d="M20 50c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12Z"/>'),
      yes:["上下水道の配管の水漏れ部分の補修（配管が埋め込まれた部分の壁などのタイル補修を含む）","電気・ガス・電話などの配管・配線の補修（スイッチ、コンセント、ブラケット、ガス栓、ジャックを含む）","壊れた給排気設備の取替え"],no:[],note:""},
    {key:"toilet",label:"トイレ・浴槽",status:"cond",art:art('<path class="art-slate" d="M16 12h26v26H16z"/><path class="art-blue" d="M12 38h36v8c0 14-8 24-18 24h-4V46H12z"/><path class="art-teal" d="M62 40h50v14c0 12-8 20-20 20H82c-12 0-20-8-20-20z"/><path d="M70 40V24a8 8 0 0 1 16 0"/>'),
      yes:["壊れた便器・浴槽などの衛生設備の取替え（同等品であれば可）","設備の取替えと一緒に行わざるを得ない最小限の床・壁の補修","被災前から温水洗浄便座があった場合の修理"],no:["温水洗浄便座の新規設置","トイレが2か所以上あり、1か所は使える場合","明らかなグレードアップ（差額は自己負担）"],note:""},
    {key:"heater",label:"給湯器",status:"ok",art:art('<rect class="art-slate" x="30" y="8" width="54" height="66" rx="6"/><rect class="art-blue" x="40" y="18" width="34" height="18" rx="3"/><circle class="art-orange" cx="57" cy="52" r="9"/><path d="M42 74v6m30-6v6M90 30h18M90 46h18"/>'),
      yes:["壊れた屋外給湯器の交換（エコキュート・エコジョーズなど同等品への交換）"],no:["明らかなグレードアップ（差額は自己負担）"],note:"壊れた給湯器の品番を写真で記録しておいてください。"},
    {key:"appliance",label:"エアコン・家電",status:"ng",art:art('<rect class="art-blue" x="10" y="12" width="64" height="26" rx="5"/><path d="M20 30h44M24 46v8m16-8v12m16-12v8"/><rect class="art-teal" x="80" y="28" width="32" height="46" rx="4"/><path d="M80 46h32M88 36h6"/>'),
      yes:[],no:["エアコン、食器洗浄機などの家電製品"],note:"家電製品は対象外です。"},
    {key:"storage",label:"収納・仏間・床の間",status:"ng",art:art('<path class="art-orange" d="M12 10h46v64H12z"/><path d="M12 32h46M12 54h46M30 21h10M30 43h10M30 64h10"/><path class="art-yellow" d="M68 22h44v52H68z"/><path d="M68 22l22-12 22 12M84 48h12v26H84z"/>'),
      yes:[],no:["靴箱","収納（床下収納を含む）","仏間・床の間","納戸・客間・使っていない部屋"],note:"対象は居間・寝室・台所・トイレ・浴室と、それらをつなぐ廊下です。"}
  ];
  const statusLabel={ok:"対象になりうる",cond:"条件つき",ng:"対象外"};
  let selectedItem="roof";
  const filters=document.querySelector("#repairFilters"),itemResult=document.querySelector("#repairItemResult");
  const renderItems=()=>{
    filters.innerHTML=items.map(it=>`<button type="button" data-key="${it.key}" aria-pressed="${selectedItem===it.key}"><span class="waste-art">${it.art}</span><span class="waste-filter-copy"><b>${it.label}</b><small class="item-status status-${it.status}">${statusLabel[it.status]}</small></span><i aria-hidden="true">✓</i></button>`).join("");
    const it=items.find(x=>x.key===selectedItem);
    itemResult.innerHTML=`<header class="facility-result-heading"><span class="result-step">2</span><div><p>選んだ場所：<b>${it.label}</b></p><h3>${statusLabel[it.status]}</h3><span>別紙1「工事例」・修理業者向け資料より</span></div><i aria-hidden="true">↓</i></header>`+
      `<div class="item-columns">`+
      (it.yes.length?`<article class="item-yes"><h4><span aria-hidden="true">○</span>対象になる修理</h4><ul>${it.yes.map(t=>`<li>${t}</li>`).join("")}</ul></article>`:"")+
      (it.no.length?`<article class="item-no"><h4><span aria-hidden="true">×</span>対象にならないもの</h4><ul>${it.no.map(t=>`<li>${t}</li>`).join("")}</ul></article>`:"")+
      `</div>`+(it.note?`<p class="facility-flow">${it.note}</p>`:"");
    filters.querySelectorAll("button").forEach(b=>b.onclick=()=>{selectedItem=b.dataset.key;renderItems()});
  };
  renderItems();
})();
