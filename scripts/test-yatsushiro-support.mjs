import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../yatsushiro-support.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../yatsushiro-support.js', import.meta.url), 'utf8');

const cards = [...html.matchAll(/<article data-category=/g)].length;
const items = [...html.matchAll(/<li><b>/g)].length;
const detailCards = [...html.matchAll(/<details(?: open)?>/g)].length;

assert.equal(cards, 7, '7分野で整理してください');
assert.equal(items, 54, '第7版の全54制度を掲載してください');
assert.equal(detailCards, 13, '条件の多い主要制度を13カードで詳しく説明してください');

const sourcePageLinks = [...html.matchAll(/160146_up_l7vhrdbl\.pdf#page=(\d+)/g)].map(match => Number(match[1]));
assert.equal(sourcePageLinks.length, 54, '全54制度からPDF該当ページへリンクしてください');
assert.equal(new Set(sourcePageLinks).size, 51, 'PDF内の実ページ対応が不正です');
assert.deepEqual(sourcePageLinks.slice(0, 4), [7, 8, 9, 10], '先頭制度のPDFページが不正です');
assert.deepEqual(sourcePageLinks.slice(-4), [59, 60, 61, 62], '末尾制度のPDFページが不正です');

for (const value of [
  '2026年9月21日現在',
  '第7版',
  '10月27日',
  '9月25日 16時',
  '10月8日',
  '9月28日',
  '建物の解体・撤去',
  '公費解体',
  '特別行政相談所',
  '営農再開ワンストップ窓口',
  '最大75万7千円',
  '最大36万7千円',
  '5万6,400円',
  '300万円',
  '単身 5.5万円',
  '5人以上 13万円',
  '2027年8月27日',
  '2029年8月27日',
  '33-8722',
  '33-4401',
  '33-4122',
  '37-7550',
  '160146_up_l7vhrdbl.pdf',
  '活用できる方',
  '制度の内容',
  '注意事項',
  '現金給付ではありません',
  '大家・所有者は対象外',
  '食費・居住費、差額ベッド代',
  '仲介手数料・保険料は遡及されません',
  '給付ではなく返済が必要',
  '申請不要です'
]) {
  assert.ok(html.includes(value), `重要情報がありません: ${value}`);
}

for (const value of ['name="damage"', 'name="condition"', 'aria-live="polite"', 'type="search"']) {
  assert.ok(html.includes(value), `UI要件がありません: ${value}`);
}

for (const value of ['damage===\'middle\'', 'getAll(\'condition\')']) {
  assert.ok(js.includes(value), `判定ロジックがありません: ${value}`);
}

assert.ok(html.includes('申請・契約・解体・修理代の支払い前'), '公式確認の注意がありません');

const appJs = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
assert.match(appJs, /"八代市":\{support:\[\["yatsushiro-support\.html"/, 'app.js の八代市サポートメニューに登録してください');

const hqYatsushiro = fs.readFileSync(new URL('../hq-yatsushiro.html', import.meta.url), 'utf8');
assert.ok(hqYatsushiro.includes('yatsushiro-support.html'), 'hq-yatsushiro.html からの導線が必要です');

const thHtml = fs.readFileSync(new URL('../temporary-housing.html', import.meta.url), 'utf8');
assert.ok(thHtml.includes('yatsushiro-support.html'), 'temporary-housing.html からの導線が必要です');

assert.ok(html.includes('municipalities.html?name=八代市'), '八代市総合ダッシュボードへの導線が必要です');

console.log(`八代市 被災者応援ガイド: ${items}制度 / ${cards}分野  / 詳細${detailCards}制度・金額・期限・条件・注意事項・窓口・一次資料・判定UI・自治体ナビ導線 OK`);
