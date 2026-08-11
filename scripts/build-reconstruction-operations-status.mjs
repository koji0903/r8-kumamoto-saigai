import fs from "node:fs";
import { freshnessDecision, linkDecision, validatePhase } from "./reconstruction-operations-policy.mjs";
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const quality=read("reports/municipality-official-navigation-quality.json");
const phase=read("config/site-phase.json");
const sources=read("data/reconstruction/sources.json");
const baseline=read("reports/reconstruction-source-baseline.json");
const overrides=read("config/municipality-classification-overrides.json").overrides||[];
const previous=fs.existsSync("reports/reconstruction-operations-status.json")?read("reports/reconstruction-operations-status.json"):null;
const changed=sources.filter(source=>baseline[source.id]!==source.contentHash).map(source=>({id:source.id,title:source.title,url:source.url,previousHash:baseline[source.id]||null,currentHash:source.contentHash,verificationStatus:"needs_review"}));
const actions=[...(quality.errors||[]).map(detail=>({code:detail.code||"NAV_VALIDATION_ERROR",detail})),...changed.map(detail=>({code:"STRICT_SOURCE_CHANGED",detail}))];
const warnings=[...(quality.warnings||[])];
if(!validatePhase(phase.phase))actions.push({code:"INVALID_SITE_PHASE",detail:{phase:phase.phase}});
if(quality.unclassifiedCount>Math.max(20,quality.inputCount*.15))warnings.push({code:"UNCLASSIFIED_INCREASE",count:quality.unclassifiedCount});
if(overrides.length>20)warnings.push({code:"OVERRIDE_GROWTH",count:overrides.length});
const status=actions.length?"ACTION_REQUIRED":warnings.length?"WARNING":"OK";
const freshness={officialNavigation:freshnessDecision("emergency",quality.generatedAt),strictPrograms:freshnessDecision("reconstruction",sources.map(x=>x.checkedAt).filter(Boolean).sort().at(-1))};
const report={generatedAt:new Date().toISOString(),status,sitePhase:phase.phase,collection:{generatedAt:quality.generatedAt,inputCount:quality.inputCount,classifiedPageCount:quality.classifiedPageCount,displayCandidateCount:quality.displayCandidateCount,deltaFromPrevious:previous?{inputCount:quality.inputCount-(previous.collection?.inputCount||0),classifiedPageCount:quality.classifiedPageCount-(previous.collection?.classifiedPageCount||0),unclassifiedCount:quality.unclassifiedCount-(previous.quality?.unclassifiedCount||0)}:null},freshness,quality:{municipalityFallbackRate:`${Object.values(quality.municipalityReport).filter(x=>x.fallback).length}/21`,municipalityReport:quality.municipalityReport,categoryReport:quality.categoryReport,confidence:quality.confidence,unclassifiedCount:quality.unclassifiedCount,excludedCount:quality.excludedCount,overrideCount:overrides.length},actions,warnings,strictSources:{count:sources.length,changedCount:changed.length,needsReview:changed},policyExamples:{link404First:linkDecision({status:404,consecutiveFailures:1}),link404Repeated:linkDecision({status:404,consecutiveFailures:2}),redirect:linkDecision({redirected:true})}};
fs.writeFileSync("reports/reconstruction-operations-status.json",JSON.stringify(report,null,2)+"\n");
const actionLines=actions.length?actions.map(x=>`- ${x.code}${x.detail?.title?`: ${x.detail.title}`:""}`).join("\n"):"- なし";
const warningLines=warnings.length?warnings.map(x=>`- ${x.code||x.type||"WARNING"}`).join("\n"):"- なし";
const md=`# 暮らしの再建 運用ステータス

- 状態: **${status}**
- 生成: ${report.generatedAt}
- sitePhase: **${phase.phase}**
- 収集: ${quality.inputCount}件 / 分類 ${quality.classifiedPageCount}件 / 表示候補 ${quality.displayCandidateCount}件
- fallback: ${report.quality.municipalityFallbackRate}
- 未分類: ${quality.unclassifiedCount}件
- low confidence: ${quality.confidence.low}件
- manual override: ${overrides.length}件
- 鮮度（公式ナビ）: ${freshness.officialNavigation.state}
- 鮮度（厳密制度）: ${freshness.strictPrograms.state}
- 厳密制度source変更: ${changed.length}件（変更時は needs_review）
- ACTION_REQUIRED: ${actions.length}件
- WARNING: ${warnings.length}件

## ACTION_REQUIRED
${actionLines}

## WARNING
${warningLines}

> 件数差は自治体の支援量を示しません。公式発信量と収集状況の差です。
`;
fs.writeFileSync("docs/reconstruction-operations-status.md",md);
console.log(`運用ステータス: ${status} / action ${actions.length} / warning ${warnings.length}`);
