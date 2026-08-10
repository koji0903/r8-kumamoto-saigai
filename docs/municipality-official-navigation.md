# 自治体公式情報ナビゲーション基盤

## 役割と3段階

このサイトは自治体の窓口情報を複製せず、利用者を一次情報へ案内します。金額・期限・対象条件などは既存の厳格な検証基盤（LEVEL 1）、自治体公式個別ページはタイトルと分類による案内（LEVEL 2）、個別ページが見つからない場合は自治体公式トップ（LEVEL 3）として扱います。

## データの流れ

`tools/fetch-municipality-updates.mjs` が3時間ごとに収集する既存JSONを、`scripts/build-municipality-reconstruction-nav.mjs` が読み取り専用の入力として再利用します。新しいスクレイパーや別の情報源は追加しません。生成物は `public-data/reconstruction/municipality-official-navigation.json` です。

分類はタイトル・URL・既存カテゴリに対するキーワード一致です。複数カテゴリを許可し、内部確認用に一致語と high / medium / low を保存します。信頼度は画面には表示しません。本文を保存していないため、自動要約や制度条件の断定には使用しません。

公式URLは自治体マスターの公式ホストと一致し、タイトルを取得できたものだけを採用してURL重複を除外します。各ページには `sourceType: municipal_official` と `status: active` を明示します。404等の取得失敗は既存収集データの `errors` として保持し、一時失敗だけで既存情報を削除しません。個別情報が0件でも21市町村すべての公式トップを保持します。

## 更新と確認

```sh
node scripts/run-municipality-official-nav-pipeline.mjs
node scripts/test-municipality-reconstruction-nav.mjs
```

単一パイプラインはネットワークへアクセスせず、正本 `sources/official/municipalities/municipality-updates.json` を読み込み、分類、重複・過去災害・公式ドメイン検査、validation、品質レポート生成を行います。検証に失敗した場合は表示用JSONを置き換えません。表示用の正規出力は `public-data/reconstruction/municipality-official-navigation.json`、監査出力は `reports/municipality-official-navigation-quality.json` です。

confidenceは、カテゴリ一致語1件で medium、複数一致または合計スコア4以上で high、既存カテゴリだけの弱い根拠で low とします。lowは内部データに保持しますが通常表示しません。取得から12時間を超えた自治体、一時取得失敗、前回比50%を超える分類件数減少はwarningとし、自動削除や生成停止には使用しません。404は継続回数の確認が必要な削除候補、301/308は新URL確認候補としてwarningを分けます。入力0件または入力があるのに全カテゴリ0件の場合はエラーとして表示データの更新を中止します。

現段階ではGitHub Actionsの必須チェックへ追加しません。既存3時間更新の後処理として組み込むのが次の段階です。電話番号・受付時間・担当課は原則として再管理せず、公式ページで確認してもらいます。

## 8カテゴリ共通UI

`reconstruction-official.html` と `municipality-official-nav.js` が8カテゴリ・21市町村を共通処理します。URLの `category` と `municipality` は定義済み値との完全一致で検証し、未選択時に複数自治体を混在させません。通常表示は high / medium confidence の新しい情報を最大5件とし、残りは利用者が展開できます。low confidenceと過去災害は通常表示しません。
