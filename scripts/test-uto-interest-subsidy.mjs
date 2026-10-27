import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('宇土市 中小企業等利子補給金ガイド テスト開始');

const html = fs.readFileSync('uto-interest-subsidy.html', 'utf8');

// 基本メタデータ
assert.ok(html.includes('<title>宇土市 中小企業等利子補給金'), 'タイトルが正しくありません');
assert.ok(html.includes('<meta name="description"'), 'descriptionがありません');
assert.ok(html.includes('uto-interest-subsidy.css'), 'CSSリンクがありません');
assert.ok(html.includes('uto-interest-subsidy.js'), 'JSリンクがありません');
assert.ok(fs.existsSync('uto-interest-subsidy.css'), 'CSSファイルが存在しません');
assert.ok(fs.existsSync('uto-interest-subsidy.js'), 'JSファイルが存在しません');

// 制度要件と主要数値
assert.ok(html.includes('全額') && html.includes('10/10'), '全額補給の記載がありません');
assert.ok(html.includes('100万円') || html.includes('年 100'), '年間100万円上限の記載がありません');
assert.ok(html.includes('3年間') && html.includes('36か月'), '最長3年間（36か月）の記載がありません');
assert.ok(html.includes('令和9年2月26日'), '申請提出期限（令和9年2月26日）の記載がありません');

// 局地激甚災害（局激）指定外と市独自カバーの背景
assert.ok(html.includes('局地激甚災害'), '局地激甚災害への言及がありません');
assert.ok(html.includes('指定外') || html.includes('指定から外れ'), '指定外についての言及がありません');
assert.ok(html.includes('地域間格差') || html.includes('独自予算') || html.includes('市独自'), '独自カバー・格差解消の背景説明がありません');

// 対象となる5大融資制度
assert.ok(html.includes('金融円滑化特別資金'), '県金融円滑化特別資金の記載がありません');
assert.ok(html.includes('セーフティネット'), 'セーフティネット枠の記載がありません');
assert.ok(html.includes('小規模事業者おうえん資金'), '小規模事業者おうえん資金の記載がありません');
assert.ok(html.includes('災害貸付'), '公庫災害貸付の記載がありません');
assert.ok(html.includes('災害復旧貸付'), '公庫災害復旧貸付の記載がありません');

// シミュレーター要素
assert.ok(html.includes('id="calcAmount"'), '借入金額入力フィールドがありません');
assert.ok(html.includes('id="calcRate"'), '金利入力フィールドがありません');
assert.ok(html.includes('id="calcYears"'), '返済期間セレクトがありません');
assert.ok(html.includes('id="calcGrace"'), '据置期間セレクトがありません');
assert.ok(html.includes('id="calcResultVal"'), '結果表示領域がありません');

// 窓口・連絡先
assert.ok(html.includes('tel:0964273328') || html.includes('0964-27-3328'), '商工振興係の電話番号がありません');
assert.ok(html.includes('tel:0964225555') || html.includes('0964-22-5555'), '商工会の電話番号がありません');
assert.ok(html.includes('https://www.city.uto.lg.jp/article/view/1321/17233.html'), '宇土市公式URLがありません');

// 導線
assert.ok(html.includes('uto-support.html'), '暮らしの支援ガイドへの導線がありません');
assert.ok(html.includes('reconstruction-work-business.html'), '仕事・事業再建ナビへの導線がありません');

console.log('宇土市 中小企業等利子補給金ガイド テスト OK（要件・局激背景・5大融資・シミュレーター・窓口・導線検証完了）');
