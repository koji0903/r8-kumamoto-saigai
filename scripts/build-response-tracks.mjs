#!/usr/bin/env node
// 発災後に自治体がたどる5つの対応の流れを、市町村ごとに時間軸で並べる。
//
//   node scripts/build-response-tracks.mjs
//
// 5つの流れ
//   断水対応 / 罹災証明 / 災害ボランティアセンター・応急修理 / 災害ごみ / 相談窓口
//
// 二重の情報源
//   節目（milestone）は一次資料の実日付。罹災証明の窓口設置日と住家被害認定
//   調査の実施日は県の資料に、災害VCの開所日と活動開始日は火の国会議の
//   議事録にある。これらは「発信した日」ではなく「実際に始まった日」。
//   発信（publication）は各市町村の公式ページ。節目のない流れでも動きが追える。
//
// 気をつけていること
//   発信が遅い・少ないことを対応の遅れとして読ませない。1ページに集約する
//   自治体があり、発信の有無は広報の仕方を表す。節目は実日付なので比較に
//   耐えるが、それでも被害の規模が違えば必要な対応も時期も変わる。

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = join(ROOT, "public-data/reconstruction/response-tracks.json");
const DISASTER_DATE = "2026-07-28";

const dayNumber = date => Math.round(
  (new Date(`${date}T00:00:00+09:00`) - new Date(`${DISASTER_DATE}T00:00:00+09:00`)) / 86400000
) + 1;
// 「7月30日」「8/3」→ 2026-07-30
const parseJapaneseDate = value => {
  const match = String(value ?? "").match(/(\d{1,2})\s*[月/]\s*(\d{1,2})/);
  if (!match) return null;
  return `2026-${String(match[1]).padStart(2, "0")}-${String(match[2]).padStart(2, "0")}`;
};

global.window = {};
require(join(ROOT, "data/generated/hq-damage-data.js"));
require(join(ROOT, "data/minutes-data.js"));
const hq = global.window.HQ_DAMAGE;
const minutes = global.window.MINUTES_DATA;
const nav = JSON.parse(await readFile(join(ROOT, "public-data/reconstruction/municipality-official-navigation.json"), "utf8"));

const TRACKS = [
  { id: "water", label: "断水対応", color: "#2d79a8",
    summary: "断水の周知、応急給水や水の配布、使用の制限、復旧の知らせ。",
    pattern: /断水|給水|通水|水道|濁り|飲料水|生活用水|井戸/ },
  { id: "certificate", label: "罹災証明", color: "#3b8a78",
    summary: "罹災証明書の申請受付と、住家被害認定調査。生活再建の制度の入口になる。",
    pattern: /罹災証明|り災証明|被災証明|住家被害認定|被害認定調査/ },
  { id: "volunteer", label: "災害VC・応急修理", color: "#d39b2b",
    summary: "災害ボランティアセンターの開設とボランティア募集、住宅の応急修理・緊急修理の受付。",
    pattern: /ボランティア|災害VC|ボラセン|応急修理|緊急修理|ブルーシート|屋根/ },
  { id: "waste", label: "災害ごみ", color: "#7a6a63",
    summary: "災害廃棄物の仮置場の開設、受入時間、収集の再開。",
    pattern: /災害ご[みﾐ]|災害廃棄物|仮置場|仮置き場|片付けごみ|ごみ.*収集|し尿/ },
  { id: "consultation", label: "相談窓口", color: "#a8577a",
    summary: "被災者向けの相談窓口、コールセンター、専門家による相談。",
    pattern: /相談窓口|相談会|コールセンター|無料相談|よくある質問|問い合わせ窓口|総合相談/ }
];

// ---- 節目：一次資料にある実日付 ---------------------------------------------
const milestones = new Map(); // 市町村名 -> [{trackId, label, date, day, source}]
const addMilestone = (name, milestone) => {
  const list = milestones.get(name) || [];
  if (!list.some(item => item.trackId === milestone.trackId && item.label === milestone.label)) list.push(milestone);
  milestones.set(name, list);
};

// 罹災証明：県資料（受付窓口設置・住家被害認定調査）
const certAsOf = hq.metadata?.certificationAsOf;
for (const [name, cert] of Object.entries(hq.certification || {})) {
  for (const [key, label] of [["window", "罹災証明の受付窓口を設置"], ["survey", "住家被害認定調査を実施"]]) {
    const date = parseJapaneseDate(cert[key]);
    if (!date) continue;
    const day = dayNumber(date);
    if (day < 1) continue;
    addMilestone(name, {
      trackId: "certificate", label, date, day,
      note: cert[key],
      source: { kind: "prefecture", label: `熊本県 災害対策本部会議資料（${certAsOf?.date ?? ""}時点）`, url: certAsOf?.url ?? null }
    });
  }
}

// 災害VC：火の国会議の一覧（最後に掲載された回を使う）
const vcMeetings = minutes.meetings.filter(meeting => meeting.sections.some(section => section.vcTable));
const vcMeeting = vcMeetings.at(-1);
if (vcMeeting) {
  const table = vcMeeting.sections.find(section => section.vcTable).vcTable;
  for (const row of table.rows || []) {
    // 「7/29開所・8/10活動開始」から2つの節目を取り出す
    const opened = row.status.match(/(\d{1,2}\/\d{1,2})\s*開所/);
    const started = row.status.match(/(\d{1,2}\/\d{1,2})\s*(?:から)?活動開始/) || (/開所・活動開始/.test(row.status) ? opened : null);
    const source = { kind: "minutes", label: `第${vcMeeting.meeting}回 火の国会議 議事録 p.${table.page}`, url: `${vcMeeting.pdf}#page=${table.page}` };
    for (const [match, label] of [[opened, "災害VCを開所"], [started, "ボランティア活動を開始"]]) {
      const date = match && parseJapaneseDate(match[1]);
      if (!date) continue;
      const day = dayNumber(date);
      if (day < 1) continue;
      addMilestone(row.name, { trackId: "volunteer", label, date, day, note: row.status, source });
    }
  }
}

// ---- 発信：各流れに分類 -----------------------------------------------------
const publications = [];
for (const municipality of nav.municipalities || []) {
  for (const update of municipality.updates || []) {
    const title = update.displayTitle || update.officialTitle || "";
    if (!["direct", "inherited_from_disaster_collector"].includes(update.disasterRelevance)) continue;
    if (/プロポーザル|入札|公募型|包括業務委託|指名停止/.test(title)) continue;
    const date = String(update.publishedAt || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const day = dayNumber(date);
    if (day < 1) continue;
    // 1つの記事が複数の流れにまたがることがある（例：罹災証明と応急修理）
    const tracks = TRACKS.filter(track => track.pattern.test(title)).map(track => track.id);
    if (!tracks.length) continue;
    publications.push({ municipalityName: municipality.municipalityName, date, day, title, url: update.url, tracks });
  }
}
publications.sort((a, b) => a.date.localeCompare(b.date));

// ---- 市町村ごとにまとめる ---------------------------------------------------
const municipalities = (nav.municipalities || []).map(municipality => {
  const name = municipality.municipalityName;
  const own = publications.filter(item => item.municipalityName === name);
  const ownMilestones = (milestones.get(name) || []).sort((a, b) => a.day - b.day);
  return {
    name, officialUrl: municipality.officialUrl,
    tracks: Object.fromEntries(TRACKS.map(track => {
      const items = own.filter(item => item.tracks.includes(track.id));
      const marks = ownMilestones.filter(item => item.trackId === track.id);
      const days = [...items.map(item => item.day), ...marks.map(item => item.day)];
      return [track.id, {
        milestones: marks,
        publications: items,
        firstDay: days.length ? Math.min(...days) : null,
        lastDay: days.length ? Math.max(...days) : null,
        count: items.length
      }];
    }))
  };
}).sort((a, b) => {
  // 動きの多い順ではなく、県の被災規模（断水のピーク）が大きい順に並べる。
  // 発信量で並べると広報の熱心さの順位に見えてしまうため。
  const peak = name => Math.max(0, ...(hq.snapshots || []).map(snapshot => snapshot.municipalities[name]?.waterOutages || 0));
  return peak(b.name) - peak(a.name) || a.name.localeCompare(b.name, "ja");
});

const lastDay = Math.max(
  ...publications.map(item => item.day),
  ...[...milestones.values()].flat().map(item => item.day)
);

const output = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  disasterDate: DISASTER_DATE,
  lastDay,
  tracks: TRACKS.map(({ id, label, color, summary }) => ({ id, label, color, summary })),
  municipalities,
  totals: {
    publicationCount: publications.length,
    milestoneCount: [...milestones.values()].flat().length,
    municipalityCount: municipalities.filter(item => Object.values(item.tracks).some(track => track.firstDay != null)).length
  },
  sources: {
    certificate: certAsOf ? { label: `熊本県 災害対策本部会議資料（${certAsOf.date} ${certAsOf.time}時点）`, url: certAsOf.url } : null,
    volunteer: vcMeeting ? { label: `第${vcMeeting.meeting}回 火の国会議 議事録`, url: vcMeeting.pdf } : null
  },
  caveats: [
    "発信が少ないことは、対応が少ないことを意味しません。市町村からのお知らせは公式LINEや防災行政無線に移っている場合があり、そこで流れた内容はホームページに載らないためここには出てきません（宇土市の防災行政無線の放送内容ページは、発災前の2026年5月8日で更新が止まっています）。21市町村中10市町村で公式LINEを確認しています。",
    "◆印は一次資料に書かれた実際の日付です。罹災証明の受付窓口設置日と住家被害認定調査の実施日は熊本県の資料から、災害ボランティアセンターの開所日と活動開始日は火の国会議の議事録から取っています。",
    "丸印はその日に自治体が出した公式情報です。発信がないことは対応がないことを意味しません。1ページにまとめて掲載し続ける自治体もあります。",
    "被害の規模が違えば必要な対応も時期も変わります。並び順は発信量ではなく、県が計上した断水のピーク戸数の順です。対応の優劣を示すものではありません。"
  ]
};

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(output)}\n`);

console.log(`対応の流れ: ${TRACKS.length}系統 / 節目${output.totals.milestoneCount}件 / 発信${publications.length}件 / ${output.totals.municipalityCount}市町村`);
for (const track of TRACKS) {
  const count = publications.filter(item => item.tracks.includes(track.id)).length;
  const marks = [...milestones.values()].flat().filter(item => item.trackId === track.id).length;
  console.log(`  ${track.label.padEnd(10)} 発信${String(count).padStart(3)}件 / 節目${String(marks).padStart(3)}件`);
}
