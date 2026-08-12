import assert from "node:assert/strict";
import fs from "node:fs";

const read=file=>fs.readFileSync(file,"utf8");
const top=read("index.html"),rebuild=read("reconstruction.html"),logic=read("reconstruction.js");
const official=read("municipality-official-nav.js"),housing=read("uto-housing.html");
const memo=read("reconstruction-consultation-memo.js"),supporters=read("supporters.html");
const data=JSON.parse(read("public-data/reconstruction/municipality-official-navigation.json"));
const municipality=id=>data.municipalities.find(item=>item.municipalityId===id);
const visibleFor=(record,category)=>(record.updates||[]).filter(update=>(update.categories||[]).includes(category)&&(update.classification||[]).some(item=>item.category===category&&item.confidence!=="low"));

// 共通入口
assert.match(top,/href="reconstruction\.html"[\s\S]*暮らしの再建/);
const hero=rebuild.match(/<div class="rebuild-hero-actions"[\s\S]*?<\/div>/)?.[0]||"";
assert.equal((hero.match(/<(?:a|button)\b/g)||[]).length,3);
for(const label of ["困りごとから探す","何から始めればいいか分からない","公式情報を言葉から探す"])assert.match(hero,new RegExp(label));
assert.equal((rebuild.match(/class="need-card"/g)||[]).length,8);

// SCENARIO A: 宇土市・住まい・断水/給水・健康
const uto=municipality("municipality_uto");
assert.ok(uto,"宇土市データ");
assert.match(logic,/currentMunicipality!=="municipality_uto"[\s\S]*uto-housing\.html/);
assert.match(housing,/reconstruction-official\.html\?category=daily_life&amp;municipality=municipality_uto/);
assert.match(housing,/reconstruction-health-care\.html\?municipality=municipality_uto/);
assert.match(housing,/reconstruction\.html\?municipality=municipality_uto#needs/);
const utoDaily=visibleFor(uto,"daily_life");
assert.ok(utoDaily.some(item=>/給水|断水|水道/.test(item.displayTitle)),"宇土市の給水・水道情報");
assert.ok(utoDaily.filter(item=>/給水|断水|水道/.test(item.displayTitle)).every(item=>item.publishedAt),"時点表示用の日付");
assert.doesNotMatch(official,/現在も有効|現在有効/);
const healthLogic=read("reconstruction-health-care.js");
assert.match(healthLogic,/心理状態の入力や診断は行わず/);
assert.doesNotMatch(healthLogic,/緊急度(?:を)?判定|診断結果/);

// SCENARIO B: 宇城市・複数課題
const uki=municipality("municipality_uki");
for(const category of ["home","money","family_education","work_business","documents"])assert.ok(visibleFor(uki,category).length,`宇城市 ${category} 公式情報`);
for(const topic of ["housing","money","family","work","paperwork"])assert.match(logic,new RegExp(`${topic}:\\{`));
assert.match(logic,/気になるところから、一つずつ確認できます/);
assert.doesNotMatch(logic,/診断結果|あなたにおすすめ/);
assert.match(logic,/withMunicipality/);
assert.match(logic,/id==="housing"&&currentMunicipality!=="municipality_uto"/);
assert.match(logic,/data-reset-organizer/);
for(const file of ["reconstruction-money.html","reconstruction-documents.html","reconstruction-family.html","reconstruction-work-business.html"])assert.match(read(file),/reconstruction\.html#organizer/,`${file}: 暮らし整理ナビへ戻る`);
assert.match(memo,/診断結果、申請書、行政の公式書類ではありません/);
assert.match(memo,/選んだ困りごと/);

// SCENARIO C: 支援者
assert.match(supporters,/相談を受けている方へ[\s\S]*制度対象を判定するものではありません/);
assert.match(rebuild,/<details><summary>相談を受けている方へ<\/summary>/);
assert.doesNotMatch(rebuild,/name="(?:income|medical|debt|family-detail)"/);
assert.match(logic,/所得、病気、借入、家族関係などを最初から聞くための聞き取り票ではありません/);
assert.match(logic,/総合相談の公式情報を見る/);
assert.doesNotMatch(logic,/contact\.html|対象外です|対象ではありません/);

// 安全性・fallback・プライバシー
assert.match(official,/制度や支援がないという意味ではありません/);
assert.match(official,/公式情報一覧を読み込めませんでした/);
assert.match(official,/municipalities\.html/);
const publicHtml=[rebuild,"reconstruction-official.html","reconstruction-money.html","reconstruction-documents.html","reconstruction-health-care.html","reconstruction-family.html","reconstruction-work-business.html","reconstruction-agriculture-fishery.html"].map(item=>item.endsWith?.(".html")?read(item):item).join("\n");
assert.doesNotMatch(publicHtml,/verificationStatus|freshnessStatus|needs_review|confidence/);
for(const file of fs.readdirSync(".").filter(name=>/^reconstruction.*\.js$/.test(name))){
  const source=read(file);assert.doesNotMatch(source,/localStorage|sessionStorage|document\.cookie/,`${file}: storage`);
  assert.doesNotMatch(source,/gtag\(|dataLayer/,`${file}: analytics`);
}
assert.match(rebuild,/<noscript>[\s\S]*困りごとを選ぶ[\s\S]*市町村の公的窓口/);
assert.match(read("reconstruction-official.html"),/<noscript>[\s\S]*市町村の公式情報一覧[\s\S]*暮らしの8カテゴリ/);
assert.match(read("reconstruction-consultation-memo.css"),/@page/);
assert.match(read("reconstruction-consultation-memo.css"),/@media print/);

console.log("最終シナリオ監査: A宇土市 / B宇城市5課題 / C支援者 / 公式情報 / fallback / privacy / noscript / print OK");
