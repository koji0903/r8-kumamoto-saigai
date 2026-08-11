import assert from "node:assert/strict";
import fs from "node:fs";
const pages=["reconstruction.html","reconstruction-money.html","reconstruction-documents.html","reconstruction-health-care.html","reconstruction-family.html","reconstruction-work-business.html","reconstruction-agriculture-fishery.html","reconstruction-official.html"];
const strip=html=>html.replace(/<script[\s\S]*?<\/script>/g,"").replace(/<style[\s\S]*?<\/style>/g,"").replace(/<[^>]+>/g," ").replace(/&[^;]+;/g," ").replace(/\s+/g,"");
for(const file of pages){
  const html=fs.readFileSync(file,"utf8");
  assert.match(html,/<h1[ >]/,`${file}: h1`);
  assert.match(html,/<noscript>/,`${file}: JavaScript無効時の導線`);
  const first=(html.match(/<main[\s\S]*?<section[\s\S]*?<\/section>/)||[html])[0];
  assert.ok(strip(first).length<=230,`${file}: ファーストビュー文字量 ${strip(first).length}`);
  assert.doesNotMatch(html,/>\s*(こちら|詳しく見る|詳細|もっと見る)\s*</,`${file}: 曖昧CTA`);
  assert.doesNotMatch(html,/利用できる可能性/,`${file}: 半確定の対象表現`);
}
const scripts=["reconstruction.js","reconstruction-money.js","municipality-official-nav.js","reconstruction-category-relations.js"].map(file=>fs.readFileSync(file,"utf8")).join("\n");
assert.doesNotMatch(scripts,/利用できる可能性/);
assert.match(scripts,/制度や支援がないという意味ではありません/);
const css=["reconstruction.css","reconstruction-money.css","reconstruction-documents.css","reconstruction-health-care.css","municipality-nav.css","reconstruction-readability.css"].map(file=>fs.readFileSync(file,"utf8")).join("\n");
assert.doesNotMatch(css,/font-size:(12|13)px/);
assert.match(css,/min-height:(48|5[0-9]|[6-9][0-9])px/);
for(const width of [320,375,390,430])assert.ok(css.includes("max-width:560px")||css.includes("max-width: 560px"),`${width}px mobile rule`);
assert.match(css,/@media print/);
console.log("コンテンツUX: 8ページ / 短い入口 / 明確CTA / 文字サイズ / タップ / noscript / print OK");
