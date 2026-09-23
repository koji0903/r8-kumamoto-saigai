// 全公開HTMLページにおいて、トップページ（index.html）のfavicon設定
// （favicon.png sizes="32x32" および apple-touch-icon.png）が正しく反映されているかを検証する。
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const pages = fs.readdirSync(root).filter(file => file.endsWith(".html") && !file.startsWith("google"));

// 1. 実体ファイルの存在確認
assert.ok(fs.existsSync(new URL("favicon.png", root)), "favicon.png が存在しません");
assert.ok(fs.existsSync(new URL("apple-touch-icon.png", root)), "apple-touch-icon.png が存在しません");

// 2. 全HTMLページでfavicon設定の存在確認
for (const page of pages) {
  const html = fs.readFileSync(new URL(page, root), "utf8");
  assert.ok(
    html.includes('<link rel="icon" href="favicon.png" sizes="32x32">'),
    `${page}: <link rel="icon" href="favicon.png" sizes="32x32"> が設定されていません`
  );
  assert.ok(
    html.includes('<link rel="apple-touch-icon" href="apple-touch-icon.png">'),
    `${page}: <link rel="apple-touch-icon" href="apple-touch-icon.png"> が設定されていません`
  );
}

console.log(`全${pages.length}ページのfavicon設定（favicon.png / apple-touch-icon.png）検査 OK`);
