// PC幅で文字が数文字ごとに折り返される崩れを防ぐ。
//
// 原因はほぼ2種類しかなかった。
//
//   1. 列数を決め打ちしたグリッド。画面が広くても、その箱自体が細い列に入ると
//      1枚あたりが200px前後になり、アイコン列や件数列を引いた残りに本文が
//      押し込まれる。「ライフライン」が3行、「相談を受けている方へ」が
//      「相談を/受けてい/る方へ」になっていた。
//   2. アイコン列＋本文列の2カラムなのに、HTMLの子要素の数が合っていない。
//      余った子要素が次の行のアイコン列（80px）に落ちる。
//
// どちらも「その画面幅で見る」まで気づけないので、CSSの書き方の側で止める。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
// コメントを除いてから調べる（解説文に書いた語を規則と誤認しないため）
const css = file => read(file).replace(/\/\*[\s\S]*?\*\//g, "");

// ---- 1. 中身の詰まった一覧は、幅に応じて列数を変えること --------------------
// 決め打ちの列数に戻すと、その幅でまた文字が潰れる。
const FLEXIBLE = [
  ["home-redesign.css", ".visual-category-nav"],
  ["municipality-categories.css", ".feed-category-overview>div"],
  ["navigation-enhancements.css", ".feed-period-nav>div"],
  ["timeline-redesign.css", ".modern-site .actions"],
  ["uto-waste.css", ".accepted-list"],
  ["uto-waste.css", ".waste-filter"],
  ["org-site.css", ".page-municipality-updates .feed-filter-control fieldset div"],
  ["styles.css", ".need-grid"],
  ["uto-bulletin.css", ".waste-facilities"]
];
for (const [file, selector] of FLEXIBLE) {
  const source = css(file);
  const blocks = [...source.matchAll(
    new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\{[^}]*\\}`, "g")
  )].map(match => match[0]);
  assert.ok(blocks.length, `${file}: ${selector} の定義が見つかりません`);
  const flexible = blocks.find(block => /grid-template-columns:repeat\(auto-fit,minmax\(\d+px,1fr\)\)/.test(block));
  assert.ok(flexible, `${file}: ${selector} は列数を決め打ちせず auto-fit にしてください（狭い箱に入ると本文が潰れます）`);
  const min = Number(flexible.match(/minmax\((\d+)px/)[1]);
  assert.ok(min >= 150, `${file}: ${selector} の最小幅が${min}pxでは本文が入りません`);
  // 3列以上の決め打ちは、この崩れを起こした書き方そのもの
  for (const block of blocks) {
    assert.doesNotMatch(block, /grid-template-columns:repeat\([3-9],/,
      `${file}: ${selector} に3列以上の決め打ちが残っています`);
  }
}

// ---- 2. 2カラム前提の節は、HTMLの子要素の数と合っていること -------------------
// 「相談を受けている方へ」は、アイコンを置いていないのに2カラムのままで、
// 本文がアイコン用の80px列に入っていた。
const reconstructionCss = css("reconstruction.css");
const orgSiteCss = css("org-site.css");
const reconstructionHtml = read("reconstruction.html");
const supporter = reconstructionHtml.match(/<section class="rebuild-supporter">([\s\S]*?)<\/section>/);
assert.ok(supporter, "reconstruction.html に rebuild-supporter がありません");
const hasIcon = /supporter-icon/.test(supporter[1]);
assert.ok(!hasIcon, "アイコンを足したなら .rebuild-supporter>div の列指定も戻してください");
assert.match(reconstructionCss, /\.rebuild-supporter>div\{grid-template-columns:minmax\(0,1fr\)\}/,
  "アイコンが無いので1カラムにする必要があります");
assert.match(orgSiteCss,/\.page-supporters \.page-local-nav\+\.audience-alert\{[^}]*margin-top:24px/,
  "支援者ページのページ内ナビと注意カードを重ねないでください");

// ---- 3. 列位置の指定は、2カラムになる幅だけに効かせること ---------------------
// 1カラムのモバイルで grid-column:2 を残すと、存在しない2列目が作られて
// 逆に文字が潰れる（実際にこれで壊した）。
for (const [file, selector] of [
  ["official-response-tracks.css", ".tracks-detail-block li>*:not(.tracks-detail-day)"],
  ["volunteer-centers.css", ".vc-updates>a>.vc-update-from"]
]) {
  const source = css(file);
  const line = source.split("\n").find(text => text.includes(`${selector}{grid-column:2}`));
  assert.ok(line, `${file}: ${selector} の列指定がありません`);
  assert.match(line, /@media\(min-width:\d+px\)/,
    `${file}: ${selector} の grid-column は2カラムになる幅に限定してください`);
}

// ---- 4. カードの並びを、器ごとカードにしない --------------------------------
// .supporter-needs はカードの並びそのもの。器にも枠と背景を付けると二重枠に
// なり、枚数が列数で割り切れないときは空いた側が空の枠として残る（支援する方
// ページで5枚目が枠からはみ出して見えていた）。
// 器（パネル）に枠と背景を与えているブロック。.minutes-toolbar を含む方で、
// カード1枚1枚に与えている .need-grid>a のブロックとは別物。
const panel = [...orgSiteCss.matchAll(/\.illustrated-site :is\([^)]*\)\{[^}]*\}/g)]
  .map(match => match[0])
  .find(block => block.includes(".minutes-toolbar") && /border:2px solid/.test(block));
assert.ok(panel, "org-site.css: 器の枠の指定が見つかりません");
for (const selector of [".supporter-needs", ".need-grid", ".section-links", ".compact-steps"]) {
  assert.ok(!panel.includes(`${selector},`) && !panel.includes(`${selector})`),
    `org-site.css: ${selector} はカードの並びなので、器にカードの枠を付けないでください（二重枠になり、枚数が半端なときは空の枠が残ります）`);
}

// ---- 5. 重ねて出すパネルは、閉じられること ------------------------------------
// 避難所の詳細は画面に重ねて出す。ヘッダーより後ろに置くと×ボタンがヘッダーの
// 下に隠れ、クリックがヘッダーに吸われて開いたら閉じられなくなる。
const shelterJs = read("shelters.js");
// 同じセレクタの指定が複数ファイルに散っているので、宣言されている中で
// 一番大きい値（実際に効く値）どうしを比べる。
const zOf = selector => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const values = ["styles.css", "org-site.css", "global-modern.css"]
    .flatMap(file => [...css(file).matchAll(new RegExp(`${escaped}\\{[^}]*z-index:(\\d+)`, "g"))])
    .map(match => Number(match[1]));
  return values.length ? Math.max(...values) : null;
};
const headerZ = zOf(".site-header");
const panelZ = zOf(".shelter-detail");
assert.ok(headerZ != null, "ヘッダーの重なり順が読み取れません");
assert.ok(panelZ != null, "詳細パネルの重なり順が読み取れません");
assert.ok(panelZ > headerZ,
  `詳細パネル(${panelZ})はヘッダー(${headerZ})より前に出す必要があります。後ろだと閉じるボタンが押せません`);
// 閉じ方は複数用意する（×が見つからなくても行き止まりにしない）
assert.match(shelterJs, /const closeDetail=/, "閉じる処理が必要です");
assert.match(shelterJs, /\.detail-close"\)\.onclick=closeDetail/, "×ボタンで閉じる必要があります");
assert.match(shelterJs, /shelterBackdrop"\)\.onclick=closeDetail/, "背景で閉じる必要があります");
assert.match(shelterJs, /event\.key==="Escape"/, "Escで閉じる必要があります");
// 押せる大きさにする
const closeCss = css("org-site.css").match(/\.detail-close\{[^}]*\}/);
assert.ok(closeCss, "閉じるボタンの指定が見つかりません");
for (const axis of ["width", "height"]) {
  const size = Number(closeCss[0].match(new RegExp(`${axis}:(\\d+)px`))?.[1]);
  assert.ok(size >= 44, `閉じるボタンの${axis}が${size}pxでは押しにくいです`);
}

// ---- 6. 絶対配置の印の居場所 --------------------------------------------------
// チェックマークや番号は position:absolute で置き、本文側は padding で場所を
// 空けている。あとから padding を一括指定で上書きすると、その余白が消えて印が
// 文字に重なる（「この日に進んだ対応」の1文字目がチェックの下に隠れていた）。
const timelineCss = css("timeline-redesign.css");
const marker = timelineCss.match(/\.page-timeline \.actions li:before\{[^}]*\}/);
assert.ok(marker, "timeline-redesign.css: 印の定義が見つかりません");
const markerLeft = Number(marker[0].match(/left:(\d+)px/)[1]);
const markerWidth = Number(marker[0].match(/width:(\d+)px/)[1]);
for (const file of ["timeline-redesign.css", "org-site.css"]) {
  for (const block of css(file).matchAll(/\.page-timeline \.actions li\{([^}]*)\}/g)) {
    const padding = block[1].match(/(?:^|;)padding:([^;]+)/)?.[1];
    if (!padding) continue;
    const parts = padding.trim().split(/\s+/);
    // padding の左は 1値→[0] / 2・3値→[1] / 4値→[3]
    const paddingLeft = Number((parts.length === 1 ? parts[0] : parts.length === 4 ? parts[3] : parts[1]).replace("px", ""));
    assert.ok(paddingLeft >= markerLeft + markerWidth,
      `${file}: .page-timeline .actions li の左余白が${paddingLeft}pxでは、左${markerLeft}px・幅${markerWidth}pxの印が文字に重なります`);
  }
}

// ---- 7. 暗い帯・白いカードの文字色 -------------------------------------------
// このサイトは、同じ節に「暗い帯を敷く指定」と「中身を白いカードに変える指定」が
// 別ファイルで重なっている。片方だけ変えると、白地に白・緑地に緑で文字が丸ごと
// 消える。実際に「活動前の確認事項」「一次情報を必ず確認」「議事録原本の一覧」
// などが読めなくなっていた。消えやすい組み合わせに逃げ道を用意しておく。
const orgCss = css("org-site.css");
for (const [rule, why] of [
  [/:is\(\.dark,\.dark-block,\.reconstruction-about\) :is\([^)]*h2[^)]*\)\{color:#fff\}/, "暗い帯の見出しを白にする"],
  [/\.illustrated-site \.official-shortcut :is\(h2,p\)\{color:var\(--org-deep\)\}/, "白いカードになる一次情報の節を濃い文字にする"],
  [/\.illustrated-site :is\(\.dark,\.dark-block\) \.archive-row\{color:var\(--org-deep\)\}/, "白いカードになる議事録一覧を濃い文字にする"],
  [/\.illustrated-site :is\(\.official-sources,\.source-links\) a\{color:var\(--org-deep\)\}/, "白いカードになる出典リンクを濃い文字にする"],
  [/\.illustrated-site \.vc-card>header>b\{color:#0f5b53!important\}/, "薄緑チップの状態バッジを濃い文字にする"],
  [/\.kicker\{color:#0e6e63\}/, "暗い帯の中の薄緑チップを濃い文字にする"]
]) {
  assert.match(orgCss, rule, `org-site.css: ${why}指定が必要です（外すと文字が地色と同色になって消えます）`);
}
// 選択中のボタンは塗りつぶし。件数バッジの色を戻すと地色と同色になる。
const categoriesCss = css("municipality-categories.css");
assert.match(categoriesCss, /button\[aria-pressed="true"\] b\{color:#fff\}/,
  "municipality-categories.css: 選択中フィルタの件数は白にしてください");
assert.doesNotMatch(categoriesCss, /button\[aria-pressed="true"\] b\{color:var\(--category\)\}/,
  "municipality-categories.css: 件数を分野色にすると塗りつぶしの地色と同じになります");

// ---- 8. 変更した資産のキャッシュバスター --------------------------------------
// @import で読むCSSは HTML の ?v= では更新されない。
const styles = read("styles.css");
for (const name of ["home-redesign.css", "timeline-redesign.css", "navigation-enhancements.css"]) {
  assert.match(styles, new RegExp(`@import url\\("${name.replace(".", "\\.")}\\?v=[0-9a-z-]+"\\);`),
    `styles.css: ${name} の @import に版が必要です`);
}

console.log(`レイアウト: 可変列${FLEXIBLE.length}箇所 / 2カラム前提とHTMLの一致 / 列指定の適用幅 / 地色と同色の文字の防止 / 印と文字の重なり / 二重枠の防止 / パネルを閉じられること / @importの版 OK`);
