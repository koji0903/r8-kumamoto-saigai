"use strict";

const $ = selector => document.querySelector(selector);
const create = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

const safeHome = {
  title: "家が壊れた",
  intro: "まず、家の状況と自治体の公式情報を確認しましょう。",
  checks: ["お住まいの自治体を選ぶ", "公式情報で確認済みの内容と、確認中の内容を分けて見る"]
};

function iconMarkup() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5V21H3v-9.5Z"/><path d="M9 21v-6h6v6M15.5 7 13 12l3 1-2 4"/></svg>';
}

function loadFixture() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "test/fixtures/reconstruction/fixture.js";
    script.onload = () => resolve(window.RECONSTRUCTION_FIXTURE);
    script.onerror = reject;
    document.head.append(script);
  });
}

function isPrivateTestHost(hostname) {
  if (["localhost", "127.0.0.1", "::1"].includes(hostname)) return true;
  if (/^10(?:\.\d{1,3}){3}$/.test(hostname) || /^192\.168(?:\.\d{1,3}){2}$/.test(hostname)) return true;
  const match = hostname.match(/^172\.(\d{1,3})(?:\.\d{1,3}){2}$/);
  return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}

async function loadData() {
  const fixtureRequested = new URLSearchParams(location.search).get("fixture") === "1";
  const localOnly = location.protocol === "file:" || isPrivateTestHost(location.hostname);
  if (fixtureRequested && localOnly) {
    const fixture = await loadFixture();
    if (!fixture?.marker?.includes("NOT FOR PRODUCTION")) throw new Error("安全なfixture識別子がありません");
    $("#demoBanner").hidden = false;
    return { home: fixture.home, programs: fixture.programs, demo: true };
  }

  const [homeResponse, programsResponse] = await Promise.all([
    fetch("public-data/reconstruction/home.json", { cache: "no-store" }),
    fetch("public-data/reconstruction/programs.json", { cache: "no-store" })
  ]);
  if (!homeResponse.ok || !programsResponse.ok) throw new Error("公開用データを取得できませんでした");
  return { home: await homeResponse.json(), programs: await programsResponse.json(), demo: false };
}

function renderChecks(home, programs) {
  const verifiedSteps = programs.flatMap(program => program.nextSteps || []).slice(0, 3);
  const actionChecks = verifiedSteps.map(step => `${step.title}。${step.description}`);
  const checks = [...new Set([...actionChecks, ...(home.checks || safeHome.checks)])].slice(0, 3);
  $("#homeIntro").textContent = home.intro || safeHome.intro;
  const list = $("#firstChecks");
  list.replaceChildren(...checks.map(check => create("li", "", check)));
}

function statusRow(label, value, pending = false, note = null) {
  const row = create("div", `meaning-status${pending ? " pending" : ""}`);
  row.append(create("span", "", label), create("b", "", value));
  if (note) row.append(create("small", "", note));
  return row;
}

function detailSection(title) {
  const section = create("section", "detail-section");
  section.append(create("h4", "", title));
  return section;
}

function pendingText(text = "現在、公式情報を確認中です。") {
  return create("p", "pending-message", text);
}

function renderSupporter(program, index) {
  const details = create("details", "supporter-details");
  const summary = create("summary", "", "相談を受けている方はこちら");
  details.append(summary);
  const content = create("div", "supporter-content");
  content.append(create("p", "", "何を確認し、分からないことをどこへつなぐか整理するための項目です。対象かどうかを判定するものではありません。チェック内容は保存されません。"));
  const items = (program.consultationItems || []).slice(0, 3);
  if (!items.length) content.append(pendingText("支援者向けの確認項目は、現在公式情報と照合しています。"));
  items.forEach((item, itemIndex) => {
    const row = create("div", "support-check");
    const checkbox = create("input");
    checkbox.type = "checkbox";
    checkbox.id = `support-check-${index}-${itemIndex}`;
    const label = create("label");
    label.htmlFor = checkbox.id;
    label.append(document.createTextNode(item.prompt));
    if (item.unknownHandling) label.append(create("small", "", `分からない場合：${item.unknownHandling}`));
    row.append(checkbox, label);
    content.append(row);
  });
  content.append(create("p", "", "対象かどうかを断定せず、必要に応じて制度の公式窓口へ確認してください。"));
  details.append(content);
  return details;
}

function renderProgram(program, index) {
  const card = create("article", "program-card");
  card.setAttribute("aria-labelledby", `program-title-${index}`);
  const summary = create("div", "program-summary");
  const icon = create("span", "program-icon");
  icon.innerHTML = iconMarkup();
  const copy = create("div");
  const title = create("h3", "", program.title);
  title.id = `program-title-${index}`;
  copy.append(title, create("p", "", program.summary || "制度の詳しい内容を公式情報で確認中です。"));
  const municipality = program.municipalities?.[0];
  const firstAction = program.nextSteps?.[0];
  const nextPreview = create("div", "next-action-preview");
  nextPreview.append(create("span", "", "まずすること"), create("b", "", firstAction ? firstAction.title : "自治体の公式情報を確認してください"));
  copy.append(nextPreview);
  const statuses = create("div", "meaning-statuses");
  const sourceUpdated = program.availability?.state === "needs_review";
  statuses.append(statusRow("今回の災害について", sourceUpdated ? "公式情報が更新されたため、内容を再確認しています" : program.availability?.confirmed ? "制度の実施を確認済み" : "制度の実施状況を公式情報で確認しています", !program.availability?.confirmed, sourceUpdated ? "最新情報は公式ページもあわせてご確認ください。" : "この表示だけで、あなたが対象になるとは決まりません。"));
  statuses.append(statusRow("あなたの場合", "対象になるかは条件の確認が必要です", false, "世帯や住宅の状況などで条件が異なります。自分だけで判断せず、窓口へご相談ください。"));
  if (municipality) {
    const receptionState = municipality.reception?.state;
    const receptionValue = municipality.reception?.confirmed ? "受付を確認済み" : receptionState === "expired" ? "受付は終了しています" : receptionState === "not_started" ? `${municipality.name}の受付開始を確認しています` : "詳しい申請方法を確認しています";
    const receptionNote = municipality.reception?.confirmed || receptionState === "expired" ? null : "制度が利用できないという意味ではありません。市町村によって手続きが異なる場合があります。";
    statuses.append(statusRow(municipality.name, receptionValue, !municipality.reception?.confirmed, receptionNote));
  }
  copy.append(statuses);
  const toggle = create("button", "detail-toggle", "支援内容・相談先を詳しく見る ＋");
  const panelId = `program-detail-${index}`;
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", panelId);
  summary.append(icon, copy, toggle);
  card.append(summary);

  const detail = create("div", "program-detail");
  detail.id = panelId;
  detail.hidden = true;

  const overview = detailSection("どんな支援？");
  overview.append(create("p", "", program.summary || "現在、公式情報を確認中です。"));
  detail.append(overview);

  const steps = detailSection("まず確認すること");
  if (program.nextSteps?.length) {
    const list = create("ol");
    program.nextSteps.forEach(step => { const item = create("li"); item.append(create("b", "", step.title), document.createTextNode(` ${step.description}`)); list.append(item); });
    steps.append(list);
  } else steps.append(pendingText("確認済みの案内を準備しています。最新情報は公式窓口でご確認ください。"));
  detail.append(steps);

  if (program.warnings?.length) {
    const warnings = detailSection("まだしない方がよいこと");
    const list = create("ul", "warning-box");
    program.warnings.forEach(warning => list.append(create("li", "", warning)));
    warnings.append(list);
    detail.append(warnings);
  }

  const local = detailSection(municipality ? `${municipality.name}での状況` : "お住まいの自治体での状況");
  const localBody = create("div", "municipality-detail");
  if (municipality) {
    localBody.append(municipality.reception?.confirmed ? create("p", "", municipality.statusLabel) : pendingText(municipality.statusLabel));
    if (municipality.fallback) localBody.append(create("p", "", municipality.fallback));
    if (municipality.officialUrl) { const link = create("a", "", `${municipality.name}公式情報を見る ↗`); link.href = municipality.officialUrl; link.target = "_blank"; link.rel = "noopener"; localBody.append(link); }
  } else localBody.append(pendingText("自治体ごとの受付情報を確認しています。"));
  local.append(localBody);
  detail.append(local);

  const deadline = detailSection("期限");
  deadline.append(municipality?.deadline ? create("p", "", municipality.deadline.label) : pendingText());
  detail.append(deadline);

  const documents = detailSection("必要なもの");
  if (program.documents?.length) { const list = create("ul"); program.documents.forEach(document => list.append(create("li", "", document.name))); documents.append(list); }
  else documents.append(pendingText());
  detail.append(documents);

  const contact = detailSection("自分の場合を相談する");
  contact.id = `program-contact-${index}`;
  if (municipality?.contact) {
    contact.append(create("p", "", municipality.contact.name));
    if (municipality.contact.hours) contact.append(create("p", "contact-hours", `受付時間 ${municipality.contact.hours}`));
    if (municipality.contact.phone) {
      const phone = create("a", "contact-phone", `電話をかける ${municipality.contact.phone}`);
      phone.href = `tel:${municipality.contact.phone.replace(/[^0-9+]/g, "")}`;
      contact.append(phone);
    }
    if (municipality.contact.url) {
      const contactLink = create("a", "contact-official-link", "自分の場合を相談する（公式窓口） ↗");
      contactLink.href = municipality.contact.url;
      contactLink.target = "_blank";
      contactLink.rel = "noopener";
      contact.append(contactLink);
    }
  } else contact.append(pendingText("自治体の相談・申請窓口を現在確認しています。制度の対象外という意味ではありません。"));
  detail.append(contact);

  const sources = detailSection("制度の内容を確認する");
  const sourceList = create("div", "source-list");
  if (program.officialSources?.length) program.officialSources.forEach(source => {
    const link = create("a"); link.href = source.url; link.target = "_blank"; link.rel = "noopener";
    link.append(create("span", "", `${source.organization}が発表した正式な情報`), create("b", "", `制度の公式情報を見る：${source.title} ↗`)); sourceList.append(link);
  });
  else sourceList.append(pendingText());
  sources.append(sourceList);
  if (program.lastCheckedLabel) sources.append(create("p", "formal-name", `情報確認：${program.lastCheckedLabel}`));
  detail.append(sources);

  const formal = detailSection("正式な制度名");
  formal.append(create("p", "formal-name", program.officialName || "現在、公式情報を確認中です。"));
  formal.append(renderSupporter(program, index));
  detail.append(formal);

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.textContent = expanded ? "支援内容・相談先を詳しく見る ＋" : "支援内容を閉じる −";
    detail.hidden = expanded;
  });
  card.append(detail);
  return card;
}

function render(data) {
  const programs = Array.isArray(data.programs) ? data.programs : [];
  renderChecks(data.home || safeHome, programs);
  $("#loadingState").hidden = true;
  $("#emptyState").hidden = programs.length > 0;
  $("#programList").replaceChildren(...programs.map(renderProgram));
}

loadData().then(render).catch(error => {
  render({ home: safeHome, programs: [] });
  const note = create("p", "load-error-note", "公開情報を読み込めませんでした。時間をおいて再度ご確認ください。");
  $("#emptyState").append(note);
  console.warn(error);
});
