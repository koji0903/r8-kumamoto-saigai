import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {sourceDecision} from "./reconstruction-operations-policy.mjs";

const read=file=>fs.readFileSync(file,"utf8");
const code=read("reconstruction-action-nav.js"),css=read("reconstruction-action-nav.css"),loader=read("municipality-official-nav.js"),main=read("reconstruction.js");
const config=JSON.parse(read("config/reconstruction-action-navigation.json"));
assert.equal(Object.keys(config.categories).length,8,"8カテゴリの一般ナビ");
for(const [id,item] of Object.entries(config.categories)){assert.ok(item.title&&item.reason,`${id}: 行動名と理由`);assert.doesNotMatch(item.title,/申請してください|契約してください|今日中|今すぐ/)}

const context={window:{},location:{search:""},URLSearchParams,fetch:async()=>({ok:false}),document:{querySelectorAll:()=>[],querySelector:selector=>selector.includes("consultation-memo")?{}:null,createElement:()=>({}),head:{append(){}},addEventListener:()=>{}},console};
vm.createContext(context);vm.runInContext(code,context);
const filter=context.window.ReconstructionActionNav.safeProgramSteps;
const source={title:"県公式",url:"https://example.pref.kumamoto.jp/source"};
const base={title:"契約前に確認",description:"根拠に基づく確認",actionType:"check_before_contract",order:1,verificationStatus:"verified",officialSources:[source]};
const program=steps=>({categories:["home"],municipalities:[{id:"municipality_uto"}],nextSteps:steps});
assert.equal(filter([],"home","").length,0,"0件");
assert.equal(filter([program([base])],"home","").length,1,"1件");
assert.equal(filter([program([base,{...base,title:"写真",order:2},{...base,title:"期限",order:3}])],"home","").length,2,"一般ナビと合わせて最大3件");
assert.equal(filter([program([{...base,verificationStatus:"needs_review"}])],"home","").length,0,"needs_review除外");
assert.equal(filter([program([{...base,officialSources:[]}])],"home","").length,0,"sourceLinkなし異常を除外");
assert.equal(filter([program([base])],"home","municipality_yatsushiro").length,0,"別自治体の制度固有行動を除外");
assert.equal(sourceDecision({previousHash:"a",currentHash:"b",verificationStatus:"verified"}).verificationStatus,"needs_review","source変更で再確認へ戻す");

for(const token of ["action-card__warning","⚠","doNotDoYet","officialSources","verificationStatus === \"verified\"","slice(0,3)","ほかの困りごとも整理する","市町村を選ぶと","詳しい手順は、自治体等の公式情報"])assert.ok(code.includes(token),`${token} が必要`);
assert.match(loader,/reconstruction-action-nav\.js/);assert.match(loader,/reconstruction-action-nav\.css/);assert.match(main,/data-reconstruction-action-nav/);
assert.match(main,/<noscript>/);for(const file of ["reconstruction-money.html","reconstruction-documents.html","reconstruction-health-care.html","reconstruction-family.html","reconstruction-work-business.html","reconstruction-agriculture-fishery.html","reconstruction-official.html"])assert.match(read(file),/<noscript>/,`${file}: JS無効fallback`);
assert.match(css,/@media\(max-width:760px\)/);assert.match(css,/@media print/);assert.match(css,/:focus-visible/);assert.match(css,/min-height:44px/);
assert.doesNotMatch(code,/localStorage|sessionStorage|document\.cookie|gtag\(|dataLayer|analytics/i);
console.log("次に確認すること: 0/1/3件・高リスク・自治体あり/なし・sourceLink・needs_review・source変更・8カテゴリ・fallback・noscript・320px・keyboard・print・privacy OK");
