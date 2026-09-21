import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('宇城市・氷川町・八代市 暮らしの支援・補助金総合ガイドテスト開始');

// 1. 宇城市テスト
{
  console.log('--- 宇城市 (uki-living-support.html) ---');
  const html = fs.readFileSync('uki-living-support.html', 'utf8');
  const expectedCount = 33;
  assert.ok(html.includes('<title>宇城市：暮らしの支援・補助金 総合ガイド'), '宇城市：タイトルが正しくありません');
  assert.ok(html.includes('<meta name="description"'), '宇城市：descriptionがありません');

  const expectedCats = ['housing', 'childcare', 'health', 'senior', 'migration', 'business', 'disaster'];
  for (const cat of expectedCats) {
    assert.ok(html.includes(`id="cat-${cat}"`), `宇城市：カテゴリ ${cat} のセクションがありません`);
    assert.ok(html.includes(`data-cat="${cat}"`), `宇城市：カテゴリ ${cat} のdata-catがありません`);
  }

  const cardMatches = html.match(/class="uto-card"/g) || [];
  assert.equal(cardMatches.length, expectedCount, `宇城市：主要${expectedCount}制度のカードが存在しません（現在: ${cardMatches.length}件）`);

  assert.ok(html.includes('id="simulator"'), '宇城市：シミュレーターコンポーネントがありません');
  assert.ok(html.includes('id="utoSimResetBtn"'), '宇城市：リセットボタンがありません');
  assert.ok(html.includes('data-preset="childcare"'), '宇城市：子育てプリセットがありません');
  assert.ok(html.includes('data-preset="senior"'), '宇城市：シニアプリセットがありません');
  assert.ok(html.includes('data-preset="housing"'), '宇城市：住まいプリセットがありません');
  assert.ok(html.includes('data-preset="newlywed"'), '宇城市：新婚プリセットがありません');
  assert.ok(html.includes('data-preset="disaster"'), '宇城市：被災プリセットがありません');
  assert.ok(html.includes('data-preset="business"'), '宇城市：事業プリセットがありません');

  assert.ok(html.includes('name="simLife"'), '宇城市：年代フィルタがありません');
  assert.ok(html.includes('name="simFamily"'), '宇城市：世帯フィルタがありません');
  assert.ok(html.includes('name="simHousing"'), '宇城市：住まいフィルタがありません');
  assert.ok(html.includes('name="simIncome"'), '宇城市：所得フィルタがありません');
  assert.ok(html.includes('name="simDisaster"'), '宇城市：被災フィルタがありません');
  assert.ok(html.includes('name="simWork"'), '宇城市：事業フィルタがありません');

  assert.ok(html.includes('class="uto-tag"'), 'ハッシュタグが表示されていません');
  assert.ok(html.includes('class="uto-badge-match"'), '宇城市：マッチバッジがありません');
  const iconMatches = html.match(/class="uto-card-icon"/g) || [];
  assert.equal(iconMatches.length, expectedCount, `宇城市：主要${expectedCount}制度にSVGアイコンがありません（現在: ${iconMatches.length}個）`);

  // 主要制度
  assert.ok(html.includes('宇城市こども医療費助成制度'), '宇城市：こども医療費助成がありません');
  assert.ok(html.includes('宇城市結婚新生活支援事業'), '宇城市：結婚新生活支援事業がありません');
  assert.ok(html.includes('戸建て木造住宅耐震改修等事業補助金'), '宇城市：耐震改修補助がありません');
  assert.ok(html.includes('宇城市創業支援事業補助金'), '宇城市：創業支援事業補助金がありません');
  assert.ok(html.includes('被災者支援のための無料相談会'), '宇城市：無料相談会がありません');
  assert.ok(html.includes('被災者生活再建支援金'), '宇城市：被災者生活再建支援金がありません');

  assert.ok(html.includes('class="uto-sup-hero-inner"'), '宇城市：ヒーロー内の幅制限がありません');
  assert.ok(html.includes('class="uto-sup-container"'), '本文エリアの幅制限がありません');
  assert.ok(html.includes('src="uki-living-support.js'), '宇城市：JS読み込みがありません');
  assert.ok(html.includes('href="uki-living-support.css'), '宇城市：CSS読み込みがありません');
  assert.ok(fs.existsSync('uki-living-support.css'), '宇城市：CSSファイルがありません');
  assert.ok(fs.existsSync('uki-living-support.js'), '宇城市：JSファイルがありません');
  console.log('宇城市 テスト OK');
}

// 2. 氷川町テスト
{
  console.log('--- 氷川町 (hikawa-living-support.html) ---');
  const html = fs.readFileSync('hikawa-living-support.html', 'utf8');
  const expectedCount = 28;
  assert.ok(html.includes('<title>氷川町：暮らしの支援・補助金 総合ガイド'), '氷川町：タイトルが正しくありません');
  assert.ok(html.includes('<meta name="description"'), '氷川町：descriptionがありません');

  const expectedCats = ['housing', 'childcare', 'health', 'senior', 'migration', 'business', 'disaster'];
  for (const cat of expectedCats) {
    assert.ok(html.includes(`id="cat-${cat}"`), `氷川町：カテゴリ ${cat} のセクションがありません`);
    assert.ok(html.includes(`data-cat="${cat}"`), `氷川町：カテゴリ ${cat} のdata-catがありません`);
  }

  const cardMatches = html.match(/class="uto-card"/g) || [];
  assert.equal(cardMatches.length, expectedCount, `氷川町：主要${expectedCount}制度のカードが存在しません（現在: ${cardMatches.length}件）`);

  assert.ok(html.includes('id="simulator"'), '氷川町：シミュレーターコンポーネントがありません');
  assert.ok(html.includes('id="utoSimResetBtn"'), '氷川町：リセットボタンがありません');
  assert.ok(html.includes('data-preset="childcare"'), '氷川町：子育てプリセットがありません');
  assert.ok(html.includes('data-preset="senior"'), '氷川町：シニアプリセットがありません');
  assert.ok(html.includes('data-preset="housing"'), '氷川町：住まいプリセットがありません');
  assert.ok(html.includes('data-preset="disaster"'), '氷川町：被災プリセットがありません');
  assert.ok(html.includes('data-preset="business"'), '氷川町：事業プリセットがありません');

  assert.ok(html.includes('class="uto-tag"'), '氷川町：ハッシュタグが表示されていません');
  assert.ok(html.includes('class="uto-badge-match"'), '氷川町：マッチバッジがありません');
  const iconMatches = html.match(/class="uto-card-icon"/g) || [];
  assert.equal(iconMatches.length, expectedCount, `氷川町：主要${expectedCount}制度にSVGアイコンがありません（現在: ${iconMatches.length}個）`);

  // 特有・主要制度
  assert.ok(html.includes('氷川町畳表張替助成事業'), '氷川町：畳表張替助成事業がありません');
  assert.ok(html.includes('すこやか赤ちゃん出産祝金（町独自）'), '氷川町：出産祝金がありません');
  assert.ok(html.includes('氷川町こども医療費助成事業'), '氷川町：こども医療費助成がありません');
  assert.ok(html.includes('氷川町移住体験住宅（ひかわ暮らし体験）'), '氷川町：移住体験住宅がありません');
  assert.ok(html.includes('被災家屋等の公費解体・自費解体制度'), '氷川町：公費解体がありません');
  assert.ok(html.includes('住宅の応急修理制度（災害救助法）'), '氷川町：応急修理がありません');

  assert.ok(html.includes('class="uto-sup-hero-inner"'), '氷川町：ヒーロー内の幅制限がありません');
  assert.ok(html.includes('class="uto-sup-container"'), '氷川町：本文エリアの幅制限がありません');
  assert.ok(html.includes('src="hikawa-living-support.js'), '氷川町：JS読み込みがありません');
  assert.ok(html.includes('href="hikawa-living-support.css'), '氷川町：CSS読み込みがありません');
  assert.ok(fs.existsSync('hikawa-living-support.css'), '氷川町：CSSファイルがありません');
  assert.ok(fs.existsSync('hikawa-living-support.js'), '氷川町：JSファイルがありません');
  console.log('氷川町 テスト OK');
}

// 3. 八代市テスト
{
  console.log('--- 八代市 (yatsushiro-living-support.html) ---');
  const html = fs.readFileSync('yatsushiro-living-support.html', 'utf8');
  const expectedCount = 34;
  assert.ok(html.includes('<title>八代市：暮らしの支援・補助金 総合ガイド'), '八代市：タイトルが正しくありません');
  assert.ok(html.includes('<meta name="description"'), '八代市：descriptionがありません');

  const expectedCats = ['housing', 'childcare', 'health', 'senior', 'migration', 'business', 'disaster'];
  for (const cat of expectedCats) {
    assert.ok(html.includes(`id="cat-${cat}"`), `八代市：カテゴリ ${cat} のセクションがありません`);
    assert.ok(html.includes(`data-cat="${cat}"`), `八代市：カテゴリ ${cat} のdata-catがありません`);
  }

  const cardMatches = html.match(/class="uto-card"/g) || [];
  assert.equal(cardMatches.length, expectedCount, `八代市：主要${expectedCount}制度のカードが存在しません（現在: ${cardMatches.length}件）`);

  assert.ok(html.includes('id="simulator"'), '八代市：シミュレーターコンポーネントがありません');
  assert.ok(html.includes('id="utoSimResetBtn"'), '八代市：リセットボタンがありません');
  assert.ok(html.includes('data-preset="childcare"'), '八代市：子育てプリセットがありません');
  assert.ok(html.includes('data-preset="senior"'), '八代市：シニアプリセットがありません');
  assert.ok(html.includes('data-preset="housing"'), '八代市：住まいプリセットがありません');
  assert.ok(html.includes('data-preset="disaster"'), '八代市：被災プリセットがありません');
  assert.ok(html.includes('data-preset="business"'), '八代市：事業プリセットがありません');

  assert.ok(html.includes('class="uto-tag"'), '八代市：ハッシュタグが表示されていません');
  assert.ok(html.includes('class="uto-badge-match"'), '八代市：マッチバッジがありません');
  const iconMatches = html.match(/class="uto-card-icon"/g) || [];
  assert.equal(iconMatches.length, expectedCount, `八代市：主要${expectedCount}制度にSVGアイコンがありません（現在: ${iconMatches.length}個）`);

  // 主要・特有制度
  assert.ok(html.includes('保育料完全無償化（0〜5歳児）'), '八代市：0〜5歳保育料完全無償化がありません');
  assert.ok(html.includes('八代市こども医療費助成事業（高校生まで全額助成）'), '八代市：こども医療費助成がありません');
  assert.ok(html.includes('八代市出産祝金（市独自）'), '八代市：出産祝金がありません');
  assert.ok(html.includes('八代産材利用促進事業補助金'), '八代市：八代産材補助がありません');
  assert.ok(html.includes('八代市創業支援事業補助金'), '八代市：創業支援補助がありません');
  assert.ok(html.includes('八代市 被災者応援ガイドブック（第7版連携）'), '八代市：被災者応援第7版連携がありません');
  assert.ok(html.includes('セーフティネット保証4号（中小企業支援）'), '八代市：セーフティネット4号がありません');

  assert.ok(html.includes('class="uto-sup-hero-inner"'), '八代市：ヒーロー内の幅制限がありません');
  assert.ok(html.includes('class="uto-sup-container"'), '八代市：本文エリアの幅制限がありません');
  assert.ok(html.includes('src="yatsushiro-living-support.js'), '八代市：JS読み込みがありません');
  assert.ok(html.includes('href="yatsushiro-living-support.css'), '八代市：CSS読み込みがありません');
  assert.ok(fs.existsSync('yatsushiro-living-support.css'), '八代市：CSSファイルがありません');
  assert.ok(fs.existsSync('yatsushiro-living-support.js'), '八代市：JSファイルがありません');
  console.log('八代市 テスト OK');
}

console.log('=== 全自治体 暮らしの支援・補助金総合ガイドテスト 全て合格 ===');
