export const FIELD_LABELS = Object.freeze({
  housing_damage: "住まいの被害", household_type: "世帯", housing_type: "住まいの種類",
  residency_status: "現在の住まい方", income_condition: "収入・資力", age_condition: "年齢",
  disability_condition: "障害", care_condition: "介護", business_type: "仕事・事業",
  agriculture_fishery_condition: "農業・漁業", contract_status: "契約状況",
  other_program_usage: "ほかの制度の利用", other_conditions: "その他"
});

export function officialSourceIds(condition, links, sources) {
  return (condition.sourceLinkIds || []).filter(id => {
    const link = links.get(id);
    return link?.verifiedAt && sources.get(link.sourceId)?.status === "active";
  });
}

export function isPublicCondition(condition, links, sources, municipalityId = null) {
  if (!condition || condition.certainty !== "confirmed" || condition.verificationStatus !== "verified" || !condition.checkedAt) return false;
  if (!officialSourceIds(condition, links, sources).length) return false;
  if (condition.scope === "municipal") return Boolean(municipalityId) && condition.municipalityIds.length === 1 && condition.municipalityIds[0] === municipalityId;
  return condition.municipalityIds.length === 0;
}

export function publicCondition(condition) {
  return { id: condition.id, field: condition.field, label: FIELD_LABELS[condition.field], description: condition.plainLanguageDescription, logicalGroup: condition.logicalGroup, groupOperator: condition.groupOperator, scope: condition.scope, checkedAt: condition.checkedAt };
}

export function findConditionConflicts(conditions) {
  const conflicts = [];
  const groups = new Map();
  for (const item of conditions || []) {
    if (item.certainty === "conflict") conflicts.push(`${item.id}: conflict`);
    const key = `${item.logicalGroup}|${item.field}`;
    const list = groups.get(key) || [];
    list.push(item);
    groups.set(key, list);
  }
  for (const [key, list] of groups) {
    if (new Set(list.map(item => item.groupOperator)).size > 1) conflicts.push(`${key}: AND/OR混在`);
    const values = new Set(list.filter(item => item.certainty === "confirmed" && item.operator === "equals").map(item => JSON.stringify(item.value)));
    if (list[0]?.groupOperator === "AND" && values.size > 1) conflicts.push(`${key}: equals矛盾`);
  }
  return conflicts;
}
