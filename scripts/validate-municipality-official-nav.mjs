import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonical, categories } from "./build-municipality-reconstruction-nav.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const allowedConfidence=new Set(["high","medium","low"]),allowedStatus=new Set(["active","inactive","candidate_for_removal"]);
const hostAllowed=(url,official)=>{try{const a=new URL(url).hostname,b=new URL(official).hostname;return a===b||a.endsWith(`.${b}`)||b.endsWith(`.${a}`)}catch{return false}};
const validDate=value=>value===null||value===undefined||(!Number.isNaN(Date.parse(value))&&/^\d{4}-\d{2}-\d{2}/.test(value));
export function validateNav(data,master,{inputCount=0,now=new Date()}={}){
  const errors=[],warnings=[]; const known=new Map(master.map(m=>[m.id,m]));
  if(inputCount===0)errors.push({code:"EMPTY_INPUT",message:"入力ページが0件です"});
  if(data.municipalities?.length!==21)errors.push({code:"MUNICIPALITY_COUNT",message:`自治体数が21ではありません: ${data.municipalities?.length||0}`});
  if(JSON.stringify(data.categories)!==JSON.stringify(categories))errors.push({code:"CATEGORY_SCHEMA",message:"8カテゴリ定義が一致しません"});
  if(inputCount>0&&!data.validation?.classifiedPageCount)errors.push({code:"ALL_CATEGORIES_EMPTY",message:"入力が存在するのに全カテゴリ0件です"});
  for(const category of categories)if(!data.categoryReport?.[category])errors.push({code:"MISSING_CATEGORY_REPORT",category});
  for(const municipality of data.municipalities||[]){const meta=known.get(municipality.municipalityId);if(!meta){errors.push({code:"UNKNOWN_MUNICIPALITY",municipalityId:municipality.municipalityId});continue}if(!municipality.officialUrl)errors.push({code:"MISSING_FALLBACK",municipalityId:municipality.municipalityId});
    const seen=new Set();for(const item of municipality.updates||[]){if(!item.url)errors.push({code:"MISSING_URL",municipalityId:municipality.municipalityId});else if(!hostAllowed(item.url,meta.officialUrl))errors.push({code:"NON_OFFICIAL_DOMAIN",url:item.url});const key=canonical(item.url);if(seen.has(key))errors.push({code:"DUPLICATE_URL",url:item.url});seen.add(key);if(!item.categories?.every(c=>categories.includes(c)))errors.push({code:"INVALID_CATEGORY",url:item.url});if(!allowedConfidence.has(item.classificationConfidence))errors.push({code:"INVALID_CONFIDENCE",url:item.url});if(!allowedStatus.has(item.status))errors.push({code:"INVALID_STATUS",url:item.url});for(const field of ["publishedAt","updatedAt","retrievedAt"])if(!validDate(item[field]))errors.push({code:"INVALID_DATE",field,url:item.url});if(/平成28年熊本地震|令和2年7月豪雨|令和2年豪雨/.test(item.officialTitle||""))errors.push({code:"PAST_DISASTER_INCLUDED",url:item.url});}
    if(municipality.retrievalIssues?.length){const issues=municipality.retrievalIssues.map(String);if(issues.some(x=>/\b404\b/.test(x)))warnings.push({code:"HTTP_404_CANDIDATE",municipalityId:municipality.municipalityId,message:"継続回数を確認後に表示除外を判断してください"});if(issues.some(x=>/\b(301|308)\b|redirect/i.test(x)))warnings.push({code:"REDIRECT_DETECTED",municipalityId:municipality.municipalityId});warnings.push({code:"RETRIEVAL_ISSUE",municipalityId:municipality.municipalityId,count:issues.length});}
    if(municipality.checkedAt&&now-Date.parse(municipality.checkedAt)>12*3600000)warnings.push({code:"STALE_RETRIEVAL",municipalityId:municipality.municipalityId,checkedAt:municipality.checkedAt});
  }
  return {ok:errors.length===0,errors,warnings};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const data=JSON.parse(fs.readFileSync(process.argv[2]||path.join(root,"public-data/reconstruction/municipality-official-navigation.json"),"utf8"));const master=JSON.parse(fs.readFileSync(path.join(root,"data/reconstruction/municipalities.json"),"utf8"));const result=validateNav(data,master,{inputCount:data.validation?.inputCount??data.validation?.classifiedPageCount??0});console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;}
