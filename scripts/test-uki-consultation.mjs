// 宇城市 被災者支援のための無料相談会ガイドの整合性検査
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const html = read("uki-consultation.html");
const css = read("uki-consultation.css");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// 1. 公式ページおよび添付資料（PDF 7点）リンクの検査
const officialUrls = [
  "https://www.city.uki.kumamoto.jp/toppage/important/2622040",
  "https://www.city.uki.kumamoto.jp/resource.php?e=6bfb7aeae4909fb98a4cd1ef64a2ee56fef480c2a1c39b9664f1b2a4fa4be9b04dc3b3cc398a22699e7e69845d5a8494", // 司法書士チラシ
  "https://www.city.uki.kumamoto.jp/resource.php?e=b4123cf7c28a217bcf2b573904c86fa6f9dab79461e73cfa931e60a1965015a3617346324da515f1333dda237bbc27be", // 震災調停チラシ
  "https://www.city.uki.kumamoto.jp/resource.php?e=b1547c860ae2ec23d35d8988d76dc67ae0dad1e4501b51fc9e3d52f6c0b1c11b06930372b868df675e2624c5664f16ab", // 弁護士チラシ
  "https://www.city.uki.kumamoto.jp/resource.php?e=9c840dbb89ed4138948eac9f4fdd4e37fe83d9fa414d7e65f47135bcfdfe520a51fb0ab00da300423031b235e188d436", // くま弁1号
  "https://www.city.uki.kumamoto.jp/resource.php?e=fa993d74a80d834c9bb0892721cb0757321af12f1adb0e1c8e4597b529e875d4e011ed89b6b2d8f090e1dd1662b217af", // くま弁2号
  "https://www.city.uki.kumamoto.jp/resource.php?e=726d58d4610d9747360542120a76bf44c1d4bca1177e547836d86bb34507ee76462d8bfd9dd5f0d659bb8971a3ac67e9", // くま弁3号
  "https://www.city.uki.kumamoto.jp/resource.php?e=fdcd90fe6854a9cdc4346e9c00fefcf70ccf0f112fb06e25dd36610db5a249c36186b66e355c15507ae3f688fd8dbeee", // 行政書士チラシ
];

for (const url of officialUrls) {
  assert.ok(html.includes(url), `公式URL ${url} へのリンクがありません`);
}

// 2. 会場・曜日・時間・予約不要の検査
assert.ok(text.includes("宇城市役所本庁新館") || text.includes("市役所本庁新館"), "宇城市役所本庁新館の記載が必要です");
assert.ok(text.includes("小川総合文化センター・ラポート") || text.includes("小川ラポート"), "小川ラポートの記載が必要です");
assert.ok(text.includes("予約不要"), "予約不要であることの明記が必要です");
assert.ok(text.includes("無料"), "相談無料であることの明記が必要です");
assert.ok(text.includes("13:00") && text.includes("16:00"), "13:00〜16:00の開催時間が必要です");
assert.ok(text.includes("10:00") && text.includes("16:00"), "10:00〜16:00（弁護士）の開催時間が必要です");
assert.ok(text.includes("日曜日") || text.includes("日曜"), "日曜開催の明記が必要です");
assert.ok(text.includes("祝日"), "祝日休止の注意事項が必要です");

// 3. 各士業の専門制度・分析キーワードの検査
assert.ok(text.includes("司法書士"), "司法書士の記載が必要です");
assert.ok(text.includes("弁護士"), "弁護士の記載が必要です");
assert.ok(text.includes("行政書士"), "行政書士の記載が必要です");
assert.ok(text.includes("被災ローン減免制度") || text.includes("自然災害債務整理ガイドライン"), "被災ローン減免制度の解説が必要です");
assert.ok(text.includes("建築士"), "建築士同席についての説明が必要です");
assert.ok(text.includes("震災調停") || text.includes("調停センター"), "司法書士震災調停の説明が必要です");
assert.ok(text.includes("災害ADR") || text.includes("紛争解決センター"), "弁護士会災害ADRの説明が必要です");
assert.ok(text.includes("相続登記") || text.includes("名義変更"), "相続登記・名義変更の記載が必要です");
assert.ok(text.includes("権利証"), "権利証・実印紛失についての記載が必要です");
assert.ok(text.includes("ブラックリスト"), "ローン減免でブラックリストに載らないメリットの記載が必要です");

// 4. お問い合わせ先電話番号の検査
assert.ok(html.includes("0964-32-1798"), "宇城市総務課の電話番号が必要です");
assert.ok(html.includes("tel:0964321798"), "宇城市総務課への発信リンクが必要です");
assert.ok(html.includes("096-364-2889"), "司法書士会の電話番号が必要です");
assert.ok(html.includes("096-325-0913"), "弁護士会の電話番号が必要です");
assert.ok(html.includes("090-4512-8487"), "行政書士宇城支部の電話番号が必要です");

// 5. サイト内相互リンクの検査
assert.ok(html.includes('href="uki-support.html"'), "uki-support.html への導線が必要です");
const ukiSupport = read("uki-support.html");
assert.ok(ukiSupport.includes("uki-consultation.html"), "uki-support.html から本ガイドへのリンクが必要です");

// 6. CSSスタイルの検査
assert.ok(css.includes(".consultation-page"), "CSSにconsultation-pageのスタイル定義が必要です");
assert.ok(css.includes(".schedule-table"), "CSSにschedule-tableのスタイル定義が必要です");

console.log("宇城市 被災者支援のための無料相談会ガイド検査 OK");
