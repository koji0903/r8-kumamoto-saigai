import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('公費解体・自費解体 総合ガイドテスト開始');

const html = fs.readFileSync('demolition.html', 'utf8');
const ukiHtml = fs.readFileSync('uki-demolition.html', 'utf8');
const css = fs.readFileSync('demolition.css', 'utf8');
const topics = JSON.parse(fs.readFileSync('sources/site-topics.json', 'utf8'));

assert.ok(html.includes('2026年11月19日'), '公式情報の確認日が最新ではありません');
assert.ok(html.includes('確認済み13自治体'), '確認済み自治体数が表示されていません');
assert.ok(html.includes('13自治体で受付開始'), '受付中自治体数が表示されていません');

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
assert.ok(html.includes('11/30受付終了'), '益城町の被災証明書発行期限の案内がありません');
assert.ok(html.includes('https://www.vill.nishihara.kumamoto.jp/kiji0032036/index.html'), '西原村の公式URLがありません');
assert.ok(html.includes('223件'), '宇土市の最新申請件数がありません');
assert.ok(html.includes('265棟'), '宇土市の最新申請棟数がありません');
assert.ok(html.includes('電話 / Web・月〜土'), '宇城市の現在の受付方式がありません');
assert.ok(html.includes('R8.9.24〜R9.3.31'), '宇城市の延長後の申請期間がありません');
assert.ok(html.includes('https://www.town.kikuyo.lg.jp/kiji0035711/index.html'), '菊陽町の公式URLがありません');
assert.ok(html.includes('R8.11.6〜'), '菊陽町の受付期間がありません');

assert.ok(!html.includes('電話予約（1日40枠・地区別日程）'), '宇城市の旧受付説明が残っています');
assert.ok(!html.includes('電話予約制（1日40枠・地区別）'), '宇城市の旧予約方式が残っています');
assert.ok(!html.includes('事前届出必須'), '宇城市の未確認の必須表現が残っています');
assert.ok(!html.includes('R8.11.30契約まで'), '宇城市の旧契約期限が残っています');
assert.ok(!html.includes('1日40枠を想定'), '宇城市の未確認の受付枠数が残っています');
assert.ok(!html.includes('<td><b>南阿蘇村</b></td>'), '公式受付を確認できない南阿蘇村が比較表に残っています');

assert.ok(ukiHtml.includes('https://www.city.uki.kumamoto.jp/toppage/important/2641256'), '宇城市の正式な一次情報URLがありません');
assert.ok(ukiHtml.includes('https://logoform.jp/f/6QI1j'), '宇城市のWeb予約フォームがありません');
assert.ok(ukiHtml.includes('令和9年3月31日'), '宇城市の最新申請期限がありません');
assert.ok(ukiHtml.includes('マニフェストD票またはE票'), '宇城市の自費解体チェックリストに沿ったマニフェスト表記がありません');
assert.ok(ukiHtml.includes('顔写真付きの公的証明書は1点'), '宇城市の本人確認書類要件がありません');
for (const obsolete of ['1日40枠', '地区別の優先受付', '令和8年11月30日までに契約', '事前届出が必須', 'A・B2・D・E票', 'kiji0037748', 'kiji_278851']) {
  assert.ok(!ukiHtml.includes(obsolete), `宇城市ページに旧情報が残っています: ${obsolete}`);
}

assert.ok(css.includes('.demolition-current-alert'), '重要更新の注意喚起スタイルがありません');
assert.ok(css.includes('.source-checked-note'), '公式確認日の注記スタイルがありません');
assert.ok(css.includes('.demolition-updates-shell'), '公式発表タイムラインのスタイルがありません');
assert.ok(css.includes('.demolition-update-card'), '公式発表カードのスタイルがありません');

// 自動更新マーカーと生成物の検証
assert.ok(html.includes('<!-- DEMOLITION_ALERT_START -->'), 'アラート自動更新マーカーがありません');
assert.ok(html.includes('<!-- DEMOLITION_METRICS_START -->'), 'メトリクス自動更新マーカーがありません');
assert.ok(html.includes('<!-- DEMOLITION_UPDATES_START -->'), '公式新着タイムライン自動更新マーカーがありません');
assert.ok(html.includes('<!-- DEMOLITION_TABLE_START -->'), '比較表自動更新マーカーがありません');
assert.ok(html.includes('<!-- DEMOLITION_DATE_START -->'), '確認日自動更新マーカーがありません');
assert.ok(html.includes('自治体公式 公費解体・被災家屋撤去の最新発表タイムライン'), '新着タイムラインの見出しがありません');
assert.ok(html.includes('自治体公式発表 連動更新中'), '自動収集連動バッジがありません');

assert.ok(fs.existsSync('sources/demolition-data.json'), 'sources/demolition-data.json が存在しません');
assert.ok(fs.existsSync('data/generated/demolition-data.js'), 'data/generated/demolition-data.js が存在しません');

const generatedDataContent = fs.readFileSync('data/generated/demolition-data.js', 'utf8');
assert.ok(generatedDataContent.includes('window.DEMOLITION_DATA ='), '生成されたJSのデータ構造が不正です');


const topic = topics.find(item => item.date === '2026-10-30' && item.targetPage === 'demolition.html');
assert.ok(topic, 'トップページ用の公費解体更新トピック（10/30）がありません');
assert.ok(topic.description.includes('氷川町'), '更新トピックに氷川町の変更がありません');
assert.ok(topic.description.includes('益城町'), '更新トピックに益城町の期限案内がありません');

const latestTopic = topics.find(item => item.date === '2026-11-19' && item.targetPage === 'demolition.html');
assert.ok(latestTopic, '最新の公費解体更新トピック（11/19）がありません');
assert.ok(latestTopic.description.includes('菊陽町'), '最新トピックに菊陽町の更新がありません');
assert.ok(latestTopic.description.includes('益城町'), '最新トピックに益城町の期限がありません');

console.log('公費解体・自費解体 総合ガイドテスト OK（13自治体・期限変更・公式リンク・旧表現除去）');
