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
  async function render(root, options = {}) {
    if (!root) return;
    const category = validCategories.has(options.category) ? options.category : validCategories.has(root.dataset.actionCategory) ? root.dataset.actionCategory : validCategories.has(params().get("category")) ? params().get("category") : "home";
    const municipalityId = normalizedMunicipality(options.municipalityId || params().get("municipality"));
    try {
      const actions=await getActions(category,municipalityId);const general=actions[0];
      root.dataset.renderedCategory = category;
      root.innerHTML = `<div class="action-nav__heading"><p>次に確認すること</p><h2>${clean(general?.label || "この分野")}の次の一歩を整理する</h2><p>制度の対象判定や優先順位ではありません。本人と一緒に、公式情報を確認するための案内です。</p></div>${actions.length ? `<ol class="action-nav__list">${actions.map((action,index)=>card(action,index,category,municipalityId)).join("")}</ol>` : `<div class="action-nav__empty"><p>この分野の詳しい手順は、自治体等の公式情報をご確認ください。</p><a href="${clean(officialHref(category,municipalityId))}">公式情報ナビへ進む →</a></div>`}${!municipalityId ? '<p class="action-nav__municipality-note">お住まいの市町村を選ぶと、申請方法などの公式情報を確認できます。</p>' : ""}<div class="action-nav__tools"><button type="button" data-action-memo>相談メモを見る</button><a class="action-nav__organizer" href="reconstruction.html#organizer">ほかの困りごとも整理する →</a></div>`;
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
  window.ReconstructionActionNav = {render,safeProgramSteps,getActions};
  window.openReconstructionConsultationMemo=openMemo;
})();
