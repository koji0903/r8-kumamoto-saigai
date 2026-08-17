#!/usr/bin/env node
// 市町村公式発信の蓄積から、災害全体の局面の移り変わりを読むためのデータを作る。
//
//   node scripts/build-official-timeline.mjs
//
// 入力: public-data/reconstruction/municipality-official-navigation.json
// 出力: public-data/reconstruction/official-timeline.json
//
// 何を出すか
//   - 分野構成の推移: 発信の「件数」ではなく「構成比」。件数は曜日や自治体ごとの
//     公開の癖に左右されるため、そのままでは状況の変化を表さない。
//   - 分野の広がり: その分野を発信した市町村が何団体に達したか。1つの自治体が
//     何本書いたかではなく、県内にその話題が広がった度合いを見る。
//   - 局面ごとの代表的な発信: 実際の公式ページの表題とURL。解釈の根拠を示す。
//
// 何を出さないか
//   自治体ごとの発信量・発信の早さの比較はしない。公表の仕方が自治体で違い
//   （1ページに集約する自治体もある）、対応の速さや被害の大きさを表さないため。

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INPUT = join(ROOT, "public-data/reconstruction/municipality-official-navigation.json");
const OUTPUT = join(ROOT, "public-data/reconstruction/official-timeline.json");
const DISASTER_DATE = "2026-07-28";
const WINDOW_DAYS = 3; // 曜日による増減をならすため3日単位でまとめる

const CATEGORY_LABELS = {
  home: "住まい", money: "お金・支払い", documents: "証明・申請", health_care: "健康・介護",
  family_education: "子ども・家族", work_business: "仕事・事業", agriculture_fishery: "農業・漁業", daily_life: "暮らし・移動"
};
// 帯グラフの色。dataviz の並びに合わせ、隣り合う分野が見分けられる順にする。
const CATEGORY_COLORS = {
  home: "#6577a6", money: "#d39b2b", documents: "#3b8a78", health_care: "#a8577a",
  family_education: "#e45e35", work_business: "#7a6a63", agriculture_fishery: "#5b8c3a", daily_life: "#2d79a8"
};

const dayNumber = date => Math.round(
  (new Date(`${date}T00:00:00+09:00`) - new Date(`${DISASTER_DATE}T00:00:00+09:00`)) / 86400000
) + 1;

const nav = JSON.parse(await readFile(INPUT, "utf8"));
const categories = nav.categories || [];

// 1件 = 1つの公式ページ。分野は複数付くことがある。
const records = [];
for (const municipality of nav.municipalities || []) {
  for (const update of municipality.updates || []) {
    const date = String(update.publishedAt || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const day = dayNumber(date);
    if (day < 1) continue; // 発災前の記事は局面の読み取りに使わない
    records.push({
      date, day,
      municipalityId: municipality.municipalityId,
      municipalityName: municipality.municipalityName,
      title: update.displayTitle || update.officialTitle,
      url: update.url,
      categories: (update.categories || []).filter(category => categories.includes(category)),
      confidence: update.classificationConfidence,
      relevance: update.disasterRelevance
    });
  }
}
if (!records.length) throw new Error("日付のある公式発信が1件もありません。ナビの生成を先に確認してください。");
records.sort((a, b) => a.date.localeCompare(b.date));

const lastDay = records.at(-1).day;

// ---- 3日窓ごとの分野構成 ---------------------------------------------------
const windows = [];
for (let start = 1; start <= lastDay; start += WINDOW_DAYS) {
  const end = Math.min(start + WINDOW_DAYS - 1, lastDay);
  const inWindow = records.filter(record => record.day >= start && record.day <= end);
  if (!inWindow.length) continue;
  const tagged = inWindow.reduce((total, record) => total + record.categories.length, 0);
  windows.push({
    startDay: start, endDay: end,
    startDate: inWindow[0].date, endDate: inWindow.at(-1).date,
    pageCount: inWindow.length,
    municipalityCount: new Set(inWindow.map(record => record.municipalityId)).size,
    // 構成比。1ページに複数分野が付くため、分母は延べ分野数。
    shares: Object.fromEntries(categories.map(category => {
      const count = inWindow.filter(record => record.categories.includes(category)).length;
      return [category, { count, share: tagged ? Math.round((count / tagged) * 1000) / 10 : 0 }];
    }))
  });
}

// ---- 分野ごとの広がり（累積の市町村数） -------------------------------------
const spread = Object.fromEntries(categories.map(category => {
  const reached = new Set();
  const series = [];
  for (let day = 1; day <= lastDay; day++) {
    for (const record of records.filter(item => item.day === day && item.categories.includes(category))) {
      reached.add(record.municipalityId);
    }
    series.push(reached.size);
  }
  const first = records.filter(record => record.categories.includes(category)).sort((a, b) => a.day - b.day)[0];
  return [category, {
    series,
    total: reached.size,
    firstDay: first?.day ?? null,
    firstDate: first?.date ?? null
  }];
}));

// ---- 局面の区切り -----------------------------------------------------------
// 区切りは資料の日付ではなく、構成比の実際の動きから決める。ここでは
// 「暮らし・子ども中心」→「証明が全県に広がる」→「住まいが最大の話題」
// という観測された流れに沿って3期に分ける。
const phaseDefs = [
  { id: "immediate", label: "発災直後", startDay: 1, endDay: 6,
    reading: "その日をどう過ごすかの情報が中心でした。給水・ごみ・休校・避難所の開設など、生活を止めないための連絡が多くを占めます。" },
  { id: "assessment", label: "被害を確かめる時期", startDay: 7, endDay: 13,
    reading: "罹災証明の受付や住家被害認定調査の案内が県内に広がりました。被害を記録し、証明する段階に移っています。" },
  { id: "rebuilding", label: "住まいを決める時期", startDay: 14, endDay: null,
    reading: "応急修理・応急仮設住宅・みなし仮設など、住まいをどうするかの発信が最も多くなりました。生活再建の判断が必要な段階です。" }
];
const phases = phaseDefs.map(phase => {
  const end = phase.endDay ?? lastDay;
  const inPhase = records.filter(record => record.day >= phase.startDay && record.day <= end);
  const tagged = inPhase.reduce((total, record) => total + record.categories.length, 0);
  const ranked = categories
    .map(category => ({
      category,
      count: inPhase.filter(record => record.categories.includes(category)).length,
      municipalities: new Set(inPhase.filter(record => record.categories.includes(category)).map(record => record.municipalityId)).size
    }))
    .sort((a, b) => b.count - a.count);
  const topCategories = ranked.filter(item => item.count).slice(0, 3)
    .map(item => ({ ...item, share: tagged ? Math.round((item.count / tagged) * 1000) / 10 : 0 }));
  // 代表的な発信は、その局面で何が起きていたかを示すもの。行政の一般的なお知らせが
  // 混じると読み違えるため、災害に直接関係し分類の確からしい記事から選ぶ。
  const used = new Set();
  const examples = [];
  const exampleScore = record =>
    (record.relevance === "direct" ? 4 : 0) +
    (record.confidence === "high" ? 2 : record.confidence === "medium" ? 1 : 0);
  for (const { category } of topCategories) {
    // 主分類が一致するものだけを使う。副次的に付いた分野で選ぶと、
    // 「子ども・家族」の例に農地の記事が出るような食い違いが起きる。
    const pool = inPhase.filter(record => record.categories[0] === category && exampleScore(record) >= 5);
    const candidate = pool.filter(record => !used.has(record.municipalityId))
      .sort((a, b) => exampleScore(b) - exampleScore(a) || a.day - b.day)[0]
      || pool.sort((a, b) => exampleScore(b) - exampleScore(a) || a.day - b.day)[0];
    if (!candidate) continue;
    used.add(candidate.municipalityId);
    examples.push({
      category, categoryLabel: CATEGORY_LABELS[category],
      day: candidate.day, date: candidate.date,
      municipalityName: candidate.municipalityName, title: candidate.title, url: candidate.url
    });
  }
  return {
    ...phase, endDay: end,
    pageCount: inPhase.length,
    municipalityCount: new Set(inPhase.map(record => record.municipalityId)).size,
    topCategories, examples
  };
});

const output = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  source: "public-data/reconstruction/municipality-official-navigation.json",
  disasterDate: DISASTER_DATE,
  lastDay,
  lastDate: records.at(-1).date,
  windowDays: WINDOW_DAYS,
  totals: {
    pageCount: records.length,
    municipalityCount: new Set(records.map(record => record.municipalityId)).size,
    municipalityTotal: (nav.municipalities || []).length
  },
  categories: categories.map(category => ({
    id: category, label: CATEGORY_LABELS[category], color: CATEGORY_COLORS[category]
  })),
  windows, spread, phases,
  // 読み違いを防ぐための但し書き。ページ側でも必ず表示する。
  caveats: [
    "発信が少ないことは、対応が少ないことを意味しません。市町村からのお知らせは公式LINEや防災行政無線に移っている場合があり、そこで流れた内容はホームページに載らないためここには出てきません（宇土市の防災行政無線の放送内容ページは、発災前の2026年5月8日で更新が止まっています）。21市町村中10市町村で公式LINEを確認しています。",
    "発信の件数は、自治体の対応の速さや被害の大きさを表すものではありません。1つのページに情報をまとめる自治体もあれば、記事を分けて出す自治体もあります。",
    "収集できた公式ページのみを数えています。すべての発信を網羅したものではありません。",
    "1つのページに複数の分野が該当する場合があるため、構成比の分母は延べ分野数です。"
  ]
};

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(output)}\n`);

console.log(`公式発信の時系列: ${records.length}件 / ${output.totals.municipalityCount}市町村 / 発災${lastDay}日目まで`);
console.log(`  局面 ${phases.length}期 / 3日窓 ${windows.length}区間 → public-data/reconstruction/official-timeline.json`);
