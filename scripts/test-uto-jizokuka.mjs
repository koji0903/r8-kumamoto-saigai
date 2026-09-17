import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "..");

console.log("宇土市 小規模事業者持続化補助金＜災害支援枠＞テスト開始");

// 1. ファイルの存在確認
const htmlPath = resolve(root, "uto-jizokuka.html");
const cssPath = resolve(root, "uto-jizokuka.css");
const jsPath = resolve(root, "uto-jizokuka.js");
const ogpPath = resolve(root, "ogp-uto-jizokuka.png");

assert.ok(existsSync(htmlPath), "uto-jizokuka.html が存在すること");
assert.ok(existsSync(cssPath), "uto-jizokuka.css が存在すること");
assert.ok(existsSync(jsPath), "uto-jizokuka.js が存在すること");
assert.ok(existsSync(ogpPath), "ogp-uto-jizokuka.png が存在すること");

const html = readFileSync(htmlPath, "utf-8");
const js = readFileSync(jsPath, "utf-8");
const topics = JSON.parse(readFileSync(resolve(root, "sources/site-topics.json"), "utf-8"));

// 2. 金額・補助率の整合性
assert.ok(html.includes("200"), "直接被害の200万円が含まれること");
assert.ok(html.includes("100"), "間接被害の100万円が含まれること");
assert.ok(html.includes("2/3"), "補助率2/3が含まれること");
assert.ok(html.includes("定額"), "定額補助の記載が含まれること");

// 3. 従業員規模要件の整合性
assert.ok(html.includes("5人"), "商業・サービス業5人以下の記載が含まれること");
assert.ok(html.includes("20人"), "製造業等20人以下の記載が含まれること");

// 4. スケジュール・締切日
assert.ok(html.includes("10月9日"), "商工会確認書発行受付締切（10月9日）が含まれること");
assert.ok(html.includes("10月16日"), "申請受付締切（10月16日）が含まれること");
assert.ok(html.includes("令和9年10月31日"), "事業完了期限が含まれること");

// 5. 窓口情報
assert.ok(html.includes("0964-22-5555"), "宇土市商工会の電話番号が含まれること");
assert.ok(html.includes("0964-27-3328"), "宇土市商工観光課の電話番号が含まれること");

// 6. 一次情報URL
assert.ok(html.includes("https://www.city.uto.lg.jp/article/view/1321/16936.html"), "宇土市公式記事URLが含まれること");
assert.ok(html.includes("b3ca3eab159685de8156a09dc8244fc9.pdf"), "宇土市公式PDFリンクが含まれること");
assert.ok(html.includes("https://www.jizokukanb.com/jizokuka_r6h/saigai/kumamoto/shinsei.html#kobo"), "全国商工会連合会公式URLが含まれること");

// 7. 3大鉄則・重要ルール
assert.ok(html.includes("後払い") || html.includes("精算払い"), "後払いの注意が含まれること");
assert.ok(html.includes("支援機関確認書"), "支援機関確認書の記載が含まれること");
assert.ok(html.includes("罹災"), "罹災証明書の記載が含まれること");
assert.ok(html.includes("セーフティネット"), "セーフティネット保証4号の記載が含まれること");

// 8. JSシミュレーターの検証
assert.ok(js.includes("commerce_small"), "JSに商業小規模の判定があること");
assert.ok(js.includes("other_small"), "JSにその他小規模の判定があること");
assert.ok(js.includes("over_size"), "JSに基準超過の判定があること");
assert.ok(js.includes("teigakuEligible"), "JSに定額判定があること");
assert.ok(js.includes("200万円"), "JSに直接被害200万円の出力があること");
assert.ok(js.includes("100万円"), "JSに間接被害100万円の出力があること");

// 9. トピックス掲載
const utoTopic = topics.find(t => t.url === "uto-jizokuka.html");
assert.ok(utoTopic, "sources/site-topics.json に uto-jizokuka.html のトピックが存在すること");
assert.equal(utoTopic.category, "宇土市", "トピックのカテゴリが宇土市であること");

console.log("宇土市 小規模事業者持続化補助金＜災害支援枠＞テスト OK");
