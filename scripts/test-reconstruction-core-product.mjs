import assert from "node:assert/strict";
import fs from "node:fs";

const read=file=>fs.readFileSync(file,"utf8");
const top=read("reconstruction.html");
const logic=read("reconstruction.js");
const official=read("municipality-official-nav.js");
const definition=read("docs/reconstruction-core-product.md");

const hero=top.match(/<div class="rebuild-hero-actions"[\s\S]*?<\/div>/)?.[0]||"";
assert.equal((hero.match(/<(?:a|button)\b/g)||[]).length,3,"主要入口は3つに固定");
for(const label of ["困りごとから探す","何から始めればいいか分からない","公式情報を言葉から探す"]){
  assert.match(hero,new RegExp(label),`主要入口: ${label}`);
}
assert.equal((top.match(/class="need-card"/g)||[]).length,8,"最上位カテゴリは8つに固定");
for(const label of ["住まい","お金・支払い","証明・申請","健康・介護","子ども・家族","仕事・事業","農業・漁業","暮らし・移動"]){
  assert.match(top,new RegExp(`<b>${label}</b>`),`固定カテゴリ: ${label}`);
}

assert.match(top,/reconstruction-search\.html/,"公式情報検索");
assert.match(top,/id="organizer"/,"暮らし整理ナビ");
assert.match(logic,/withMunicipality/,"自治体引き継ぎ");
assert.match(official,/制度や支援がないという意味ではありません/,"0件fallbackの誤認防止");
assert.match(official,/municipalities\.html/,"公式fallback");
assert.match(logic,/data-reconstruction-action-nav/,"次に確認すること");
assert.match(top,/<details><summary>相談を受けている方へ<\/summary>/,"支援者向けは補助表示");
assert.doesNotMatch(hero,/確認メモ|支援者|相談受付/,"補助機能を主要入口へ昇格させない");

const reconstructionJs=fs.readdirSync(".").filter(file=>/^reconstruction.*\.js$/.test(file)).map(read).join("\n");
assert.doesNotMatch(reconstructionJs,/localStorage|sessionStorage|document\.cookie/,"個人選択を保存しない");
assert.doesNotMatch(reconstructionJs,/gtag\(|dataLayer/,"困りごとを計測しない");
assert.doesNotMatch(top+logic,/AI(?:診断|チャット)|おすすめ制度|ケース番号|相談履歴/,"対象外機能を追加しない");
assert.match(top,/<noscript>[\s\S]*市町村の公的窓口/,"JavaScript無効時fallback");

for(const heading of ["プロダクトの役割","CORE","固定する8カテゴリ","主要3入口","SUPPORTING","OPTIONAL","REMOVE候補","NOT_IN_SCOPE","情報品質原則","プライバシー・安全原則","新機能追加freeze","現在の最小完成形"]){
  assert.match(definition,new RegExp(heading),`Core Product Definition: ${heading}`);
}
assert.match(definition,/新機能追加を原則freeze/);
assert.match(definition,/実利用者の観察 → 問題の記録 → 最小修正 → 再テスト/);

console.log("Core Product Definition: 役割・CORE・8カテゴリ・3入口・fallback・privacy・freeze OK");
