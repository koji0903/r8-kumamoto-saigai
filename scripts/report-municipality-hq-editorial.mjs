import fs from "node:fs";
import vm from "node:vm";

const context={window:{}};
vm.runInNewContext(fs.readFileSync("data/generated/municipality-hq-data.js","utf8"),context);
const municipalities=context.window.MUNICIPALITY_HQ?.municipalities||[];
const rows=municipalities
  .filter(municipality=>municipality.editorial)
  .map(municipality=>({
    name:municipality.name,
    reviewed:municipality.editorial.reviewedThrough,
    published:municipality.editorial.publishedThrough,
    pending:Array.from(municipality.editorial.pendingMeetings||[])
  }));

for(const row of rows){
  if(row.pending.length){
    console.log(`::warning title=${row.name}の編集要約は確認待ち::公開は第${row.published}回、編集要約は第${row.reviewed}回まで。未要約: 第${row.pending.join("・")}回`);
  }else{
    console.log(`${row.name}: 公開資料・編集要約とも第${row.published}回まで確認済み`);
  }
}

if(process.env.GITHUB_STEP_SUMMARY){
  const lines=[
    "## 災害対策本部資料の編集要約状況",
    "",
    "新しい公式資料は先に公開し、人が確認する編集要約は確認後に追記します。未要約は収集失敗を意味しません。",
    "",
    "| 自治体 | 公開済み | 編集要約確認済み | 未要約 |",
    "| --- | ---: | ---: | --- |",
    ...rows.map(row=>`| ${row.name} | 第${row.published}回 | 第${row.reviewed}回 | ${row.pending.length?row.pending.map(number=>`第${number}回`).join("、"):"なし"} |`),
    ""
  ];
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join("\n"));
}
