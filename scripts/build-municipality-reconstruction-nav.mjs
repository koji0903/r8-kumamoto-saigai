import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = process.env.MUNICIPALITY_UPDATES_INPUT || path.join(root, "sources/official/municipalities/municipality-updates.json");
const masterPath = process.env.MUNICIPALITY_MASTER_INPUT || path.join(root, "data/reconstruction/municipalities.json");
const output = process.env.MUNICIPALITY_NAV_OUTPUT || path.join(root, "public-data/reconstruction/municipality-official-navigation.json");
const overridePath=process.env.MUNICIPALITY_OVERRIDE_INPUT||path.join(root,"config/municipality-classification-overrides.json");
const manualOverrides=fs.existsSync(overridePath)?JSON.parse(fs.readFileSync(overridePath,"utf8")).overrides||[]:[];
export const categories = ["home","money","documents","health_care","family_education","work_business","agriculture_fishery","daily_life"];
export const keywords = {
  home: ["応急修理","緊急修理","仮設住宅","みなし仮設","賃貸型応急住宅","公営住宅","住宅","住まい","修理","解体","ブルーシート","被災住宅","宅地","建物","住宅相談"],
  money: ["支援金","義援金","見舞金","減免","免除","猶予","市税","国民健康保険","国保","介護保険料","年金","保険料","生活費","貸付","給付","生活再建支援","手数料","納付","住宅ローン","債務","借金"],
  documents: ["罹災証明","り災証明","被災証明","証明書","住家被害認定","被害認定","申請書","オンライン申請","手続き"],
  health_care: ["医療","診療","病院","介護","障がい","障害","高齢者","こころ","心のケア","メンタル","健康","福祉","保険証","薬","保健師"],
  family_education: ["学校","小学校","中学校","高校","保育","保育園","幼稚園","学用品","児童","子ども","こども","子育て","学習","学童","就学","給食","放課後","ひとり親"],
  work_business: ["仕事","雇用","就労","失業","休業","事業者","中小企業","店舗","事業所","事業継続","商工","融資","経営","事業再開","被災事業者"],
  agriculture_fishery: ["農業","農地","農機","農作物","漁業","漁船","漁港","水産","養殖","農林","畜産","家畜","海苔","ノリ養殖","漁協","農協"],
  daily_life: ["給水","水道","ごみ","災害ごみ","廃棄物","交通","道路","移動","バス","鉄道","入浴","風呂","ライフライン","断水","停電","電気","ガス","下水道","し尿","シャワー","物資","避難所"]
};
const pastDisasterTerms=["平成28年熊本地震","令和2年7月豪雨","令和2年豪雨","過去の台風"];
const legacy = {"住まい・証明":["home","documents"],"ごみ・生活":["daily_life"],"ライフライン":["daily_life"],"施設・学校":["family_education"],"支援・制度":["money"]};
const generalConsultationTerms=["被災者相談","総合相談","災害相談","生活相談","生活再建相談","支援相談","各種相談","被災者支援窓口"];
const hostAllowed = (url, official) => { try { const a=new URL(url).hostname,b=new URL(official).hostname; return a===b||a.endsWith(`.${b}`)||b.endsWith(`.${a}`); } catch { return false; } };
export const canonical = value => { try { const u=new URL(value); u.hash=""; u.protocol="https:"; [...u.searchParams.keys()].filter(key=>/^utm_/i.test(key)||["fbclid","gclid"].includes(key)).forEach(key=>u.searchParams.delete(key)); u.pathname=u.pathname!=="/"?u.pathname.replace(/\/$/,""):u.pathname; return u.toString(); } catch { return value; } };
export function classify(update) {
  const override=manualOverrides.find(item=>canonical(item.url)===canonical(update.url));
  if(override)return (override.categories||[]).map(category=>({category,confidence:"high",evidence:[`manual_override:${override.reason}`]}));
  const haystack=`${update.title||""} ${update.url||""}`.normalize("NFKC");
  const scores=new Map(), evidence={};
  for (const category of categories) for (const word of keywords[category]) if (haystack.includes(word)) { scores.set(category,(scores.get(category)||0)+2); (evidence[category] ||= []).push(word); }
  for (const category of legacy[update.category]||[]) { scores.set(category,(scores.get(category)||0)+1); (evidence[category] ||= []).push(`既存カテゴリ:${update.category}`); }
  return [...scores].sort((a,b)=>b[1]-a[1]).map(([category,score])=>({category,confidence:score>=4?"high":score>=2?"medium":"low",evidence:evidence[category]}));
}
export function validateOverrides(items=manualOverrides){
  const errors=[];
  for(const [index,item] of items.entries()){
    if(!item.url||!/^https:\/\//.test(item.url))errors.push(`overrides[${index}].url`);
    if(!Array.isArray(item.categories)||item.categories.some(value=>!categories.includes(value)))errors.push(`overrides[${index}].categories`);
    if(!String(item.reason||"").trim())errors.push(`overrides[${index}].reason`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(item.updatedAt||""))errors.push(`overrides[${index}].updatedAt`);
  }
  return errors;
}
const confidenceStats = municipalities => Object.fromEntries(categories.map(category=>{const items=municipalities.flatMap(m=>m.updates).map(u=>u.classification.find(c=>c.category===category)).filter(Boolean);return [category,{total:items.length,high:items.filter(x=>x.confidence==="high").length,medium:items.filter(x=>x.confidence==="medium").length,low:items.filter(x=>x.confidence==="low").length}];}));
export function build(source, master) {
  const issues=[]; const byName=new Map(master.map(item=>[item.name,item]));
  const municipalities=(source.municipalities||[]).map(municipality=>{
    const meta=byName.get(municipality.name); if(!meta){issues.push({type:"municipality_mismatch",municipality:municipality.name});return null;}
    const seen=new Set(), updates=[];
    for(const update of municipality.updates||[]){
      if(!String(update.title||"").trim()){issues.push({type:"missing_title",municipality:meta.name,url:update.url||null});continue;}
      if(pastDisasterTerms.some(term=>String(update.title).includes(term))){issues.push({type:"past_disaster_excluded",municipality:meta.name,url:update.url});continue;}
      if(!hostAllowed(update.url,meta.officialUrl)){issues.push({type:"non_official_url",municipality:meta.name,url:update.url});continue;}
      const key=canonical(update.url); if(seen.has(key)){issues.push({type:"duplicate_url",municipality:meta.name,url:update.url});continue;} seen.add(key);
      const direct=/令和8年熊本地震|令和８年熊本地震|災害|被災|地震/.test(update.title); const serviceTags=direct&&generalConsultationTerms.some(term=>update.title.includes(term))?["general_consultation"]:[]; const classification=classify(update); if(!classification.length&&!serviceTags.length) continue;
      const urgency=/給水|断水|停電|避難所|休校|運休|通行止/.test(update.title)?"emergency":"reconstruction"; const confidence=classification.some(x=>x.confidence==="high")||serviceTags.length?"high":classification.some(x=>x.confidence==="medium")?"medium":"low"; const publishedAt=update.date?(update.time?`${update.date}T${update.time}:00+09:00`:update.date):null; const ageDays=publishedAt?Math.max(0,(Date.now()-Date.parse(publishedAt))/86400000):365;
      updates.push({officialTitle:update.title,originalTitle:update.title,displayTitle:update.title,url:update.url,originalUrl:update.url,redirectHistory:[],officialDomain:new URL(meta.officialUrl).hostname,publisher:meta.name,publisherGroup:"municipality",sourceType:"municipal_official",serviceTags,status:"active",disasterRelevance:direct?"direct":"inherited_from_disaster_collector",disasterRelevanceEvidence:[direct?"disaster_keyword":"disaster_collection_source"],informationPhase:urgency,publishedAt,updatedAt:null,retrievedAt:municipality.checkedAt||source.metadata?.retrievedAt||null,categories:classification.map(x=>x.category),classificationConfidence:confidence,classification,displayPriority:(direct?30:10)+(confidence==="high"?20:confidence==="medium"?10:0)+Math.max(0,10-Math.floor(ageDays/7)),urlCheck:{state:"inherited_from_collector",checkedAt:municipality.checkedAt||null}});
    }
    return {municipalityId:meta.id,municipalityName:meta.name,officialUrl:meta.officialUrl,status:municipality.status||"unknown",checkedAt:municipality.checkedAt||null,retrievalIssues:municipality.errors||[],updates};
  }).filter(Boolean);
  for(const meta of master) if(!municipalities.some(x=>x.municipalityId===meta.id)){issues.push({type:"missing_municipality",municipality:meta.name});municipalities.push({municipalityId:meta.id,municipalityName:meta.name,officialUrl:meta.officialUrl,status:"not_collected",checkedAt:null,retrievalIssues:[],updates:[]});}
  const unclassifiedCount=(source.municipalities||[]).reduce((n,m)=>n+(m.updates||[]).length,0)-municipalities.reduce((n,m)=>n+m.updates.length,0);
  const generatedAt=source.metadata?.retrievedAt||[...(source.municipalities||[])].map(m=>m.checkedAt).filter(Boolean).sort().at(-1)||new Date().toISOString();
  return {schemaVersion:"1.1.0",generatedAt,source:{type:"existing_municipality_collector",path:"sources/official/municipalities/municipality-updates.json",retrievedAt:source.metadata?.retrievedAt||null},categories,categoryReport:confidenceStats(municipalities),municipalities,validation:{municipalityCount:municipalities.length,classifiedPageCount:municipalities.reduce((n,m)=>n+m.updates.length,0),unclassifiedCount,issues}};
}
if (process.argv[1]===fileURLToPath(import.meta.url)) {
  const overrideErrors=validateOverrides();
  if(overrideErrors.length)throw new Error(`manual overrideが不正です: ${overrideErrors.join(", ")}`);
  const result=build(JSON.parse(fs.readFileSync(input,"utf8")),JSON.parse(fs.readFileSync(masterPath,"utf8")));
  fs.mkdirSync(path.dirname(output),{recursive:true}); fs.writeFileSync(output,`${JSON.stringify(result,null,2)}\n`);
  console.log(`自治体公式情報ナビ: ${result.municipalities.length}市町村 / ${result.validation.classifiedPageCount}件 / 除外・重複 ${result.validation.issues.length}件`);
}
