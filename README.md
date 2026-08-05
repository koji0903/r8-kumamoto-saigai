# 火の国 災害支援レポート

令和8年熊本地震（2026年7月28日 16:27 発生）の災害・支援情報をまとめた静的サイトです。

熊本県で毎日開催される **「火の国会議」（熊本県災害連携ネットワーク会議）の議事録PDF** を一次資料とし、そこに記載された内容だけを構造化して掲載しています。推測・按分・他資料からの補完は行いません。

- 公開URL: GitHub Pages（`koji0903/r8-kumamoto-saigai`）
- 対象地域: 災害救助法が適用された県内21市町村

---

## 掲載方針

このサイトは緊急通報・安否確認の窓口ではありません。以下の原則で運用します。

1. **出典を必ず添える。** 数値・事実の各項目に、議事録の「回数 + ページ番号」を付けて原PDFへリンクする。
2. **議事録に書かれていないことは書かない。** 自治体別ページには、議事録内で自治体名が明記された事項のみを載せる。合計値からの按分はしない。
3. **定義の変化を隠さない。** 停電戸数 → 事故受付数、住家被害の「判定分」→「推定値」のように、県側の集計定義が途中で変わった箇所は注記で明示する。
4. **一次情報へ誘導する。** 制度・避難・罹災証明などの判断は、必ず国・県・市町村の公式発表を確認するよう各ページで案内する。

---

## ファイル構成

```
├── index.html            サマリー（被災状況スナップショット + 推移グラフ）
├── timeline.html         日ごとのまとめ（検索・トピック絞り込み）
├── affected.html         被災された方向けの入口
├── supporters.html       支援者・支援団体向けの入口
├── municipalities.html   自治体別の被害・支援情報
├── support.html          支援分野別の活動・ニーズ
├── shelters.html         稼働避難所マップ（Leaflet + 国土地理院タイル）
├── guide.html            制度・生活再建ガイド
├── terms.html            災害用語集
├── official.html         公的情報リンク集
├── meetings.html         議事録PDFのアーカイブ一覧
│
├── data.js               会議由来のデータ（手編集）※ 更新の中心
├── shelters-data.js      避難所データ（自動生成・直接編集しない）
├── app.js                共通描画ロジック（全ページで読み込み）
├── shelters.js           避難所マップ専用
├── terms.js / guide.js   用語集 / ガイド専用
├── styles.css            全ページ共通スタイル
│
├── tools/
│   ├── build-shelters.mjs        県公式JSON → shelters-data.js の生成
│   └── shelter-supplements.json  避難所ごとの会議補足（手編集）
│
├── source-files/official/  取得した県公式データの生ファイル（保存用・改変しない）
├── vendor/leaflet/         Leaflet 同梱（CDN に依存しない）
└── *.pdf                   火の国会議 議事録の原本
```

ビルド・パッケージ依存・テストはありません。リポジトリをそのまま静的ホスティングに置けば動作します。ローカル確認は任意のHTTPサーバで。

```bash
python3 -m http.server 8000
```

---

## 日次更新の手順

### 1. 議事録PDFを追加する

その日の火の国会議PDFをリポジトリ直下に置きます。ファイル名は `YYYYMMDD火の国会議NNN回.pdf` の形式に揃えてください。

> 既存の `20260729火の国会議.pdf`（第492回）だけは回数が入っていません。公開済みURLが変わるため、意図的に改名していません。新規ファイルは必ず回数を含めてください。

### 2. `data.js` を更新する

`window.REPORT_DATA` の各配列に追記します。編集対象は主に以下です。

| キー | 内容 | 追記のタイミング |
|---|---|---|
| `days[]` | 会議日ごとの統計・見出し・要約・アクション・注記 | 毎回（1日1件） |
| `municipalEvents[]` | 自治体名が明記された事項 | 該当があれば |
| `supportEvents[]` | 支援分野に紐づく活動・ニーズ | 該当があれば |
| `metrics[]` | グラフに出す指標の定義 | 指標を増減するときだけ |

`days[]` 1件の形:

```js
{
  date: "2026-08-04", meeting: 498, disasterDay: 8, attendees: 180,
  pdf: "20260804火の国会議498回.pdf",
  areas: ["宇土市", "宇城市"],          // 議事録で言及された自治体
  stats: {
    injured: 161, deaths: 38,           // 人的被害
    evacuees: 7646, shelters: 146,      // 避難
    outages: null,                      // 数値がない日は null
    outageStatus: "おおむね解消",        // null のとき代わりに出す文言
    homes: 13393, waterOutages: 44380,
    waterOutageAreas: ["宇城市", "甲佐町", "八代市", "氷川町"]  // 断水戸数の内訳自治体
  },
  topics: ["被害", "避難"],              // timeline.html の絞り込みに使う
  headline: "...", summary: "...",
  actions: ["...", "..."],
  note: "..."                           // 数値の定義・留保はここに書く
}
```

**数値を入れるときの注意**

- 議事録に載っていない指標は `null` にします。`0` は「実際に0だった」を意味するので使い分けてください（例: 8月4日の停電は「おおむね解消」であって0件ではないため `outages: null` + `outageStatus`）。
- `waterOutageAreas` は断水戸数がどの自治体の合計かを示します。トップの断水カードの説明文（「宇城・甲佐・八代・氷川の4市町合計」）はこの配列から自動生成されます。**書き忘れると「会議資料に記載された県内の合計」という断定を避けた文言に切り替わります。** 数値だけ更新して範囲の説明が古いまま残る事故を防ぐための仕組みです。
- 集計定義が前日と変わったら、必ず `note` に書きます。グラフは同じ線で繋がってしまうため、注記がないと読み手が誤読します。
- `municipalEvents[]` / `supportEvents[]` には `page` を必ず入れます。PDFの該当ページに直接リンクするために使います。

### 3. 避難所データを更新する

[防災情報くまもと](https://portal.bousai.pref.kumamoto.jp/?p=evacuation/shelter) の避難所JSONを取得して保存し、生成スクリプトを実行します。

```bash
curl -sS "https://portal.bousai.pref.kumamoto.jp/data/shelter/shelter.json" \
  -o "source-files/official/kumamoto-open-shelters-$(date +%Y%m%d-%H%M).json"
```

```bash
node tools/build-shelters.mjs
```

引数なしで実行すると `source-files/official/` 内で最も新しい `kumamoto-open-shelters-*.json` を選び、`shelters-data.js` を上書きします。ファイルを明示することもできます。

```bash
node tools/build-shelters.mjs source-files/official/kumamoto-open-shelters-20260805-1156.json
```

**抽出条件**（スクリプト内で完結）

- `shelterStartTimestamp` があり、`shelterEndTimestamp` が空欄 = 開設中
- かつ `data.js` の `municipalities[]` に載っている21市町村のもの

取得時刻はファイル名の `YYYYMMDD-HHMM` から読み取り、`metadata.retrievedAt` としてサイト上に「取得 ◯月◯日 ◯時◯分」と表示されます。**ファイル名の時刻は取得した実時刻にしてください。** 秒まで指定したい場合は `--retrieved-at=2026-08-05T11:56:22+09:00` を渡します（表示は分までなので通常は不要）。

書き込まずに差分の有無だけ見るには `--check` を付けます（差分ありで終了コード1）。

```bash
node tools/build-shelters.mjs --check
```

補足IDの誤り、緯度経度の欠損、開設中0件などはスクリプトが警告・中断します。`shelters-data.js` は生成物なので、直接編集しても次回の生成で消えます。

### 4. 避難所への会議補足を足す（任意）

議事録に施設名が明記された報告があれば、`tools/shelter-supplements.json` に追記します。県の施設ID（`facilityId`）をキーにします。

```json
{
  "00002252": [
    {
      "date": "2026-08-01", "meeting": 495, "page": 12,
      "pdf": "20260801火の国会議495回.pdf",
      "text": "避難中の猫4匹について、飼い主が片付けに行く間の預かり支援ニーズを報告。"
    }
  ]
}
```

施設IDは生成済みの `shelters-data.js` を施設名で検索すると分かります。存在しないIDを書いた場合は生成時に警告が出ます。

### 5. 確認してコミット

- `index.html` の数値・グラフが更新されているか
- `timeline.html` に当日分が出ているか
- 各PDFリンクが開くか（ファイル名の回数が合っているか）
- `shelters.html` の地図と件数、「取得◯時◯分」の表示

---

## SNS シェア用画像（OGP）

`ogp.png`（1200×630）を全ページの `og:image` に指定しています。差し替えるときは同じ寸法で `ogp.png` を置き換えてください。

`og:image` と `og:url` は**相対指定**にしてあります。公開ドメインが確定していないためで、主要なクローラは取得したページのURLを基準に解決します。カスタムドメインを設定した場合は、絶対URLに書き換えるとサムネイルの取得がより確実になります。

```html
<meta property="og:url" content="https://example.jp/index.html">
<meta property="og:image" content="https://example.jp/ogp.png">
```

favicon は `favicon.png`（32px）と `apple-touch-icon.png`（180px）です。

---

## 既知の制約と運用上の注意

- **JavaScript が必要です。** 統計・一覧・地図はすべてクライアント側で描画します。JS が無効な環境では各ページの `noscript` から公式サイトへ誘導する構成になっています。
- **`data.js` に構文エラーがあると全ページのJSが止まります。** 更新後は必ずブラウザのコンソールを確認してください（`app.js` は読み込み失敗時にページ上部へ警告を出します）。
- **避難所データは取得時点のスナップショットです。** 開設状況は随時変わるため、サイト上でも「支援活動前に再確認」を明示しています。
- **`index.html` の「開設中◯件」と会議資料の「避難所◯か所」は一致しません。** 出所（県の施設データ / 会議報告）と時点が異なるためで、それぞれ別の数値として扱っています。
- **議事録PDFの容量。** 1日あたり約800KB がリポジトリ履歴に積み上がります（2026年8月時点で計5.7MB）。長期運用する場合は Git LFS への移行、または別ストレージへの退避を検討してください。公開済みURLが変わる作業なので、移行時はリダイレクトの用意が必要です。

---

## 出典

- 火の国会議 議事録（熊本県災害連携ネットワーク会議）
- 熊本県「防災情報くまもと」避難所情報 — <https://portal.bousai.pref.kumamoto.jp/>
- 地図タイル: 国土地理院 — <https://maps.gsi.go.jp/development/ichiran.html>
- 地図ライブラリ: [Leaflet](https://leafletjs.com/)（BSD-2-Clause、`vendor/leaflet/` に同梱）

掲載値には速報値が含まれ、調査・判定の進展により変動します。制度の適用可否・申請手続きは、必ず各自治体の窓口および公式発表をご確認ください。
