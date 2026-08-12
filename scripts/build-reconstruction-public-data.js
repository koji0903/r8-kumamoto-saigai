#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(process.env.RECONSTRUCTION_ROOT || path.join(__dirname, ".."));
const dataDir = path.join(root, "data", "reconstruction");
const outputDir = path.resolve(process.env.RECONSTRUCTION_PUBLIC_OUTPUT || path.join(root, "public-data", "reconstruction"));

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));
}

function validate() {
  const validator = path.join(root, "scripts", "validate-reconstruction-data.js");
  const result = spawnSync(process.execPath, [validator], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    throw new Error("生活再建データ検証に失敗したため、公開用データを生成しませんでした");
  }
}

function publicRecord(entity) {
  return entity.publicationStatus === "published" && !["withdrawn", "expired", "unverified", "pending", "needs_review", "source_unreachable"].includes(entity.verificationStatus);
}

function japaneseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return `${year}年${month}月${day}日確認`;
}

function publicState(status) {
  const labels = {
    confirmed: "公式情報で確認済み",
    pending: "現在、公式情報を確認中です",
    needs_review: "情報が更新された可能性があるため、現在再確認しています",
    expired: "受付は終了しています",
    not_available: "公式情報を確認できていません"
  };
  return { state: status, label: labels[status], confirmed: status === "confirmed" };
}

validate();

const programs = read("programs.json");
const organizations = read("organizations.json");
const applications = read("applications.json");
const statuses = read("municipality-application-statuses.json");
const municipalities = read("municipalities.json");
const sources = read("sources.json");
const sourceLinks = read("source-links.json");
const contacts = read("contacts.json");
const periods = read("application-periods.json");
const documents = read("required-documents.json");
const actions = read("next-actions.json");
const consultationItems = read("consultation-items.json");

const byId = list => new Map(list.map(item => [item.id, item]));
const municipalityById = byId(municipalities);
const organizationById = byId(organizations);
const sourceById = byId(sources);
const sourceLinkById = byId(sourceLinks);
const contactById = byId(contacts);
const periodById = byId(periods);
const documentById = byId(documents);
const roleLabels = { application_office: "申請するところ", general_inquiry: "制度について聞くところ", specialist_consultation: "個別の状況を相談するところ", document_submission: "追加書類を提出するところ", general_information: "一般的な案内を聞くところ", unknown: "役割を公式情報で確認" };
const scopeLabels = { national: "国の案内で確認できる書類", prefectural: "熊本県の案内で確認できる書類", municipal: "市町村の受付で案内されている書類" };
const requirementLabels = { required: "必要", conditional: "場合によって必要", recommended: "あると確認しやすい", check_with_office: "自治体の案内で確認", unknown: "必要か公式情報で確認" };
const submissionLabels = { original: "原本", copy: "写し", either: "原本または写し", not_specified: "原本・写しの指定は公式情報で確認" };
const conditionLabels = { housing_damage: "住まいの被害", household_type: "世帯", housing_type: "住まいの種類", residency_status: "現在の住まい方", income_condition: "収入・資力", age_condition: "年齢", disability_condition: "障害", care_condition: "介護", business_type: "仕事・事業", agriculture_fishery_condition: "農業・漁業", contract_status: "契約状況", other_program_usage: "ほかの制度", other_conditions: "その他" };

function officialSources(linkIds) {
  const seen = new Set();
  return (linkIds || []).flatMap(id => {
    const link = sourceLinkById.get(id);
    const source = link && sourceById.get(link.sourceId);
    if (!source || source.status !== "active" || seen.has(source.id)) return [];
    seen.add(source.id);
    return [{ title: source.title, url: source.url, organization: organizationById.get(source.organizationId)?.name || "公的機関" }];
  });
}

function verifiedFact(entity, claimTypes) {
  if (!entity) return false;
  if (entity.verificationStatus === "verified") return true;
  return (entity.sourceLinkIds || []).some(id => {
    const link = sourceLinkById.get(id);
    const source = link && sourceById.get(link.sourceId);
    return link?.verifiedAt && claimTypes.includes(link.claimType) && source?.status === "active";
  });
}

function contactRoles(contact) { return [...new Set([contact.contactRole, ...(contact.contactRoles || [])].filter(Boolean))]; }
function isCurrentContact(contact) {
  return contact && contact.publicationStatus === "published" && contact.verificationStatus === "verified" && contact.freshnessStatus === "fresh" && contact.checkedAt && (!contact.validUntil || new Date(contact.validUntil) >= new Date()) && officialSources(contact.sourceLinkIds).length > 0;
}
function contactView(contact) {
  const roles = contactRoles(contact);
  return { name: contact.name, organization: organizationById.get(contact.organizationId)?.name || "公的機関", roles, roleLabels: roles.map(role => roleLabels[role]), phone: contact.phone || null, hours: contact.hours || null, closedDays: contact.closedDays || null, address: contact.address || null, officialUrl: contact.officialUrl || officialSources(contact.sourceLinkIds)[0]?.url || null, methods: contact.methods, temporary: contact.isTemporary, validUntil: contact.validUntil };
}
function documentVisible(document, municipalityId) {
  return document?.verificationStatus === "verified" && officialSources(document.sourceLinkIds).length > 0 && (document.scopeLevel !== "municipal" || document.scopeMunicipalityIds.includes(municipalityId));
}
function documentView(document) { return { id: document.id, name: document.name, description: document.plainLanguageDescription, requiredLevel: document.requiredLevel, requiredLabel: requirementLabels[document.requiredLevel], scope: document.scopeLevel, scopeLabel: document.scopeLevel === "municipal" ? "この市町村の受付で案内されている書類" : scopeLabels[document.scopeLevel], submissionForm: document.submissionForm, submissionLabel: submissionLabels[document.submissionForm] }; }
function conditionVisible(condition, municipalityId = null) {
  if (!condition || condition.certainty !== "confirmed" || condition.verificationStatus !== "verified" || !condition.checkedAt || !officialSources(condition.sourceLinkIds).length) return false;
  return condition.scope !== "municipal" ? condition.municipalityIds.length === 0 : Boolean(municipalityId) && condition.municipalityIds.length === 1 && condition.municipalityIds[0] === municipalityId;
}
function conditionView(condition) { return { id: condition.id, label: conditionLabels[condition.field], description: condition.plainLanguageDescription, groupOperator: condition.groupOperator, scope: condition.scope }; }

function municipalityView(application, status, municipality) {
  const implementationConfirmed = status && status.implementationStatus === "confirmed" && verifiedFact(status, ["eligible_area"]);
  const receptionConfirmed = status && status.receptionStatus === "confirmed" && status.verificationStatus === "verified";
  let statusLabel = `${municipality.name}での個別受付情報を確認中`;
  if (receptionConfirmed) statusLabel = `${municipality.name}で受付を確認済み`;
  else if (status?.receptionStatus === "closed") statusLabel = `${municipality.name}での受付は終了しています`;
  else if (implementationConfirmed) statusLabel = `${municipality.name}は対象地域です。申請方法を確認中`;

  let contact = null;
  const contactGroups = { application: [], inquiry: [], consultation: [], documentSubmission: [], generalInformation: [] };
  if (status?.contactStatus === "confirmed" && status.verificationStatus === "verified") {
    for (const candidate of status.contactPointIds.map(id => contactById.get(id)).filter(isCurrentContact)) {
      const view = contactView(candidate), roles = new Set(view.roles);
      if (roles.has("application_office")) contactGroups.application.push(view);
      if (roles.has("general_inquiry")) contactGroups.inquiry.push(view);
      if (roles.has("specialist_consultation")) contactGroups.consultation.push(view);
      if (roles.has("document_submission")) contactGroups.documentSubmission.push(view);
      if (roles.has("general_information")) contactGroups.generalInformation.push(view);
    }
    const candidate = contactGroups.application[0];
    if (candidate) contact = { name: candidate.name, phone: candidate.phone, hours: candidate.hours, url: candidate.officialUrl };
  }

  const documentIds = [...new Set([...(application.requiredDocumentIds || []), ...(status?.requiredDocumentIds || [])])];
  const municipalityDocuments = documentIds.map(id => documentById.get(id)).filter(document => documentVisible(document, municipality.id)).map(documentView);
  const prefectureNames = new Set(municipalityDocuments.filter(item => item.scope === "prefectural").map(item => item.name));
  const municipalNames = new Set(municipalityDocuments.filter(item => item.scope === "municipal").map(item => item.name));
  const hasDocumentDifference = municipalNames.size > 0 && ([...prefectureNames].some(name => !municipalNames.has(name)) || [...municipalNames].some(name => !prefectureNames.has(name)));
  const methodConfirmed = status?.applicationMethodStatus === "confirmed" && status.verificationStatus === "verified" && (status.sourceLinkIds || []).some(id => sourceLinkById.get(id)?.claimType === "application_method");
  const generalConditions = (application.eligibilityConditions || []).filter(item => conditionVisible(item)).map(conditionView);
  const localConditions = (status?.localEligibilityConditions || []).filter(item => conditionVisible(item, municipality.id)).map(conditionView);
  const mainConditions = [...generalConditions, ...localConditions].slice(0, 4);

  const deadlinePeriod = status?.applicationPeriodIds.map(id => periodById.get(id)).find(item => item?.periodPurpose === "application_window" && item.deadlineAt && item.verificationStatus === "verified");
  return {
    id: municipality.id,
    name: municipality.name,
    officialUrl: municipality.officialUrl,
    statusLabel,
    reception: publicState(receptionConfirmed ? "confirmed" : status?.receptionStatus === "closed" ? "expired" : "pending"),
    applicationMethodLabel: methodConfirmed ? "申請方法を公式情報で確認済み" : "申請方法を確認中",
    applicationMethod: methodConfirmed ? application.applicationMethod : null,
    contact,
    contacts: contactGroups,
    documents: municipalityDocuments,
    documentNotice: hasDocumentDifference ? "提出書類について自治体の最新案内をご確認ください。" : null,
    mainConditions,
    conditionNotice: mainConditions.length ? "ここにあるのは主な条件です。対象になるかどうかを判定するものではありません。詳しい条件は自治体の最新案内で確認してください。" : "対象条件の詳しい内容は、自治体の最新案内をご確認ください。",
    deadline: deadlinePeriod ? { label: `申込期限：${deadlinePeriod.deadlineAt.slice(0, 10)}`, date: deadlinePeriod.deadlineAt } : null,
    fallback: contact ? null : `最新情報は${municipality.name}公式情報をご確認ください。相談先が確認でき次第更新します。`
  };
}

const publicPrograms = programs.filter(publicRecord).map(program => {
  const application = applications.find(item => item.programId === program.id && publicRecord(item));
  const applicationConfirmed = application && application.applicationStatus === "active" && verifiedFact(application, ["disaster_application"]);
  const municipalityViews = application ? application.municipalityIds.map(id => {
    const municipality = municipalityById.get(id);
    const status = statuses.find(item => item.applicationId === application.id && item.municipalityId === id);
    return municipality ? municipalityView(application, status, municipality) : null;
  }).filter(Boolean) : [];

  const publicActions = actions.filter(action => {
    const actionSources = officialSources(action.sourceLinkIds);
    return action.programIds.includes(program.id) && action.publicationStatus === "published" && action.verificationStatus === "verified" && actionSources.length > 0;
  }).sort((a, b) => (a.order || 99) - (b.order || 99)).slice(0, 2).map(action => ({
    title: action.title,
    description: action.description,
    actionType: action.actionType,
    urgency: action.urgency,
    order: action.order,
    doBefore: action.doBefore || null,
    doNotDoYet: action.doNotDoYet || null,
    highRisk: ["check_before_contract", "deadline", "photograph", "medical", "safety", "demolition", "repair"].includes(action.actionType),
    verificationStatus: action.verificationStatus,
    officialSources: officialSources(action.sourceLinkIds)
  }));
  const publicDocuments = application ? application.requiredDocumentIds.map(id => documentById.get(id)).filter(document => documentVisible(document, null) && document.scopeLevel !== "municipal").map(documentView) : [];
  const publicConsultationItems = consultationItems.filter(item => item.programIds.includes(program.id) && item.publicationStatus === "published" && item.verificationStatus === "verified").sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 3).map(item => ({ prompt: item.supporterPrompt, reason: item.reason, unknownHandling: item.unknownHandling, disclaimer: "対象かどうかを判断するチェック表ではありません。相談先で状況を伝えるための確認項目です。" }));
  const sourceIds = [...(program.sourceLinkIds || []), ...(application?.sourceLinkIds || [])];
  const lastChecked = application?.lastCheckedAt || program.updatedAt;

  return {
    id: program.id,
    title: program.displayName,
    officialName: program.officialName,
    summary: program.verificationStatus === "verified" || verifiedFact(program, ["general_description"]) ? (program.audienceSummary || program.shortDescription) : "制度の詳しい内容を公式情報で確認中です。",
    category: program.categories[0],
    categories: program.categories,
    benefitType: program.benefitType,
    providerType: program.providerType,
    governmentLevel: program.governmentLevel,
    availability: publicState(applicationConfirmed ? "confirmed" : application?.verificationStatus === "needs_review" ? "needs_review" : "pending"),
    municipalities: municipalityViews,
    nextSteps: publicActions,
    warnings: program.verificationStatus === "verified" ? program.importantWarnings : [],
    documents: publicDocuments,
    mainConditions: application ? (application.eligibilityConditions || []).filter(item => conditionVisible(item)).slice(0, 4).map(conditionView) : [],
    conditionNotice: "表示しているのは主な条件のみです。本サイトでは対象可否を判定しません。自治体の最新案内で確認してください。",
    consultationItems: publicConsultationItems,
    officialSources: officialSources(sourceIds),
    lastCheckedLabel: japaneseDate(lastChecked)
  };
});

const municipalityOutput = publicPrograms.flatMap(program => program.municipalities.map(municipality => ({ programId: program.id, ...municipality })));
const categoryOutput = [...new Set(publicPrograms.map(program => program.category))].map(id => ({ id, count: publicPrograms.filter(program => program.category === id).length }));
const homeOutput = {
  title: "家が壊れた",
  intro: "まず、住まいの被害状況と自治体の公式情報を確認してください。",
  checks: ["お住まいの自治体を選ぶ", "公式情報で確認済みの内容と、確認中の内容を分けて見る"],
  programs: publicPrograms.filter(program => program.category === "home")
};
const moneyOutput = {
  title: "お金・支払い",
  intro: "生活費や支払いの困りごとから、確認済みの支援を探します。",
  programs: publicPrograms.filter(program => program.categories.includes("money") && program.availability.confirmed).slice(0, 5)
};

fs.mkdirSync(outputDir, { recursive: true });
for (const [name, value] of [["programs.json", publicPrograms], ["municipalities.json", municipalityOutput], ["categories.json", categoryOutput], ["home.json", homeOutput], ["money.json", moneyOutput]]) {
  fs.writeFileSync(path.join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`);
}

console.log(`生活再建の公開用データを生成しました: ${outputDir}`);
console.log(`programs: ${publicPrograms.length}件 / municipality views: ${municipalityOutput.length}件`);
