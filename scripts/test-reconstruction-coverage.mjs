// 「暮らしの再建」が、拾えるはずの支援を拾えているかを守る。
//
// このサイトは制度そのものを掲載せず、市町村の公式ページへ案内する作りなので、
// 分類器が語を1つも当てられなかった記事は画面のどこにも出てこない。実際に、
// ホテル等避難（宿泊施設提供事業）、セーフティネット保証4号、応急危険度判定、
// インスタントハウス、生活必需品の支給、被災者向けの検診・予防接種、乗合
// タクシー、臨時窓口といった支援が丸ごと落ちていた。落ちたことに気づく仕組みが
// 無かったのが原因なので、代表例を名指しで固定する。
import assert from "node:assert/strict";
import fs from "node:fs";
import { classify, categories, validateOutOfScopeRules } from "./build-municipality-reconstruction-nav.mjs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const nav = JSON.parse(read("public-data/reconstruction/municipality-official-navigation.json"));
const hubs = JSON.parse(read("config/municipality-disaster-hubs.json"));
const navCode = read("municipality-official-nav.js");
const relationsCode = read("reconstruction-category-relations.js");

// ---- 落ちてはいけない支援 ---------------------------------------------------
// 表題は実際に市町村が出しているもの。分野を1つでも当てられればよい。
const MUST_CLASSIFY = [
  ["【令和8年熊本地震】ホテル等への避難をご希望の方へ", "home"],
  ["被災されてホテル等への避難を希望される方への宿泊施設提供事業を実施します", "home"],
  ["被災建築物応急危険度判定について", "home"],
  ["令和8年熊本地震に伴う応急仮設建築物の取扱いについて", "home"],
  ["インスタントハウスの設置希望者募集について", "home"],
  ["セーフティネット保証4号（令和八年熊本地震）について", "work_business"],
  ["【熊本県信用保証協会】令和8年熊本地震に係る緊急時短期資金保証制度等について", "money"],
  ["令和8年熊本地震に係る被服、寝具その他生活必需品の支給について", "money"],
  ["令和８年熊本地震によって被災された方の定期予防接種のお知らせ", "health_care"],
  ["クーリングシェルター（指定暑熱避難施設）を開設しています", "health_care"],
  ["令和8年熊本地震に伴う「ワンストップ窓口」を開設しました", "documents"],
  ["【熊本地震】8月15・16日（土・日）の窓口業務について", "documents"],
  ["親子安心ステーションの開設について", "family_education"],
  ["令和８年熊本地震による家屋の損壊等により校区外に転居された方へ", "family_education"],
  ["地震後の水稲栽培における水管理の技術対策について", "agriculture_fishery"],
  ["予約型乗合タクシー「のりのり号」の運行再開について", "daily_life"],
  ["災害サポート・レンタカーの貸出がはじまります！", "daily_life"],
  // 「災害ゴミ」とカタカナで書く自治体がある
  ["令和8年熊本地震に伴う災害ゴミ仮置場の開設時間の変更について", "daily_life"],
  ["【熊本地震】井戸水が出ないなどお困りの方へ", "daily_life"]
];
for (const [title, expected] of MUST_CLASSIFY) {
  const result = classify({ title, url: "https://example.lg.jp/a" }).map(item => item.category);
  assert.ok(result.includes(expected), `「${title}」が ${expected} に分類されません（結果: ${result.join(",") || "なし"}）`);
}

// 広すぎる語を入れると、相談窓口の記事がすべて証明・申請に混ざる
const consultation = classify({ title: "令和8年熊本地震に係るペットに関する相談窓口について", url: "https://example.lg.jp/b" })
  .map(item => item.category);
assert.ok(!consultation.includes("documents"), "相談窓口の記事を証明・申請に混ぜてはいけません");

// ---- 拾えている量 -----------------------------------------------------------
const classified = nav.validation.classifiedPageCount;
assert.ok(classified >= 530, `分類できた公式ページが${classified}件しかありません`);
// nav 側の unclassifiedCount は重複・非公式URL等で除いた分も含む。分野を1つも
// 当てられなかった純粋な取りこぼしは品質レポートの unclassifiedItems の方。
const report = JSON.parse(read("reports/municipality-official-navigation-quality.json"));
// 会議資料・広報紙・入口ページなど、8分野に載せないと決めた種類は config/
// reconstruction-out-of-scope.json で「対象外」にする。ここに残るのは、本当に
// 分野を当てられなかったもの＝人が1件ずつ見るべき取りこぼしだけ。
// 収集件数は日々増えるため、固定件数を上限にすると分類品質が変わっていなくても
// 定期更新が永久に止まる。既知の重要支援は上の MUST_CLASSIFY で厳格に守り、
// 全体の退行は入力に対する割合で検知する。未分類一覧は Workflow summary に残し、
// 公開を止めずに人が確認できるようにする。
const maxUnclassifiedRate = 0.05;
const unclassifiedRate = report.inputCount ? report.unclassifiedCount / report.inputCount : 1;
assert.ok(unclassifiedRate <= maxUnclassifiedRate,
  `未分類率が${(unclassifiedRate * 100).toFixed(1)}%です（上限${maxUnclassifiedRate * 100}%、${report.unclassifiedCount}/${report.inputCount}件）。reports/municipality-official-navigation-quality.json の unclassifiedItems を確認してください`);

// どの記事も「分類・対象外・未分類・除外」のどれか1つに入る。合計が入力と
// 合わなければ、どこかで記事が消えているか二重に数えている。
const accounted = report.classifiedPageCount + report.outOfScopeCount + report.unclassifiedCount + report.excludedCount;
assert.equal(accounted, report.inputCount,
  `収集した${report.inputCount}件のうち${accounted}件しか説明できていません（分類${report.classifiedPageCount}/対象外${report.outOfScopeCount}/未分類${report.unclassifiedCount}/除外${report.excludedCount}）`);

// ---- 対象外の扱い -----------------------------------------------------------
// 「対象外」は取りこぼしを隠す抜け道になりうる。次の3つで抜け道にしない。
const outOfScopeConfig = JSON.parse(read("config/reconstruction-out-of-scope.json"));
assert.ok(!validateOutOfScopeRules(outOfScopeConfig.rules).length,
  `対象外ルールが不正です: ${validateOutOfScopeRules(outOfScopeConfig.rules).join(", ")}`);

// ① 理由が書かれていること。あとから見て納得できない除外を残さない
for (const rule of outOfScopeConfig.rules) {
  assert.ok(rule.reason.length >= 20, `対象外ルール ${rule.id} の理由が短すぎます`);
}
// ② 使われていないルールを置かない。表題の書き方が変わって空振りしている
//    ルールに気づけなくなる（実際、全角括弧のまま書いて空振りしていた）
for (const rule of outOfScopeConfig.rules) {
  assert.ok(report.outOfScopeByRule?.[rule.id] > 0,
    `対象外ルール ${rule.id} に当たる記事が1件もありません。表題の書き方が変わったか、もう要らないルールです`);
}
// ③ 分野を当てられる記事を対象外にしないこと。対象外は分類できなかった記事に
//    しか使わない約束なので、これが破れると支援情報が消える
for (const item of report.outOfScopeItems || []) {
  assert.equal(classify({ title: item.title, url: item.url }).length, 0,
    `「${item.title}」は分野を当てられるのに対象外にされています`);
}
// 会議資料は「対象外」だが読めなくなるわけではない。市ごとのまとめページがある
const hqRule = outOfScopeConfig.rules.find(rule => rule.id === "hq_meeting_material");
assert.ok(hqRule && fs.existsSync(new URL(`../${hqRule.seeAlso}`, import.meta.url)),
  "会議資料を対象外にするなら、代わりに読めるページを示してください");
for (const category of categories) {
  const total = nav.municipalities.reduce(
    (sum, m) => sum + (m.updates || []).filter(u => u.categories.includes(category)).length, 0);
  assert.ok(total > 0, `${category} の公式情報が1件もありません`);
}

// ---- たどり着けなかったときのケア -------------------------------------------
// 0件で行き止まりにしない。逃がし先・他分野の件数・確信度の低い候補の3つ。
assert.match(navCode, /制度や支援がないという意味ではありません/, "0件の断り書きが必要です");
assert.match(navCode, /disasterHub/, "0件のとき市町村の災害情報ページへ逃がす必要があります");
assert.match(navCode, /municipality-other-categories/, "情報がある分野を示す必要があります");
assert.match(navCode, /municipality-uncertain/, "確信度が低くて隠れる候補を残す必要があります");
assert.match(navCode, /関係ないものが混じることがあります/, "確信度が低いことの断り書きが必要です");

// 逃がし先は21市町村のうち大半で用意できていること（専用ページを持たない町もある）
const withHub = nav.municipalities.filter(m => m.disasterHub);
assert.ok(withHub.length >= 20, `災害情報ページを登録できた市町村が${withHub.length}件しかありません`);
for (const m of withHub) {
  assert.match(m.disasterHub.url, /^https:\/\//, `${m.municipalityName}: 災害情報ページのURLが不正です`);
  assert.ok(m.disasterHub.label?.trim(), `${m.municipalityName}: 災害情報ページの名称が必要です`);
}
// 推測でURLを置いていないことの担保
assert.match(hubs.confirmedAt, /^\d{4}-\d{2}-\d{2}$/, "災害情報ページの確認日が必要です");
assert.ok(/1件ずつ開いて/.test(hubs.note), "どう確認したかの記録が必要です");
// 情報がない市町村も落とさない
assert.equal(nav.municipalities.length, 21, "21市町村すべてを扱う必要があります");
for (const m of nav.municipalities) assert.match(m.officialUrl, /^https?:\/\//, `${m.municipalityName}: 退避先がありません`);

// ---- 選んだ分野が関連ブロックにも伝わること ----------------------------------
// select の値を URL 反映前に読むと、どの分野を選んでも「住まい」が出てしまう。
assert.match(relationsCode, /userChanged/, "初回描画で URL の分野を優先する必要があります");
assert.match(relationsCode, /userChanged\?select\?\.value:null\)\|\|params\.get\("category"\)/,
  "初回は URL の分野を先に見る必要があります");

console.log(`暮らしの再建の到達性: 落とせない支援${MUST_CLASSIFY.length}件 / 分類${classified}件・対象外${report.outOfScopeCount}件・未分類${report.unclassifiedCount}件 / 逃がし先${withHub.length}市町村 / 0件時のケア OK`);
