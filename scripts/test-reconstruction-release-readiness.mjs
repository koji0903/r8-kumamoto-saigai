import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const pages=["reconstruction.html","reconstruction-money.html","reconstruction-documents.html","reconstruction-health-care.html","reconstruction-family.html","reconstruction-work-business.html","reconstruction-agriculture-fishery.html","reconstruction-official.html","uto-housing.html"];
for(const file of pages){
  const html=fs.readFileSync(file,"utf8");
  assert.doesNotMatch(html,/href=["'](?:#|javascript:void\(0\))["']/i,`${file}: 未実装リンク`);
  for(const href of html.matchAll(/href=["']([^"'#?]+\.html)(?:[?#][^"']*)?["']/g))if(!/^https?:\/\//.test(href[1]))assert.ok(fs.existsSync(path.resolve(href[1])),`${file}: ${href[1]} が存在しません`);
  for(const text of ["<title>","name=\"description\"","rel=\"canonical\"","property=\"og:title\""])assert.ok(html.includes(text),`${file}: ${text}`);
}
const browserCode=["reconstruction.js","reconstruction-money.js","reconstruction-health-care.js","reconstruction-family.js","reconstruction-work-business.js","reconstruction-agriculture-fishery.js","municipality-official-nav.js"].map(file=>fs.readFileSync(file,"utf8")).join("\n");
assert.doesNotMatch(browserCode,/localStorage|sessionStorage|document\.cookie|gtag\(|dataLayer\.push/);
assert.doesNotMatch(fs.readFileSync("reconstruction-money.js","utf8"),/uto-housing\.html/);
const navCode=fs.readFileSync("municipality-official-nav.js","utf8");
assert.match(navCode,/category==="home"&&municipality\.municipalityId==="municipality_uto"/);
assert.match(navCode,/公式情報一覧を読み込めませんでした/);
const money=JSON.parse(fs.readFileSync("public-data/reconstruction/money.json","utf8"));
assert.equal(money.programs.length,0,"未承認制度カードは0件のまま公開する");
const publicFiles=fs.readdirSync("public-data/reconstruction");
assert.ok(publicFiles.every(name=>!/fixture|test-data|user-test/i.test(name)));
const relations=JSON.parse(fs.readFileSync("config/reconstruction-category-relations.json","utf8"));
assert.equal(Object.keys(relations.categories).length,8);
const nav=JSON.parse(fs.readFileSync("public-data/reconstruction/municipality-official-navigation.json","utf8"));
assert.equal(nav.municipalities.length,21);assert.ok(nav.municipalities.every(item=>item.municipalityId&&item.municipalityName&&item.officialUrl));
for(const municipality of nav.municipalities)for(const update of municipality.updates||[]){const host=new URL(update.url).hostname,official=new URL(municipality.officialUrl).hostname;assert.ok(host===official||host.endsWith(`.${official}`)||official.endsWith(`.${host}`),`${municipality.municipalityName}: 非公式URLが表示対象です`);}
const workflow=fs.readFileSync(".github/workflows/refresh-official-data.yml","utf8");
assert.ok(workflow.indexOf("validate-municipality-official-nav.mjs")<workflow.indexOf("git add"));
assert.match(workflow,/git diff --cached --quiet/);assert.doesNotMatch(workflow,/push[^\n]*(--force|-f\b)/);
console.log("リリース判定: 9ページ / 8カテゴリ / 21市町村 / 未承認制度0件 / privacy / fallback / fail-safe OK");
