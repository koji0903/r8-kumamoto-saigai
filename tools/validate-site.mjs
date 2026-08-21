#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";

const fix = process.argv.includes("--fix");
const unknown = process.argv.slice(2).filter(argument => argument !== "--fix");
if (unknown.length) {
  console.error(`不明な引数です: ${unknown.join(", ")}`);
  process.exit(2);
}

const run = (command, args, label) => {
  console.log(`\n## ${label}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) {
    console.error(`${command} を実行できません: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
};

if (fix) run("node", ["tools/build-seo.mjs"], "SEO・サイト内検索の生成");
run("node", ["tools/build-seo.mjs", "--check"], "SEO生成物");
run("node", ["tools/check-data.mjs"], "HTML・災害データ");
run("node", ["scripts/build-site-phase.mjs", "--check"], "サイト局面");

// test-* を自動発見し、テスト追加時のWorkflow登録漏れを防ぐ。
const tests = readdirSync("scripts")
  .filter(file => /^test-.*\.(?:mjs|js)$/.test(file))
  .sort();
for (const test of tests) run("node", [`scripts/${test}`], test);

const syntaxTargets = [
  "app.js",
  "reconstruction-health-care.js",
  "reconstruction-family.js",
  "reconstruction-work-business.js",
  "reconstruction-agriculture-fishery.js",
  "reconstruction-category-relations.js",
  "reconstruction-action-nav.js",
  "reconstruction-consultation-memo.js",
  "reconstruction-search.js",
  "scripts/build-reconstruction-search-index.mjs",
  "scripts/build-reconstruction-operations-status.mjs",
  "scripts/monitor-reconstruction-sources.mjs",
  "scripts/reconstruction-source-change.mjs",
  "scripts/reconstruction-contact-document-policy.mjs",
  "scripts/reconstruction-eligibility-policy.mjs",
  "scripts/build-reconstruction-contact-document-status.mjs",
  "scripts/build-reconstruction-eligibility-status.mjs",
  "scripts/reconstruction-amount-benefit-policy.mjs",
  "scripts/build-reconstruction-amount-benefit-status.mjs",
  "tools/fetch-hq.mjs",
  "tools/fetch-municipality-hq.mjs",
  "tools/fetch-municipality-updates.mjs",
  "tools/fetch-official-topics.mjs",
  "tools/fetch-volunteer-centers.mjs",
  "tools/build-shelters.mjs"
];
for (const target of syntaxTargets) run("node", ["--check", target], `構文: ${target}`);

run("git", ["diff", "--check"], "空白エラー");
console.log(`\nサイト全体の検査に成功しました（${tests.length}テスト）。`);
