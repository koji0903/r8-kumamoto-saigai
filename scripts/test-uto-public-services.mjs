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

assert.equal(facilities.length, 39, `施設数は39件である必要があります（現在: ${facilities.length}件）`);

const expectedCats = new Set(["admin", "child", "health", "welfare", "culture", "sports", "safety"]);
const expectedAreas = new Set(["central", "west", "north"]);
const expectedHolidayRules = new Set(["closed_holidays_and_year_end", "transfer_if_monday", "year_end_only", "ajisai_special", "always_open"]);
const foundCats = new Set();
const seenIds = new Set();

for (const f of facilities) {
  assert.ok(f.id, `IDが未定義の施設があります: ${JSON.stringify(f)}`);
  assert.ok(!seenIds.has(f.id), `IDが重複しています: ${f.id}`);
  seenIds.add(f.id);

  assert.ok(f.name, `名称が未定義: ${f.id}`);
  assert.ok(f.ruby, `ふりがなが未定義: ${f.id}`);
  assert.ok(f.address, `住所が未定義: ${f.id}`);
  assert.ok(f.address.includes("宇土市") || f.address.includes("宇城市"), `住所に宇土市または宇城市（管轄隣接自治体）が含まれていません: ${f.address}`);

  assert.ok(typeof f.lat === "number" && f.lat >= 32.6 && f.lat <= 32.8, `緯度が不正です: ${f.name} (${f.lat})`);
  assert.ok(typeof f.lng === "number" && f.lng >= 130.45 && f.lng <= 130.8, `経度が不正です: ${f.name} (${f.lng})`);

  assert.ok(expectedCats.has(f.cat), `未知のカテゴリです: ${f.cat} in ${f.name}`);
  foundCats.add(f.cat);

  assert.ok(expectedAreas.has(f.area), `未知のエリアです: ${f.area} in ${f.name}`);
  assert.ok(f.areaLabel, `エリア名が未定義: ${f.name}`);
  assert.ok(Array.isArray(f.openDays) && f.openDays.length > 0, `営業曜日が未定義: ${f.name}`);
  assert.ok(Array.isArray(f.quickTags) && f.quickTags.length > 0, `クイックタグが未定義: ${f.name}`);

  assert.ok(expectedHolidayRules.has(f.holidayRule), `未知の休館ルールです: ${f.holidayRule} in ${f.name}`);
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

// 新規追加施設の存在検証
const houkatsu = facilities.find(f => f.id === "uto_houkatsu");
assert.ok(houkatsu, "宇土市地域包括支援センターが含まれていません");
assert.equal(houkatsu.cat, "welfare");
assert.ok(houkatsu.services.some(s => s.includes("高齢者")), "包括支援センターに高齢者支援サービスが含まれていません");

const silver = facilities.find(f => f.id === "uto_silver");
assert.ok(silver, "宇土市シルバー人材センターが含まれていません");

const consumer = facilities.find(f => f.id === "uto_consumer_center");
assert.ok(consumer, "宇土市消費生活センターが含まれていません");

// 今回の拡充（7施設）の存在検証
const waterWorks = facilities.find(f => f.id === "uto_water_works");
assert.ok(waterWorks, "宇土市役所 上下水道部が含まれていません");
assert.equal(waterWorks.cat, "admin");

const eduSupport = facilities.find(f => f.id === "uto_education_support");
assert.ok(eduSupport, "宇土市教育支援センター「ほっとスペース」が含まれていません");
assert.equal(eduSupport.cat, "child");

const ukiHealth = facilities.find(f => f.id === "uki_health_office");
assert.ok(ukiHealth, "熊本県 宇城保健所が含まれていません");
assert.equal(ukiHealth.cat, "health");

const ukiPolice = facilities.find(f => f.id === "uki_police_station");
assert.ok(ukiPolice, "熊本県 宇城警察署が含まれていません");
assert.equal(ukiPolice.cat, "safety");
assert.equal(ukiPolice.holidayRule, "always_open");

const wasteCs = facilities.find(f => f.id === "uto_waste_cs_network");
assert.ok(wasteCs, "CSネットワーク（一般廃棄物持込受入施設）が含まれていません");
assert.equal(wasteCs.cat, "safety");
assert.equal(wasteCs.holidayRule, "year_end_only");

const cleanCenter = facilities.find(f => f.id === "uki_clean_center");
assert.ok(cleanCenter, "宇城クリーンセンター「うきくりん」が含まれていません");
assert.equal(cleanCenter.cat, "safety");

const tsurushiro = facilities.find(f => f.id === "uto_tsurushiro_jhs");
assert.ok(tsurushiro, "宇土市立鶴城中学校体育館（指定避難所）が含まれていません");
assert.equal(tsurushiro.cat, "safety");
assert.equal(tsurushiro.holidayRule, "always_open");

// 4. 祝日および開館判定ロジックの単体検証
// 全体JSをモック環境で評価して判定関数をテスト
const mockDom = {
  getElementById: () => ({ addEventListener: () => {}, classList: { contains: () => false } }),
  querySelectorAll: () => [],
  addEventListener: () => {}
};
const scriptContext = {
  window: {},
  document: mockDom,
  localStorage: { getItem: () => null, setItem: () => {} },
  navigator: {},
  L: null
};
vm.runInNewContext(jsContent, scriptContext);

const { getJapaneseHoliday, isYearEndNewYear, getFacilityOpenStatus } = scriptContext.window;
assert.ok(typeof getJapaneseHoliday === "function", "getJapaneseHoliday がエクスポートされていません");
assert.ok(typeof isYearEndNewYear === "function", "isYearEndNewYear がエクスポートされていません");
assert.ok(typeof getFacilityOpenStatus === "function", "getFacilityOpenStatus がエクスポートされていません");

// 祝日判定テスト
assert.equal(getJapaneseHoliday(new Date("2026-01-01T10:00:00")), "元日");
assert.equal(getJapaneseHoliday(new Date("2026-02-11T10:00:00")), "建国記念の日");
assert.equal(getJapaneseHoliday(new Date("2026-02-23T10:00:00")), "天皇誕生日");
assert.equal(getJapaneseHoliday(new Date("2026-03-20T10:00:00")), "春分の日");
assert.equal(getJapaneseHoliday(new Date("2026-05-03T10:00:00")), "憲法記念日");
assert.equal(getJapaneseHoliday(new Date("2026-05-04T10:00:00")), "みどりの日");
assert.equal(getJapaneseHoliday(new Date("2026-05-05T10:00:00")), "こどもの日");
assert.equal(getJapaneseHoliday(new Date("2026-05-06T10:00:00")), "振替休日"); // 5/3(日)憲法記念日の振替
assert.equal(getJapaneseHoliday(new Date("2026-08-11T10:00:00")), "山の日");
assert.equal(getJapaneseHoliday(new Date("2026-11-03T10:00:00")), "文化の日");
assert.equal(getJapaneseHoliday(new Date("2026-11-23T10:00:00")), "勤労感謝の日");
assert.equal(getJapaneseHoliday(new Date("2026-06-10T10:00:00")), null); // 平日は祝日なし

// 年末年始判定テスト
assert.equal(isYearEndNewYear(new Date("2026-12-28T10:00:00")), false);
assert.equal(isYearEndNewYear(new Date("2026-12-29T10:00:00")), true);
assert.equal(isYearEndNewYear(new Date("2026-12-31T10:00:00")), true);
assert.equal(isYearEndNewYear(new Date("2026-01-01T10:00:00")), true);
assert.equal(isYearEndNewYear(new Date("2026-01-03T10:00:00")), true);
assert.equal(isYearEndNewYear(new Date("2026-01-04T10:00:00")), false);

// 施設ステータス判定テスト
const cityHall = facilities.find(f => f.id === "uto_city_hall");
const fireDept = facilities.find(f => f.id === "uto_fire_north");
const library = facilities.find(f => f.id === "uto_library");

// (a) 通常の平日昼間（2026年6月10日 水曜 10:00）: 市役所は開館中
const normalWeekday = new Date("2026-06-10T10:00:00");
const st1 = getFacilityOpenStatus(cityHall, normalWeekday);
assert.equal(st1.isOpen, true, "平日の昼間に市役所が開館判定になっていません");
assert.ok(st1.text.includes("開館中"));

// (b) 祝日の平日昼間（2026年5月6日 水曜 10:00 振替休日）: 市役所・地域包括支援センターは休館！
const holidayDay = new Date("2026-05-06T10:00:00");
const st2 = getFacilityOpenStatus(cityHall, holidayDay);
assert.equal(st2.isOpen, false, "祝日に市役所が休館判定になっていません");
assert.ok(st2.text.includes("本日休館"));

const stHoukatsu = getFacilityOpenStatus(houkatsu, holidayDay);
assert.equal(stHoukatsu.isOpen, false, "祝日に地域包括支援センターが休館判定になっていません");

// (c) 年末年始（2026年12月30日 水曜 10:00）: 市役所は年末年始閉庁！
const yearEndDay = new Date("2026-12-30T10:00:00");
const st3 = getFacilityOpenStatus(cityHall, yearEndDay);
assert.equal(st3.isOpen, false, "年末年始に市役所が閉庁判定になっていません");
assert.ok(st3.text.includes("本日閉庁"));

// (d) 消防署は年末年始・祝日・夜間でも24時間常時運用中
const stFire = getFacilityOpenStatus(fireDept, yearEndDay);
assert.equal(stFire.isOpen, true, "消防署が年末年始でも開館判定になっていません");
assert.ok(stFire.text.includes("24時間"));

// (e) 図書館の月曜祝日特別開館と翌火曜振替休館
// 2026年10月12日（月・スポーツの日 祝日）
const sportsDayMonday = new Date("2026-10-12T11:00:00");
const stLib1 = getFacilityOpenStatus(library, sportsDayMonday);
assert.equal(stLib1.isOpen, true, "図書館が月曜祝日に開館判定になっていません");

// 2026年10月13日（火・月曜祝日の翌日振替休館日）
const sportsDayTransferTuesday = new Date("2026-10-13T11:00:00");
const stLib2 = getFacilityOpenStatus(library, sportsDayTransferTuesday);
assert.equal(stLib2.isOpen, false, "図書館が月曜祝日の翌日火曜に振替休館判定になっていません");
assert.ok(stLib2.text.includes("振替"));

// 5. OGP画像の存在とサイズ検査
const ogpPath = path.join(root, "ogp-uto-public-services.png");
assert.ok(fs.existsSync(ogpPath), "ogp-uto-public-services.png が存在しません");
const ogpStat = fs.statSync(ogpPath);
assert.ok(ogpStat.size > 50000, "OGP画像のファイルサイズが小さすぎます");

console.log(`宇土市 公的施設・市民サービス マップ＆総合ガイド テスト OK（全${facilities.length}施設・祝日・年末年始判定・開館シミュレーション検証完了）`);
