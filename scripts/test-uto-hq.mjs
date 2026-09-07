import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
const context={window:{}};
vm.runInNewContext(fs.readFileSync('data/generated/municipality-hq-data.js','utf8'),context);
const city=context.window.MUNICIPALITY_HQ.municipalities.find(m=>m.key==='uto');
assert.ok(city,'宇土市の会議データが必要');
const numbers=Array.from(city.meetings,m=>m.meeting);
for(let n=6;n<=33;n++) assert.ok(numbers.includes(n),`第${n}回が欠落`);
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
assert.equal(city.editorial.meetings.length,28);
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
console.log('宇土市: 全28資料・全ページ保持・表紙日時・書面報告・避難者数・被害当日列・出典の検査 OK');
