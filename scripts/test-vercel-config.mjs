import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

assert.equal(config.framework, null, "静的サイトとしてVercelのフレームワーク自動検出を無効にしてください");
assert.equal(config.buildCommand, "npm run build", "Vercelとローカルで同じビルドコマンドを使用してください");
assert.equal(config.outputDirectory, ".", "公開HTMLがあるリポジトリ直下をVercelの出力先にしてください");
assert.equal(typeof pkg.scripts?.build, "string", "package.jsonにbuildスクリプトが必要です");
assert.deepEqual(
  config.redirects,
  [{ source: "/municipality-updates.html", destination: "/municipalities.html?tab=updates", permanent: true }],
  "旧自治体更新ページは検索重複を避けるため恒久リダイレクトしてください"
);

console.log("Vercel: 静的サイト / buildコマンド / 出力先ルート / 恒久リダイレクト OK");
