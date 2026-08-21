# サイト制作ルール

## 新規ページとOGP

- 公開用のHTMLページを新規作成・改名した場合は、作業完了前に必ず `node tools/build-seo.mjs` を実行する。
- 各ページには `title` と空でない `meta[name="description"]` を記述する。OGP、X（Twitter）カード、canonical、robots は手作業で追加せず、`tools/build-seo.mjs` で生成する。
- ページ固有のOGP画像が必要な場合は、1200×630pxのPNGを用意し、`tools/build-seo.mjs` の `specialImages` と `tools/build-ogp-images.py` に登録する。
- 完了前に `node tools/build-seo.mjs --check` と `node scripts/test-ogp.mjs` を実行し、すべて成功することを確認する。
- 検索エンジン確認用HTML（`google*.html`）以外のルート直下のHTMLは、OGP検証の対象から除外しない。
