// 重点被災地（宇土市・宇城市・氷川町・八代市）の公式情報が痩せていないことを守る。
//
// 八代市は h1 がヘッダー画像だけのため表題が空になり、罹災証明・応急修理・
// みなし仮設といった中心的なページが丸ごと収集から落ちていた。被害が大きい
// 地域ほど確認したい情報が多いので、収集が退行したら気づけるようにする。
import assert from "node:assert/strict";
import fs from "node:fs";

const nav = JSON.parse(fs.readFileSync(new URL("../public-data/reconstruction/municipality-official-navigation.json", import.meta.url), "utf8"));
const collector = fs.readFileSync(new URL("../tools/fetch-municipality-updates.mjs", import.meta.url), "utf8");

const PRIORITY = ["宇土市", "宇城市", "氷川町", "八代市"];
// 住まい・お金・証明は、どの重点地域でも必ず案内があるべき中心分野。
const CORE_CATEGORIES = ["home", "money", "documents"];

for (const name of PRIORITY) {
  const municipality = nav.municipalities.find(item => item.municipalityName === name);
  assert.ok(municipality, `${name} がナビに存在しません`);
  const updates = municipality.updates || [];
  assert.ok(updates.length >= 15, `${name}: 公式情報が${updates.length}件しかありません（15件以上を期待）`);
  for (const category of CORE_CATEGORIES) {
    const count = updates.filter(update => (update.categories || []).includes(category)).length;
    assert.ok(count > 0, `${name}: 中心分野 ${category} の公式情報が0件です`);
  }
}

// 表題抽出のフォールバック。h1 が画像だけのサイトで記事が落ちないこと。
assert.match(collector, /\[h1\?\.\[1\], ogTitle, titleTag\]\.map\(value => clean\(text\(value \|\| ""\)\)\)\.find\(Boolean\)/,
  "h1が空のときに og:title / title へ落とす表題抽出が必要です");

// 重点地域の巡回予算。八代市の災害ハブは記事リンクだけで149件ある。
assert.match(collector, /PRIORITY_MUNICIPALITIES\s*=\s*new Set\(\["宇土市", "宇城市", "氷川町", "八代市"\]\)/,
  "重点被災地の巡回予算の指定が必要です");
assert.match(collector, /PRIORITY_MAX_PAGES\s*=\s*(\d+)/, "重点被災地の巡回上限が必要です");
assert.ok(Number(collector.match(/PRIORITY_MAX_PAGES\s*=\s*(\d+)/)[1]) >= 200, "重点被災地の巡回上限は200ページ以上が必要です");

const totals = PRIORITY.map(name => `${name}${(nav.municipalities.find(m => m.municipalityName === name).updates || []).length}件`);
console.log(`重点被災地の公式情報: ${totals.join(" / ")} / 中心3分野の充足・表題フォールバック・巡回予算 OK`);
