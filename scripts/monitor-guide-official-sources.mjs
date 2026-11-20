#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CONFIG_PATH = path.join(ROOT, "sources/guide-official-watch.json");
const REPORT_PATH = path.join(ROOT, "reports/guide-official-watch.json");

const checkMode = process.argv.includes("--check");
const CONCURRENCY = Math.max(1, Number(process.env.GUIDE_WATCH_CONCURRENCY || 2));
const TIMEOUT_MS = 15000;

const IMPORTANT_LINE_RE =
  /(期限|受付|期間|時間|閉鎖|終了|延長|変更|仮置場|窓口|土曜|日曜|祝日|開庁|休業|様式|証明書|原本|予約|自費|公費|契約|相談|撤去|解体|応急|修理|仮設|募集|令和[0-9０-９]+年|202[6-9]年)/;
const UPDATED_DATE_RE =
  /(?:更新日|最終更新|公開日)?[：:\s]*(?:202[6-9]年[0-9]{1,2}月[0-9]{1,2}日|令和[0-9]+年[0-9]{1,2}月[0-9]{1,2}日)\s*(?:更新|現在)?/;

const decodeEntities = (text) =>
  text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

const extractSignals = (html) => {
  // ナビゲーション・スクリプト・スタイルを除去して本文ノイズを減らす
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "\n")
    .replace(/<(?:nav|header|footer)[\s\S]*?<\/(?:nav|header|footer)>/gi, "\n");

  const text = decodeEntities(cleaned.replace(/<[^>]+>/g, "\n"));
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 4 && line.length <= 300);

  const updatedMatch = lines.find((line) => /更新|現在/.test(line) && UPDATED_DATE_RE.test(line));
  const updatedLabel = updatedMatch ? updatedMatch.match(UPDATED_DATE_RE)?.[0]?.trim() || updatedMatch : null;

  const keyLines = [];
  const seen = new Set();
  for (const line of lines) {
    if (!IMPORTANT_LINE_RE.test(line)) continue;
    // 共通ナビゲーション語句・翻訳リンクを除外
    if (/^(メニュー|本文へ|Foreign Language|検索|ホーム|トップページ)/.test(line)) continue;
    if (seen.has(line)) continue;
    seen.add(line);
    keyLines.push(line);
    if (keyLines.length >= 120) break;
  }

  const payload = JSON.stringify({ updatedLabel, keyLines });
  const fingerprint = crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16);
  return { updatedLabel, keyLines, fingerprint };
};

const fetchTarget = async (target) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(target.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; YokataiNetKumamoto-OfficialMonitor/1.0; +https://www.yokatainet.jp/)",
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en;q=0.5"
      }
    });
    if (!res.ok) {
      return { ok: false, status: res.status, reason: `HTTP ${res.status}` };
    }
    const html = await res.text();
    const signals = extractSignals(html);
    if (signals.keyLines.length === 0) {
      return { ok: false, status: res.status, reason: "本文の重要行を抽出できませんでした" };
    }
    return { ok: true, status: res.status, ...signals };
  } catch (err) {
    return { ok: false, status: 0, reason: err?.message || "fetch error" };
  } finally {
    clearTimeout(timer);
  }
};

const runPool = async (items, worker, limit) => {
  const results = new Array(items.length);
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
};

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const prevReport = fs.existsSync(REPORT_PATH)
  ? JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"))
  : { targets: {} };

const fetched = await runPool(config.targets, fetchTarget, CONCURRENCY);
const nowIso = new Date().toISOString();

const nextTargets = {};
const changed = [];
const unavailable = [];

for (let i = 0; i < config.targets.length; i++) {
  const target = config.targets[i];
  const result = fetched[i];
  const prev = prevReport.targets?.[target.id];

  if (!result.ok) {
    unavailable.push({ id: target.id, municipality: target.municipality, url: target.url, reason: result.reason });
    // 取得不能時は前回のスナップショットを維持し、誤って変更扱いしない
    nextTargets[target.id] = prev
      ? { ...prev, lastAttemptAt: nowIso, lastAttemptStatus: result.reason }
      : {
          municipality: target.municipality,
          title: target.title,
          url: target.url,
          guidePages: target.guidePages,
          status: "unavailable",
          lastAttemptAt: nowIso,
          lastAttemptStatus: result.reason
        };
    continue;
  }

  if (prev && prev.fingerprint && prev.fingerprint !== result.fingerprint) {
    const prevSet = new Set(prev.keyLines || []);
    const currSet = new Set(result.keyLines);
    const added = result.keyLines.filter((l) => !prevSet.has(l)).slice(0, 12);
    const removed = (prev.keyLines || []).filter((l) => !currSet.has(l)).slice(0, 12);
    changed.push({
      id: target.id,
      municipality: target.municipality,
      title: target.title,
      url: target.url,
      guidePages: target.guidePages,
      prevUpdatedLabel: prev.updatedLabel || null,
      currUpdatedLabel: result.updatedLabel || null,
      added,
      removed
    });
  }

  nextTargets[target.id] = {
    municipality: target.municipality,
    title: target.title,
    url: target.url,
    guidePages: target.guidePages,
    status: "ok",
    checkedAt: nowIso,
    updatedLabel: result.updatedLabel,
    fingerprint: result.fingerprint,
    keyLines: result.keyLines
  };
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      checkedAt: nowIso,
      totalTargets: config.targets.length,
      changedCount: changed.length,
      unavailableCount: unavailable.length,
      targets: nextTargets
    },
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(`公式一次情報監視完了: 対象${config.targets.length}件 / 変更検出${changed.length}件 / 取得不能${unavailable.length}件`);

if (unavailable.length > 0) {
  console.log("\n[取得不能（WAF等によるスキップ・誤報防止のため変更なし扱い）]");
  for (const u of unavailable) {
    console.log(`- ${u.municipality} (${u.id}): ${u.reason} | ${u.url}`);
  }
}

if (changed.length > 0) {
  console.log("\n[重要変更を検出した公式ページ]");
  for (const c of changed) {
    console.log(`\n■ ${c.municipality} - ${c.title}`);
    console.log(`  公式URL: ${c.url}`);
    console.log(`  対応ガイドページ: ${c.guidePages.join(", ")}`);
    console.log(`  更新日表示: ${c.prevUpdatedLabel || "(なし)"} -> ${c.currUpdatedLabel || "(なし)"}`);
    if (c.added.length) {
      console.log("  + 追加・変更された行:");
      for (const line of c.added) console.log(`    + ${line}`);
    }
    if (c.removed.length) {
      console.log("  - 削除・変更前の行:");
      for (const line of c.removed) console.log(`    - ${line}`);
    }
  }
  if (checkMode) process.exit(1);
}
