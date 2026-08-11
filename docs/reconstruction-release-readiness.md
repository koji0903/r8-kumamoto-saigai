# 「暮らしの再建」総合リリース判定

判定日: 2026-08-12

## 最終判定

**READY_WITH_KNOWN_LIMITATIONS**

| 層 | 判定 | 理由 |
|---|---|---|
| SERVICE_RELEASE | READY | 困りごと選択、整理ナビ、8カテゴリ、戻り導線、支援者表示、印刷、noscriptが成立 |
| OFFICIAL_NAV_RELEASE | READY | 21市町村、公式ドメイン、今回災害、重複排除、過去災害除外、0件fallbackを検証済み |
| VERIFIED_PROGRAM_RELEASE | HOLD | 本番公開制度は0件。住宅応急修理等はReviewer・Secondary Reviewer・Approverの人手確認完了までカード公開しない |

制度カードが0件でも、困りごとから自治体・県・国等の公式情報へ進むサービスとして公開できる。HOLDは厳密制度カードだけに適用し、サービスと公式ナビを止めない。

## リリース対象

- READY: 暮らしの再建トップ、暮らし整理ナビ、8カテゴリ入口、自治体選択、municipality parameter、自治体公式ナビ、関連カテゴリ、支援者表示、印刷、JavaScript無効時fallback、sitePhase、GitHub Actions。
- CONDITIONAL: 宇土市住まい専門ページ（`home`かつ宇土市選択時のみ表示）。公式ページ取得失敗時は静的fallbackを必須とする。
- HOLD: 金額、対象条件、期限、必要書類、窓口等を含む未承認制度カード。
- NOT_APPLICABLE: 本サイトによる対象判定、申請受付、相談受付、ケース管理。

## 監査結果

- 8カテゴリ名、入口、公式情報、fallback、関連カテゴリ、整理ナビへの戻りを確認。
- 21市町村すべてにID、名称、公式URL、municipality parameterを保持。
- 宇土市専用ページは公式ナビの `home` + `municipality_uto` だけで表示。お金ページに残っていた宇土市直リンクを修正。
- 自治体公式カードは公式ドメインだけ。非公式URLと過去災害専用ページは表示対象外。
- draft / pending / partially_verified / needs_reviewを制度カードへ出さない。本番 `money.json` の制度は0件。
- fixtureはテスト時の一時ディレクトリだけで生成し、公開データに混入しない。
- 0件時は制度不存在と断定せず、自治体公式トップへfallback。
- 選択内容、氏名、住所、健康・家庭・所得・借金・事業情報をStorage、Cookie、Analyticsへ送らない。
- データ取得失敗時は白画面にせず、静的な自治体一覧へのリンクを表示。
- SEO、canonical、OGPは行政公式サービスを名乗らない。
- sitePhaseは表示優先度だけを変え、データを削除しない。

## 優先度

- P0: お金ページから宇土市専門ページが他自治体にも表示される経路を修正。未解決P0なし。
- P1: 未解決なし。
- P2: 初回404候補、low confidence、未分類を公開後監視。公式カード自体は検証条件を満たすものだけ表示。
- P3: 実利用者テストはサイト所有者からOKの結果報告を受領。対象者別の観察記録と端末・回線別の継続改善は引き続き記録する。

## 公開直後チェックリスト

- [ ] トップから暮らしの再建へ進める
- [ ] 8カテゴリと暮らし整理ナビを開ける
- [ ] 宇土市homeだけに専門ページが出る
- [ ] 熊本市・水俣市等で宇土市情報が出ない
- [ ] 0件カテゴリで自治体公式トップへ進める
- [ ] 320 / 375 / 390 / 430 / 768 / 1024 / 1440pxで表示する
- [ ] JavaScript有効・無効・取得失敗時のfallbackを確認する
- [ ] Vercelのdeployment commitとmainのSHAが一致する
- [ ] GitHub Actionsが成功する

## 24時間以内

- 3時間更新の成功、収集・分類件数、未分類、low confidence、初回・連続404、redirectを確認。
- 公式ナビと避難所等の鮮度、Vercel配信、主要ページ404を確認。
- 厳密制度source変更が `needs_review` / `ACTION_REQUIRED` になることを確認。

## rollback

重大な誤表示、非公式URL、他自治体情報、未承認制度、個人情報送信、主要導線消失があれば直前正常commitを `git revert` してmainへpushする。ActionsとVercelの反映SHAを確認し、原因修正後に全validationを再実行する。force pushは行わない。

## 既知の制約

2026年8月12日、サイト所有者から実利用者テストOKの結果報告を受領した。重大な問題の追加報告はない。一方、A-01/B-01/C-01別の発言、端末、所要時間、操作観察は未提供のため、対象者別の達成率や「すべての高齢者に使える」等の一般化は行わない。Vercel管理画面の設定値自体はリポジトリ外のため、公開直後にdeployment SHAを人が照合する。
