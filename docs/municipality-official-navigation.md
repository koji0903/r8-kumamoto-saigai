# 自治体公式情報ナビゲーション基盤

## 役割と3段階

このサイトは自治体の窓口情報を複製せず、利用者を一次情報へ案内します。金額・期限・対象条件などは既存の厳格な検証基盤（LEVEL 1）、自治体公式個別ページはタイトルと分類による案内（LEVEL 2）、個別ページが見つからない場合は自治体公式トップ（LEVEL 3）として扱います。

## データの流れ

`tools/fetch-municipality-updates.mjs` が3時間ごとに収集する既存JSONを、`scripts/build-municipality-reconstruction-nav.mjs` が読み取り専用の入力として再利用します。新しいスクレイパーや別の情報源は追加しません。生成物は `public-data/reconstruction/municipality-official-navigation.json` です。

分類はタイトル・URL・既存カテゴリに対するキーワード一致です。複数カテゴリを許可し、内部確認用に一致語と high / medium / low を保存します。信頼度は画面には表示しません。本文を保存していないため、自動要約や制度条件の断定には使用しません。

公式URLは自治体マスターの公式ホストと一致するものだけを採用し、URL重複を除外します。404等の取得失敗は既存収集データの `errors` として保持し、一時失敗だけで既存情報を削除しません。個別情報が0件でも21市町村すべての公式トップを保持します。

## 更新と確認

```sh
node scripts/build-municipality-reconstruction-nav.mjs
node scripts/test-municipality-reconstruction-nav.mjs
```

現段階ではGitHub Actionsの必須チェックへ追加しません。既存3時間更新の後処理として組み込むのが次の段階です。電話番号・受付時間・担当課は原則として再管理せず、公式ページで確認してもらいます。
