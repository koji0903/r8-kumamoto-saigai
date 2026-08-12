import crypto from "node:crypto";

export const HIGH_RISK_CLAIMS = new Set(["amount", "deadline", "eligibility", "eligible_damage", "eligible_area", "required_document", "required_documents", "contact", "application_office", "application_method", "warning"]);
export const MEDIUM_RISK_CLAIMS = new Set(["benefit", "disaster_application"]);

const decode = value => value
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, "\"")
  .replace(/&#39;|&apos;/gi, "'");

export function normalizeHtml(html) {
  return decode(String(html))
    .replace(/<!--[^]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|nav|footer|header)\b[^>]*>[^]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hashBody(body, kind = "html") {
  const input = kind === "pdf" || Buffer.isBuffer(body) ? body : normalizeHtml(body);
  return `sha256:${crypto.createHash("sha256").update(input).digest("hex")}`;
}

export function riskForClaims(claimTypes = []) {
  if (claimTypes.some(type => HIGH_RISK_CLAIMS.has(type))) return "high";
  if (claimTypes.some(type => MEDIUM_RISK_CLAIMS.has(type))) return "medium";
  return "low";
}

export function classifyFetch(previous, result, claims = []) {
  const risk = riskForClaims(claims);
  if (result.kind === "timeout" || result.kind === "network_error" || result.status >= 500) return { eventType: "source_unreachable", status: "WARNING", risk, changed: false };
  if (result.status === 404 || result.status === 410) return { eventType: "source_unreachable", status: (previous?.consecutiveFailures || 0) + 1 >= 2 ? "ACTION_REQUIRED" : "WARNING", risk, changed: false };
  if (result.redirected) return { eventType: "url_redirected", status: "WARNING", risk, changed: false };
  if (previous?.url && result.finalUrl && previous.url !== result.finalUrl) return { eventType: "url_migrated", status: "WARNING", risk, changed: false };
  if (!result.hash || !previous?.contentHash || previous.hashAlgorithm !== result.hashAlgorithm) return { eventType: "source_initialized", status: "OK", risk, changed: false };
  if (previous.contentHash !== result.hash) return { eventType: result.kind === "pdf" ? "pdf_replaced" : "content_changed", status: risk === "high" ? "ACTION_REQUIRED" : "WARNING", risk, changed: true };
  return { eventType: "unchanged", status: "OK", risk, changed: false };
}

export function impactEntity(entity, decision) {
  if (!entity || decision.status !== "ACTION_REQUIRED" || decision.risk !== "high" || entity.verificationStatus !== "verified") return false;
  entity.verificationStatus = "needs_review";
  if ("freshnessStatus" in entity) entity.freshnessStatus = "review_due";
  return true;
}

export function shouldExcludeFromPublic(entity) {
  return !entity || entity.publicationStatus !== "published" || ["withdrawn", "expired", "unverified", "pending", "needs_review", "source_unreachable"].includes(entity.verificationStatus);
}
