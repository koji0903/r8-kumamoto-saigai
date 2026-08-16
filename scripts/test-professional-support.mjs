// 士業団体・専門家の支援を、国・県・市町村の公式情報と取り違えないことを守る。
//
// このサイトの価値は「公式かどうかが見分けられる」ことにある。弁護士会・行政書士会は
// 法律に基づく法人だが行政機関ではなく、ひさぽは弁護士個人の運営。混ぜて載せると
// 制度の発表と専門家の任意の支援を同じものとして読ませてしまう。
import assert from "node:assert/strict";
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../data/reconstruction/professional-support.json", import.meta.url), "utf8"));
const nav = fs.readFileSync(new URL("../municipality-official-nav.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../reconstruction-action-nav.css", import.meta.url), "utf8");
const searchIndex = JSON.parse(fs.readFileSync(new URL("../public-data/reconstruction/official-search-index.json", import.meta.url), "utf8"));
const officialNav = JSON.parse(fs.readFileSync(new URL("../public-data/reconstruction/municipality-official-navigation.json", import.meta.url), "utf8"));

assert.ok(data.items.length >= 3, "専門家支援の掲載が不足しています");
const categories = ["home", "money", "documents", "health_care", "family_education", "work_business", "agriculture_fishery", "daily_life"];

for (const item of data.items) {
  assert.ok(item.name && item.url && item.title, `${item.id}: 名称・URL・表題が必要です`);
  assert.match(item.url, /^https:\/\//, `${item.id}: httpsのURLが必要です`);
  assert.ok(data.providerTypes[item.providerType], `${item.id}: 運営主体の種別が未定義です（${item.providerType}）`);
  assert.ok((item.categories || []).length, `${item.id}: 表示する困りごとの指定が必要です`);
  for (const category of item.categories) assert.ok(categories.includes(category), `${item.id}: 未定義のカテゴリ ${category}`);
  // 電話番号を載せるなら受付時間か期間の記載も必要。かけて出ない番号を案内しない。
  for (const contact of item.contacts || []) {
    if (contact.phone) assert.ok(contact.hours || contact.period || contact.note, `${item.id}: ${contact.phone} に受付時間・期間・注記のいずれも書かれていません`);
  }
  // 個人運営は必ず運営者名と注意書きを添える
  if (item.providerType === "individual_expert") {
    assert.ok(item.operator, `${item.id}: 個人運営には運営者の明示が必要です`);
    assert.ok(item.caution, `${item.id}: 個人運営には注意書きが必要です`);
  }
}

// 公式情報の一覧・検索インデックスに混入していないこと
const professionalHosts = data.items.map(item => new URL(item.url).hostname);
for (const host of professionalHosts) {
  assert.ok(!JSON.stringify(searchIndex.items).includes(host), `検索インデックスに専門家サイト ${host} が混入しています`);
  const leaked = officialNav.municipalities.flatMap(m => m.updates || []).filter(u => (u.url || "").includes(host));
  assert.equal(leaked.length, 0, `自治体公式情報ナビに専門家サイト ${host} が混入しています`);
}

// 画面上で公式情報と分けて描かれること
assert.match(nav, /class="professional-support"/, "専門家支援は独立したブロックで描く必要があります");
assert.match(nav, /国・県・市町村の発表ではありません/, "公式情報ではない旨の明示が必要です");
assert.match(nav, /professionalHtml\(category\)/, "困りごとに応じて出し分ける必要があります");
assert.match(nav, /clean\(types\[item\.providerType\]/, "運営主体の種別を画面に出す必要があります");
assert.match(css, /\.professional-support\{/, "公式情報と区別できるスタイルが必要です");

console.log(`専門家による無料相談: ${data.items.length}件 / 種別明示・連絡先の受付情報・個人運営の注記・公式情報への非混入・独立表示 OK`);
