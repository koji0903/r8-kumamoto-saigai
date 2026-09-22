#!/usr/bin/env node
// 暮らしの支援ガイド（4市町）の掲載漏れとリンク切れを監視する。
// 使い方:
//   node scripts/monitor-living-support-coverage.mjs            レポートを更新して結果を表示
//   node scripts/monitor-living-support-coverage.mjs --check     新規の未掲載制度・リンク切れがあれば終了コード1
//   node scripts/monitor-living-support-coverage.mjs --no-links  外部リンクの死活確認を省略
//   node scripts/monitor-living-support-coverage.mjs --dry-run   レポートを書き込まない

import fs from "node:fs";
import path from "node:path";
import { applyCandidateStatuses, buildReport, configPath, diffReports, formatSummary, indexEntry, readJson, reportPath } from "./living-support-coverage.mjs";

const args = process.argv.slice(2);
const unknown = args.filter(argument => !["--check", "--no-links", "--dry-run", "--json"].includes(argument));
if (unknown.length) {
  console.error(`不明な引数です: ${unknown.join(", ")}`);
  process.exit(2);
}
const checkOnly = args.includes("--check");
const skipLinks = args.includes("--no-links");
const dryRun = args.includes("--dry-run");
const asJson = args.includes("--json");

const USER_AGENT = "YokataiNet-LivingSupportCoverageMonitor/1.0 (+https://www.yokatainet.jp/)";
const TIMEOUT_MS = Number(process.env.COVERAGE_MONITOR_TIMEOUT_MS || 30000);
const CONCURRENCY = Number(process.env.COVERAGE_MONITOR_CONCURRENCY || 4);

const jstNow = () => {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).formatToParts(new Date()).reduce((all, part) => ({ ...all, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+09:00`;
};

async function request(url, method = "GET") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { method, redirect: "follow", signal: controller.signal, headers: { "user-agent": USER_AGENT } });
    const body = method === "GET" ? await response.text() : "";
    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    return { ok: false, status: 0, body: "", error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, worker) {
  const queue = [...items];
  const results = [];
  await Promise.all(Array.from({ length: Math.max(1, limit) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      results.push(await worker(item));
    }
  }));
  return results;
}

const config = readJson(configPath);

// 1) 索引ページを取得
const indexUrls = [...new Set(config.municipalities.flatMap(municipality => municipality.indexes.map(index => indexEntry(index).url)))];
const fetched = new Map();
await mapLimit(indexUrls, CONCURRENCY, async url => {
  const result = await request(url);
  if (result.ok) fetched.set(url, result.body);
  else console.error(`索引の取得に失敗: [${result.status}] ${url}`);
});

// 2) 掲載ページの外部リンクの死活確認
const deadLinks = [];
if (!skipLinks) {
  const targets = new Map();
  for (const municipality of config.municipalities) {
    const html = fs.readFileSync(municipality.page, "utf8");
    for (const match of html.matchAll(/<a class="uto-card-link"[^>]*href="(https?:\/\/[^"]+)"/g)) {
      if (!targets.has(match[1])) targets.set(match[1], municipality.page);
    }
  }
  await mapLimit([...targets.keys()], CONCURRENCY, async url => {
    let result = await request(url, "HEAD");
    if (!result.ok) result = await request(url, "GET");
    if (!result.ok) deadLinks.push({ page: targets.get(url), url, status: result.status, error: result.error || "" });
  });
  deadLinks.sort((a, b) => a.url.localeCompare(b.url));
}

// 3) レポートを組み立て、未掲載候補のURLが生きているか確認したうえで前回と比較
const report = buildReport({ config, fetched, now: jstNow(), deadLinks });
const candidateUrls = [...new Set(report.municipalities.flatMap(municipality => municipality.unlisted.map(entry => entry.url)))];
const statusByUrl = new Map();
await mapLimit(candidateUrls, CONCURRENCY, async url => {
  let result = await request(url, "HEAD");
  if (!result.ok) result = await request(url, "GET");
  statusByUrl.set(url, result.status);
});
applyCandidateStatuses(report, statusByUrl);
const previous = fs.existsSync(reportPath) ? readJson(reportPath) : null;
const { newUnlisted, newDeadLinks } = diffReports(previous, report);

if (asJson) console.log(JSON.stringify(report, null, 2));
else console.log(formatSummary(report));

if (!dryRun) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`\n掲載 ${report.summary.cardCount}件 / 未掲載 ${report.summary.unlistedCount}件（新規 ${newUnlisted.length}件） / リンク切れ ${report.summary.deadLinkCount}件（新規 ${newDeadLinks.length}件）`);
if (report.summary.staleCandidateCount) console.log(`自治体側で消えた候補: ${report.summary.staleCandidateCount}件（掲載漏れとしては数えません）`);
if (report.summary.indexErrorCount) console.log(`索引の取得に失敗: ${report.summary.indexErrorCount}件（一時的な障害の可能性があります）`);

if (newUnlisted.length) {
  console.log("\n### 新たに見つかった未掲載制度");
  for (const entry of newUnlisted) console.log(`- ${entry.municipality}：${entry.title}\n  ${entry.url}`);
}
if (newDeadLinks.length) {
  console.log("\n### 新たなリンク切れ");
  for (const entry of newDeadLinks) console.log(`- [${entry.status}] ${entry.page} → ${entry.url}`);
}

if (checkOnly && (newUnlisted.length || newDeadLinks.length)) process.exit(1);
