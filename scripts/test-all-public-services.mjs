import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

console.log("公的施設・市民サービス マップ＆総合ガイド（全4自治体）検証テスト開始");

const MUNICIPALITIES = [
  {
    key: "uto",
    name: "宇土市",
    html: "uto-public-services.html",
    js: "uto-public-services.js",
    expectedCount: 39,
    areas: new Set(["central", "west", "north"]),
    latRange: [32.6, 32.8],
    lngRange: [130.45, 130.8],
    addressCheck: (addr) => addr.includes("宇土市") || addr.includes("宇城市"),
  },
  {
    key: "uki",
    name: "宇城市",
    html: "uki-public-services.html",
    js: "uki-public-services.js",
    expectedCount: 20,
    areas: new Set(["matsubase", "ogawa", "shiranuhi", "misumi", "toyono"]),
    latRange: [32.55, 32.72],
    lngRange: [130.42, 130.82],
    addressCheck: (addr) => addr.includes("宇城市") || addr.includes("下益城郡"),
  },
  {
    key: "yatsushiro",
    name: "八代市",
    html: "yatsushiro-public-services.html",
    js: "yatsushiro-public-services.js",
    expectedCount: 20,
    areas: new Set(["central", "kagami", "sencho", "sakamoto", "toyo", "izumi"]),
    latRange: [32.35, 32.62],
    lngRange: [130.50, 130.85],
    addressCheck: (addr) => addr.includes("八代市"),
  },
  {
    key: "hikawa",
    name: "氷川町",
    html: "hikawa-public-services.html",
    js: "hikawa-public-services.js",
    expectedCount: 12,
    areas: new Set(["miyahara", "ryuhoku"]),
    latRange: [32.53, 32.62],
    lngRange: [130.60, 130.75],
    addressCheck: (addr) => addr.includes("八代郡氷川町") || addr.includes("氷川町"),
  },
];

const VALID_CATS = new Set(["admin", "child", "health", "welfare", "culture", "sports", "safety"]);

for (const muni of MUNICIPALITIES) {
  console.log(`\n--- 検証中: ${muni.name} (${muni.key}) ---`);

  // 1. HTML の存在と重要要素の検証
  const htmlPath = path.join(root, muni.html);
  assert.ok(fs.existsSync(htmlPath), `${muni.html} が存在しません`);
  const html = fs.readFileSync(htmlPath, "utf8");

  assert.ok(html.includes("<!DOCTYPE html>"), `${muni.html}: DOCTYPEがありません`);
  assert.ok(html.includes(muni.name), `${muni.html}: 自治体名が含まれていません`);
  assert.ok(html.includes("vendor/leaflet/leaflet.js"), `${muni.html}: Leaflet JSが読み込まれていません`);
  assert.ok(html.includes("vendor/leaflet/leaflet.css"), `${muni.html}: Leaflet CSSが読み込まれていません`);
  assert.ok(html.includes(muni.js), `${muni.html}: 専用スクリプト ${muni.js} が読み込まれていません`);
  assert.ok(html.includes('id="publicServicesMap"'), `${muni.html}: 地図コンテナがありません`);
  assert.ok(html.includes('id="facilityCardsContainer"'), `${muni.html}: 施設カードコンテナがありません`);
  assert.ok(html.includes('id="facilityTableContainer"'), `${muni.html}: 一覧テーブルコンテナがありません`);
  assert.ok(html.includes('id="serviceSearchInput"'), `${muni.html}: 検索入力欄がありません`);
  assert.ok(html.includes('id="catFilterGroup"'), `${muni.html}: カテゴリフィルターがありません`);
  assert.ok(html.includes('id="areaFilterGroup"'), `${muni.html}: エリアフィルターがありません`);
  assert.ok(html.includes('id="targetFilterGroup"'), `${muni.html}: 対象者フィルターがありません`);
  assert.ok(html.includes('id="quickTagsGroup"'), `${muni.html}: クイックタグがありません`);
  assert.ok(html.includes('id="openNowCheckbox"'), `${muni.html}: 開館中トグルがありません`);
  assert.ok(html.includes("public-services-city-nav"), `${muni.html}: 自治体切り替えナビゲーションがありません`);

  // 4自治体のリンクが含まれていることを確認
  assert.ok(html.includes("uto-public-services.html"), `${muni.html}: 宇土市への切り替えリンクがありません`);
  assert.ok(html.includes("uki-public-services.html"), `${muni.html}: 宇城市への切り替えリンクがありません`);
  assert.ok(html.includes("yatsushiro-public-services.html"), `${muni.html}: 八代市への切り替えリンクがありません`);
  assert.ok(html.includes("hikawa-public-services.html"), `${muni.html}: 氷川町への切り替えリンクがありません`);

  // 2. JS の構文とデータ構造の検証
  const jsPath = path.join(root, muni.js);
  assert.ok(fs.existsSync(jsPath), `${muni.js} が存在しません`);
  const jsContent = fs.readFileSync(jsPath, "utf8");

  const match = jsContent.match(/const FACILITIES = (\[[\s\S]*?\n  \]);/);
  assert.ok(match, `${muni.js}: FACILITIES 配列の抽出に失敗しました`);

  const context = {};
  vm.runInNewContext(`facilities = ${match[1]}`, context);
  const facilities = context.facilities;

  assert.equal(
    facilities.length,
    muni.expectedCount,
    `${muni.name} の施設数は ${muni.expectedCount} 件である必要があります（実際: ${facilities.length} 件）`
  );

  const seenIds = new Set();
  const seenCats = new Set();
  const seenAreas = new Set();

  for (const f of facilities) {
    assert.ok(f.id, `${muni.name}: IDが未定義の施設があります: ${JSON.stringify(f)}`);
    assert.ok(!seenIds.has(f.id), `${muni.name}: IDが重複しています: ${f.id}`);
    seenIds.add(f.id);

    assert.ok(f.name && f.name.trim().length > 0, `${muni.name}: 名称が空です: ${f.id}`);
    assert.ok(f.ruby && f.ruby.trim().length > 0, `${muni.name}: ふりがなが空です: ${f.id}`);
    assert.ok(f.address && muni.addressCheck(f.address), `${muni.name}: 住所が不正です (${f.name}: ${f.address})`);

    assert.ok(
      typeof f.lat === "number" && f.lat >= muni.latRange[0] && f.lat <= muni.latRange[1],
      `${muni.name}: 緯度範囲外 (${f.name}: ${f.lat})`
    );
    assert.ok(
      typeof f.lng === "number" && f.lng >= muni.lngRange[0] && f.lng <= muni.lngRange[1],
      `${muni.name}: 経度範囲外 (${f.name}: ${f.lng})`
    );

    assert.ok(VALID_CATS.has(f.cat), `${muni.name}: 未知のカテゴリです (${f.name}: ${f.cat})`);
    seenCats.add(f.cat);

    assert.ok(muni.areas.has(f.area), `${muni.name}: 未知のエリアです (${f.name}: ${f.area})`);
    seenAreas.add(f.area);

    assert.ok(Array.isArray(f.target) && f.target.length > 0, `${muni.name}: targetが空です: ${f.name}`);
    assert.ok(Array.isArray(f.openDays) && f.openDays.length > 0, `${muni.name}: openDaysが空です: ${f.name}`);
    assert.ok(f.openTime && f.closeTime, `${muni.name}: 開館時間が未設定です: ${f.name}`);
    assert.ok(Array.isArray(f.quickTags) && f.quickTags.length > 0, `${muni.name}: quickTagsが空です: ${f.name}`);
    assert.ok(Array.isArray(f.services) && f.services.length > 0, `${muni.name}: servicesが空です: ${f.name}`);
    assert.ok(f.desc && f.desc.trim().length > 0, `${muni.name}: descが空です: ${f.name}`);
  }

  // カテゴリ網羅性チェック
  assert.ok(seenCats.size >= 5, `${muni.name}: 最低5分野以上の施設が登録されている必要があります（実際: ${seenCats.size}分野）`);
  // エリア網羅性チェック
  assert.equal(seenAreas.size, muni.areas.size, `${muni.name}: 定義エリアがすべて網羅されている必要があります`);

  console.log(`  ✓ ${muni.name}: ${facilities.length}施設、${seenCats.size}分野、${seenAreas.size}地区 全データ検証合格`);
}

console.log("\n公的施設・市民サービス マップ＆総合ガイド（全4自治体）検証テスト 完了（全テスト合格）");
