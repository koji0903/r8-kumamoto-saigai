#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FIELD_LABELS, findConditionConflicts } from "./reconstruction-eligibility-policy.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,"data/reconstruction",name),"utf8"));
const applications=read("applications.json"), statuses=read("municipality-application-statuses.json"), links=new Map(read("source-links.json").map(x=>[x.id,x])), sources=new Map(read("sources.json").map(x=>[x.id,x]));
const conditions=[...applications.flatMap(a=>(a.eligibilityConditions||[]).map(c=>({owner:a.id,...c}))),...statuses.flatMap(s=>(s.localEligibilityConditions||[]).map(c=>({owner:s.id,...c})))];
const rows=conditions.map(c=>{const sourceTitles=(c.sourceLinkIds||[]).map(id=>sources.get(links.get(id)?.sourceId)?.title).filter(Boolean).join(" / ")||"未登録";return `| ${c.owner} | ${FIELD_LABELS[c.field]||c.field} | ${c.scope} | ${c.certainty} | ${c.verificationStatus} | ${c.checkedAt||"未確認"} | ${sourceTitles} |`;});
const conflicts=findConditionConflicts(conditions);
const text=`# 対象条件データ品質ステータス\n\n> 自動生成ファイルです。本サイトは対象可否を自動判定しません。最終確認は各自治体・制度窓口の公式案内で行ってください。\n\n- 条件: ${conditions.length}件\n- verifiedかつconfirmed: ${conditions.filter(c=>c.verificationStatus==="verified"&&c.certainty==="confirmed").length}件\n- pending/unknown/conflict: ${conditions.filter(c=>c.certainty!=="confirmed").length}件\n- 検出した矛盾: ${conflicts.length}件\n\n## 条件一覧\n\n| 所有entity | 条件軸 | scope | 確度 | 確認状態 | 確認日時 | 一次資料 |\n|---|---|---|---|---|---|---|\n${rows.join("\n")||"| - | - | - | - | - | - | - |"}\n\n## 矛盾・要確認\n\n${conflicts.map(x=>`- ${x}`).join("\n")||"- 自動検出された矛盾はありません。"}\n\n## 公開ルール\n\n- verified・confirmed・有効な一次資料・確認日時が揃う条件だけを候補とします。\n- 市町村固有条件は、その市町村の表示にだけ使用します。\n- 表示は主な条件2〜4件に絞り、対象可否の判定には使用しません。\n`;
fs.writeFileSync(path.join(root,"docs/reconstruction-eligibility-status.md"),text);
console.log(`対象条件ステータスを生成しました: ${conditions.length}件`);
