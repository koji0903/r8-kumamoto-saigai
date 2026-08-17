#!/usr/bin/env node
// お知らせの受け取り方（公式LINE・メール配信・防災行政無線・アプリ）を公開用に整える。
//
//   node scripts/build-alert-channels.mjs
//
// 配信された本文はこのサイトでは扱わない。LINEの配信は友だちのトーク画面に
// だけ届き、第三者が読む手段がないため。ここで配るのは受け取り方だけ。
// 出典URLと確認日を必ず持たせ、確認できなかった市町村は空のまま公開して
// 「未確認」と示す（手段が無いことにしない）。

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = join(ROOT, "public-data/reconstruction/alert-channels.json");

const source = JSON.parse(await readFile(join(ROOT, "data/reconstruction/municipality-alert-channels.json"), "utf8"));
const master = JSON.parse(await readFile(join(ROOT, "data/reconstruction/municipalities.json"), "utf8"));
const byId = new Map(master.map(item => [item.id, item]));

const errors = [];
const municipalities = source.municipalities.map(item => {
  const meta = byId.get(item.municipalityId);
  if (!meta) { errors.push(`未知の市町村: ${item.municipalityId}`); return null; }
  for (const channel of item.channels) {
    if (!source.channelTypes.some(type => type.id === channel.type)) errors.push(`${meta.name}: 未知の手段 ${channel.type}`);
    if (!channel.name?.trim()) errors.push(`${meta.name}: 手段の名称がありません`);
    // 出典なしでは載せない。推測で書いていないことの担保。
    if (!/^https:\/\//.test(channel.sourceUrl || "")) errors.push(`${meta.name}: ${channel.name} の出典URLがありません`);
    if (!channel.sourceLabel?.trim()) errors.push(`${meta.name}: ${channel.name} の出典名がありません`);
    if (channel.url && !/^https:\/\//.test(channel.url)) errors.push(`${meta.name}: ${channel.name} のリンクが不正です`);
  }
  return { ...item, municipalityName: meta.name, officialUrl: meta.officialUrl };
}).filter(Boolean);

for (const meta of master) {
  if (!municipalities.some(item => item.municipalityId === meta.id)) errors.push(`欠落: ${meta.name}`);
}
if (errors.length) {
  console.error(`生成を中止しました:\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

const output = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  confirmedAt: source.confirmedAt,
  note: source.note,
  channelTypes: source.channelTypes,
  municipalities,
  caveats: [
    "掲載しているのは受け取り方だけです。公式LINEで配信された本文は友だち登録した方のトーク画面にだけ届き、第三者が読む手段がないため、このサイトでは収集していません。",
    "各手段は、市町村の公式ページと、そこからのリンク先を1件ずつ開いて確認しました。LINEの追加先はアカウント名が一致することも確認しています。",
    source.limitation,
    "受付や登録の可否、配信される内容は変わることがあります。申し込む前にリンク先の公式ページで最新の案内をご確認ください。"
  ]
};

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(output)}\n`);

const counts = {};
for (const item of municipalities) for (const channel of item.channels) counts[channel.type] = (counts[channel.type] || 0) + 1;
const confirmed = municipalities.filter(item => item.channels.length).length;
console.log(`お知らせの受け取り方: ${confirmed}/${municipalities.length}市町村で確認 / ${Object.entries(counts).map(([k, v]) => `${k}${v}`).join(" ")}`);
console.log(`  未確認: ${municipalities.filter(item => !item.channels.length).map(item => item.municipalityName).join("・") || "なし"}`);
