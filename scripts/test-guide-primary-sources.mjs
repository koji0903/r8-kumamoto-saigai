import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('ガイドページ一次情報リンク回帰テスト開始');

const guidePages = fs.readdirSync('.')
  .filter((file) => file.endsWith('.html'))
  .filter((file) => /(ガイド|支援制度|補助金|申請|公費解体|仮設住宅|り災証明)/.test(fs.readFileSync(file, 'utf8')));
const combined = guidePages.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

const removedSources = [
  'https://www.city.kumamoto.jp/kiji00372070/index.html',
  'https://www.city.kumamoto.jp/kiji00372110/3_72110_516739_up_cdocajnr.pdf',
  'https://www.city.kumamoto.jp/kiji00372604/index.html',
  'https://www.city.uki.kumamoto.jp/jigyosha/sangyo/nogyo/2632940',
  'https://www.city.uki.kumamoto.jp/jigyosha/sangyo/nogyo/2637693',
  'https://www.city.uki.kumamoto.jp/kurashi/kankyo/gomi/2641256',
  'https://www.city.uki.kumamoto.jp/kurashi/sonota_kurashi/2634890',
  'https://www.city.uki.kumamoto.jp/kurashi/sumai/2624303',
  'https://www.city.uto.lg.jp/article/view/1072/3363.html',
  'https://www.city.uto.lg.jp/article/view/1310/16783.html',
  'https://www.city.yatsushiro.lg.jp/kiji00326858/3_26858_161072_up_eh14ogek.pdf',
  'https://www.city.yatsushiro.lg.jp/kiji00326880/index.html',
  'https://www.jfc.go.jp/n/finance/saigai/',
  'https://www.pref.kumamoto.jp/kiji_278851.html',
  'https://www.pref.kumamoto.jp/soshiki/61/276535.html',
  'https://www.pref.kumamoto.jp/uploaded/attachment/315959.pdf',
  'https://www.pref.kumamoto.jp/soshiki/27/275490.html',
  'https://www.pref.kumamoto.jp/uploaded/life/280503_892832_misc.pdf',
  'https://www.town.ashikita.lg.jp/bosai_site/oshirase_bosai/2111544',
  'https://www.town.ashikita.lg.jp/bosai_site/oshirase_bosai/2124308',
  'https://www.town.hikawa.kumamoto.jp/kiji0036760/index.html',
  'https://www.town.hikawa.kumamoto.jp/kiji0036782/3_6782_8258_up_e0ciixhm.pdf'
];

for (const url of removedSources) {
  assert.ok(!combined.includes(url), `廃止済みの一次情報リンクが残っています: ${url}`);
}

for (const unsupported of ['約 13,000〜14,000円 / ㎡', '公費上限額の目安：約220万〜250万円程度', '自己負担 0円', 'マニフェスト A・B2・D・E票']) {
  assert.ok(!combined.includes(unsupported), `一次情報で確認できない共通表現が残っています: ${unsupported}`);
}

assert.ok(combined.includes('https://www.pref.kumamoto.jp/soshiki/53/278851.html'), '現行の熊本県解体標準単価ページがありません');
assert.ok(combined.includes('https://www.city.uki.kumamoto.jp/toppage/important/2641256'), '宇城市解体の正式な一次情報ページがありません');

console.log(`ガイドページ一次情報リンク回帰テスト OK（${guidePages.length}ページ）`);
