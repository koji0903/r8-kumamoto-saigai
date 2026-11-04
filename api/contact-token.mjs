import { createContactToken } from "../lib/contact-form.mjs";

export default function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ ok: false });
  }
  try {
    const token = createContactToken(process.env.CONTACT_FORM_SECRET);
    return response.status(200).json({ ok: true, token });
  } catch {
    return response.status(503).json({ ok: false, message: "お問い合わせフォームを準備中です。" });
  }
}
