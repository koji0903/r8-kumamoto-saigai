#!/usr/bin/env node
// 掲載カバー率モニタ（scripts/monitor-living-support-coverage.mjs）の設定と判定ロジックの検査。
// ネットワークアクセスはしない。

import assert from "node:assert/strict";
import fs from "node:fs";
import {
  applyCandidateStatuses, buildReport, classifyCandidate, cleanTitle, configPath, diffReports, formatSummary,
  extractCandidates, indexEntry, isDeadStatus, isProgramTitle, normalizeTitle, readCards, readJson, reportPath, urlKey
} from "./living-support-coverage.mjs";

console.log("暮らしの支援ガイド 掲載カバー率モニタのテスト開始");

// 1. 設定ファイル
const config = readJson(configPath);
assert.equal(config.schemaVersion, "1.0.0", "設定のschemaVersionが想定と異なります");
assert.equal(config.municipalities.length, 4, "監視対象は4市町です");
for (const municipality of config.municipalities) {
  for (const key of ["id", "name", "page", "origin", "indexes"]) {
    assert.ok(municipality[key], `${municipality.id || "?"}：${key} がありません`);
  }
  assert.ok(fs.existsSync(municipality.page), `${municipality.name}：${municipality.page} がありません`);
  assert.ok(municipality.indexes.length >= 5, `${municipality.name}：索引URLが少なすぎます`);
  for (const index of municipality.indexes) {
    const { url } = indexEntry(index);
    assert.ok(url.startsWith(municipality.origin), `${municipality.name}：索引URLのドメインが不正です（${url}）`);
  }
  assert.ok(municipality.indexes.some(index => indexEntry(index).curated),
    `${municipality.name}：制度一覧（curated: true）の索引が登録されていません`);
  for (const file of municipality.siblingPages || []) {
    assert.ok(fs.existsSync(file), `${municipality.name}：姉妹ページ ${file} がありません`);
  }
  const cards = readCards(municipality.page);
  assert.ok(cards.length > 0, `${municipality.name}：カードを抽出できません`);
  assert.ok(cards.every(card => card.title), `${municipality.name}：タイトルのないカードがあります`);
}
for (const item of config.known || []) {
  assert.ok(item.title && item.reason, "known には title と reason が必要です");
}
console.log("設定ファイル OK");

// 2. タイトル正規化と制度判定
assert.equal(normalizeTitle("令和8年度 生ごみ処理容器等購入補助金のお知らせ"), normalizeTitle("生ごみ処理容器等購入補助金"), "年度表記の揺れを吸収できていません");
assert.equal(normalizeTitle("【住まい】住宅リフォーム等促進事業"), normalizeTitle("住宅リフォーム等促進事業"), "【】の除去ができていません");
assert.ok(isProgramTitle("児童扶養手当制度"), "制度名を制度として判定できていません");
assert.ok(!isProgramTitle("ホーム"), "ナビゲーションを制度として拾っています");
assert.ok(!isProgramTitle("市の紹介"), "制度語を含まない項目を拾っています");
// curated（自治体が作った制度一覧）では補助・助成の語がない制度名も拾う。
const curatedUrl = "https://www.town.hikawa.kumamoto.jp/ijuu/kiji0034072/index.html";
assert.ok(isProgramTitle("【住まい】住宅リフォーム等促進事業", { curated: true, url: curatedUrl }), "curatedで制度名を拾えていません");
assert.ok(!isProgramTitle("【住まい】住宅リフォーム等促進事業"), "curated以外で語を含まない制度名を拾っています");
assert.ok(!isProgramTitle("支援制度一覧", { curated: true, url: "https://www.town.hikawa.kumamoto.jp/ijuu/list00812.html" }), "curatedで一覧ページを拾っています");
assert.equal(normalizeTitle("令和８年度より「子ども・子育て支援金制度」がはじまります").includes("子ども子育て支援金"), true, "全角数字の年度表記を正規化できていません");
assert.equal(cleanTitle("キーワードマッチ 2025年12月03日 不足額給付"), "不足額給付", "索引の日付・ラベルを除去できていません");
assert.equal(cleanTitle("令和8年度合併処理浄化槽設置事業補助金制度について～西..."), "令和8年度合併処理浄化槽設置事業補助金制度について～西", "末尾の省略記号を除去できていません");
// 同じ記事がカテゴリ違いのURLで出てきても同一視する。
assert.equal(urlKey("https://www.city.uto.lg.jp/article/view/1240/245.html"), urlKey("https://www.city.uto.lg.jp/article/view/1243/245.html"), "宇土市の記事IDで同一視できていません");
assert.equal(urlKey("https://www.city.yatsushiro.lg.jp/bousai/kiji00324914/index.html"), urlKey("https://www.city.yatsushiro.lg.jp/kiji00324914/index.html"), "八代市の記事IDで同一視できていません");
assert.equal(urlKey("https://www.city.uki.kumamoto.jp/kurashi/kankyo/gomi/2474281"), urlKey("https://www.city.uki.kumamoto.jp/kurashi/sumai/2474281"), "宇城市の記事IDで同一視できていません");
console.log("正規化・制度判定 OK");

// 3. 候補抽出
const sampleHtml = `
  <a href="/kiji0001/index.html">【住まい】住宅リフォーム等促進事業</a>
  <a href="/kiji0003/index.html">こども医療費助成事業</a>
  <a href="https://example.com/out">外部の補助金</a>
  <a href="/kiji0002/index.html">サイトマップ</a>
  <a href="javascript:void(0)">助成のご案内</a>
`;
const options = { indexUrl: "https://www.town.hikawa.kumamoto.jp/list.html", origin: "https://www.town.hikawa.kumamoto.jp" };
const plain = extractCandidates(sampleHtml, options);
assert.equal(plain.length, 1, "通常索引の候補抽出の件数が想定と異なります");
assert.equal(plain[0].url, "https://www.town.hikawa.kumamoto.jp/kiji0003/index.html", "相対URLを絶対化できていません");
const candidates = extractCandidates(sampleHtml, { ...options, curated: true });
assert.equal(candidates.length, 2, "curated索引の候補抽出の件数が想定と異なります");
console.log("候補抽出 OK");

// 4. 掲載判定
const context = {
  cards: [{ title: "氷川町住宅リフォーム等促進事業", links: ["https://www.town.hikawa.kumamoto.jp/kiji0001/index.html"] }],
  cardUrls: new Set(["https://www.town.hikawa.kumamoto.jp/kiji0001/index.html"]),
  siblingTexts: [{ file: "hikawa-support.html", text: 'href="https://www.town.hikawa.kumamoto.jp/kiji0009/index.html"' }],
  knownKeys: new Set([normalizeTitle("保育園・幼稚園について")])
};
assert.equal(classifyCandidate({ title: "住宅リフォーム等促進事業", url: "https://www.town.hikawa.kumamoto.jp/kiji0001/index.html" }, context).coverage, "listed", "掲載済みを未掲載と判定しています");
assert.equal(classifyCandidate({ title: "保育園・幼稚園について", url: "https://www.town.hikawa.kumamoto.jp/kiji0002/index.html" }, context).coverage, "known", "対象外登録が効いていません");
assert.equal(classifyCandidate({ title: "新しい助成金", url: "https://www.town.hikawa.kumamoto.jp/kiji0009/index.html" }, context).coverage, "sibling", "姉妹ページ掲載を判定できていません");
assert.equal(classifyCandidate({ title: "まだ無い補助金", url: "https://www.town.hikawa.kumamoto.jp/kiji0099/index.html" }, context).coverage, "unlisted", "未掲載を判定できていません");
assert.equal(classifyCandidate({ title: "令和8年度「保育園・幼稚園について」のお知らせ", url: "https://www.town.hikawa.kumamoto.jp/kiji0003/index.html" }, context).coverage, "known", "known の部分一致が効いていません");
console.log("掲載判定 OK");

// 5. レポート組み立てと差分
const report = buildReport({ config, fetched: new Map(), now: "2026-09-22T00:00:00+09:00", deadLinks: [] });
assert.equal(report.municipalities.length, 4, "レポートの自治体数が想定と異なります");
assert.ok(report.summary.cardCount > 100, "レポートの掲載件数が想定より少なすぎます");
assert.equal(report.summary.indexErrorCount, config.municipalities.reduce((total, m) => total + m.indexes.length, 0), "索引未取得時はすべて取得失敗として数えます");
assert.equal(report.summary.unlistedCount, 0, "索引未取得時は未掲載を0件として扱います");

const diff = diffReports(
  { municipalities: [{ id: "uki", unlisted: [{ url: "https://example.com/a" }] }], deadLinks: [] },
  { municipalities: [{ id: "uki", name: "宇城市", unlisted: [{ title: "A", url: "https://example.com/a" }, { title: "B", url: "https://example.com/b" }] }], deadLinks: [{ page: "uki-living-support.html", url: "https://example.com/dead", status: 404 }] }
);
assert.equal(diff.newUnlisted.length, 1, "新規の未掲載制度の抽出が想定と異なります");
assert.equal(diff.newUnlisted[0].title, "B", "新規判定の対象が誤っています");
assert.equal(diff.newDeadLinks.length, 1, "新規のリンク切れの抽出が想定と異なります");
console.log("レポート・差分 OK");

// 6. 候補URLの死活反映
const statusReport = applyCandidateStatuses({
  municipalities: [{ id: "uto", name: "宇土市", unlisted: [
    { title: "生きている制度", url: "https://example.com/alive" },
    { title: "消えた制度", url: "https://example.com/gone" }
  ] }],
  summary: {}
}, new Map([["https://example.com/alive", 200], ["https://example.com/gone", 404]]));
assert.equal(statusReport.summary.unlistedCount, 1, "死んだ候補を未掲載から除けていません");
assert.equal(statusReport.summary.staleCandidateCount, 1, "死んだ候補を staleCandidates に移せていません");
assert.equal(statusReport.municipalities[0].staleCandidates[0].status, 404, "staleCandidates にステータスを残せていません");
console.log("候補URLの死活反映 OK");

// 6.5 リンク状態の分類（WAFの403をリンク切れと誤報しない）
assert.equal(isDeadStatus(404), true, "404はリンク切れです");
assert.equal(isDeadStatus(410), true, "410はリンク切れです");
assert.equal(isDeadStatus(0), true, "接続失敗はリンク切れとして扱います");
for (const status of [403, 429, 500, 503]) {
  assert.equal(isDeadStatus(status), false, `${status} はリンク切れではなく判定不能として扱います`);
}
const blockedReport = buildReport({
  config, fetched: new Map(), now: "2026-09-22T00:00:00+09:00",
  deadLinks: [{ page: "uto-support.html", url: "https://example.com/gone", status: 404 }],
  blockedLinks: [{ page: "uto-support.html", url: "https://example.com/blocked", status: 403 }],
  indexErrorDetails: [{ url: "https://example.com/index", status: 403 }]
});
assert.equal(blockedReport.summary.deadLinkCount, 1, "リンク切れの件数が想定と異なります");
assert.equal(blockedReport.summary.blockedLinkCount, 1, "判定不能なリンクを分離できていません");
assert.ok(formatSummary(blockedReport).includes("判定不能"), "サマリーに判定不能なリンクを表示していません");
assert.ok(formatSummary(blockedReport).includes("索引の取得に失敗"), "サマリーに索引の取得失敗を表示していません");
console.log("リンク状態の分類 OK");

// 7. 監視Workflow
const workflow = fs.readFileSync(".github/workflows/monitor-living-support-coverage.yml", "utf8");
for (const text of [
  'cron: "5 20 1 * *"', "workflow_dispatch:", "dry_run:", "contents: write", "issues: write",
  "concurrency:", "cancel-in-progress: false", "timeout-minutes: 30",
  "scripts/monitor-living-support-coverage.mjs --check", "reports/living-support-coverage.json",
  "GITHUB_STEP_SUMMARY", "gh issue create", "git fetch origin main", "git rebase origin/main",
  "COVERAGE_MONITOR_CONCURRENCY",
  "git push origin HEAD:main", "for attempt in 1 2 3", "inputs.dry_run != true"
]) {
  assert.ok(workflow.includes(text), `監視Workflowに ${text} が必要です`);
}
assert.equal(/push[^\n]*--force|push[^\n]*\s-f\b/.test(workflow), false, "force pushは禁止です");
assert.ok(!/\t/.test(workflow), "監視Workflowにタブ文字が含まれています");
console.log("監視Workflow OK");

// 8. レポートの生成物（あればスキーマを確認）
if (fs.existsSync(reportPath)) {
  const saved = readJson(reportPath);
  assert.equal(saved.schemaVersion, "1.0.0", "保存済みレポートのschemaVersionが想定と異なります");
  assert.ok(Array.isArray(saved.municipalities) && saved.municipalities.length === 4, "保存済みレポートの自治体数が想定と異なります");
  assert.ok(saved.generatedAt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(saved.generatedAt), "保存済みレポートのgeneratedAtがJST表記ではありません");
  console.log("保存済みレポート OK");
}

console.log("暮らしの支援ガイド 掲載カバー率モニタのテスト 全て合格");
