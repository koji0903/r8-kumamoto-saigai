// くまもと事業者再出発支援補助金ガイドが熊本県公式募集要領・説明資料に準拠しているかを検証するテスト。
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const exists = file => fs.existsSync(new URL(`../${file}`, import.meta.url));

// ---- ファイル存在確認 --------------------------------------------------------
assert.ok(exists("kumamoto-saishuppatsu.html"), "kumamoto-saishuppatsu.html が存在しません");
assert.ok(exists("kumamoto-saishuppatsu.css"), "kumamoto-saishuppatsu.css が存在しません");
assert.ok(exists("kumamoto-saishuppatsu.js"), "kumamoto-saishuppatsu.js が存在しません");
assert.ok(exists("ogp-kumamoto-saishuppatsu.png"), "ogp-kumamoto-saishuppatsu.png が存在しません");
assert.ok(exists("sources/official/subsidy/kumamoto-saishuppatsu.txt"), "抽出テキストファイルが存在しません");
assert.ok(exists("sources/official/subsidy/kumamoto-saishuppatsu-vehicles.txt"), "車両取扱いの抽出テキストが存在しません");
assert.ok(exists("sources/official/subsidy/kumamoto-saishuppatsu-multiple-disaster.txt"), "多重被災マニュアルの抽出テキストが存在しません");
assert.ok(exists("sources/official/subsidy/kumamoto-saishuppatsu-briefing.txt"), "説明会チラシの抽出テキストが存在しません");

const html = read("kumamoto-saishuppatsu.html");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const js = read("kumamoto-saishuppatsu.js");

// ---- 基本メタ・タイトル ------------------------------------------------------
assert.match(html, /<title>[^<]*くまもと事業者再出発支援補助金[^<]*<\/title>/, "適切なタイトルが設定されていません");
assert.match(html, /<meta\s+name=["']description["']\s+content=["'][^"']+["']/, "descriptionメタタグが設定されていません");

// ---- 公式出典リンク ---------------------------------------------------------
const officialPdf = "https://www.pref.kumamoto.jp/uploaded/life/279584_891460_misc.pdf";
assert.ok(html.includes(officialPdf), "熊本県公式PDFへのリンクが含まれていません");
assert.match(text, /熊本県商工労働部\s*商工振興金融課/, "熊本県公式担当課の明記が必要です");
// 概要以外の公式資料（車両の取扱い・多重被災マニュアル・説明会案内）への導線
assert.ok(html.includes("https://www.pref.kumamoto.jp/uploaded/life/279584_891461_misc.pdf"), "車両の取扱いPDFへのリンクが必要です");
assert.ok(html.includes("https://www.pref.kumamoto.jp/uploaded/life/279584_891462_misc.pdf"), "多重被災事業者申請マニュアルPDFへのリンクが必要です");
assert.ok(html.includes("https://www.pref.kumamoto.jp/soshiki/61/280503.html"), "事業者向け説明会ページへのリンクが必要です");
assert.match(text, /令和8年9月18日/, "資料の作成日（令和8年9月18日時点）の明記が必要です");
assert.match(text, /096-333-2338/, "商工振興金融課 企業復興支援班の電話番号が必要です");

// ---- 4つの補助区分と補助率・上限額 -------------------------------------------
assert.match(text, /中小企業・小規模事業者/, "中小企業・小規模事業者区分の記載が必要です");
assert.match(text, /3\/4/, "中小企業等の補助率3/4の記載が必要です");
assert.match(text, /中堅企業/, "中堅企業区分の記載が必要です");
assert.match(text, /1\/2/, "中堅企業の補助率1/2の記載が必要です");
assert.match(text, /多重被災事業者/, "多重被災事業者区分の記載が必要です");
assert.match(text, /定額.*5億円|5億円.*10\/10/, "多重被災の5億円定額補助の記載が必要です");
assert.match(text, /特定被災事業者/, "特定被災事業者区分の記載が必要です");
assert.match(text, /15億円/, "上限15億円の記載が必要です");

// ---- 重要要件（事前着手・写真・見積・BCP・保険） ----------------------------
assert.match(text, /事前着手/, "事前着手特例の説明が必要です");
assert.match(text, /令和8年7月28日/, "発災日（令和8年7月28日）以降の着手要件が必要です");
assert.match(text, /写真/, "被災状況・施工前後の写真保管案内が必要です");
assert.match(text, /2者以上|相見積/, "100万円以上の2者以上見積合わせ要件が必要です");
assert.match(text, /BCP|事業継続計画/, "BCP策定要件が必要です");
assert.match(text, /損害保険|共済/, "自然災害損害保険等の加入要件が必要です");
assert.match(text, /永久抹消|廃車/, "車両入替における旧車永久抹消（下取り不可）の要件が必要です");
assert.match(text, /運行日誌/, "車両使用における運行日誌管理の要件が必要です");
assert.match(text, /申請回数は原則1回/, "申請回数（原則1回・分割時上限2回）の記載が必要です");
assert.match(text, /支出済/, "申請者自身が支出済であることの要件が必要です");

// ---- 多重被災事業者は5要件すべてを満たす必要がある（「または」で誤読させない） ----
assert.match(text, /5つの要件をすべて満たす|5要件|すべて満たす/, "多重被災事業者が全要件充足である旨の記載が必要です");
for (const disaster of ["平成28年熊本地震", "令和2年7月豪雨", "令和7年8月豪雨"]) {
  assert.ok(text.includes(disaster), `多重被災の対象となる激甚指定災害「${disaster}」の記載が必要です`);
}
assert.match(text, /認定経営革新等支援機関/, "多重被災要件3イの認定経営革新等支援機関の記載が必要です");

// ---- 補助対象外の事業者・経費 ----
for (const excluded of ["信用金庫", "法人格を有さない任意団体", "地方自治体"]) {
  assert.ok(text.includes(excluded), `補助対象外事業者「${excluded}」の記載が必要です`);
}
for (const ng of ["清掃・消毒費", "申請代行", "自社で復旧する場合の人件費", "租税公課"]) {
  assert.ok(text.includes(ng), `補助対象外経費「${ng}」の記載が必要です`);
}

// ---- 交付決定後の義務 ----
assert.match(text, /処分制限財産/, "処分制限財産の記載が必要です");
assert.match(text, /10年間/, "帳簿・証拠書類の10年間保存義務の記載が必要です");
assert.match(text, /公表/, "交付決定事業者名の公表に関する記載が必要です");
assert.match(text, /30%を超える|30％を超える/, "変更申請が必要となる減額幅（30%超）の記載が必要です");
assert.match(text, /概算払/, "概算払（1回限り）の記載が必要です");

// ---- 説明会日程 -------------------------------------------------------------
assert.match(text, /宇土市民会館/, "宇土市民会館での説明会日程が必要です");
assert.match(text, /八代ホワイトパレス 2階 タラッシオA/, "八代会場は公式チラシの表記（八代ホワイトパレス 2階 タラッシオA）に合わせる必要があります");
assert.match(text, /八代市鏡文化センター/, "八代市鏡文化センターでの説明会日程が必要です");
assert.match(text, /熊本県庁/, "熊本県庁本館での説明会日程が必要です");
assert.match(text, /御船町カルチャーセンター/, "御船町での説明会日程が必要です");
assert.match(text, /申し込みは不要|申込不要/, "説明会が申込不要である旨の記載が必要です");
assert.ok(!/定員：各回/.test(text), "説明会の人数は公式資料どおり「会場収容人数」と表記してください");

// ---- 申請窓口・電話番号 -----------------------------------------------------
assert.match(text, /ヨネザワ熊本県庁前ビル/, "申請受付センターの所在地が必要です");
assert.match(text, /電話番号.*設置後案内予定/, "電話番号案内（設置後案内予定）の記載が必要です");
assert.match(text, /10月1日/, "受付センター開設・運用開始日（10月1日）の記載が必要です");

// ---- シミュレーター機能（JavaScript） ---------------------------------------
assert.ok(js.includes("calculate"), "補助金計算ロジック（calculate）がJSに含まれている必要があります");
assert.match(html, /id=["']simCost["']/, "HTMLにシミュレーター用の入力フォーム（simCost）が必要です");
assert.match(html, /id=["']simType["']/, "HTMLに事業者区分選択（simType）が必要です");

// 特定被災事業者は「①②の補助率に準ずる」ため、中小3/4・中堅1/2を選び分けられる必要がある
const simOptions = [...html.matchAll(/<option value="([^"]+)"/g)].map(m => m[1]);
for (const value of ["sme", "mid", "multiple_sme", "multiple_mid", "specific_sme", "specific_mid"]) {
  assert.ok(simOptions.includes(value), `シミュレーターの区分 ${value} が必要です`);
  assert.ok(js.includes(`"${value}"`), `JSに区分 ${value} の計算分岐が必要です`);
}
assert.ok(!js.includes('type === "specific"'), "特定被災事業者を補助率3/4固定で扱う分岐は残さないでください");

// ---- サイト内導線確認 -------------------------------------------------------
const disasterHtml = read("disaster.html");
assert.ok(disasterHtml.includes("kumamoto-saishuppatsu.html"), "disaster.html からの導線が必要です");

const workBusinessHtml = read("reconstruction-work-business.html");
assert.ok(workBusinessHtml.includes("kumamoto-saishuppatsu.html"), "reconstruction-work-business.html からの導線が必要です");

const siteTopics = JSON.parse(read("sources/site-topics.json"));
assert.ok(siteTopics.some(t => t.url === "kumamoto-saishuppatsu.html"), "sources/site-topics.json にトピック登録が必要です");

const orgSite = read("org-site.js");
assert.match(orgSite, /'kumamoto-saishuppatsu\.html':'[^']+'/, "org-site.js にSEOタイトル登録が必要です");

console.log("くまもと事業者再出発支援補助金ガイド: 要件・4区分・説明会全日程・窓口・シミュレーター・導線 OK");
