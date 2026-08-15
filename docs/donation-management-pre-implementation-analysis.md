# よか隊ネット熊本 寄付金管理機能追加前 既存システム分析

- 調査日: 2026年8月14日
- 対象: ローカル最新版 `main`（`9094df6`）および公開サイト [yokatainet.jp](https://www.yokatainet.jp/)
- 調査方式: READ ONLY調査。分析時点ではコード、設定、データ、依存関係を変更していない。

## 1. エグゼクティブサマリー

現行サイトは、Next.js・React・Firebaseを使わない、素のHTML/CSS/JavaScriptによる静的サイトである。Vercelから静的ファイルとして配信され、災害情報の取得・検証・更新はGitHub Actionsが担当している。

寄付金管理機能が必要とする認証、サーバー処理、データベース、非公開画像保管、監査ログは、現在のシステムには存在しない。既存サイトへ直接組み込むより、別アプリ・別Vercelプロジェクト・別Firebaseプロジェクトとして分離するのが最も安全である。

総合評価は次のとおり。

- 既存サイトへの静的な寄付者向け公開報告ページ追加: 比較的容易
- 現行サイト内への管理システム直接追加: 高リスク
- 独立した管理アプリとして追加: 推奨
- 共有パスワード方式: 技術的には可能。ただし現在の静的構成のままでは不可能
- Firestore・Firebase Storage導入: 独立アプリに限定すれば適合可能
- レシートOCR・AI解析: 管理アプリのサーバー側処理として分離すべき

最も安全な境界は次の構成である。

```text
www.yokatainet.jp
└─ 現行の公開災害支援サイト（原則維持）

funds.yokatainet.jp
└─ 新規の寄付金管理アプリ
   ├─ 共有パスワード認証
   ├─ Firestore
   ├─ Firebase Storage
   ├─ レシート解析
   └─ 寄付者向け報告
```

## 2. 現在の技術構成

| 項目 | 調査結果 |
|---|---|
| Next.js | 未使用 |
| Next.jsバージョン | 該当なし |
| React | 未使用 |
| Reactバージョン | 該当なし |
| ルーター | App Router、Pages Routerともに未使用 |
| ページ構成 | ルート直下の静的HTML |
| TypeScript | 未使用 |
| JavaScript | ブラウザ向け `.js`、生成・検査用Node.js `.mjs` |
| CSS | 共通CSS＋ページ・機能別CSS |
| Tailwind CSS | 未使用 |
| UIライブラリ | 未使用 |
| 状態管理 | ライブラリなし。DOMとページ内変数のみ |
| API Routes | なし |
| Server Actions | なし |
| データ保存 | リポジトリ内のJSON、JavaScriptデータ、PDF、画像 |
| Firebase | 未使用 |
| Firestore | 未使用 |
| Firebase Storage | 未使用 |
| Firebase Authentication | 未使用 |
| AI API | 未使用 |
| Vercel固有機能 | 現状確認できるのは静的配信、キャッシュ、HTTPS |
| アクセス解析 | Google Analytics `G-ZPDRHTGZCR` |
| 地図 | 同梱されたLeaflet |
| ビルド依存 | `package.json` なし。Node.js標準機能中心 |
| Python依存 | GitHub Actions実行時にPyMuPDFを一時インストール |

主な根拠ファイル:

- `README.md`
- `org-site.js`
- `design-system.css`
- `.github/workflows/validate-site.yml`
- `.github/workflows/refresh-official-data.yml`

`package.json`、`next.config.*`、`tsconfig.json`、`tailwind.config.*`、`firebase.json`、`.firebaserc`、`vercel.json` は存在しない。

## 3. ディレクトリ構成

| ディレクトリ | 有無 | 役割 |
|---|---:|---|
| `pages/` | なし | Next.js Pages Router不使用 |
| `app/` | なし | Next.js App Router不使用 |
| `src/` | なし | ソースはルート直下中心 |
| `components/` | なし | コンポーネントフレームワーク不使用 |
| `lib/` | なし | 共通ライブラリ層なし |
| `utils/` | なし | ユーティリティ専用層なし |
| `data/` | あり | 手編集データ、生成データ、生活再建データ |
| `public/` | なし | ルート全体が静的公開物に近い構成 |
| `public-data/` | あり | ブラウザ向けに生成された公開JSON |
| `api/` | なし | APIなし |
| `scripts/` | あり | 生活再建データ生成、監視、検査 |
| `tools/` | あり | 公式情報の取得・変換、SEO生成 |
| `docs/` | あり | 設計、運用、レビュー、テスト記録 |
| `schemas/` | あり | 生活再建JSONのスキーマ |
| `reports/` | あり | 自動検証・監視結果 |
| `sources/` | あり | 公的原資料、PDF、取得JSON |
| `config/` | あり | サイトフェーズ、検索、分類設定 |
| `assets/` | あり | OGP、イラスト素材 |
| `vendor/` | あり | Leafletのローカル同梱 |
| `test/` | あり | テスト用fixture |
| `functions/` | なし | Firebase/Vercel Functionsなし |
| `firebase/` | なし | Firebase構成なし |
| `prisma/` | なし | ORM・DBスキーマなし |
| `.github/workflows/` | あり | 検証と定期データ更新 |

## 4. ルーティング構成

現行ルートはファイル名がそのままURLになる。

| URL | 対応ファイル | 役割 |
|---|---|---|
| `/` | `index.html` | 団体・災害支援サイトのトップ |
| `/disaster.html` | `disaster.html` | 令和8年熊本地震の支援情報入口 |
| `/affected.html` | `affected.html` | 被災者が困りごとから探す入口 |
| `/reconstruction.html` | `reconstruction.html` | 生活再建支援の総合ナビ |
| `/reconstruction-money.html` | 同名HTML | お金・支払い |
| `/reconstruction-documents.html` | 同名HTML | 証明・申請 |
| `/reconstruction-health-care.html` | 同名HTML | 健康・介護 |
| `/reconstruction-family.html` | 同名HTML | 子ども・家族 |
| `/reconstruction-work-business.html` | 同名HTML | 仕事・事業 |
| `/reconstruction-agriculture-fishery.html` | 同名HTML | 農業・漁業 |
| `/reconstruction-search.html` | 同名HTML | 公式情報検索 |
| `/guide.html` | `guide.html` | 制度・生活再建ガイド |
| `/shelters.html` | `shelters.html` | 避難所情報・地図 |
| `/municipalities.html` | `municipalities.html` | 自治体別情報 |
| `/municipality-updates.html` | 同名HTML | 市町村公式発信 |
| `/timeline.html` | `timeline.html` | 日ごとの記録 |
| `/meetings.html` | `meetings.html` | 火の国会議議事録 |
| `/supporters.html` | `supporters.html` | 支援者向け入口 |
| `/volunteer-centers.html` | 同名HTML | 災害VC情報 |
| `/about.html` | `about.html` | 団体紹介 |
| `/join.html` | `join.html` | 支援・協力 |
| `/contact.html` | `contact.html` | 問い合わせ案内 |
| `/privacy.html` | `privacy.html` | プライバシーポリシー |
| `/accessibility.html` | 同名HTML | アクセシビリティ方針 |

既存ルートと衝突しにくい候補:

- `/funds/`
- `/fund-management/`
- `/donation-management/`
- `/internal/funds/`

ただし、現行Vercelプロジェクト内に管理アプリを置く場合は、デプロイ方式やルーティング設定の変更が必要になる。安全性では `funds.yokatainet.jp` の独立サブドメインが優れる。

`/donations` は一般向け寄付募集ページと誤認されやすく、内部管理用途には適しにくい。

## 5. データ構造

### 静的・手編集データ

- `data/report-data.js`: 災害集計、日別情報、自治体・支援情報
- `data/minutes-data.js`: 火の国会議議事録
- `data/reconstruction/*.json`: 制度、申請、必要書類、窓口、出典など
- `config/*.json`: 検索同義語、カテゴリ関係、自治体分類設定
- `schemas/reconstruction/*.json`: データ検証スキーマ
- `sources/hinokuni-meetings/*.pdf`: 原本PDF

### 自動生成データ

- `data/generated/hq-*.js`: 熊本県災害対策本部データ
- `data/generated/shelters-data.js`: 開設中避難所
- `data/generated/municipality-updates.js`: 市町村公式発信
- `data/generated/official-topics.js`: 国・県等の最新トピックス
- `public-data/reconstruction/*.json`: 生活再建画面向け公開データ
- `reports/*.json`: 監視・品質検査結果
- `sitemap.xml`: HTML履歴をもとに生成

### 動的データ

サーバー上で利用者が登録・更新する動的データはない。ブラウザの検索や絞り込みは静的ファイルを読み込み、クライアント内で処理する。

`localStorage`、`sessionStorage`、Cookieによる利用者情報保存も、生活再建機能では意図的に使用していない。

### 外部取得データ

- 熊本県災害対策本部ページ・PDF
- 熊本県防災ポータルの避難所JSON
- 対象市町村の公式サイト
- 内閣府、農林水産省等の公式情報

依存関係は概ね次のとおり。

```text
公的サイト・PDF
  ↓ GitHub Actions
tools/・scripts/
  ↓ 取得・検証・変換
sources/・data/reconstruction/
  ↓ 公開用生成
data/generated/・public-data/
  ↓ fetchまたはscript読込
各静的HTML・JavaScript画面
```

この経路は寄付金管理機能から完全に分離すべきである。

## 6. API・自動処理

| 種類 | 状況 |
|---|---|
| API Routes | なし |
| Route Handlers | なし |
| Server Actions | なし |
| Edge Functions | なし |
| Serverless Functions | なし |
| Vercel Cron | なし |
| GitHub Actions Cron | あり |
| ブラウザからの自サイトJSON取得 | あり |
| ブラウザからの業務API通信 | なし |

### GitHub Actions

`validate-site.yml`:

- push、PR、手動実行時に動作
- SEO生成物検査
- 災害データ整合性検査
- 生活再建機能の多数の回帰検査
- JavaScript構文検査
- Workflow安全性検査
- 空白エラー検査

`refresh-official-data.yml`:

- 3時間ごとに実行
- 熊本県資料、市町村発信、公的トピック、避難所を取得
- 生活再建制度の公式根拠変更を監視
- データとSEOを再生成・検証
- 成功した生成物だけをコミットし、`main` へpush
- force pushは行わない
- 取得失敗時は既存検証済みデータを保持

これは災害支援サイトの中核運用である。寄付金管理のデプロイ、DBマイグレーション、OCR、レポート生成を、このWorkflowへ追加すべきではない。

## 7. Vercel構成

リポジトリ内に `vercel.json` は存在しない。

確認できた公開配信状態:

- `server: Vercel`
- HTMLは静的ファイルとして配信
- `x-vercel-cache` が付与
- HTTPS/HSTSあり
- 存在しないURLは既存の `404.html` を返す
- SSRを示す構成なし
- rewrites、redirects、headers、cronのリポジトリ設定なし
- build commandを示すファイルなし
- outputディレクトリ指定なし

Vercel管理画面側の非公開プロジェクト設定は、このリポジトリ調査だけでは確認できない。

### パスワードロック管理ページとの適合性

現行の静的配信だけでは安全なパスワード判定はできない。実現には次のいずれかが必要である。

- Next.js等のサーバー実行環境を新設
- Vercel Functionsを新設
- 別の認証バックエンドを使用
- Firebase Authenticationまたは独自セッションAPIを使用

現行プロジェクトをNext.js化するのは、既存の配信、拡張子付きURL、404、キャッシュ、GitHub Actions生成物に広く影響するため推奨しない。

## 8. 認証・アクセス制御

現状、以下は存在しない。

- ログイン
- 管理画面
- Basic認証
- セッション
- 認証Cookie
- Firebase Authentication
- Next.js Middleware
- ユーザー・権限モデル
- CSRF対策
- サーバー側認可

既存機能から再利用可能な認証基盤はない。

Google Analyticsは共通の `org-site.js` から対象ページへ読み込まれる。管理アプリでは、寄付者名、申請内容、支出内容、レシート情報が分析基盤へ送られないよう、原則としてGAを読み込まない方が安全である。

## 9. ファイル・画像管理

現状の画像・PDFはGit管理された公開静的ファイルである。

- OGP・ロゴ・イラスト: ルートおよび `assets/`
- 公的原資料PDF: `sources/`
- Leaflet素材: `vendor/`
- 画像アップロード機能: なし
- PDFアップロード機能: なし
- Vercel Blob: なし
- Firebase Storage: なし
- Cloud Storage: なし

レシートや活動写真を既存の公開ディレクトリへ保存してはいけない。コミットされた時点でURLを知る第三者が閲覧でき、Git履歴にも残る。

推奨方式:

- 管理用ファイルは独立Firebase Storageへ保存
- バケットはデフォルト非公開
- Firestore文書とStorageオブジェクトをIDで関連付け
- 短時間だけ有効なアクセス、または認証済みAPI経由で取得
- 元ファイルとOCR結果を分離
- MIME、拡張子、サイズ、画像デコードを検査
- EXIF位置情報を削除
- 削除・保持期間を明文化
- レシート画像URLを寄付者向け報告へ直接流用しない

## 10. デザイン・UI構成

共通設計は `design-system.css`、`org-site.css`、`org-site.js` が中心である。

### 既存の共通設計

- 色: 緑を中心とするブランドカラー
- 書体: BIZ UDPGothic、Noto Sans JP等
- スペーシング: 4pxベース
- レイアウト: article/content/wideのコンテナ
- 部品: card、button、badge、notice、hero
- フォーカス表示: 黄色4pxアウトライン
- 最小タッチ領域: 44px相当
- レスポンシブ: 主に800px以下で調整
- モーション: IntersectionObserver、`prefers-reduced-motion`対応
- Header/Footer: `org-site.js`がDOMへ共通挿入
- ページ別CSS: 各機能が独立CSSを追加読込

### 公式サイトと統一すべき部分

- ロゴと団体名
- ブランドカラー
- 基本文字組み
- アクセシビリティ
- フォーカス表示
- 平易な日本語
- 危険操作の明確な警告
- スマートフォン対応

### 管理画面として独立すべき部分

- Header/Footer構造
- Google Analytics
- データ表、検索、並び替え
- 入力フォーム
- 承認・差戻し状態
- 金額表示
- ファイルアップロード
- 監査ログ
- セッション切れ表示
- 保存中・保存済み・競合表示
- エラー復旧導線

公開サイト用 `org-site.js` を管理画面で読み込むと、ナビゲーション、GA、モーション、DOM書換えが持ち込まれる。デザイントークンだけを参考にし、管理画面専用UIを構築する方が安全である。

## 11. 既存機能への影響リスク

| リスク | 対象 | 評価 |
|---|---|---:|
| 現行リポジトリをNext.js化 | 既存配信全体 | HIGH |
| `package.json`新設・依存追加 | ビルド・Vercel自動判定 | HIGH |
| `vercel.json`追加 | URL、404、キャッシュ、ヘッダー | HIGH |
| Middleware導入 | 全ページアクセス | HIGH |
| Firebase初期化を共通JSへ追加 | 全公開ページ、障害時挙動 | HIGH |
| 共通環境変数の変更 | デプロイ全体 | HIGH |
| `org-site.js`変更 | Header/Footer/GA/全体ナビ | HIGH |
| `styles.css`・`org-site.css`変更 | 既存全ページ | HIGH |
| 既存GitHub Actionsへ寄付処理追加 | 災害情報更新の安定性 | HIGH |
| レシートを公開ディレクトリへ保存 | 個人・支出情報漏えい | HIGH |
| Firestore Rulesの誤設定 | 全寄付データ漏えい | HIGH |
| 共有パスワードだけで全操作許可 | 漏えい時の全面アクセス | HIGH |
| 同一VercelプロジェクトのFunctions追加 | デプロイ・ルート判定 | MEDIUM〜HIGH |
| `/funds`領域追加 | sitemap、robots、共通ナビ | MEDIUM |
| 共通セキュリティヘッダー追加 | 外部公式リンク、GA、地図 | MEDIUM〜HIGH |
| 寄付者向け公開報告を静的追加 | SEO、個人情報 | MEDIUM |
| 独立サブドメインの新アプリ | DNS・運用増加 | LOW〜MEDIUM |
| 独立Firebaseプロジェクト | 運用・費用管理 | LOW〜MEDIUM |
| 既存デザイントークンの参照 | UIのみ | LOW |

公開レスポンスではHSTSを確認できたが、CSP、`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy`は確認できなかった。これらを現行サイト全体へ一括追加すると、Google Analytics、Leaflet、外部資料リンク等へ影響する可能性がある。

## 12. 原則変更しない方がよい領域

### 災害情報の中核

- `data/report-data.js`
- `data/minutes-data.js`
- `data/generated/`
- `sources/official/`
- `sources/hinokuni-meetings/`
- `tools/fetch-hq.mjs`
- `tools/fetch-municipality-updates.mjs`
- `tools/fetch-official-topics.mjs`
- `tools/build-shelters.mjs`
- `tools/build-hq-damage.py`

### 生活再建機能

- `data/reconstruction/`
- `public-data/reconstruction/`
- `schemas/reconstruction/`
- `config/reconstruction-*.json`
- `reconstruction*.html`
- `reconstruction*.js`
- `reconstruction*.css`
- `scripts/monitor-reconstruction-sources.mjs`
- `scripts/build-reconstruction-*.mjs`
- `scripts/test-reconstruction-*.mjs`

### 共通公開サイト

- `index.html`
- `org-site.js`
- `org-site.css`
- `styles.css`
- `design-system.css`
- `app.js`
- `robots.txt`
- `sitemap.xml`
- `404.html`

### 運用基盤

- `.github/workflows/refresh-official-data.yml`
- `.github/workflows/validate-site.yml`

特に定期更新Workflowは、災害情報の安全な自動更新と検証を担っている。寄付金管理のCI/CDと混在させないことが重要である。

## 13. 寄付金管理機能の推奨分離構成

### 第一推奨: 別リポジトリ・別Vercelプロジェクト

```text
funds.yokatainet.jp
├─ /login
├─ /admin
│  ├─ /donors
│  ├─ /donations
│  ├─ /activities
│  ├─ /expenses
│  ├─ /receipts
│  ├─ /reimbursements
│  └─ /applicants
└─ /reports
   └─ /[reportToken]
```

アプリ内部の候補:

```text
src/
├─ app/
│  ├─ login/
│  ├─ admin/
│  ├─ reports/
│  └─ api/
├─ components/funds/
├─ lib/funds/
├─ lib/auth/
├─ lib/firebase/
├─ lib/storage/
└─ lib/audit/
```

分離対象:

- コード
- Vercelプロジェクト
- 環境変数
- Firebaseプロジェクト
- GitHub Actions
- Analytics
- エラー監視
- デプロイ権限
- 障害影響範囲

### 同一ドメインが必須の場合

`www.yokatainet.jp/funds/*` を別Vercelプロジェクトへプロキシする構成は可能性があるが、既存プロジェクトのrewrite設定やドメイン構成へ触れる必要がある。初期段階ではサブドメインの方が安全である。

## 14. Firebase導入可否

導入は可能だが、現行公開サイトに直接Firebase SDKを追加するのは推奨しない。

### Firestore

適するデータ:

- 寄付者
- 寄付
- 活動
- 支出
- 立替精算
- 申請者
- レシートメタデータ
- 報告書
- 変更履歴

留意点:

- 金額は浮動小数ではなく整数の円単位
- 寄付、支出、精算を同一レコードで表現しない
- 削除より取消・無効化を優先
- `createdAt`、`createdBy`、`updatedAt`、`updatedBy`を保持
- 集計値だけでなく元取引を保存
- 寄付者向け公開データと内部データを別コレクションにする
- OCR結果は確定データと分け、人の確認を必須にする

### Firebase Storage

レシート・活動写真の保存先として適合する。ただし、ダウンロードURLを永続公開する設計は避けるべきである。

### Firebase Authentication

Firebase Authの匿名認証を「共有パスワードの代替」とするのは不十分である。サーバー側でパスワードを検証した後に、短時間のセッションCookieまたはカスタムトークンを発行する構成が考えられる。

独自認証を採用する場合でも、Firestore/Storage Rulesは認証済み状態と権限を検証する必要がある。

## 15. パスワードロック実装の適合性

要件には適用可能だが、現行の静的サイト内だけでは実装できない。

推奨フロー:

```text
/login
  ↓ HTTPS POST
サーバー側で共有パスワードを照合
  ↓ 成功
署名済み・短寿命のHttpOnly Cookieを発行
  ↓
管理ページと全APIで毎回セッション検証
```

必要条件:

- パスワードはVercelのサーバー側環境変数に保存
- ハッシュ化して照合
- Cookieは `HttpOnly`、`Secure`、`SameSite=Lax`または`Strict`
- セッション有効期限を設定
- ログアウトで失効
- ログイン試行回数制限
- 失敗ログを保存
- パスワード変更時に全セッション失効
- 重要操作は再確認
- API側でも必ず認可
- URLを知っているだけではアクセス不可

共有パスワードは「誰が操作したか」を識別できない。申請者管理や立替精算で操作履歴が必要なら、利用者に難しいログインを要求せず、パスワード通過後に「担当者名を選択する」方式を追加する余地がある。ただし選択名は認証そのものではない。

## 16. セキュリティ上の注意点

- パスワードをHTML、JavaScript、Firebase Remote Configへ置かない
- 管理HTMLを返す前、または少なくとも全データAPIでサーバー認可する
- `robots.txt`や`noindex`は認証の代わりにならない
- 管理画面は `noindex,nofollow` と `X-Robots-Tag` の両方を検討
- URLの複雑化だけに依存しない
- すべての書込みAPIでCSRF対策
- `Origin`/`Referer`検証も併用
- Cookie認証APIへCORS `*`を設定しない
- ファイル名を信用せず、MIMEと実データを検査
- SVG、HTML、実行可能ファイルは拒否
- ファイルサイズ・画素数・件数を制限
- OCR/AIへ送る前に個人情報と利用規約を確認
- AI出力を自動確定しない
- レシート金額、日付、店舗、税区分は人が確認
- Storage Rulesでパス単位のアクセス制御
- Firestore Rulesでクライアントの自己申告権限を信用しない
- Firebase Admin SDKはサーバー側限定
- 寄付者向け報告には内部メモ、レシート、申請者情報を含めない
- 公開レポートは推測困難で失効可能なトークンを使用
- バックアップ、復旧手順、保存期間、削除方針を決める
- 金額変更、削除、承認、ファイル閲覧を監査ログへ記録
- 個人情報をGA、ログ、エラー追跡へ送らない
- 開発・検証・本番のFirebase環境を分離
- App Checkは補助策として利用し、認証・認可の代用にしない

## 17. 次の実装フェーズへの提案

### Phase 1: 境界と最小データモデル

- 新規アプリを別リポジトリ・別Vercelプロジェクトで作る方針を確定
- 寄付者、寄付、活動、支出の4データだけを定義
- 共有パスワード認証とセッションを先に検証
- Firestore/Storage Rulesをテスト
- 監査ログの基本仕様を決める
- 実データを使わず検証

### Phase 2: 基本管理機能

- 寄付者登録
- 寄付登録
- 活動記録
- 支出登録
- レシート画像の安全なアップロード
- 閲覧・修正・取消
- CSVエクスポート
- バックアップ・復旧確認

### Phase 3: 高度機能

- OCR・AI解析
- 人による確認・確定フロー
- 立替精算
- 申請者管理
- 寄付者向け使途報告
- 公開範囲・承認・失効管理
- 運用監査とセキュリティレビュー

次に実装すべき最小単位は、既存サイトとは別の検証用アプリで行う「共有パスワード認証＋空の管理画面＋Firestore/Storage Rulesのエミュレータテスト」である。寄付・支出・レシート機能へ進む前に、アクセス境界が成立することを確認すべきである。

## 最終確認

分析時にはコード変更・設定変更・依存追加・外部サービス変更を行っていない。本ファイルは、利用者からの明示的なファイル出力依頼に基づき、既存分析結果をMarkdown文書として保存したものである。
