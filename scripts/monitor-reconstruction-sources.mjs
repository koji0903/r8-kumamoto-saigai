import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classifyFetch, hashBody, impactEntity, riskForClaims } from "./reconstruction-source-change.mjs";

const root = path.resolve(process.env.RECONSTRUCTION_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const dataDir = path.join(root, "data/reconstruction");
const reportsDir = path.join(root, "reports");
const now = process.env.SOURCE_MONITOR_NOW || new Date().toISOString();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeAtomic = (file, value) => { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); const temporary = `${target}.tmp`; fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`); fs.renameSync(temporary, target); };

const collections = {
  program: ["data/reconstruction/programs.json", read("data/reconstruction/programs.json")],
  application: ["data/reconstruction/applications.json", read("data/reconstruction/applications.json")],
  amount: ["data/reconstruction/amount-benefits.json", read("data/reconstruction/amount-benefits.json")],
  application_period: ["data/reconstruction/application-periods.json", read("data/reconstruction/application-periods.json")],
  required_document: ["data/reconstruction/required-documents.json", read("data/reconstruction/required-documents.json")],
  contact: ["data/reconstruction/contacts.json", read("data/reconstruction/contacts.json")],
  next_action: ["data/reconstruction/next-actions.json", read("data/reconstruction/next-actions.json")]
};
const sources = read("data/reconstruction/sources.json");
const links = read("data/reconstruction/source-links.json");
const verificationEvents = read("data/reconstruction/verification-events.json");
const eventsFile = "data/reconstruction/source-change-events.json";
const revisionsFile = "data/reconstruction/source-revisions.json";
const stateFile = "reports/reconstruction-source-state.json";
const events = fs.existsSync(path.join(root, eventsFile)) ? read(eventsFile) : [];
const revisions = fs.existsSync(path.join(root, revisionsFile)) ? read(revisionsFile) : [];
const state = fs.existsSync(path.join(root, stateFile)) ? read(stateFile) : { schemaVersion: "1.0.0", sources: [] };
const stateById = new Map((state.sources || []).map(item => [item.sourceId, item]));
const linksBySource = new Map();
for (const link of links) {
  const list = linksBySource.get(link.sourceId) || [];
  list.push(link);
  linksBySource.set(link.sourceId, list);
}
const monitored = sources.filter(source => source.status === "active" && source.officiality === "primary_official" && linksBySource.has(source.id));

async function retrieve(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.SOURCE_MONITOR_TIMEOUT_MS || 30000));
  try {
    const response = await fetch(source.url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "YokataiNet-OfficialSourceMonitor/1.0 (+https://www.yokatainet.jp/)" } });
    const isPdf = source.sourceType === "pdf" || source.sourceType === "guideline" || source.sourceType === "application_guide" || /\.pdf(?:$|\?)/i.test(response.url || source.url) || /application\/pdf/i.test(response.headers.get("content-type") || "");
    const body = isPdf ? Buffer.from(await response.arrayBuffer()) : await response.text();
    return { kind: isPdf ? "pdf" : "html", status: response.status, finalUrl: response.url, redirected: response.redirected, hash: response.ok ? hashBody(body, isPdf ? "pdf" : "html") : null, hashAlgorithm: isPdf ? "raw-pdf-v1" : "normalized-html-v1", etag: response.headers.get("etag"), lastModified: response.headers.get("last-modified") };
  } catch (error) {
    return { kind: error?.name === "AbortError" ? "timeout" : "network_error", status: 0, finalUrl: source.url, redirected: false, hash: null, hashAlgorithm: null, error: String(error?.message || error) };
  } finally { clearTimeout(timeout); }
}

const dirtyCollections = new Set();
const newEvents = [];
for (const source of monitored) {
  const sourceLinks = linksBySource.get(source.id) || [];
  const claimTypes = [...new Set(sourceLinks.map(link => link.claimType))];
  const previous = stateById.get(source.id) || { sourceId: source.id, url: source.url, contentHash: source.contentHash, hashAlgorithm: "legacy-source-hash", consecutiveFailures: 0 };
  const result = await retrieve(source);
  const decision = classifyFetch(previous, result, claimTypes);
  const failure = decision.eventType === "source_unreachable";
  const nextState = { sourceId: source.id, url: source.url, finalUrl: result.finalUrl || source.url, contentHash: result.hash || previous.contentHash || source.contentHash, hashAlgorithm: result.hashAlgorithm || previous.hashAlgorithm || "unknown", checkedAt: now, httpStatus: result.status, fetchStatus: failure ? "source_unreachable" : "reachable", consecutiveFailures: failure ? (previous.consecutiveFailures || 0) + 1 : 0, etag: result.etag || null, lastModified: result.lastModified || null };
  stateById.set(source.id, nextState);

  const actionable = decision.changed || ["url_redirected", "url_migrated"].includes(decision.eventType) || (decision.eventType === "source_unreachable" && decision.status === "ACTION_REQUIRED");
  if (!actionable) continue;
  const fingerprint = `${source.id}:${decision.eventType}:${result.hash || result.finalUrl || result.status}`;
  if (events.some(event => !event.resolved && event.fingerprint === fingerprint)) continue;
  const impacted = [];
  const relatedEntities = [];
  const relatedProgramIds = new Set();
  const municipalityIds = new Set();
  for (const link of sourceLinks) {
    const pair = collections[link.entityType];
    const entity = pair?.[1].find(item => item.id === link.entityId);
    const lastVerifiedAt = verificationEvents.filter(item => item.entityId === link.entityId && ["reviewed", "reverified", "approved"].includes(item.action)).map(item => item.reviewedAt).filter(Boolean).sort().at(-1) || null;
    relatedEntities.push({ entityType: link.entityType, entityId: link.entityId, sourceLinkId: link.id, claimType: link.claimType, lastVerifiedAt });
    if (link.entityType === "program") relatedProgramIds.add(link.entityId);
    const relatedApplications = link.entityType === "application" ? [entity] : collections.application[1].filter(item => entity?.applicationId === item.id || entity?.applicationIds?.includes(item.id) || item.applicationPeriodIds?.includes(entity?.id) || item.requiredDocumentIds?.includes(entity?.id) || item.contactPointIds?.includes(entity?.id));
    for (const application of relatedApplications.filter(Boolean)) { relatedProgramIds.add(application.programId); for (const id of application.municipalityIds || []) municipalityIds.add(id); }
    if (impactEntity(entity, { ...decision, risk: riskForClaims([link.claimType]) })) {
      dirtyCollections.add(link.entityType);
      impacted.push({ entityType: link.entityType, entityId: link.entityId, sourceLinkId: link.id, claimType: link.claimType, previousVerificationStatus: "verified", nextVerificationStatus: "needs_review" });
      if (["application_period", "required_document", "contact", "next_action"].includes(link.entityType)) {
        const application = collections.application[1].find(item => (entity.applicationId && item.id === entity.applicationId) || entity.applicationIds?.includes(item.id));
        if (application && impactEntity(application, { ...decision, risk: "high" })) { dirtyCollections.add("application"); impacted.push({ entityType: "application", entityId: application.id, sourceLinkId: link.id, claimType: link.claimType, previousVerificationStatus: "verified", nextVerificationStatus: "needs_review", propagatedFrom: link.entityId }); }
      }
    }
    for (const amount of collections.amount[1].filter(item => item.sourceLinkIds.includes(link.id))) {
      if (!relatedEntities.some(item => item.entityType === "amount" && item.entityId === amount.id)) relatedEntities.push({ entityType: "amount", entityId: amount.id, sourceLinkId: link.id, claimType: "amount", lastVerifiedAt: verificationEvents.filter(item => item.entityId === amount.id).map(item => item.reviewedAt).filter(Boolean).sort().at(-1) || null });
      relatedProgramIds.add(amount.programId); for (const id of amount.municipalityIds || []) municipalityIds.add(id);
      if (impactEntity(amount, { ...decision, risk: "high" })) { dirtyCollections.add("amount"); impacted.push({ entityType: "amount", entityId: amount.id, sourceLinkId: link.id, claimType: "amount", previousVerificationStatus: "verified", nextVerificationStatus: "needs_review" }); }
    }
  }
  const event = { id: `source_change_${now.replace(/\D/g, "").slice(0, 14)}_${source.id}`, fingerprint, sourceId: source.id, sourceTitle: source.title, sourceUrl: source.url, eventType: decision.eventType, detectedAt: now, previousHash: previous.contentHash || null, currentHash: result.hash || null, previousUrl: previous.url || source.url, currentUrl: result.finalUrl || source.url, claimTypes, risk: decision.risk, impactAssessment: decision.risk === "high" ? "POTENTIALLY_RELEVANT" : "UNKNOWN", operationalStatus: decision.status, relatedProgramIds: [...relatedProgramIds], municipalityIds: [...municipalityIds], relatedEntities, impactedEntities: impacted, resolved: false, reviewedAt: null, reviewedBy: null, resolutionNotes: null };
  events.push(event); newEvents.push(event);
  if (decision.changed) {
    revisions.push({ id: `source_revision_${now.replace(/\D/g, "").slice(0, 14)}_${source.id}`, sourceId: source.id, url: source.url, detectedAt: now, previousHash: previous.contentHash, currentHash: result.hash, hashAlgorithm: result.hashAlgorithm, eventId: event.id });
    source.contentHash = result.hash;
    source.checkedAt = now;
    source.retrievedAt = now;
  }
}

state.schemaVersion = "1.0.0";
state.generatedAt = now;
state.sources = [...stateById.values()].sort((a, b) => a.sourceId.localeCompare(b.sourceId));
writeAtomic(stateFile, state);
writeAtomic(eventsFile, events);
writeAtomic(revisionsFile, revisions);
if (newEvents.some(event => event.eventType === "content_changed" || event.eventType === "pdf_replaced")) writeAtomic("data/reconstruction/sources.json", sources);
for (const type of dirtyCollections) writeAtomic(collections[type][0], collections[type][1]);

const riskOrder = { high: 0, medium: 1, low: 2 };
const amountPriority=event=>(event.claimTypes||[]).includes("amount")?0:1;
const unresolved = events.filter(event => !event.resolved).sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk] || amountPriority(a)-amountPriority(b) || b.detectedAt.localeCompare(a.detectedAt));
const queue = { schemaVersion: "1.0.0", generatedAt: now, summary: { unresolved: unresolved.length, actionRequired: unresolved.filter(event => event.operationalStatus === "ACTION_REQUIRED").length, needsReviewEntities: [...new Set(unresolved.flatMap(event => event.impactedEntities.map(item => `${item.entityType}:${item.entityId}`)))].length }, items: unresolved };
writeAtomic("reports/reconstruction-source-review-queue.json", queue);
const rows = unresolved.map(event => `| ${event.risk} | ${event.operationalStatus} | ${event.sourceTitle} | ${event.claimTypes.join(" / ")} | ${(event.relatedProgramIds || []).join("<br>") || "-"} | ${(event.municipalityIds || []).join("<br>") || "広域・未特定"} | ${(event.relatedEntities || event.impactedEntities).map(item => `${item.entityType}:${item.entityId}`).join("<br>") || "影響確認待ち"} | ${(event.relatedEntities || []).map(item => item.lastVerifiedAt).filter(Boolean).sort().at(-1) || "未記録"} | ${event.detectedAt} | [原文](${event.sourceUrl}) |`);
const markdown = `# 公式情報変更レビューキュー\n\n生成日時: ${now}\n\n- 未解決変更: ${queue.summary.unresolved}件\n- ACTION_REQUIRED: ${queue.summary.actionRequired}件\n- needs_review対象: ${queue.summary.needsReviewEntities}件\n\n> 上から高リスク順です。変更内容を一次資料で確認し、人によるレビュー・承認後にのみ verified へ戻してください。\n\n| リスク | 状態 | source | claimType | program | 自治体 | 関連entity | 最終確認 | 検知日時 | 原文 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.length ? rows.join("\n") : "| - | OK | 未解決変更なし | - | - | - | - | - | - | - |"}\n`;
fs.writeFileSync(path.join(root, "docs/reconstruction-source-review-queue.md"), markdown);
console.log(`厳密source監視: ${monitored.length} URL / 新規イベント ${newEvents.length} / 未解決 ${unresolved.length} / needs_review移行 ${newEvents.flatMap(event => event.impactedEntities).length}`);
