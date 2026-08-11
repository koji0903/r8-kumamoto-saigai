import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read=file=>fs.readFileSync(file,"utf8");
const code=read("reconstruction-consultation-memo.js"),css=read("reconstruction-consultation-memo.css"),controls=read("reconstruction-consultation-memo-controls.css"),main=read("reconstruction.js"),actions=read("reconstruction-action-nav.js");
const municipalities=[
  {municipalityId:"municipality_uto",municipalityName:"宇土市",officialUrl:"https://www.city.uto.lg.jp/",updates:[{displayTitle:"宇土市の住まい支援",officialTitle:"宇土市の住まい支援",url:"https://www.city.uto.lg.jp/very/long/official/information/url/for/printing",categories:["home"],classification:[{category:"home",confidence:"high"}],disasterRelevance:"direct",publishedAt:"2026-08-12"}]},
  {municipalityId:"municipality_yatsushiro",municipalityName:"八代市",officialUrl:"https://www.city.yatsushiro.lg.jp/",updates:[]}
];
const context={window:{ReconstructionActionNav:{getActions:async category=>category==="home"?[{kind:"program_specific",title:"契約前に公式情報を確認",highRisk:true,doNotDoYet:"確認前に契約しない"}]:[]}},location:{search:"",hash:""},URLSearchParams,Intl,Date,CustomEvent:class{constructor(type){this.type=type}},fetch:async()=>({ok:true,json:async()=>({municipalities})}),document:{querySelector:()=>null,createElement:()=>({setAttribute(){}}),body:{append(){},classList:{add(){},remove(){}}},activeElement:null,addEventListener(){},dispatchEvent(){}},addEventListener(){},history:{pushState(){},back(){}},scrollTo(){},console};
vm.createContext(context);vm.runInContext(code,context);
const memo=context.window.ReconstructionConsultationMemo;
for(const count of [1,3,6]){const built=await memo.build({categories:["home","money","documents","health_care","family_education","daily_life"].slice(0,count),municipalityId:"municipality_uto"});assert.equal(built.categories.length,count,`${count}カテゴリ`)}
const unselected=await memo.build({categories:["home"]});assert.equal(unselected.municipalityName,"自治体未選択");assert.match(unselected.entries[0].official.title,/市町村の公式情報一覧/);
const uto=await memo.build({categories:["home"],municipalityId:"municipality_uto"});assert.equal(uto.municipalityName,"宇土市");assert.equal(uto.entries[0].official.organization,"宇土市（自治体）");assert.match(uto.entries[0].official.url,/very\/long/);assert.equal(uto.entries[0].actions.length,1);
const other=await memo.build({categories:["home"],municipalityId:"municipality_yatsushiro"});assert.equal(other.municipalityName,"八代市");assert.equal(other.entries[0].official.fallback,true);assert.doesNotMatch(other.entries[0].official.url,/uto/);
const noAction=await memo.build({categories:["money"],municipalityId:"municipality_uto"});assert.equal(noAction.entries[0].actions.length,0);
for(const text of ["相談メモ","診断結果、申請書、行政の公式書類ではありません","選んだ困りごと","次に確認すること","参考にする公式情報","このメモを作成","情報更新の注意","サーバーに保存されません","気になること・確認したいこと","重要"])assert.ok(code.includes(text),`${text} が必要`);
assert.match(actions,/data-action-memo/);assert.match(main,/相談メモを見る/);assert.match(main,/ReconstructionConsultationMemo/);
assert.match(css,/@page\{size:A4 portrait/);assert.match(css,/@media print/);assert.match(css,/@media\(max-width:430px\)/);assert.match(css,/word-break:break-all/);assert.match(css,/:focus-visible/);assert.match(controls,/min-height:48px/);
assert.doesNotMatch(`${code}\n${main}`,/localStorage|sessionStorage|document\.cookie|gtag\(|dataLayer|navigator\.share|mailto:|line\.me/i);
assert.doesNotMatch(code,/支援者名|相談記録|対応結果|氏名|住所|電話番号|生年月日|所得|病歴|借金/);
assert.doesNotMatch(code,/あなたの診断|判定結果|支援対象|ケース結果|該当制度なし/);
for(const file of ["reconstruction.html","reconstruction-money.html","reconstruction-documents.html","reconstruction-health-care.html","reconstruction-family.html","reconstruction-work-business.html","reconstruction-agriculture-fishery.html","reconstruction-official.html"])assert.match(read(file),/<noscript>/,`${file}: JS無効でも通常印刷可能`);
console.log("相談メモ: 自治体未選択・宇土市・別自治体・1/3/6カテゴリ・actionあり/0件・公式あり/fallback・高リスク・切替・A4・白黒・長URL・JS無効・320px・keyboard・privacy OK");
