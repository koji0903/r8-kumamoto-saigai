import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const assert=(value,message)=>{if(!value)throw new Error(message)};
const routes={
  home:"reconstruction-official.html?category=home",
  money:"reconstruction-money.html",
  documents:"reconstruction-documents.html",
  health_care:"reconstruction-health-care.html",
  family_education:"reconstruction-family.html",
  work_business:"reconstruction-work-business.html",
  agriculture_fishery:"reconstruction-agriculture-fishery.html",
  daily_life:"reconstruction-official.html?category=daily_life"
};
const labels=["住まい","お金・支払い","証明・申請","健康・介護","子ども・家族","仕事・事業","農業・漁業","暮らし・移動"];
const pages=["reconstruction.html","reconstruction-official.html",...new Set(Object.values(routes).map(value=>value.split("?")[0]))];
const specialized=pages.filter(file=>!['reconstruction.html','reconstruction-official.html'].includes(file));

for(const file of pages)assert(fs.existsSync(path.join(root,file)),`${file} がありません`);
const combined=pages.map(read).join("\n")+read("reconstruction.js")+read("municipality-official-nav.js");
for(const label of labels)assert(combined.includes(label),`カテゴリ名「${label}」が見つかりません`);
assert(!combined.includes("証明・手続き"),"旧カテゴリ名「証明・手続き」が残っています");

for(const file of specialized){
  const html=read(file);
  assert(html.includes("reconstruction.html#organizer"),`${file}: 暮らし整理ナビへの復帰導線がありません`);
  assert(html.includes("<noscript>"),`${file}: JavaScript無効時の代替導線がありません`);
  assert(html.includes("data-municipality-official-nav"),`${file}: 自治体公式情報ナビがありません`);
  assert(/相談を受けている方へ/.test(html),`${file}: 支援者向け説明がありません`);
  assert(html.includes("一般社団法人よか隊ネット熊本")&&/行政機関|行政、|公的機関/.test(html),`${file}: 運営主体と非公式性の説明がありません`);
  assert(/rel="canonical"/.test(html),`${file}: canonicalがありません`);
}

for(const file of pages){
  const html=read(file);
  assert(!/href=(['"])#\1|javascript:void/i.test(html),`${file}: 空リンクがあります`);
  for(const match of html.matchAll(/href="([^"?#]+\.html)(?:[?#][^"]*)?"/g)){
    if(/^https?:\/\//.test(match[1]))continue;
    assert(fs.existsSync(path.join(root,match[1])),`${file}: 内部リンク ${match[1]} の参照先がありません`);
  }
}

for(const file of fs.readdirSync(root).filter(name=>/^reconstruction.*\.js$/.test(name))){
  const js=read(file);
  assert(!/localStorage|sessionStorage|document\.cookie/.test(js),`${file}: 入力内容を端末へ保存しています`);
}

const nav=JSON.parse(read("public-data/reconstruction/municipality-official-navigation.json"));
assert(nav.municipalities?.length===21,"自治体公式情報ナビが21市町村ではありません");
for(const municipality of nav.municipalities){
  assert(/^https:\/\//.test(municipality.officialUrl),`${municipality.municipalityName}: 公式URLがHTTPSではありません`);
  for(const update of municipality.updates||[]){
    assert(/^https:\/\//.test(update.url),`${municipality.municipalityName}: 情報URLがHTTPSではありません`);
    for(const category of update.categories||[])assert(category in routes,`${municipality.municipalityName}: 未定義カテゴリ ${category}`);
  }
}

const css=["reconstruction.css","reconstruction-money.css","reconstruction-documents.css","reconstruction-health-care.css"].map(read).join("\n");
assert(css.includes(":focus-visible"),"キーボードフォーカスのスタイルがありません");
assert(css.includes("@media print"),"印刷スタイルがありません");
assert(/@media\s*\(max-width/.test(css),"モバイル向けスタイルがありません");
console.log(`暮らしの再建 統合QA: ${pages.length}ページ / 8カテゴリ / ${nav.municipalities.length}市町村`);
