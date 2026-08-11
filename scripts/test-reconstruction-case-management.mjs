import assert from "node:assert/strict";
import fs from "node:fs";
const relations=JSON.parse(fs.readFileSync("config/reconstruction-category-relations.json","utf8")).categories;
const categories=["home","money","documents","health_care","family_education","work_business","agriculture_fishery","daily_life"];
assert.deepEqual(Object.keys(relations).sort(),categories.sort());
for(const [category,items] of Object.entries(relations)){
  assert.ok(items.length>=2&&items.length<=4,`${category}: 関連カテゴリは2〜4件`);
  assert.equal(new Set(items.map(x=>x.category)).size,items.length);
  assert.ok(items.every(x=>categories.includes(x.category)&&x.category!==category&&x.prompt.endsWith("？")));
}
const required={home:["money","documents","daily_life"],money:["work_business","home","documents"],health_care:["daily_life","money"],family_education:["money","health_care","daily_life"],work_business:["money","documents"],agriculture_fishery:["work_business","money","daily_life"],daily_life:["health_care","family_education"]};
for(const [from,to] of Object.entries(required))for(const target of to)assert.ok(relations[from].some(x=>x.category===target),`${from} → ${target}`);
const cases={A:["home","money","health_care","daily_life"],B:["home","family_education","money","work_business","documents"],C:["work_business","money","home","documents"],D:["agriculture_fishery","money","daily_life","documents"],E:["agriculture_fishery","work_business","money","daily_life"]};
for(const [name,list] of Object.entries(cases))for(let i=0;i<list.length-1;i++)assert.ok(relations[list[i]].some(x=>list.includes(x.category))||relations[list[i+1]].some(x=>list.includes(x.category)),`CASE ${name} 横断導線`);
const money=fs.readFileSync("reconstruction-money.html","utf8");
assert.doesNotMatch(money,/href="uto-housing\.html"/);
const official=fs.readFileSync("reconstruction-official.html","utf8");
assert.match(official,/data-category-relations/);assert.match(official,/reconstruction-category-relations\.js/);
const organizer=fs.readFileSync("reconstruction.js","utf8");
assert.match(organizer,/表示順に優先順位の意味はありません/);
assert.match(fs.readFileSync("reconstruction.html","utf8"),/選んだ内容は保存・送信されません/);
assert.doesNotMatch(organizer,/gtag\(|dataLayer|localStorage|sessionStorage/);
assert.match(organizer,/data-print-organizer/);
const nav=fs.readFileSync("municipality-official-nav.js","utf8");
assert.match(nav,/category==="home"&&municipality\.municipalityId==="municipality_uto"/);
assert.match(nav,/制度や支援がないという意味ではありません/);
console.log("複合困りごと監査: 6ケース / 8カテゴリ / 自治体分離 / fallback / privacy / print OK");
