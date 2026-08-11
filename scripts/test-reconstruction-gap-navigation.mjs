import assert from "node:assert/strict";
import fs from "node:fs";
import {build} from "./build-municipality-reconstruction-nav.mjs";

const read=file=>fs.readFileSync(file,"utf8");
const html=read("reconstruction.html"),code=read("reconstruction.js"),css=read("reconstruction.css"),official=read("reconstruction-official.html"),nav=read("municipality-official-nav.js");
const relations=JSON.parse(read("config/reconstruction-category-relations.json"));
const groups=relations.confirmationGroups;
for(const [a,b] of [["home","money"],["health_care","daily_life"],["work_business","money"],["family_education","money"],["agriculture_fishery","work_business"]])assert.ok(groups.some(group=>group.categories.includes(a)&&group.categories.includes(b)),`${a}+${b} の確認まとまり`);
assert.match(relations.meaning,/対象判定/);assert.match(relations.meaning,/優先順位/);

for(const text of ["気になるところから、一つずつ確認できます","全部を一度に見る必要はありません","表示順に優先順位の意味はありません","一緒に確認しやすいまとまり","自動追加することはありません","うまく説明できなくても大丈夫です","文章を入力する必要はありません","総合相談の公式情報を見る","最初から聞くための聞き取り票ではありません"])assert.ok(code.includes(text),`${text} が必要`);
for(const count of [1,3,6])assert.ok(count<=Object.keys(relations.categories).length,`${count}カテゴリ選択を扱える`);
assert.match(code,/if\(!selected\.length\)/,"0カテゴリの安全導線");
assert.match(code,/selected\.includes\("other"\)/,"その他の安全導線");
assert.doesNotMatch(code,/localStorage|sessionStorage|document\.cookie|gtag\(|dataLayer|risk.?score|score\s*[=:]/i);
assert.match(html,/<noscript>/);assert.match(official,/<noscript>/);assert.match(code,/data-print-organizer/);assert.match(css,/@media print/);assert.match(css,/@media\(max-width:430px\)/);assert.match(css,/:focus-visible/);
assert.match(nav,/view\"\)===\"general_consultation/);assert.match(nav,/serviceTags\?\.includes\("general_consultation"\)/);assert.match(nav,/slice\(0,5\)/,"公式カードを初期表示しすぎない");assert.match(nav,/制度や支援がないという意味ではありません/);

const master=JSON.parse(read("data/reconstruction/municipalities.json"));
const selected=master.filter(item=>["宇土市","熊本市","八代市"].includes(item.name));
const source={metadata:{retrievedAt:"2026-08-12T00:00:00Z"},municipalities:selected.map(item=>({name:item.name,officialUrl:item.officialUrl,checkedAt:"2026-08-12T00:00:00Z",updates:item.name==="宇土市"?[{title:"令和8年熊本地震 被災者総合相談窓口",url:`${item.officialUrl}r8-consultation`,date:"2026-08-12",category:"その他"}]:[{title:"市からのお知らせ",url:`${item.officialUrl}notice`,date:"2026-08-12",category:"その他"}]}))};
const built=build(source,master);const uto=built.municipalities.find(item=>item.municipalityName==="宇土市"),others=built.municipalities.filter(item=>["熊本市","八代市"].includes(item.municipalityName));
assert.equal(uto.updates.filter(item=>item.serviceTags.includes("general_consultation")).length,1,"宇土市の総合相談あり");assert.ok(others.every(item=>item.updates.every(update=>!update.serviceTags.includes("general_consultation"))),"別自治体2件は総合相談なしfallback");assert.equal(built.municipalities.length,21,"未選択・未収集自治体も公式トップfallback");
console.log("制度の谷間ナビ: 0/1/3/6カテゴリ・その他・総合相談あり/なし・3自治体・privacy・noscript・mobile・keyboard・print OK");
