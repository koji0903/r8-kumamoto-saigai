import fs from "node:fs";
if(!process.argv.includes("--accept-current"))throw new Error("基準更新には --accept-current が必要です（人手確認後のみ実行）");
const sources=JSON.parse(fs.readFileSync("data/reconstruction/sources.json","utf8"));
const baseline=Object.fromEntries(sources.map(source=>[source.id,source.contentHash]));
fs.writeFileSync("reports/reconstruction-source-baseline.json",JSON.stringify(baseline,null,2)+"\n");
console.log(`厳密制度source基準: ${sources.length}件を保存`);
