#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");

function editJson(tempRoot, file, updater) {
  const target = path.join(tempRoot, "data", "reconstruction", file);
  const json = JSON.parse(fs.readFileSync(target, "utf8"));
  updater(json);
  fs.writeFileSync(target, `${JSON.stringify(json, null, 2)}\n`);
}

function fixture() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "reconstruction-public-"));
  fs.mkdirSync(path.join(tempRoot, "data"), { recursive: true });
  fs.mkdirSync(path.join(tempRoot, "schemas"), { recursive: true });
  fs.mkdirSync(path.join(tempRoot, "scripts"), { recursive: true });
  fs.cpSync(path.join(root, "data", "reconstruction"), path.join(tempRoot, "data", "reconstruction"), { recursive: true });
  fs.cpSync(path.join(root, "schemas", "reconstruction"), path.join(tempRoot, "schemas", "reconstruction"), { recursive: true });
  fs.copyFileSync(path.join(root, "data", "report-data.js"), path.join(tempRoot, "data", "report-data.js"));
  for (const name of ["validate-reconstruction-data.js", "build-reconstruction-public-data.js"]) fs.copyFileSync(path.join(root, "scripts", name), path.join(tempRoot, "scripts", name));
  return tempRoot;
}

function build(tempRoot) {
  const output = path.join(tempRoot, "public-data", "reconstruction");
  const result = spawnSync(process.execPath, [path.join(tempRoot, "scripts", "build-reconstruction-public-data.js")], {
    encoding: "utf8",
    env: { ...process.env, RECONSTRUCTION_ROOT: tempRoot, RECONSTRUCTION_PUBLIC_OUTPUT: output }
  });
  if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
  return { output, text: fs.readdirSync(output).map(name => fs.readFileSync(path.join(output, name), "utf8")).join("\n") };
}

const tempRoot = fixture();
try {
  editJson(tempRoot, "programs.json", rows => {
    rows.find(row => row.id === "program_emergency_housing_repair").publicationStatus = "published";
  });
  editJson(tempRoot, "applications.json", rows => {
    rows.find(row => row.id === "application_r8_kumamoto_emergency_repair").publicationStatus = "published";
  });
  editJson(tempRoot, "application-periods.json", rows => {
    Object.assign(rows[0], { startsAt: "2026-08-10", deadlineAt: "2026-08-31", deadlineType: "fixed", status: "open", verificationStatus: "unverified" });
  });
  const built = build(tempRoot);
  const programs = JSON.parse(fs.readFileSync(path.join(built.output, "programs.json"), "utf8"));
  const municipalityViews = JSON.parse(fs.readFileSync(path.join(built.output, "municipalities.json"), "utf8"));
  const repair = programs.find(program => program.id === "program_emergency_housing_repair");
  if (!repair) throw new Error("公開候補にしたパイロット制度が生成されませんでした");
  const uto = municipalityViews.find(item => item.id === "municipality_uto");
  const yatsushiro = municipalityViews.find(item => item.id === "municipality_yatsushiro");
  if (uto?.contact !== null) throw new Error("pendingな宇土市窓口が確定表示されました");
  if (uto?.deadline !== null) throw new Error("unverifiedな期限が表示されました");
  if (!uto?.statusLabel.includes("確認中")) throw new Error("宇土市pendingが確認中表示になっていません");
  if (!yatsushiro?.statusLabel.includes("確認中")) throw new Error("municipality status未登録がconfirmed扱いされました");
  if (programs.some(program => program.id === "program_livelihood_reconstruction_support_grant")) throw new Error("draft制度が公開されました");
  for (const privateKey of ["reviewerName", "approverName", "verificationEvents", "internalNotes"]) if (built.text.includes(privateKey)) throw new Error(`内部情報が公開JSONに含まれています: ${privateKey}`);
  console.log("公開データ異常系OK: pending窓口・unverified期限・内部確認者・draft制度・未登録自治体状態");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

const withdrawnRoot = fixture();
try {
  editJson(withdrawnRoot, "programs.json", rows => {
    const program = rows.find(row => row.id === "program_emergency_housing_repair");
    program.publicationStatus = "withdrawn";
    program.verificationStatus = "withdrawn";
  });
  const built = build(withdrawnRoot);
  const programs = JSON.parse(fs.readFileSync(path.join(built.output, "programs.json"), "utf8"));
  if (programs.some(program => program.id === "program_emergency_housing_repair")) throw new Error("withdrawn制度が現行制度として公開されました");
  console.log("公開データ異常系OK: withdrawn制度を除外");
} finally {
  fs.rmSync(withdrawnRoot, { recursive: true, force: true });
}

console.log("生活再建公開データ生成テストOK（6条件）");

const needsReviewRoot = fixture();
try {
  editJson(needsReviewRoot, "programs.json", rows => {
    const program = rows.find(row => row.id === "program_emergency_housing_repair");
    program.publicationStatus = "published";
    program.verificationStatus = "needs_review";
  });
  editJson(needsReviewRoot, "applications.json", rows => {
    const application = rows.find(row => row.id === "application_r8_kumamoto_emergency_repair");
    application.publicationStatus = "published";
    application.verificationStatus = "needs_review";
  });
  const built = build(needsReviewRoot);
  const programs = JSON.parse(fs.readFileSync(path.join(built.output, "programs.json"), "utf8"));
  if (programs.some(program => program.id === "program_emergency_housing_repair")) throw new Error("needs_review制度が確定制度として公開されました");
  console.log("公開データ異常系OK: publicationStatusを維持したneeds_review制度を除外");
} finally {
  fs.rmSync(needsReviewRoot, { recursive: true, force: true });
}

const moneyRoot = fixture();
try {
  let targetId;
  editJson(moneyRoot, "programs.json", rows => {
    const program = rows.find(row => row.id === "program_emergency_housing_repair");
    program.publicationStatus = "published";
    program.categories = [...new Set([...program.categories, "money"])];
    targetId = program.id;
  });
  editJson(moneyRoot, "applications.json", rows => {
    rows.find(row => row.id === "application_r8_kumamoto_emergency_repair").publicationStatus = "published";
  });
  editJson(moneyRoot, "source-links.json", rows => {
    Object.assign(rows.find(row => row.id === "source_link_application_repair_implemented"), { verifiedBy: "fixture_reviewer", verifiedAt: "2026-08-11T09:00:00+09:00" });
  });
  const built = build(moneyRoot);
  const money = JSON.parse(fs.readFileSync(path.join(built.output, "money.json"), "utf8"));
  if (money.programs.length !== 1 || money.programs[0].id !== targetId) throw new Error("確認済みmoney制度fixtureが表示対象になりませんでした");
  if (money.programs[0].benefitType !== "in_kind_or_direct_payment") throw new Error("給付・貸付等の種別が公開データにありません");
  console.log("お金カテゴリfixture OK: 確認済み制度のみ表示・支援種別を保持");
} finally {
  fs.rmSync(moneyRoot, { recursive: true, force: true });
}
