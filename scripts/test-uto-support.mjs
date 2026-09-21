import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('宇土市 暮らしの支援・補助金総合ガイドテスト開始');

const html = fs.readFileSync('uto-support.html', 'utf8');
assert.ok(html.includes('<title>宇土市 暮らしの支援・補助金総合ガイド'), 'タイトルが正しくありません');
assert.ok(html.includes('<meta name="description"'), 'descriptionがありません');

// カテゴリセクションの確認
const expectedCats = ['housing', 'childcare', 'health', 'welfare', 'community', 'business', 'disaster'];
for (const cat of expectedCats) {
  assert.ok(html.includes(`id="sec-${cat}"`), `カテゴリ ${cat} のセクションがありません`);
  assert.ok(html.includes(`data-cat="${cat}"`), `カテゴリ ${cat} のdata-catがありません`);
}

// 制度カードの件数確認
const cardMatches = html.match(/class="uto-card"/g) || [];
assert.ok(cardMatches.length >= 50, `制度カードが少なすぎます（現在: ${cardMatches.length}件）`);

// 主要制度の確認
assert.ok(html.includes('宇土市住宅リフォーム助成事業'), '住宅リフォーム助成事業がありません');
assert.ok(html.includes('結婚新生活支援事業補助金'), '結婚新生活支援事業がありません');
assert.ok(html.includes('戸建て木造住宅耐震改修等事業補助金'), '木造耐震改修補助がありません');
assert.ok(html.includes('宇土市創業支援事業補助金'), '創業支援事業補助金がありません');
assert.ok(html.includes('子ども医療費助成事業'), '子ども医療費助成がありません');
assert.ok(html.includes('被災住宅の応急修理制度'), '応急修理制度がありません');

// 連絡先・電話番号の確認
assert.ok(html.includes('tel:0964273329'), '商工観光課の電話番号がありません');
assert.ok(html.includes('tel:0964273332'), '都市整備課の電話番号がありません');
assert.ok(html.includes('tel:0964274106'), '定住移住推進係の電話番号がありません');
assert.ok(html.includes('tel:0964273337'), '子育て給付係の電話番号がありません');
assert.ok(html.includes('tel:0964221111'), '市役所代表の電話番号がありません');

// 公式リンクの確認
assert.ok(html.includes('https://www.city.uto.lg.jp/article/view/1007/12355.html'), 'リフォーム助成の公式URLがありません');
assert.ok(html.includes('https://www.city.uto.lg.jp/article/view/1609/8791.html'), '結婚新生活の公式URLがありません');
assert.ok(html.includes('https://www.city.uto.lg.jp/article/view/1111/1250.html'), '創業支援の公式URLがありません');
assert.ok(html.includes('https://www.city.uto.lg.jp/article/view/1032/14818.html'), 'まちづくりハンドブックの公式URLがありません');

// スクリプトとCSSの読み込み
assert.ok(html.includes('src="uto-support.js'), 'uto-support.jsが読み込まれていません');
assert.ok(html.includes('href="uto-support.css'), 'uto-support.cssが読み込まれていません');
assert.ok(fs.existsSync('uto-support.css'), 'uto-support.cssが存在しません');
assert.ok(fs.existsSync('uto-support.js'), 'uto-support.jsが存在しません');

console.log(`宇土市 暮らしの支援・補助金総合ガイドテスト OK（全${cardMatches.length}制度を確認）`);
