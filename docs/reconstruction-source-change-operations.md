# 暮らしの再建 公式source変更監視・再確認運用

## 目的と境界

一度確認した制度でも、根拠となる国・県・市町村の公式ページまたはPDFが変わった事実を検知し、高リスクな古い情報を確定表示し続けないための運用です。機械処理は変更の意味を断定せず、制度値を自動修正せず、`verified` へ自動復帰させません。LEVEL 2の自治体公式情報ナビは従来の3時間収集を維持し、LEVEL 1の厳密制度根拠だけを追加監視します。

## 変更検知

- 取得はsource URL単位で1回だけ行い、同じsourceを参照する複数entityへ結果を伝播します。
- HTMLはscript、style、header、nav、footer等を除いた本文を正規化してSHA-256を計算し、時刻表示や共通ナビによる誤検知を減らします。
- PDFは取得バイト列のSHA-256を計算します。PDF内メタデータだけの変更を意味変更と断定はしません。
- 初回は既存ハッシュ方式から正規化方式への移行としてbaselineを作り、変更イベントを作りません。
- 同一URLの本文差替えは `content_changed` / `pdf_replaced`、登録URL自体の変更は `url_migrated`、HTTP redirectは `url_redirected` と分けます。
- 取得状態、ETag、Last-Modified、連続失敗回数は `reports/reconstruction-source-state.json` に保持します。本文・PDFそのものは保存しません。

## 取得失敗・404・redirect

- timeout、5xx、通信失敗、単発404は `WARNING` とし、内容変更とは扱いません。既存の検証済みデータを空で上書きしません。
- 同じsourceの404/410が2回続いた場合は `ACTION_REQUIRED` の未解決イベントにします。公式情報が終了したとは自動判断しません。
- redirectとURL移行は `WARNING` とし、旧版・新版関係や正式な移転かを人が確認します。
- 取得失敗中も自治体等の公式トップへ進めるofficial-nav fallbackは維持します。

## source change eventと監査証跡

未解決イベントは `data/reconstruction/source-change-events.json` に、同一URLのハッシュ改訂履歴は `data/reconstruction/source-revisions.json` に記録します。イベントにはsource、URL、旧新hash、検知日時、claimType、リスク、影響entity、運用状態を保持します。レビュー完了時は `resolved: true`、`reviewedAt`、`reviewedBy`、`resolutionNotes` を人が記録します。担当者は内部IDだけを使用し、個人プロフィールは保存しません。

## claimTypeと影響

高リスクは `amount`、`deadline`、`eligibility`、`eligible_damage`、`eligible_area`、`required_document`、`contact`、`application_office`、`warning` です。`benefit`、`application_method`、`disaster_application` は中、`general_description` 等は低とします。

高リスクsourceの本文/PDF変更、または継続404が検知された場合、直接sourceLinkされた `application`、`application_period`、`required_document`、`contact`、`next_action` のうち現在 `verified` のentityだけを `needs_review` に戻します。子entityの高リスク変更で親applicationも `verified` の場合に限り、親にも慎重に伝播します。`publicationStatus` は変更しません。

## 本番表示

`needs_review`、`source_unreachable` は公開制度JSONから除外します。金額、期限、対象条件、必要書類、電話番号、契約・支払前警告、制度固有nextAction、確認メモの制度固有行動を確定情報として出しません。一方、LEVEL 2 official-navと自治体公式トップfallbackは残すため、利用者は最新の一次情報へ進めます。内部の `needs_review` 等を利用者画面へそのまま表示しません。

## review queue（日次確認）

`docs/reconstruction-source-review-queue.md` を開き、未解決件数と `ACTION_REQUIRED` を確認します。高リスク順でsource、claimType、影響entity、原文リンクが並びます。機械的な `impactAssessment` は `UNKNOWN` または `POTENTIALLY_RELEVANT` であり、意味変更の判定ではありません。

## レビュー・承認・公開復帰

1. Reviewerが原文、該当ページ/節、登録値、旧版との差分を照合します。
2. 高リスク項目はSecondary Reviewerが再確認します。
3. Approverがレビュー記録と根拠を確認します。CodexやGitHub Actionsは承認者になれません。
4. 必要なら制度値とsourceLinkを最小修正し、変更イベントを解決済みにします。
5. Reviewer/Approverの記録を残し、全validationを通した後にだけ手動で `verified` に戻します。
6. 正常な新hashをbaseline/stateへ反映し、公開JSONを再生成します。

## GitHub Actions

既存3時間更新で、市町村情報等の収集後、データ検証前に厳密source監視を実行します。順序は `取得 → hash比較 → event/revision → needs_review → validation → 公開JSON → official-nav/検索 → 品質レポート → commit` です。処理は10 URL程度を直列取得し、同一URLの重複取得をしません。1 URLのtimeoutは30秒で、workflow全体は30分です。

## rollback

誤検知時もイベントを削除して履歴を消さず、`resolutionNotes` に理由を記録して解決済みにします。状態復帰は人の再照合・承認後に行い、Git履歴から必要なファイルだけを戻します。公開データをforce pushせず、収集失敗時は最後の検証済みデータを保持します。
