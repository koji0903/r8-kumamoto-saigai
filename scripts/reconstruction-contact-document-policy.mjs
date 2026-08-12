export const roleLabels = {
  application_office: "申請するところ",
  general_inquiry: "制度について聞くところ",
  specialist_consultation: "個別の状況を相談するところ",
  document_submission: "追加書類を提出するところ",
  general_information: "一般的な案内を聞くところ",
  unknown: "役割を公式情報で確認"
};
export const scopeLabels = { national: "国の案内で確認できる書類", prefectural: "熊本県の案内で確認できる書類", municipal: "市町村の受付で案内されている書類" };
export const requirementLabels = { required: "必要", conditional: "場合によって必要", recommended: "あると確認しやすい", check_with_office: "自治体の案内で確認", unknown: "必要か公式情報で確認" };
export const submissionLabels = { original: "原本", copy: "写し", either: "原本または写し", not_specified: "原本・写しの指定は公式情報で確認" };

export const contactRoles = contact => [...new Set([contact?.contactRole, ...(contact?.contactRoles || [])].filter(Boolean))];
export const isExpired = (contact, now = Date.now()) => Boolean(contact?.validUntil && new Date(contact.validUntil).getTime() < now);
export const hasActiveSource = (entity, sourceLinkById, sourceById) => Boolean(entity?.sourceLinkIds?.length) && entity.sourceLinkIds.some(id => {
  const link = sourceLinkById.get(id); const source = link && sourceById.get(link.sourceId);
  return source?.status === "active" && source.officiality === "primary_official";
});
export function visibleContact(contact, sourceLinkById, sourceById, now = Date.now()) {
  return Boolean(contact && contact.publicationStatus === "published" && contact.verificationStatus === "verified" && contact.freshnessStatus === "fresh" && contact.checkedAt && !isExpired(contact, now) && hasActiveSource(contact, sourceLinkById, sourceById));
}
export function visibleDocument(document, municipalityId, sourceLinkById, sourceById) {
  if (!document || document.verificationStatus !== "verified" || !hasActiveSource(document, sourceLinkById, sourceById)) return false;
  return document.scopeLevel !== "municipal" || Boolean(municipalityId && document.scopeMunicipalityIds.includes(municipalityId));
}
export function publicContact(contact, organizationName) {
  const roles = contactRoles(contact);
  return { name: contact.name, organization: organizationName, roles, roleLabels: roles.map(role => roleLabels[role]), phone: contact.phone || null, hours: contact.hours || null, closedDays: contact.closedDays || null, address: contact.address || null, officialUrl: contact.officialUrl || null, methods: contact.methods, temporary: contact.isTemporary, validUntil: contact.validUntil };
}
export function publicDocument(document) {
  return { id: document.id, name: document.name, description: document.plainLanguageDescription, requiredLevel: document.requiredLevel, requiredLabel: requirementLabels[document.requiredLevel], scope: document.scopeLevel, scopeLabel: scopeLabels[document.scopeLevel], submissionForm: document.submissionForm, submissionLabel: submissionLabels[document.submissionForm] };
}
export function detectDocumentConflict(documents, applicationId, municipalityId) {
  const relevant = documents.filter(item => item.applicationIds.includes(applicationId) && item.verificationStatus === "verified");
  const prefectural = new Set(relevant.filter(item => item.scopeLevel === "prefectural").map(item => item.name));
  const municipal = new Set(relevant.filter(item => item.scopeLevel === "municipal" && item.scopeMunicipalityIds.includes(municipalityId)).map(item => item.name));
  if (!municipal.size) return null;
  const onlyPrefecture = [...prefectural].filter(name => !municipal.has(name));
  const onlyMunicipality = [...municipal].filter(name => !prefectural.has(name));
  return onlyPrefecture.length || onlyMunicipality.length ? { municipalityId, onlyPrefecture, onlyMunicipality, message: "提出書類について自治体の最新案内をご確認ください。" } : null;
}
