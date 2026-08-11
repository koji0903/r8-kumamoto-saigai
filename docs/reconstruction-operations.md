# 「暮らしの再建」本番運用

## 運用区分

| 区分 | 対象 | 更新 | 公開判断 |
|---|---|---|---|
| A 緊急・速報 | 避難所、断水、給水、道路等 | 3時間ごと | 収集・構造・公式性の検証通過後に自動反映 |
| B 自治体公式ナビ | 21市町村×8カテゴリ | 3時間ごとに全件再分類 | 公式ドメイン、現災害、schema検証通過後に自動反映 |
| C 厳密制度 | 金額、対象条件、期限、申請等 | source変更時 | hash変更を `needs_review` / `ACTION_REQUIRED` とし、人手確認まで承認状態を引き継がない |

自治体ページを168枠ずつ巡回しません。通常は `docs/reconstruction-operations-status.md` の WARNING / ACTION_REQUIRED、未分類、low confidence、リンク異常、source変更だけを確認します。

## 状態の意味

- `OK`: 自動検証に異常なし。
- `WARNING`: 初回404、redirect、鮮度低下、未分類増加など。公開停止はしないが確認する。
- `ACTION_REQUIRED`: 連続404、構造エラー、厳密制度source変更、不正なphaseなど。自動更新を止め、人が判断する。

初回404では削除しません。2回連続で404なら対応対象、redirectは新URLを確認してから正規URLを更新します。過去災害資料は公式ナビからのみ除外し、資料自体は削除しません。

## sitePhase

`config/site-phase.json` の `phase` を運用者が `emergency` / `transition` / `reconstruction` から選びます。日時だけで自動変更しません。変更後は `node scripts/build-site-phase.mjs` を実行し、理由・担当・日時とともにcommitします。phase変更はトップページの導線優先度だけを変え、データを削除しません。

## manual override

誤分類は `config/municipality-classification-overrides.json` にURL、8カテゴリ、理由、更新日を1件だけ登録します。通常ルールより優先され、件数は運用ステータスに記録されます。空カテゴリは公式ナビからの明示除外に使用できます。個別HTMLに例外を埋め込みません。

## 日次確認（5分以内）

1. `docs/reconstruction-operations-status.md` の状態を見る。
2. ACTION_REQUIREDがあれば該当source・リンク・検証エラーを確認する。
3. WARNINGがあれば初回404、redirect、未分類、low、鮮度を見る。
4. GitHub Actions「公式災害情報の定期更新」の最終成功時刻を見る。
5. トップ、暮らしの再建、任意の自治体・カテゴリでfallbackと公式リンクを確認する。

## 週次確認

- 未分類・low confidence・manual overrideの増減を確認。
- 8カテゴリと21市町村の0件fallbackを確認。
- 厳密制度sourceの変更、期限、窓口、電話番号を一次資料で確認。
- `node scripts/test-reconstruction-operations.mjs` とサイト全体検証を実行。
- phaseが現状に合うかを会議で判断（自動変更しない）。

## 障害・ロールバック

GitHub Actions失敗時は、失敗runの収集ログと検証ログを確認します。検証前のデータはcommitされないため、最後の成功版が本番に残ります。誤更新を公開した場合は、該当自動更新commitを `git revert` し、mainへpushします。Vercelの本番反映を確認後、原因を修正してdry-runを実行します。厳密制度sourceの基準更新は、人手確認後に限り `node scripts/build-reconstruction-source-baseline.mjs --accept-current` を実行します。

## フェーズ移行チェック

- 緊急情報の必要性、生活再建情報への閲覧需要、行政発信の傾向を人が確認したか。
- phase変更理由と決定者を記録したか。
- 3 phaseすべてでデータが消えず、導線順だけが変わるか。
- 変更前commitを記録し、戻し方を共有したか。
