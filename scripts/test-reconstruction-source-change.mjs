import assert from "node:assert/strict";
import fs from "node:fs";
import { classifyFetch, hashBody, impactEntity, jstTimestamp, normalizeHtml, riskForClaims, shouldExcludeFromPublic, validateRetrievedBody } from "./reconstruction-source-change.mjs";

const htmlA = "<html><header>更新時刻</header><main><h1>制度</h1><p>限度額 757,000円</p></main><footer>共通</footer></html>";
const htmlNoise = "<html><header>別の更新時刻</header><main><h1>制度</h1><p>限度額 757,000円</p></main><footer>別共通</footer></html>";
assert.equal(normalizeHtml(htmlA), "制度 限度額 757,000円");
assert.equal(hashBody(htmlA), hashBody(htmlNoise), "header/footerだけの変化を本文変更にしない");
assert.equal(validateRetrievedBody(`${htmlA}<main>公式制度の対象条件、申請方法、必要書類、受付窓口、受付期間について詳しく案内しています。</main>`, "html", "text/html").valid, true);
assert.equal(validateRetrievedBody("<html><body>Access Denied by Cloudflare bot verification</body></html>", "html", "text/html").valid, false, "WAF応答を本文変更にしない");
assert.equal(validateRetrievedBody("{\"error\":\"temporary\"}", "html", "application/json").valid, false, "HTML以外を本文変更にしない");
assert.equal(validateRetrievedBody(Buffer.from("%PDF-1.7 fixture"), "pdf", "application/pdf").valid, true);
assert.equal(validateRetrievedBody(Buffer.from("<html>error</html>"), "pdf", "text/html").valid, false, "PDF URLのHTML応答を本文変更にしない");
const previous = { contentHash: hashBody(htmlA), hashAlgorithm: "normalized-html-v1", url: "https://example.go.jp/a", consecutiveFailures: 0 };
const htmlChanged = { kind: "html", status: 200, finalUrl: previous.url, redirected: false, hash: hashBody("<main>限度額 800,000円</main>"), hashAlgorithm: "normalized-html-v1" };
const pdfPrevious = { contentHash: hashBody(Buffer.from("pdf-a"), "pdf"), hashAlgorithm: "raw-pdf-v1", url: "https://example.go.jp/a.pdf", consecutiveFailures: 0 };
const pdfChanged = { kind: "pdf", status: 200, finalUrl: pdfPrevious.url, redirected: false, hash: hashBody(Buffer.from("pdf-b"), "pdf"), hashAlgorithm: "raw-pdf-v1" };
assert.equal(classifyFetch(previous, { ...htmlChanged, hash: previous.contentHash }, ["amount"]).eventType, "unchanged");
assert.deepEqual(classifyFetch(previous, htmlChanged, ["amount"]), { eventType: "content_changed", status: "ACTION_REQUIRED", risk: "high", changed: true });
assert.equal(classifyFetch(pdfPrevious, pdfChanged, ["deadline"]).eventType, "pdf_replaced");
for (const claim of ["amount", "deadline", "eligibility", "required_document", "required_documents", "contact", "application_method", "warning"]) assert.equal(riskForClaims([claim]), "high", claim);
assert.equal(riskForClaims(["benefit"]), "medium");
assert.equal(riskForClaims(["general_description"]), "low");
assert.equal(classifyFetch(previous, { kind: "html", status: 404 }, ["amount"]).status, "WARNING", "単発404");
assert.equal(classifyFetch({ ...previous, consecutiveFailures: 1 }, { kind: "html", status: 404 }, ["amount"]).status, "ACTION_REQUIRED", "継続404");
assert.equal(classifyFetch(previous, { kind: "html", status: 200, redirected: true, finalUrl: "https://example.go.jp/b", hash: previous.contentHash, hashAlgorithm: "normalized-html-v1" }, ["amount"]).eventType, "url_redirected");
assert.equal(classifyFetch(previous, { kind: "html", status: 200, redirected: false, finalUrl: "https://example.go.jp/b", hash: previous.contentHash, hashAlgorithm: "normalized-html-v1" }, ["amount"]).eventType, "url_migrated");
for (const kind of ["timeout", "network_error"]) assert.equal(classifyFetch(previous, { kind, status: 0 }, ["deadline"]).eventType, "source_unreachable");
assert.equal(classifyFetch(previous, { kind: "html", status: 503 }, ["deadline"]).status, "WARNING");
const verified = { publicationStatus: "published", verificationStatus: "verified", freshnessStatus: "fresh" };
assert.equal(impactEntity(verified, { status: "ACTION_REQUIRED", risk: "high" }), true);
assert.deepEqual(verified, { publicationStatus: "published", verificationStatus: "needs_review", freshnessStatus: "review_due" }, "publicationStatusは維持");
assert.equal(impactEntity({ verificationStatus: "verified" }, { status: "WARNING", risk: "low" }), false);
assert.equal(shouldExcludeFromPublic({ publicationStatus: "published", verificationStatus: "needs_review" }), true);
assert.equal(shouldExcludeFromPublic({ publicationStatus: "published", verificationStatus: "verified" }), false);
const sharedSourceLinks = [{ entityId: "application-a" }, { entityId: "contact-a" }, { entityId: "action-a" }];
assert.equal(new Set(sharedSourceLinks.map(() => "source-one")).size, 1, "複数entity参照でもURL単位で1回取得");
// 監視が書き込む日時は data/reconstruction のスキーマに適合しなければならない。
// Date#toISOString() のミリ秒付きUTCをそのまま入れて定期実行が落ちたことがあるため、
// スキーマの正規表現そのものを読んで突き合わせる。
const dateTimePattern = new RegExp(JSON.parse(fs.readFileSync(new URL("../schemas/reconstruction/common.schema.json", import.meta.url), "utf8")).$defs.nullableDateTime.pattern);
for (const input of [new Date("2026-08-15T21:44:49.625Z"), "2026-08-15T21:44:49.625Z", "2026-08-15T21:44:49Z", "2026-08-10T15:50:00+09:00", 1786000000000]) {
  const stamp = jstTimestamp(input);
  assert.match(stamp, dateTimePattern, `スキーマに適合しない日時: ${String(input)} -> ${stamp}`);
  assert.equal(stamp.endsWith("+09:00"), true, "既存データと同じJST表記に揃える");
  assert.equal(jstTimestamp(stamp), stamp, "正規化は冪等でなければならない");
}
assert.equal(jstTimestamp("2026-08-15T21:44:49.625Z"), "2026-08-16T06:44:49+09:00");
assert.throws(() => jstTimestamp("not-a-date"), /日時として解釈できません/);
// 監視が生成するイベントIDは日時から作られるので、正規化で桁が崩れないこと
assert.equal(jstTimestamp("2026-08-15T21:44:49.625Z").replace(/\D/g, "").slice(0, 14).length, 14);

console.log("source変更監視: 変更なし・HTML・PDF・amount/deadline/eligibility/documents/contact/warning・404・redirect・timeout・複数entity・needs_review・公開除外・日時形式 OK");
