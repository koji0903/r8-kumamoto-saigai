#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");

function runCase(name, mutate, expectedMessage) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "reconstruction-validator-"));
  try {
    fs.mkdirSync(path.join(tempRoot, "data"), { recursive: true });
    fs.mkdirSync(path.join(tempRoot, "schemas"), { recursive: true });
    fs.mkdirSync(path.join(tempRoot, "scripts"), { recursive: true });
    fs.cpSync(path.join(root, "data", "reconstruction"), path.join(tempRoot, "data", "reconstruction"), { recursive: true });
    fs.cpSync(path.join(root, "schemas", "reconstruction"), path.join(tempRoot, "schemas", "reconstruction"), { recursive: true });
    fs.copyFileSync(path.join(root, "data", "report-data.js"), path.join(tempRoot, "data", "report-data.js"));
    fs.copyFileSync(path.join(root, "scripts", "validate-reconstruction-data.js"), path.join(tempRoot, "scripts", "validate-reconstruction-data.js"));
    mutate(tempRoot);
    const result = spawnSync(process.execPath, [path.join(tempRoot, "scripts", "validate-reconstruction-data.js")], { encoding: "utf8" });
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status === 0 || !output.includes(expectedMessage)) {
      throw new Error(`${name}: 想定したエラーを検出できませんでした\n${output}`);
    }
    console.log(`異常系OK: ${name}`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function editJson(tempRoot, file, updater) {
  const target = path.join(tempRoot, "data", "reconstruction", file);
  const json = JSON.parse(fs.readFileSync(target, "utf8"));
  updater(json);
  fs.writeFileSync(target, `${JSON.stringify(json, null, 2)}\n`);
}

runCase("承認履歴なしverified", tempRoot => {
  editJson(tempRoot, "applications.json", rows => {
    rows.find(row => row.id === "application_r8_kumamoto_emergency_repair").verificationStatus = "verified";
  });
}, "approved記録がありません");

runCase("municipal scopeなのに自治体なし", tempRoot => {
  editJson(tempRoot, "required-documents.json", rows => {
    Object.assign(rows[0], { scopeLevel: "municipal", documentContext: "municipality_specific", scopeMunicipalityIds: [] });
  });
}, "municipal scopeなのに対象自治体がありません");

runCase("撤回sourceをverifiedの根拠にする", tempRoot => {
  editJson(tempRoot, "applications.json", rows => {
    rows.find(row => row.id === "application_r8_kumamoto_emergency_repair").verificationStatus = "verified";
  });
  editJson(tempRoot, "sources.json", rows => {
    rows.find(row => row.id === "source_kumamoto_emergency_housing_repair_user_guide").status = "withdrawn";
  });
  editJson(tempRoot, "verification-events.json", rows => {
    rows.push(
      { id: "verification_event_test_human_review", entityType: "application", entityId: "application_r8_kumamoto_emergency_repair", action: "reviewed", reviewerId: "reviewer_test", reviewerName: "確認担当", approverId: null, approverName: null, reviewedAt: "2026-08-09T08:00:00+09:00", sourceIds: ["source_kumamoto_emergency_housing_repair_user_guide"], sourceLinkIds: ["source_link_application_repair_eligibility"], result: "confirmed", notes: "異常系テスト" },
      { id: "verification_event_test_approval", entityType: "application", entityId: "application_r8_kumamoto_emergency_repair", action: "approved", reviewerId: "reviewer_test", reviewerName: "確認担当", approverId: "approver_test", approverName: "承認担当", reviewedAt: "2026-08-09T08:10:00+09:00", sourceIds: ["source_kumamoto_emergency_housing_repair_user_guide"], sourceLinkIds: ["source_link_application_repair_eligibility"], result: "confirmed", notes: "異常系テスト" }
    );
  });
}, "撤回・旧版sourceをverifiedの根拠にしています");

runCase("受付pendingなのにconfirmed表示相当", tempRoot => {
  editJson(tempRoot, "municipality-application-statuses.json", rows => {
    rows[0].receptionStatus = "confirmed";
  });
}, "受付confirmedを表示可能にするにはverificationStatus=verifiedが必要です");

console.log("生活再建データ検証の異常系テストOK（4件）");
