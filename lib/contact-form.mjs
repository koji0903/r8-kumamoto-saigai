import { createHmac, createHash, randomUUID, timingSafeEqual } from "node:crypto";

export const CONTACT_CATEGORIES = new Map([
  ["general", "一般のお問い合わせ"],
  ["donation", "ご寄付・受領確認"],
  ["volunteer", "活動参加・ボランティア"],
  ["partnership", "企業・団体との連携"],
  ["media", "取材・報道"],
  ["information", "地域情報の提供"],
  ["correction", "掲載内容の訂正・リンク切れ"],
  ["privacy", "個人情報の取り扱い"]
]);

const TOKEN_MIN_AGE_MS = 2500;
const TOKEN_MAX_AGE_MS = 30 * 60 * 1000;
const b64url = value => Buffer.from(value).toString("base64url");
const sign = (value, secret) => createHmac("sha256", secret).update(value).digest("base64url");
const clean = (value, max) => String(value ?? "").replace(/\r\n?/g, "\n").trim().slice(0, max);

export function createContactToken(secret, now = Date.now(), nonce = randomUUID()) {
  if (!secret || secret.length < 32) throw new Error("CONTACT_FORM_SECRET is not configured");
  const payload = b64url(JSON.stringify({ t: now, n: nonce }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyContactToken(token, secret, now = Date.now()) {
  if (!secret || secret.length < 32 || typeof token !== "string") return { ok: false, reason: "invalid" };
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return { ok: false, reason: "invalid" };
  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return { ok: false, reason: "invalid" };
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const age = now - Number(parsed.t);
    if (!parsed.n || !Number.isFinite(age) || age < TOKEN_MIN_AGE_MS) return { ok: false, reason: "too_fast" };
    if (age > TOKEN_MAX_AGE_MS) return { ok: false, reason: "expired" };
    return { ok: true, nonce: parsed.n, age };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

export function validateContactSubmission(input, secret, now = Date.now()) {
  const payload = {
    name: clean(input?.name, 80),
    email: clean(input?.email, 254).toLowerCase(),
    organization: clean(input?.organization, 120),
    category: clean(input?.category, 40),
    message: clean(input?.message, 4000),
    website: clean(input?.website, 200),
    token: clean(input?.token, 500),
    consent: input?.consent === true || input?.consent === "true"
  };

  if (payload.website) return { ok: true, spam: true, payload };
  const errors = [];
  if (payload.name.length < 1) errors.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) errors.push("email");
  if (!CONTACT_CATEGORIES.has(payload.category)) errors.push("category");
  if (payload.message.length < 20) errors.push("message_short");
  if (!payload.consent) errors.push("consent");
  const urlCount = (payload.message.match(/https?:\/\//gi) || []).length;
  if (urlCount > 2) errors.push("too_many_urls");
  const token = verifyContactToken(payload.token, secret, now);
  if (!token.ok) errors.push(`token_${token.reason}`);
  return { ok: errors.length === 0, errors, payload, token };
}

export function fingerprintContact(payload) {
  return createHash("sha256")
    .update(`${payload.email}\n${payload.category}\n${payload.message}`)
    .digest("hex");
}

export function buildContactEmail(payload, submittedAt = new Date()) {
  const category = CONTACT_CATEGORIES.get(payload.category) || "お問い合わせ";
  const subject = `【Webフォーム】${category}`;
  const text = [
    "よか隊ネット熊本 Webサイトからお問い合わせが届きました。",
    "",
    `種別: ${category}`,
    `お名前: ${payload.name}`,
    `団体名: ${payload.organization || "（未入力）"}`,
    `返信先: ${payload.email}`,
    `受付日時: ${submittedAt.toISOString()}`,
    "",
    "お問い合わせ内容:",
    payload.message
  ].join("\n");
  return { subject, text };
}
