# 暮らしの再建 金額・支援種別品質ステータス

> 自動生成ファイルです。金額の自動計算・給付額診断には使用しません。

## ACTION_REQUIRED
- なし

## WARNING
- amount_r8_repair_half_or_more_maximum: 金額未確認（公開しない）
- amount_r8_repair_half_or_more_maximum: 上限のみ確認
- amount_r8_repair_partial_half_maximum: 金額未確認（公開しない）
- amount_r8_repair_partial_half_maximum: 上限のみ確認

## 金額・支援方式

| 制度 | 自治体 | 支援種別 | 金額 | 金額種別 | 単位 | verification | source | lastCheckedAt | conflict | warning |
|---|---|---|---|---|---|---|---|---|---|---|
| 壊れた家の必要な部分を修理する支援 | 広域 | 実施主体から業者等への直接支払い | 757,000円 | maximum | 1世帯あたり | partially_verified | 令和8年熊本地震 被災した住宅の応急修理制度について（被災者の皆さまへ） | 2026-08-09T18:03:00+09:00 | なし | 上限額 |
| 壊れた家の必要な部分を修理する支援 | 広域 | 実施主体から業者等への直接支払い | 367,000円 | maximum | 1世帯あたり | partially_verified | 令和8年熊本地震 被災した住宅の応急修理制度について（被災者の皆さまへ） | 2026-08-09T18:03:00+09:00 | なし | 上限額 |

## 公開ルール

- 支援内容、支援方式、条件、自治体、公式根拠を金額と一緒に扱います。
- verified・published・fresh・confirmed・人手確認済みamount sourceが揃わない金額は公開しません。
- nullは0円に変換しません。上限額を実支給額として表示しません。
- 国・自治体・民間支援を合算せず、金額順に並べません。
