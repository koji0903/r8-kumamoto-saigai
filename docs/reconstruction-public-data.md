# 生活再建支援情報の運用・公開データ仕様

## 目的

編集用JSONを利用者画面へ直接渡さず、検証と事実単位の公開判定を通した簡単な表示用JSONを生成する。管理画面、認証、DB、自動承認は導入しない。

## 公開フロー

```text
編集用JSON
  ↓ validate-reconstruction-data.js
公開可否・事実単位判定
  ↓ build-reconstruction-public-data.js
public-data/reconstruction/*.json
  ↓ 将来の公開HTML / JavaScript
```

検証に失敗した場合は生成しない。生成処理が`verified`へ変更することもない。

## 確認・承認の運用

正式なユーザー管理を導入するまでは担当者名を記録し、IDは`null`を許容する。一人運用の場合も、登録、一次情報照合、`reviewed`、再確認、`approved`を別操作として記録する。承認日時は最新レビューより後でなければならない。

同一人物かどうかはreviewerとapproverのID、IDがなければ名称の一致から導出する。専用の`samePersonApproval`は追加しない。同一人物は警告、同一時刻のレビュー・承認はエラーとする。

## 二重確認対象

新しい`highRisk`属性は追加せず、既存のentity種別と`claimType`から判定する。次を高リスクとする。

- `disaster_application`: 対象災害
- `eligible_area`: 対象自治体
- `eligibility`、`eligible_damage`: 対象者・被害条件
- `benefit`、`amount`: 支援内容・限度額
- `start_date`、`deadline`、`closure`: 開始・期限・終了
- `required_document`: 必要書類
- `application_office`、`contact`: 申請方法・窓口・電話
- `warning`: 併用不可、契約前確認等

これらは可能な限り別人物が確認・承認する。

## partially_verifiedの公開

レコード全体を「ほぼ確認済み」と扱わない。`sourceLink`のclaim単位と自治体別状態から、適用、対象地域、条件、金額、期限、窓口、書類、警告を別々に判定する。

- 人の確認がある事実だけ`confirmed`
- 根拠はあるが人の確認が不足、または自治体詳細が未発表なら`pending`
- 公式情報がない場合は`not_available`
- 更新検知後は`needs_review`

現在の生成処理は、エンティティが`verified`、または該当sourceLinkに人の`verifiedAt`がある場合だけ確定事実として扱う。

## 自治体別状態の省力運用

制度適用の`municipalityIds`に含まれる自治体すべてへ空の自治体別レコードを作らない。自治体独自の受付状況、方法、窓口、案内を確認した段階でだけ`municipality-application-statuses.json`へ追加する。

生成時、対象自治体に個別レコードがなければ「個別受付情報を確認中」と導出する。未登録を`confirmed`、`not_applicable`、`closed`へ推定しない。

## 公開用データ

- `programs.json`: 制度表示モデル
- `municipalities.json`: 制度ごとの自治体表示状態
- `categories.json`: カテゴリと公開件数
- `home.json`: 「家が壊れた」入口の最小表示モデル

制度表示モデルには、タイトル、正式名称、安全な要約、カテゴリ、今回災害での確認状態、自治体別表示、公開可能な次の行動、警告、必要書類、一次情報、最終確認日だけを含める。

## 内部statusから表示文への変換

| 公開判定 | 表示文 |
|---|---|
| `confirmed` | 公式情報で確認済み |
| `pending` | 現在、公式情報を確認中です |
| `needs_review` | 情報が更新された可能性があるため、現在再確認しています |
| `expired` | 受付は終了しています |
| `not_available` | 公式情報を確認できていません |
| 自治体受付確認済み | ○○市で受付を確認済み |
| 自治体受付未確認 | ○○市での個別受付情報を確認中 |

これらは公開用の派生状態であり、内部statusをそのまま画面へ表示するものではない。

## nextActionとフォールバック

行動指示は`published + verified`で根拠があるものだけ公開する。`pending`、`unverified`、確認されていない`partially_verified`の行動は出力しない。

窓口が確認できない場合は、対象可否を断定せず「最新情報は○○市公式情報をご確認ください。相談先が確認でき次第更新します」と表示する。

## 公開しない情報

- reviewerName、approverName
- reviewerId、approverId
- verificationEvent
- 内部notes
- draft
- withdrawnの現行情報
- unverifiedな期限・窓口・書類・行動
- 内部verificationStatus等の値

## source変更監視の将来フロー

```text
定期取得
  ↓ contentHash・公式更新日時を比較
変更検知
  ↓ 関連sourceLinkを抽出
関連entityをneeds_review候補へ
  ↓ 人が原文と差分を確認
reviewed / approved
  ↓ 公開用データ再生成
```

変更検知だけで`verified`へ戻さない。

## PDF保存規約案

```text
archive/reconstruction/{organization}/{yyyy-mm-dd}/{source-id}_{hash-prefix}.pdf
```

原URL、取得日時、contentHash、発表主体、発表日、改訂日をsourceに保持する。同一URLでハッシュが変わった場合は別sourceとし、版関係を登録する。実際の保存処理は次段階とする。
