(() => {
  "use strict";
  const needs = {
    living: { title: "当面の生活費が心配", intro: "食費や日用品など、まず必要な生活費について整理します。", checks: ["収入が減っていますか", "住まいにも被害がありますか", "現在、支払いが難しいものがありますか"], links: [["市町村の公的情報を確認する", "municipalities.html"]] },
    payments: { title: "税金・保険料・公共料金の支払いが心配", intro: "市税、保険料、年金、公共料金など、何の支払いかを分けて確認します。", checks: ["どの支払いが難しいですか", "請求元や納付先を確認できますか", "期限が近い支払いがありますか"], pending: true, links: [["市町村の公的情報を確認する", "municipalities.html"]] },
    housing: { title: "住宅の修理費・再建費が心配", intro: "お金の問題と住まいの支援を分けずに確認します。", checks: ["住宅の被害を写真に残していますか", "修理前に市町村へ確認しましたか", "罹災証明の手続きを確認しましたか"], links: [["お住まいの市町村の住まい公式情報を見る", "reconstruction-official.html?category=home"], ["市町村の公的情報を確認する", "municipalities.html"]] },
    debt: { title: "住宅ローン・借金の返済が心配", intro: "返済や契約に関する問題は、確認済みの公的・専門窓口へつなぐ必要があります。", checks: ["何の返済に困っていますか", "支払期限はいつですか", "契約書や請求書を確認できますか"], pending: true, links: [["国・熊本県の公的情報を見る", "official.html"]] },
    income: { title: "仕事を休んだ・収入が減った", intro: "生活費と、仕事や事業への影響を分けずに整理します。", checks: ["雇用・仕事を続けられていますか", "いつから収入に影響がありますか", "店舗や設備にも被害がありますか"], links: [["仕事・事業の困りごとへ", "reconstruction.html#needs"], ["市町村の公的情報を確認する", "municipalities.html"]] },
    unknown: { title: "何に当てはまるか分からない", intro: "分からないままでも大丈夫です。制度名ではなく、今困っている支払いを書類や請求元から確認します。", checks: ["今月、特に難しい支払いはありますか", "収入と住まいのどちらにも影響がありますか", "手元に請求書や通知がありますか"], links: [["市町村の公的情報を確認する", "municipalities.html"], ["国・熊本県の公的情報を見る", "official.html"]] }
  };
  const detail = document.querySelector("#money-detail");
  const title = document.querySelector("#money-detail-title");
  const body = document.querySelector("#money-detail-body");
  const open = id => {
    const need = needs[id]; if (!need) return;
    title.textContent = need.title;
    body.innerHTML = `<p class="money-detail-intro">${need.intro}</p><h3>まず確認すること</h3><ul>${need.checks.map(item => `<li>${item}</li>`).join("")}</ul><p class="money-judgment-note">これは制度の対象を判定する質問ではありません。</p>${need.pending ? '<p class="money-pending"><b>現在、相談先の公式情報を確認しています。</b><br>未確認の制度・窓口は掲載していません。</p>' : ""}<div class="money-detail-links">${need.links.map(([label, href]) => `<a href="${href}">${label} <span aria-hidden="true">→</span></a>`).join("")}</div>`;
    detail.hidden = false; detail.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); detail.focus({ preventScroll: true });
  };
  document.querySelectorAll("[data-money-need]").forEach(button => button.addEventListener("click", () => open(button.dataset.moneyNeed)));
  document.querySelector("[data-money-back]")?.addEventListener("click", () => { detail.hidden = true; document.querySelector("#money-needs-title")?.scrollIntoView({ behavior: "smooth" }); document.querySelector("[data-money-need]")?.focus({ preventScroll: true }); });
  const typeLabels = { grant: ["給付", "返す必要のない支援"], loan: ["貸付", "後で返す必要のある支援"], reduction: ["減免", "支払額が減る・免除される可能性"], deferral: ["猶予", "支払い時期を待ってもらえる可能性"], in_kind_or_direct_payment: ["現物給付", "本人への現金支給ではない支援"] };
  const list = document.querySelector("#money-program-list");
  fetch("public-data/reconstruction/money.json", { credentials: "same-origin" }).then(response => { if (!response.ok) throw new Error("load"); return response.json(); }).then(data => {
    const programs = (data.programs || []).slice(0, 5); if (!programs.length) return;
    list.innerHTML = programs.map(program => { const type = typeLabels[program.benefitType] || ["支援", "詳しい内容は公式情報で確認してください"]; const sources = (program.officialSources || []).map(source => `<a href="${source.url}" target="_blank" rel="noopener">制度の公式情報を見る <span aria-hidden="true">↗</span></a>`).join(""); return `<article class="money-program-card"><p><span>${type[0]}</span>${type[1]}</p><h3>${program.title}</h3><p>${program.summary}</p><p class="money-status">${program.availability.label}</p><p><b>関係する支援か、条件を確認してください。</b>対象や申請方法は公式窓口で確認できます。</p><div>${sources || '<span>公式情報へのリンクを確認中です</span>'}<a href="municipalities.html">この制度について公的窓口を確認する</a></div></article>`; }).join("");
  }).catch(() => { /* 静的な安全な空状態を維持する */ });
})();
