# 自治体公式情報ナビ運用手順

## 通常の3時間更新

`.github/workflows/refresh-official-data.yml` は3時間ごとに既存収集・既存検証を完了した後、自治体公式情報ナビを分類・生成・検証します。全工程の成功後に、既存公式データ、表示用ナビJSON、最新品質レポートを同じcommitへまとめます。途中で失敗したrunner上のファイルはcommitされません。

## 手動実行とdry-run

Actionsの「公式災害情報の定期更新」から `Run workflow` を選択します。`dry_run: true` では収集、分類、validationまで実行し、commit/pushしません。ネットワーク取得を行わず手元の正本だけで試す場合は次を実行します。

```sh
node tools/check-data.mjs
node scripts/run-municipality-official-nav-pipeline.mjs
node scripts/validate-municipality-official-nav.mjs
node scripts/test-municipality-official-nav-pipeline.mjs
git diff --check
```

## validation失敗・分類件数急減

入力0件、全カテゴリ0件、非公式ドメイン、未知カテゴリ、fallback欠落などはfailureです。表示JSONは置換されず、commit stepにも到達しません。前回比50%超の分類件数減少、取得から12時間超過、取得失敗はwarningです。品質レポートを確認し、収集障害か分類障害かをstep名で切り分けます。

## 404・redirect・過去災害

一度の404では自動削除しません。`HTTP_404_CANDIDATE` が続く場合に原ページを確認します。301/308は移転先を確認してから正本側を更新します。過去災害専用ページが生成結果へ混入した場合はvalidation failureです。

## Workflow失敗とVercel

validation成功前にはmainへcommitしません。そのためWorkflowが失敗した場合、Vercelには直前にmainへ反映された成功版が表示され続けます。Actionsの失敗stepと、Vercelの最新Production Deploymentが直前成功commitを指していることを確認します。

## rollback

万一問題のある自動更新commitがmainへ入った場合は、対象を特定して打ち消しcommitを作ります。force pushや履歴改変は行いません。

```sh
git pull --ff-only origin main
git revert <問題のあるcommit SHA>
git push origin main
```

復旧後にActionsとVercelのProduction Deploymentを確認します。

## 最低限の監視項目

- Workflowの成功・失敗と失敗step
- 入力、分類、表示候補、未分類、除外、warning件数
- 全カテゴリ0件になっていないこと
- 21市町村fallbackが21/21であること
- 非公式ドメイン・過去災害混入が0件であること
- mainへの自動commitとVercel deployの成功
