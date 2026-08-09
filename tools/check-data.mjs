#!/usr/bin/env node
// 公開前の高信頼チェック。外部通信やファイル変更は行わない。

import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const loadWindowData = async (file, key) => {
  const window = {};
  new Function("window", await readFile(path.join(root, file), "utf8"))(window);
  if (!window[key]) throw new Error(`${file} に window.${key} がありません`);
  return window[key];
};
const exists = async file => access(path.join(root, file)).then(() => true, () => false);
const unique = (rows, key, label) => {
  const seen = new Set();
  for (const row of rows) {
    const value = key(row);
    if (seen.has(value)) errors.push(`${label} が重複: ${value}`);
    seen.add(value);
  }
};

const report = await loadWindowData("data/report-data.js", "REPORT_DATA");
const minutes = await loadWindowData("data/minutes-data.js", "MINUTES_DATA");
const shelters = await loadWindowData("data/generated/shelters-data.js", "SHELTER_DATA");
const municipalityUpdates = await loadWindowData("data/generated/municipality-updates.js", "MUNICIPALITY_UPDATES");
const officialTopics = await loadWindowData("data/generated/official-topics.js", "OFFICIAL_TOPICS");
const shelterAgeHours = (Date.now() - new Date(shelters.metadata.retrievedAt).getTime()) / 36e5;
if (shelterAgeHours > 6) warnings.push(`避難所データの取得から${Math.floor(shelterAgeHours)}時間経過。公開前に県公式JSONを再取得してください`);
const municipalityNames = new Set(report.municipalities.map(m => m.name));
const updateMunicipalityNames = new Set(municipalityUpdates.municipalities.map(m => m.name));
const supportKeys = new Set(report.supportCategories.map(c => c.key));
const sectionKeys = new Set(minutes.sectionDefs.map(s => s.key));
const themeKeys = new Set(minutes.themes.map(t => t.key));

unique(report.days, d => d.date, "会議日");
unique(report.days, d => d.meeting, "会議番号");
unique(minutes.meetings, m => m.meeting, "構造化議事録の会議番号");
unique(shelters.features, f => f.id, "避難所施設ID");
unique(municipalityUpdates.municipalities, m => m.name, "公式発信の自治体名");
for (const name of municipalityNames) if (!updateMunicipalityNames.has(name)) errors.push(`公式発信データに自治体がない: ${name}`);
for (const municipality of municipalityUpdates.municipalities) {
  if (!municipalityNames.has(municipality.name)) errors.push(`公式発信データに対象外自治体: ${municipality.name}`);
  unique(municipality.updates, update => update.url, `${municipality.name}の公式発信URL`);
  for (const update of municipality.updates) {
    if (update.date < municipalityUpdates.metadata.disasterDate) errors.push(`${municipality.name}の発信日が発災前: ${update.date}`);
    const officialHost = new URL(municipality.officialUrl).hostname.replace(/^www\./, "");
    const updateHost = new URL(update.url).hostname.replace(/^www\./, "");
    if (updateHost !== officialHost && !updateHost.endsWith(`.${officialHost}`)) errors.push(`${municipality.name}の非公式URL: ${update.url}`);
  }
}
if (!officialTopics.national.length) errors.push("国の最新トピックスがありません");
if (!officialTopics.prefecture.length) errors.push("県の最新トピックスがありません");
for (const topic of [...officialTopics.national, ...officialTopics.prefecture, ...officialTopics.municipalities]) {
  if (!/^https:\/\//.test(topic.url)) errors.push(`トピックスURLが不正: ${topic.url}`);
  if (!/^2026-(07|08)-\d{2}$/.test(topic.date)) errors.push(`トピックス日付が不正: ${topic.title}`);
}

for (const day of report.days) {
  if (!(await exists(day.pdf))) errors.push(`会議PDFがない: ${day.pdf}`);
  const minutesDay = minutes.meetings.find(m => m.meeting === day.meeting);
  if (!minutesDay) errors.push(`構造化議事録がない: 第${day.meeting}回`);
  if (minutesDay && minutesDay.date !== day.date) errors.push(`日付不一致: 第${day.meeting}回`);
  const officialFile = `sources/official/hq-damage/${day.date.replaceAll("-", "")}-1400.json`;
  if (await exists(officialFile)) {
    const official = JSON.parse(await readFile(path.join(root, officialFile), "utf8"));
    const homes = official.totals.homesTotal ?? official.totals.homes;
    for (const [siteKey, officialValue] of [
      ["evacuees", official.totals.evacuees], ["shelters", official.totals.shelters],
      ["homes", homes], ["waterOutages", official.totals.waterOutages]
    ]) {
      if (day.stats[siteKey] != null && officialValue != null && day.stats[siteKey] !== officialValue) {
        errors.push(`${day.date} ${siteKey}: 火の国会議 ${day.stats[siteKey]} / 県公式 ${officialValue}`);
      }
    }
  }
}

for (const event of [...report.municipalEvents, ...report.supportEvents]) {
  if (!(await exists(event.pdf))) errors.push(`イベントのPDFがない: ${event.pdf}`);
  if (!Number.isInteger(event.page) || event.page < 1) errors.push(`ページ番号が不正: 第${event.meeting}回`);
  for (const area of event.areas || []) if (!municipalityNames.has(area)) errors.push(`対象外自治体名: ${area}`);
}
for (const event of report.supportEvents) if (!supportKeys.has(event.category)) errors.push(`不明な支援分類: ${event.category}`);

for (const meeting of minutes.meetings) {
  if (!(await exists(meeting.pdf))) errors.push(`議事録PDFがない: ${meeting.pdf}`);
  const { attendance } = meeting;
  if (attendance.total != null && attendance.onsite != null && attendance.online != null &&
      attendance.total !== attendance.onsite + attendance.online && !meeting.attendanceNote) {
    errors.push(`参加人数の不一致に注記がない: 第${meeting.meeting}回`);
  }
  for (const section of meeting.sections) {
    if (!sectionKeys.has(section.key)) errors.push(`不明な議事録section: ${section.key}`);
    if (section.page > meeting.pages) errors.push(`ページ上限超過: 第${meeting.meeting}回 p.${section.page}`);
    for (const group of section.groups || []) {
      if (group.page > meeting.pages) errors.push(`ページ上限超過: 第${meeting.meeting}回 p.${group.page}`);
      if (group.theme && !themeKeys.has(group.theme)) errors.push(`不明な分野theme: ${group.theme}`);
    }
  }
}

for (const shelter of shelters.features) {
  if (!municipalityNames.has(shelter.municipality)) errors.push(`避難所が対象外自治体: ${shelter.name}`);
  if (!Number.isFinite(shelter.lat) || !Number.isFinite(shelter.lng)) errors.push(`避難所の座標が不正: ${shelter.name}`);
}

// Search Console verification files must remain the exact token response and are
// not content pages, so site-wide branding/link checks do not apply to them.
const htmlFiles = (await readdir(root)).filter(f => f.endsWith(".html") && !/^google[\w-]+\.html$/i.test(f));
for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), "utf8");
  if (!/<script\s+src="org-site\.js(?:\?[^\"]*)?"/.test(html)) errors.push(`${file} で共通スクリプト org-site.js が読み込まれていません`);
  if (!html.includes("よか隊ネット熊本　災害・支援状況レポート")) errors.push(`${file} のサイト名称が新名称に統一されていません`);
  if (html.includes("よか隊ネット災害支援レポート")) errors.push(`${file} に直前のサイト名称が残っています`);
  if (html.includes("火の国 災害支援レポート")) errors.push(`${file} に旧サイト名称が残っています`);
  for (const match of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const target = decodeURIComponent(match[1]);
    if (target && !/^(https?:|mailto:|tel:)/.test(target) && !(await exists(target))) {
      errors.push(`${file} のローカルリンク切れ: ${target}`);
    }
  }
}

const sharedSiteScript = await readFile(path.join(root, "org-site.js"), "utf8");
if (!sharedSiteScript.includes("G-ZPDRHTGZCR")) errors.push("org-site.js にGoogleタグが設定されていません");

const appSource = await readFile(path.join(root, "app.js"), "utf8");
if (appSource.includes("<span>負傷者</span>")) errors.push("人的被害総数を『負傷者』と表示する旧コードが残っています");
if (!appSource.includes("archive-source-policy")) errors.push("全ページ共通の一次情報・アーカイブ注意書きがありません");

console.log(`会議 ${report.days.length}日分 / 自治体イベント ${report.municipalEvents.length}件 / 支援イベント ${report.supportEvents.length}件`);
console.log(`構造化議事録 ${minutes.meetings.length}回分 / 開設中避難所 ${shelters.features.length}件`);
console.log(`市町村公式発信 ${municipalityUpdates.municipalities.reduce((n, m) => n + m.updates.length, 0)}件 / ${municipalityUpdates.municipalities.length}市町村`);
for (const warning of warnings) console.warn(`警告: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`エラー: ${error}`);
  process.exit(1);
}
console.log("検査OK（重複・参照・分類・ページ・県公式集計との整合を確認）");
