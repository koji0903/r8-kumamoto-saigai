import assert from "node:assert/strict";
import fs from "node:fs";
import {build,categories,classify,validateOverrides} from "./build-municipality-reconstruction-nav.mjs";
import {validateNav} from "./validate-municipality-official-nav.mjs";
import {linkDecision,freshnessDecision} from "./reconstruction-operations-policy.mjs";

const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const nav=read("public-data/reconstruction/municipality-official-navigation.json"),master=read("data/reconstruction/municipalities.json"),search=read("public-data/reconstruction/official-search-index.json"),synonyms=read("config/reconstruction-search-synonyms.json");
const allowlist=read("config/municipality-official-domain-allowlist.json").domains;
assert.equal(nav.municipalities.length,21);assert.equal(categories.length,8);
for(const m of nav.municipalities){assert.ok(m.officialUrl,`${m.municipalityName}: fallback`);for(const category of categories)assert.ok(Array.isArray(m.updates.filter(x=>x.categories.includes(category))),`${m.municipalityName}/${category}`);}
const result=validateNav(nav,master,{inputCount:nav.validation.inputCount||nav.validation.classifiedPageCount});assert.equal(result.errors.length,0);
for(const m of nav.municipalities)for(const item of m.updates)for(const classification of item.classification.filter(x=>x.confidence==="low")){const indexed=search.items.find(x=>x.url===item.url);assert.ok(!indexed?.categories.includes(classification.category),`low非表示: ${classification.category}`);}
assert.equal(validateOverrides().length,0);
assert.ok(allowlist.every(item=>item.municipalityId&&item.domain&&item.purpose&&/^https:\/\//.test(item.evidenceUrl)&&/^\d{4}-\d{2}-\d{2}$/.test(item.confirmedAt)),"allowlist根拠");
assert.equal(classify({title:"被災住宅の障害物の除去",url:"https://example.jp"}).some(x=>x.category==="health_care"),false,"障害物≠障がい福祉");
assert.equal(classify({title:"中学校でシャワー・入浴支援",url:"https://example.jp"}).some(x=>x.category==="family_education"),false,"入浴会場≠教育情報");
assert.equal(classify({title:"中学校の休校と授業再開",url:"https://example.jp"}).some(x=>x.category==="family_education"),true,"学校運営は教育情報");
assert.equal(linkDecision({status:404,consecutiveFailures:1}).status,"WARNING");assert.equal(linkDecision({status:404,consecutiveFailures:2}).status,"ACTION_REQUIRED");assert.equal(linkDecision({status:503}).status,"WARNING");assert.equal(linkDecision({redirected:true}).status,"WARNING");assert.equal(freshnessDecision({informationPhase:"emergency",publishedAt:"2026-08-01",now:Date.parse("2026-08-12")}).state,"stale");
const broken=structuredClone(nav);broken.municipalities[0].officialUrl="";assert.ok(validateNav(broken,master,{inputCount:1}).errors.some(x=>x.code==="MISSING_FALLBACK"));
const zero=structuredClone(nav);zero.validation.classifiedPageCount=0;assert.ok(validateNav(zero,master,{inputCount:1}).errors.some(x=>x.code==="ALL_CATEGORIES_EMPTY"));
for(const term of ["家","住宅","修理","お金","税金","支援金","罹災証明","申請","健康","介護","薬","学校","子ども","保育","仕事","休業","事業","農業","漁業","農地","水道","ごみ","道路"]){const group=synonyms.groups.find(values=>values.includes(term))||[term];assert.ok(search.items.some(item=>group.some(word=>`${item.title} ${(item.keywords||[]).join(" ")}`.includes(word))),`検索代表語: ${term}`);}
assert.ok(search.items.some(x=>x.sourceType==="municipal_official"));assert.ok(search.items.some(x=>x.sourceType==="primary_official"));assert.ok(search.items.every(x=>x.sourceType!=="verified_program"||x.verificationStatus==="verified"),"verified制度との境界");
assert.match(fs.readFileSync("docs/reconstruction-information-quality-status.md","utf8"),/21市町村×8カテゴリ品質マトリクス/);
console.log("情報品質監査: 21×8・domain・confidence・過去災害・404/5xx/redirect・stale・fallback・検索・verified分離 OK");
