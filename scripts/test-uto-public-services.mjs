import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

console.log("宇土市 公的施設・市民サービス マップ＆総合ガイド テスト開始");

// 1. HTMLファイルの検証
const htmlPath = path.join(root, "uto-public-services.html");
assert.ok(fs.existsSync(htmlPath), "uto-public-services.html が存在しません");
const html = fs.readFileSync(htmlPath, "utf8");

assert.ok(html.includes("<!DOCTYPE html>"), "DOCTYPEがありません");
assert.ok(html.includes("宇土市 公的施設・市民サービス マップ＆総合ガイド"), "タイトルが正しく設定されていません");
assert.ok(html.includes("vendor/leaflet/leaflet.js"), "Leaflet JSが読み込まれていません");
assert.ok(html.includes("vendor/leaflet/leaflet.css"), "Leaflet CSSが読み込まれていません");
assert.ok(html.includes("uto-public-services.js"), "専用スクリプトが読み込まれていません");
assert.ok(html.includes("uto-public-services.css"), "専用スタイルシートが読み込まれていません");
assert.ok(html.includes('id="publicServicesMap"'), "マップ表示コンテナがありません");
assert.ok(html.includes('id="facilityCardsContainer"'), "施設カードコンテナがありません");
assert.ok(html.includes('id="serviceSearchInput"'), "検索入力欄がありません");
assert.ok(html.includes('id="catFilterGroup"'), "カテゴリフィルターがありません");
assert.ok(html.includes('id="targetFilterGroup"'), "対象者フィルターがありません");
assert.ok(html.includes('id="areaFilterGroup"'), "地域フィルターがありません");
assert.ok(html.includes('id="quickTagsGroup"'), "クイックタググループがありません");
assert.ok(html.includes('id="openNowCheckbox"'), "開館中トグルがありません");
assert.ok(html.includes('id="facilityTableContainer"'), "コンパクト一覧テーブルコンテナがありません");
assert.ok(html.includes('id="btnViewCards"'), "カード表示切り替えボタンがありません");
assert.ok(html.includes('id="btnViewTable"'), "テーブル表示切り替えボタンがありません");
assert.ok(html.includes('id="btnResetMapView"'), "全体表示リセットボタンがありません");
assert.ok(html.includes('id="btnLocateUser"'), "現在地ボタンがありません");
assert.ok(html.includes('id="btnToggleFullscreen"'), "全画面切り替えボタンがありません");
assert.ok(html.includes('id="btnExitFullscreenFloating"'), "全画面解除フローティングボタンがありません");
assert.ok(html.includes('id="mapGestureHint"'), "ジェスチャーヒント要素がありません");
assert.ok(html.includes("<noscript>"), "noscriptフォールバックがありません");

// 2. CSSファイルの検証
const cssPath = path.join(root, "uto-public-services.css");
assert.ok(fs.existsSync(cssPath), "uto-public-services.css が存在しません");
const css = fs.readFileSync(cssPath, "utf8");
assert.ok(css.includes("#publicServicesMap"), "地図コンテナのスタイルがありません");
assert.ok(css.includes(".uto-service-card"), "施設カードのスタイルがありません");
assert.ok(css.includes(".uto-map-pin"), "カスタムピンのスタイルがありません");
assert.ok(css.includes(".status-badge"), "開館状況バッジのスタイルがありません");
assert.ok(css.includes(".btn-card-fav"), "お気に入りボタンのスタイルがありません");
assert.ok(css.includes(".uto-compact-table"), "コンパクトテーブルのスタイルがありません");
assert.ok(css.includes(".map-fs-exit-btn"), "全画面解除フローティングボタンのスタイルがありません");

// 3. JSファイルの検証とデータ構造の検査
const jsPath = path.join(root, "uto-public-services.js");
assert.ok(fs.existsSync(jsPath), "uto-public-services.js が存在しません");
const jsContent = fs.readFileSync(jsPath, "utf8");
assert.ok(jsContent.includes("window.focusFacilityCard"), "focusFacilityCard 関数が定義されていません");
assert.ok(jsContent.includes("window.toggleMapFullscreen"), "toggleMapFullscreen 関数が定義されていません");

// JSコードから FACILITIES 配列を抽出して検査
const match = jsContent.match(/const FACILITIES = (\[[\s\S]*?\]);\s*\n\s*\/\//);
assert.ok(match, "FACILITIES 配列の抽出に失敗しました");

const facilitiesJson = match[1];
// vmコンテキストで安全に評価
const context = {};
vm.runInNewContext(`facilities = ${facilitiesJson}`, context);
const facilities = context.facilities;

assert.equal(facilities.length, 27, `施設数は27件である必要があります（現在: ${facilities.length}件）`);

const expectedCats = new Set(["admin", "child", "health", "welfare", "culture", "sports", "safety"]);
const expectedAreas = new Set(["central", "west", "north"]);
const foundCats = new Set();
const seenIds = new Set();

for (const f of facilities) {
  assert.ok(f.id, `IDが未定義の施設があります: ${JSON.stringify(f)}`);
  assert.ok(!seenIds.has(f.id), `IDが重複しています: ${f.id}`);
  seenIds.add(f.id);

  assert.ok(f.name, `名称が未定義: ${f.id}`);
  assert.ok(f.ruby, `ふりがなが未定義: ${f.id}`);
  assert.ok(f.address, `住所が未定義: ${f.id}`);
  assert.ok(f.address.includes("宇土市"), `住所に宇土市が含まれていません: ${f.address}`);

  assert.ok(typeof f.lat === "number" && f.lat >= 32.6 && f.lat <= 32.8, `緯度が不正です: ${f.name} (${f.lat})`);
  assert.ok(typeof f.lng === "number" && f.lng >= 130.45 && f.lng <= 130.8, `経度が不正です: ${f.name} (${f.lng})`);

  assert.ok(expectedCats.has(f.cat), `未知のカテゴリです: ${f.cat} in ${f.name}`);
  foundCats.add(f.cat);

  assert.ok(expectedAreas.has(f.area), `未知のエリアです: ${f.area} in ${f.name}`);
  assert.ok(f.areaLabel, `エリア名が未定義: ${f.name}`);
  assert.ok(Array.isArray(f.openDays) && f.openDays.length > 0, `営業曜日が未定義: ${f.name}`);
  assert.ok(Array.isArray(f.quickTags) && f.quickTags.length > 0, `クイックタグが未定義: ${f.name}`);

  assert.ok(Array.isArray(f.target) && f.target.length > 0, `対象者が未定義: ${f.name}`);
  assert.ok(f.targetLabel, `対象者ラベルが未定義: ${f.name}`);
  assert.ok(f.hours, `利用時間が未定義: ${f.name}`);
  assert.ok(f.closed, `休館日が未定義: ${f.name}`);
  assert.ok(f.fee, `料金情報が未定義: ${f.name}`);
  assert.ok(f.parking, `駐車場情報が未定義: ${f.name}`);
  assert.ok(f.phone, `電話番号が未定義: ${f.name}`);
  assert.ok(/^0964-/.test(f.phone), `市外局番が0964ではありません: ${f.name} (${f.phone})`);
  assert.ok(f.desc, `説明文が未定義: ${f.name}`);
  assert.ok(Array.isArray(f.services) && f.services.length >= 2, `公的サービスが2件以上記載されていません: ${f.name}`);
}

assert.equal(foundCats.size, expectedCats.size, "7分野すべてのカテゴリに施設が存在する必要があります");

// 4. OGP画像の存在とサイズ検査
const ogpPath = path.join(root, "ogp-uto-public-services.png");
assert.ok(fs.existsSync(ogpPath), "ogp-uto-public-services.png が存在しません");
const ogpStat = fs.statSync(ogpPath);
assert.ok(ogpStat.size > 50000, "OGP画像のファイルサイズが小さすぎます");

console.log(`宇土市 公的施設・市民サービス マップ＆総合ガイド テスト OK（全${facilities.length}施設・7分野・座標・サービス検証完了）`);
