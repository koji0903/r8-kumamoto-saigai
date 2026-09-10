# サイト制作ルール

## 新規ページとOGP

- 公開用のHTMLページを新規作成・改名した場合は、作業完了前に必ず `node tools/build-seo.mjs` を実行する。
- 各ページには `title` と空でない `meta[name="description"]` を記述する。OGP、X（Twitter）カード、canonical、robots は手作業で追加せず、`tools/build-seo.mjs` で生成する。
- ページ固有のOGP画像が必要な場合は、1200×630pxのPNGを用意し、`tools/build-seo.mjs` の `specialImages` と `tools/build-ogp-images.py` に登録する。
- 完了前に `node tools/build-seo.mjs --check` と `node scripts/test-ogp.mjs` を実行し、すべて成功することを確認する。
- 検索エンジン確認用HTML（`google*.html`）以外のルート直下のHTMLは、OGP検証の対象から除外しない。

## トップページトピックスと自動更新

- 公開ページの新規作成、重要な制度・ガイドの改修を行った場合は、作業完了前に `sources/site-topics.json` に更新情報（日付、カテゴリ、バッジ、タイトル、URL、内容の把握できる要約）を追記する。
- 自治体からの公式発信自動収集（GitHub Actions / `tools/fetch-official-topics.mjs`）およびローカルビルド（`npm run preflight`）により、トップページ（`index.html`）のトピックスセクションと `data/generated/home-topics.js` が自動更新される。
- 完了前に `node tools/build-home-topics.mjs --check` および `node scripts/test-home-topics.mjs` を含む検査を通過することを確認する。

## 作業完了前の検査

- コード、HTML、CSS、データ、Workflowのいずれかを変更した場合は、完了前に必ず `npm run preflight` を実行する。
- `npm run preflight` が更新したSEO・サイト内検索・トピックスの生成物も、作業の差分に含める。
- GitHub Actions とローカルの検査は `tools/validate-site.mjs` を共用する。検査を追加する場合は個別のWorkflowに重複記載しない。
