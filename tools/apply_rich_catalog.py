#!/usr/bin/env python3
import re

with open("yatsushiro-support.html", "r", encoding="utf-8") as f:
    html = f.read()

with open("tools/generated_catalog.html", "r", encoding="utf-8") as f:
    new_catalog = f.read()

# カタログ部分を置換
pattern = r'<div class="ys-catalog-grid" id="ysCatalog">.*?</div>(?=\s*<p id="ysNoResult")'
assert re.search(pattern, html, flags=re.DOTALL), "カタログ部分が見つかりません"

html = re.sub(pattern, new_catalog, html, flags=re.DOTALL)

# 原資料リンクの「第7版 PDF（62ページ）」を第8版に更新
html = html.replace(
    '<b>第7版 PDF（62ページ）</b><span>2026年9月21日現在 ↗</span>',
    '<b>第8版 PDF（71ページ）</b><span>2026年10月9日現在 ↗</span>'
)

with open("yatsushiro-support.html", "w", encoding="utf-8") as f:
    f.write(html)

print("yatsushiro-support.html にリッチカタログを反映しました。")
