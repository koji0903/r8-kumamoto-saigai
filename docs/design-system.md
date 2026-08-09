# 一般社団法人よか隊ネット熊本 Design System

Status: Standard / Source of truth  
Updated: 2026-08-10  
Code: [`design-system.css`](../design-system.css)

この文書は今回のリニューアルだけでなく、今後の新規ページ、災害支援コンテンツ、活動報告、団体情報、問い合わせ、特設ページに適用する標準デザイン仕様である。判断に迷った場合は、利用者の理解と情報到達性を装飾より優先する。

## 1. Brand Philosophy

> 人と人をつなぎ、暮らしを支え、地域へつなげていく。

視覚言語の意味は次のとおり固定する。

| Primitive | 意味 | 主な用途 |
|---|---|---|
| 点 | 人、情報、地域の拠点 | 状態、起点、タイムライン |
| 線 | つながり | 人と情報、支援と暮らしの関係 |
| 円 | 暮らし、コミュニティ、安心 | 小さな焦点や状態。概念図の乱用は禁止 |
| 面 | 地域、生活圏、支援領域 | 背景の区切り、情報領域 |
| 波・曲線 | 変化、復旧、時間、地域の流れ | セクション間、沿革、回復の流れ |

「点→線→つながり→地域」は共通言語だが、単語を円に入れて線で結ぶだけのPowerPoint的概念図にはしない。必ず情報の関係性または操作の理解を助ける。

## 2. Design Principles

1. **Clarity before Decoration** — 装飾より情報の分かりやすさ。
2. **Calm before Excitement** — 派手さより安心感と信頼感。
3. **Human without Artificial People** — AI生成人物を使わず、言葉、実際の活動記録、余白、関係性から人の存在を感じさせる。
4. **Connection as Visual Language** — 点、線、面を一貫した意味で使う。
5. **Motion with Meaning** — 動きは情報の順序、関係、時間を理解させる場合だけ使う。
6. **Accessibility by Default** — アクセシビリティを初期条件にする。
7. **Support First** — 災害・生活再建情報ではブランド表現より情報到達性を優先する。

判断順は「分かりやすさ→到達速度→アクセシビリティ→Design Systemとの一致→上質さ→装飾美」とする。

## 3. Color

色は [`design-system.css`](../design-system.css) のDesign Tokenだけを基本に使う。新色が必要な場合は、既存Tokenまたはvariantで表現できない理由を確認してからTokenと本書を同時更新する。

- Brand: `--color-brand-primary`, `--color-brand-primary-dark`, `--color-brand-secondary`
- Supporting: `--color-mint`, `--color-aqua`, `--color-beige`
- Surface: `--color-background`, `--color-background-subtle`, `--color-surface`
- Text: `--color-text`, `--color-text-muted`
- Semantic: `--color-support`, `--color-warning`, `--color-emergency`, `--color-focus`
- Structure: `--color-border`

警告色は意味のある警告、緊急色は災害・優先CTAに限定する。本文文字へ淡色を使わない。

## 4. Typography

| Role | Token | 用途 |
|---|---|---|
| Display | `--text-display` | TOPの主見出しのみ |
| H1 | `--text-h1` | 下層ページタイトル |
| H2 | `--text-h2` | セクション見出し |
| H3 | `--text-h3` | カード・小見出し |
| H4 | `--text-h4` | 本文内見出し |
| Body Large | `--text-body-lg` | 導入文 |
| Body | `--text-body` | 標準本文。16px未満にしない |
| Body Small | `--text-body-sm` | 補足本文 |
| Label | `--text-label` | Eyebrow、分類 |
| Caption | `--text-caption` | 出典、図注 |

本文は `--leading-body`、見出しは `--leading-heading` を基準にする。長文本文は原則650〜760px幅。文字サイズだけでなくweight、line-height、letter-spacingをrole単位で揃える。

## 5. Spacing

4px基準の `--space-1 / 2 / 3 / 4 / 6 / 8 / 12 / 16 / 24` を使う。

- Section: `--space-section`
- Container gutter: `--gutter`
- Card padding: Desktop `--space-6`、Mobile `--space-4`
- Heading to description: `--space-3`
- Section header to content: `--space-8`

新しい任意値を作る前に近いTokenを選ぶ。

## 6. Layout

- Article: `--container-article`（760px）
- Content: `--container-content`（1180px）
- Wide: `--container-wide`（1240px）
- Utility: `.ds-container` と `data-size="article|wide"`

ページ内で独自の1180/1200/1240pxを増やさない。複雑なDesktop横組みはMobileで縦組みに変える。

## 7. Shape and Shadow

- Radius small: 操作要素
- Radius medium: 標準Card
- Radius large: Heroや大きな面
- Pill: badge/statusのみ

すべてを極端な丸角カードにしない。階層はborder、background、spacingを第一にし、shadowは `--shadow-subtle` または限定的な `--shadow-offset` だけを使う。Glassmorphism、強い発光、過剰な浮遊表現は禁止。

## 8. Iconography

- outline SVG
- stroke 1.5〜2px、標準1.8px
- rounded line cap / line join
- `currentColor` とブランド・semantic Tokenを使う
- 基本classは `.ds-icon`
- 画像だけで意味を伝えず、可視ラベルまたはaccessible nameを付ける

複数の外部アイコンセットを混在させない。

## 9. Abstract Graphic System

コードPrimitive：

- `.graphic-dot`
- `.graphic-dot-grid`
- `.graphic-line`
- `.graphic-curve`
- `.graphic-circle`
- `.graphic-field`
- `.graphic-wave`
- `.graphic-network[data-variant="support|community|history|recovery"]`

ページ固有blobを増やさず、この語彙を組み合わせる。緊急・支援ページではGraphic量を減らす。円は小さな焦点や安心の表現に限定し、4円概念図、Venn図、組織図の代用にしない。

## 10. Photography / Illustration Policy

- AI生成人物画像、AI生成地域風景、AI生成被災地イメージは使用しない。
- 実際の活動写真は権利、同意、品質、文脈が確認できる場合のみ使用する。
- 悲惨さより活動、対話、地域、つながりを優先する。
- 写真にはwidth/height、alt、統一したaspect-ratio、object-fitを設定しCLSを防ぐ。
- 抽象表現で十分な場所へdecorative stock illustrationを置かない。

TOP Heroは2026-08-10に、生成された人物・地域風景から、人物を描かないGraphic Primitive構成へ移行した。旧生成画像は公開ページで使用せず、新規流用・派生生成も禁止する。

## 11. Components

共通Componentは `.ds-*`、既存サイト共通Componentは `org-site.css` / `org-site.js` で管理する。

- Layout: `.ds-container`, `.ds-section`, `.ds-section-header`
- Typography: `.ds-display`, `.ds-heading-*`, `.ds-body*`, `.ds-caption`
- Button: `.ds-button` + `secondary|emergency`
- Card: `.ds-card` + `support|history|article`
- Badge: `.ds-badge`
- Notice: `.ds-notice` + `warning|emergency`
- PageHero: `.ds-page-hero` + `brand|content|support`
- Breadcrumb: `.ds-breadcrumb` / 現行 `.site-breadcrumb`
- Icon: `.ds-icon`
- CTA, Timeline, Accordion, SupportCard, ArticleCardは既存共通classを優先し、新規実装時は同一DOM・variantへ寄せる。

Sectionの基本順はEyebrow→Heading→Description→Content→CTA。毎回全部を置かず、共通ルールの範囲で左右配置やGraphic量を変える。

### 新パターンの判断順

1. 既存Componentで表現可能か
2. 既存Componentのvariantで対応可能か
3. 新しい共通Componentが必要か
4. 最後にページ固有実装

## 12. Motion

Token：`--motion-fast`, `--motion-base`, `--motion-slow`, `--motion-distance-sm`, `--motion-distance-md`, `--ease-standard`, `--ease-out`, `--ease-emphasized`。

Primitive：

- `.motion-reveal`
- `.motion-stagger`（最大5段、90ms間隔）
- `.motion-line-draw`
- `.motion-dot-reveal`
- 現行の `.site-reveal` / `.motion-item` は同じTokenを参照する互換実装

Motion level：

- `none`: 重要災害情報、表、金額、期限、電話番号、相談先
- `subtle`: 生活再建、支援制度、相談ページ
- `standard`: 通常コンテンツ、活動紹介、問い合わせ
- `story`: TOP、ABOUT、HISTORY、理念

禁止：scroll jack、過剰parallax、3D回転、bounce、大きなzoom、常時pulse、過剰floating、文字単位animation、loading screen、JS依存のcontent visibility。`data-priority="critical"` は待ち時間を強制的に無効化する。

## 13. Responsive

基準：320 / 375 / 390 / 768 / 1024 / 1280 / 1440px。主Breakpointは800px、補助として480px・1050pxを使用できる。

MobileではDesktopを縮小せず、情報量、余白、Graphic量、motion量を減らす。CTAは44px以上、横構図は縦構図へ、横スライドmotionはfade-upへ切り替える。hoverだけに情報を置かない。

## 14. Accessibility

- WCAGを意識したcontrast。本文・重要ラベルは原則4.5:1以上
- `:focus-visible` を全操作要素に提供
- Keyboard、Escape、semantic HTML、見出し階層、landmarkを保証
- SVGだけの操作にはaccessible name、意味のない装飾は`aria-hidden`
- 画像にwidth/heightと適切なalt
- Touch targetは `--touch-target-min`（44px）以上
- `prefers-reduced-motion` でreveal、line、float、smooth scrollを停止
- JS無効・失敗でも本文、リンク、支援情報、相談先、CTA、navigationを表示

## 15. Emergency / Support UX

> デザインより情報。アニメーションより速度。ブランド表現より相談先。

電話番号、受付時間、期限、金額、必要書類、相談先、公式情報は抽象Graphicより必ず高い優先順位にする。重要情報はAccordionへ閉じない。制度名より「困りごと」から始め、「自分の場合→制度→必要なもの→相談先→公式情報」の順を基本にする。

## 16. Do / Don't

### DO

- 大胆だが目的のある余白
- 強いTypography階層
- 細いline、控えめなdot、非対称構図
- 意味のあるGraphic Primitive
- outline icon
- subtle motion
- 情報優先
- MobileでGraphicを簡略化

### DON'T

- AI生成人物・AI生成地域風景
- 意味のないblob大量配置
- PowerPoint的な円図
- 3D sphere、glassmorphism、neon gradient
- excessive shadow、何でもrounded card
- 大量のfloating object
- SaaS dashboard風、Web3風
- 過剰animation、decorative stock illustration
- 「巨大Hero＋gradient blob＋丸角カード3枚＋大量icon＋fade」だけのテンプレート化

## Governance

- 新しいColor、Component、Graphic、Motion、Layoutを追加したら、コードと本書を同じ変更で更新する。
- 全公開HTMLは `design-system.css`、`org-site.css`、`org-site.js` を読み込む。検査は `tools/check-data.mjs` が強制する。
- ページ準拠状況は [`site-ui-audit.md`](site-ui-audit.md) で管理する。
- 一度に全ページを書き換えず、共通Layout→Header/Footer→Typography→Color→Button/Link→Card→Motion→Graphic→個別ページの順に統合する。
