import assert from "node:assert/strict";
import fs from "node:fs";

const read=file=>fs.readFileSync(file,"utf8");
const pages=Object.fromEntries(["index.html","affected.html","supporters.html","municipalities.html","reconstruction.html"].map(file=>[file,read(file)]));

for(const file of ["index.html","affected.html","supporters.html","municipalities.html"])assert.ok(pages[file].includes('href="reconstruction.html'),`${file} から暮らしの再建へ進めません`);
assert.match(pages["index.html"],/暮らしの再建[\s\S]*住まい・お金・手続き/,"トップの入口説明が不十分です");
assert.match(pages["affected.html"],/href="reconstruction\.html"[\s\S]*暮らしを立て直す情報を探したい/,"被災者向けの主要入口がありません");
assert.match(pages["supporters.html"],/相談を受けている方へ[\s\S]*制度対象を判定するものではありません/,"支援者向けの中立説明がありません");
assert.match(pages["municipalities.html"],/<noscript>[\s\S]*href="reconstruction\.html"/,"自治体別ページのJavaScript無効時導線がありません");

const app=read("app.js");
const reconstruction=read("reconstruction.js");
const officialNav=read("municipality-official-nav.js");
const organization=read("org-site.js");
const responsiveCss=read("org-site.css")+read("reconstruction.css")+read("municipality-nav.css");
const data=JSON.parse(read("public-data/reconstruction/municipality-official-navigation.json"));
for(const municipality of data.municipalities){
  assert.ok(app.includes(`"${municipality.municipalityName}":"${municipality.municipalityId}"`),`${municipality.municipalityName} の引き継ぎIDがありません`);
}
assert.match(app,/reconstruction\.html\?municipality=\$\{municipalityId\}/,"自治体別ページからmunicipalityを引き継げません");
assert.match(reconstruction,/municipalitySlugs=new Set/,"有効なmunicipality IDとの照合がありません");
assert.match(reconstruction,/currentMunicipality!=="municipality_uto"[\s\S]*uto-housing\.html/,"宇土市以外から宇土市住まいページを除外できません");
assert.match(officialNav,/municipalities\.html\?name=\$\{encodeURIComponent\(municipality\.municipalityName\)\}/,"選択自治体へ戻る導線がありません");
assert.ok(!/localStorage|sessionStorage|document\.cookie/.test(reconstruction),"暮らし整理ナビが入力を保存しています");
assert.match(organization,/org-nav-reconstruction[\s\S]*href="reconstruction\.html"/,"グローバルナビに暮らしの再建がありません");
assert.match(organization,/org-footer-sitemap[\s\S]*href="reconstruction\.html"/,"フッターに暮らしの再建がありません");
assert.match(responsiveCss,/@media\(max-width:800px\)[\s\S]*reconstruction-bridge/,"モバイル導線の1列化がありません");
for(const file of fs.readdirSync(".").filter(name=>/^reconstruction.*\.html$/.test(name)))assert.ok(!read(file).includes('href="contact.html"'),`${file}: よか隊ネットへの問い合わせを相談先にしてはいけません`);

const expectedDescription="令和8年熊本地震で被災された方やご家族、支援者向けに、住まい・お金・手続き・健康・家族・仕事・農業漁業・暮らしの困りごとから自治体等の公式情報を探せる生活再建ナビです。";
assert.ok(pages["reconstruction.html"].includes(`<meta name="description" content="${expectedDescription}">`),"SEO descriptionが本番導線の役割と一致しません");
assert.ok(pages["reconstruction.html"].includes(`<meta property="og:description" content="${expectedDescription}">`),"OGP descriptionが本番導線の役割と一致しません");

console.log("本番導線: トップ・被災者・支援者・21市町村・パラメータ・宇土市分岐・noscript・SEO/OGPを確認しました");
