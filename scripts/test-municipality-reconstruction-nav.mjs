import assert from "node:assert/strict";
import fs from "node:fs";
import { build, classify, categories } from "./build-municipality-reconstruction-nav.mjs";
const source=JSON.parse(fs.readFileSync("sources/official/municipalities/municipality-updates.json","utf8"));
const master=JSON.parse(fs.readFileSync("data/reconstruction/municipalities.json","utf8"));
const result=build(source,master);
assert.equal(result.municipalities.length,21,"21市町村が必要");
assert.deepEqual(result.categories,categories);
for(const m of result.municipalities){assert.ok(m.municipalityId&&m.officialUrl);const seen=new Set();for(const u of m.updates){assert.ok(u.title===undefined&&u.originalTitle&&u.displayTitle);assert.equal(u.sourceType,"municipal_official");assert.equal(u.status,"active");assert.ok(u.categories.length);assert.equal(seen.has(u.url),false);seen.add(u.url);assert.ok(new URL(u.url).hostname.endsWith(new URL(m.officialUrl).hostname));}}
const multi=classify({title:"り災証明書の交付手数料を無料",url:"https://example.jp/x",category:"住まい・証明"}).map(x=>x.category);
assert.ok(multi.includes("documents")&&multi.includes("money")&&multi.includes("home"),"複数分類");
const fixture={metadata:{retrievedAt:"2026-08-11T00:00:00Z"},municipalities:[{name:master[0].name,officialUrl:master[0].officialUrl,checkedAt:"2026-08-11T00:00:00Z",status:"partial",errors:["404 Not Found"],updates:[{title:"市税の減免",url:`${master[0].officialUrl}support`,date:"2026-08-11",category:"支援・制度"},{title:"重複",url:`${master[0].officialUrl}support`,date:null,category:"その他"},{title:"外部",url:"https://example.com/support",date:null,category:"支援・制度"},{title:"",url:`${master[0].officialUrl}untitled`,date:null,category:"支援・制度"}]}]};
const tested=build(fixture,master);assert.equal(tested.municipalities[0].updates.length,1,"重複・外部URL・空タイトルを除外");assert.ok(tested.validation.issues.some(x=>x.type==="non_official_url"));assert.ok(tested.validation.issues.some(x=>x.type==="duplicate_url"));assert.ok(tested.validation.issues.some(x=>x.type==="missing_title"));assert.deepEqual(tested.municipalities[0].retrievalIssues,["404 Not Found"],"一時失敗を保持");assert.equal(tested.municipalities.length,21,"未収集自治体もfallbackを保持");
console.log("自治体公式情報ナビの分類・公式ドメイン・重複・取得失敗・fallbackを確認しました");
