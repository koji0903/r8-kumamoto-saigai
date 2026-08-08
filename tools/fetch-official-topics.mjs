#!/usr/bin/env node
// トップページ用に、内閣府・熊本県・市町村の最新一次情報を整理する。
// 本文の要約は作らず、公式ページ上の表題・日時・URLのみを保存する。
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT=join(dirname(fileURLToPath(import.meta.url)),"..");
const OUT=join(ROOT,"sources/official/topics/latest-topics.json");
const GENERATED=join(ROOT,"data/generated/official-topics.js");
const UA="Mozilla/5.0 (compatible; r8-kumamoto-saigai/1.1; +https://github.com/koji0903/r8-kumamoto-saigai)";
const decode=value=>value.replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&#(d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g," ").trim();
const ascii=value=>value.replace(/[０-９：]/g,char=>"０１２３４５６７８９：".includes(char)?"0123456789:"["０１２３４５６７８９：".indexOf(char)]:char);
const isoDate=value=>{const m=ascii(value).match(/(?:令和\s*8年|2026年?)\s*(\d{1,2})月\s*(\d{1,2})日/u);return m?`2026-${m[1].padStart(2,"0")}-${m[2].padStart(2,"0")}`:null};
const isoDateWithCurrentYear=value=>isoDate(value)||(()=>{const m=ascii(value).match(/(\d{1,2})月\s*(\d{1,2})日/u);return m?`2026-${m[1].padStart(2,"0")}-${m[2].padStart(2,"0")}`:null})();
const clock=value=>{const m=ascii(value).match(/([0-2]?\d)[:時]\s*([0-5]\d)(?:分)?/u);return m?`${m[1].padStart(2,"0")}:${m[2]}`:null};
const absolute=(href,base)=>new URL(href,base).href;
async function html(url){const response=await fetch(url,{headers:{"user-agent":UA,accept:"text/html"},redirect:"follow",signal:AbortSignal.timeout(25000)});if(!response.ok)throw new Error(`${response.status} ${url}`);return response.text()}
function links(source,base){return [...source.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(match=>({url:absolute(match[1],base),title:decode(match[2])}));}

const checkedAt=new Date().toISOString();
const nationalHub="https://www.bousai.go.jp/updates/r8kumamoto_jishin/index.html";
const nationalStatus="https://www.bousai.go.jp/updates/r8kumamoto_jishin/status/index.html";
let national=[];
try{
  const [hub,status]=await Promise.all([html(nationalHub),html(nationalStatus)]);
  const damage=links(status,nationalStatus).filter(item=>/令和.?8年熊本地震に係る被害状況/u.test(ascii(item.title))).map(item=>({...item,date:isoDate(item.title),time:clock(item.title),kind:"被害状況"})).filter(item=>item.date).sort((a,b)=>`${b.date} ${b.time||""}`.localeCompare(`${a.date} ${a.time||""}`))[0];
  const activities=links(hub,nationalHub).filter(item=>/^令和.?8年.?\d+月/u.test(ascii(item.title))).map(item=>({...item,date:isoDate(item.title),time:null,kind:"国の対応"})).filter(item=>item.date).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
  national=[damage,...activities].filter(Boolean);
}catch(error){
  try{national=JSON.parse(await readFile(OUT,"utf8")).national||[]}catch{}
  if(!national.length)throw error;
}

const hq=JSON.parse(await readFile(join(ROOT,"sources/official/hq-index.json"),"utf8"));
const latestMeeting=hq.meetings.at(-1);
const damageDocument=latestMeeting.documents.find(document=>/人的被害等の状況/u.test(document.title));
const prefectureDate=isoDateWithCurrentYear(damageDocument?.title||"");
const prefectureTime=clock(damageDocument?.title||"");
const prefecture=[
  damageDocument&&{title:damageDocument.title,url:damageDocument.url,date:prefectureDate,time:prefectureTime,kind:"県公式集計"},
  {title:latestMeeting.heading,url:"https://www.pref.kumamoto.jp/soshiki/222/274487.html",date:prefectureDate,time:prefectureTime,kind:"災害対策本部"},
  {title:"令和8年熊本地震に関する情報",url:"https://www.pref.kumamoto.jp/soshiki/1/274517.html",date:prefectureDate,time:null,kind:"県の情報集約"}
].filter(Boolean);

const municipalityData=JSON.parse(await readFile(join(ROOT,"sources/official/municipalities/municipality-updates.json"),"utf8"));
const municipalities=municipalityData.municipalities.map(municipality=>{
  const eligible=municipality.updates.filter(update=>!/^P\d+(?:-|～)/u.test(update.title)&&!/(?:概要／県内の主な被害|町内の被災状況)/u.test(update.title));
  const update=[...eligible].sort((a,b)=>`${b.date} ${b.time||""}`.localeCompare(`${a.date} ${a.time||""}`))[0];
  return update?{...update,municipality:municipality.name}:null;
}).filter(Boolean).sort((a,b)=>`${b.date} ${b.time||""}`.localeCompare(`${a.date} ${a.time||""}`));

const dataset={metadata:{retrievedAt:checkedAt,note:"公式ページの表題・日時・URLを自動整理。緊急性や重要度の順位ではなく、新しい日時順。利用前にリンク先の更新時刻・対象地域・条件を再確認してください。"},national,prefecture,municipalities};
await mkdir(dirname(OUT),{recursive:true});
await writeFile(OUT,JSON.stringify(dataset,null,2)+"\n");
await writeFile(GENERATED,"// 生成物・直接編集しない。生成: node tools/fetch-official-topics.mjs\nwindow.OFFICIAL_TOPICS = "+JSON.stringify(dataset)+";\n");
console.log(`国 ${national.length}件 / 県 ${prefecture.length}件 / 市町村 ${municipalities.length}件`);
