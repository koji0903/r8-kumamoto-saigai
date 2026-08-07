(() => {
  const categoryStyles = document.createElement("link"); categoryStyles.rel = "stylesheet"; categoryStyles.href = "municipality-categories.css"; document.head.append(categoryStyles);
  const data = window.MUNICIPALITY_UPDATES;
  if (!data) return;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const dateLabel = date => new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(new Date(`${date}T12:00:00+09:00`));
  const categoryMeta = {
    "避難・安全": { key: "safety", icon: "避", description: "避難所・避難指示・道路・安全確保" },
    "ライフライン": { key: "lifeline", icon: "水", description: "給水・断水・電気・ガス" },
    "住まい・証明": { key: "housing", icon: "住", description: "住居・罹災証明・応急住宅" },
    "ごみ・生活": { key: "living", icon: "暮", description: "災害ごみ・入浴・日常生活" },
    "交通": { key: "transport", icon: "交", description: "鉄道・バス・移動手段" },
    "施設・学校": { key: "facility", icon: "施", description: "公共施設・学校・保育" },
    "支援・制度": { key: "support", icon: "支", description: "相談・給付・寄附・支援制度" },
    "その他": { key: "other", icon: "他", description: "上記以外の公式発信" }
  };
  const meta = category => categoryMeta[category] || categoryMeta["その他"];
  const municipalities = [...data.municipalities].sort((a, b) => a.name.localeCompare(b.name, "ja"));
  const query = new URLSearchParams(location.search);
  let selected = municipalities.find(m => m.name === query.get("name"))?.name || municipalities[0].name;
  let active = "すべて", ascending = true;
  const all = municipalities.flatMap(m => m.updates);
  $("#feedRetrieved").textContent = `公式サイト確認日時：${new Intl.DateTimeFormat("ja-JP", { dateStyle: "long", timeStyle: "short" }).format(new Date(data.metadata.retrievedAt))}`;
  $("#feedStats").innerHTML = `<span><b>${municipalities.length}</b>市町村</span><span><b>${all.length}</b>記事リンク</span><span><b>${new Set(all.map(x => x.date)).size}</b>日分</span>`;

  const categoryOverview = document.createElement("section");
  categoryOverview.className = "feed-category-overview";
  categoryOverview.setAttribute("aria-label", "情報分類の内訳");
  $(".feed-controls").before(categoryOverview);

  const categories = Object.keys(categoryMeta).filter(category => all.some(x => x.category === category));
  const renderFilters = municipality => {
    const counts = Object.fromEntries(categories.map(category => [category, municipality.updates.filter(x => x.category === category).length]));
    $("#feedCategories").innerHTML = [`<button type="button" data-category="すべて" aria-pressed="${active === "すべて"}"><span class="filter-icon">全</span><span>すべて</span><b>${municipality.updates.length}</b></button>`, ...categories.map(category => {
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
    if (!municipality.updates.length) { $("#feedTimeline").innerHTML = `<div class="feed-empty"><b>自動取得で確認できませんでした</b><p>公式情報が存在しないという意味ではありません。サイト構造、掲載場所、取得時の応答などにより検出できない場合があります。</p><a href="${esc(municipality.officialUrl)}" target="_blank" rel="noopener">公式サイトを直接確認する ↗</a></div>`; return; }
    if (!filtered.length) { $("#feedTimeline").innerHTML = '<div class="feed-empty"><b>条件に合う記事はありません</b><p>検索語または分類を変更してください。</p></div>'; return; }
    const groups = filtered.reduce((result, item) => ((result[item.date] ??= []).push(item), result), {});
    $("#feedTimeline").innerHTML = Object.entries(groups).map(([date, items]) => `<section class="feed-day"><header><time datetime="${date}">${dateLabel(date)}</time><span>${items.length}件</span></header><div>${items.map(item => {
      const category = meta(item.category);
      return `<article class="category-${category.key}"><div class="article-category"><span class="category-symbol" aria-hidden="true">${category.icon}</span><span><b>${esc(item.category)}</b><small>${esc(category.description)}</small></span>${item.time ? `<time datetime="${date}T${item.time}">${esc(item.time)} 公表</time>` : ""}</div><h3>${esc(item.title)}</h3><a href="${esc(item.url)}" target="_blank" rel="noopener">公式ページで原文を確認 ↗</a></article>`;
    }).join("")}</div></section>`).join("");
  };
  $("#feedKeyword").addEventListener("input", () => renderTimeline(false));
  $("#feedMunicipalitySearch").addEventListener("input", renderList);
  $("#feedOrder").onclick = event => { ascending = !ascending; event.currentTarget.textContent = ascending ? "古い順" : "新しい順"; renderTimeline(false); };
  renderList(); renderTimeline();
})();
