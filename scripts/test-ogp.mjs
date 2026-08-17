// SNSやLINEに貼られたときの見え方を守る。
//
// 貼られた瞬間に読まれるのはタイトルと画像だけなので、
//   ・指しているファイルが実際にあること（404だと画像なしで貼られる）
//   ・1200x630 であること（比が違うと切られて文字が消える）
//   ・宣言している幅・高さが実物と合っていること
//   ・ページごとに違う画像を持たせたページが、共通画像に戻っていないこと
// を見る。画像は python3 tools/build-ogp-images.py で作る。
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), "utf8");
const pages = fs.readdirSync(root).filter(file => file.endsWith(".html") && !file.startsWith("google"));
const SITE = "https://www.yokatainet.jp";

// PNGのヘッダから実際の縦横を読む（宣言値を信じない）
const pngSize = file => {
  const head = fs.readFileSync(new URL(file, root)).subarray(0, 33);
  assert.equal(head.subarray(1, 4).toString(), "PNG", `${file}: PNGではありません`);
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
};

const REQUIRED = ["og:type", "og:locale", "og:site_name", "og:title", "og:description", "og:url",
  "og:image", "og:image:secure_url", "og:image:type", "og:image:width", "og:image:height", "og:image:alt"];

const used = new Map();
for (const page of pages) {
  const html = read(page);
  for (const property of REQUIRED) {
    assert.match(html, new RegExp(`property="${property}" content="[^"]+"`), `${page}: ${property} がありません`);
  }
  for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    assert.match(html, new RegExp(`name="${name}" content="[^"]+"`), `${page}: ${name} がありません`);
  }
  assert.match(html, /name="twitter:card" content="summary_large_image"/, `${page}: 大きなカードで出す指定が必要です`);

  const image = html.match(/property="og:image" content="([^"]+)"/)[1];
  assert.ok(image.startsWith(`${SITE}/`), `${page}: og:image は絶対URLである必要があります（${image}）`);
  const file = image.slice(SITE.length + 1);
  assert.ok(fs.existsSync(new URL(file, root)), `${page}: og:image のファイルがありません（${file}）`);

  // 実物の寸法と、宣言している寸法が合っていること
  const { width, height } = pngSize(file);
  assert.equal(width, 1200, `${file}: 幅が${width}pxです（1200pxにしてください）`);
  assert.equal(height, 630, `${file}: 高さが${height}pxです（630pxにしてください）`);
  const declaredWidth = html.match(/property="og:image:width" content="(\d+)"/)[1];
  const declaredHeight = html.match(/property="og:image:height" content="(\d+)"/)[1];
  assert.equal(Number(declaredWidth), width, `${page}: 宣言した幅と実物が違います`);
  assert.equal(Number(declaredHeight), height, `${page}: 宣言した高さと実物が違います`);

  // twitter:image と og:image が食い違わないこと
  assert.equal(html.match(/name="twitter:image" content="([^"]+)"/)[1], image, `${page}: twitter:image が og:image と違います`);
  // canonical と og:url が食い違わないこと
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical) assert.equal(html.match(/property="og:url" content="([^"]+)"/)[1], canonical, `${page}: og:url と canonical が違います`);

  used.set(page, file);
}

// ---- ページ専用の画像 --------------------------------------------------------
// 力を入れたページが共通画像に戻ると、貼られたときに中身が伝わらない。
const builder = read("tools/build-seo.mjs");
const generator = read("tools/build-ogp-images.py");
const DEDICATED = ["uto-waste.html", "uto-bulletin.html", "uto-housing.html", "alert-channels.html",
  "volunteer-centers.html", "official-timeline.html", "official-water-recovery.html", "official-response-tracks.html"];
for (const page of DEDICATED) {
  const file = used.get(page);
  assert.ok(file, `${page} が見つかりません`);
  assert.ok(!["ogp-disaster.png", "ogp-organization.png"].includes(file),
    `${page}: 共通画像（${file}）ではなく専用の画像を割り当ててください`);
  assert.match(builder, new RegExp(`"${page}",\\s*"/${file.replace(".", "\\.")}"`), `tools/build-seo.mjs に ${page} の割り当てがありません`);
}
// 専用画像は使い回さない（別のページが同じ絵だと区別が付かない）
const dedicatedFiles = DEDICATED.map(page => used.get(page));
assert.equal(new Set(dedicatedFiles).size, dedicatedFiles.length, "専用画像が複数のページで使われています");

// 生成器の一覧と、実際の割り当てが揃っていること（作り忘れ・消し忘れを防ぐ）
for (const page of DEDICATED) {
  if (page === "uto-waste.html") continue; // これだけ手作りの画像
  assert.ok(generator.includes(`file="${page}"`), `tools/build-ogp-images.py に ${page} がありません`);
  assert.ok(generator.includes(`out="${used.get(page)}"`), `tools/build-ogp-images.py の出力名が ${used.get(page)} と一致しません`);
}

const shared = [...used.values()].filter(file => file === "ogp-disaster.png").length;
console.log(`OGP: ${pages.length}ページ / 専用画像${new Set(dedicatedFiles).size}枚・共通${shared}ページ / 実寸1200x630・宣言一致・canonical一致 OK`);
