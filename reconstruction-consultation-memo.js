(() => {
  "use strict";
  const labels={home:"住まい",money:"お金・支払い",documents:"証明・申請",health_care:"健康・介護",family_education:"子ども・家族",work_business:"仕事・事業",agriculture_fishery:"農業・漁業",daily_life:"暮らし・移動"};
  const valid=new Set(Object.keys(labels));
  const clean=value=>String(value??"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);
  const normalizeMunicipality=value=>/^municipality_[a-z]+$/.test(value||"")?value:"";
  const params=()=>new URLSearchParams(location.search);
  const uniqueCategories=categories=>[...new Set((categories||[]).filter(category=>valid.has(category)))].slice(0,6);
  const dateLabel=()=>new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",year:"numeric",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date());
  let navigationPromise;
  const navigation=()=>navigationPromise||=(fetch("public-data/reconstruction/municipality-official-navigation.json",{credentials:"same-origin"}).then(response=>response.ok?response.json():Promise.reject()).catch(()=>({municipalities:[]})));
  const officialFor=(municipality,category)=>{
    if(!municipality)return {title:"お住まいの市町村の公式情報一覧",organization:"自治体を選択して確認",url:"municipalities.html",fallback:true};
    const pages=(municipality.updates||[]).filter(update=>(update.categories||[]).includes(category)&&(update.classification||[]).some(item=>item.category===category&&item.confidence!=="low")).sort((a,b)=>(b.disasterRelevance==="direct")-(a.disasterRelevance==="direct")||String(b.publishedAt||"").localeCompare(String(a.publishedAt||"")));
    const page=pages[0];
    return page?{title:page.displayTitle||page.officialTitle,organization:`${municipality.municipalityName}（自治体）`,url:page.url,fallback:false}:{title:`${municipality.municipalityName}公式サイト（災害関連情報を再確認）`,organization:`${municipality.municipalityName}（自治体）`,url:municipality.officialUrl,fallback:true};
  };
  const actionMarkup=actions=>actions.map(action=>`<li${action.warning?" class=\"memo-warning\"":""}>${action.warning?'<strong><span aria-hidden="true">⚠</span> 重要</strong> ':""}${clean(action.title)}${action.doNotDoYet?`<small>${clean(action.doNotDoYet)}</small>`:""}</li>`).join("");
  function ensureRoot(){
    let root=document.querySelector("[data-consultation-memo]");if(root)return root;
    root=document.createElement("section");root.className="consultation-memo";root.dataset.consultationMemo="";root.hidden=true;root.tabIndex=-1;root.setAttribute("aria-labelledby","consultation-memo-title");document.body.append(root);return root;
  }
  let previousFocus=null,current=null;
  async function build(options={}){
    const categories=uniqueCategories(options.categories);
    const municipalityId=normalizeMunicipality(options.municipalityId||params().get("municipality"));
    const data=await navigation();const municipality=(data.municipalities||[]).find(item=>item.municipalityId===municipalityId)||null;
    const entries=await Promise.all(categories.map(async category=>{
      const actions=window.ReconstructionActionNav?.getActions?await window.ReconstructionActionNav.getActions(category,municipalityId):[];
      return {category,actions:actions.slice(0,1).map(action=>({title:action.title,warning:action.kind==="program_specific"&&(action.highRisk||action.doNotDoYet),doNotDoYet:action.doNotDoYet||""})),official:officialFor(municipality,category)};
    }));
    return {categories,municipalityId,municipalityName:municipality?.municipalityName||"自治体未選択",entries,createdAt:dateLabel()};
  }
  function markup(memo){
    const categories=memo.categories.length?memo.categories.map(category=>`<li>□ ${clean(labels[category])}</li>`).join(""):'<li>確認したい分野は未選択です</li>';
    const actions=memo.entries.flatMap(entry=>entry.actions.length?entry.actions.map(action=>({...action,title:`${labels[entry.category]}：${action.title}`})):[{title:`${labels[entry.category]}：自治体等の公式情報を確認`,warning:false}]);
    const officials=memo.entries.map(entry=>`<li><strong>${clean(labels[entry.category])}｜${clean(entry.official.title)}</strong><span>発表主体：${clean(entry.official.organization)}</span><a href="${clean(entry.official.url)}" target="_blank" rel="noopener noreferrer">${clean(entry.official.url)}</a>${entry.official.fallback?'<small>個別情報が見つからない場合の公式情報入口です。支援がないという意味ではありません。</small>':""}</li>`).join("");
    return `<div class="memo-screen-actions" aria-label="相談メモの操作"><button type="button" data-close-consultation-memo>暮らし整理ナビへ戻る</button><button type="button" data-print-consultation-memo>相談メモを印刷</button></div><article class="memo-sheet"><header><p>暮らしの再建</p><h1 id="consultation-memo-title">相談メモ</h1><p class="memo-purpose">今、何を確認したいかを本人・家族・支援者と一緒に見るための簡単な確認メモです。診断結果、申請書、行政の公式書類ではありません。</p></header><dl class="memo-meta"><div><dt>対象地域</dt><dd>${clean(memo.municipalityName)}</dd></div><div><dt>このメモを作成</dt><dd>${clean(memo.createdAt)}</dd></div></dl><section><h2>選んだ困りごと</h2><ul class="memo-categories">${categories}</ul></section><section><h2>次に確認すること</h2><p class="memo-section-note">表示順に優先順位の意味はありません。公式情報を一緒に確認するための案内です。</p><ul class="memo-actions">${actionMarkup(actions)}</ul></section><section><h2>参考にする公式情報</h2><ul class="memo-officials">${officials||'<li>自治体の災害関連公式ページをご確認ください。該当制度がないという意味ではありません。</li>'}</ul></section><section class="memo-handwriting"><h2>気になること・確認したいこと</h2><div aria-hidden="true"></div><div aria-hidden="true"></div></section><footer><p><strong>情報更新の注意：</strong>災害情報や制度情報は更新されることがあります。最新情報は公式ページで再確認してください。</p><p>一般社団法人よか隊ネット熊本が、自治体等の公式情報を探しやすく整理したページから作成した確認メモです。</p><p class="memo-privacy">選んだ内容はサーバーに保存されません。</p></footer></article>`;
  }
  async function render(options={}){const root=ensureRoot();current=await build(options);root.innerHTML=markup(current);root.querySelector("[data-print-consultation-memo]")?.addEventListener("click",()=>window.print());root.querySelector("[data-close-consultation-memo]")?.addEventListener("click",close);return root}
  async function open(options={}){previousFocus=document.activeElement;const root=await render(options);root.hidden=false;document.body.classList.add("consultation-memo-open");if(location.hash!=="#consultation-memo")history.pushState({consultationMemo:true},"","#consultation-memo");scrollTo(0,0);root.focus()}
  function close(){const root=ensureRoot();root.hidden=true;document.body.classList.remove("consultation-memo-open");if(location.hash==="#consultation-memo")history.back();previousFocus?.focus?.()}
  addEventListener("popstate",()=>{if(location.hash!=="#consultation-memo"){const root=ensureRoot();root.hidden=true;document.body.classList.remove("consultation-memo-open");previousFocus?.focus?.()}});
  document.addEventListener("municipality-nav:rendered",event=>{if(current&&!ensureRoot().hidden)render({categories:current.categories,municipalityId:event.detail?.municipalityId})});
  window.ReconstructionConsultationMemo={open,close,build,officialFor};
  document.dispatchEvent(new CustomEvent("consultation-memo:ready"));
  if(location.hash==="#consultation-memo"&&valid.has(params().get("category")))open({categories:[params().get("category")],municipalityId:params().get("municipality")});
})();
