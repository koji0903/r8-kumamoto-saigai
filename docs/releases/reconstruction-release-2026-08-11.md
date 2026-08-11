# 「暮らしの再建」本番リリース記録

公開日: 2026-08-11  
初回公開commit: `37182da`  
公開URL: `https://www.yokatainet.jp/reconstruction.html`

## 公開判定

| 層 | 判定 |
|---|---|
| SERVICE_RELEASE | READY |
| OFFICIAL_NAV_RELEASE | READY |
| VERIFIED_PROGRAM_RELEASE | HOLD |

## 公開範囲

- 暮らしの再建トップ、暮らし整理ナビ、8カテゴリ
- 21市町村の自治体公式情報ナビ、0件時・通信失敗時のfallback
- 宇土市の住まい専門ページ（住まい+宇土市選択時限定）
- 既存トップ、ヘッダー、フッター、被災者・支援者向け導線

## HOLDの範囲

- Reviewer、Secondary Reviewer、Approverの確認が完了していない制度カード
- 未承認の金額、条件、期限、必要書類、重大警告、個別窓口
- fixture、ユーザーテスト用データ

## 検証結果

- 9ページ、8カテゴリ、21市町村、未承認制度0件を検証。
- 公式ナビは411件を入力、278件を分類、223件を表示候補としてvalidation済み。
- GitHub Actions「サイト整合性チェック」成功。
- Vercelから200応答を確認。本番の `reconstruction-money.js` とリリースcommitのSHA-256は一致。
- 宇土市、熊本市、不正municipalityのJavaScript実行後DOMを確認。

## 既知の制約

- A-01、B-01、C-01の実利用者テストは未実施。
- 一部の自治体・カテゴリは個別情報0件のため、自治体公式トップへ案内する。
- 厳密制度データは人手承認完了まで非公開。
- 公式情報分類はルールベースのため、warningとACTION_REQUIREDを継続監視する。

## rollback

直前正常commit: `7b3d894`  
条件: 主要ページ利用不能、他自治体情報の誤表示、非公式URL、未承認制度、fixture、機微情報送信を確認した場合。  
方法: force pushは使わず、対象commitを `git revert` してmainへpushする。

## 公開後24時間監視

- GitHub Actionsと3時間更新の成否
- Vercel配信と主要URLのHTTP status
- official-nav件数、未分類、low confidence、HTTP 404候補
- `ACTION_REQUIRED`、カテゴ0件の急増、fallback動作
- 自動更新commit発生時のVercel再配信
