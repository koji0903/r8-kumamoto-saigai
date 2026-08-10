import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = process.env.MUNICIPALITY_UPDATES_INPUT || path.join(root, "sources/official/municipalities/municipality-updates.json");
const masterPath = process.env.MUNICIPALITY_MASTER_INPUT || path.join(root, "data/reconstruction/municipalities.json");
const output = process.env.MUNICIPALITY_NAV_OUTPUT || path.join(root, "public-data/reconstruction/municipality-official-navigation.json");
export const categories = ["home","money","documents","health_care","family_education","work_business","agriculture_fishery","daily_life"];
export const keywords = {
  home: ["応急修理","緊急修理","仮設住宅","みなし仮設","賃貸型応急住宅","住宅","住まい","修理","解体","ブルーシート"],
  money: ["支援金","義援金","見舞金","減免","猶予","市税","保険料","生活費","貸付","給付","生活再建支援","手数料","納付"],
  documents: ["罹災証明","り災証明","被災証明","証明書","被害認定"],
  health_care: ["医療","介護","障がい","障害","高齢者","こころ","健康","福祉","保険証"],
  family_education: ["学校","保育","学用品","児童","子ども","こども","子育て","学習","学童"],
  work_business: ["雇用","休業","事業者","中小企業","店舗","事業所","事業継続"],
  agriculture_fishery: ["農業","農地","農機","漁業","漁船","水産","養殖","農林"],
  daily_life: ["給水","水道","ごみ","廃棄物","交通","入浴","ライフライン","断水","停電","ガス","下水道","し尿","シャワー"]
};
const legacy = {"住まい・証明":["home","documents"],"ごみ・生活":["daily_life"],"ライフライン":["daily_life"],"施設・学校":["family_education"],"支援・制度":["money"]};
const hostAllowed = (url, official) => { try { const a=new URL(url).hostname,b=new URL(official).hostname; return a===b||a.endsWith(`.${b}`)||b.endsWith(`.${a}`); } catch { return false; } };
const canonical = value => { try { const u=new URL(value); u.hash=""; return u.toString(); } catch { return value; } };
export function classify(update) {
  const haystack=`${update.title||""} ${update.url||""}`.normalize("NFKC");
  const scores=new Map(), evidence={};
  for (const category of categories) for (const word of keywords[category]) if (haystack.includes(word)) { scores.set(category,(scores.get(category)||0)+2); (evidence[category] ||= []).push(word); }
  for (const category of legacy[update.category]||[]) { scores.set(category,(scores.get(category)||0)+1); (evidence[category] ||= []).push(`既存カテゴリ:${update.category}`); }
  return [...scores].sort((a,b)=>b[1]-a[1]).map(([category,score])=>({category,confidence:score>=4?"high":score>=2?"medium":"low",evidence:evidence[category]}));
}
export function build(source, master) {
  const issues=[]; const byName=new Map(master.map(item=>[item.name,item]));
  const municipalities=(source.municipalities||[]).map(municipality=>{
    const meta=byName.get(municipality.name); if(!meta){issues.push({type:"municipality_mismatch",municipality:municipality.name});return null;}
    const seen=new Set(), updates=[];
    for(const update of municipality.updates||[]){
      if(!hostAllowed(update.url,meta.officialUrl)){issues.push({type:"non_official_url",municipality:meta.name,url:update.url});continue;}
      const key=canonical(update.url); if(seen.has(key)){issues.push({type:"duplicate_url",municipality:meta.name,url:update.url});continue;} seen.add(key);
      const classification=classify(update); if(!classification.length) continue;
      updates.push({originalTitle:update.title,displayTitle:update.title,url:update.url,publisher:meta.name,publishedAt:update.date?(update.time?`${update.date}T${update.time}:00+09:00`:update.date):null,updatedAt:null,retrievedAt:municipality.checkedAt||source.metadata?.retrievedAt||null,categories:classification.map(x=>x.category),classification,urlCheck:{state:"inherited_from_collector",checkedAt:municipality.checkedAt||null}});
    }
    return {municipalityId:meta.id,municipalityName:meta.name,officialUrl:meta.officialUrl,status:municipality.status||"unknown",checkedAt:municipality.checkedAt||null,retrievalIssues:municipality.errors||[],updates};
  }).filter(Boolean);
  for(const meta of master) if(!municipalities.some(x=>x.municipalityId===meta.id)){issues.push({type:"missing_municipality",municipality:meta.name});municipalities.push({municipalityId:meta.id,municipalityName:meta.name,officialUrl:meta.officialUrl,status:"not_collected",checkedAt:null,retrievalIssues:[],updates:[]});}
  return {schemaVersion:"1.0.0",generatedAt:new Date().toISOString(),source:{type:"existing_municipality_collector",path:"sources/official/municipalities/municipality-updates.json",retrievedAt:source.metadata?.retrievedAt||null},categories,municipalities,validation:{municipalityCount:municipalities.length,classifiedPageCount:municipalities.reduce((n,m)=>n+m.updates.length,0),issues}};
}
if (process.argv[1]===fileURLToPath(import.meta.url)) {
  const result=build(JSON.parse(fs.readFileSync(input,"utf8")),JSON.parse(fs.readFileSync(masterPath,"utf8")));
  fs.mkdirSync(path.dirname(output),{recursive:true}); fs.writeFileSync(output,`${JSON.stringify(result,null,2)}\n`);
  console.log(`自治体公式情報ナビ: ${result.municipalities.length}市町村 / ${result.validation.classifiedPageCount}件 / 除外・重複 ${result.validation.issues.length}件`);
}
