import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('宇土市 暮らしの支援・補助金総合ガイドテスト開始');

const html = fs.readFileSync('uto-support.html', 'utf8');
assert.ok(html.includes('<title>宇土市：暮らしの支援・補助金 総合ガイド'), 'タイトルが正しくありません');
assert.ok(html.includes('<meta name="description"'), 'descriptionがありません');

// カテゴリセクションの確認
const expectedCats = ['housing', 'childcare', 'health', 'senior', 'community', 'business', 'disaster'];
for (const cat of expectedCats) {
  assert.ok(html.includes(`id="sec-${cat}"`), `カテゴリ ${cat} のセクションがありません`);
  assert.ok(html.includes(`data-cat="${cat}"`), `カテゴリ ${cat} のdata-catがありません`);
}

// 制度カードの件数確認
const cardMatches = html.match(/class="uto-card"/g) || [];
assert.equal(cardMatches.length, 53, `全53制度のカードが存在しません（現在: ${cardMatches.length}件）`);

// シミュレーター要素の確認
assert.ok(html.includes('id="utoSimulator"'), 'シミュレーターコンポーネントがありません');
assert.ok(html.includes('id="utoSimResetBtn"'), 'リセットボタンがありません');
assert.ok(html.includes('data-preset="childcare"'), '子育てプリセットボタンがありません');
assert.ok(html.includes('data-preset="senior"'), 'シニアプリセットボタンがありません');
assert.ok(html.includes('data-preset="housing"'), '住まいプリセットボタンがありません');
assert.ok(html.includes('data-preset="newlywed"'), '新婚プリセットボタンがありません');
assert.ok(html.includes('data-preset="disaster"'), '被災プリセットボタンがありません');
assert.ok(html.includes('data-preset="business"'), '事業プリセットボタンがありません');

// 詳細ファセットチェックボックスの確認
assert.ok(html.includes('name="simLife"'), '年代フィルタがありません');
assert.ok(html.includes('name="simFamily"'), '世帯フィルタがありません');
assert.ok(html.includes('name="simHousing"'), '住まいフィルタがありません');
assert.ok(html.includes('name="simIncome"'), '所得フィルタがありません');
assert.ok(html.includes('name="simDisaster"'), '被災フィルタがありません');
assert.ok(html.includes('name="simWork"'), '事業フィルタがありません');

// カード属性の確認
assert.ok(html.includes('data-life="'), 'data-life属性がカードに付与されていません');
assert.ok(html.includes('data-family="'), 'data-family属性がカードに付与されていません');
assert.ok(html.includes('data-housing="'), 'data-housing属性がカードに付与されていません');
assert.ok(html.includes('data-income="'), 'data-income属性がカードに付与されていません');
assert.ok(html.includes('data-disaster="'), 'data-disaster属性がカードに付与されていません');
assert.ok(html.includes('data-work="'), 'data-work属性がカードに付与されていません');
assert.ok(html.includes('class="card-hash-tag"'), 'ハッシュタグが表示されていません');
assert.ok(html.includes('class="uto-badge-match"'), 'マッチバッジがありません');

// 主要制度の確認
assert.ok(html.includes('宇土市住宅リフォーム助成事業'), '住宅リフォーム助成事業がありません');
assert.ok(html.includes('宇土市結婚新生活支援事業'), '結婚新生活支援事業がありません');
assert.ok(html.includes('戸建て木造住宅耐震改修等事業補助金'), '木造耐震改修補助がありません');
assert.ok(html.includes('宇土市新規創業者応援補助金'), '新規創業者応援補助金がありません');
assert.ok(html.includes('子ども医療費助成事業'), '子ども医療費助成がありません');
assert.ok(html.includes('住宅の応急修理制度（災害救助法）'), '応急修理制度がありません');
assert.ok(html.includes('被災者生活再建支援金'), '被災者生活再建支援金がありません');

// 連絡先・電話番号の確認
assert.ok(html.includes('tel:0964273329'), '商工振興係の電話番号がありません');
assert.ok(html.includes('tel:0964273332'), '建築住宅係の電話番号がありません');
assert.ok(html.includes('tel:0964273315'), '政策推進係の電話番号がありません');
assert.ok(html.includes('tel:0964273337'), '子育て給付係の電話番号がありません');
assert.ok(html.includes('tel:0964221111'), '市役所代表の電話番号がありません');

// 公式リンクの確認
assert.ok(html.includes('https://www.city.uto.lg.jp/article/view/1007/12355.html'), 'リフォーム助成の公式URLがありません');
assert.ok(html.includes('https://www.city.uto.lg.jp/article/view/1005/11993.html'), '結婚新生活の公式URLがありません');
assert.ok(html.includes('https://www.city.uto.lg.jp/article/view/1032/14818.html'), 'まちづくりハンドブックの公式URLがありません');

// 幅制限レイアウトシェルの確認
assert.ok(html.includes('class="uto-sup-hero-inner"'), 'ヒーロー内の幅制限（uto-sup-hero-inner）がありません');
assert.ok(html.includes('class="uto-sup-shell"'), '本文エリアの幅制限（uto-sup-shell）がありません');

// カード内SVGイラストアイコンの確認
const iconBoxMatches = html.match(/class="uto-card-icon-box"/g) || [];
assert.equal(iconBoxMatches.length, 53, `全53制度にSVGイラストボックスがありません（現在: ${iconBoxMatches.length}個）`);
const iconSvgMatches = html.match(/class="uto-card-icon"/g) || [];
assert.equal(iconSvgMatches.length, 53, `全53制度にSVGイラストアイコンがありません（現在: ${iconSvgMatches.length}個）`);

// スクリプトとCSSの読み込み
assert.ok(html.includes('src="uto-support.js'), 'uto-support.jsが読み込まれていません');
assert.ok(html.includes('href="uto-support.css'), 'uto-support.cssが読み込まれていません');
assert.ok(fs.existsSync('uto-support.css'), 'uto-support.cssが存在しません');
assert.ok(fs.existsSync('uto-support.js'), 'uto-support.jsが存在しません');

console.log(`宇土市 暮らしの支援・補助金総合ガイドテスト OK（全${cardMatches.length}制度・シミュレーター・SVGイラスト・幅制限検証完了）`);
