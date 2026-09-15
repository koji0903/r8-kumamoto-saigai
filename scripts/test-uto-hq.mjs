import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
const context={window:{}};
vm.runInNewContext(fs.readFileSync('data/generated/municipality-hq-data.js','utf8'),context);
const city=context.window.MUNICIPALITY_HQ.municipalities.find(m=>m.key==='uto');
assert.ok(city,'宇土市の会議データが必要');
const numbers=Array.from(city.meetings,m=>m.meeting);
for(let n=6;n<=35;n++) assert.ok(numbers.includes(n),`第${n}回が欠落`);
assert.equal(new Set(numbers).size,numbers.length);
for(const meeting of city.meetings){
  const saved=JSON.parse(fs.readFileSync(`sources/official/municipality-hq-text/uto-${String(meeting.meeting).padStart(3,'0')}.json`));
  assert.equal(meeting.sections.length,saved.pages.length,'全ページを公開データに保持');
  assert.equal(meeting.pages,saved.pages.length);
  assert.equal(meeting.documents[0].url,saved.url);
  saved.pages.forEach((page,i)=>{assert.ok(page.text.trim());assert.equal(meeting.sections[i].text,page.text);assert.equal(meeting.sections[i].page,i+1);});
}
for(const summary of city.editorial.meetings){
  const record=city.meetings.find(m=>m.meeting===summary.meeting);
  assert.ok(record && summary.page>=1 && summary.page<=record.pages);
  assert.ok(summary.title && summary.summary);
}
assert.equal(city.editorial.meetings.length,30);
// 最新の公開回まで要約があること（無いと最新カードが「編集要約は未確認」になる）
assert.equal(city.editorial.reviewedThrough,Math.max(...numbers),'編集要約が最新の公開回まで追いついていません');
assert.ok(city.editorial.meetings.some(s=>s.meeting===Math.max(...numbers)),'最新の公開回の要約がありません');
const m=n=>city.meetings.find(m=>m.meeting===n);
assert.equal(m(30).date,'2026-08-28');
assert.equal(m(33).time,'16:00');
assert.equal(m(32).time,null);
assert.equal(m(32).writtenReport,true);
assert.equal(m(6).figures.evacuees,undefined,'未掲載値を補完しない');
assert.equal(m(7).figures.evacuees,652);
assert.equal(m(19).figures.evacuees,77);
assert.equal(m(20).figures.evacuees,87);
assert.equal(m(33).figures.evacuees,85);
assert.equal(m(33).figures.households,48);
assert.equal(m(27).figures.utoHomesTotal,6193,'未来日の0を採らない');
assert.equal(m(33).figures.utoHomesTotal,7480);
assert.equal(m(33).figures.utoHomesUnclassified,3807);
// 第34回（9月8日・書面報告 簡易版）と第35回（9月11日14:30）。値はPDFの避難者一覧10時列・被害表の会議当日列で確認済み
assert.equal(m(34).date,'2026-09-08');
assert.equal(m(34).writtenReport,true);
assert.equal(m(34).time,null);
assert.equal(m(34).figures.evacuees,81);
assert.equal(m(34).figures.households,46);
assert.equal(m(34).figures.utoHomesTotal,7605);
assert.equal(m(35).date,'2026-09-11');
assert.equal(m(35).time,'14:30');
assert.equal(m(35).writtenReport,false);
assert.equal(m(35).figures.evacuees,79);
assert.equal(m(35).figures.households,45);
assert.equal(m(35).figures.utoHomesFull,28);
assert.equal(m(35).figures.utoHomesUnclassified,3535);
assert.equal(m(35).figures.utoHomesTotal,7805);
// 区分の合計が計と一致すること（抽出の列ずれを検出する）
for(const n of [34,35]){const f=m(n).figures;assert.equal(f.utoHomesFull+f.utoHomesLargeHalf+f.utoHomesHalf+f.utoHomesPartial+f.utoHomesUnclassified,f.utoHomesTotal,`第${n}回の住家被害の内訳と計が合いません`);}
// ページの説明文が古い回で止まっていないこと
const page=fs.readFileSync('hq-uto.html','utf8');
assert.ok(!page.includes('この節の内容は第33回まで'),'「次の支援につなぐ動き」が第33回のままです');
assert.ok(page.includes('この節の内容は第35回まで'),'「次の支援につなぐ動き」を最新回まで確認した表示がありません');
assert.ok(!fs.readFileSync('uto-hq.js','utf8').includes("'08/22〜09/04'"),'最後の期間の終わりが固定のままです');
assert.ok(fs.readFileSync('app.js','utf8').includes('href="hq-uto.html"'));
const result=spawnSync('python3',['-c',`
import sys,json
from pathlib import Path
sys.path.insert(0,'tools')
from uto_hq import cover_date,shelter_figures,damage_figures
for path in sorted(Path('sources/official/municipality-hq-text').glob('uto-*.json')):
    saved=json.loads(path.read_text())
    when=cover_date(saved['pages'][0]['text'],saved['meeting'])
    shelter_figures(saved['pages'][1]['text'])
    damage_figures(saved['pages'],when['date'])
try:
    shelter_figures('避難者数一覧\\n壊れた表\\n福祉センター')
except ValueError:
    pass
else:
    raise AssertionError('不明な表構造は拒否する')
`],{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
assert.equal(result.status,0,result.stderr);
console.log(`宇土市: 全${city.meetings.length}資料（第${numbers[0]}〜${Math.max(...numbers)}回）・全ページ保持・表紙日時・書面報告・避難者数・被害当日列・要約は第${city.editorial.reviewedThrough}回まで・出典の検査 OK`);
