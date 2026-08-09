#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png" };

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relative = pathname === "/" ? "reconstruction.html" : pathname.replace(/^\/+/, "");
  const target = path.resolve(root, relative);
  if (!target.startsWith(`${root}${path.sep}`) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": mime[path.extname(target)] || "application/octet-stream" });
  fs.createReadStream(target).pipe(response);
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const launchOptions = { headless: true };
  if (process.env.CHROME_BIN) launchOptions.executablePath = process.env.CHROME_BIN;
  const browser = await chromium.launch(launchOptions);
  try {
    for (const width of [320, 375, 390, 430, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`http://127.0.0.1:${port}/reconstruction.html`, { waitUntil: "networkidle" });
      assert(await page.locator("#emptyState").isVisible(), `${width}px: 本番0件の空状態が表示されません`);
      assert(await page.locator(".program-card").count() === 0, `${width}px: 本番にfixtureカードが表示されました`);
      assert(await page.locator("#demoBanner").isHidden(), `${width}px: 本番にデモ表示が出ました`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(overflow <= 1, `${width}px: 横スクロールが発生しています（${overflow}px）`);
      const clippedText = await page.locator("h1,h2,h3,p,li,a,button").evaluateAll(nodes => nodes.filter(node => {
        const style = getComputedStyle(node);
        return node.getClientRects().length && node.scrollWidth > node.clientWidth + 1 && !["auto", "scroll"].includes(style.overflowX);
      }).map(node => node.textContent.trim().slice(0, 40)));
      assert(clippedText.length === 0, `${width}px: 文字が横方向に切れています（${clippedText.join(" / ")}）`);
      await page.close();
    }

    const productionQueryPage = await browser.newPage({ viewport: { width: 375, height: 900 } });
    await productionQueryPage.goto(`http://0.0.0.0:${port}/reconstruction.html?fixture=1`, { waitUntil: "networkidle" });
    assert(await productionQueryPage.locator(".program-card").count() === 0, "本番相当ホストでfixture queryが有効になりました");
    await productionQueryPage.close();

    const noScriptPage = await browser.newPage({ viewport: { width: 375, height: 900 }, javaScriptEnabled: false });
    await noScriptPage.goto(`http://127.0.0.1:${port}/reconstruction.html`, { waitUntil: "networkidle" });
    assert(await noScriptPage.locator("noscript .information-state").isVisible(), "JavaScript無効時の安全案内が表示されません");
    assert((await noScriptPage.locator("noscript .information-state").innerText()).includes("市町村の公式情報"), "JavaScript無効時に公式情報へ退避できません");
    await noScriptPage.close();

    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/reconstruction.html?fixture=1`, { waitUntil: "networkidle" });
    assert(await page.locator("#demoBanner").isVisible(), "fixture識別表示がありません");
    assert((await page.locator("#demoBanner").innerText()).includes("利用者テスト用画面"), "fixtureが利用者テスト用と識別できません");
    assert((await page.locator("#demoBanner").innerText()).includes("テストデータ"), "fixtureがテストデータであると明示されていません");
    const hostPolicy = await page.evaluate(() => ({
      privateHosts: ["10.0.0.5", "172.16.0.2", "172.31.255.2", "192.168.1.20"].every(isPrivateTestHost),
      publicHosts: ["example.com", "8.8.8.8", "172.15.0.2", "172.32.0.2"].every(host => !isPrivateTestHost(host))
    }));
    assert(hostPolicy.privateHosts, "同一LANのテスト端末でfixtureを利用できません");
    assert(hostPolicy.publicHosts, "公開ホストでfixtureが許可される可能性があります");
    assert(await page.locator(".program-card").count() === 1, "fixture制度カードが表示されません");
    const cardText = await page.locator(".program-card").innerText();
    assert(cardText.includes("制度の実施を確認済み"), "何が確認済みなのか明示されていません");
    assert(cardText.includes("対象になるかは条件の確認が必要です"), "制度状態と本人対象が分離されていません");
    assert(cardText.includes("詳しい申請方法を確認しています"), "自治体の申請方法確認中が表示されません");
    assert(cardText.includes("制度が利用できないという意味ではありません"), "受付確認中を不適用と誤解しない補足がありません");
    assert(cardText.includes("市町村によって手続きが異なる場合があります"), "自治体ごとの差が説明されていません");
    assert(cardText.includes("まずすること"), "カード初期表示に次の行動がありません");
    const summaryOrder = await page.locator(".program-summary").evaluate(node => ({ action: node.querySelector(".next-action-preview")?.getBoundingClientRect().top, status: node.querySelector(".meaning-statuses")?.getBoundingClientRect().top }));
    assert(summaryOrder.action < summaryOrder.status, "次にすることが状態表示より後になっています");
    assert(await page.locator("#firstChecks li").count() === 3, "最初に確認する行動が3項目に整理されていません");
    const toggle = page.locator(".detail-toggle").first();
    assert((await toggle.textContent()).includes("支援内容・相談先"), "折りたたみで何が開くか分かりません");
    await toggle.focus();
    await page.keyboard.press("Enter");
    assert(await toggle.getAttribute("aria-expanded") === "true", "キーボードで詳細を開けません");
    assert(await page.locator(".program-detail").isVisible(), "制度詳細が表示されません");
    assert(await page.locator(".source-list a").count() === 2, "公式情報リンクが表示されません");
    const officialSourceSection = page.locator(".detail-section").filter({ hasText: "制度の内容を確認する" });
    assert(await officialSourceSection.count() === 1, "制度の公式情報リンクの目的が分かりません");
    assert((await officialSourceSection.innerText()).includes("正式な情報"), "公式発表であることが明示されていません");
    assert((await page.locator("#program-contact-0").innerText()).includes("相談・申請窓口"), "相談先と公式情報が分離されていません");
    assert((await page.locator(".pending-message").allTextContents()).some(text => text.includes("申請窓口")), "未確認窓口が確認中表示になっていません");
    const supporter = page.locator(".supporter-details");
    assert((await supporter.locator("summary").textContent()).includes("こちら"), "支援者向け折りたたみの誘導が不明確です");
    await supporter.locator("summary").click();
    assert(await supporter.locator("input[type=checkbox]").count() === 3, "相談項目が最大3件で表示されません");
    await supporter.locator("input[type=checkbox]").first().check();
    assert(await supporter.locator("input[type=checkbox]").first().isChecked(), "相談用チェックを操作できません");
    assert(await page.evaluate(() => localStorage.length === 0 && document.cookie === ""), "相談チェックの情報が保存されました");
    const headings = await page.locator("h1,h2,h3,h4").evaluateAll(nodes => nodes.map(node => Number(node.tagName.slice(1))));
    assert(headings[0] === 1 && !headings.some((level, index) => index && level > headings[index - 1] + 1), "見出し階層に飛びがあります");
    assert((await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1, "fixtureモバイルで横スクロールが発生しています");
    const clippedFixtureText = await page.locator("h1,h2,h3,p,li,a,button").evaluateAll(nodes => nodes.filter(node => node.getClientRects().length && node.scrollWidth > node.clientWidth + 1).map(node => node.textContent.trim().slice(0, 40)));
    assert(clippedFixtureText.length === 0, `fixtureモバイルで文字が切れています（${clippedFixtureText.join(" / ")}）`);
    await page.evaluate(() => {
      const contactData = structuredClone(window.RECONSTRUCTION_FIXTURE);
      contactData.programs[0].municipalities[0].contact = { name: "テスト用公式窓口", phone: "096-000-0000", hours: "平日 8:30〜17:00", url: "https://example.com/official-contact" };
      render(contactData);
    });
    const contactToggle = page.locator(".detail-toggle").first();
    await contactToggle.click();
    assert((await page.locator("#program-contact-0").innerText()).includes("受付時間 平日 8:30〜17:00"), "確認済み受付時間が表示されません");
    assert(await page.locator('#program-contact-0 a[href^="tel:"]').count() === 1, "確認済み電話番号から発信できません");
    assert(await page.locator('#program-contact-0 a[href="https://example.com/official-contact"]').count() === 1, "確認済み公式相談窓口へ進めません");
    await page.emulateMedia({ media: "print" });
    assert(await page.locator(".program-detail").isVisible(), "印刷時に制度詳細が表示されません");
    assert(await page.locator(".site-header nav").isHidden(), "印刷時に不要なナビゲーションが表示されています");
    const printText = await page.locator(".program-card").innerText();
    for (const required of ["まずすること", "相談する", "制度の内容を確認する", "情報確認："]) assert(printText.includes(required), `印刷時に「${required}」を追えません`);
    await page.close();
    console.log("生活再建UIテストOK: 本番0件、fixture隔離、行動優先、詳細、公式情報、pending、自治体差、相談項目、非保存、キーボード、印刷、見出し、320〜1440px");
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  server.close();
  process.exit(1);
});
