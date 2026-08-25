import assert from "node:assert/strict";
import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const html=read("municipality-support-compare.html");
const css=read("municipality-support-compare.css");
const js=read("municipality-support-compare.js");
const reconstruction=read("reconstruction.html");
const data=JSON.parse(read("public-data/reconstruction/municipality-official-navigation.json"));

assert.match(html,/<title>[^<]*自治体間比較[^<]*<\/title>/);
assert.match(html,/<meta name="description" content="[^"]+">/);
assert.match(html,/制度の充実度や自治体の優劣を比べる表ではありません/);
assert.match(html,/制度や支援がないという意味ではありません/);
assert.match(html,/件数[^<]*<\/b><span>制度数ではなく/);
assert.equal(data.municipalities.length,21);
for(const category of ["home","money","documents","health_care","family_education","work_business","agriculture_fishery","daily_life"])assert.ok(js.includes(`${category}:`)||js.includes(`${category}:"`),`${category} がありません`);
for(const id of ["municipality_uki","municipality_uto","municipality_hikawa"])assert.ok(js.includes(id),`${id} の初期表示がありません`);
assert.match(js,/selected\.length>=4/);
assert.match(js,/item\.confidence!=="low"/);
assert.match(css,/@media\(max-width:680px\)/);
assert.match(css,/@media print/);
assert.match(reconstruction,/href="municipality-support-compare\.html"/);
assert.doesNotMatch(`${html}\n${js}`,/localStorage|sessionStorage|document\.cookie/);
console.log(`被災者支援制度 自治体間比較: ${data.municipalities.length}市町村 / 8分野 / 最大4自治体 OK`);
