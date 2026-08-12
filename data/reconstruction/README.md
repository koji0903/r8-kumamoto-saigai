# 生活再建支援データの編集・確認手順

このディレクトリは、被災者と支援者に生活再建支援情報を安全に案内するための、編集用データです。現在の公開ページはまだこのデータを読みません。

> **重要：「制度があること」と「令和8年熊本地震で使えること」は別です。**
>
> `programs.json` に制度があっても、確認済みの `applications.json` がなければ、今回の災害で利用できる制度として扱ってはいけません。不明な条件を推測せず、`null`、`unknown`、`pending` を使ってください。

## ファイルの役割

| ファイル | 内容 |
|---|---|
| `disasters.json` | 災害マスタ |
| `municipalities.json` | 現行サイトの対象21市町村を安定IDで参照するスナップショット |
| `organizations.json` | 国、県、市町村、社協、NPO等の組織 |
| `programs.json` | 災害に依存しない制度・民間支援のマスタ |
| `applications.json` | 制度が特定災害・地域へどう適用されるか |
| `municipality-application-statuses.json` | 災害適用ごとの自治体別実施・受付確認状態 |
| `sources.json` | 公的ページ、PDF、告示、要綱等の原資料 |
| `source-version-relations.json` | 原資料の改訂・差替え・撤回関係 |
| `source-links.json` | 出典と、出典が裏付ける項目・ページ・見出しの関係 |
| `contacts.json` | 申請・相談窓口。電話番号や受付時間を含む |
| `application-periods.json` | 受付開始、期限、延長履歴 |
| `required-documents.json` | 必要書類と必要度 |
| `next-actions.json` | 次にすること、まだしないこと |
| `consultation-items.json` | 相談時に確認する質問の定義。回答は保存しない |
| `verification-events.json` | 誰が、どの根拠を、いつ確認・承認したかの履歴 |
| `source-change-events.json` | 公式sourceの変更・継続到達不能と影響entityの未解決レビュー記録 |
| `source-revisions.json` | 同一sourceの旧新hashと検知日時を結ぶ改訂履歴 |

## 正本と生成物

このディレクトリのJSONを編集用の正本とします。将来の公開フローは次の順序です。

```text
編集用JSON → 検証 → 公開用データ生成 → HTML表示
```

検証に失敗したデータから公開用データを生成してはいけません。現段階では公開用データ生成と利用者向けUIは未実装です。

## 自治体情報の同期

対象自治体の名称と公式URLの現行正本は `data/report-data.js` の `municipalities` です。`municipalities.json` は、生活再建データから安定IDで参照するためのスナップショットです。

自治体の追加・名称変更・公式URL変更は次の順で行います。

1. 現行サイト側の自治体データを一次情報で確認して更新する
2. `municipalities.json` を同じ名称・URLへ同期する
3. 自治体IDは表示名が変わっても原則変更しない
4. 検証スクリプトを実行する

検証スクリプトは両方の自治体名とURLが一致するか確認します。

## IDルール

IDは小文字英数字とアンダースコアで構成し、配列indexを参照に使いません。表示名が変わってもIDを変えません。

| データ | 接頭辞 |
|---|---|
| 災害 | `disaster_` |
| 自治体 | `municipality_` |
| 組織 | `org_` |
| 制度 | `program_` |
| 災害適用 | `application_` |
| 自治体別状態 | `municipality_application_status_` |
| 出典 | `source_` |
| 出典関連 | `source_link_` |
| 窓口 | `contact_` |
| 受付期間 | `period_` |
| 必要書類 | `document_` |
| 行動 | `action_` |
| 相談項目 | `consultation_` |
| 出典版関係 | `source_version_relation_` |
| 確認・承認履歴 | `verification_event_` |

IDには変更されやすい金額、期限、表示順を含めません。一度公開参照に使ったIDは再利用しません。

## 日付ルール

- 日時が分かる場合：`2026-08-09T10:30:00+09:00`
- 日だけ分かる場合：`2026-08-09`
- 分からない場合：`null`

時刻が不明な資料に `00:00:00` 等の推定時刻を作ってはいけません。

## 共通列挙値

正式な機械可読定義は `schemas/reconstruction/common.schema.json` にあります。

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

### 主な状態

- `providerType`: `public`, `private`
- `governmentLevel`: `national`, `prefectural`, `municipal`, `none`
- `publicationStatus`: `draft`, `published`, `withdrawn`, `archived`
- `verificationStatus`: `verified`, `partially_verified`, `needs_review`, `pending`, `unverified`, `expired`, `withdrawn`
- `freshnessStatus`: `fresh`, `review_due`, `stale`, `source_unreachable`
- `applicationStatus`: `pending`, `active`, `paused`, `closed`, `expired`, `withdrawn`, `unknown`

状態の責務は次のとおりです。

- `applicationStatus`: 制度が今回の災害へ適用・運用されているか
- `municipality-application-statuses.implementationStatus`: 自治体が対象地域として実施対象か
- `receptionStatus`: その自治体の受付開始・停止・終了を確認できたか
- `applicationMethodStatus`: 申請方法を確認できたか
- `contactStatus`: 自治体の申請窓口を確認できたか
- `localGuidanceStatus`: 自治体独自の公式案内を確認できたか
- `verificationStatus`: 登録内容の根拠と人の確認が十分か
- `publicationStatus`: 編集データを公開対象にできるか
- `freshnessStatus`: 最終確認後も情報が新しいか

`receptionStatus=confirmed`は「受付しているらしい」という意味ではない。自治体別状態が`verified`で、開始・窓口等の根拠が追跡できる場合だけ使用する。

## verificationStatusの運用

| 状態 | 状態の意味 | 一般利用者への表示 | 支援者への表示 | 確定公開 |
|---|---|---|---|---|
| `verified` | 必須情報を一次情報と人の確認で検証済み | 公式情報で確認済み | 根拠と確認日時を表示 | 可 |
| `partially_verified` | 適用等は確認済みだが期限など一部未確認 | 一部確認中 | 未確認項目を明示 | 確定部分のみ可 |
| `needs_review` | 変更検知や矛盾により再確認が必要 | 内容を再確認中 | 変更候補・矛盾を表示 | 不可 |
| `pending` | 正式発表前、または発表待ち | 正式発表待ち | 何が未発表か表示 | 不可 |
| `unverified` | 十分な一次情報を確認できていない | 自治体へ確認が必要 | 不足根拠を表示 | 不可 |
| `expired` | 受付終了を確認済み | 受付終了 | 終了根拠と日付を表示 | 現行制度として不可、記録公開は可 |
| `withdrawn` | 発表主体が撤回・訂正 | 情報が撤回されました | 撤回元と後継情報を表示 | 不可 |

### verifiedへ進める条件

1. 公的実施主体または正式な制度主体の一次情報がある
2. 対象災害が確認できる
3. 対象地域が確認できる
4. 支援内容が確認できる
5. 申請または問い合わせ先が確認できる
6. 期限がある場合、期限または「未発表」であることが確認できる
7. 原文URLまたは保存原本へ到達できる
8. 発表日または取得日を記録している
9. 人による確認日時を記録している
10. `verification-events.json` に人によるレビューがある
11. 承認者を記録した`approved/confirmed`イベントがある
12. 未解決の矛盾する一次情報がない

一つでも満たさない場合は `verified` にしません。期限だけ未発表の場合などは、根拠を付けて `partially_verified` とします。

Schema検証やCodexによる照合補助だけでは`verified`にしない。確認者と承認者は別人物を推奨するが、一人運用を止めないため同一人物も許容し、検証時に警告する。金額、期限、対象地域、電話番号など誤案内の影響が大きい項目は、公開前に別人物の二重確認を行う。

## 自治体別受付状態

制度適用と自治体受付を分離する。例えば宇土市が県実施対象に含まれていても、宇土市の開始日や申請窓口が確認できなければ次のように保持する。

```json
{
  "implementationStatus": "confirmed",
  "receptionStatus": "pending",
  "applicationMethodStatus": "pending",
  "contactStatus": "pending",
  "localGuidanceStatus": "pending"
}
```

この状態からは「制度の対象地域ですが、宇土市の受付方法は現在確認中です」と変換する。「宇土市で受付中」とは表示しない。

## 必要書類のscope

- `scopeLevel`: 根拠資料の行政レベル（`national`、`prefectural`、`municipal`）
- `scopeMunicipalityIds`: `municipal`の場合の対象自治体
- `documentContext`: 一般制度例、今回災害の適用、自治体固有書類の区別
- `programIds` / `applicationIds`: 制度と災害適用への追跡

県の今回災害向け案内に記載された書類は、`prefectural + disaster_application`とする。宇土市独自書類が確認できるまで`municipality_specific`へ読み替えない。

## PDF原本・改訂管理

1. 取得のたびに原URL、取得日時、発表主体、発表日・改訂日、SHA-256、保存先を記録する。
2. PDFはURLではなくハッシュで同一性を判定する。
3. 同じURLでハッシュが変わった場合、旧sourceを上書きせず、新しいsource IDを作る。
4. `source-version-relations.json`で`revision`、`replacement`、`withdrawal`のいずれかを結ぶ。
5. 旧版は`superseded`、撤回資料は`withdrawn`とし、後継資料を確定するまで関連エンティティを`needs_review`にする。
6. 保存時は発表主体・災害・制度・取得日・ハッシュ先頭値を含む衝突しないファイル名を使う。
7. 同一URLのハッシュ変更、公式ページの更新日変更、リンク切れを変更検知として扱う。

## 再確認周期

- 自治体受付状況、受付開始前、電話番号、窓口：毎日
- 申込期限が30日以内：毎日。その他の期限：週1回
- 金額、対象地域、必要書類：公式source変更検知時と週1回
- 一般制度説明：月1回または法令・所管資料更新時
- `contentHash`・公式更新日時の変更：直ちに`needs_review`
- 期限超過：受付状態を自動確定せず、重大警告として人が公式終了情報を確認

## 制度を追加する手順

1. 正式な制度主体の一次情報を探す
2. `organizations.json` に主体がなければ追加する
3. `sources.json` に原資料を追加する
4. `programs.json` に制度マスタを `draft` で追加する
5. `source-links.json` で一般制度説明と原資料を結ぶ
6. 今回の災害への適用が確認できた場合だけ `applications.json` を追加する
7. 地域、条件、期限、窓口ごとに根拠を結ぶ
8. 人が原文と入力内容を照合する
9. 検証を実行する
10. verified条件を満たす場合だけ状態を変更する

制度マスタを登録しただけで「今回使える」と記載してはいけません。

## 出典を追加する手順

1. 発表主体が正式な制度主体か確認する
2. `sources.json` に原文URL、資料名、発表日、取得日等を登録する
3. PDFを保存する場合は `archivedPath` と `contentHash` を記録する
4. `source-links.json` に根拠対象と `claimType` を登録する
5. PDFページ、Web見出し、表番号が分かる場合は記録する
6. 内容を人が照合し、`verifiedAt` を記録する

新聞、SNS、一般まとめサイトを公的制度の正式根拠にしません。

## 出典が必須の確定情報

- 今回の災害への適用
- 対象自治体、対象者、対象被害
- 支援金額、上限額
- 申請開始、申請期限
- 必要書類
- 受付窓口、電話番号
- 契約前確認等の重要警告
- 制度終了、撤回

一般向け説明文は人による要約で構いませんが、要約の根拠となる事実には出典が必要です。

## 期限変更時の対応

1. 既存期限を無断で削除・上書きしない
2. 新しい期間レコード、または変更履歴を登録する
3. `previousDeadlineAt` と `isExtended` を設定する
4. 新旧双方の根拠を保存する
5. 関係する適用情報を `needs_review` にする
6. 人が確認後に公開状態を戻す

## consultation-itemsの注意

これは「何を確認するとよいか」の定義です。氏名、住所、電話番号、生年月日、所得額、病歴、障がい、家族情報などの回答を保存する仕組みではありません。

- 最初に表示する質問は制度ごとに原則3問程度
- 必要な場合だけ追加質問を出す
- `allowUnknown` と `allowDecline` は必ず `true`
- 「分からない」「回答しない」でも先へ進める
- 現段階では回答をサーバーへ送信・保存しない

## 間違いを見つけた場合

1. 対象を直ちに `needs_review` にする
2. 誤りのある情報を確定表示に使わない
3. 原資料と変更履歴を保存する
4. 正しい一次情報を確認する
5. 関連する期限、窓口、行動、必要書類も再確認する
6. 修正後に別の人が照合する
7. 検証を実行する

削除して痕跡を消すのではなく、撤回・訂正・失効状態を使用します。

## 検証方法

リポジトリのルートで実行します。外部パッケージは不要です。

```bash
node scripts/validate-reconstruction-data.js
```

検証に失敗した場合は公開用データを作らず、表示されたデータと一次情報を確認してください。

## 公開用データ生成

編集用JSONを公開画面から直接読ませない。次のコマンドは最初に検証を実行し、成功した場合だけ`public-data/reconstruction/`へ表示用JSONを生成する。

```bash
node scripts/build-reconstruction-public-data.js
```

生成物は`programs.json`、`municipalities.json`、`categories.json`、`home.json`である。`draft`、撤回済み制度、内部notes、確認者・承認者、verificationEventは含めない。

現在の応急修理パイロットは人の公開承認前で`draft`のため、通常生成では制度一覧に出力されない。公開候補へ変更する場合も、`partially_verified`の未確認項目を確定文へ変換してはいけない。
