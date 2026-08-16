// 「発信でたどる被災地の局面」が、自治体の比較にすり替わらないことを守る。
//
// このページは公式発信の内容の移り変わりから災害の局面を読むもの。
// 発信量の多い少ないを自治体の優劣として見せると、公表の仕方の違い
// （1ページに集約する自治体がある）を実力差として誤読させてしまう。
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const data = JSON.parse(fs.readFileSync(new URL("../public-data/reconstruction/official-timeline.json", import.meta.url), "utf8"));
const html = fs.readFileSync(new URL("../official-timeline.html", import.meta.url), "utf8");
const code = fs.readFileSync(new URL("../official-timeline.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../official-timeline.css", import.meta.url), "utf8");
const builder = fs.readFileSync(new URL("./build-official-timeline.mjs", import.meta.url), "utf8");

// 順位づけをしないこと
assert.match(html, /順位ではありません/, "順位ではない旨の明示が必要です");
assert.match(html, /自治体の対応の速さや被害の大きさを表すものではありません/, "誤読を防ぐ但し書きが必要です");
assert.ok(data.caveats?.length >= 3, "数え方の但し書きが不足しています");
// 自治体ごとの集計値をデータに持たせない（持つと順位表示に転用されうる）
assert.ok(!JSON.stringify(data).includes("municipalityRanking"), "自治体の順位データを持ってはいけません");
for (const phase of data.phases || []) {
  assert.ok(!Array.isArray(phase.municipalities), `${phase.id}: 局面ごとの自治体別内訳を持ってはいけません`);
}

// 構成比で見せること（件数そのままだと曜日と公開の癖に引きずられる）
assert.ok((data.windows || []).length >= 3, "時間窓が不足しています");
for (const window of data.windows) {
  assert.ok(window.endDay >= window.startDay, "窓の範囲が不正です");
  const total = Object.values(window.shares).reduce((sum, item) => sum + item.share, 0);
  assert.ok(Math.abs(total - 100) < 1.5, `発災${window.startDay}日目の窓の構成比合計が${total}%です`);
}

// 局面と根拠
assert.ok((data.phases || []).length >= 3, "局面が3つ以上必要です");
for (const phase of data.phases) {
  assert.ok(phase.reading && phase.reading.length > 20, `${phase.id}: 局面の読み取りの説明が必要です`);
  assert.ok((phase.topCategories || []).length, `${phase.id}: 主な分野が必要です`);
  // 解釈の根拠として実物の公式ページを示すこと
  for (const example of phase.examples || []) {
    assert.match(example.url, /^https?:\/\//, `${phase.id}: 例のURLが不正です`);
    assert.ok(example.title && example.municipalityName, `${phase.id}: 例に表題と自治体名が必要です`);
    assert.ok(example.day >= phase.startDay && example.day <= phase.endDay, `${phase.id}: 例が局面の期間外です（発災${example.day}日目）`);
  }
}

// 広がりは市町村数で、総数を超えないこと
const total = data.totals?.municipalityTotal || 21;
for (const [category, spread] of Object.entries(data.spread || {})) {
  assert.ok(spread.total <= total, `${category}: 広がりが市町村総数を超えています`);
  assert.ok(spread.series.every((value, index) => index === 0 || value >= spread.series[index - 1]), `${category}: 累積が減少しています`);
}

// 画面側
assert.match(code, /official-timeline\.json/, "生成データを読む必要があります");
assert.match(code, /timelineCaveats/, "但し書きを画面に出す必要があります");
assert.match(code, /catch\(\(\) => fail\(/, "読み込み失敗時の代替導線が必要です");
assert.match(html, /<noscript>/, "JavaScript無効時の導線が必要です");
assert.match(html, /municipality-updates\.html/, "個別の公式発信への導線が必要です");
assert.match(css, /@media\(max-width:700px\)/, "狭い画面への対応が必要です");
assert.match(css, /@media print/, "印刷への対応が必要です");
assert.match(builder, /局面の読み取り|何を出さないか/, "生成側にも意図の記述が必要です");

// 再生成しても壊れないこと
const build = spawnSync(process.execPath, ["scripts/build-official-timeline.mjs"], { encoding: "utf8" });
assert.equal(build.status, 0, build.stderr);
assert.match(build.stdout, /公式発信の時系列/);

console.log(`発信でたどる被災地の局面: ${data.windows.length}区間 / ${data.phases.length}局面 / ${data.totals.pageCount}件 / 順位化しない・構成比・根拠リンク・fallback OK`);
