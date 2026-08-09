# 生活再建支援データ基盤 実装報告書

- 対象リポジトリ: `koji0903/r8-kumamoto-saigai`
- 公開サイト: <https://r8-kumamoto-saigai.vercel.app/index.html>
- 実装日: 2026年8月9日
- 実装範囲: 利用者向けUIを含まない、生活再建支援情報の編集・検証基盤

生活再建支援情報を安全に登録・検証するための最小データ基盤を実装した。利用者向けUI、既存HTML/CSS/JavaScript、既存GitHub Actionsには変更を加えていない。

## 追加したファイル

### 編集用データ

`data/reconstruction/` に以下を追加した。

- `disasters.json`
- `municipalities.json`
- `organizations.json`
- `programs.json`
- `applications.json`
- `sources.json`
- `source-links.json`
- `contacts.json`
- `application-periods.json`
- `required-documents.json`
- `next-actions.json`
- `consultation-items.json`
- `README.md`

### JSON Schema

`schemas/reconstruction/` にJSON Schema Draft 2020-12のSchemaを追加した。

- `common.schema.json`
- `disaster.schema.json`
- `municipality.schema.json`
- `organization.schema.json`
- `program.schema.json`
- `application.schema.json`
- `source.schema.json`
- `source-link.schema.json`
- `contact.schema.json`
- `application-period.schema.json`
- `required-document.schema.json`
- `next-action.schema.json`
- `consultation-item.schema.json`

### 検証・設計文書

- `scripts/validate-reconstruction-data.js`
- `docs/reconstruction-data-design.md`

## 各JSONの役割

| JSON | 役割 |
|---|---|
| `disasters.json` | 災害マスタ |
| `municipalities.json` | 対象21市町村の安定ID付き参照データ |
| `organizations.json` | 制度主体・発表主体 |
| `programs.json` | 災害に依存しない制度マスタ |
| `applications.json` | 特定災害・地域への制度適用 |
| `sources.json` | 公的Web、PDF、告示、要綱等の原資料 |
| `source-links.json` | 出典が裏付ける情報、PDFページ、見出し、表番号 |
| `contacts.json` | 申請・相談窓口 |
| `application-periods.json` | 受付開始、期限、延長履歴 |
| `required-documents.json` | 必要書類と必要度 |
| `next-actions.json` | 次にすること、まだしないこと |
| `consultation-items.json` | 相談時の質問定義。回答は保存しない |

自治体名と公式URLは、既存の `data/report-data.js` を正本とし、新データ側との一致を自動検査する。

## 各Schemaの役割

各データファイルに対応するSchemaで、次を定義している。

- 必須項目
- データ型
- 永続IDの接頭辞
- 日付形式
- URL形式
- 列挙値
- 配列の重複禁止
- 未知のプロパティ禁止
- `null`を許容する項目
- consultation itemの「分からない」「回答しない」の必須化

`common.schema.json` に共通列挙値と日付・ID定義を集約し、各Schemaから参照する。

## 列挙値一覧

主な共通列挙値は以下のとおり。

### 困りごとカテゴリ

| 値 | 一般利用者向け名称 |
|---|---|
| `home` | 住まいをどうする |
| `money` | お金・支払い |
| `documents` | 証明・申請 |
| `health_care` | 健康・介護 |
| `family_education` | 子ども・家族 |
| `work_business` | 仕事・事業 |
| `agriculture_fishery` | 農業・漁業 |
| `daily_life` | 暮らし・移動 |

### 提供種別

- `public`
- `private`

### 行政レベル

- `national`
- `prefectural`
- `municipal`
- `none`

### 公開状態

- `draft`
- `published`
- `withdrawn`
- `archived`

### 確認状態

- `verified`
- `partially_verified`
- `needs_review`
- `pending`
- `unverified`
- `expired`
- `withdrawn`

### 鮮度

- `fresh`
- `review_due`
- `stale`
- `source_unreachable`

### 適用状態

- `pending`
- `active`
- `paused`
- `closed`
- `expired`
- `withdrawn`
- `unknown`

組織、出典種別、行動、緊急度、回答形式、書類必要度についても共通定義している。

## verificationStatusの運用ルール

| 状態 | 利用者向け表示 | 確定公開 |
|---|---|---:|
| `verified` | 公式情報で確認済み | 可 |
| `partially_verified` | 一部確認中 | 確定部分のみ |
| `needs_review` | 内容を再確認中 | 不可 |
| `pending` | 正式発表待ち | 不可 |
| `unverified` | 自治体へ確認が必要 | 不可 |
| `expired` | 受付終了 | 現行制度として不可 |
| `withdrawn` | 情報が撤回されました | 不可 |

災害適用を `published` にできるのは `verified` の場合だけである。

`verified` には、対象災害、地域、条件、被害、支援内容、窓口、期限または未発表状態、一次情報、人による確認日時が必要となる。

## 出典必須ルール

確定情報には、単なるURLではなく `sourceLink` による根拠が必要である。

検証対象となる根拠種別には次を含む。

- 今回の災害への適用
- 対象地域
- 対象者条件
- 対象被害
- 支援内容
- 金額・上限
- 申請開始・期限
- 必要書類
- 申請窓口
- 電話番号
- 重要警告
- 終了・撤回

PDFページ、Web見出し、表番号も記録できる。

## 検証スクリプトの検査内容

実行方法:

```bash
node scripts/validate-reconstruction-data.js
```

Node.js標準機能だけで以下を検査する。

- JSON構文
- JSON Schema Draft 2020-12
- 型、必須項目、追加項目
- ID形式と全ファイル横断の重複
- 日付とURL形式
- 列挙値
- 全ID参照の存在
- `sourceLink.entityType` と参照先種別
- 制度・災害・自治体・窓口・出典等の参照切れ
- `verified`なのに出典や重要項目がない
- 公的制度なのに正式な一次情報がない
- 未確認適用の`active`化
- `verified`以外の確定公開
- 終了・撤回状態と公開状態の矛盾
- 過去期限と受付状態の矛盾
- 「まだしないこと」の出典
- 現行自治体データとの名称・URL同期

検証に失敗した場合は終了コード1となり、将来の公開用データ生成を停止できる設計である。

## サンプルデータ

構造確認用として次だけを登録した。

- 災害マスタ：1件
- 対象自治体：現行サイトと同じ21市町村
- 組織：熊本県1件
- 制度マスタ：2件
  - 被災者生活再建支援金
  - 住宅の応急修理
- 災害適用：2件

制度と適用はすべて `draft` / `pending` である。対象自治体、条件、金額、期限、窓口等は推測していない。

出典、窓口、受付期間、必要書類、行動、相談項目は0件である。

## 現行システムへの影響

影響はない。

- 公開ページ変更なし
- CSS変更なし
- 既存JavaScript変更なし
- 既存データ変更なし
- 既存3時間更新Workflow変更なし
- Vercel公開動作変更なし
- 外部依存追加なし
- DB・認証・AI追加なし

新データはまだ公開ページから読み込まれない。

## 実行したテスト

以下はすべて成功した。

- 生活再建データ正常系検証
- 全JSONの構文確認
- 検証スクリプトのNode.js構文確認
- 既存 `tools/check-data.mjs`
- `git diff --check`
- 自治体21件の既存正本との同期検査
- 異常系検証

異常系では、出典・地域・条件・窓口が空の適用情報を強制的に `verified` へ変更し、14件の具体的な理由で公開前検証が失敗することを確認した。

## 残っている課題

- 実在制度の一次情報はまだ登録していない
- 公開用データ生成処理は未実装
- 利用者向けUIは未実装
- 既存Workflowへ検証を組み込んでいない
- 制度情報の確認者・承認者が未決定
- 訂正・確認履歴の専用データモデルは未実装
- 現在のSchema検証は使用中のキーワードに限定した最小実装
- Schemaが高度化した場合はAjv等の採用判断が必要
- `partially_verified`情報を将来どこまで表示するかの公開ポリシーが必要

## 次に進むべきステップ

1. 制度情報の確認・承認担当を決定する
2. 一次情報が揃った実在制度を1件選ぶ
3. 制度、災害適用、出典、窓口、期限を登録する
4. 別担当者が原文と照合する
5. 検証ルールの不足を確認する
6. 公開用データ生成仕様を設計する
7. 「住まい」カテゴリだけで利用者向け表示を試作する
8. その後、既存Workflowへの検証統合を判断する
