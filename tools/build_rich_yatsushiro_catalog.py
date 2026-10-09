#!/usr/bin/env python3
"""全58制度の完全データ（対象・概要支援内容・窓口・電話・期限・注意）を厳密に定義し、直感的な概要説明カタログHTMLを生成するスクリプト"""
import json
import re
import unicodedata

with open("tools/v8_parsed_programs.json", "r", encoding="utf-8") as f:
    programs = json.load(f)

PDF_BASE = "https://www.city.yatsushiro.lg.jp/kiji00326858/3_26858_161072_up_eh14ogek.pdf"

# 対象・窓口の補完マスタ
OVERRIDES = {
    "counseling": {
        "target": "令和8年熊本地震で被災された八代市民・事業者・外国人市民など（どなたでも相談可能）",
        "contact": "八代市役所本庁舎1階 会議室D（平日9:00〜12:00／13:00〜17:00） TEL: 0965-33-4452（国際課 TEL: 0965-33-6846）",
        "phones": ["0965-33-4452", "0965-33-6846"]
    },
    "waste": {
        "target": "八代市内で地震に伴い災害ごみが発生した世帯・事業者（り災・被災証明書または受付票が必要）",
        "contact": "循環社会推進課（エコエイトやつしろ） TEL: 0965-34-1997",
        "phones": ["0965-34-1997"]
    },
    "scrivener-consult": {
        "target": "令和8年熊本地震で被災され、不動産登記・相続・成年後見・債務整理等の法律相談を希望される方",
        "contact": "市民活動政策課（本庁舎5階） TEL: 0965-33-4482（相談会場：本庁舎2階 市民相談室・毎週水曜13:00〜16:00・予約不要）",
        "phones": ["0965-33-4482"]
    },
    "resident-tax": {
        "target": "令和8年熊本地震により居住する住宅（全壊・大規模半壊・中規模半壊・半壊）または家財・所有家屋に損害を受けた市民・納税義務者",
        "contact": "市民税課（本庁舎2階 13番窓口） TEL: 0965-33-4107",
        "phones": ["0965-33-4107"]
    },
    "property-tax": {
        "target": "令和8年熊本地震により所有する固定資産（家屋・土地・償却資産）に損害を受けた納税義務者（住家は半壊以上、非住家・土地・償却資産も対象）",
        "contact": "資産税課（本庁舎2階 14番窓口） TEL: 0965-33-4108",
        "phones": ["0965-33-4108"]
    },
    "risai-cert": {
        "target": "令和8年熊本地震により住家・非住家・家財等に被害を受けた市民（住家はり災証明、店舗・倉庫・家財等は被災証明書を発行）",
        "contact": "市民税課（本庁舎2階） TEL: 0965-33-4107（本庁1階多目的ホール・各支所・日奈久出張所・オンライン申請受付中）",
        "phones": ["0965-33-4107"]
    },
    "medical-fee-exemption": {
        "target": "住家が全壊・大規模半壊・中規模半壊・半壊・床上浸水した方、または主たる生計維持者が死亡・重傷・行方不明・失業等の被保険者",
        "contact": "国保ねんきん課 TEL: 0965-33-4113 ／ 介護保険課 TEL: 0965-32-1175 ／ 障がい福祉課 TEL: 0965-33-4102",
        "phones": ["0965-33-4113", "0965-32-1175", "0965-33-4102"]
    },
    "smrj-loan": {
        "target": "小規模企業共済の契約者で、被災区域内に事業所を有し、全壊・半壊等の被害または売上減少の証明を受けた方",
        "contact": "中小企業基盤整備機構 共済相談室 TEL: 050-5541-7171（借入申込窓口：商工組合中央金庫）",
        "phones": ["050-5541-7171"]
    }
}

# 全58制度の直感的な概要支援内容マスタ
SUMMARY_CONTENTS = {
    # 1. 生活・相談 (10件)
    "counseling": "被災に伴う生活再建・各種支援制度・手続きの総合相談窓口（市役所本庁舎1階 会議室D・平日9〜17時）。多言語（22言語）対応や外国人向け相談会も実施。",
    "waste": "地震で生じた家財やがれき等の災害ごみを、市内3箇所の仮置場（新港町・鏡支所・北新地）で12月末まで無料受入れ。家電4品目や家具等も分別持込可能。",
    "hotel": "避難生活が長期化している世帯を対象に、国・県が確保したホテル・旅館の宿泊費を公費負担（宿泊費無料、食事・移動費等は自己負担）。",
    "bath": "自宅の浴室が被災した方や避難所生活中の方を対象に、市内の協力公衆浴場を無料で利用可能（受付で身分証を提示）。",
    "volunteer": "被災家屋の片付け、家具の移動、泥出し等の力仕事について、八代市災害ボランティアセンターからボランティアを無料で派遣。",
    "rental-car": "片付けや荷物運搬、生活再建に必要な軽トラック・普通車等を最長3日間無料貸出（日本カーシェアリング協会・12月25日まで）。",
    "water-delivery": "自力での給水確保が困難な高齢者・障がい者世帯等を対象に、飲用水などの生活用水を戸別配達支援（八代青年会議所）。",
    "lawyer-consult": "住まい・借地・借家・ローン・契約・相続等の法的トラブルについて、弁護士に対面で無料個別相談（市役所本庁舎・予約制）。",
    "nichibenren-tel": "日本弁護士連合会によるフリーダイヤルの電話法律相談（0120-254-994・平日10〜12時／14〜16時・11月30日まで・通話無料）。",
    "scrivener-consult": "不動産登記、相続、成年後見、借金・債務整理等について、司法書士に対面で無料個別相談（毎週水曜13〜16時・市役所2階・予約不要）。",

    # 2. 税・保険 (4件)
    "health-insurance": "住家が半壊以上、または生計維持者の死亡・失業・収入急減等があった世帯を対象に、国民健康保険税・後期高齢者医療保険料・介護保険料を全額または一部減免（住家被害は申請不要）。",
    "resident-tax": "住家が半壊以上、または家財損害、生計維持者の死亡・大幅な所得減少等があった世帯を対象に、個人市県民税を減免（住家被害は申請不要）。",
    "property-tax": "地震で被災した家屋（住家・店舗・倉庫等）、土地、償却資産の損害割合（半壊以上等）に応じて、固定資産税・都市計画税を減免（住家は申請不要）。",
    "pension-exemption": "住宅や家財におおむね2分の1以上の損害を受けた国民年金第1号被保険者を対象に、申請により国民年金保険料を全額または一部免除。",

    # 3. 証明 (5件)
    "risai-cert": "支援金、応急修理、仮設住宅、税・料減免等の申請に必須となる公的証明書。住家は「り災証明書」、非住家・家財・車等は「被災証明書」を交付（窓口・オンライン申請受付中）。",
    "risai-support": "り災証明書の申請書記入や必要書類の準備が難しい被災者を対象に、行政書士が市役所窓口で無料で申請書作成・手続をサポート。",
    "juminhyo-fee": "地震の被災手続や生活再建に使用する住民票の写し、戸籍謄抄本、印鑑登録証明書等の交付手数料を無料化。",
    "mynumber-fee": "地震によりマイナンバーカードを紛失・焼失・著しく損傷した場合の再交付手数料（通常1,000円）を無料化。",
    "tax-cert-fee": "被災支援や融資等の申請に必要な所得証明書、課税証明書、納税証明書、評価証明書等の税関係証明書の交付手数料を無料化。",

    # 4. 生活・お金 (8件)
    "no-insurance-card": "保険証を紛失・自宅に残してきた場合でも、医療機関や介護事業所の窓口で「氏名・生年月日・住所・連絡先」等を申し出ることで保険診療・サービスを受診可能。",
    "medical-fee-exemption": "住家が半壊以上、または生計維持者の死亡・失業等に該当する場合、病院・薬局の窓口一部負担金や介護・障害福祉サービスの利用料を免除（2026年11月利用分まで）。",
    "school-supplies": "地震で学用品を被災・紛失した小中学生に対し、教科書、ノート、筆記用具、体操服、通学カバン等を無償配付・補充支援。",
    "rebuild-grant": "住宅が全壊〜中規模半壊の世帯に、使途自由の「基礎支援金（最大100万円）」と再建方法に応じた「加算支援金（最大200万円）」を合算支給（複数人世帯合計最大300万円・単身3/4）。",
    "disaster-loan": "世帯主の負傷や住居・家財の損害を受けた低・中所得世帯に、生活再建資金を最大150万〜350万円貸付（年利1%・保証人で無利子、据置3年・返済10年・11月2日締切）。",
    "emergency-small-loan": "当面の生活費が不足する被災世帯に対し、社会福祉協議会が無利子・保証人不要で原則10万円（一定要件で最大20万円）を迅速に貸付。",
    "condolence-grant": "地震により死亡した方の遺族に「災害弔慰金（最大500万円）」、重度の障がいが残った方に「災害障がい見舞金（最大250万円）」、被災世帯に市独自の「災害見舞金」を支給。",
    "school-support": "住宅が半壊以上、または収入急変等で困窮した世帯の小中学生を対象に、学用品費、給食費、修学旅行費、校外活動費等を実費支給・援助（市立小中学校経由で申請）。",

    # 5. 公共料金 (4件)
    "water-fee": "八代市水道事業の対象契約者に対し、地震発生直後の7月検針分・8月検針分の水道料金（基本料金＋従量料金）を全額免除（自動適用・申請不要）。",
    "nhk-fee": "住家が半壊以上の被害を受けた世帯を対象に、被災月（7月）から最長6か月間（12月まで）、NHK放送受信料（地上・衛星）を全額免除（要申請）。",
    "kyuden-fee": "被災した契約者を対象に、電気料金の支払期日を最長1〜3か月延長するほか、住家被災等で使用不能となった月の基本料金等を免除。",
    "ntt-fee": "被災により固定電話・インターネット等を利用できなかった期間の基本料金等を免除し、移転工事費用の減免や支払期日延長を実施。",

    # 6. 住まい (12件)
    "built-housing": "全壊等で住まいを失った世帯向けに市が建設する応急仮設住宅（木造・プレハブ）。家賃無料で原則最長2年間提供（光熱水費等は自己負担）。",
    "site-housing": "全壊等で自力再建が難しく、自宅敷地内に設置スペースを確保できる世帯向けに、自宅敷地内に建設型仮設住宅を個別設置・提供。",
    "minashi-housing": "全壊等（半壊以上で修理1か月超等を含む）の被災者が選んだ民間の賃貸住宅（アパート・借家）を市が借り上げ、家賃を公費負担（最長2年・月額家賃上限5.5万〜13万円）。",
    "emergency-repair": "住宅が全壊〜準半壊で、修理すれば居住可能な日常生活に不可欠な部分（屋根・外壁・台所・トイレ等）の修理費を市が業者へ直接支給（半壊以上最大75万7千円、準半壊最大36万7千円）。",
    "bluesheet-repair": "雨水侵入等による被害拡大を防ぐため、屋根・外壁等へのブルーシート展張や応急処置費用を市が業者へ直接支払（上限5万6,400円・完了報告期限10月27日）。",
    "jokaso-grant": "被災した個人住宅の合併処理浄化槽の更新（本体入替え最大33.2万〜54.8万円）や改築（ブロワー等の機器修理）費用の一部を補助（令和9年1月末まで）。",
    "architect-consult": "建築士に対面で住宅の補修・耐震化・建替えを個別相談（毎週木曜9〜16時・市役所1階ホール・11月まで開催・予約不要・無料）。",
    "architect-tel": "建築士による住宅復旧・補修の無料電話相談窓口（050-8882-5924・平日9〜16時・10月30日まで）。必要に応じて現地への無料派遣相談も実施。",
    "plumbing-callcenter": "宅内水道管の破損・漏水修繕に対応できる指定工事業者を紹介する国交省の無料専用窓口（0120-275-557・9〜17時・12月28日まで）。",
    "well-support": "飲用水を得る唯一の井戸が被災した家庭を対象に、井戸内の原因調査を自己負担なしで実施し、修理・掘り直し費用を1世帯最大75万7千円支援（上水道併用者は対象外）。",
    "jhf-loan": "り災証明書を受けた世帯の住宅再建・購入・補修資金を低利・長期固定金利で融資（建設・購入最大5,500万円、補修最大2,500万円・最長35年返済・無保証人）。",
    "demolition": "半壊以上の損壊家屋等（店舗・倉庫等の非住家も半壊以上で対象）を市が直接解体撤去する「公費解体」（原則費用負担なし）および事後償還の「自費解体」（令和9年3月31日まで・事前予約制）。",

    # 7. 農林・事業 (15件)
    "farmland-repair": "地震で損壊した農地・農業用施設の復旧工事費（1箇所40万円以上目安）に対し、国の災害復旧事業を活用して50%以上を公費補助（残余は申請者負担）。",
    "farming-onestop": "千丁支所1階に開設された農業者向け総合相談窓口（平日9〜16時）。機械・施設復旧の補助金、営農技術、品目転換、融資相談を一括で受付。",
    "farming-restart": "速やかな営農再開に必要な生産資材調達や残さ撤去、落下梨の処分・樹勢回復、いぐさ原草・織機の一時保管や輸送費用等を定額〜最大10/10補助。",
    "agri-machinery": "被災した農業用機械・農舎・トラック等の修繕・再取得経費の9/10以内、パイプハウス等再建の7/10以内を補助（原形復旧対象・発注済み工事も遡及可能）。",
    "jfc-loan": "被害を受けた中小企業・小規模事業者の復旧設備・運転資金を融資（国民生活事業最大3,000万円上乗せ、中小事業最大1.5億円・当初3年間0.9%利下げ特例あり）。",
    "smrj-loan": "小規模企業共済契約者向けに、納付掛金に応じ最大1,000万円まで低利（年0.9%）・無担保・無保証人で即日〜数日で緊急貸付（取扱期間6か月）。",
    "short-guarantee": "地震の影響を受けた事業者の短期運転資金を支援するため、熊本県信用保証協会が別枠保証（普通2.8億円以内、小口2,000万円以内・期間6か月・担保不要）。",
    "special-fund-r8": "り災・被災証明書または売上減少要件を満たす中小企業・個人事業主向けに、信用保証料0.00%（県全額補助）・低利（年1.50%〜）で最大8,000万円融資（据置2年）。",
    "safetynet4-fund": "セーフティネット保証4号（市町村の売上20%以上減少認定）を活用し、100%別枠保証・保証料0.00%で最大8,000万円融資（別枠8,000万円・据置2年）。",
    "ouen-fund": "従業員20人以下（商業・サービス業5人以下）の小規模事業者を対象に、保証料0.00%・低利（年1.50%〜）で設備・運転資金を最大2,000万円融資（据置6か月）。",
    "employment-subsidy": "地震の影響で事業活動が縮小し、従業員を一時休業・教育訓練させた事業主に対し、休業手当等の相当額（中小企業2/3、大企業1/2）を助成（特例措置により大幅要件緩和）。",
    "chamber-consult": "商工会議所（桜十字ホール/本所）および商工会（本所/各支所）で、持続化補助金や再出発支援金、融資・資金繰りの書類作成・個別相談を実施（会員外も無料相談可）。",
    "saishuppatsu": "被災した中小企業・小規模事業者の事業用施設（工場・店舗・事務所）、生産機械、設備、事業用車両等の復旧費を補助（中小企業3/4・上限3億円、中堅企業1/2・10月1日より受付中）。",
    "jizokuka": "小規模事業者の機械装置等の復旧や販路開拓費用を補助（直接被害上限200万円、間接被害上限100万円・補助率2/3・第1次公募締切10月16日）。",
    "interest-subsidy": "被災した市内中小企業が活用した災害関連融資（公庫災害貸付や県の地震枠融資など）について、実行後3年間の利子全額（10/10）を八代市が補給・実質無利子化。"
}

# 簡潔にまとめた注意事項マスタ（長文化を防ぎ要点を伝える）
SUMMARY_NOTES = {
    "waste": "分別持込必須。り災・被災証明書（写し可・受付票可）と身分証を持参してください。代理搬入時は委任状が必要です。",
    "hotel": "食費・移動費等は自己負担です。看護・介護サービスはありません。申込フォームまたはコールセンターへ。",
    "bath": "身分証・タオル・石けんを持参してください。営業日・営業時間は施設ごとに異なります。",
    "volunteer": "活動内容は片付け・泥出し等です。危険を伴う高所作業や専門工事は対象外です。",
    "rental-car": "事前予約制。返却時はガソリン満タン返し。貸出期間は最長3日間です。",
    "nichibenren-tel": "通話無料。平日10〜12時、14〜16時。令和8年11月30日までの期間限定です。",
    "scrivener-consult": "毎週水曜13〜16時（市役所本庁舎2階 市民相談室）。事前予約不要・先着順です。",
    "health-insurance": "住家被害による減免はり災証明情報に基づき自動処理（申請不要）。死亡・失業・収入減理由は申請が必要です。",
    "resident-tax": "住家被害による減免は申請不要。死亡・失業・所得減少による減免は令和9年3月31日までに申請が必要です。",
    "property-tax": "住家被害による減免は申請不要。非住家・土地・償却資産の減免は令和9年3月31日までに申請が必要です。",
    "risai-cert": "片付け・修理前に必ず建物の全景と被害箇所を複数方向から撮影してください。非住家や家財は「被災証明書」になります。",
    "rebuild-grant": "解体前に必ず生活援護課へご相談ください。賃貸の大家・所有者で発災時に居住していない場合は対象外です。基礎期限: 2027年8月27日。",
    "disaster-loan": "給付ではなく返済が必要な貸付です。所得制限があります。申請期限: 令和8年11月2日。",
    "emergency-small-loan": "給付ではなく返済が必要です。同一世帯での重複貸付はできません。",
    "condolence-grant": "死亡診断書やり災証明書等の提出が必要です。災害関連死の認定には審査があります。",
    "water-fee": "対象契約者は申請不要（自動で免除適用されます）。",
    "nhk-fee": "免除を受けるにはNHKへの届出（申請）が必要です。住家半壊以上が対象。",
    "kyuden-fee": "契約状況や被害区分により特別措置の内容が異なります。九州電力へお問い合わせください。",
    "emergency-repair": "市から施工業者へ直接支払う現物給付です。工事前の契約・支払いは対象外になる恐れがあります。施工前写真が必須。",
    "bluesheet-repair": "市から業者へ直接支払い。完了報告書の提出期限は令和8年10月27日です。上限超過分は自己負担。",
    "jokaso-grant": "着工前の申請が必要です。事前に点検業者・浄化槽設備士へご相談ください。申請期限: 令和9年1月末。",
    "architect-consult": "相談時間は1件30分程度（当日先着順）。被災状況の分かる写真をご準備ください。",
    "architect-tel": "令和8年10月30日（金）までの平日受付。現地派遣相談も電話から受付。",
    "plumbing-callcenter": "令和8年12月28日までの受付。井戸修理は対象外です。",
    "well-support": "上水道併用者・事業者は対象外です。すでに支払い済みの修理は対象になりません。事前相談が必要です。",
    "demolition": "公費・自費ともに事前予約制（窓口: エコエイトやつしろ2階）。自費解体は着工前に必ずご相談ください。申請期限: 令和9年3月31日。",
    "farmland-repair": "工事着工前に農地整備課へご相談ください。被害写真の保存が必要です。",
    "farming-restart": "要望調査の受付期間や必要書類（被害写真等）をご確認のうえ、千丁支所のワンストップ窓口へご相談ください。",
    "agri-machinery": "被害写真の保存が必須です。原形復旧を超えるグレードアップ部分は自己負担となります。",
    "special-fund-r8": "金融機関および保証協会の審査があります。融資限度額8,000万円、保証料0%。",
    "safetynet4-fund": "市町村発行のセーフティネット4号認定書が必要です。一般保証とは別枠で100%保証。",
    "employment-subsidy": "休業等の初日が令和8年7月28日〜令和9年1月27日のものが対象です。熊本労働局へご相談ください。",
    "saishuppatsu": "事業用施設・設備・車両が対象。月ごとに申請受付期間が設定されています。商工会議所・商工会で書類作成支援中。",
    "jizokuka": "第1次公募締切は令和8年10月16日（金）です。商工会議所・商工会の支援を受けて経営計画書を作成してください。",
    "interest-subsidy": "令和8年12月31日までに貸付実行された対象融資が対象です。翌年1〜2月に利子補給申請を行います。"
}

groups = {
    "生活・相談": {"title": "被災者対応", "items": []},
    "税・保険": {"title": "税金・保険料等の減免措置等", "items": []},
    "証明": {"title": "公的書類の発行等", "items": []},
    "生活・お金": {"title": "経済・生活面の支援", "items": []},
    "公共料金": {"title": "公共料金の減免措置等", "items": []},
    "住まい": {"title": "住まいの確保", "items": []},
    "農林・事業": {"title": "事業経営・農林漁業への支援", "items": []}
}

for p in programs:
    cat = p["category"]
    groups[cat]["items"].append(p)

def clean_txt(t):
    if not t: return ""
    t = unicodedata.normalize('NFKC', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def format_tel(ph_raw):
    ph = unicodedata.normalize('NFKC', ph_raw)
    digits = re.sub(r'\D', '', ph)
    if len(digits) == 6:
        dial = f"0965{digits}"
        disp = f"0965-{ph}" if not ph.startswith("0965") else ph
    else:
        dial = digits
        disp = ph
    return disp, dial

def build_item_html(p):
    pid = p["id"]
    name = clean_txt(p["name"])
    badge_html = f' <span class="ys-badge-{"new" if "新規" in p["badge"] else "up"}">{p["badge"]}</span>' if p["badge"] else ""
    nonbre = p["nonbre"]
    pdf_p = p["pdf_page"]
    pdf_link = f"{PDF_BASE}#page={pdf_p}"
    
    # 補完適用
    target = clean_txt(p["target"])
    content = SUMMARY_CONTENTS.get(pid, clean_txt(p["content"]))
    contact = clean_txt(p["contact"])
    notes = SUMMARY_NOTES.get(pid, clean_txt(p["notes"]))
    phones = p["phones"]

    if pid in OVERRIDES:
        ov = OVERRIDES[pid]
        if "target" in ov and ov["target"]: target = ov["target"]
        if "contact" in ov and ov["contact"]: contact = ov["contact"]
        if "phones" in ov and ov["phones"]: phones = ov["phones"]

    # 1. タイトル行
    title_line = f'<b><a href="{pdf_link}" target="_blank" rel="noopener">{name}{badge_html}<span class="ys-pdf-page">ガイドブック p.{nonbre}（PDF {pdf_p}枚目） ↗</span></a></b>'

    # 2. 特設ガイドリンク
    extra_link = ""
    if pid == "rebuild-grant":
        extra_link = '<div style="margin:6px 0;"><a href="yatsushiro-rebuild.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【八代市 被災者生活再建支援金ガイド・支給額診断 →】</a></div>'
    elif pid == "disaster-loan":
        extra_link = '<div style="margin:6px 0;"><a href="yatsushiro-loan.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【八代市 災害援護資金 特別貸付ガイド・診断 →】</a></div>'
    elif pid == "safetynet4-fund":
        extra_link = '<div style="margin:6px 0;"><a href="yatsushiro-safetynet4.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【八代市 セーフティネット保証4号 認定・資金繰りガイド →】</a></div>'
    elif pid == "saishuppatsu":
        extra_link = '<div style="margin:6px 0;"><a href="kumamoto-saishuppatsu.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【くまもと事業者再出発支援補助金 特設ガイド →】</a></div>'
    elif pid == "jizokuka":
        extra_link = '<div style="margin:6px 0;"><a href="uto-jizokuka.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【持続化補助金＜災害支援枠＞ 申請手順・要件解説 →】</a></div>'

    # 3. リッチ情報ブロック
    detail_box = ['<div class="ys-catalog-card">']
    
    if target:
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label ys-lbl-target">対象</span><div class="ys-card-val">{target}</div></div>')
    
    if content:
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label ys-lbl-content">支援内容</span><div class="ys-card-val">{content}</div></div>')

    # 電話番号
    if contact or phones:
        contact_display = contact
        if phones:
            phone_links = []
            for ph_raw in phones:
                disp, dial = format_tel(ph_raw)
                phone_links.append(f'<a href="tel:{dial}">{disp}</a>')
            contact_display += f' （電話: {" / ".join(phone_links)}）'
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label ys-lbl-contact">窓口</span><div class="ys-card-val">{contact_display}</div></div>')

    if notes and "お問" not in notes and len(notes) > 5:
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label ys-lbl-note">注意</span><div class="ys-card-val">{notes}</div></div>')

    detail_box.append('</div>')

    item_html = f'<li>{title_line}{extra_link}{"".join(detail_box)}</li>'
    return item_html

articles = []
for cat_key, cat_data in groups.items():
    cnt = len(cat_data["items"])
    items_html = "\n".join([build_item_html(item) for item in cat_data["items"]])
    article = f'''<article data-category="{cat_key}"><h3>{cat_data["title"]} <span>{cnt}件</span></h3><ul>
{items_html}
</ul></article>'''
    articles.append(article)

full_catalog_html = f'''<div class="ys-catalog-grid" id="ysCatalog">
{"\n".join(articles)}
</div>'''

with open("tools/generated_catalog.html", "w", encoding="utf-8") as f:
    f.write(full_catalog_html)

print("直感的概要説明リッチカタログ再生成完了（全58件）")
