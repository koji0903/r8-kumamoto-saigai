#!/usr/bin/env node
// 暮らしの支援ガイド（4市町）の掲載漏れとリンク切れを監視する。
// 使い方:
//   node scripts/monitor-living-support-coverage.mjs            レポートを更新して結果を表示
//   node scripts/monitor-living-support-coverage.mjs --check     新規の未掲載制度・リンク切れがあれば終了コード1
//   node scripts/monitor-living-support-coverage.mjs --no-links  外部リンクの死活確認を省略
//   node scripts/monitor-living-support-coverage.mjs --dry-run   レポートを書き込まない

import fs from "node:fs";
import path from "node:path";
import { applyCandidateStatuses, buildReport, configPath, diffReports, formatSummary, indexEntry, isDeadStatus, readJson, reportPath } from "./living-support-coverage.mjs";

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
const CONCURRENCY = Number(process.env.COVERAGE_MONITOR_CONCURRENCY || 2);
const RETRIES = Number(process.env.COVERAGE_MONITOR_RETRIES || 3);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const jstNow = () => {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).formatToParts(new Date()).reduce((all, part) => ({ ...all, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+09:00`;
};

// 自治体サイトのWAFは短時間の連続アクセスを拒否することがあるため、間隔を空けて再試行する。
async function request(url, method = "GET") {
  let last = { ok: false, status: 0, body: "" };
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    last = await requestOnce(url, method);
    if (last.ok || isDeadStatus(last.status)) return last;
    if (attempt < RETRIES) await sleep(attempt * 2000);
  }
  return last;
}

async function requestOnce(url, method = "GET") {
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
const indexErrorDetails = [];
await mapLimit(indexUrls, CONCURRENCY, async url => {
  const result = await request(url);
  if (result.ok) fetched.set(url, result.body);
  else {
    indexErrorDetails.push({ url, status: result.status, error: result.error || "" });
    console.error(`索引の取得に失敗: [${result.status}] ${url}`);
  }
});
indexErrorDetails.sort((a, b) => a.url.localeCompare(b.url));

// 2) 掲載ページの外部リンクの死活確認
const deadLinks = [];
const blockedLinks = [];
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
    if (result.ok) return;
    const entry = { page: targets.get(url), url, status: result.status, error: result.error || "" };
    // 403・429・5xxは実行環境が弾かれている可能性が高く、リンク切れとは区別する。
    if (isDeadStatus(result.status)) deadLinks.push(entry);
    else blockedLinks.push(entry);
  });
  deadLinks.sort((a, b) => a.url.localeCompare(b.url));
  blockedLinks.sort((a, b) => a.url.localeCompare(b.url));
}

// 3) レポートを組み立て、未掲載候補のURLが生きているか確認したうえで前回と比較
//    （候補URLが403等で確認できない場合は、未掲載のまま残して次回に持ち越す）
const report = buildReport({ config, fetched, now: jstNow(), deadLinks, blockedLinks, indexErrorDetails });
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
if (report.summary.blockedLinkCount) console.log(`判定不能なリンク: ${report.summary.blockedLinkCount}件（403・429・5xx。実行環境が弾かれている可能性があるためリンク切れには数えません）`);
if (report.summary.indexErrorCount) {
  console.log(`索引の取得に失敗: ${report.summary.indexErrorCount}件（該当自治体の掲載漏れは検出できていません）`);
  const blind = report.municipalities.filter(item => item.candidateCount === 0 && item.indexErrors.length);
  if (blind.length) console.log(`::warning::索引を取得できず掲載漏れを検出できなかった自治体: ${blind.map(item => item.name).join("、")}`);
}

if (newUnlisted.length) {
  console.log("\n### 新たに見つかった未掲載制度");
  for (const entry of newUnlisted) console.log(`- ${entry.municipality}：${entry.title}\n  ${entry.url}`);
}
if (newDeadLinks.length) {
  console.log("\n### 新たなリンク切れ");
  for (const entry of newDeadLinks) console.log(`- [${entry.status}] ${entry.page} → ${entry.url}`);
}

if (checkOnly && (newUnlisted.length || newDeadLinks.length)) process.exit(1);
