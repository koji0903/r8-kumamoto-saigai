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
  return entity.publicationStatus === "published" && !["withdrawn", "expired", "unverified", "pending"].includes(entity.verificationStatus);
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

function municipalityView(application, status, municipality) {
  const implementationConfirmed = status && status.implementationStatus === "confirmed" && verifiedFact(status, ["eligible_area"]);
  const receptionConfirmed = status && status.receptionStatus === "confirmed" && status.verificationStatus === "verified";
  let statusLabel = `${municipality.name}での個別受付情報を確認中`;
  if (receptionConfirmed) statusLabel = `${municipality.name}で受付を確認済み`;
  else if (status?.receptionStatus === "closed") statusLabel = `${municipality.name}での受付は終了しています`;
  else if (implementationConfirmed) statusLabel = `${municipality.name}は対象地域です。申請方法を確認中`;

  let contact = null;
  if (status?.contactStatus === "confirmed" && status.verificationStatus === "verified") {
    const candidate = status.contactPointIds.map(id => contactById.get(id)).find(item => item && item.contactRole === "application_office" && item.publicationStatus === "published" && item.verificationStatus === "verified");
    if (candidate) contact = { name: candidate.name, phone: candidate.phone, hours: candidate.hours, url: candidate.officialUrl };
  }

  const deadlinePeriod = status?.applicationPeriodIds.map(id => periodById.get(id)).find(item => item?.periodPurpose === "application_window" && item.deadlineAt && item.verificationStatus === "verified");
  return {
    id: municipality.id,
    name: municipality.name,
    officialUrl: municipality.officialUrl,
    statusLabel,
    reception: publicState(receptionConfirmed ? "confirmed" : status?.receptionStatus === "closed" ? "expired" : "pending"),
    applicationMethodLabel: status?.applicationMethodStatus === "confirmed" && status.verificationStatus === "verified" ? "申請方法を公式情報で確認済み" : "申請方法を確認中",
    contact,
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

  const publicActions = actions.filter(action => action.programIds.includes(program.id) && action.publicationStatus === "published" && action.verificationStatus === "verified").map(action => ({ title: action.title, description: action.description }));
  const publicDocuments = application ? application.requiredDocumentIds.map(id => documentById.get(id)).filter(document => document?.verificationStatus === "verified").map(document => ({ name: document.name, requiredLevel: document.requiredLevel })) : [];
  const publicConsultationItems = consultationItems.filter(item => item.programIds.includes(program.id) && item.publicationStatus === "published" && item.verificationStatus === "verified").sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 3).map(item => ({ prompt: item.supporterPrompt, reason: item.reason, unknownHandling: item.unknownHandling }));
  const sourceIds = [...(program.sourceLinkIds || []), ...(application?.sourceLinkIds || [])];
  const lastChecked = application?.lastCheckedAt || program.updatedAt;

  return {
    id: program.id,
    title: program.displayName,
    officialName: program.officialName,
    summary: program.verificationStatus === "verified" || verifiedFact(program, ["general_description"]) ? (program.audienceSummary || program.shortDescription) : "制度の詳しい内容を公式情報で確認中です。",
    category: program.categories[0],
    availability: publicState(applicationConfirmed ? "confirmed" : application?.verificationStatus === "needs_review" ? "needs_review" : "pending"),
    municipalities: municipalityViews,
    nextSteps: publicActions,
    warnings: program.verificationStatus === "verified" ? program.importantWarnings : [],
    documents: publicDocuments,
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

fs.mkdirSync(outputDir, { recursive: true });
for (const [name, value] of [["programs.json", publicPrograms], ["municipalities.json", municipalityOutput], ["categories.json", categoryOutput], ["home.json", homeOutput]]) {
  fs.writeFileSync(path.join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`);
}

console.log(`生活再建の公開用データを生成しました: ${outputDir}`);
console.log(`programs: ${publicPrograms.length}件 / municipality views: ${municipalityOutput.length}件`);
