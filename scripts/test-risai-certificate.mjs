import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('り災証明書ガイド テスト開始');

const html = fs.readFileSync('risai-certificate.html', 'utf8');

assert.ok(html.includes('<!-- RISAI_ALERT_START -->'), 'り災証明書の期限アラートマーカーがありません');
assert.ok(html.includes('<!-- RISAI_ALERT_END -->'), 'り災証明書の期限アラート終了マーカーがありません');
assert.ok(html.includes('<!-- RISAI_UPDATES_START -->'), 'り災証明書の最新発表マーカーがありません');
assert.ok(html.includes('<!-- RISAI_UPDATES_END -->'), 'り災証明書の最新発表終了マーカーがありません');
assert.ok(html.includes('<!-- RISAI_CONFIRMED_DATE_START -->'), '確認日マーカーがありません');
assert.ok(html.includes('自治体公式発表 連動更新中'), '自動収集連動バッジがありません');
assert.ok(html.includes('益城町'), '益城町の期限注意がありません');
assert.ok(html.includes('八代市'), '八代市の申請終了注意がありません');
assert.ok(html.includes('href="#risai-official-updates"'), '最新発表へのジャンプリンクがありません');

console.log('り災証明書ガイド テスト OK');
