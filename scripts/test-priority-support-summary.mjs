import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "priority-support-summary.html");
const cssPath = path.join(root, "priority-support-summary.css");
const jsPath = path.join(root, "priority-support-summary.js");
const ogpPath = path.join(root, "ogp-priority-support.png");

// 1. ファイル実体の存在確認
assert.ok(fs.existsSync(htmlPath), "priority-support-summary.html が存在しません");
assert.ok(fs.existsSync(cssPath), "priority-support-summary.css が存在しません");
assert.ok(fs.existsSync(jsPath), "priority-support-summary.js が存在しません");
assert.ok(fs.existsSync(ogpPath), "ogp-priority-support.png が存在しません");

const html = fs.readFileSync(htmlPath, "utf8");

// 2. 基本メタタグ・SEO検証
assert.match(html, /<title>.*熊本市・宇土市・宇城市・氷川町・八代市.*災害支援制度のまとめ・比較.*<\/title>/, "適切なtitleがありません");
assert.match(html, /<meta\s+name="description"\s+content="[^"]+">/, "descriptionがありません");
assert.match(html, /<link\s+rel="canonical"\s+href="https:\/\/www\.yokatainet\.jp\/priority-support-summary\.html">/, "canonicalが正しくありません");
assert.match(html, /<meta\s+property="og:image"\s+content="https:\/\/www\.yokatainet\.jp\/ogp-priority-support\.png">/, "OGP画像指定が一致しません");

// 3. 5自治体の網羅確認
const MUNICIPALITIES = ["熊本市", "宇土市", "宇城市", "氷川町", "八代市"];
for (const muni of MUNICIPALITIES) {
  assert.ok(html.includes(muni), `${muni} の記述がHTML内に見つかりません`);
}

// 4. 全20制度の存在確認（data-program属性）
const EXPECTED_PROGRAMS = [
  "rebuild",
  "repair",
  "rental-housing",
  "const-housing",
  "demolition",
  "emergency-repair",
  "disaster-loan",
  "emergency-small-loan",
  "condolence",
  "local-condolence",
  "insurance-reduction",
  "medical-exemption",
  "tax-reduction",
  "water-reduction",
  "waste",
  "well-septic",
  "hotel-bath",
  "certificate",
  "jizokuka",
  "agriculture"
];

assert.equal(EXPECTED_PROGRAMS.length, 20, "20制度が定義されていること");
for (const prog of EXPECTED_PROGRAMS) {
  assert.match(html, new RegExp(`data-program="${prog}"`), `マトリクス表に制度 ${prog} の行がありません`);
  assert.match(html, new RegExp(`id="card-${prog}"`), `詳細カードに制度 ${prog} がありません`);
}

// 5. 4つのステータスバッジの利用確認
const STATUS_BADGES = ["status-guide", "status-active", "status-pending", "status-na"];
for (const badge of STATUS_BADGES) {
  assert.match(html, new RegExp(`class="[^"]*${badge}[^"]*"`), `ステータスバッジ ${badge} がHTML内で使用されていません`);
}

// 6. サイト内特設ガイドへのリンク切れ確認
const INTERNAL_GUIDE_LINKS = [
  "yatsushiro-rebuild.html",
  "uto-repair.html",
  "uto-housing.html",
  "hikawa-demolition.html",
  "yatsushiro-loan.html",
  "uto-waste.html",
  "risai-certificate.html",
  "uto-jizokuka.html",
  "kumamoto-support.html",
  "uki-support.html",
  "hikawa-support.html",
  "yatsushiro-support.html"
];

for (const link of INTERNAL_GUIDE_LINKS) {
  assert.ok(html.includes(link), `サイト内特設リンク ${link} が priority-support-summary.html に含まれていません`);
  const targetFile = path.join(root, link);
  assert.ok(fs.existsSync(targetFile), `リンク先 ${link} がファイルシステムに存在しません`);
}

// 7. 5市町の総合問い合わせ先カードの確認
assert.match(html, /<h3>熊本市<\/h3>/, "熊本市の窓口カードがありません");
assert.match(html, /<h3>宇土市<\/h3>/, "宇土市の窓口カードがありません");
assert.match(html, /<h3>宇城市<\/h3>/, "宇城市の窓口カードがありません");
assert.match(html, /<h3>氷川町<\/h3>/, "氷川町の窓口カードがありません");
assert.match(html, /<h3>八代市<\/h3>/, "八代市の窓口カードがありません");

// 8. データマスター sources/priority-support-matrix.json との整合性検査
const matrixPath = path.join(root, "sources", "priority-support-matrix.json");
assert.ok(fs.existsSync(matrixPath), "sources/priority-support-matrix.json が存在しません");
const matrixData = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
assert.ok(Array.isArray(matrixData.programs), "matrixData.programs が配列ではありません");
assert.equal(matrixData.programs.length, 20, "20制度が定義されていること");

const MUNI_KEYS = {
  "熊本市": "kumamoto",
  "宇土市": "uto",
  "宇城市": "uki",
  "氷川町": "hikawa",
  "八代市": "yatsushiro"
};

// 井戸支援は全5市町で公式受付中であること
const wellProg = matrixData.programs.find(p => p.id === "well-septic");
assert.ok(wellProg, "well-septic が存在しません");
for (const [name, key] of Object.entries(MUNI_KEYS)) {
  assert.equal(wellProg.data[key]?.status, "active", `well-septic の ${name} は受付中 (active) である必要があります`);
}

// 八代市の税減免は準備中（事前相談）であること
const taxProg = matrixData.programs.find(p => p.id === "tax-reduction");
assert.ok(taxProg, "tax-reduction が存在しません");
assert.equal(taxProg.data["yatsushiro"]?.status, "pending", "八代市の税減免は準備中 (pending) である必要があります");
assert.equal(taxProg.data["uto"]?.status, "active", "宇土市の税減免は受付中 (active) である必要があります");

console.log("5市町 災害支援制度まとめ・比較ページ検査（5市町・全20制度・4ステータス・特設リンク・SEO・窓口・精査データ整合性）: すべて合格");
