import { createHash, randomUUID } from "node:crypto";
import { buildContactEmail, fingerprintContact, validateContactSubmission } from "../lib/contact-form.mjs";

const rateBuckets = new Map();
const duplicateBuckets = new Map();
const usedTokenBuckets = new Map();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 30 * 60 * 1000;
const RATE_LIMIT = 3;

const clientIp = request => String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown").split(",")[0].trim();
const hash = value => createHash("sha256").update(value).digest("hex");
const allowedOrigin = request => {
  const origin = String(request.headers.origin || "");
  const allowed = new Set(["https://www.yokatainet.jp", "https://yokatainet.jp"]);
  if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_ENV !== "production") {
    allowed.add("http://127.0.0.1:8765");
    allowed.add("http://localhost:8765");
  }
  return allowed.has(origin);
};

const rateAllowed = (key, now) => {
  const recent = (rateBuckets.get(key) || []).filter(time => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  rateBuckets.set(key, recent);
  return true;
};

const isDuplicate = (key, now) => {
  const previous = duplicateBuckets.get(key);
  if (previous && now - previous < DUPLICATE_WINDOW_MS) return true;
  duplicateBuckets.set(key, now);
  return false;
};

async function sendWithResend({ to, from, replyTo, subject, text, idempotencyKey, apiKey }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text }),
      signal: controller.signal
    });
    if (!result.ok) throw new Error(`mail_provider_${result.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false });
  }
  if (!allowedOrigin(request)) return response.status(403).json({ ok: false, message: "送信できませんでした。" });
  if (!String(request.headers["content-type"] || "").startsWith("application/json")) return response.status(415).json({ ok: false });
  if (Number(request.headers["content-length"] || 0) > 20000) return response.status(413).json({ ok: false });

  let body = request.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return response.status(400).json({ ok: false, message: "入力内容を確認してください。" });
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return response.status(400).json({ ok: false });

  const secret = process.env.CONTACT_FORM_SECRET;
  const validation = validateContactSubmission(body, secret);
  if (validation.spam) return response.status(200).json({ ok: true });
  if (!validation.ok) return response.status(400).json({ ok: false, message: "入力内容を確認してください。" });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to || "") || !from) {
    return response.status(503).json({ ok: false, message: "お問い合わせフォームを準備中です。" });
  }

  const now = Date.now();
  const ipKey = hash(`${clientIp(request)}:${String(request.headers["user-agent"] || "")}`);
  if (!rateAllowed(ipKey, now)) return response.status(429).json({ ok: false, message: "送信回数が上限に達しました。時間をおいてお試しください。" });
  const fingerprint = fingerprintContact(validation.payload);
  if (isDuplicate(fingerprint, now)) return response.status(200).json({ ok: true });
  for (const [nonce, usedAt] of usedTokenBuckets) {
    if (now - usedAt > DUPLICATE_WINDOW_MS) usedTokenBuckets.delete(nonce);
  }
  if (usedTokenBuckets.has(validation.token.nonce)) return response.status(400).json({ ok: false, message: "入力内容を確認してください。" });
  usedTokenBuckets.set(validation.token.nonce, now);

  const email = buildContactEmail(validation.payload);
  try {
    await sendWithResend({
      apiKey,
      to,
      from,
      replyTo: validation.payload.email,
      subject: email.subject,
      text: email.text,
      idempotencyKey: `contact/${fingerprint}/${Math.floor(now / DUPLICATE_WINDOW_MS)}`
    });
    return response.status(200).json({ ok: true, receipt: randomUUID() });
  } catch {
    duplicateBuckets.delete(fingerprint);
    usedTokenBuckets.delete(validation.token.nonce);
    return response.status(502).json({ ok: false, message: "送信できませんでした。時間をおいてお試しください。" });
  }
}
