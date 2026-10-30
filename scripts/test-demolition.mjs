import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('公費解体・自費解体 総合ガイドテスト開始');

const html = fs.readFileSync('demolition.html', 'utf8');
const css = fs.readFileSync('demolition.css', 'utf8');
const topics = JSON.parse(fs.readFileSync('sources/site-topics.json', 'utf8'));

assert.ok(html.includes('2026年10月30日'), '公式情報の確認日が最新ではありません');
assert.ok(html.includes('確認済み13自治体'), '確認済み自治体数が表示されていません');
assert.ok(html.includes('12自治体で受付開始'), '受付中自治体数が表示されていません');

const municipalities = [
  '八代市', '宇土市', '宇城市', '熊本市', '氷川町', '益城町', '美里町',
  '西原村', '菊池市', '御船町', '嘉島町', '甲佐町', '菊陽町'
];
for (const municipality of municipalities) {
  assert.ok(html.includes(`<td><b>${municipality}</b></td>`), `${municipality}が比較表にありません`);
}

assert.ok(html.includes('R8.9.15〜R9.3.31'), '氷川町の延長後の申請期間がありません');
assert.ok(html.includes('契約期限を撤廃'), '氷川町の自費解体契約期限撤廃がありません');
assert.ok(html.includes('050-6887-2407'), '氷川町の予約電話1がありません');
assert.ok(html.includes('050-6887-3391'), '氷川町の予約電話2がありません');
assert.ok(html.includes('原則 R8.10.30まで'), '益城町の原則申請期限がありません');
assert.ok(html.includes('原則期限 10/30'), '益城町の期限表示がありません');
assert.ok(!html.includes('本日が原則期限'), '日付経過後に誤解を招く相対日付が残っています');
assert.ok(html.includes('特別事情は11月以降も個別相談'), '益城町の特別事情相談案内がありません');
assert.ok(html.includes('https://www.vill.nishihara.kumamoto.jp/kiji0032036/index.html'), '西原村の公式URLがありません');
assert.ok(html.includes('223件'), '宇土市の最新申請件数がありません');
assert.ok(html.includes('265棟'), '宇土市の最新申請棟数がありません');
assert.ok(html.includes('窓口受付'), '宇城市の現在の受付方式がありません');
assert.ok(html.includes('詳細準備中'), '菊陽町の準備状況がありません');

assert.ok(!html.includes('電話予約（1日40枠・地区別日程）'), '宇城市の旧受付説明が残っています');
assert.ok(!html.includes('電話予約制（1日40枠・地区別）'), '宇城市の旧予約方式が残っています');
assert.ok(!html.includes('事前届出必須'), '宇城市の未確認の必須表現が残っています');
assert.ok(!html.includes('R8.11.30契約まで'), '宇城市の旧契約期限が残っています');
assert.ok(!html.includes('<td><b>南阿蘇村</b></td>'), '公式受付を確認できない南阿蘇村が比較表に残っています');

assert.ok(css.includes('.demolition-current-alert'), '重要更新の注意喚起スタイルがありません');
assert.ok(css.includes('.source-checked-note'), '公式確認日の注記スタイルがありません');

const topic = topics.find(item => item.date === '2026-10-30' && item.targetPage === 'demolition.html');
assert.ok(topic, 'トップページ用の公費解体更新トピックがありません');
assert.ok(topic.description.includes('氷川町'), '更新トピックに氷川町の変更がありません');
assert.ok(topic.description.includes('益城町'), '更新トピックに益城町の期限案内がありません');

console.log('公費解体・自費解体 総合ガイドテスト OK（13自治体・期限変更・公式リンク・旧表現除去）');
