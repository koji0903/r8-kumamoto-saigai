/**
 * 宇土市 被災者支援制度ハンドブック 検索ガイド
 * 絞り込み（り災判定・分野・種類・対象者・キーワード・期限・申請不要）と件数表示。
 * 入力内容は保存も送信もしない。
 */
(() => {
  const printBtn = document.getElementById("printGuideBtn");
  if (printBtn) printBtn.addEventListener("click", () => window.print());

  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    const updateBackToTop = () => {
      backToTopBtn.hidden = window.scrollY < 600;
    };

    backToTopBtn.addEventListener("click", () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    updateBackToTop();
  }

  const list = document.getElementById("uhList");
  if (!list) return;

  const cards = [...list.querySelectorAll(".uh-card")];
  const sections = [...list.querySelectorAll(".uh-section")];
  const fDamage = document.getElementById("fDamage");
  const fCat = document.getElementById("fCat");
  const fType = document.getElementById("fType");
  const fWho = document.getElementById("fWho");
  const fSearch = document.getElementById("fSearch");
  const fDeadline = document.getElementById("fDeadline");
  const fNoapply = document.getElementById("fNoapply");
  const fReset = document.getElementById("fReset");
  const fCount = document.getElementById("fCount");
  const fActive = document.getElementById("fActive");
  const fEmpty = document.getElementById("fEmpty");
  const quickButtons = [...document.querySelectorAll(".uh-quick")];

  // 原本の印刷ページとPDFビューア上のページを対応させる。
  // 制度61「持続的生産強化対策事業」のみ印刷ページ64～65の2ページ構成。
  const sourcePdf = "https://www.city.uto.lg.jp/d?q=64a2f70ed8565cbae8ab6cc0030be8e7.pdf";
  cards.forEach((card, index) => {
    const printedPage = index <= 60 ? index + 4 : index + 5;
    const printedLabel = index === 60 ? "64～65" : String(printedPage);
    const pdfPage = printedPage + 2;
    const link = document.createElement("a");
    link.className = "uh-source-page";
    link.href = `${sourcePdf}#page=${pdfPage}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = `原本 p.${printedLabel} を確認 ↗`;
    link.setAttribute("aria-label", `${card.querySelector("h3")?.textContent?.trim() || "制度"}の原本掲載ページを開く`);
    card.insertBefore(link, card.querySelector(".uh-card-tags"));
  });

  // 「制度の要点」と「申請前の確認事項」を上下に分け、
  // 一覧を流し読みしても支援内容・対象・期限を先に把握できるようにする。
  cards.forEach(card => {
    const overview = document.createElement("div");
    overview.className = "uh-card-overview";
    const details = document.createElement("div");
    details.className = "uh-card-body";
    const detailsTitle = document.createElement("h4");
    detailsTitle.className = "uh-card-body-title";
    detailsTitle.textContent = "申請前に確認すること";
    details.append(detailsTitle);

    const overviewClasses = ["uh-card-head", "uh-card-amount", "uh-card-deadline", "uh-card-lead", "uh-card-target"];
    [...card.children].forEach(child => {
      if (overviewClasses.some(className => child.classList.contains(className))) {
        overview.append(child);
      } else {
        details.append(child);
      }
    });
    card.classList.add("is-summary-layout");
    card.append(overview, details);
  });

  // 各制度の data-damage には、その制度が対象とする判定区分がすべて並んでいる。
  // 例）住宅の応急修理は準半壊以上なので "z,d,c,h,j"、生活再建支援金は半壊以上なので "z,d,c,h"。
  // したがって「選んだ判定が含まれているか」を見れば足りる（全壊を選べば準半壊以上の制度も残る）。
  const damageMatches = (selected, attr) => {
    if (!selected) return true;
    if (attr === "any") return true;
    if (selected === "none") return false; // 判定なし・一部損壊は「判定を問わない制度」のみ
    return attr.split(",").includes(selected);
  };

  const normalize = text => text.toLowerCase().replace(/\s+/g, "");

  const labelOf = (select) => select.options[select.selectedIndex]?.textContent?.trim() || "";

  const apply = () => {
    const damage = fDamage.value;
    const cat = fCat.value;
    const type = fType.value;
    const who = fWho.value;
    const keyword = normalize(fSearch.value);
    const onlyDeadline = fDeadline.checked;
    const onlyNoapply = fNoapply.checked;

    let shown = 0;
    for (const card of cards) {
      let ok = damageMatches(damage, card.dataset.damage);
      if (ok && cat) ok = card.dataset.cat === cat;
      if (ok && type) ok = card.dataset.type === type;
      // who="both" の制度は住民・事業者どちらで絞っても残す
      if (ok && who) ok = card.dataset.who === who || card.dataset.who === "both";
      if (ok && onlyDeadline) ok = card.dataset.deadline === "1";
      if (ok && onlyNoapply) ok = card.dataset.noapply === "1";
      if (ok && keyword) ok = normalize(card.dataset.search).includes(keyword);
      card.hidden = !ok;
      if (ok) shown += 1;
    }

    // 中身が全部隠れたセクションは見出しごと隠す
    for (const section of sections) {
      const visible = [...section.querySelectorAll(".uh-card")].filter(card => !card.hidden).length;
      section.hidden = visible === 0;
      const counter = section.querySelector(".uh-sec-count");
      if (counter) {
        const total = section.querySelectorAll(".uh-card").length;
        counter.textContent = visible === total ? `（${total}件）` : `（${total}件中 ${visible}件）`;
      }
    }

    fCount.textContent = String(shown);
    fEmpty.hidden = shown !== 0;

    const chips = [];
    if (damage) chips.push(labelOf(fDamage));
    if (cat) chips.push(labelOf(fCat));
    if (type) chips.push(labelOf(fType));
    if (who) chips.push(labelOf(fWho));
    if (onlyDeadline) chips.push("期限あり");
    if (onlyNoapply) chips.push("申請不要");
    if (fSearch.value.trim()) chips.push(`「${fSearch.value.trim()}」`);
    fActive.textContent = chips.length ? `（${chips.join(" / ")}）` : "";
  };

  for (const el of [fDamage, fCat, fType, fWho, fDeadline, fNoapply]) {
    el.addEventListener("change", apply);
  }
  fSearch.addEventListener("input", apply);

  const clearFilters = () => {
    fDamage.value = "";
    fCat.value = "";
    fType.value = "";
    fWho.value = "";
    fSearch.value = "";
    fDeadline.checked = false;
    fNoapply.checked = false;
  };

  fReset.addEventListener("click", () => {
    clearFilters();
    apply();
    document.getElementById("finder")?.scrollIntoView({ block: "start" });
  });

  // 制度名を知らない方のための、困りごと別ワンタップ検索。
  for (const button of quickButtons) {
    button.addEventListener("click", () => {
      clearFilters();
      if (button.dataset.quickCat) fCat.value = button.dataset.quickCat;
      if (button.dataset.quickType) fType.value = button.dataset.quickType;
      if (button.dataset.quickWho) fWho.value = button.dataset.quickWho;
      if (button.dataset.quickDeadline === "1") fDeadline.checked = true;
      apply();
      document.getElementById("finder")?.scrollIntoView({ block: "start" });
      requestAnimationFrame(() => fCount?.focus?.({ preventScroll: true }));
    });
  }

  // 期限カードなどから制度へ飛んだとき、絞り込みで隠れていたら解除して表示する
  const revealFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id.startsWith("p-")) return;
    const target = document.getElementById(id);
    if (target && target.hidden) {
      fReset.click();
    }
    // カードを2領域に組み替えると高さが変わるため、初期アンカー位置も計算し直す。
    requestAnimationFrame(() => target?.scrollIntoView({ block: "start" }));
  };
  window.addEventListener("hashchange", revealFromHash);

  // 印刷時は絞り込みを解除せず、表示中のものだけを印刷する（そのままでよい）
  apply();
  revealFromHash();
})();
