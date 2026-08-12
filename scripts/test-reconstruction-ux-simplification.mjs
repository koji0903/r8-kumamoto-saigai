import assert from "node:assert/strict";
import fs from "node:fs";

const read=file=>fs.readFileSync(file,"utf8");
const top=read("reconstruction.html");
const js=fs.readdirSync(".").filter(file=>/^reconstruction.*\.js$/.test(file)).map(read).join("\n");
const categoryPages=["reconstruction-money.html","reconstruction-documents.html","reconstruction-health-care.html","reconstruction-family.html","reconstruction-work-business.html","reconstruction-agriculture-fishery.html","reconstruction-official.html"];

const hero=top.match(/<div class="rebuild-hero-actions"[\s\S]*?<\/div>/)?.[0]||"";
assert.equal((hero.match(/<(?:a|button)\b/g)||[]).length,3,"トップの主要入口は3つ");
for(const label of ["困りごとから探す","何から始めればいいか分からない","公式情報を言葉から探す"])assert.match(hero,new RegExp(label));
assert.doesNotMatch(hero,/相談したい|確認メモ|支援者/);

const cards=[...top.matchAll(/<button type="button" class="need-card"[\s\S]*?<\/button>/g)].map(match=>match[0]);
assert.equal(cards.length,8,"8カテゴリを表示");
for(const card of cards){
  assert.equal((card.match(/<b>/g)||[]).length,1,"カテゴリ名は1つ");
  assert.equal((card.match(/<small>/g)||[]).length,1,"補足は1行");
  assert.doesNotMatch(card,/<strong>/,"カテゴリカードに第3階層の説明を置かない");
}
assert.doesNotMatch(top,/rebuild-special|rebuild-related|rebuild-position/);
assert.match(top,/<details><summary>相談を受けている方へ<\/summary>/);
assert.match(top,/現在も情報を追加・確認しています/);
assert.match(top,/<noscript>[\s\S]*困りごとを選ぶ[\s\S]*市町村の公的窓口/);

for(const file of categoryPages){
  const html=read(file);
  assert.doesNotMatch(html,/準備中/,`${file}: 完成済み導線に古い準備中表示を残さない`);
  assert.match(html,/reconstruction\.html#organizer/,`${file}: 選び直す導線`);
}
assert.doesNotMatch(top+js,/相談メモ/,"利用者向け名称を確認メモへ統一");
assert.doesNotMatch(js,/localStorage|sessionStorage|document\.cookie|gtag\(|dataLayer/,"選択内容を保存・計測しない");
assert.match(read("reconstruction.css"),/@media\(max-width:800px\)/);
assert.match(read("reconstruction.css"),/:focus-visible/);
assert.match(read("reconstruction.css"),/@media print/);

console.log("UX簡素化: 主導線3・8カテゴリ簡潔化・補助機能降格・用語統一・noscript・privacy・mobile・keyboard・print OK");
