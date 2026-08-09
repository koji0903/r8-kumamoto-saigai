(() => {
  const data = window.MUNICIPALITY_UPDATES;
  if (!data) return;
  const $ = selector => document.querySelector(selector);
  const controls = $(".feed-controls");
  const keywordLabel = controls?.querySelector(":scope > label");
  const categoryFieldset = controls?.querySelector(":scope > fieldset");
  const orderButton = controls?.querySelector(":scope > #feedOrder");
  if (controls && keywordLabel && categoryFieldset && orderButton) {
    const searchControl = document.createElement("section");
    searchControl.className = "feed-search-control";
    searchControl.setAttribute("aria-label", "キーワードで記事を検索");
    searchControl.innerHTML = '<header><span aria-hidden="true">⌕</span><div><b>キーワード検索</b><small>記事の表題から探す</small></div></header>';
    searchControl.append(keywordLabel);
    const filterControl = document.createElement("section");
    filterControl.className = "feed-filter-control";
    filterControl.setAttribute("aria-label", "情報の分類で絞り込む");
    filterControl.innerHTML = '<header><span aria-hidden="true">◈</span><div><b>情報の分類</b><small>種類を選んで絞り込む</small></div></header>';
    filterControl.append(categoryFieldset);
    const orderControl = document.createElement("div");
    orderControl.className = "feed-order-control";
    orderControl.innerHTML = '<span>並び順</span>';
    orderControl.append(orderButton);
    controls.append(searchControl, filterControl, orderControl);
  }
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const dateLabel = date => new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(new Date(`${date}T12:00:00+09:00`));
  const svg = paths => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
  const categoryMeta = {
    "避難・安全": { key: "safety", icon: svg('<path d="M12 3 4.5 6v5.4c0 4.7 3.2 8 7.5 9.6 4.3-1.6 7.5-4.9 7.5-9.6V6L12 3Z"/><path d="m9 12 2 2 4-4"/>'), description: "避難所・避難指示・道路・安全確保" },
    "ライフライン": { key: "lifeline", icon: svg('<path d="M12 2.8S6.5 9.1 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.1 12 2.8 12 2.8Z"/><path d="M9.5 15.2a2.8 2.8 0 0 0 2.5 1.5"/>'), description: "給水・断水・電気・ガス" },
    "住まい・証明": { key: "housing", icon: svg('<path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z"/><path d="M9 20v-6h6v6M8 8.5h8"/>'), description: "住居・罹災証明・応急住宅" },
    "ごみ・生活": { key: "living", icon: svg('<path d="M4 7h16M9 3h6l1 4H8l1-4ZM6.5 7l1 14h9l1-14M10 11v6M14 11v6"/>'), description: "災害ごみ・入浴・日常生活" },
    "交通": { key: "transport", icon: svg('<rect x="5" y="3" width="14" height="16" rx="3"/><path d="M8 15h8M8 8h8M8 21l2-2M16 19l2 2"/>'), description: "鉄道・バス・移動手段" },
    "施設・学校": { key: "facility", icon: svg('<path d="M3 10 12 5l9 5-9 5-9-5Z"/><path d="M6 12.2V17c3.5 2.4 8.5 2.4 12 0v-4.8M21 10v6"/>'), description: "公共施設・学校・保育" },
    "支援・制度": { key: "support", icon: svg('<path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z"/><path d="M8.5 12h7M12 8.5v7"/>'), description: "相談・給付・寄附・支援制度" },
    "その他": { key: "other", icon: svg('<circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>'), description: "上記以外の公式発信" }
  };
  const allIcon=svg('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>');
  const meta = category => categoryMeta[category] || categoryMeta["その他"];
  const municipalities = [...data.municipalities].sort((a, b) => a.name.localeCompare(b.name, "ja"));
  const query = new URLSearchParams(location.search);
  let selected = municipalities.find(m => m.name === query.get("name"))?.name || municipalities[0].name;
  let active = "すべて", ascending = false;
  const all = municipalities.flatMap(m => m.updates);
  const retrievedLabel = new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeStyle: "short" }).format(new Date(data.metadata.retrievedAt));
  if ($("#updated")) $("#updated").textContent = `公式情報確認 ${retrievedLabel}`;
  const phases = [
    { key: "initial", from: "2026-07-28", to: "2026-07-30", label: "発災直後", description: "避難・安全確認、休止・断水など" },
    { key: "response", from: "2026-07-31", to: "2026-08-03", label: "応急対応", description: "給水、災害ごみ、証明・窓口など" },
    { key: "recovery", from: "2026-08-04", to: "9999-12-31", label: "生活支援・再建", description: "住まい、制度、相談、復旧など" }
  ];
  const phaseFor = date => phases.find(phase => date >= phase.from && date <= phase.to) || phases.at(-1);
  $("#feedRetrieved").textContent = `公式サイト確認日時：${new Intl.DateTimeFormat("ja-JP", { dateStyle: "long", timeStyle: "short" }).format(new Date(data.metadata.retrievedAt))}`;
  $("#feedStats").innerHTML = `<span><b>${municipalities.length}</b>市町村</span><span><b>${all.length}</b>記事リンク</span><span><b>${new Set(all.map(x => x.date)).size}</b>日分</span>`;

  const categoryOverview = document.createElement("section");
  categoryOverview.className = "feed-category-overview";
  categoryOverview.setAttribute("aria-label", "情報分類の内訳");
  $(".feed-controls").before(categoryOverview);
  const periodNav = document.createElement("nav");
  periodNav.className = "feed-period-nav";
  periodNav.setAttribute("aria-label", "発信時期から移動");
  categoryOverview.after(periodNav);

  const categories = Object.keys(categoryMeta).filter(category => all.some(x => x.category === category));
  const renderFilters = municipality => {
    const counts = Object.fromEntries(categories.map(category => [category, municipality.updates.filter(x => x.category === category).length]));
    $("#feedCategories").innerHTML = [`<button type="button" data-category="すべて" aria-pressed="${active === "すべて"}"><span class="filter-icon" aria-hidden="true">${allIcon}</span><span>すべて</span><b>${municipality.updates.length}</b></button>`, ...categories.map(category => {
      const item = meta(category);
      return `<button type="button" class="category-${item.key}" data-category="${esc(category)}" aria-pressed="${active === category}" ${counts[category] ? "" : "disabled"}><span class="filter-icon" aria-hidden="true">${item.icon}</span><span>${esc(category)}</span><b>${counts[category]}</b></button>`;
    })].join("");
    $("#feedCategories").querySelectorAll("button:not([disabled])").forEach(button => button.onclick = () => {
      active = button.dataset.category;
      renderFilters(municipality);
      renderTimeline(false);
    });
    categoryOverview.innerHTML = `<header><div><span>情報の分類</span><b>${esc(municipality.name)}の発信内容</b></div><small>アイコンを選ぶと絞り込めます</small></header><div>${categories.filter(category => counts[category]).map(category => {
      const item = meta(category), ratio = Math.round(counts[category] / municipality.updates.length * 100);
      return `<button type="button" class="category-${item.key}${active === category ? " active" : ""}" data-category="${esc(category)}"><span class="category-symbol" aria-hidden="true">${item.icon}</span><span><b>${esc(category)}</b><small>${esc(item.description)}</small></span><strong>${counts[category]}<small>件</small></strong><i style="--ratio:${ratio}%" aria-hidden="true"></i></button>`;
    }).join("") || `<p>分類できる記事を自動取得で確認できませんでした。</p>`}</div>`;
    categoryOverview.querySelectorAll("button").forEach(button => button.onclick = () => {
      active = active === button.dataset.category ? "すべて" : button.dataset.category;
      renderFilters(municipality);
      renderTimeline(false);
    });
    periodNav.innerHTML = `<header><span>時間の流れ</span><small>7月28日の発災から段階別に移動</small></header><div>${phases.map((phase, index) => {
      const count = municipality.updates.filter(update => update.date >= phase.from && update.date <= phase.to).length;
      return `<button type="button" data-phase="${phase.key}" ${count ? "" : "disabled"}><i>${index + 1}</i><span><b>${phase.label}</b><small>${phase.description}</small></span><strong>${count}件</strong></button>`;
    }).join("")}</div>`;
    periodNav.querySelectorAll("button:not([disabled])").forEach(button => button.onclick = () => {
      const phase = phases.find(item => item.key === button.dataset.phase);
      const target = [...document.querySelectorAll(".feed-day")].find(day => day.dataset.date >= phase.from && day.dataset.date <= phase.to);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const renderList = () => {
    const search = $("#feedMunicipalitySearch").value.trim();
    $("#feedMunicipalityList").innerHTML = municipalities.filter(m => m.name.includes(search)).map(m => `<button type="button" data-name="${esc(m.name)}" class="${m.name === selected ? "active" : ""}" aria-pressed="${m.name === selected}"><span>${esc(m.name)}</span><b>${m.updates.length ? `${m.updates.length}件` : "未検出"}</b></button>`).join("");
    $("#feedMunicipalityList").querySelectorAll("button").forEach(button => button.onclick = () => {
      selected = button.dataset.name; active = "すべて";
      history.replaceState(null, "", `?name=${encodeURIComponent(selected)}`);
      renderList(); renderTimeline();
    });
  };

  const renderTimeline = (refreshFilters = true) => {
    const municipality = municipalities.find(x => x.name === selected);
    if (refreshFilters) renderFilters(municipality);
    const search = $("#feedKeyword").value.trim().toLowerCase();
    const filtered = municipality.updates.filter(x => (active === "すべて" || x.category === active) && `${x.title} ${x.category}`.toLowerCase().includes(search)).sort((a, b) => (ascending ? 1 : -1) * `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`));
    $("#feedMunicipalityHeader").innerHTML = `<div><p>市町村公式サイトの発信記録</p><h2>${esc(municipality.name)}</h2><span>${municipality.updates.length ? `${municipality.updates.length}件を確認` : "自動取得では記事を確認できませんでした"}</span></div><a href="${esc(municipality.officialUrl)}" target="_blank" rel="noopener">${esc(municipality.name)}公式サイトで最新情報を確認 ↗</a>`;
    document.querySelectorAll(".feed-special-link").forEach(link => link.remove());
    const vcMunicipalities = new Set(["熊本市","嘉島町","益城町","八代市","宇土市","宇城市","美里町","御船町","甲佐町","氷川町","芦北町"]);
    if (vcMunicipalities.has(municipality.name)) {
      $("#feedMunicipalityHeader").insertAdjacentHTML("afterend", `<a class="municipality-feature feed-special-link vc-feature-link" href="volunteer-centers.html#${encodeURIComponent(municipality.name)}"><span class="municipality-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.8-7 10-7 10Z"/><path d="M8.5 13h7M12 9.5v7"/></svg></span><span><small>${esc(municipality.name)}｜支援に参加する方へ</small><b>災害ボランティアセンター</b><em>設置場所・活動状況・公式発信を確認</em></span><i>VC情報を見る →</i></a>`);
    }
    if (municipality.name === "宇土市") {
      $("#feedMunicipalityHeader").insertAdjacentHTML("afterend", `<a class="municipality-feature feed-special-link" href="uto-waste.html"><span class="municipality-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM8 7V4h8v3M9 11v5m6-5v5"/></svg></span><span><small>被災された方へ</small><b>災害ごみの持ち込み案内</b><em>品目別の持込先・入場券・地図を分かりやすく確認</em></span><i>案内を見る →</i></a>`);
    }
    if (!municipality.updates.length) { $("#feedTimeline").innerHTML = `<div class="feed-empty"><b>自動取得で確認できませんでした</b><p>公式情報が存在しないという意味ではありません。サイト構造、掲載場所、取得時の応答などにより検出できない場合があります。</p><a href="${esc(municipality.officialUrl)}" target="_blank" rel="noopener">公式サイトを直接確認する ↗</a></div>`; return; }
    if (!filtered.length) { $("#feedTimeline").innerHTML = '<div class="feed-empty"><b>条件に合う記事はありません</b><p>検索語または分類を変更してください。</p></div>'; return; }
    const groups = filtered.reduce((result, item) => ((result[item.date] ??= []).push(item), result), {});
    $("#feedTimeline").innerHTML = Object.entries(groups).map(([date, items]) => { const phase = phaseFor(date); return `<section class="feed-day phase-${phase.key}" data-date="${date}"><header><span class="feed-phase-label">${phase.label}</span><time datetime="${date}">${dateLabel(date)}</time><span>${items.length}件</span></header><div>${items.map(item => {
      const category = meta(item.category);
      return `<article class="category-${category.key}"><div class="article-category"><span class="category-symbol" aria-hidden="true">${category.icon}</span><span><b>${esc(item.category)}</b><small>${esc(category.description)}</small></span>${item.time ? `<time datetime="${date}T${item.time}">${esc(item.time)} 公表</time>` : ""}</div><h3>${esc(item.title)}</h3><a href="${esc(item.url)}" target="_blank" rel="noopener">公式ページで原文を確認 ↗</a></article>`;
    }).join("")}</div></section>`; }).join("");
  };
  $("#feedKeyword").addEventListener("input", () => renderTimeline(false));
  $("#feedMunicipalitySearch").addEventListener("input", renderList);
  $("#feedOrder").onclick = event => { ascending = !ascending; event.currentTarget.textContent = ascending ? "古い順" : "新しい順"; renderTimeline(false); };
  $("#feedOrder").textContent = "新しい順";
  renderList(); renderTimeline();
})();
