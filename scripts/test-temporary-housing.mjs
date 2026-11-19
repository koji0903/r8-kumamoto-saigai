import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('仮設住宅・みなし仮設ガイド テスト開始');

const html = fs.readFileSync('temporary-housing.html', 'utf8');

assert.ok(html.includes('<!-- HOUSING_UPDATES_START -->'), '仮設住宅の自動更新マーカーがありません');
assert.ok(html.includes('<!-- HOUSING_UPDATES_END -->'), '仮設住宅の自動更新終了マーカーがありません');
assert.ok(html.includes('自治体公式発表 連動更新中'), '自動収集連動バッジがありません');
assert.ok(html.includes('自治体公式 仮設住宅・みなし仮設の最新募集・公表タイムライン'), '新着タイムライン見出しがありません');
assert.ok(html.includes('portal-updates-shell'), '公式タイムラインシェルがありません');
assert.ok(html.includes('href="#housing-official-updates"'), '最新発表へのジャンプリンクがありません');

console.log('仮設住宅・みなし仮設ガイド テスト OK');
