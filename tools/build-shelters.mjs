#!/usr/bin/env node
// 熊本県「防災情報くまもと」の避難所JSONから shelters-data.js を生成する。
//
//   node tools/build-shelters.mjs
//   node tools/build-shelters.mjs source-files/official/kumamoto-open-shelters-20260805-1156.json
//   node tools/build-shelters.mjs --check          … 上書きせず差分の有無だけ確認
//   node tools/build-shelters.mjs --retrieved-at=2026-08-05T11:56:22+09:00
//
// 抽出条件: 開設日時があり閉鎖日時が空欄（＝開設中）で、data.js の対象21市町村に属する施設。
// 施設ごとの会議補足は tools/shelter-supplements.json（手編集）から取り込む。

import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const officialDir = path.join(root, "source-files", "official");
const outPath = path.join(root, "shelters-data.js");
const supplementsPath = path.join(root, "tools", "shelter-supplements.json");

const SOURCE_NAME = "熊本県「防災情報くまもと」避難所情報";
const SOURCE_URL = "https://portal.bousai.pref.kumamoto.jp/?p=evacuation/shelter";
const DATA_URL = "https://portal.bousai.pref.kumamoto.jp/data/shelter/shelter.json";

const args = process.argv.slice(2);
const check = args.includes("--check");
const retrievedAtArg = args.find(a => a.startsWith("--retrieved-at="))?.slice("--retrieved-at=".length);
const inputArg = args.find(a => !a.startsWith("--"));

const die = msg => { console.error(`エラー: ${msg}`); process.exit(1); };

// --- 入力ファイルの決定（未指定ならファイル名の日時が最も新しいもの） ---
const resolveInput = async () => {
  if (inputArg) return path.resolve(root, inputArg);
  let names;
  try {
    names = (await readdir(officialDir))
      .filter(n => /^kumamoto-open-shelters-\d{8}-\d{4}\.json$/.test(n))
      .sort();
  } catch {
    die(`${path.relative(root, officialDir)} を読めません。県データを保存してから実行してください。`);
  }
  if (!names.length) die("kumamoto-open-shelters-YYYYMMDD-HHMM.json が見つかりません。README の取得手順を参照してください。");
  return path.join(officialDir, names.at(-1));
};

// --- 取得時刻: 明示指定 > ファイル名の YYYYMMDD-HHMM ---
const resolveRetrievedAt = file => {
  if (retrievedAtArg) return retrievedAtArg;
  const m = path.basename(file).match(/(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})/);
  if (!m) die(`ファイル名から取得時刻を読み取れません: ${path.basename(file)}\n  --retrieved-at=2026-08-05T11:56:00+09:00 の形式で指定してください。`);
  const [, y, mo, d, h, mi] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:00+09:00`;
};

// --- data.js から対象21市町村を読む（名簿を二重管理しないため） ---
const loadMunicipalities = async () => {
  const src = await readFile(path.join(root, "data.js"), "utf8");
  const shim = {};
  new Function("window", src)(shim);
  const list = shim.REPORT_DATA?.municipalities;
  if (!Array.isArray(list) || !list.length) die("data.js から municipalities を読み取れませんでした。");
  return new Set(list.map(m => m.name));
};

const loadSupplements = async () => {
  try {
    return JSON.parse(await readFile(supplementsPath, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return {};
    die(`${path.relative(root, supplementsPath)} を解析できません: ${e.message}`);
  }
};

const isOpen = i => Boolean(i.shelterStartTimestamp) && !i.shelterEndTimestamp;
const toIso = ts => `${ts.replace(" ", "T")}+09:00`;

const toFeature = (i, supplements) => {
  const f = {
    id: i.facilityId,
    name: i.name,
    address: i.address,
    municipality: i.municipalityName,
    lat: Number(i.latitude),
    lng: Number(i.longitude),
    openedAt: toIso(i.shelterStartTimestamp),
    // 県データは未設定を 0 で返すため、0 は「収容人数不明」として null に倒す
    capacity: i.capacity || null,
    crowdedStatus: i.crowdedStatus,
    designation: {
      emergency: i.edesignatedEvacShFlg === "1",  // 指定緊急避難場所
      shelter: i.designatedEvacShFlg === "1",     // 指定避難所
      welfare: i.welfareEvacShFlg === "1",        // 福祉避難所
      temporary: i.temporaryEvacShFlg === "1"     // 一時避難所
    }
  };
  const notes = supplements[i.facilityId];
  if (notes?.length) f.supplements = notes;
  return f;
};

const main = async () => {
  const input = await resolveInput();
  const retrievedAt = resolveRetrievedAt(input);
  const [raw, municipalities, supplements] = await Promise.all([
    readFile(input, "utf8").then(JSON.parse).catch(e => die(`${path.relative(root, input)} を読めません: ${e.message}`)),
    loadMunicipalities(),
    loadSupplements()
  ]);

  const items = raw.items;
  if (!Array.isArray(items)) die("県データに items 配列がありません。取得したファイルを確認してください。");

  const open = items.filter(isOpen);
  const features = open.filter(i => municipalities.has(i.municipalityName)).map(i => toFeature(i, supplements));

  if (!features.length) die("開設中の施設が0件でした。取得したファイルが空でないか確認してください。");

  const missingCoords = features.filter(f => !Number.isFinite(f.lat) || !Number.isFinite(f.lng));
  if (missingCoords.length) {
    console.warn(`警告: 緯度経度が不正な施設が ${missingCoords.length} 件あります（地図に出ません）:`);
    for (const f of missingCoords) console.warn(`  ${f.id} ${f.name}`);
  }

  const known = new Set(features.map(f => f.id));
  const orphans = Object.keys(supplements).filter(id => !known.has(id));
  if (orphans.length) {
    console.warn(`警告: shelter-supplements.json の次のIDは今回の開設中データに存在しません（閉鎖済みか、IDの誤りです）:`);
    for (const id of orphans) console.warn(`  ${id}`);
  }

  const payload = {
    metadata: {
      title: "令和8年熊本地震 開設中避難所",
      source: SOURCE_NAME,
      sourceUrl: SOURCE_URL,
      dataUrl: DATA_URL,
      retrievedAt,
      criterion: "県公式データで開設日時があり、閉鎖日時が空欄の施設",
      scope: "本サイト対象21市町村のうち、県公式データで開設中と確認できた施設",
      warning: "開設状況は変わる可能性があります。支援活動前に県・各自治体の最新情報を再確認してください。"
    },
    features
  };
  const out = `window.SHELTER_DATA=${JSON.stringify(payload)};\n`;

  const before = await readFile(outPath, "utf8").catch(() => null);
  const withNotes = features.filter(f => f.supplements).length;
  const summary = [
    `入力       ${path.relative(root, input)}`,
    `取得時刻   ${retrievedAt}`,
    `開設中     ${open.length}件（うち対象21市町村 ${features.length}件）`,
    `会議補足   ${withNotes}件`
  ].join("\n");

  if (check) {
    console.log(summary);
    console.log(before === out ? "\nshelters-data.js は最新です。" : "\nshelters-data.js に差分があります（--check なので書き込んでいません）。");
    process.exit(before === out ? 0 : 1);
  }

  await writeFile(outPath, out);
  console.log(summary);
  console.log(before === out ? "\nshelters-data.js は変更なし。" : `\nshelters-data.js を更新しました（${out.length.toLocaleString("ja-JP")} バイト）。`);
};

main();
