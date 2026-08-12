#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data", "reconstruction");
const schemaDir = path.join(root, "schemas", "reconstruction");

const files = {
  disasters: ["disasters.json", "disaster.schema.json"],
  municipalities: ["municipalities.json", "municipality.schema.json"],
  organizations: ["organizations.json", "organization.schema.json"],
  programs: ["programs.json", "program.schema.json"],
  applications: ["applications.json", "application.schema.json"],
  municipalityStatuses: ["municipality-application-statuses.json", "municipality-application-status.schema.json"],
  sources: ["sources.json", "source.schema.json"],
  sourceVersionRelations: ["source-version-relations.json", "source-version-relation.schema.json"],
  sourceLinks: ["source-links.json", "source-link.schema.json"],
  contacts: ["contacts.json", "contact.schema.json"],
  periods: ["application-periods.json", "application-period.schema.json"],
  documents: ["required-documents.json", "required-document.schema.json"],
  actions: ["next-actions.json", "next-action.schema.json"],
  consultationItems: ["consultation-items.json", "consultation-item.schema.json"],
  verificationEvents: ["verification-events.json", "verification-event.schema.json"],
  sourceChangeEvents: ["source-change-events.json", "source-change-event.schema.json"],
  sourceRevisions: ["source-revisions.json", "source-revision.schema.json"]
};

const errors = [];
const warnings = [];
const parsed = {};
const schemas = {};
const common = readJson(path.join(schemaDir, "common.schema.json"), "共通Schema");

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${label}: JSONを読み込めません: ${error.message}`);
    return null;
  }
}

for (const [name, [dataFile, schemaFile]] of Object.entries(files)) {
  parsed[name] = readJson(path.join(dataDir, dataFile), dataFile);
  schemas[name] = readJson(path.join(schemaDir, schemaFile), schemaFile);
  if (schemas[name]?.$schema !== "https://json-schema.org/draft/2020-12/schema") errors.push(`${schemaFile}: JSON Schema Draft 2020-12ではありません`);
  if (!schemas[name]?.$id) errors.push(`${schemaFile}: $idがありません`);
}

function resolveRef(ref) {
  if (ref.startsWith("#/$defs/")) {
    const name = ref.split("/").at(-1);
    return common?.$defs?.[name] || schemas.applications?.$defs?.[name];
  }
  if (ref.startsWith("common.schema.json#/$defs/")) {
    return common?.$defs?.[ref.split("/").at(-1)];
  }
  if (ref.startsWith("application.schema.json#/$defs/")) {
    return schemas.applications?.$defs?.[ref.split("/").at(-1)];
  }
  return null;
}

function typeMatches(value, type) {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === type;
}

function validateSchema(value, schema, location) {
  if (!schema) return;
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref);
    if (!resolved) errors.push(`${location}: 解決できないSchema参照 ${schema.$ref}`);
    else validateSchema(value, resolved, location);
    return;
  }
  const types = schema.type ? (Array.isArray(schema.type) ? schema.type : [schema.type]) : [];
  if (types.length && !types.some(type => typeMatches(value, type))) {
    errors.push(`${location}: 型が不正です（期待: ${types.join("/")}）`);
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${location}: 未定義の列挙値 ${JSON.stringify(value)}`);
  if (Object.hasOwn(schema, "const") && value !== schema.const) errors.push(`${location}: 値は ${JSON.stringify(schema.const)} でなければなりません`);
  if (typeof value === "string") {
    if (schema.minLength && value.length < schema.minLength) errors.push(`${location}: 空文字または短すぎる値です`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${location}: 形式が不正です: ${value}`);
    if (schema.format === "uri") {
      try { const url = new URL(value); if (!/^https?:$/.test(url.protocol)) throw new Error(); }
      catch { errors.push(`${location}: http/https URLではありません: ${value}`); }
    }
  }
  if (typeof value === "number" && schema.minimum != null && value < schema.minimum) errors.push(`${location}: ${schema.minimum} 未満です`);
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${location}: 要素数が不足しています`);
    if (schema.uniqueItems && new Set(value.map(v => JSON.stringify(v))).size !== value.length) errors.push(`${location}: 重複要素があります`);
    value.forEach((item, index) => validateSchema(item, schema.items, `${location}[${index}]`));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required || []) if (!Object.hasOwn(value, key)) errors.push(`${location}.${key}: 必須項目がありません`);
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) if (!Object.hasOwn(schema.properties || {}, key)) errors.push(`${location}.${key}: Schemaにない項目です`);
    }
    for (const [key, child] of Object.entries(schema.properties || {})) if (Object.hasOwn(value, key)) validateSchema(value[key], child, `${location}.${key}`);
  }
}

for (const name of Object.keys(files)) if (parsed[name] && schemas[name]) validateSchema(parsed[name], schemas[name], name);

const allCollections = Object.entries(parsed).filter(([, list]) => Array.isArray(list));
const byType = Object.fromEntries(allCollections.map(([name, list]) => [name, new Map(list.map(item => [item.id, item]))]));
const globalIds = new Map();
for (const [name, list] of allCollections) {
  for (const item of list) {
    if (!item?.id) continue;
    if (globalIds.has(item.id)) errors.push(`ID重複: ${item.id}（${globalIds.get(item.id)} / ${name}）`);
    else globalIds.set(item.id, name);
  }
}

function refs(owner, ids, collection, label) {
  for (const id of ids || []) if (!byType[collection]?.has(id)) errors.push(`${owner}: ${label}参照先がありません: ${id}`);
}

for (const disaster of parsed.disasters || []) {
  refs(disaster.id, disaster.municipalityIds, "municipalities", "自治体");
  refs(disaster.id, disaster.sourceLinkIds, "sourceLinks", "出典リンク");
}
for (const program of parsed.programs || []) {
  if (program.operatorOrganizationId) refs(program.id, [program.operatorOrganizationId], "organizations", "実施主体");
  refs(program.id, program.sourceLinkIds, "sourceLinks", "出典リンク");
}
for (const application of parsed.applications || []) {
  refs(application.id, [application.programId], "programs", "制度");
  refs(application.id, [application.disasterId], "disasters", "災害");
  refs(application.id, application.municipalityIds, "municipalities", "自治体");
  refs(application.id, application.applicationPeriodIds, "periods", "受付期間");
  refs(application.id, application.requiredDocumentIds, "documents", "必要書類");
  refs(application.id, application.contactPointIds, "contacts", "窓口");
  refs(application.id, application.sourceLinkIds, "sourceLinks", "出典リンク");
  const conditionIds = new Set();
  for (const condition of application.eligibilityConditions || []) {
    if (conditionIds.has(condition.id)) errors.push(`${application.id}: 対象条件IDが重複しています: ${condition.id}`);
    conditionIds.add(condition.id);
    refs(condition.id, condition.municipalityIds, "municipalities", "対象自治体");
    refs(condition.id, condition.sourceLinkIds, "sourceLinks", "条件根拠");
    if (condition.scope === "municipal" && !condition.municipalityIds.length) errors.push(`${condition.id}: municipal条件に自治体IDがありません`);
    if (condition.scope !== "municipal" && condition.municipalityIds.length) errors.push(`${condition.id}: ${condition.scope}条件へ自治体IDを設定しないでください`);
    if (["pending", "unknown", "conflict"].includes(condition.certainty) && condition.verificationStatus === "verified") errors.push(`${condition.id}: ${condition.certainty}条件をverifiedにはできません`);
    if (condition.verificationStatus === "verified" && (!condition.checkedAt || !condition.sourceLinkIds.length)) errors.push(`${condition.id}: verified条件に確認日時または根拠がありません`);
    if (condition.verificationStatus === "verified") {
      const claims = condition.sourceLinkIds.map(id => byType.sourceLinks.get(id)?.claimType);
      if (!claims.some(claim => ["eligibility", "eligible_damage"].includes(claim))) errors.push(`${condition.id}: verified条件にeligibility系の根拠がありません`);
    }
  }
  const groups = new Map();
  for (const condition of application.eligibilityConditions || []) {
    const key = `${condition.logicalGroup}|${condition.field}`;
    const list = groups.get(key) || [];
    list.push(condition);
    groups.set(key, list);
  }
  for (const [key, list] of groups) {
    const operators = new Set(list.map(item => item.groupOperator));
    if (operators.size > 1) errors.push(`${application.id}: 同一条件グループのAND/ORが混在しています: ${key}`);
    const equals = list.filter(item => item.certainty === "confirmed" && item.operator === "equals").map(item => JSON.stringify(item.value));
    if (list[0]?.groupOperator === "AND" && new Set(equals).size > 1) errors.push(`${application.id}: 同時成立しない可能性がある条件値です: ${key}`);
  }
}
for (const status of parsed.municipalityStatuses || []) {
  refs(status.id, [status.applicationId], "applications", "災害適用");
  refs(status.id, [status.municipalityId], "municipalities", "自治体");
  refs(status.id, status.contactPointIds, "contacts", "窓口");
  refs(status.id, status.applicationPeriodIds, "periods", "受付期間");
  refs(status.id, status.requiredDocumentIds, "documents", "必要書類");
  refs(status.id, status.sourceLinkIds, "sourceLinks", "出典リンク");
  for (const condition of status.localEligibilityConditions || []) {
    refs(condition.id, condition.municipalityIds, "municipalities", "自治体条件");
    refs(condition.id, condition.sourceLinkIds, "sourceLinks", "自治体条件根拠");
    if (condition.scope !== "municipal" || condition.municipalityIds.length !== 1 || condition.municipalityIds[0] !== status.municipalityId) errors.push(`${condition.id}: 自治体条件のscopeまたは自治体IDが受付entityと一致しません`);
    if (condition.verificationStatus === "verified" && (condition.certainty !== "confirmed" || !condition.checkedAt || !condition.sourceLinkIds.length)) errors.push(`${condition.id}: 公開可能な自治体条件の確認情報が不足しています`);
  }
}
for (const source of parsed.sources || []) refs(source.id, [source.organizationId], "organizations", "発表主体");
for (const relation of parsed.sourceVersionRelations || []) {
  refs(relation.id, [relation.previousSourceId], "sources", "旧版出典");
  refs(relation.id, [relation.nextSourceId], "sources", "新版出典");
  if (relation.previousSourceId === relation.nextSourceId) errors.push(`${relation.id}: 旧版と新版が同一です`);
}
for (const link of parsed.sourceLinks || []) {
  refs(link.id, [link.sourceId], "sources", "出典");
  if (!globalIds.has(link.entityId)) errors.push(`${link.id}: 根拠対象がありません: ${link.entityId}`);
  const expectedCollection = {
    disaster: "disasters", program: "programs", application: "applications",
    application_period: "periods", required_document: "documents", contact: "contacts", next_action: "actions"
  }[link.entityType];
  if (expectedCollection && !byType[expectedCollection]?.has(link.entityId)) errors.push(`${link.id}: entityType=${link.entityType}とentityId=${link.entityId}が一致しません`);
}
for (const contact of parsed.contacts || []) {
  refs(contact.id, [contact.organizationId], "organizations", "組織");
  if (contact.municipalityId) refs(contact.id, [contact.municipalityId], "municipalities", "自治体");
  refs(contact.id, contact.sourceLinkIds, "sourceLinks", "出典リンク");
}
for (const period of parsed.periods || []) {
  refs(period.id, [period.applicationId], "applications", "災害適用");
  if (period.municipalityId) refs(period.id, [period.municipalityId], "municipalities", "自治体");
  refs(period.id, period.sourceLinkIds, "sourceLinks", "出典リンク");
}
for (const document of parsed.documents || []) refs(document.id, document.sourceLinkIds, "sourceLinks", "出典リンク");
for (const action of parsed.actions || []) {
  refs(action.id, action.programIds, "programs", "制度");
  refs(action.id, action.applicationIds, "applications", "災害適用");
  refs(action.id, action.prerequisites, "actions", "前提行動");
  refs(action.id, action.contactPointIds, "contacts", "窓口");
  refs(action.id, action.requiredDocumentIds, "documents", "必要書類");
  refs(action.id, action.sourceLinkIds, "sourceLinks", "出典リンク");
}
for (const item of parsed.consultationItems || []) {
  refs(item.id, item.programIds, "programs", "制度");
  refs(item.id, item.applicationIds, "applications", "災害適用");
  refs(item.id, item.sourceLinkIds, "sourceLinks", "出典リンク");
}
for (const event of parsed.verificationEvents || []) {
  if (!globalIds.has(event.entityId)) errors.push(`${event.id}: 確認対象がありません: ${event.entityId}`);
  const expectedCollection = {
    disaster: "disasters", program: "programs", application: "applications",
    municipality_application_status: "municipalityStatuses", application_period: "periods",
    required_document: "documents", contact: "contacts", next_action: "actions",
    consultation_item: "consultationItems", organization: "organizations"
  }[event.entityType];
  if (expectedCollection && !byType[expectedCollection]?.has(event.entityId)) errors.push(`${event.id}: entityType=${event.entityType}とentityId=${event.entityId}が一致しません`);
  refs(event.id, event.sourceIds, "sources", "出典");
  refs(event.id, event.sourceLinkIds, "sourceLinks", "出典リンク");
  for (const linkId of event.sourceLinkIds) {
    const sourceId = byType.sourceLinks.get(linkId)?.sourceId;
    if (sourceId && !event.sourceIds.includes(sourceId)) errors.push(`${event.id}: sourceLinkの出典がsourceIdsに含まれていません: ${linkId}`);
  }
}
for (const event of parsed.sourceChangeEvents || []) {
  refs(event.id, [event.sourceId], "sources", "変更source");
  refs(event.id, event.relatedProgramIds, "programs", "関連制度");
  refs(event.id, event.municipalityIds, "municipalities", "関連自治体");
  for (const related of event.relatedEntities || []) {
    if (!globalIds.has(related.entityId)) errors.push(`${event.id}: 関連対象がありません: ${related.entityId}`);
    refs(event.id, [related.sourceLinkId], "sourceLinks", "関連sourceLink");
  }
  for (const impact of event.impactedEntities || []) {
    if (!globalIds.has(impact.entityId)) errors.push(`${event.id}: 影響対象がありません: ${impact.entityId}`);
    refs(event.id, [impact.sourceLinkId], "sourceLinks", "影響sourceLink");
  }
  if (event.resolved && (!event.reviewedAt || !event.reviewedBy)) errors.push(`${event.id}: 解決済み変更に確認日時または確認者IDがありません`);
  if (!event.resolved && (event.reviewedAt || event.reviewedBy)) errors.push(`${event.id}: 未解決変更に解決確認値が設定されています`);
}
for (const revision of parsed.sourceRevisions || []) {
  refs(revision.id, [revision.sourceId], "sources", "改訂source");
  refs(revision.id, [revision.eventId], "sourceChangeEvents", "変更イベント");
  if (revision.previousHash === revision.currentHash) errors.push(`${revision.id}: 旧新hashが同一です`);
}

const confirmed = new Set(["verified"]);
function requireVerifiedSources(entity, fields) {
  if (!confirmed.has(entity.verificationStatus)) return;
  if (!entity.sourceLinkIds?.length) errors.push(`${entity.id}: verifiedですが一次情報へのsourceLinkIdsがありません`);
  for (const field of fields) if (entity[field] == null || (Array.isArray(entity[field]) && !entity[field].length)) errors.push(`${entity.id}: verifiedですが重要項目 ${field} が未確定です`);
}

for (const program of parsed.programs || []) {
  requireVerifiedSources(program, ["officialName", "displayName"]);
  if (program.providerType === "public" && program.verificationStatus === "verified") {
    const linkedSources = (program.sourceLinkIds || []).map(id => byType.sourceLinks.get(id)).filter(Boolean).map(link => byType.sources.get(link.sourceId)).filter(Boolean);
    if (!linkedSources.some(source => source.officiality === "primary_official")) errors.push(`${program.id}: verifiedの公的制度に正式な一次情報がありません`);
  }
  if (program.publicationStatus === "published" && !["verified", "partially_verified", "needs_review"].includes(program.verificationStatus)) errors.push(`${program.id}: 未確認状態の制度をpublishedにできません`);
}

for (const application of parsed.applications || []) {
  requireVerifiedSources(application, ["disasterId", "municipalityIds", "eligibleDamage", "eligibilityConditions", "supportDescription", "contactPointIds", "lastCheckedAt"]);
  if (application.verificationStatus === "verified") {
    const claims = new Set((application.sourceLinkIds || []).map(id => byType.sourceLinks.get(id)?.claimType).filter(Boolean));
    for (const claim of ["disaster_application", "eligible_area", "eligibility", "eligible_damage", "benefit", "application_office"]) {
      if (!claims.has(claim)) errors.push(`${application.id}: verifiedに必要な出典種別 ${claim} がありません`);
    }
    const hasDeadlineEvidence = claims.has("deadline") || (application.applicationPeriodIds || []).some(id => (byType.periods.get(id)?.sourceLinkIds || []).length);
    if (!hasDeadlineEvidence) errors.push(`${application.id}: 期限または「未発表」を確認した出典がありません`);
    if (application.applicationMethod && !claims.has("application_method")) errors.push(`${application.id}: verifiedの申請方法にapplication_methodのsourceLinkがありません`);
  }
  if (application.applicationStatus === "active" && !["verified", "partially_verified", "needs_review"].includes(application.verificationStatus)) errors.push(`${application.id}: 未確認の災害適用をactiveにできません`);
  if (application.publicationStatus === "published" && !["verified", "partially_verified", "needs_review"].includes(application.verificationStatus)) errors.push(`${application.id}: verified、partially_verifiedまたはneeds_review以外の災害適用を公開候補にできません`);
  if (application.publicationStatus === "published" && application.verificationStatus === "partially_verified" && !application.sourceLinkIds.length) errors.push(`${application.id}: partially_verifiedの公開候補に事実単位の出典がありません`);
  if (application.publicationStatus === "published" && application.applicationStatus !== "active") errors.push(`${application.id}: publishedの災害適用はactiveでなければなりません`);
  if (["closed", "expired", "withdrawn"].includes(application.applicationStatus) && application.publicationStatus === "published") errors.push(`${application.id}: 終了・撤回済み適用をpublishedにできません`);
}

const municipalityStatusPairs = new Set();
for (const status of parsed.municipalityStatuses || []) {
  const pair = `${status.applicationId}:${status.municipalityId}`;
  if (municipalityStatusPairs.has(pair)) errors.push(`${status.id}: 同じ災害適用・自治体の状態が重複しています`);
  municipalityStatusPairs.add(pair);
  const application = byType.applications.get(status.applicationId);
  const included = application?.municipalityIds?.includes(status.municipalityId);
  if (status.implementationStatus === "confirmed" && !included) errors.push(`${status.id}: 実施confirmedですが災害適用の対象自治体に含まれていません`);
  if (status.implementationStatus === "not_applicable" && included) errors.push(`${status.id}: not_applicableですが災害適用の対象自治体に含まれています`);
  if (status.receptionStatus === "confirmed" && status.implementationStatus !== "confirmed") errors.push(`${status.id}: 受付confirmedには実施confirmedが必要です`);
  if (status.receptionStatus === "confirmed" && status.verificationStatus !== "verified") errors.push(`${status.id}: 受付confirmedを表示可能にするにはverificationStatus=verifiedが必要です`);
  if (status.receptionStatus === "confirmed" && !status.applicationPeriodIds.some(id => byType.periods.get(id)?.status === "open")) errors.push(`${status.id}: 受付confirmedにはopenの受付期間が必要です`);
  if (status.receptionStatus === "not_started" && status.applicationPeriodIds.length && !status.applicationPeriodIds.some(id => byType.periods.get(id)?.status === "scheduled")) errors.push(`${status.id}: 受付not_startedの期間状態がscheduledではありません`);
  if (status.receptionStatus === "closed" && status.applicationPeriodIds.length && !status.applicationPeriodIds.some(id => ["closed", "expired"].includes(byType.periods.get(id)?.status))) errors.push(`${status.id}: 受付closedの期間状態が終了状態ではありません`);
  if (status.contactStatus === "confirmed" && !status.contactPointIds.length) errors.push(`${status.id}: 窓口confirmedですがcontactPointIdsが空です`);
  if (status.contactPointIds.length && ["unknown", "pending", "not_applicable"].includes(status.contactStatus)) errors.push(`${status.id}: 窓口未確認状態なのに自治体窓口が関連付けられています`);
  if (status.applicationMethodStatus === "confirmed" && status.receptionStatus === "not_applicable") errors.push(`${status.id}: 受付対象外なのに受付方法がconfirmedです`);
  if (status.applicationMethodStatus === "confirmed") {
    const claims = new Set(status.sourceLinkIds.map(id => byType.sourceLinks.get(id)?.claimType));
    if (!claims.has("application_method")) errors.push(`${status.id}: 申請方法confirmedですがapplication_methodのsourceLinkがありません`);
  }
  if (status.localGuidanceStatus === "confirmed" && !status.sourceLinkIds.length) errors.push(`${status.id}: 自治体独自案内confirmedですが出典がありません`);
  for (const periodId of status.applicationPeriodIds) {
    const period = byType.periods.get(periodId);
    if (period?.municipalityId && period.municipalityId !== status.municipalityId) errors.push(`${status.id}: 別自治体の受付期間を参照しています: ${periodId}`);
  }
  for (const contactId of status.contactPointIds) {
    const contact = byType.contacts.get(contactId);
    if (contact?.municipalityId && contact.municipalityId !== status.municipalityId) errors.push(`${status.id}: 別自治体の窓口を参照しています: ${contactId}`);
    if (status.contactStatus === "confirmed" && !new Set([contact?.contactRole, ...(contact?.contactRoles || [])]).has("application_office")) errors.push(`${status.id}: 受付窓口confirmedにはapplication_officeの窓口が必要です: ${contactId}`);
  }
  for (const documentId of status.requiredDocumentIds) {
    const document = byType.documents.get(documentId);
    if (document?.scopeLevel === "municipal" && !document.scopeMunicipalityIds.includes(status.municipalityId)) errors.push(`${status.id}: 別自治体の独自書類を参照しています: ${documentId}`);
  }
}

for (const document of parsed.documents || []) {
  refs(document.id, document.programIds, "programs", "制度");
  refs(document.id, document.applicationIds, "applications", "災害適用");
  refs(document.id, document.scopeMunicipalityIds, "municipalities", "対象自治体");
  if (document.scopeLevel === "municipal" && !document.scopeMunicipalityIds.length) errors.push(`${document.id}: municipal scopeなのに対象自治体がありません`);
  if (document.scopeLevel !== "municipal" && document.scopeMunicipalityIds.length) errors.push(`${document.id}: ${document.scopeLevel} scopeに自治体IDを直接設定しないでください`);
  if (document.documentContext === "general_program" && document.applicationIds.length) errors.push(`${document.id}: 一般制度書類に災害適用IDが設定されています`);
  if (document.documentContext === "disaster_application" && !document.applicationIds.length) errors.push(`${document.id}: 今回災害の必要書類なのに災害適用IDがありません`);
  if (document.documentContext === "municipality_specific" && document.scopeLevel !== "municipal") errors.push(`${document.id}: 自治体固有書類はscopeLevel=municipalでなければなりません`);
  if (!document.programIds.length || !document.sourceLinkIds.length) errors.push(`${document.id}: 制度または一次情報への追跡情報が不足しています`);
  if (document.requiredLevel === "required" && !document.sourceLinkIds.length) errors.push(`${document.id}: 必須書類ですがsourceLinkがありません`);
  if (document.verificationStatus === "verified") {
    const claims = new Set(document.sourceLinkIds.map(id => byType.sourceLinks.get(id)?.claimType));
    if (![...claims].some(claim => ["required_document", "required_documents"].includes(claim))) errors.push(`${document.id}: verified書類にrequired_document根拠がありません`);
  }
  if (document.documentContext === "municipality_specific") {
    for (const municipalityId of document.scopeMunicipalityIds) {
      const linked = (parsed.municipalityStatuses || []).some(status => status.municipalityId === municipalityId && document.applicationIds.includes(status.applicationId) && status.requiredDocumentIds.includes(document.id));
      if (!linked) errors.push(`${document.id}: 自治体独自書類が自治体別受付entityに関連付けられていません: ${municipalityId}`);
    }
  }
}

const now = new Date();
for (const period of parsed.periods || []) {
  if (period.deadlineType === "pending" && period.deadlineAt !== null) errors.push(`${period.id}: 正式発表待ちなのにdeadlineAtが設定されています`);
  if (period.deadlineType === "fixed" && period.deadlineAt === null) errors.push(`${period.id}: 固定期限なのにdeadlineAtがありません`);
  if (period.periodPurpose === "application_window" && period.municipalityId && period.status === "open" && period.startsAt === null) errors.push(`${period.id}: 自治体受付をopenとするには開始日の根拠が必要です`);
  if (period.periodPurpose === "repair_completion" && period.deadlineAt === null && !["pending", "unknown"].includes(period.deadlineType)) errors.push(`${period.id}: 工事完了期限に期限日または未確認状態がありません`);
  if (period.periodPurpose === "program_effective_period" && period.deadlineType === "rolling") errors.push(`${period.id}: 制度適用期間にrolling期限は使用できません`);
  if (period.deadlineAt && ["open", "scheduled"].includes(period.status)) {
    const deadline = new Date(period.deadlineAt.length === 10 ? `${period.deadlineAt}T23:59:59+09:00` : period.deadlineAt);
    if (deadline < now) errors.push(`${period.id}: 期限が過去ですがstatusが${period.status}です`);
  }
  if (period.verificationStatus === "verified" && !period.sourceLinkIds.length) errors.push(`${period.id}: verifiedの受付期間に出典がありません`);
}
for (const contact of parsed.contacts || []) requireVerifiedSources(contact, ["name", "sourceLinkIds", "checkedAt"]);
for (const contact of parsed.contacts || []) {
  const roles = new Set([contact.contactRole, ...(contact.contactRoles || [])]);
  if (!roles.has(contact.contactRole)) errors.push(`${contact.id}: contactRoleがcontactRolesに含まれていません`);
  if (roles.has("application_office") && !contact.methods.length) errors.push(`${contact.id}: 申請窓口に受付方法がありません`);
  if (roles.has("general_inquiry") && contact.municipalityId && !contact.sourceLinkIds.length) errors.push(`${contact.id}: 自治体問い合わせ先に出典がありません`);
  if (contact.verificationStatus === "verified" && contact.publicationStatus === "published" && (contact.phone || contact.hours || contact.address) && (!contact.checkedAt || !contact.sourceLinkIds.length)) errors.push(`${contact.id}: 公開する電話・時間・住所にcheckedAtまたはsourceLinkがありません`);
  if (contact.isTemporary && !contact.validUntil) warnings.push(`${contact.id}: 臨時窓口の終了日が未確認です`);
  if (contact.validFrom && contact.validUntil && new Date(contact.validFrom) > new Date(contact.validUntil)) errors.push(`${contact.id}: 窓口の有効期間が逆転しています`);
}
const contactSignatures = new Map();
for (const contact of parsed.contacts || []) {
  const signature = [contact.organizationId, contact.municipalityId, contact.name, contact.phone].join("|");
  const existing = contactSignatures.get(signature);
  if (existing) errors.push(`${contact.id}: 同一窓口の重複レコードです。contactRolesへ統合してください: ${existing.id}`);
  contactSignatures.set(signature, contact);
}
for (const source of parsed.sources || []) {
  if (!source.url) errors.push(`${source.id}: source URLがありません`);
  if (source.status === "active" && !source.retrievedAt) warnings.push(`${source.id}: activeの出典に取得日時がありません`);
  if (/\.pdf(?:$|\?)/i.test(source.url) && !source.contentHash) errors.push(`${source.id}: PDF出典にcontentHashがありません`);
}

for (const relation of parsed.sourceVersionRelations || []) {
  const previous = byType.sources.get(relation.previousSourceId);
  const next = byType.sources.get(relation.nextSourceId);
  if (["revision", "replacement"].includes(relation.relationType) && previous && previous.status !== "superseded") errors.push(`${relation.id}: 旧版sourceはsupersededでなければなりません`);
  if (relation.relationType === "withdrawal" && previous && previous.status !== "withdrawn") errors.push(`${relation.id}: 撤回対象sourceはwithdrawnでなければなりません`);
  if (next && next.status === "unreachable") warnings.push(`${relation.id}: 後継sourceへ到達できません`);
}

const sourcesByUrl = new Map();
for (const source of parsed.sources || []) {
  const siblings = sourcesByUrl.get(source.url) || [];
  siblings.push(source);
  sourcesByUrl.set(source.url, siblings);
}
for (const [url, sources] of sourcesByUrl) {
  const hashes = new Set(sources.map(source => source.contentHash).filter(Boolean));
  if (hashes.size > 1) {
    const ids = new Set(sources.map(source => source.id));
    const related = (parsed.sourceVersionRelations || []).some(relation => ids.has(relation.previousSourceId) && ids.has(relation.nextSourceId));
    if (!related) errors.push(`同一URLの内容差替えにversion関係がありません: ${url}`);
  }
}

function actorKey(id, name) {
  return id || name || null;
}
const verificationEventsByEntity = new Map();
for (const event of parsed.verificationEvents || []) {
  const list = verificationEventsByEntity.get(event.entityId) || [];
  list.push(event);
  verificationEventsByEntity.set(event.entityId, list);
  if (!actorKey(event.reviewerId, event.reviewerName)) errors.push(`${event.id}: 確認者がありません`);
  if (!event.reviewedAt) errors.push(`${event.id}: 確認日時がありません`);
  if (event.action === "approved" && !actorKey(event.approverId, event.approverName)) errors.push(`${event.id}: 承認記録に承認者がありません`);
  if (["reviewed", "reverified", "approved"].includes(event.action) && !event.sourceIds.length && !event.sourceLinkIds.length) errors.push(`${event.id}: 確認・承認記録に根拠資料がありません`);
}

for (const [, list] of allCollections) {
  for (const entity of list) {
    if (entity?.verificationStatus !== "verified") continue;
    const events = verificationEventsByEntity.get(entity.id) || [];
    const reviews = events.filter(event => ["reviewed", "reverified"].includes(event.action) && actorKey(event.reviewerId, event.reviewerName) && !String(event.reviewerId || "").startsWith("system_"));
    const approvals = events.filter(event => event.action === "approved" && event.result === "confirmed" && actorKey(event.approverId, event.approverName));
    if (!reviews.length) errors.push(`${entity.id}: verifiedですが人による確認履歴がありません`);
    if (!approvals.length) errors.push(`${entity.id}: verifiedですがapproved記録がありません`);
    if (entity.freshnessStatus && entity.freshnessStatus !== "fresh") errors.push(`${entity.id}: verifiedですが鮮度状態が${entity.freshnessStatus}です`);
    if (reviews.length && approvals.length) {
      const reviewer = actorKey(reviews.at(-1).reviewerId, reviews.at(-1).reviewerName);
      const approver = actorKey(approvals.at(-1).approverId, approvals.at(-1).approverName);
      if (reviewer === approver) warnings.push(`${entity.id}: 確認者と承認者が同一です（一人運用として許容、重要項目は二重確認推奨）`);
      if (new Date(approvals.at(-1).reviewedAt) <= new Date(reviews.at(-1).reviewedAt)) errors.push(`${entity.id}: 承認は最新レビューより後の別操作として記録してください`);
    }
    const linkedSources = (entity.sourceLinkIds || []).map(id => byType.sourceLinks.get(id)).filter(Boolean).map(link => byType.sources.get(link.sourceId)).filter(Boolean);
    if (linkedSources.some(source => ["withdrawn", "superseded"].includes(source.status))) errors.push(`${entity.id}: 撤回・旧版sourceをverifiedの根拠にしています`);
    const approvalTime = approvals.length ? new Date(approvals.at(-1).reviewedAt) : null;
    if (approvalTime && linkedSources.some(source => source.checkedAt && new Date(source.checkedAt) > approvalTime)) errors.push(`${entity.id}: 承認後に更新確認されたsourceがあり再レビューが必要です`);
  }
}
for (const action of parsed.actions || []) {
  if (action.verificationStatus === "verified" && (action.doNotDoYet || action.actionType === "do_not_proceed") && !action.sourceLinkIds.length) errors.push(`${action.id}: 「まだやらないこと」をverifiedで公開するには出典が必要です`);
}

// reconstruction側の自治体スナップショットは、現行サイトの自治体データを正本として同期する。
try {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "data", "report-data.js"), "utf8"), context);
  const current = context.window.REPORT_DATA.municipalities;
  const snapshot = new Map((parsed.municipalities || []).map(item => [item.name, item.officialUrl]));
  for (const municipality of current) {
    if (!snapshot.has(municipality.name)) errors.push(`自治体同期: ${municipality.name} がreconstruction側にありません`);
    else if (snapshot.get(municipality.name) !== municipality.url) errors.push(`自治体同期: ${municipality.name} の公式URLが現行正本と一致しません`);
  }
  for (const municipality of parsed.municipalities || []) if (!current.some(item => item.name === municipality.name)) errors.push(`自治体同期: ${municipality.name} は現行正本に存在しません`);
} catch (error) {
  errors.push(`自治体同期検査を実行できません: ${error.message}`);
}

if (warnings.length) {
  console.warn("生活再建データ検証の警告:");
  warnings.forEach(message => console.warn(`- ${message}`));
}
if (errors.length) {
  console.error(`生活再建データ検証NG（${errors.length}件）`);
  errors.forEach(message => console.error(`- ${message}`));
  process.exit(1);
}

console.log("生活再建データ検証OK");
console.log(Object.entries(parsed).map(([name, list]) => `${name}: ${Array.isArray(list) ? list.length : 0}件`).join(" / "));
console.log("Schema・ID・参照・自治体別状態・書類scope・確認承認履歴・出典改訂・公開状態・期限・自治体同期を確認しました。");
