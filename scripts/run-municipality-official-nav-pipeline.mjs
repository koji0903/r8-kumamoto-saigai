import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, classify, outOfScope, validateOutOfScopeRules, canonical } from "./build-municipality-reconstruction-nav.mjs";
import { validateNav } from "./validate-municipality-official-nav.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const input=process.env.MUNICIPALITY_UPDATES_INPUT||path.join(root,"sources/official/municipalities/municipality-updates.json"),masterPath=process.env.MUNICIPALITY_MASTER_INPUT||path.join(root,"data/reconstruction/municipalities.json"),output=process.env.MUNICIPALITY_NAV_OUTPUT||path.join(root,"public-data/reconstruction/municipality-official-navigation.json"),reportPath=process.env.MUNICIPALITY_NAV_REPORT_OUTPUT||path.join(root,"reports/municipality-official-navigation-quality.json");
const source=JSON.parse(fs.readFileSync(input,"utf8")),master=JSON.parse(fs.readFileSync(masterPath,"utf8")),inputCount=(source.municipalities||[]).reduce((n,m)=>n+(m.updates||[]).length,0),previous=fs.existsSync(output)?JSON.parse(fs.readFileSync(output,"utf8")):null,result=build(source,master);result.validation.inputCount=inputCount;
const validation=validateNav(result,master,{inputCount}),previousCount=previous?.validation?.classifiedPageCount??null,warnings=[...validation.warnings];if(previousCount&&result.validation.classifiedPageCount<previousCount*.5)warnings.push({code:"LARGE_DECREASE",previousCount,currentCount:result.validation.classifiedPageCount});
const excludedByType=Object.fromEntries([...new Set(result.validation.issues.map(x=>x.type))].map(type=>[type,result.validation.issues.filter(x=>x.type===type).length]));
// 分野を当てられなかった記事を2つに分ける。
//   outOfScope … 8分野に載せないと決めた種類（会議資料・広報紙・入口ページ等）
//   unclassified … それ以外＝本当の取りこぼし。人が1件ずつ見る対象
// 対象外の判定は分類できなかった記事にしか使わないので、支援が隠れることはない。
const ruleErrors=validateOutOfScopeRules();
if(ruleErrors.length){console.error(`対象外ルールが不正です: ${ruleErrors.join(", ")}`);process.exit(1)}
// 重複や非公式URLとして落とした記事をここでも数えると、合計が入力件数と
// 合わなくなる。どの記事も「分類・対象外・未分類・除外」のどれか1つに入る。
const alreadyExcluded=new Set(result.validation.issues.filter(x=>x.url).map(x=>canonical(x.url)));
const unclassified=[],outOfScopeItems=[];
for(const municipality of source.municipalities||[])for(const item of municipality.updates||[]){
  if(classify(item).length!==0)continue;
  if(item.url&&alreadyExcluded.has(canonical(item.url)))continue;
  const rule=outOfScope(item);
  const row={municipalityName:municipality.name,title:item.title,url:item.url};
  if(rule)outOfScopeItems.push({...row,ruleId:rule.id,ruleLabel:rule.label});else unclassified.push(row);
}
const outOfScopeByRule=Object.fromEntries([...new Set(outOfScopeItems.map(x=>x.ruleId))].map(id=>[id,outOfScopeItems.filter(x=>x.ruleId===id).length]));
const report={generatedAt:result.generatedAt,sourceFile:path.relative(root,input),outputFile:path.relative(root,output),inputCount,displayCandidateCount:result.municipalities.reduce((n,m)=>n+m.updates.filter(u=>u.classificationConfidence!=="low").length,0),classifiedPageCount:result.validation.classifiedPageCount,categoryReport:result.categoryReport,municipalityReport:Object.fromEntries(result.municipalities.map(m=>[m.municipalityId,{classified:m.updates.length,displayCandidates:m.updates.filter(u=>u.classificationConfidence!=="low").length,fallback:Boolean(m.officialUrl)}])),confidence:{high:result.municipalities.flatMap(m=>m.updates).filter(u=>u.classificationConfidence==="high").length,medium:result.municipalities.flatMap(m=>m.updates).filter(u=>u.classificationConfidence==="medium").length,low:result.municipalities.flatMap(m=>m.updates).filter(u=>u.classificationConfidence==="low").length},unclassifiedCount:unclassified.length,unclassifiedItems:unclassified,outOfScopeCount:outOfScopeItems.length,outOfScopeByRule,outOfScopeItems,excludedCount:result.validation.issues.length,excludedByType,warningCount:warnings.length,warnings,errors:validation.errors,previousClassifiedPageCount:previousCount??result.validation.classifiedPageCount};
fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,`${JSON.stringify(report,null,2)}\n`);if(!validation.ok){console.error(`生成を中止しました: ${validation.errors.map(e=>e.code).join(", ")}`);process.exit(1)}
const temporary=`${output}.tmp`;fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(temporary,`${JSON.stringify(result,null,2)}\n`);fs.renameSync(temporary,output);console.log(`自治体公式情報ナビ更新完了: 入力${inputCount}件 / 分類${result.validation.classifiedPageCount}件 / 表示候補${report.displayCandidateCount}件 / warning ${warnings.length}件`);console.log(`未分類 ${unclassified.length}件 / 対象外 ${outOfScopeItems.length}件（${Object.entries(outOfScopeByRule).map(([id,n])=>`${id}:${n}`).join(" ")}）`);
console.log(`品質レポート: ${path.relative(root,reportPath)}`);
const searchBuild=new URL("./build-reconstruction-search-index.mjs",import.meta.url);const {spawnSync}=await import("node:child_process");const searchResult=spawnSync(process.execPath,[fileURLToPath(searchBuild)],{cwd:root,encoding:"utf8"});process.stdout.write(searchResult.stdout||"");if(searchResult.status!==0){process.stderr.write(searchResult.stderr||"");process.exit(searchResult.status||1)}
