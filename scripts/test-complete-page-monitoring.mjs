#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import { buildMonitoringCoverage, REPORT_PATH } from "./page-monitoring-coverage.mjs";

console.log("全公開ページ監視カバー率テスト開始");

const coverage = buildMonitoringCoverage();
assert.ok(coverage.pages.length >= 60, "公開ページ数が想定より少なすぎます");
assert.equal(coverage.inventory.length, coverage.pages.length, "公開ページの監視台帳に漏れがあります");
assert.ok(coverage.inventory.every(item => item.channels.includes("all-page-official-link-watch")), "全ページ監視に含まれない公開ページがあります");
assert.ok(coverage.inventory.filter(item => item.officialLinkCount > 0).length >= 50, "公式リンクを含むページ数が想定より少なすぎます");

for (const page of coverage.priorityPages) assert.ok(coverage.pages.includes(page), `優先監視の掲載ページが存在しません: ${page}`);
for (const page of coverage.livingPages) assert.ok(coverage.pages.includes(page), `制度索引監視の掲載ページが存在しません: ${page}`);

for (const required of [
  "hikawa-interest-subsidy.html",
  "kumamoto-saishuppatsu.html",
  "uki-einou-saikai.html",
  "yatsushiro-well-repair.html"
]) {
  assert.ok(coverage.priorityPages.has(required), `期限・申請条件の重要ページを優先監視してください: ${required}`);
}

const workflow = fs.readFileSync(".github/workflows/monitor-all-page-official-links.yml", "utf8");
for (const required of [
  'cron: "35 20 * * 0"', "workflow_dispatch:", "dry_run:", "contents: write", "issues: write",
  "concurrency:", "cancel-in-progress: false", "scripts/monitor-all-page-official-links.mjs --check",
  "reports/all-page-official-link-watch.json", "GITHUB_STEP_SUMMARY", "gh issue create",
  "git fetch origin main", "git rebase origin/main", "git push origin HEAD:main", "inputs.dry_run != true"
]) assert.ok(workflow.includes(required), `全ページ監視Workflowに ${required} が必要です`);
assert.equal(/push[^\n]*--force|push[^\n]*\s-f\b/.test(workflow), false, "force pushは禁止です");

const allPageMonitor = fs.readFileSync("scripts/monitor-all-page-official-links.mjs", "utf8");
assert.ok(allPageMonitor.includes("result.status === 403") && allPageMonitor.includes("result.status === 429") && allPageMonitor.includes("result.status >= 500"),
  "403・429・5xxを判定不能として記録してください");
assert.ok(allPageMonitor.includes("const repeatableFailure = result.status === 0;"),
  "WAF・レート制限・5xxをリンク切れに昇格せず、通信不能だけを連続失敗として扱ってください");

const officialTopicsFetcher = fs.readFileSync("tools/fetch-official-topics.mjs", "utf8");
assert.ok(officialTopicsFetcher.includes("isPublished") && officialTopicsFetcher.includes("response.status!==404&&response.status!==410"),
  "トップページの公式トピックスでも削除済み記事を掲載前に除外してください");

if (fs.existsSync(REPORT_PATH)) {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
  assert.equal(report.schemaVersion, "1.0.0", "全ページ監視レポートのschemaVersionが不正です");
  assert.equal(report.summary.publicPageCount, coverage.pages.length, "レポートの公開ページ数が現在の構成と一致しません");
  assert.deepEqual(report.pages.map(item => item.page), coverage.pages, "レポートの公開ページ台帳が現在の構成と一致しません");
}

console.log(`全公開ページ監視カバー率テスト OK（${coverage.pages.length}ページ・公式URL ${coverage.urlPages.size}件）`);
