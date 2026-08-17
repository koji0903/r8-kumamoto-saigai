// お知らせの受け取り方が、取れないものを取れるように見せないことを守る。
//
// 各市町村の発信は公式LINEに移りつつある。しかしLINEの配信本文は友だち登録
// した人のトーク画面にだけ届き、第三者が読む手段がない（Messaging APIは
// アカウントを運営する自治体自身のためのもので、公開のアカウントページにも
// 配信本文は出ない）。だからこのサイトが配れるのは「受け取り方」だけで、
// 配信内容を持っているかのような見せ方をしてはいけない。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const data = JSON.parse(read("public-data/reconstruction/alert-channels.json"));
const source = JSON.parse(read("data/reconstruction/municipality-alert-channels.json"));
const html = read("alert-channels.html");
const code = read("alert-channels.js");
const master = JSON.parse(read("data/reconstruction/municipalities.json"));

// ---- 取れないものを取れるように見せない -------------------------------------
assert.match(html, /案内しているのは「受け取り方」だけ/, "何を載せていないかの断りが必要です");
assert.match(html, /第三者が読む手段がない/, "配信本文を収集していない理由が必要です");
assert.ok(data.caveats.some(caveat => /第三者が読む手段がない/.test(caveat)), "公開データにも断りが必要です");
// 配信本文を持つ形のデータを作らない
for (const municipality of data.municipalities) {
  for (const channel of municipality.channels) {
    assert.deepEqual(
      Object.keys(channel).filter(key => !["type", "name", "lineId", "tel", "url", "note", "sourceUrl", "sourceLabel"].includes(key)),
      [], `${municipality.municipalityName}: 受け取り方以外の項目を持たせてはいけません`);
  }
}

// ---- 出どころ ---------------------------------------------------------------
assert.match(data.confirmedAt, /^\d{4}-\d{2}-\d{2}$/, "確認日が必要です");
assert.ok(/1件ずつ/.test(source.note), "どう確認したかの記録が必要です");
for (const municipality of data.municipalities) {
  for (const channel of municipality.channels) {
    // 出典なしでは載せない。推測でLINEのIDを書かないための担保。
    assert.match(channel.sourceUrl, /^https:\/\//, `${municipality.municipalityName}: ${channel.name} の出典URLが必要です`);
    assert.ok(channel.sourceLabel?.trim(), `${municipality.municipalityName}: ${channel.name} の出典名が必要です`);
    assert.ok(data.channelTypes.some(type => type.id === channel.type), `${municipality.municipalityName}: 未知の手段 ${channel.type}`);
    if (channel.url) assert.match(channel.url, /^https:\/\//, `${municipality.municipalityName}: リンクが不正です`);
    if (channel.type === "line") {
      assert.match(channel.url, /^https:\/\/(page\.line\.me|lin\.ee)\//,
        `${municipality.municipalityName}: LINEの追加先はLINEの正規URLである必要があります`);
    }
  }
}

// ---- 21市町村を落とさない ---------------------------------------------------
assert.equal(data.municipalities.length, 21, "21市町村すべてを扱う必要があります");
for (const meta of master) {
  const item = data.municipalities.find(entry => entry.municipalityId === meta.id);
  assert.ok(item, `${meta.name} がありません`);
  assert.match(item.officialUrl, /^https?:\/\//, `${meta.name}: 退避先がありません`);
}
// 確認できなかった市町村を「手段が無い」と読ませない
assert.ok(/手段が無いという意味ではありません/.test(source.limitation), "未確認の断りが必要です");
assert.match(code, /手段が無いという意味ではありません/, "未確認のときの断り書きが必要です");
assert.ok(data.caveats.some(caveat => /手段が無いという意味ではありません/.test(caveat)), "公開データにも未確認の断りが必要です");

const confirmed = data.municipalities.filter(item => item.channels.length);
assert.ok(confirmed.length >= 15, `確認できた市町村が${confirmed.length}件しかありません`);
const withLine = data.municipalities.filter(item => item.channels.some(channel => channel.type === "line"));
assert.ok(withLine.length >= 10, `公式LINEを確認できた市町村が${withLine.length}件しかありません`);

// ---- 発信が少ないことの読み違いを防ぐ ---------------------------------------
// 集計ページは自治体サイトの発信しか見ていない。LINEに移っている可能性を
// 書かないと、発信の少なさを対応の少なさと読まれてしまう。
for (const file of ["official-timeline.json", "water-recovery.json", "response-tracks.json"]) {
  const analysis = JSON.parse(read(`public-data/reconstruction/${file}`));
  assert.ok(analysis.caveats.some(caveat => /公式LINE/.test(caveat)),
    `${file}: 発信がLINEに移っている場合があることの断りが必要です`);
}
assert.match(read("municipality-updates.html"), /ホームページに載らない発信があります/,
  "市町村の公式発信ページに、ここに出ない発信があることの断りが必要です");

// ---- 到達性 -----------------------------------------------------------------
const pages = fs.readdirSync(new URL("..", import.meta.url)).filter(file => file.endsWith(".html"));
const inbound = pages.filter(page => page !== "alert-channels.html" && read(page).includes('href="alert-channels.html"'));
assert.ok(inbound.length >= 1, "本文からの導線がありません");
assert.match(read("org-site.js"), /href="alert-channels\.html"/, "メニューに載せる必要があります");

console.log(`お知らせの受け取り方: ${confirmed.length}/21市町村（公式LINE${withLine.length}）/ 出典つき・未確認の断り・配信内容を持たない・分析側の注記 OK`);
