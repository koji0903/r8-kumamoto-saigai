(() => {
  "use strict";
  if (!document.querySelector('link[href^="reconstruction-consultation-memo.css"]')) { const stylesheet=document.createElement("link");stylesheet.rel="stylesheet";stylesheet.href="reconstruction-consultation-memo.css?v=20260812-1";document.head.append(stylesheet); }
  if (!document.querySelector('link[href^="reconstruction-consultation-memo-controls.css"]')) { const controls=document.createElement("link");controls.rel="stylesheet";controls.href="reconstruction-consultation-memo-controls.css?v=20260812-1";document.head.append(controls); }
  if (!document.querySelector('script[src^="reconstruction-consultation-memo.js"]')) { const script=document.createElement("script");script.src="reconstruction-consultation-memo.js?v=20260812-1";script.defer=true;document.head.append(script); }
  const validCategories = new Set(["home","money","documents","health_care","family_education","work_business","agriculture_fishery","daily_life"]);
  const highRiskTypes = new Set(["check_before_contract","deadline","photograph","medical","safety","demolition","repair"]);
  const clean = value => String(value ?? "").replace(/[&<>"']/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);
  const params = () => new URLSearchParams(location.search);
  const normalizedMunicipality = value => /^municipality_[a-z]+$/.test(value || "") ? value : "";
  const officialHref = (category, municipalityId) => `reconstruction-official.html?category=${encodeURIComponent(category)}${municipalityId ? `&municipality=${encodeURIComponent(municipalityId)}` : ""}`;
  const activeSources = step => Array.isArray(step.officialSources) && step.officialSources.length > 0 && step.officialSources.every(source => /^https:\/\//.test(source.url || ""));
  const safeProgramSteps = (programs, category, municipalityId) => (programs || []).filter(program => (program.categories || []).includes(category) && (!municipalityId || (program.municipalities || []).some(item => item.id === municipalityId))).flatMap(program => (program.nextSteps || []).filter(step => step.verificationStatus === "verified" && activeSources(step)).map(step => ({...step, kind:"program_specific", programTitle:program.title}))).sort((a,b)=>(a.order||99)-(b.order||99)).slice(0,2);
  const card = (action, index, category, municipalityId) => {
    if (action.kind === "general_navigation") return `<li class="action-card action-card--general"><span class="action-card__number" aria-hidden="true">${index + 1}</span><div><p class="action-card__kind">公式情報への案内</p><h3>${clean(action.title)}</h3><p>${clean(action.reason)}</p><a href="${clean(officialHref(category, municipalityId))}">${municipalityId ? "選択した市町村の公式情報で確認" : "市町村を選んで公式情報を確認"} <span aria-hidden="true">→</span></a></div></li>`;
    const warning = action.highRisk || highRiskTypes.has(action.actionType) || action.doNotDoYet;
    const source = action.officialSources[0];
    return `<li class="action-card action-card--program"><span class="action-card__number" aria-hidden="true">${index + 1}</span><div><p class="action-card__kind">${clean(action.programTitle || "確認済みの制度情報")}</p><h3>${clean(action.title)}</h3><p>${clean(action.description)}</p>${warning ? `<p class="action-card__warning"><span aria-hidden="true">⚠</span><strong>大切な確認</strong> ${clean(action.doNotDoYet || "公式情報の注意事項を確認してください。")}</p>` : ""}<a href="${clean(source.url)}" target="_blank" rel="noopener noreferrer">公式情報で確認 <span aria-hidden="true">↗</span></a></div></li>`;
  };
  const guidanceFor = (programs, category, municipalityId) => {
    const program=(programs||[]).find(item=>(item.categories||[]).includes(category)&&item.availability?.confirmed&&(!municipalityId||(item.municipalities||[]).some(m=>m.id===municipalityId)));
    if(!program)return null;const municipality=(program.municipalities||[]).find(item=>item.id===municipalityId);return {documents:(municipality?.documents||program.documents||[]).slice(0,3),contacts:municipality?.contacts||{},documentNotice:municipality?.documentNotice||null,applicationMethod:municipality?.applicationMethod||null};
  };
  const phoneLink=phone=>/^[-+() 0-9]+$/.test(phone||"")?`<a class="action-guidance__phone" href="tel:${clean(phone).replace(/[^+0-9]/g,"")}">${clean(phone)}</a>`:clean(phone||"");
  const contactItems=(contacts,label)=>!contacts?.length?"":`<section><h3>${label}</h3>${contacts.map(contact=>`<div class="action-guidance__contact"><b>${clean(contact.name)}</b><span>${clean(contact.organization)}</span>${contact.phone?`<span>電話：${phoneLink(contact.phone)}</span>`:""}${contact.hours?`<span>受付時間：${clean(contact.hours)}</span>`:""}${contact.officialUrl?`<a href="${clean(contact.officialUrl)}" target="_blank" rel="noopener noreferrer">公式ページで確認 <span aria-hidden="true">↗</span></a>`:""}</div>`).join("")}</section>`;
  const guidanceMarkup=guidance=>{if(!guidance)return"";const contacts=guidance.contacts||{},contactMarkup=[contactItems(contacts.application,"申請するところ"),contactItems(contacts.inquiry,"制度について聞くところ"),contactItems(contacts.consultation,"個別の状況を相談するところ"),contactItems(contacts.documentSubmission,"追加書類を提出するところ"),contactItems(contacts.generalInformation,"一般的な案内を聞くところ")].join("");const documents=(guidance.documents||[]).length?`<section><h3>主な必要書類</h3><p>県の案内と市町村の実際の受付書類は異なる場合があります。</p><ul>${guidance.documents.map(document=>`<li><b>${clean(document.name)}</b><span>${clean(document.description||document.requiredLabel)}</span><small>${clean(document.scopeLabel)}／${clean(document.submissionLabel)}</small></li>`).join("")}</ul>${guidance.documentNotice?`<p class="action-guidance__notice">${clean(guidance.documentNotice)}</p>`:""}</section>`:"";return contactMarkup||documents?`<div class="action-guidance" aria-label="申請先・相談先・必要書類"><h2>申請先と準備するもの</h2>${contactMarkup}${documents}<p class="action-guidance__note">この一覧だけで申請が完了するとは限りません。提出方法と全書類は、自治体の最新公式案内で確認してください。</p></div>`:""};
  async function loadData() {
    const [configResponse, programsResponse] = await Promise.all([fetch("config/reconstruction-action-navigation.json",{credentials:"same-origin"}),fetch("public-data/reconstruction/programs.json",{credentials:"same-origin"})]);
    if (!configResponse.ok) throw Error("action config");
    return {config:await configResponse.json(),programs:programsResponse.ok?await programsResponse.json():[]};
  }
  let dataPromise;
  const openMemo=options=>{if(window.ReconstructionConsultationMemo)return window.ReconstructionConsultationMemo.open(options);document.addEventListener("consultation-memo:ready",()=>window.ReconstructionConsultationMemo?.open(options),{once:true})};
  async function getActions(category, municipalityId) {
    if (!validCategories.has(category)) return [];
    const {config,programs}=await (dataPromise ||= loadData());const general=config.categories?.[category];
    return general?[{kind:"general_navigation",...general},...safeProgramSteps(programs,category,normalizedMunicipality(municipalityId))].slice(0,3):[];
  }
  async function getGuidance(category, municipalityId) { if(!validCategories.has(category))return null;const {programs}=await(dataPromise||=loadData());return guidanceFor(programs,category,normalizedMunicipality(municipalityId)); }
  async function render(root, options = {}) {
    if (!root) return;
    const category = validCategories.has(options.category) ? options.category : validCategories.has(root.dataset.actionCategory) ? root.dataset.actionCategory : validCategories.has(params().get("category")) ? params().get("category") : "home";
    const municipalityId = normalizedMunicipality(options.municipalityId || params().get("municipality"));
    try {
      const actions=await getActions(category,municipalityId);const guidance=await getGuidance(category,municipalityId);const general=actions[0];
      root.dataset.renderedCategory = category;
      root.innerHTML = `<div class="action-nav__heading"><p>次に確認すること</p><h2>${clean(general?.label || "この分野")}の次の一歩を整理する</h2><p>制度の対象判定や優先順位ではありません。本人と一緒に、公式情報を確認するための案内です。</p></div>${actions.length ? `<ol class="action-nav__list">${actions.map((action,index)=>card(action,index,category,municipalityId)).join("")}</ol>` : `<div class="action-nav__empty"><p>この分野の詳しい手順は、自治体等の公式情報をご確認ください。</p><a href="${clean(officialHref(category,municipalityId))}">公式情報ナビへ進む →</a></div>`}${guidanceMarkup(guidance)}${!municipalityId ? '<p class="action-nav__municipality-note">お住まいの市町村を選ぶと、申請方法などの公式情報を確認できます。</p>' : ""}<div class="action-nav__tools"><button type="button" data-action-memo>確認メモを見る</button><a class="action-nav__organizer" href="reconstruction.html#organizer">ほかの困りごとも整理する →</a></div>`;
      root.querySelector("[data-action-memo]")?.addEventListener("click",()=>openMemo({categories:[category],municipalityId}));
    } catch {
      root.innerHTML = `<div class="action-nav__empty"><h2>次に確認すること</h2><p>この分野の詳しい手順は、自治体等の公式情報をご確認ください。</p><a href="${clean(officialHref(category,municipalityId))}">公式情報ナビへ進む →</a></div>`;
    }
  }
  function mount(root) {
    const navRoot = root.closest("[data-municipality-official-nav]");
    render(root,{category:root.dataset.actionCategory,municipalityId:navRoot?.querySelector("[data-municipality-select]")?.value});
  }
  document.querySelectorAll("[data-reconstruction-action-nav]").forEach(mount);
  document.querySelectorAll("[data-municipality-official-nav]").forEach(nav => nav.addEventListener("municipality-nav:rendered", event => {
    const root=nav.previousElementSibling?.matches("[data-reconstruction-action-nav]")?nav.previousElementSibling:null;
    if(root)render(root,{category:event.detail?.category || root.dataset.actionCategory,municipalityId:event.detail?.municipalityId});
  }));
  window.ReconstructionActionNav = {render,safeProgramSteps,getActions,getGuidance,guidanceFor};
  window.openReconstructionConsultationMemo=openMemo;
})();
