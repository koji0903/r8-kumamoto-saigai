// ガイドページ横断の最新性・整合性・旧表現ガード検証テスト
// まとめ表・ハンドブック・個別ガイドの間で更新漏れや過去表現の残存を防ぐ。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const stripTags = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

console.log("ガイドページ横断最新性・整合性テスト開始");

// 1. 主要支援制度まとめ (priority-support-summary.html / sources/priority-support-matrix.json)
const priorityMatrix = read("sources/priority-support-matrix.json");
const priorityHtml = read("priority-support-summary.html");
for (const [label, content] of [
  ["sources/priority-support-matrix.json", priorityMatrix],
  ["priority-support-summary.html", priorityHtml]
]) {
  assert.ok(!content.includes("CSネットワーク等"), `${label} に閉鎖済みの「CSネットワーク等」が残っています`);
  assert.ok(!content.includes("入場券制"), `${label} に廃止済みの「入場券制」が残っています`);
  assert.ok(!content.includes("宇土市・宇城市は9月末まで"), `${label} に古い受入期間表記が残っています`);
  assert.ok(content.includes("KIREKAのみ"), `${label} に宇土市KIREKA一本化の最新運用がありません`);
  assert.ok(content.includes("11/25まで"), `${label} に宇城市稲川グラウンド11/25期限がありません`);
}

// 2. 公費解体・自費解体 (sources/demolition-data.json / demolition.html / 個別ガイド)
const demolitionJson = JSON.parse(read("sources/demolition-data.json"));
const demolitionHtml = read("demolition.html");
const nishihara = demolitionJson.municipalities.find((m) => m.id === "nishihara");
const mashiki = demolitionJson.municipalities.find((m) => m.id === "mashiki");
const utoDem = demolitionJson.municipalities.find((m) => m.id === "uto");
const ukiDem = demolitionJson.municipalities.find((m) => m.id === "uki");
assert.ok(nishihara && nishihara.selfDemolition.includes("R9.2.26"), "西原村の自費解体期限がR9.2.26に更新されていません");
assert.ok(!demolitionHtml.includes("R9.1.29") && !demolitionHtml.includes("2027年1月29日"), "demolition.html に西原村の旧期限が残っています");
assert.ok(mashiki && mashiki.period.includes("R8.12.28"), "益城町の公費解体期限がR8.12.28に更新されていません");
assert.ok(!demolitionHtml.includes("原則申請期限は2026年10月30日"), "demolition.html に益城町の旧期限表記が残っています");
assert.ok(utoDem && utoDem.selfDemolition.includes("11.27"), "宇土市の自費解体契約期限（11/27）が比較表にありません");
assert.ok(ukiDem && ukiDem.period.includes("R9.3.31"), "宇城市の公費解体期限（R9.3.31）が比較表にありません");

// 個別解体ガイドとの一致検証
const utoDemHtml = stripTags(read("uto-demolition.html"));
assert.ok(utoDemHtml.includes("11月27日"), "uto-demolition.html に自費解体契約期限（11月27日）がありません");
assert.ok(utoDemHtml.includes("土曜日のみ"), "uto-demolition.html に11月以降の土曜のみ開庁記載がありません");
const ukiDemHtml = stripTags(read("uki-demolition.html"));
assert.ok(ukiDemHtml.includes("85番地"), "uki-demolition.html に宇城市役所番地85がありません");
assert.ok(ukiDemHtml.includes("様式第10号") || ukiDemHtml.includes("様式10号"), "uki-demolition.html に様式第10号の記載がありません");

// 3. 宇土市 住宅・修理・災害ごみ・ハンドブック・利子補給
const utoHousingHtml = read("uto-housing.html");
assert.ok(!utoHousingHtml.includes("10月31日（土）は開庁"), "uto-housing.html に過去の10月開庁表記が残っています");
assert.ok(!utoHousingHtml.includes("10月27日（火）で終了予定"), "uto-housing.html に過去の10月終了予定表記が残っています");
assert.ok(utoHousingHtml.includes("11/7・14・21・28"), "uto-housing.html に11月土曜開庁日程がありません");
assert.ok(utoHousingHtml.includes("令和10年") && utoHousingHtml.includes("1月27日"), "uto-housing.html に応急修理完了期限延長（令和10年1月27日）がありません");

const utoRepairHtml = stripTags(read("uto-repair.html"));
assert.ok(utoRepairHtml.includes("令和10年") && utoRepairHtml.includes("1月27日"), "uto-repair.html に応急修理完了期限延長（令和10年1月27日）がありません");

const utoWasteHtml = stripTags(read("uto-waste.html"));
assert.ok(utoWasteHtml.includes("10月20日") && utoWasteHtml.includes("KIREKAのみ"), "uto-waste.html に10/20閉鎖・KIREKA一本化の最新運用がありません");
assert.ok(utoWasteHtml.includes("搬入許可証"), "uto-waste.html に搬入許可証の記載がありません");

const utoHandbookHtml = stripTags(read("uto-handbook.html"));
assert.ok(utoHandbookHtml.includes("土曜日のみ開庁"), "uto-handbook.html に11月以降の土曜のみ開庁注記がありません");
assert.ok(utoHandbookHtml.includes("11月27日まで"), "uto-handbook.html に自費解体契約期限（11月27日）注記がありません");
assert.ok(utoHandbookHtml.includes("環境再生センターKIREKA") && utoHandbookHtml.includes("10月20日で閉鎖"), "uto-handbook.html に災害ごみ仮置場閉鎖・KIREKA一本化の注記がありません");
assert.ok(utoHandbookHtml.includes("修理完了・完了報告書等の提出 令和8年11月27日"), "uto-handbook.html に住家の緊急修理の延長期限（11月27日）がありません");
assert.ok(!utoHandbookHtml.includes("修理期間 令和8年10月27日"), "uto-handbook.html に住家の緊急修理の旧期限（10月27日）が残っています");

const utoInterestHtml = stripTags(read("uto-interest-subsidy.html"));
assert.ok(!utoInterestHtml.includes("現在様式準備中"), "uto-interest-subsidy.html に「現在様式準備中」が残っています");
assert.ok(utoInterestHtml.includes("2月26日"), "uto-interest-subsidy.html に申請期限（2月26日）がありません");

// 4. 宇城市 支援ガイド・相談会ガイド
const ukiSupportHtml = stripTags(read("uki-support.html"));
assert.ok(ukiSupportHtml.includes("11月25日まで") && ukiSupportHtml.includes("原本"), "uki-support.html に災害ごみ11/25期限・原本必須がありません");
assert.ok(ukiSupportHtml.includes("11月30日まで") && ukiSupportHtml.includes("ムービングハウス"), "uki-support.html に建設型応急住宅の最新募集案内がありません");
assert.ok(ukiSupportHtml.includes("10月31日（土）をもって終了"), "uki-support.html に災害ボランティア受付終了の記載がありません");

const ukiConsultHtml = stripTags(read("uki-consultation.html"));
assert.ok(ukiConsultHtml.includes("11月23日"), "uki-consultation.html に11月23日祝日の休止注記がありません");

const hikawaDemHtml = stripTags(read("hikawa-demolition.html"));
assert.ok(hikawaDemHtml.includes("月〜土曜受付（日曜・祝日除く）"), "hikawa-demolition.html に11月以降の月〜土曜受付がありません");
assert.ok(!hikawaDemHtml.includes("土日祝日も受付中"), "hikawa-demolition.html に11月以降と異なる土日祝受付表記が残っています");

const yatsushiroLivingHtml = stripTags(read("yatsushiro-living-support.html"));
assert.ok(yatsushiroLivingHtml.includes("被災者応援ガイドブック第10版"), "yatsushiro-living-support.html に公式第10版表記がありません");
assert.ok(yatsushiroLivingHtml.includes("全59制度"), "yatsushiro-living-support.html に第10版の制度数がありません");
assert.ok(!yatsushiroLivingHtml.includes("全58制度の対象・金額・期限・条件・相談先を完全網羅"), "yatsushiro-living-support.html に第8版由来の完全網羅表現が残っています");

// 5. 熊本市 支援ガイド
const kumamotoSupportHtml = stripTags(read("kumamoto-support.html"));
assert.ok(kumamotoSupportHtml.includes("令和9年（2027年）3月31日"), "kumamoto-support.html にり災証明書延長期限（令和9年3月31日）がありません");
assert.ok(kumamotoSupportHtml.includes("令和9年（2027年）5月31日"), "kumamoto-support.html に災害援護資金延長期限（令和9年5月31日）がありません");

const risaiHtml = read("risai-certificate.html");
assert.ok(risaiHtml.includes("https://www.town.kumamoto-nishiki.lg.jp/"), "risai-certificate.html に錦町の現行公式ドメインがありません");
assert.ok(risaiHtml.includes("https://www.town.kumamoto-takamori.lg.jp/"), "risai-certificate.html に高森町の現行公式ドメインがありません");
assert.ok(!risaiHtml.includes("https://www.town.nishiki.lg.jp/") && !risaiHtml.includes("https://www.town.takamori.kumamoto.jp/"), "risai-certificate.html に旧公式ドメインが残っています");

// 6. 監視台帳とレポートの存在検証
assert.ok(fs.existsSync(new URL("../sources/guide-official-watch.json", import.meta.url)), "sources/guide-official-watch.json が存在しません");
const watchConfig = JSON.parse(read("sources/guide-official-watch.json"));
assert.ok(Array.isArray(watchConfig.targets) && watchConfig.targets.length >= 27, "公式監視対象が27件以上登録されている必要があります");
assert.ok(watchConfig.targets.some(target => target.id === "uki-support-overview" && target.guidePages.includes("uki-support.html")), "宇城市の支援制度概要を優先監視してください");

console.log(`ガイドページ横断最新性・整合性テスト OK（監視台帳 ${watchConfig.targets.length}件・横断チェック完了）`);
