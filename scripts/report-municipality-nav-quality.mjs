import fs from "node:fs";

const reportPath = "reports/municipality-official-navigation-quality.json";

if (!fs.existsSync(reportPath)) {
  console.log("自治体公式情報ナビの品質レポートはまだ生成されていません。");
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const rate = report.inputCount
  ? `${(report.unclassifiedCount / report.inputCount * 100).toFixed(1)}%`
  : "算出不可";
const lines = [
  "## 自治体公式情報ナビの品質",
  "",
  `- 入力: ${report.inputCount}件`,
  `- 分類: ${report.classifiedPageCount}件`,
  `- 未分類: ${report.unclassifiedCount}件（${rate}）`,
  `- 対象外: ${report.outOfScopeCount}件`,
  `- 除外: ${report.excludedCount}件`,
  ""
];

if (report.unclassifiedItems?.length) {
  lines.push("<details><summary>確認が必要な未分類ページ</summary>", "");
  for (const item of report.unclassifiedItems) {
    const title = String(item.title || "（表題なし）").replaceAll("\n", " ");
    lines.push(`- ${item.municipalityName}: [${title}](${item.url})`);
  }
  lines.push("", "</details>", "");
}

const summary = `${lines.join("\n")}\n`;
process.stdout.write(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}
