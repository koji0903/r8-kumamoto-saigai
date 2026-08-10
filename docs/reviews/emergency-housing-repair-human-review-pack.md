# 被災住宅の応急修理 人手レビュー用チェックパック

## この文書の位置づけ

- 対象制度：災害救助法に基づく被災住宅の応急修理
- 一般向け表示名：壊れた家の必要な部分を修理する支援
- 対象災害：令和8年熊本地震
- 現在の状態：`HUMAN_REVIEW_INCOMPLETE` / 未承認 / 未公開
- 作成日：2026年8月10日
- 対象データ：`program_emergency_housing_repair` / `application_r8_kumamoto_emergency_repair`

このパックは、Reviewer、Secondary Reviewer、Approverが一次資料と登録値を照合するための作業用文書です。この文書の作成はレビュー、承認、`verified` 化、公開を意味しません。チェック欄と氏名・日時は、実際に原文を確認した人だけが記入してください。

## レビューの進め方

1. 「一次資料一覧」から公式資料を開く。
2. 「高リスク項目レビュー表」で登録値と根拠箇所を照合する。
3. Reviewerが各項目の一次確認欄と氏名・日時を記入する。
4. 高リスク項目を別の操作・時刻で再確認し、Secondary Reviewer欄を記入する。
5. 差異があれば、[修正対象一覧](./emergency-housing-repair-corrections.md)へ記録する。
6. ApproverがsourceLink、未確認事項、文案、validationを確認して判定する。

---

# 1. 一次資料一覧

過去災害の資料は含めていません。すべて令和8年熊本地震または災害救助法の現行制度説明として登録されている公的一次情報です。

## 国

| Source ID | 発表主体 | 資料名・URL | 発表日 | 根拠として登録している内容 |
|---|---|---|---|---|
| `source_cabinet_notifications_r8_kumamoto_earthquake` | 内閣府 | [内閣府防災担当からの各都道府県等への通知等](https://www.bousai.go.jp/updates/r8kumamoto_jishin/tsuuchi.html) | 一覧の最新掲載日 2026-08-07 | 令和8年熊本地震に関する国の通知6件への公式入口。2026-08-03付「被災者の住まいの確保に向けた留意事項について」を含む。金額・対象条件等は一覧だけで確定しない |
| `source_cabinet_relief_act_application_r8_earthquake` | 内閣府 | [令和8年熊本地震に係る災害救助法の適用について](https://www.bousai.go.jp/pdf/260728.pdf) | 2026-07-28 | 宇土市を含む21市町村、法適用日2026-07-28 |
| `source_cabinet_disaster_relief_act_overview` | 内閣府 | [災害救助法の概要](https://www.bousai.go.jp/taisaku/hisaisyagyousei/pdf/saigaikyujo_gaiyou.pdf) | 資料上の記載なし | 災害救助法による救助の種類に住宅の応急修理が含まれること |

## 熊本県

| Source ID | 発表主体 | 資料名・URL | 発表日等 | 根拠として登録している内容 |
|---|---|---|---|---|
| `source_kumamoto_relief_act_application_r8_earthquake` | 熊本県 | [令和8年熊本地震に係る災害救助法の適用について](https://www.pref.kumamoto.jp/soshiki/27/274494.html) | 2026-07-28 | 宇土市を含む21市町村への法適用 |
| `source_kumamoto_emergency_housing_repair_page` | 熊本県 | [【令和8年熊本地震】被災した住宅の応急修理について](https://www.pref.kumamoto.jp/soshiki/27/275109.html) | 2026-08-02 | 県実施20市町村での制度開始、市町村別窓口状況、県問い合わせ先 |
| `source_kumamoto_emergency_housing_repair_user_guide` | 熊本県 | [被災した住宅の応急修理制度について（被災者の皆さまへ）](https://www.pref.kumamoto.jp/uploaded/attachment/316365.pdf) | 資料上の記載なし | 対象条件、対象修理、金額、申込先、必要書類、支払前警告、写真、県問い合わせ先 |
| `source_kumamoto_emergency_housing_repair_guideline` | 熊本県 | [被災した住宅の応急修理実施要領](https://www.pref.kumamoto.jp/uploaded/attachment/315819.pdf) | 2026-07-28適用、2026-07-31施行 | 県実施20市町村、条件、全壊例外、借家、応急仮設住宅との関係、手続き・様式 |

## 宇土市

| Source ID | 発表主体 | 資料名・URL | 発表日 | 根拠として登録している内容 |
|---|---|---|---|---|
| `source_uto_support_application_index_r8_earthquake` | 宇土市 | [支援・申請](https://www.city.uto.lg.jp/article/list/1307.html) | 一括更新日の記載なし | 2026-08-07付の応急修理個別案内、すまいの相談窓口への入口 |
| `source_uto_emergency_housing_repair_page_r8_earthquake` | 宇土市 | [災害救助法に基づく被災住宅の応急修理制度について](https://www.city.uto.lg.jp/article/view/1243/16523.html) | 2026-08-07 | 対象、修理範囲、限度額、完了期限候補、注意事項、申請者・事業者様式 |
| `source_uto_housing_consultation_desk_r8_earthquake` | 宇土市 | [「すまいの相談窓口」の開設について](https://www.city.uto.lg.jp/article/view/1307/16522.html) | 2026-08-07 | 相談・申請受付の総合窓口、場所、時間、担当、電話番号候補 |

---

# 2. 高リスク項目レビュー表

## 共通記入欄

- Reviewer：____________________________
- Reviewed At：_________________________
- Secondary Reviewer：__________________
- Secondary Reviewed At：_______________
- 同一人物による再確認：□ 該当する　□ 該当しない
- 同一人物の場合、一次確認と別の操作・時刻で実施：□ はい

各行の「確認欄」は次の記号を記入してください。

- Reviewer：□ 原文確認済み　□ 登録値と一致　□ 要修正　□ 未確認
- Secondary：□ 二次確認済み　□ 一次確認と一致　□ 要再確認
- Approver：□ 承認範囲に含める　□ pendingとして分離　□ 再修正が必要

| # | 高リスク項目 | 登録値 | 根拠source / 根拠箇所 | 現在のverificationStatus | Reviewer確認 | Secondary Review | Approver確認 |
|---:|---|---|---|---|---|---|---|
| 1 | 対象地域 | 県実施20市町村。宇土市を含む。熊本市は救助実施市として別実施 | 県実施要領 p.5「別表 市町村名」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 2 | 対象住宅 | 日常生活に必要な部分が被災し、現状では住めず、修理後に居住可能と見込まれる住宅 | 県被災者向け案内 p.1「対象者」「対象となる修理箇所」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 3 | 被害条件 | 全壊（修理により居住可能となる場合）、大規模半壊、中規模半壊、半壊、準半壊 | 県被災者向け案内 p.1「対象者」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 4 | 対象者条件 | 資力、現状では住めないこと、修理後に住める見込みの3要件 | 県被災者向け案内 p.1「対象者」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 5 | 全壊例外 | 全壊は原則対象外だが、修理により居住可能となる場合は対象となり得る | 県被災者向け案内 p.1、県実施要領の対象者規定 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 6 | 757,000円 | 1世帯、全壊・大規模半壊・中規模半壊・半壊、税込75万7千円以内 | 県被災者向け案内 p.1「限度額」／宇土市「応急修理の限度額」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 7 | 367,000円 | 1世帯、準半壊、税込36万7千円以内 | 同上 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 8 | 必要書類 | 県案内7点。宇土市独自書類は未登録・要確認 | 県被災者向け案内 p.2「提出する書類」／宇土市「申請者・事業者様式」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 9 | 支払前警告 | 修理業者へ代金を支払うと制度を利用できないため、支払前に市町村へ相談 | 県被災者向け案内 p.2「注意」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 10 | 写真の扱い | 修理前の被害状況写真を必要書類として登録。工事前撮影。代替扱いは未確認 | 県被災者向け案内 p.2「提出する書類・注意」／県実施要領／宇土市「注意事項」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 11 | 借家 | 例外的取扱いの可能性あり。対象とは断定していない | 県被災者向け案内・県実施要領の借家記載 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 12 | 応急仮設住宅との関係 | 公開表示未登録。併用等の条件を省略・断定しない | 県実施要領 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 13 | 申込期限 | `null`。宇土市の申込期限は未確認 | 県制度ページ「市町村の受付窓口」／宇土市個別案内 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 14 | 工事完了期限 | `null`。宇土市ページに2026-10-27と「延長される見込み」が併記された候補差分あり | 宇土市「応急修理の完了期限」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 15 | 宇土市申請窓口 | `null`。市役所1階市民交流スペース等は候補値で、制度専用roleを要確認 | 宇土市「すまいの相談窓口」受付場所・問い合わせ先 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 16 | 熊本県問い合わせ先 | 熊本県健康福祉政策課すまい対策チーム、096-333-2185 | 県被災者向け案内 p.2「問い合わせ先」 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 17 | 宇土市電話番号 | `null`。0964-22-1111は候補値。代表番号か制度窓口か要確認 | 宇土市「すまいの相談窓口」問い合わせ先 | `partially_verified` | □原文 □一致 □要修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |

### 必要書類7点の個別確認

| 登録書類 | scope | 根拠 | Reviewer | Secondary | Approver |
|---|---|---|---|---|---|
| 応急修理申込書 | 熊本県今回案内 | 県案内 p.2 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 住宅の被害状況に関する申出書 | 熊本県今回案内 | 県案内 p.2 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| り災証明書 | 熊本県今回案内 | 県案内 p.2 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 修理前の被害状況が分かる写真 | 熊本県今回案内 | 県案内 p.2 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 修理見積書 | 熊本県今回案内 | 県案内 p.2 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 資力に関する申出書 | 熊本県今回案内 | 県案内 p.2 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 応急修理申込時のチェックリスト | 熊本県今回案内 | 県案内 p.2 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |

---

# 3. sourceLink原文照合インデックス

`verifiedBy` / `verifiedAt` は全件 `null` です。下表の「登録値・claim」は人手確認前の値です。

## 国・県の制度、条件、金額、窓口

| sourceLink ID | source title / URL | PDF page・Web section | claimType | 現在登録されている値 | 人手確認 |
|---|---|---|---|---|---|
| `source_link_disaster_official_notifications_cabinet` | [内閣府・通知一覧](https://www.bousai.go.jp/updates/r8kumamoto_jishin/tsuuchi.html) | Web「内閣府防災担当からの各都道府県等への通知等」 | `other` | 通知6件への公式入口。2026-08-03付の住まい確保に関する通知を含む。一覧単独では制度条件・金額の根拠にしない | □原文 □一致 □修正 □未確認 |
| `source_link_disaster_relief_act_areas_cabinet` | [内閣府・法適用通知](https://www.bousai.go.jp/pdf/260728.pdf) | p.1／適用市町村表 | `disaster_application` | 21市町村、2026-07-28 | □原文 □一致 □修正 □未確認 |
| `source_link_disaster_relief_act_areas` | [熊本県・法適用](https://www.pref.kumamoto.jp/soshiki/27/274494.html) | Web「1 災害救助法の適用」 | `disaster_application` | 21市町村、2026-07-28 | □原文 □一致 □修正 □未確認 |
| `source_link_program_repair_general` | [内閣府・災害救助法の概要](https://www.bousai.go.jp/taisaku/hisaisyagyousei/pdf/saigaikyujo_gaiyou.pdf) | p.1「救助の種類」 | `general_description` | 救助の種類に住宅の応急修理 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_implemented` | [熊本県・制度ページ](https://www.pref.kumamoto.jp/soshiki/27/275109.html) | Web「被災した住宅の応急修理について」 | `disaster_application` | 今回災害で制度開始 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_areas` | [熊本県・実施要領](https://www.pref.kumamoto.jp/uploaded/attachment/315819.pdf) | p.5「別表 市町村名」 | `eligible_area` | 県実施20市町村、宇土市を含む | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_eligibility` | [熊本県・被災者向け案内](https://www.pref.kumamoto.jp/uploaded/attachment/316365.pdf) | p.1「対象者」 | `eligibility` | 資力・居住困難・修理後居住の3要件 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_damage` | 同上 | p.1「対象者」 | `eligible_damage` | 大規模半壊～準半壊、全壊例外 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_scope` | 同上 | p.1「対象となる修理箇所」 | `benefit` | 日常生活に必要な最小限度の修理 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_amount` | 同上 | p.1「限度額」 | `amount` | 757,000円／367,000円、税込 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_office` | 同上 | p.2「申込先」 | `application_office` | 被災市町村窓口へ申込 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_uto_pending` | [熊本県・制度ページ](https://www.pref.kumamoto.jp/soshiki/27/275109.html) | Web「市町村窓口一覧」宇土市行 | `other` | 担当課・開始日・連絡先・HPは確認中 | □原文 □一致 □修正 □未確認 |
| `source_link_contact_prefecture_housing_team` | [熊本県・被災者向け案内](https://www.pref.kumamoto.jp/uploaded/attachment/316365.pdf) | p.2「問い合わせ先」 | `contact` | 県すまい対策チーム、096-333-2185 | □原文 □一致 □修正 □未確認 |
| `source_link_period_application_pending` | [熊本県・制度ページ](https://www.pref.kumamoto.jp/soshiki/27/275109.html) | Web「市町村の受付窓口」 | `deadline` | 宇土市開始日確認中、申込期限掲載なし | □原文 □一致 □修正 □未確認 |

## 宇土市の候補差分

| sourceLink ID | source title / URL | Web section | claimType | 現在登録されている値・候補差分 | 人手確認 |
|---|---|---|---|---|---|
| `source_link_application_repair_uto_index_checked` | [宇土市・支援申請一覧](https://www.city.uto.lg.jp/article/list/1307.html) | 記事一覧 | `other` | 8月7日付の個別案内・相談窓口掲載 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_uto_eligibility_candidate` | [宇土市・応急修理](https://www.city.uto.lg.jp/article/view/1243/16523.html) | 「対象者」 | `eligibility` | 被害区分、資力、居住困難、修理後居住見込み。県との差を要確認 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_uto_amount_candidate` | 同上 | 「応急修理の限度額」 | `amount` | 757,000円／367,000円、税込 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_uto_deadline_candidate` | 同上 | 「応急修理の完了期限」 | `deadline` | 2026-10-27＋延長見込み。確定期限として未登録 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_uto_office_candidate` | [宇土市・すまいの相談窓口](https://www.city.uto.lg.jp/article/view/1307/16522.html) | 「受付場所・受付時間・問い合わせ先」 | `application_office` | 市役所1階、9:00～16:30、当面土日祝、住宅再建支援室・班、0964-22-1111。role要確認 | □原文 □一致 □修正 □未確認 |
| `source_link_application_repair_uto_warning_candidate` | [宇土市・応急修理](https://www.city.uto.lg.jp/article/view/1243/16523.html) | 「注意事項」 | `warning` | 修理前写真、制度利用前相談。契約前・支払前の意味を要確認 | □原文 □一致 □修正 □未確認 |

## 必要書類・nextAction

| sourceLink ID | source / 場所 | claimType | 現在登録されている値 | 人手確認 |
|---|---|---|---|---|
| `source_link_document_application_form` | [県案内](https://www.pref.kumamoto.jp/uploaded/attachment/316365.pdf) p.2 | `required_document` | 応急修理申込書 | □原文 □一致 □修正 □未確認 |
| `source_link_document_damage_statement` | 同上 p.2 | `required_document` | 住宅の被害状況に関する申出書 | □原文 □一致 □修正 □未確認 |
| `source_link_document_disaster_certificate` | 同上 p.2 | `required_document` | り災証明書 | □原文 □一致 □修正 □未確認 |
| `source_link_document_photos` | 同上 p.2 | `required_document` | 修理前の被害状況写真 | □原文 □一致 □修正 □未確認 |
| `source_link_document_estimate` | 同上 p.2 | `required_document` | 修理見積書 | □原文 □一致 □修正 □未確認 |
| `source_link_document_financial_statement` | 同上 p.2 | `required_document` | 資力に関する申出書 | □原文 □一致 □修正 □未確認 |
| `source_link_document_checklist` | 同上 p.2 | `required_document` | 応急修理申込時チェックリスト | □原文 □一致 □修正 □未確認 |
| `source_link_action_consult_before_payment` | 同上 p.2「注意」 | `warning` | 支払前に市町村へ相談 | □原文 □一致 □修正 □未確認 |
| `source_link_action_photograph_before_repair` | 同上 p.2「注意」 | `warning` | 修理前の被害状況を撮影 | □原文 □一致 □修正 □未確認 |

---

# 4. 宇土市専用確認欄

「対象地域」「受付開始」「申請窓口」などを別々に判定し、一つ確認できたことを根拠に他も確認済みとしないでください。

| 確認事項 | 現在の登録状態 | 確認に使う一次資料 | Reviewer結果 | メモ・原文 |
|---|---|---|---|---|
| □ 制度対象地域 | `implementationStatus: confirmed` | 県実施要領 p.5、宇土市個別案内 | □確認済み □要修正 □未確認 | |
| □ 受付開始 | `receptionStatus: pending` | 県制度ページ宇土市行、宇土市個別案内・相談窓口 | □確認済み □要修正 □未確認 | |
| □ 申請方法 | `applicationMethodStatus: pending` | 宇土市個別案内、申請者様式 | □確認済み □要修正 □未確認 | |
| □ 申請期限 | `deadlineAt: null` | 宇土市個別案内 | □確認済み □要修正 □未確認 | |
| □ 工事完了期限 | `null`、2026-10-27＋延長見込みが候補 | 宇土市個別案内「完了期限」 | □確認済み □要修正 □未確認 | |
| □ 申請窓口 | `contactPointIds: []` | 宇土市個別案内、相談窓口 | □確認済み □要修正 □未確認 | |
| □ 問い合わせ先 | `contactStatus: pending` | 宇土市個別案内、相談窓口 | □確認済み □要修正 □未確認 | |
| □ 電話番号 | `null`、0964-22-1111が候補 | 宇土市相談窓口 | □確認済み □要修正 □未確認 | |
| □ 受付時間 | `null`、9:00～16:30・当面土日祝が候補 | 宇土市相談窓口 | □確認済み □要修正 □未確認 | |
| □ 必要書類 | 宇土市独自書類は未登録 | 宇土市個別案内「申請者様式」 | □確認済み □要修正 □未確認 | |
| □ 独自様式 | 未登録 | 宇土市個別案内「申請者・事業者様式」 | □確認済み □要修正 □未確認 | |
| □ 独自注意事項 | candidate sourceLinkのみ | 宇土市個別案内「注意事項」 | □確認済み □要修正 □未確認 | |

- 宇土市確認担当者：____________________________
- 確認日時：____________________________________
- 公式ページを実際に開いた：□ はい
- 県窓口を宇土市申請窓口として扱っていない：□ はい
- 「住家の緊急修理」と混同していない：□ はい

---

# 5. 国・熊本県・宇土市の差異比較

差がある場合は統合せず、どの主体・資料の記載かを維持してください。

| 項目 | 国 | 熊本県 | 宇土市 | Reviewerの差異判断 |
|---|---|---|---|---|
| 条件 | 一般制度として住宅の応急修理を位置づけ | 今回災害の被害区分、資力、居住困難、修理後居住見込みを案内 | 市個別案内に対象者記載。県との文言差を要照合 | □一致 □補足関係 □矛盾 □未確認 |
| 金額 | 本パック登録sourceLinkに今回額なし | 757,000円／367,000円、税込 | 同額候補を個別案内に掲載 | □一致 □補足関係 □矛盾 □未確認 |
| 期限 | 今回の申込・完了期限の登録根拠なし | 市町村ごとに開始。宇土市開始日確認中、申込期限掲載なし | 完了2026-10-27と延長見込みが併記。申込期限は要確認 | □一致 □補足関係 □矛盾 □未確認 |
| 書類 | 今回実際に必要な書類の登録根拠として使わない | 県案内7点 | 申請者・事業者様式あり。必須性と県との差を要確認 | □一致 □補足関係 □矛盾 □未確認 |
| 窓口 | 市町村窓口の詳細なし | 被災市町村へ申込。県問い合わせ先あり | すまいの相談窓口あり。応急修理の申請窓口roleを要確認 | □一致 □補足関係 □矛盾 □未確認 |
| 注意事項 | 今回のnextAction根拠には未使用 | 支払後は利用不可、修理前写真 | 事前相談・写真等。契約前・支払前の表現範囲を要確認 | □一致 □補足関係 □矛盾 □未確認 |

差異に関する記録：

______________________________________________________________________________

______________________________________________________________________________

---

# 6. 一般利用者向け公開文案の確認

以下は公開候補の確認用文案であり、現時点では未承認・未公開です。Approverが承認したclaimだけを次STEPの候補にできます。

## 文案A：制度について

> 令和8年熊本地震で、壊れた住宅のうち、日常生活に必要な部分を修理する支援制度が実施されています。自治体が修理業者へ依頼・支払いを行う制度で、申込者へ現金を渡す制度ではありません。

- □ 原制度の意味を変えていない
- □ 条件を省略しすぎていない
- □ 本人が対象だと断定していない
- □ 行政公式サービスと誤認させない
- □ 根拠sourceLinkを承認済み
- Reviewerメモ：____________________________________________________________

## 文案B：あなたの場合

> あなたが利用できるかは、り災証明書の被害区分、現在その家で生活できるか、必要な修理で再び住めるようになるかなどの確認が必要です。条件だけで自己判断せず、被災した市町村へ確認してください。

- □ 原制度の意味を変えていない
- □ 条件を省略しすぎていない
- □ 本人が対象だと断定していない
- □ 行政公式サービスと誤認させない
- □ 根拠sourceLinkを承認済み
- Reviewerメモ：____________________________________________________________

## 文案C：宇土市について

> 宇土市が今回の制度の対象地域に含まれることを確認しています。宇土市での受付、申請方法、窓口、期限などは、確認済みになった項目だけを案内します。未確認の項目は「現在、公式情報を確認しています」と表示します。

- □ 原制度の意味を変えていない
- □ 条件を省略しすぎていない
- □ 受付中・申請可能と未確認のまま断定していない
- □ 行政公式サービスと誤認させない
- □ 根拠sourceLinkを承認済み
- Reviewerメモ：____________________________________________________________

## 民間整理ページであることの表示案

> このページは、一般社団法人よか隊ネット熊本が、国・熊本県・市町村等の公式情報をもとに、生活再建に役立つ情報を分かりやすく整理したものです。行政機関の公式サービスではありません。申請前にはリンク先の公式情報と窓口もご確認ください。

- □ 行政公式サービスとの区別が明確
- □ 一次情報への導線がある
- □ 情報確認日を併記する
- Approverメモ：____________________________________________________________

---

# 7. nextAction確認

すべて `publicationStatus: draft` / `verificationStatus: partially_verified` です。

| 表示文 | 根拠source・箇所 | 高リスク | Reviewer確認 | Secondary Review | Approver確認 |
|---|---|---|---|---|---|
| 修理業者へ支払う前に市町村へ相談する | 県被災者向け案内 p.2「注意」／`source_link_action_consult_before_payment` | 高：支払い判断へ直接影響 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 自治体へ相談せずに修理代金を支払わない | 同上 | 高：禁止表現 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 修理前の被害状況を写真に残す | 県被災者向け案内 p.2「提出書類・注意」／`source_link_action_photograph_before_repair` | 高：工事開始前の行動 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |
| 安全を損なって撮影しない | 登録文にはあるが、公式sourceLinkが直接裏付ける範囲を要確認 | 高：安全行動 | □原文 □一致 □修正 □未確認 | □二次 □一致 □再確認 | □承認 □pending □修正 |

- 「契約前」と「支払前」を同一視していない：□ はい
- 宇土市の未確認窓口を確定表示していない：□ はい
- sourceLinkが行動文全体を裏付ける：□ はい　□ 一部のみ　□ 未確認

---

# 8. consultationItem確認

この確認項目だけで制度対象かどうかは判断できません。「相談内容を整理するために確認しておくとよいこと」としてのみ使用します。

| 質問文 | なぜ確認するか | 根拠 | 対象判定表ではないこと | Reviewer確認 |
|---|---|---|---|---|
| り災証明書の住家被害区分は分かりますか？ | 被害区分により対象条件と修理限度額が異なるため | `source_link_application_repair_damage`、`source_link_application_repair_amount` | □ 確認項目だけで判定しない | □原文 □一致 □修正 □未確認 |
| 日常生活に必要な場所が壊れ、今のままでは住めない状態ですか？ | 現状では住めないことが県資料の要件のため | `source_link_application_repair_eligibility`、`source_link_application_repair_scope` | □ 本人説明だけで判定しない | □原文 □一致 □修正 □未確認 |
| 必要な部分を修理すれば、その家で再び生活できそうですか？ | 修理後に住める見込みが要件のため | `source_link_application_repair_eligibility` | □ 建物安全性を支援者が判定しない | □原文 □一致 □修正 □未確認 |

- 表示見出しを「相談内容を整理するために確認しておくとよいこと」とする：□ 確認
- 「この確認項目だけで制度対象かどうかは判断できません。」を維持する：□ 確認
- 「分からない」を選べる：□ 確認
- 推測せず市町村等へつなぐ文言がある：□ 確認

---

# 9. 修正候補の確認

[修正対象一覧](./emergency-housing-repair-corrections.md)には次の4件があります。Reviewer・Approverの判断前に登録値へ反映しません。

| ID | 候補 | risk | Reviewer判断 | Secondary | 解決状態 |
|---|---|---|---|---|---|
| `COR-UTO-001` | 宇土市申請窓口・相談窓口のrole | high | □採用 □棄却 □再調査 | □確認 | __________ |
| `COR-UTO-002` | 宇土市電話・受付時間 | high | □採用 □棄却 □再調査 | □確認 | __________ |
| `COR-UTO-003` | 工事完了期限2026-10-27＋延長見込み | critical | □採用 □棄却 □再調査 | □確認 | __________ |
| `COR-UTO-004` | 宇土市独自書類・様式 | high | □採用 □棄却 □再調査 | □確認 | __________ |

---

# 10. validation・未承認情報混入検査

Approver確認時に実行し、実行者と日時を記入してください。

| 検査 | Result | 実行者 / At | 備考 |
|---|---|---|---|
| `node scripts/validate-reconstruction-data.js` | | | |
| `node scripts/build-reconstruction-public-data.js` | | | |
| `node scripts/test-reconstruction-public-data.js` | | | |
| 既存データ検査 | | | コマンド：________________ |
| `git diff --check` | | | |
| 未承認claimが公開候補JSONへ入っていない | □ 確認 | | |
| `verifiedBy` / `verifiedAt`を人手記録なしで埋めていない | □ 確認 | | |
| 本番HTML・CSS・既存利用者向けJSを変更していない | □ 確認 | | |

---

# 11. Reviewer・Secondary Reviewer最終記録

## Reviewer

- Reviewer：____________________________________
- Reviewed At：_________________________________
- 一次資料を実際に開いた：□ はい
- 高リスク17項目を確認した：□ はい
- sourceLink 28件を確認した：□ はい
- 結果：□ 登録値と一致　□ 要修正あり　□ 未確認あり
- 要修正・未確認事項：

______________________________________________________________________________

## Secondary Reviewer

- Secondary Reviewer：__________________________
- Secondary Reviewed At：_______________________
- 一次確認と別の操作・時刻で確認した：□ はい
- 同一人物による再確認：□ はい　□ いいえ
- 高リスク17項目を二次確認した：□ はい
- 結果：□ 一次確認と一致　□ 要再確認　□ 未解決あり
- 要再確認・未解決事項：

______________________________________________________________________________

---

# 12. Approver最終判定

- Approver：____________________________________
- Approved At：_________________________________

## Decision

- □ `approve`
- □ `approve_with_pending_items`
- □ `needs_revision`
- □ `reject`

## 未確認事項

______________________________________________________________________________

______________________________________________________________________________

## 承認理由

______________________________________________________________________________

______________________________________________________________________________

## 公開可能と判断したclaim範囲

______________________________________________________________________________

## 公開してはいけないclaim範囲

______________________________________________________________________________

## Approver確認

- □ Reviewer氏名・日時・各確認結果がある
- □ Secondary Reviewer氏名・日時・各確認結果がある
- □ 高リスク項目の二次確認が完了している
- □ sourceLinkの原文箇所と登録claimが一致している
- □ 未処理の重大差異がない、またはDecisionへ反映されている
- □ 宇土市の未確認項目を確定表示していない
- □ 金額、期限、書類、窓口、nextActionの承認範囲が明確
- □ 公開文案が本人対象を断定していない
- □ 民間整理ページであることが明確
- □ validationと未承認情報混入検査を確認した

---

# 13. 次STEPへの引継ぎ

人手記録が揃うまで、判定は `HUMAN_REVIEW_INCOMPLETE` のままです。Approver Decision記入後にSTEP 8を再実行し、レビュー結果の反映と公開候補判定を行ってください。本番HTMLへの公開は、その次のSTEPでのみ行います。
