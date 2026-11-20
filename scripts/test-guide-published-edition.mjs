import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { officialEdition, publishedEditionProblems } from "./guide-published-edition.mjs";

const root = new URL("../", import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const config = JSON.parse(read("sources/guide-official-watch.json"));
const target = config.targets.find(({ id }) => id === "yatsushiro-support-guide");
const rule = target.publishedEdition;
const label = rule.officialLinkLabel;
const newPdf = new URL("latest.pdf", target.url).href;
const oldPdf = new URL("old.pdf", target.url).href;
const officialHtml = `<p>2026年11月18日</p><a href="latest.pdf"><span>${label}第１０版</span></a>
  <a href="old.pdf">${label}第９版</a>`;
const expected = { edition: 10, pdf: newPdf };
assert.deepEqual(officialEdition(officialHtml, target.url, label), expected);
assert.equal(officialEdition(officialHtml + `<a href="other.pdf">${label}第10版</a>`, target.url, label), null);
assert.equal(officialEdition("<p>更新中</p>", target.url, label), null);

const siteUrl = "https://www.yokatainet.jp/";
const current = `<h1>八代市 被災者応援ガイド<span>第10版</span></h1><a href="${newPdf}#page=15">PDF</a>`;
const stale = `<h1>八代市 被災者応援ガイド第8版</h1><a href="${oldPdf}">PDF</a>`;
assert.deepEqual(publishedEditionProblems(current, siteUrl, expected, true), []);
assert.equal(publishedEditionProblems(stale, siteUrl, expected, true).length, 3);
assert.equal(publishedEditionProblems(current + `<a href="${oldPdf}#page=52">旧PDF</a>`, siteUrl, expected, true).length, 1);
assert.equal(publishedEditionProblems("<script>第10版</script><p>第101版</p>", siteUrl, expected, false).length, 1);

const savedReport = read("reports/guide-official-watch.json");
// 公式スナップショットに改訂版が保存済みの状態を再現する。
const fingerprint = createHash("sha256")
  .update(JSON.stringify({ updatedLabel: null, keyLines: ["2026年11月18日"] }))
  .digest("hex").slice(0, 16);
function runMonitor(mainHtml, { breakSource = false, initial = false } = {}) {
  const report = { targets: initial ? {} : { [target.id]: { fingerprint } } };
  const mock = `import fs from "node:fs";
  const read = fs.readFileSync;
  fs.readFileSync = (file, ...args) => String(file).endsWith("/reports/guide-official-watch.json")
    ? ${JSON.stringify(JSON.stringify(report))} : read(file, ...args);
  globalThis.fetch = async (url) => {
    const source = ${JSON.stringify(target.url)};
    const site = ${JSON.stringify(siteUrl)};
    if (url === source && !${breakSource}) return { ok: true, url, text: async () => ${JSON.stringify(officialHtml)} };
    if (!url.startsWith(site)) return { ok: false, status: 503 };
    const html = url === new URL(${JSON.stringify(rule.guideWithPdf)}, site).href
      ? ${JSON.stringify(mainHtml)} : "<p>被災者応援ガイドブック第10版</p>";
    return { ok: true, url, text: async () => html };
  };`;
  return spawnSync(process.execPath, [
    "--import", "data:text/javascript," + encodeURIComponent(mock),
    "scripts/monitor-guide-official-sources.mjs", "--check", "--dry-run",
  ], { cwd: fileURLToPath(root), encoding: "utf8", timeout: 15000 });
}

const initial = runMonitor(stale, { initial: true });
assert.equal(initial.status, 1, initial.stderr);
assert.match(initial.stdout, /初回取得・ガイドとの突合が必要/);
assert.match(initial.stdout, /公開版照合: yatsushiro-support-guide \/ mismatch/);

for (let attempt = 0; attempt < 2; attempt++) {
  const mismatch = runMonitor(stale);
  assert.equal(mismatch.status, 1, mismatch.stderr);
  assert.match(mismatch.stdout, /変更検出0件/);
  assert.match(mismatch.stdout, /公開版照合: yatsushiro-support-guide \/ mismatch/);
}
const recovered = runMonitor(current);
assert.equal(recovered.status, 0, recovered.stdout + recovered.stderr);
assert.match(recovered.stdout, /公開版照合: yatsushiro-support-guide \/ ok/);
const unavailable = runMonitor(current, { breakSource: true });
assert.equal(unavailable.status, 1, unavailable.stderr);
assert.match(unavailable.stdout, /公開版照合: yatsushiro-support-guide \/ unavailable/);
assert.equal(read("reports/guide-official-watch.json"), savedReport);
console.log("公開ガイド照合: 公式履歴保存後の検出・継続通知・解消・取得不能 OK");
