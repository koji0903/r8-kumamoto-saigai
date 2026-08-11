import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {canonical,classify} from "./build-municipality-reconstruction-nav.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const navPath=process.env.RECONSTRUCTION_NAV_INPUT||path.join(root,"public-data/reconstruction/municipality-official-navigation.json");
const sourcesPath=path.join(root,"data/reconstruction/sources.json"),organizationsPath=path.join(root,"data/reconstruction/organizations.json"),programsPath=path.join(root,"public-data/reconstruction/programs.json");
const output=process.env.RECONSTRUCTION_SEARCH_OUTPUT||path.join(root,"public-data/reconstruction/official-search-index.json");
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const nav=read(navPath),sources=read(sourcesPath),organizations=read(organizationsPath),programs=fs.existsSync(programsPath)?read(programsPath):[];
const organizationById=new Map(organizations.map(item=>[item.id,item]));
const categoryLabels={home:"住まい",money:"お金・支払い",documents:"証明・申請",health_care:"健康・介護",family_education:"子ども・家族",work_business:"仕事・事業",agriculture_fishery:"農業・漁業",daily_life:"暮らし・移動"};
const records=[];
for(const municipality of nav.municipalities||[])for(const update of municipality.updates||[]){
  if(update.status!=="active"||update.urlCheck?.state==="source_unreachable"||!/^https:\/\//.test(update.url||"")||update.classificationConfidence==="low")continue;
  const categories=(update.categories||[]).filter(category=>categoryLabels[category]);if(!categories.length)continue;
  records.push({id:`municipality:${municipality.municipalityId}:${records.length}`,title:update.displayTitle||update.officialTitle,organizationName:municipality.municipalityName,governmentLevel:"市町村",municipalityId:municipality.municipalityId,municipalityName:municipality.municipalityName,categories,keywords:[...new Set([...(update.classification||[]).flatMap(item=>item.evidence||[]),...categories.map(category=>categoryLabels[category])])],summary:`${municipality.municipalityName}が発表した、今回の災害に関係する公式情報です。`,publishedAt:update.publishedAt,updatedAt:update.updatedAt,retrievedAt:update.retrievedAt,url:update.url,sourceType:"municipal_official",publicationStatus:"published",verificationStatus:"published",freshnessStatus:update.status==="active"?"current":"archive"});
}
for(const source of sources){
  const organization=organizationById.get(source.organizationId);if(!organization||organization.publicationStatus!=="published"||!['national_government','prefecture'].includes(organization.organizationType)||source.officiality!=="primary_official"||source.status!=="active"||!/^https:\/\//.test(source.url||""))continue;
  const classifications=classify({title:source.title,url:source.url}).filter(item=>item.confidence!=="low"),categories=[...new Set(classifications.map(item=>item.category))];
  records.push({id:`source:${source.id}`,title:source.title,organizationName:organization.name,governmentLevel:organization.organizationType==="prefecture"?"熊本県":"国",municipalityId:null,municipalityName:null,categories,keywords:[...new Set(classifications.flatMap(item=>item.evidence||[]))],summary:`${organization.name}が公開している一次情報です。`,publishedAt:source.publishedAt,updatedAt:source.revisedAt,retrievedAt:source.retrievedAt,url:source.url,sourceType:"primary_official",publicationStatus:"published",verificationStatus:"published",freshnessStatus:"current"});
}
for(const program of programs){if(program.availability?.state!=="confirmed")continue;for(const source of program.officialSources||[])if(/^https:\/\//.test(source.url||""))records.push({id:`program:${program.id}:${source.url}`,title:program.title,organizationName:source.organization,governmentLevel:program.governmentLevel==="national"?"国":program.governmentLevel==="prefecture"?"熊本県":"公的機関",municipalityId:null,municipalityName:null,categories:program.categories||[],keywords:[program.officialName,program.benefitType].filter(Boolean),summary:program.summary,publishedAt:null,updatedAt:null,retrievedAt:null,url:source.url,sourceType:"verified_program",publicationStatus:"published",verificationStatus:"verified",freshnessStatus:"current"});}
const merged=new Map();for(const record of records){const key=canonical(record.url);const previous=merged.get(key);if(!previous){merged.set(key,record);continue}previous.categories=[...new Set([...previous.categories,...record.categories])];previous.keywords=[...new Set([...previous.keywords,...record.keywords])];}
const items=[...merged.values()].map((item,index)=>({...item,id:`official-search-${index+1}`}));
if(items.some(item=>!item.title||!item.organizationName||!/^https:\/\//.test(item.url)||!['published','verified'].includes(item.verificationStatus)||/fixture/i.test(JSON.stringify(item))))throw new Error("公式情報検索インデックスへ非公開・不正データが混入しました");
const result={schemaVersion:"1.0.0",generatedAt:nav.generatedAt||new Date().toISOString(),sourceFiles:["public-data/reconstruction/municipality-official-navigation.json","data/reconstruction/sources.json","data/reconstruction/organizations.json","public-data/reconstruction/programs.json"],policy:{scope:"災害・生活再建に関する確認可能な公式情報",excluded:["一般Web","SNS","報道","火の国会議","民間支援","draft","unverified","needs_review","source_unreachable","fixture"]},count:items.length,items};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,`${JSON.stringify(result,null,2)}\n`);console.log(`公式情報検索インデックス: ${items.length}件`);
