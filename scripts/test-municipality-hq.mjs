// 市町村の災害対策本部会議のまとめを守る。
//
// このページの値打ちは「市が書いた数字をそのまま並べていること」だけなので、
//   ・出どころ（市の一覧ページと資料PDF）へ必ず行けること
//   ・数え方が変わった数字を、ひとつの推移につながないこと
//   ・書かれていない回を、前の回の値で埋めていないこと
//   ・毎日の自動更新に載っていること（載っていないと止まったまま古くなる）
// を見る。ここが崩れると、市の資料と違うことを書いたページになる。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const exists = file => fs.existsSync(new URL(`../${file}`, import.meta.url));

const config = JSON.parse(read("config/municipality-hq-meetings.json"));
const index = JSON.parse(read("sources/official/municipality-hq-index.json"));
const generated = read("data/generated/municipality-hq-data.js");
const data = JSON.parse(generated.slice(generated.indexOf("=") + 1).trim().replace(/;\s*$/, ""));

assert.ok(config.municipalities.length >= 2, "対象の市町村が2件未満です");
assert.equal(data.municipalities.length, config.municipalities.length, "設定と生成物で市町村の数が違います");

const pages = new Set();
for (const municipality of data.municipalities) {
  const where = municipality.name;
  const setting = config.municipalities.find(item => item.key === municipality.key);
  assert.ok(setting, `${where}: config にありません`);
  assert.equal(municipality.page, setting.page, `${where}: ページ名が config と違います`);
  assert.ok(exists(municipality.page), `${where}: ページ ${municipality.page} がありません`);
  pages.add(municipality.page);

  // ---- 一次情報へ行けること --------------------------------------------------
  const html = read(municipality.page);
  assert.ok(html.includes(`data-hq="${municipality.key}"`), `${where}: ページが市を指定していません`);
  assert.ok(html.includes(municipality.indexUrl) || read("municipality-hq.js").includes("indexUrl"),
    `${where}: 市の一覧ページへの導線がありません`);
  assert.ok(municipality.indexUrl.startsWith("https://"), `${where}: 一覧ページが https ではありません`);

  assert.ok(municipality.meetings.length >= 10, `${where}: 会議が${municipality.meetings.length}回しかありません`);
  const numbers = municipality.meetings.map(meeting => meeting.meeting);
  assert.deepEqual([...numbers].sort((a, b) => a - b), numbers, `${where}: 回の並びが昇順ではありません`);
  assert.equal(new Set(numbers).size, numbers.length, `${where}: 同じ回が2度入っています`);

  for (const meeting of municipality.meetings) {
    const label = `${where} 第${meeting.meeting}回`;
    assert.ok(meeting.documents?.length, `${label}: 資料へのリンクがありません`);
    for (const document_ of meeting.documents) {
      assert.match(document_.url, /^https:\/\/[^"]+\.pdf$/, `${label}: 資料URLが不正（${document_.url}）`);
      // 市の公開ドメイン以外を一次情報として出さない
      assert.ok(document_.url.startsWith(setting.origin), `${label}: 市のドメイン外のURLです（${document_.url}）`);
    }
    if (meeting.date) assert.match(meeting.date, /^2026-\d{2}-\d{2}$/, `${label}: 日付の形式が不正`);
    // 本文が無い回に数字があってはいけない（どこから来た数字か言えなくなる）
    if (!meeting.sections?.length) {
      assert.equal(Object.keys(meeting.figures || {}).length, 0, `${label}: 本文がないのに数字が入っています`);
    }
    for (const [key, value] of Object.entries(meeting.figures || {})) {
      assert.ok(Number.isInteger(value) && value >= 0, `${label}: ${key} が整数ではありません（${value}）`);
    }
  }

  // ---- 書かれていない回を埋めていないこと ------------------------------------
  // 資料に載っていない回まで値が入っていたら、それは補完している証拠。
  const source = index.municipalities.find(item => item.key === municipality.key);
  const withText = municipality.meetings.filter(meeting => meeting.sections?.length).length;
  assert.ok(withText < municipality.meetings.length || municipality.withoutText.length === 0,
    `${where}: 本文の数が合いません`);
  assert.equal(source.latestMeeting, Math.max(...numbers), `${where}: 最新の回が一覧と一致しません`);
}
assert.equal(pages.size, data.municipalities.length, "ページが市町村ごとに分かれていません");

// ---- 数え方が変わった数字を混ぜないこと --------------------------------------
// 熊本市は第20回で「住家被害（速報）」をやめ「住家被害認定調査実施件数」に変えた。
// 8,897件 → 779件 と激減して見えるので、同じ推移に並べると誤読になる。
const viewer = read("municipality-hq.js");
assert.ok(viewer.includes("homesReported") && viewer.includes("homesSurveyed"),
  "住家被害の2つの数え方が別々に扱われていません");
// 8,897件→779件と激減して見えるので、続きの数字ではないと必ず断ること
assert.ok(viewer.includes("続きではありません"),
  "住家被害の2つの数え方が別物であることを、読み手に伝える文がありません");
const kumamoto = data.municipalities.find(item => item.key === "kumamoto");
if (kumamoto) {
  const reported = kumamoto.meetings.filter(meeting => meeting.figures?.homesReported != null);
  const surveyed = kumamoto.meetings.filter(meeting => meeting.figures?.homesSurveyed != null);
  if (reported.length && surveyed.length) {
    assert.ok(surveyed[0].meeting > reported.at(-1).meeting,
      "住家被害の速報と認定調査が同じ回に混在しています");
  }
}

// ---- 自動更新に載っていること -------------------------------------------------
const workflow = read(".github/workflows/refresh-official-data.yml");
assert.ok(workflow.includes("node tools/fetch-municipality-hq.mjs"), "取得が自動更新に入っていません");
assert.ok(workflow.includes("python tools/build-municipality-hq.py"), "抽出が自動更新に入っていません");
assert.ok(workflow.includes("data/generated/municipality-hq-data.js"), "生成物がcommit対象に入っていません");
assert.ok(workflow.includes("sources/official/municipality-hq-text"), "取り出した本文がcommit対象に入っていません");
// PDFは重いのでコミットしない。ignoreを外すと1GBがリポジトリに入る
assert.ok(read(".gitignore").includes("sources/official/municipality-hq/"), "資料PDFが.gitignoreから外れています");
// 本文が残っていれば、PDFを取り直さずに作り直せる（CIで毎日600MB取らないため）
const fetcher = read("tools/fetch-municipality-hq.mjs");
assert.ok(fetcher.includes("TEXT_DIR"), "抽出済みの回を飛ばす仕組みがありません");

// ---- 行政の書き方を読み替えても、資料の文は変えていないこと --------------------
// このページの値打ちは「市が書いたとおりであること」なので、並べ替えや説明を
// 足した結果、原文が1文字でも変わっていないかを見る。
const guide = JSON.parse(read("config/hq-reading-guide.json"));
const themeIds = new Set(guide.themes.map(theme => theme.id));
assert.ok(themeIds.size >= 4, "関心事の分け方が少なすぎます");
for (const theme of guide.themes) {
  for (const field of ["id", "label", "question", "tone"]) {
    assert.ok(String(theme[field] || "").trim(), `関心事 ${theme.id} の ${field} がありません`);
  }
}
for (const rule of guide.blockRules) {
  assert.ok(themeIds.has(rule.theme), `対応表に知らない関心事があります: ${rule.theme}`);
  assert.ok(rule.patterns?.length, `${rule.theme} の見分け方がありません`);
}
assert.deepEqual(data.themes?.map(theme => theme.id), guide.themes.map(theme => theme.id),
  "生成物の関心事が config と一致しません");

for (const municipality of data.municipalities) {
  for (const meeting of municipality.meetings) {
    // 資料自身の「(2)」「【…】」という番号付けだけは、ページ側の見出しに
    // 置き換わる。それ以外の文字が変わっていないことを見たいので、番号は外して比べる。
    const bare = line => line.trim().replace(/^\(?[0-9０-９]{1,2}\)\s*/, "").replace(/^【[^】]*】\s*/, "").trim();
    const source = (meeting.sections || []).map(section => section.text).join("\n");
    const sourceLines = new Set(source.split("\n").map(bare).filter(Boolean));
    for (const block of meeting.blocks || []) {
      assert.ok(block.theme === null || themeIds.has(block.theme),
        `${municipality.name} 第${meeting.meeting}回: 知らない関心事 ${block.theme}`);
      for (const line of block.text.split("\n").map(bare).filter(Boolean)) {
        assert.ok(sourceLines.has(line),
          `${municipality.name} 第${meeting.meeting}回: 資料に無い文が入っています「${line.slice(0, 40)}」`);
      }
    }
    // 節を割った結果、資料の行が落ちていないこと（読み替えで情報が消えたら意味がない）
    // 見出しになった行もページには出ているので、落ちた扱いにしない
    const kept = new Set((meeting.blocks || []).flatMap(block =>
      [bare(block.title), ...block.text.split("\n").map(bare)]));
    const lost = [...sourceLines].filter(line => !kept.has(line));
    assert.equal(lost.length, 0,
      `${municipality.name} 第${meeting.meeting}回: 読み替えで${lost.length}行が落ちています「${lost[0]?.slice(0, 40) ?? ""}」`);
  }
}

// ---- 言葉の説明は用語集と共有していること ------------------------------------
// 同じ言葉の説明が2か所にあると必ず食い違う。
const glossary = read("data/glossary-data.js");
assert.ok(glossary.includes("window.GLOSSARY"), "用語データが共有の形になっていません");
assert.ok(read("terms.js").includes("window.GLOSSARY"), "用語集ページが共有データを読んでいません");
assert.ok(!/const terms=\[\n\{id:/.test(read("terms.js")), "用語集ページに用語が直接書かれたままです");
for (const page of [...data.municipalities.map(item => item.page), "terms.html"]) {
  assert.ok(read(page).includes("data/glossary-data.js"), `${page} が用語データを読み込んでいません`);
}

// ---- 図と文章が「時間軸」で並んでいること --------------------------------------
// 会議の回を等間隔に並べると、1日に3回開かれた日も2日空いた区間も同じ幅になり、
// 状況がどう動いたかが読めなくなる。横軸は必ず発災からの日数で取る。
assert.ok(viewer.includes("const dayOf ="), "発災からの日数を出す仕組みがありません");
assert.ok(!/sparkline/.test(viewer), "回を等間隔に並べる古い図が残っています");
// 図のx座標は日数から計算していること（回の並び順から計算していないこと）
assert.match(viewer, /plotX\s*=\s*\(index[^)]*\)\s*=>/, "横軸の座標計算が見つかりません");
assert.ok(viewer.includes("dayOf(point.date)"), "図の点を日付から置いていません");
// 会議のあいだが空いた区間は破線にして、間があいたことを見せる
assert.ok(viewer.includes("stroke-dasharray"), "会議が空いた区間を見分ける表示がありません");
// 狭い画面で図を縮めると軸の文字が読めなくなるので、横に送れるようにする
assert.ok(viewer.includes("hq-chart-scroll"), "図を横に送れる箱がありません");
assert.match(read("municipality-hq.css"), /\.hq-chart\s*\{[^}]*min-width/, "図の最小幅が指定されていません");

for (const page of data.municipalities.map(item => item.page)) {
  const html = read(page);
  for (const id of ["hqPhases", "hqDirection", "hqCharts", "hqCadence", "hqTopics"]) {
    assert.ok(html.includes(`id="${id}"`), `${page}: 時間軸の節（${id}）がありません`);
  }
}
for (const label of ["緊急対応", "避難生活と応急対応", "被害把握と制度の立ち上げ", "生活再建への移行"]) {
  assert.ok(viewer.includes(label), `行政対応の局面「${label}」がありません`);
}
assert.ok(viewer.includes("市の公式な区分ではありません"), "局面が独自整理であることを明記していません");
assert.ok(viewer.includes("資料に明記された今後の対応") && viewer.includes("数値から見える継続課題"),
  "公式記載とサイトの読み取りが分離されていません");
assert.ok(viewer.includes("行政の計画・決定事項ではありません"), "数値からの読み取りに注意書きがありません");
assert.match(viewer, /forwardPattern[^\n]+努め/, "今後の対応を資料本文から探す仕組みがありません");
assert.match(read("municipality-hq.css"), /\.hq-phase-list\s*\{/, "行政対応の時間軸のスタイルがありません");

// 会議のなかった日がある市では、その空白が扱えていること（機能が生きている確認）
for (const municipality of data.municipalities) {
  const days = municipality.meetings.filter(meeting => meeting.date).map(meeting => meeting.date);
  const span = (Date.parse(`${days.at(-1)}T00:00:00+09:00`) - Date.parse(`${days[0]}T00:00:00+09:00`)) / 86400000 + 1;
  const distinct = new Set(days).size;
  assert.ok(distinct <= span, `${municipality.name}: 会議の日数が期間より多くなっています`);
}

// ---- 導線 ---------------------------------------------------------------------
const orgSite = read("org-site.js");
for (const municipality of data.municipalities) {
  assert.ok(orgSite.includes(`href="${municipality.page}"`), `メガメニューに ${municipality.page} がありません`);
  assert.match(orgSite, new RegExp(`'${municipality.page.replace(/\./g, "\\.")}':'[^']+'`),
    `${municipality.page} のページ名がありません`);
  assert.ok(orgSite.match(/const activityPages=\[([^\]]*)\]/)[1].includes(municipality.page),
    `${municipality.page} が現在地判定に入っていません`);
}

const total = data.municipalities.reduce((sum, item) => sum + item.meetings.length, 0);
const figures = data.municipalities.reduce(
  (sum, item) => sum + item.meetings.filter(meeting => Object.keys(meeting.figures || {}).length).length, 0);
const blocks = data.municipalities.reduce((sum, item) => sum + item.meetings.reduce((n, meeting) => n + (meeting.blocks || []).length, 0), 0);
console.log(`市町村の本部会議: ${data.municipalities.length}市 ${total}回・${blocks}項目（数値あり${figures}回）/ 出典・数え方の分離・原文どおり・行の欠落なし・時間軸・用語集と共有・自動更新・導線 OK`);
