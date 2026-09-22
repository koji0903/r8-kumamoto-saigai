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

## 暮らしの支援ガイドの掲載監視

- 宇土市・宇城市・氷川町・八代市の「暮らしの支援・補助金 総合ガイド」は、`scripts/monitor-living-support-coverage.mjs` が自治体公式の制度一覧・カテゴリ索引と突き合わせて掲載漏れとリンク切れを監視する（毎月2日にGitHub Actionsで実行）。
- 監視対象の索引URLと対象外（制度でない記事）は `sources/living-support-coverage-targets.json` で管理する。制度でない記事を検出した場合は、除外理由を添えて `known` に追加する。
- 検出結果は `reports/living-support-coverage.json` に保存し、前回レポートに無かった項目だけを新規として扱う。新規があれば `--check` が終了コード1を返し、WorkflowがIssueを作成する。
- 自治体サイトのWAFがGitHub Actionsからのアクセスを拒否することがある（宇土市で403を確認）。403・429・5xxは「リンク切れ」ではなく判定不能として記録し、索引を取得できなかった自治体はWorkflowのwarningに出す。続く場合は手元で `npm run monitor:living-support` を実行して確認する。
- カードを追加・削除した場合は、ヒーローバッジ・絞り込み表示・セクションの件数表記と `scripts/test-living-support.mjs` / `scripts/test-uto-support.mjs` の期待値を合わせて更新する。

## 作業完了前の検査

- コード、HTML、CSS、データ、Workflowのいずれかを変更した場合は、完了前に必ず `npm run preflight` を実行する。
- `npm run preflight` が更新したSEO・サイト内検索・トピックスの生成物も、作業の差分に含める。
- GitHub Actions とローカルの検査は `tools/validate-site.mjs` を共用する。検査を追加する場合は個別のWorkflowに重複記載しない。
