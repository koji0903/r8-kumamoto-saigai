# サイト全体 UI / UX 監査（2026-08-10）

## 共通構造

- 公開ページは20ページ。静的HTMLを共通の `org-site.css` / `org-site.js` で補強する構成。
- Header / Footer はJavaScriptで共通描画。支援系ページの個別データ描画は既存のページ別JavaScriptを維持する。
- 課題は、実画面のパンくず未整備、ページ種別ごとのモーション強度未定義、団体ページのJS無効時ナビ不足、404・アクセシビリティ方針ページの不足。
- 制度条件、金額、期限、電話番号、公式URL、データモデル、判定ロジックは今回の変更対象外。

## ページ分類・改善方針

| route | page type | current issue | proposed visual / UX change | motion | risk | priority |
|---|---|---|---|---|---|---|
| `/` | Top | トップだけ独自の動き | 共通tokenへ統合、物語型モーションを維持 | story | Medium | High |
| `/disaster.html` | 緊急・支援 | 情報量が多い | 現在地・優先導線を明確化 | subtle | Critical | High |
| `/affected.html` | 緊急・支援 | 分岐後の現在地が弱い | 利用者目線の入口とパンくず | subtle | High | High |
| `/guide.html` | 緊急・支援 | 制度カードが密集 | 共通支援カードと目次 | subtle | High | High |
| `/reconstruction.html` | 緊急・支援 | 動的UIを壊せない | 既存ロジック維持、共通現在地・focus | subtle | Critical | High |
| `/shelters.html` | 緊急・支援 | 地図・一覧優先 | 装飾を抑え、即時表示 | none | Critical | High |
| `/municipalities.html` | 緊急・支援 | 自治体カードが多い | 行単位表示、余白維持 | subtle | High | High |
| `/municipality-updates.html` | 情報一覧 | 大量の記事カード | 本文即表示、一覧は短いfadeのみ | none | High | High |
| `/official.html` | 情報一覧 | 一次情報の判別 | 出典カードの共通化 | subtle | High | High |
| `/support.html` | 緊急・支援 | 支援分類の理解 | 意味アイコンとパンくず | subtle | High | Medium |
| `/supporters.html` | 参加・協力 | 行動導線が複数 | 参加カードvariantとCTA | standard | Medium | High |
| `/volunteer-centers.html` | 参加・協力 | 自治体情報の一覧 | 募集状態を優先し装飾を抑制 | subtle | High | High |
| `/uto-waste.html` | 自治体個別支援 | 宇土市個別情報 | 自治体階層をパンくずで明示 | none | Critical | High |
| `/timeline.html` | 記事・記録 | 長い一覧 | 本文は動かさず導入だけ表示 | none | High | High |
| `/meetings.html` | 記事・記録 | 長文議事録 | 本文即表示、目次・focus維持 | none | High | High |
| `/terms.html` | 情報コンテンツ | 用語カードが多い | 検索を優先、短い行単位fade | subtle | Medium | Medium |
| `/about.html` | 団体理解 | 共通物語表現が不足 | timeline・価値カードをstory化 | story | Low | High |
| `/join.html` | 参加・協力 | 自分にできることの比較 | 関わり方カードを順次表示 | standard | Low | High |
| `/contact.html` | 参加・協力 | 相談内容の選択肢が弱い | 相談カテゴリー案内と連絡方法 | standard | Low | High |
| `/privacy.html` | 法務・本文 | 共通現在地が弱い | 狭い本文幅・パンくず | none | Low | Medium |
| `/404.html` | Error | 未整備 | ブランド統一、主要3導線 | none | Low | High |
| `/accessibility.html` | 方針 | 未整備 | 配慮内容・連絡先を明文化 | none | Low | Medium |

## 実装原則

1. 共通design token、card、button、focus、image、motion presetをCSSへ集約する。
2. Header / Footer / breadcrumbは共通スクリプトで一元化する。
3. JSが成功したときだけ `data-motion="enabled"` を付与し、JS無効・失敗時は常時表示する。
4. 支援データのDOM、ページ別JavaScript、URL、電話番号、外部リンクは変更しない。
5. 320 / 375 / 390 / 768 / 1024 / 1280 / 1440px、JS無効、reduced motionを回帰確認する。
