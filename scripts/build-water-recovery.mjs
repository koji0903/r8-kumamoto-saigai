#!/usr/bin/env node
// 上水道の復旧を、県の実測値と現場の発信の両面から見るためのデータを作る。
//
//   node scripts/build-water-recovery.mjs
//
// なぜ2つ並べるのか
//   県が公表する「断水戸数」は水が出るか出ないかしか数えない。実際には
//   濁り水で飲めない、時間断水、減圧給水、水道未契約の井戸水世帯といった
//   状態があり、いずれも統計上は0戸として扱われる。復旧の差は実測値で
//   正確に示し、統計が数えない部分は自治体の発信と会議記録で補う。
//
// してはいけないこと
//   発信の件数から被害の大きさを逆算すること。氷川町は発災19日目でも
//   1,490戸が断水しているが水に関する発信は2件、熊本市・御船町・芦北町は
//   断水があったが0件。発信量はその自治体の広報の仕方を表すにすぎない。

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = join(ROOT, "public-data/reconstruction/water-recovery.json");
const DISASTER_DATE = "2026-07-28";

const dayNumber = date => Math.round(
  (new Date(`${date}T00:00:00+09:00`) - new Date(`${DISASTER_DATE}T00:00:00+09:00`)) / 86400000
) + 1;

// window 経由のデータを読む（生成物は window.* に載せる作法に合わせてある）
global.window = {};
require(join(ROOT, "data/generated/hq-damage-data.js"));
require(join(ROOT, "data/minutes-data.js"));
const hq = global.window.HQ_DAMAGE;
const minutes = global.window.MINUTES_DATA;
const nav = JSON.parse(await readFile(join(ROOT, "public-data/reconstruction/municipality-official-navigation.json"), "utf8"));

// ---- 実測値：市町村ごとの断水戸数の推移 ------------------------------------
const snapshots = (hq.snapshots || []).filter(snapshot => snapshot.columns.includes("waterOutages"));
if (!snapshots.length) throw new Error("断水を含む県資料のスナップショットがありません");
const axis = snapshots.map(snapshot => ({ date: snapshot.date, time: snapshot.time, day: dayNumber(snapshot.date) }));

const measured = hq.municipalityOrder
  .map(name => {
    const series = snapshots.map(snapshot => snapshot.municipalities[name]?.waterOutages ?? null);
    const peak = Math.max(0, ...series.filter(value => value != null));
    if (!peak) return null;
    const latest = series.at(-1) ?? 0;
    // 最後に0でなくなった時点の次が復旧。以降ずっと0なら解消とみなす。
    let resolvedIndex = null;
    for (let index = series.length - 1; index >= 0; index--) {
      if (series[index] > 0) break;
      resolvedIndex = index;
    }
    return {
      name, series, peak, latest,
      peakDay: axis[series.indexOf(peak)]?.day ?? null,
      remainingRate: peak ? Math.round((latest / peak) * 1000) / 10 : 0,
      resolvedDate: resolvedIndex != null && latest === 0 ? axis[resolvedIndex].date : null,
      resolvedDay: resolvedIndex != null && latest === 0 ? axis[resolvedIndex].day : null
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.latest - a.latest || b.peak - a.peak);

// ---- 発信：水に関する公式ページ ---------------------------------------------
// 表題から状態を読み取る。断水戸数では0と数えられてしまう状態に印をつける。
const STATE_RULES = [
  { id: "turbid", label: "濁り・飲用不可", pattern: /濁り|濁水|飲用をお?控え|飲めない/, invisible: true },
  { id: "partial", label: "時間断水・減圧", pattern: /時間断水|減圧|時間給水|試験通水/, invisible: true },
  { id: "well", label: "井戸水", pattern: /井戸/, invisible: true },
  { id: "supply", label: "給水所・応急給水", pattern: /給水所|給水車|応急給水|給水|飲料水.*配布/, invisible: false },
  { id: "restored", label: "復旧・解消", pattern: /復旧|解消|通水(?!.*試験)/, invisible: false },
  { id: "outage", label: "断水の案内", pattern: /断水/, invisible: false },
  { id: "fee", label: "料金の減免", pattern: /料金|減免/, invisible: false },
  { id: "sewer", label: "下水道", pattern: /下水道/, invisible: false }
];
const WATER_PATTERN = /断水|給水|通水|水道|濁り|飲料水|生活用水|井戸/;

const publications = [];
for (const municipality of nav.municipalities || []) {
  for (const update of municipality.updates || []) {
    const title = update.displayTitle || update.officialTitle || "";
    if (!WATER_PATTERN.test(title)) continue;
    // 自治体が災害ページに載せたもの（inherited_from_disaster_collector）も
    // 災害関連として扱う。除くのは入札・契約など住民向けでない事務連絡だけ。
    if (!["direct", "inherited_from_disaster_collector"].includes(update.disasterRelevance)) continue;
    if (/プロポーザル|入札|公募型|包括業務委託|指名停止/.test(title)) continue;
    const date = String(update.publishedAt || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const day = dayNumber(date);
    if (day < 1) continue;
    const rule = STATE_RULES.find(item => item.pattern.test(title));
    publications.push({
      municipalityName: municipality.municipalityName,
      date, day, title, url: update.url,
      state: rule?.id ?? "other",
      stateLabel: rule?.label ?? "その他の水の情報",
      invisibleInStats: Boolean(rule?.invisible)
    });
  }
}
publications.sort((a, b) => a.date.localeCompare(b.date));

// ---- 会議記録：統計に表れない水の問題 ---------------------------------------
const MINUTE_PATTERN = /井戸|濁り|生活用水|水道未契約|時間通水|試験通水|減圧/;
const minuteNotes = [];
for (const meeting of minutes.meetings || []) {
  for (const section of meeting.sections || []) {
    for (const group of section.groups || []) {
      for (const item of group.items || []) {
        if (!MINUTE_PATTERN.test(item.text || "")) continue;
        minuteNotes.push({
          meeting: meeting.meeting, date: meeting.date, day: meeting.disasterDay,
          page: group.page || section.page, pdf: meeting.pdf,
          speaker: item.speaker || item.label || null,
          text: item.text
        });
      }
    }
  }
}
// 新しい回を優先し、同じ趣旨の重複を避けるため各回3件までにする
const byMeeting = new Map();
for (const note of minuteNotes) {
  const list = byMeeting.get(note.meeting) || [];
  if (list.length < 3) { list.push(note); byMeeting.set(note.meeting, list); }
}
const notes = [...byMeeting.values()].flat().sort((a, b) => b.day - a.day).slice(0, 8);

const latestSnapshot = snapshots.at(-1);
const output = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  disasterDate: DISASTER_DATE,
  measuredAsOf: { date: latestSnapshot.date, time: latestSnapshot.time, meeting: latestSnapshot.meeting, url: latestSnapshot.sourceUrl },
  axis,
  measured,
  totals: {
    peak: Math.max(...snapshots.map(snapshot => snapshot.totals.waterOutages || 0)),
    latest: latestSnapshot.totals.waterOutages || 0,
    affectedMunicipalities: measured.length,
    remainingMunicipalities: measured.filter(item => item.latest > 0).length
  },
  publications,
  invisibleStates: STATE_RULES.filter(rule => rule.invisible).map(rule => ({ id: rule.id, label: rule.label })),
  notes,
  caveats: [
    "断水戸数は水が出るか出ないかだけを数えます。濁り水で飲めない、時間断水、減圧給水はいずれも統計上0戸として扱われます。",
    "水道契約のない井戸水の世帯は断水戸数に含まれません。八代市では市全体で約2万7千戸が水道未契約で、松崎町では約200世帯が井戸水の停止で影響を受けたと会議で報告されています。",
    "発信の件数は被害の大きさを表しません。断水が続いている自治体でも水に関する発信が少ない場合があり、広報の仕方の違いによるものです。"
  ]
};

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(output)}\n`);

console.log(`上水道の復旧: 実測${measured.length}市町村 / 発信${publications.length}件（うち統計に出ない状態${publications.filter(item => item.invisibleInStats).length}件） / 会議記録${notes.length}件`);
console.log(`  ピーク${output.totals.peak.toLocaleString("ja-JP")}戸 → ${latestSnapshot.date}時点${output.totals.latest.toLocaleString("ja-JP")}戸`);
