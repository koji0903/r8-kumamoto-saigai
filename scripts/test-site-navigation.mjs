// サイト全体の導線を守る。
//
// 実際に表示されるメニューは org-site.js が組み立てるメガメニューで、HTML に
// 書いてある静的メニューは JavaScript 無効時にだけ見えるもの。両方あることを
// 忘れると、片方にだけページを足して「メニューから辿れないページ」ができる。
// 実際、市町村の発信から読み解く3ページと災害VCはどちらにも載っておらず、
// 本文中のリンクからしか到達できなかった。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const pages = fs.readdirSync(new URL("..", import.meta.url))
  .filter(file => file.endsWith(".html") && !file.startsWith("google"));

// 発信から読み解く3ページ。順番も含めてどのページでも同じであること。
const READING_SET = ["official-timeline.html", "official-water-recovery.html", "official-response-tracks.html"];
// 3ページ本体と、そこへの入口になるページ
const CARRIERS = [...READING_SET, "municipality-updates.html", "municipalities.html", "timeline.html"];

// ---- メガメニュー（実際に見えるメニュー）------------------------------------
const orgSite = read("org-site.js");
for (const page of [...READING_SET, "volunteer-centers.html"]) {
  assert.ok(orgSite.includes(`href="${page}"`), `メガメニューに ${page} がありません`);
}
// メニューのどのグループも点灯しないと、利用者は自分がどこにいるか分からない
const activity = orgSite.match(/const activityPages=\[([^\]]*)\]/)?.[1] ?? "";
for (const page of READING_SET) {
  assert.ok(activity.includes(page), `${page} が現在地判定に入っていません`);
}
// パンくずの表示名（無いと <title> の切り出しに落ちる）
for (const page of READING_SET) {
  assert.match(orgSite, new RegExp(`'${page.replace(/\./g, "\\.")}':'[^']+'`), `${page} のページ名がありません`);
}

// ---- 静的メニュー（JavaScript 無効時）---------------------------------------
// 実体とずれていると、JSが無効な利用者だけ別のサイト構造を見ることになる。
const staticNavs = new Map();
for (const page of pages) {
  const nav = read(page).match(/<nav aria-label="メインメニュー">[\s\S]*?<\/nav>/)?.[0];
  if (nav) staticNavs.set(page, nav);
}
assert.ok(staticNavs.size >= 19, `静的メニューを持つページが${staticNavs.size}件しかありません`);
const hrefsOf = nav => [...nav.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
const reference = hrefsOf([...staticNavs.values()][0]);
assert.ok(reference.includes("reconstruction.html"), "静的メニューに暮らしの再建がありません");
assert.ok(!reference.includes("index.html"), "静的メニューの先頭は災害サマリー（disaster.html）であるべきです");
for (const [page, nav] of staticNavs) {
  assert.deepEqual(hrefsOf(nav), reference, `${page}: 静的メニューの項目が他ページと違います`);
  // 自分自身でないページを現在地として印さないこと
  const current = nav.match(/href="([^"]+)"\s+aria-current="page"/)?.[1];
  if (current) assert.equal(current, page, `${page}: 別のページ（${current}）を現在地として印しています`);
}

// ---- 読み解き3ページの帯 -----------------------------------------------------
for (const page of CARRIERS) {
  const html = read(page);
  const band = html.match(/<nav class="reading-set"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(band, `${page}: 3ページの帯がありません`);
  const targets = [...band.matchAll(/<(?:a href="([^"]+)"|span aria-current="page")>\s*<b>([^<]+)<\/b>/g)];
  assert.equal(targets.length, 3, `${page}: 帯の項目が3つではありません`);
  // 並び順が揃っていないと、ページを移動するたびに別物に見える
  const order = targets.map((match, index) => match[1] ?? READING_SET[index]);
  assert.deepEqual(order, READING_SET, `${page}: 帯の並び順が違います`);
  const currentCount = (band.match(/aria-current="page"/g) || []).length;
  if (READING_SET.includes(page)) {
    assert.equal(currentCount, 1, `${page}: いま見ているページの印が1つではありません`);
    assert.ok(!band.includes(`href="${page}"`), `${page}: 自分自身へのリンクが残っています`);
    assert.match(band, /いま見ているページ/, `${page}: 現在地の文字表示が必要です`);
  } else {
    assert.equal(currentCount, 0, `${page}: 入口側で現在地を印してはいけません`);
  }
}
// 帯に集約したので、3ページ末尾に兄弟リンクを重複させない
for (const page of READING_SET) {
  const tail = read(page).match(/<div class="timeline-links">[\s\S]*?<\/div>/)?.[0] ?? "";
  for (const sibling of READING_SET) {
    assert.ok(!tail.includes(`href="${sibling}"`), `${page}: 末尾に帯と重複するリンクが残っています`);
  }
}

// ---- 到達性：本文中のリンクだけに頼るページを作らない -------------------------
const inbound = page => pages.filter(other => other !== page && read(other).includes(`href="${page}"`)).length;
for (const page of [...READING_SET, "volunteer-centers.html", "reconstruction.html", "municipality-updates.html"]) {
  assert.ok(inbound(page) >= 3, `${page}: 他ページからのリンクが${inbound(page)}件しかありません`);
}

// ---- 変更した資産のキャッシュバスター ----------------------------------------
// 上げ忘れると、利用者には古いCSS/JSが出たままになる。
for (const page of pages) {
  const html = read(page);
  for (const asset of ["org-site.js", "org-site.css", "official-timeline.css"]) {
    if (!html.includes(asset)) continue;
    assert.match(html, new RegExp(`${asset.replace(".", "\\.")}\\?v=[0-9a-z-]+`), `${page}: ${asset} にバージョンがありません`);
  }
}

console.log(`導線: 静的メニュー${staticNavs.size}ページ / 読み解きの帯${CARRIERS.length}ページ / メガメニュー掲載・現在地・到達性 OK`);
