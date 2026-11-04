import assert from "node:assert/strict";
import fs from "node:fs";
import { buildContactEmail, createContactToken, validateContactSubmission, verifyContactToken } from "../lib/contact-form.mjs";
import contactHandler from "../api/contact.mjs";

const secret = "test-secret-that-is-longer-than-thirty-two-characters";
const now = Date.parse("2026-11-04T00:00:00Z");
const token = createContactToken(secret, now - 5000, "test-nonce");
assert.equal(verifyContactToken(token, secret, now).ok, true, "署名済みトークンを検証できません");
assert.equal(verifyContactToken(`${token}x`, secret, now).ok, false, "改ざんトークンを拒否してください");
assert.equal(verifyContactToken(createContactToken(secret, now - 500, "fast"), secret, now).reason, "too_fast", "短時間送信を拒否してください");
assert.equal(verifyContactToken(createContactToken(secret, now - 31 * 60 * 1000, "old"), secret, now).reason, "expired", "期限切れトークンを拒否してください");

const valid = validateContactSubmission({
  name: "山田 太郎",
  email: "USER@example.com",
  organization: "テスト団体",
  category: "general",
  message: "活動への参加方法について詳しく教えてください。",
  consent: true,
  token,
  website: ""
}, secret, now);
assert.equal(valid.ok, true, `正常入力が拒否されました: ${valid.errors}`);
assert.equal(valid.payload.email, "user@example.com", "メールアドレスを正規化してください");
assert.equal(validateContactSubmission({ ...valid.payload, token, message: "短い" }, secret, now).ok, false, "短すぎる本文を拒否してください");
assert.equal(validateContactSubmission({ ...valid.payload, token, consent: false }, secret, now).ok, false, "同意なしを拒否してください");
assert.equal(validateContactSubmission({ ...valid.payload, token, website: "https://spam.example" }, secret, now).spam, true, "ハニーポットを検出してください");
assert.equal(validateContactSubmission({ ...valid.payload, token, message: "https://a.example https://b.example https://c.example" }, secret, now).ok, false, "大量URLを拒否してください");
const mail = buildContactEmail(valid.payload, new Date(now));
assert.match(mail.subject, /一般のお問い合わせ/, "問い合わせ種別を件名に含めてください");
assert.match(mail.text, /user@example\.com/, "返信先を本文に含めてください");

const root = new URL("../", import.meta.url);
const publicFiles = [
  ...fs.readdirSync(root).filter(file => file.endsWith(".html")),
  "org-site.js",
  "note/articles/01-introduction-yokatai-net-portal.md",
  "note/articles/16-disaster-laws-terms-official.md"
];
for (const file of publicFiles) {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  assert.equal(/info\.yokatai@gmail\.com|090[- ]?2719[- ]?4037|09027194037|mailto:info\.yokatai/i.test(source), false, `${file}: 団体のメールアドレスまたは携帯番号が公開されています`);
}
const contact = fs.readFileSync(new URL("../contact.html", import.meta.url), "utf8");
for (const field of ["name", "email", "category", "message", "consent", "website", "token"]) assert.ok(contact.includes(`name="${field}"`), `contact.html: ${field} がありません`);
assert.ok(contact.includes('action="/api/contact"'), "contact.html: サーバー側APIへ送信してください");
assert.ok(contact.includes("contact-form.js"), "contact.html: フォーム制御スクリプトがありません");
const api = fs.readFileSync(new URL("../api/contact.mjs", import.meta.url), "utf8");
for (const control of ["allowedOrigin", "rateAllowed", "isDuplicate", "RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL", "Idempotency-Key"]) assert.ok(api.includes(control), `api/contact.mjs: ${control} がありません`);
assert.equal(api.includes("info.yokatai@gmail.com"), false, "送信先をソースコードへ埋め込まないでください");

const previousEnv = {
  secret: process.env.CONTACT_FORM_SECRET,
  key: process.env.RESEND_API_KEY,
  to: process.env.CONTACT_TO_EMAIL,
  from: process.env.CONTACT_FROM_EMAIL,
  vercel: process.env.VERCEL_ENV
};
const previousFetch = globalThis.fetch;
process.env.CONTACT_FORM_SECRET = secret;
process.env.RESEND_API_KEY = "test-api-key";
process.env.CONTACT_TO_EMAIL = "private-recipient@example.com";
process.env.CONTACT_FROM_EMAIL = "Web Form <form@example.com>";
process.env.VERCEL_ENV = "production";
let sentRequest;
globalThis.fetch = async (url, options) => {
  sentRequest = { url, options };
  return { ok: true, status: 200 };
};
const response = {
  statusCode: 200,
  headers: {},
  setHeader(name, value) { this.headers[name] = value; },
  status(code) { this.statusCode = code; return this; },
  json(value) { this.body = value; return this; }
};
await contactHandler({
  method: "POST",
  headers: { origin: "https://www.yokatainet.jp", "content-type": "application/json", "user-agent": "test", "x-forwarded-for": "192.0.2.1" },
  body: { ...valid.payload, token: createContactToken(secret, Date.now() - 5000, "api-test-nonce") },
  socket: {}
}, response);
assert.equal(response.statusCode, 200, `API正常送信が失敗しました: ${JSON.stringify(response.body)}`);
assert.equal(sentRequest.url, "https://api.resend.com/emails", "メール配信APIへ送信してください");
const sentBody = JSON.parse(sentRequest.options.body);
assert.deepEqual(sentBody.to, ["private-recipient@example.com"], "宛先はサーバー環境変数から設定してください");
assert.equal(sentBody.reply_to, "user@example.com", "返信先はフォーム入力値にしてください");
globalThis.fetch = previousFetch;
for (const [key, value] of Object.entries({ CONTACT_FORM_SECRET: previousEnv.secret, RESEND_API_KEY: previousEnv.key, CONTACT_TO_EMAIL: previousEnv.to, CONTACT_FROM_EMAIL: previousEnv.from, VERCEL_ENV: previousEnv.vercel })) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}
console.log("お問い合わせフォーム: 宛先非公開 / 署名トークン / ハニーポット / 入力検証 / 連投・重複防止 / Resend送信 OK");
