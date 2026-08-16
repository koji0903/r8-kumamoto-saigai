// 「暮らしの再建」で選んだ自治体が、次のページへ確実に引き継がれることを守る。
//
// 自治体を選び直させるのは、被災直後の利用者にとって余計な負担になる。
// また、特定自治体だけの案内ページが他自治体の利用者に出ると誤誘導になる。
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../reconstruction.js", import.meta.url), "utf8");

// 1) 8つの困りごとすべてに、自治体別の公式情報ナビへの入口があること
const topicIds = ["housing", "money", "paperwork", "health", "family", "work", "primary", "daily"];
for (const id of topicIds) {
  assert.match(source, new RegExp(`${id}\\s*:\\s*\\{label:`), `困りごと ${id} の定義が見つかりません`);
}
assert.match(source, /officialNavHref\(id\)/, "困りごと詳細から自治体公式情報ナビへの導線が必要です");
assert.match(source, /category=\$\{topicCategories\[id\]\}/, "ナビへは困りごとに対応するカテゴリを渡す必要があります");

// 2) 自治体の引き継ぎ。reconstruction-*.html は ?municipality=、
//    municipalities.html と municipality-updates.html は ?name= を読む。
assert.match(source, /\^municipalities\\\.html\$/, "municipalities.html への自治体引き継ぎが必要です");
assert.match(source, /\^municipality-updates\\\.html\$/, "municipality-updates.html への自治体引き継ぎが必要です");
assert.match(source, /municipalityNames\[currentMunicipality\.replace\(\/\^municipality_\/,""\)\]/,
  "currentMunicipality は municipality_ 接頭辞つきのため、名前引きでは外す必要があります");

// 3) 宇土市専用ページは宇土市を選んだときだけ出す
assert.match(source, /id==="housing"&&currentMunicipality!=="municipality_uto"\?topic\.links\.filter\(link=>link\.href!=="uto-housing\.html"\)/,
  "宇土市専用の住まいページを他自治体の利用者に出してはいけません");

// 4) 公式情報が0件でも行き止まりにしない。ナビ側に自治体公式サイトへの退避先があること
const nav = JSON.parse(fs.readFileSync(new URL("../public-data/reconstruction/municipality-official-navigation.json", import.meta.url), "utf8"));
assert.equal(nav.municipalities.length, 21, "21市町村すべてを扱う必要があります");
for (const municipality of nav.municipalities) {
  assert.ok(municipality.officialUrl && /^https?:\/\//.test(municipality.officialUrl),
    `${municipality.municipalityName}: 公式サイトの退避先URLがありません`);
}

// 5) カテゴリ定義はナビ側と困りごと側で一致していること
const expected = ["home", "money", "documents", "health_care", "family_education", "work_business", "agriculture_fishery", "daily_life"];
assert.deepEqual(nav.categories, expected, "ナビのカテゴリ構成が困りごとの対応表と一致しません");
for (const category of expected) {
  assert.match(source, new RegExp(`"${category}"`), `困りごと対応表に ${category} がありません`);
}

console.log(`暮らしの再建 自治体引き継ぎ: 8困りごと / 21市町村 / カテゴリ整合 / 宇土市専用ページの分離 / 退避先 OK`);
