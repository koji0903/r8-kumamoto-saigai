import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const files=(await readdir(root)).filter(file=>file.endsWith(".html")&&file!=="404.html"&&!/^google/i.test(file)).sort();
const decode=value=>value.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x([0-9a-f]+);/gi,(_,code)=>String.fromCodePoint(parseInt(code,16))).replace(/&#([0-9]+);/g,(_,code)=>String.fromCodePoint(Number(code)));
const text=value=>decode(value.replace(/<script\b[\s\S]*?<\/script>/gi," ").replace(/<style\b[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim());
const match=(html,pattern)=>text(html.match(pattern)?.[1]||"");
const category=file=>/risai|reconstruction-documents|guide|terms/.test(file)?"証明・制度":/housing|reconstruction-official/.test(file)?"住まい":/money/.test(file)?"お金・支払い":/shelter|municipalit|uto-|hq-/.test(file)?"地域・被害情報":/volunteer|support/.test(file)?"支援する方":/timeline|meeting|official-response/.test(file)?"記録・資料":/about|join|contact|privacy|accessibility/.test(file)?"団体情報":"災害・支援情報";
const items=[];
for(const file of files){const html=await readFile(path.join(root,file),"utf8");const title=match(html,/<title>([\s\S]*?)<\/title>/i).split("｜")[0].trim();const description=decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]||"");const headings=[...html.matchAll(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/gi)].map(result=>text(result[1])).filter(Boolean);if(title)items.push({url:file,title,description,category:category(file),headings:[...new Set(headings)].slice(0,18)})}
const target=path.join(root,"public-data/site-search-index.json"),checkOnly=process.argv.includes("--check");
if(checkOnly){const current=JSON.parse(await readFile(target,"utf8"));if(JSON.stringify(current.items)!==JSON.stringify(items))throw new Error("サイト内検索インデックスが古いです。node tools/build-site-search.mjs を実行してください");console.log(`サイト内検索インデックス ${items.length}ページ 検査OK`)}
else{await mkdir(path.dirname(target),{recursive:true});await writeFile(target,`${JSON.stringify({version:1,generatedAt:new Date().toISOString(),count:items.length,items})}\n`);console.log(`サイト内検索インデックス ${items.length}ページを更新`)}
