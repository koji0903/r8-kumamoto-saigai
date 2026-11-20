#!/usr/bin/env node
// ルート直下の全公開HTMLを自動発見し、掲載されている行政公式リンクを横断監視する。

import fs from "node:fs";
import path from "node:path";
import { buildPageInventory, isOfficialUrl, REPORT_PATH } from "./page-monitoring-coverage.mjs";

const args = process.argv.slice(2);
const unknown = args.filter(argument => !["--check", "--dry-run", "--json"].includes(argument));
if (unknown.length) {
  console.error(`不明な引数です: ${unknown.join(", ")}`);
  process.exit(2);
}
const checkMode = args.includes("--check");
const dryRun = args.includes("--dry-run");
const jsonMode = args.includes("--json");
const CONCURRENCY = Math.max(1, Number(process.env.ALL_PAGE_LINK_CONCURRENCY || 6));
const TIMEOUT_MS = Math.max(1000, Number(process.env.ALL_PAGE_LINK_TIMEOUT_MS || 15000));
const USER_AGENT = "YokataiNet-AllPageOfficialLinkMonitor/1.0 (+https://www.yokatainet.jp/)";
const HARD_DEAD = new Set([404, 410]);

const previous = fs.existsSync(REPORT_PATH)
  ? JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"))
  : { links: {} };
const { pages, inventory, urlPages } = buildPageInventory();
const urls = [...urlPages.keys()].sort((a, b) => a.localeCompare(b));

const request = async url => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        "accept": "text/html,application/pdf;q=0.8,*/*;q=0.5",
        "range": "bytes=0-2047"
      }
    });
    const finalUrl = response.url || url;
    await response.body?.cancel();
    return { status: response.status, finalUrl, error: "" };
  } catch (error) {
    return { status: 0, finalUrl: url, error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
};

const runPool = async (items, limit, worker) => {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, Math.max(1, items.length)) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  }));
  return results;
};

const results = await runPool(urls, CONCURRENCY, request);
const checkedAt = new Date().toISOString();
const links = {};
const findings = [];
let okCount = 0;
let unavailableCount = 0;

for (let index = 0; index < urls.length; index++) {
  const url = urls[index];
  const result = results[index];
  const old = previous.links?.[url];
  const hardDead = HARD_DEAD.has(result.status);
  const unavailable = result.status === 0 || result.status === 403 || result.status === 429 || result.status >= 500;
  // WAF・レート制限・サーバー障害（403/429/5xx）はリンク切れとは断定しない。通信不能だけを連続失敗として追跡する。
  const repeatableFailure = result.status === 0;
  const unavailableStreak = repeatableFailure ? Number(old?.unavailableStreak || 0) + 1 : 0;
  const externalRedirect = result.status >= 200 && result.status < 400 && !isOfficialUrl(result.finalUrl);
  if (!hardDead && !unavailable && !externalRedirect) okCount++;
  if (unavailable) unavailableCount++;

  links[url] = {
    pages: urlPages.get(url),
    status: result.status,
    finalUrl: result.finalUrl,
    checkedAt,
    unavailableStreak,
    ...(result.error ? { error: result.error } : {})
  };

  if (hardDead || externalRedirect || (repeatableFailure && unavailableStreak >= 3)) {
    findings.push({
      url,
      pages: urlPages.get(url),
      status: result.status,
      finalUrl: result.finalUrl,
      reason: hardDead ? "404/410" : externalRedirect ? "行政公式ドメイン外へ転送" : `連続${unavailableStreak}回取得不能`
    });
  }
}

const report = {
  schemaVersion: "1.0.0",
  generatedAt: checkedAt,
  summary: {
    publicPageCount: pages.length,
    pageWithOfficialLinksCount: inventory.filter(item => item.officialLinkCount > 0).length,
    officialLinkCount: urls.length,
    okCount,
    unavailableCount,
    findingCount: findings.length
  },
  pages: inventory,
  findings,
  links
};

if (!dryRun) {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

if (jsonMode) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`全公開ページ公式リンク監視: ${pages.length}ページ / 公式リンク${urls.length}件 / 正常${okCount}件 / 判定不能${unavailableCount}件 / 要確認${findings.length}件`);
  for (const finding of findings) {
    console.log(`- [${finding.status}] ${finding.reason}: ${finding.url}`);
    console.log(`  掲載ページ: ${finding.pages.join(", ")}`);
  }
}

if (checkMode && findings.length) process.exit(1);
