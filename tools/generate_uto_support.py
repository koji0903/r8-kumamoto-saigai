#!/usr/bin/env python3
"""uto-support.html を生成するスクリプト（シミュレーター・ファセット属性付き）"""
import json
from pathlib import Path

# 各制度の定義（全53制度にファセット属性を完全付与）
SYSTEMS = [
    # 1. 住まい・耐震・環境
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "被災併用OK・最大25万円",
        "title": "宇土市住宅リフォーム助成事業",
        "amount": "対象工事費用の20%（最大25万円分の商品券）",
        "desc": "市民の住環境向上と地元商工業の活性化のため、市内の施工業者による住宅リフォーム工事費用の一部を地域商品券で助成。外壁・屋根塗装、水回り改修、バリアフリー化などが対象です。",
        "extra": "【熊本地震支援との連携】災害救助法に基づく「住宅の応急修理」を完了した世帯が、追加で自己負担リフォームを行う場合も本助成の対象となります。被災者生活再建支援金や義援金の受給世帯も申請可能です。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1007/12355.html",
        "urlLabel": "宇土市公式：住宅リフォーム助成事業 ↗",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#持ち家", "#リフォーム", "#商品券25万", "#被災併用OK"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "無料耐震診断",
        "title": "戸建て木造住宅耐震診断事業補助金",
        "amount": "自己負担無料（市が木造住宅耐震診断士を派遣・全額補助）",
        "desc": "昭和56年5月31日以前に着工された旧耐震基準の木造一戸建て住宅を対象に、市が専門の耐震診断士を派遣して耐震性を無料で総合調査します。",
        "extra": "大地震に対する我が家の倒壊危険度を把握し、耐震改修や補強計画の基礎資料として活用できます。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#木造住宅", "#旧耐震", "#無料耐震診断"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "最大100万円補助",
        "title": "戸建て木造住宅耐震改修等事業補助金（建替え・改修）",
        "amount": "耐震改修・建替え：最大100万円補助 / 耐震シェルター設置：最大30万円補助",
        "desc": "耐震診断の結果、倒壊の危険性があると判定された旧耐震木造住宅について、耐震改修工事、建替え工事、または寝室等の安全を確保する耐震シェルターの設置費用を補助します。",
        "extra": "改修だけでなく建替えも対象。高齢者世帯には耐震シェルター設置も有効です。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#木造住宅", "#耐震改修", "#建替え", "#シェルター30万"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "撤去・改修最大16万円",
        "title": "危険ブロック塀等安全確保支援事業補助金",
        "amount": "撤去・建替え工事費用の2/3（上限16万円）",
        "desc": "避難路や道路に面した倒壊の危険があるブロック塀、石積塀等の撤去、または安全な軽量フェンス等への建替え費用を補助し、地震時の倒壊事故や避難路閉塞を防ぎます。",
        "extra": "道路境界に面する高さや傾きなどの安全点検基準があります。着工前の申請が必要です。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["owned_wood", "vacant"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#ブロック塀", "#道路沿い", "#撤去費16万"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "解体費最大50万円",
        "title": "老朽危険空家等除去促進事業補助金",
        "amount": "解体撤去費用の1/3（上限50万円）",
        "desc": "長期間使用されず、周囲に危険を及ぼす恐れのある特定空家等の解体・撤去費用を補助し、市民の安全確保と生活環境の改善を図ります。",
        "extra": "周囲への危険度判定基準を満たす必要があります。対象要件等の事前相談を受け付けています。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["vacant"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#空き家解体", "#上限50万", "#倒壊危険防止"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "危険区域からの移転",
        "title": "がけ地近接・土砂災害危険住宅移転事業補助金",
        "amount": "危険住宅除却費（最大97.5万円）＋住宅移転支援（融資利子等最大421万円）",
        "desc": "土砂災害警戒区域やがけ地等の危険区域内にある住宅を安全な地域へ移転・建替える際、既存住宅の除却費用や新たな住宅の建設・購入のための借入利子等を補助します。",
        "extra": "土砂災害特別警戒区域等に指定された区域内の住宅が対象となります。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["owned_wood"],
        "income": ["general"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#土砂警戒区域", "#住宅移転", "#融資利子補給"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "水洗化・最大約58万円〜",
        "title": "合併処理浄化槽設置整備事業補助金",
        "amount": "人槽区分・既存単独浄化槽撤去に応じて最大約58万円〜（配管工事加算あり）",
        "desc": "生活排水による河川の水質汚濁を防ぐため、汲み取り便所や単独処理浄化槽から高度処理型合併処理浄化槽へ転換・設置する費用の一部を補助します。",
        "extra": "既存単独槽の撤去や宅内配管工事を伴う場合は補助額が上乗せされます。",
        "dept": "都市整備課 下水道係",
        "phone": "0964-27-3334",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（下水道係） ↗",
        "life": ["all"],
        "family": ["general"],
        "housing": ["septic", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#浄化槽転換", "#水洗化", "#最大58万〜"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "購入費の1/2補助",
        "title": "生ごみ処理機器等購入費補助金",
        "amount": "購入価格の2分の1（電動式上限20,000円 / 容器・コンポスト等上限3,000円）",
        "desc": "家庭から排出される生ごみの自家減量化・堆肥化を促進するため、電動生ごみ処理機やコンポスト容器の購入費用の一部を助成します。",
        "extra": "市内の販売店等で購入する前に要件をご確認ください。1世帯あたりの補助基数制限があります。",
        "dept": "環境福祉課 環境衛生係",
        "phone": "0964-27-3323",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（環境衛生係） ↗",
        "life": ["all"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#生ごみ処理機", "#購入費半額", "#環境美化"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "設置費用の1/2助成",
        "title": "雨水貯留施設設置補助金",
        "amount": "設置費用の2分の1（上限20,000円）",
        "desc": "雨水の有効利用と流出抑制、地震等の災害時における初期消火用水・生活用水の確保を図るため、住宅用雨水タンク（貯留施設）の設置費用を補助します。",
        "extra": "容量100リットル以上の貯留施設が対象です。防災時の非常用水としても役立ちます。",
        "dept": "都市整備課 下水道係",
        "phone": "0964-27-3334",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（下水道係） ↗",
        "life": ["all"],
        "family": ["general"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#雨水タンク", "#防災用水", "#設置補助"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "空き家改修最大50万円",
        "title": "宇土市空き家バンク活用促進補助金",
        "amount": "改修工事費用の1/2（上限50万円）＋不要家財処分費用（上限10万円）",
        "desc": "空き家バンクに登録された物件の利活用を促進するため、物件の購入者または賃借人が行う改修工事費用や、所有者が行う家財処分費用を補助します。",
        "extra": "市外からの移住者や子育て世帯が入居する場合に手厚い支援設定があります。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（政策推進係） ↗",
        "life": ["newlywed", "working"],
        "family": ["general", "childcare"],
        "housing": ["vacant", "rental", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#空き家バンク", "#改修最大50万", "#家財処分"]
    },

    # 2. 子育て・教育・就学支援
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "高校生世代まで無料",
        "title": "子ども医療費助成事業",
        "amount": "0歳〜高校生世代（18歳到達後最初の3月31日まで）：通院・入院の保険診療自己負担分を全額助成",
        "desc": "宇土市内に住所のある高校生世代までのお子さんの医療費（保険適用分）を助成。窓口で「受給者証」を提示することで、熊本県内の医療機関窓口での支払いが不要（現物給付）となります。",
        "extra": "所得制限はありません。入院時の食事代や保険適用外の費用は自己負担となります。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1018/14818.html",
        "urlLabel": "宇土市公式：子ども医療費助成事業 ↗",
        "life": ["child_infant", "child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#高校生まで無料", "#医療費現物給付", "#所得制限なし"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "高校生年代まで拡充",
        "title": "児童手当",
        "amount": "0歳〜3歳未満月額1.5万円 / 3歳〜高校生月額1万円（第3子以降月額3万円）",
        "desc": "高校生年代（18歳到達後の最初の3月31日）までのお子さんを養育している方に支給されます。制度改正により所得制限が撤廃され、支給期間・多子加算が大幅に拡充されています。",
        "extra": "年6回（偶数月）に2か月分ずつ指定口座へ支給されます。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "life": ["child_infant", "child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#高校生年代まで", "#所得制限撤廃", "#多子加算"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "ひとり親世帯手当",
        "title": "児童扶養手当",
        "amount": "全部支給月額45,500円〜一部支給（所得・お子さんの人数に応じて算定）",
        "desc": "父母の離婚や死亡などにより、父または母と生計を同じくしていない児童を養育しているひとり親世帯等の生活の安定と自立を助けるための手当です。",
        "extra": "年6回（奇数月）に支給。所得額に応じた一部支給基準があります。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "life": ["child_infant", "child_school"],
        "family": ["single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#ひとり親世帯", "#月額最大45500円", "#生活安定"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "親子の通院・入院支援",
        "title": "ひとり親家庭等医療費助成",
        "amount": "ひとり親家庭の父・母・養育者および児童の医療費自己負担分を助成",
        "desc": "母子家庭・父子家庭等の健康維持と福祉向上を図るため、健康保険適用による診療・調剤の自己負担額を助成します（所得制限等の所定要件あり）。",
        "extra": "児童扶養手当受給世帯などが対象です。登録手続き後に受給者証が交付されます。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "life": ["child_infant", "child_school", "working"],
        "family": ["single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#ひとり親世帯", "#親と子の医療費", "#自己負担助成"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "入学時のお祝い金",
        "title": "ひとり親家庭児童入学祝金",
        "amount": "小学校入学児童：1人1万円 / 中学校等入学児童：1人1万5千円",
        "desc": "ひとり親家庭の児童が小学校または中学校・義務教育学校等に入学する際、入学に伴う経済的負担を和らげ健やかな成長を祝う祝金を支給します。",
        "extra": "宇土市内に住所を有し、児童扶養手当受給資格等を有するひとり親世帯が対象です。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "life": ["child_school"],
        "family": ["single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#小中入学祝", "#ひとり親", "#最大1.5万円"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "学用品・給食費の援助",
        "title": "宇土市就学援助制度",
        "amount": "学用品費、通学用品費、校外活動費、修学旅行費、学校給食費等の全額または一部",
        "desc": "経済的理由により小中学校への就学が困難な世帯に対し、学用品費や給食費、修学旅行費などの必要な費用を援助する制度です（前年所得等による審査あり）。",
        "extra": "【熊本地震による特例】災害により家計が急変したり住家に甚大な被害を受けた世帯についても、随時申請・特例認定の対象となります。",
        "dept": "学校教育課 学事給食係",
        "phone": "0964-27-3338",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（学事給食係） ↗",
        "life": ["child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#小中学校", "#学用品・給食費", "#家計急変特例"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "放課後の安全な居場所",
        "title": "宇土市放課後児童クラブ利用料減免制度",
        "amount": "生活保護世帯・非課税世帯：月額利用料の全額免除または減額",
        "desc": "放課後や学校休業日に就労等で保護者が不在となる児童を預かる放課後児童クラブ（学童保育）について、所得状況等に応じた利用料の減免措置を実施しています。",
        "extra": "市内各小学校区に設置。長期休業中（夏休み等）の利用枠もあります。",
        "dept": "子育て支援課 保育係",
        "phone": "0964-27-3336",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保育係） ↗",
        "life": ["child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half"],
        "work": ["employee", "business"],
        "tags": ["#学童保育", "#利用料減免", "#共働き・ひとり親"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "3〜5歳児利用料0円",
        "title": "幼児教育・保育の無償化および副食費免除",
        "amount": "3〜5歳児クラス全額無償 / 0〜2歳児住民税非課税世帯無償（副食費免除制度あり）",
        "desc": "認可保育所、認定こども園、幼稚園等を利用する子どもの利用料が無償化されています。年収・世帯状況に応じた給食費（副食費）の免除制度も用意されています。",
        "extra": "認可外保育施設等を利用する場合も、保育の必要性の認定により一定限度額まで無償化対象となります。",
        "dept": "子育て支援課 保育係",
        "phone": "0964-27-3336",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保育係） ↗",
        "life": ["child_infant"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#3〜5歳無償", "#保育料無料", "#副食費免除"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "利子を市が全額補給",
        "title": "宇土市勤労者教育ローン利子補給制度",
        "amount": "教育資金借入利子の全額（年利1.5%相当を上限に在学中補給）",
        "desc": "市内に居住する勤労者が、お子さんの高校・大学・専門学校等への進学・在学資金として金融機関（九州ろうきん等）から借り入れた教育ローンの利息分を市が全額補給します。",
        "extra": "在学期間中の返済負担を大きく軽減。申請年度ごとに利子補給の受付が行われます。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（商工振興係） ↗",
        "life": ["child_school", "working"],
        "family": ["childcare"],
        "housing": ["general"],
        "income": ["general"],
        "disaster": ["none"],
        "work": ["employee", "business"],
        "tags": ["#高校・大学進学", "#教育ローン", "#利子全額補給"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "遺児等の育成支援",
        "title": "宇土市遺児手当",
        "amount": "対象児童1人につき月額手当を支給（学齢期加算あり）",
        "desc": "交通事故、労働災害、病気や災害等により生計維持者を亡くした遺児を養育している保護者に対し、生活の安定と健全な育成を願って市独自の手当を支給します。",
        "extra": "市内に1年以上在住などの要件があります。詳細は子育て給付係へご相談ください。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "life": ["child_infant", "child_school"],
        "family": ["single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy"],
        "work": ["all"],
        "tags": ["#遺児支援", "#月額手当", "#学齢児加算"]
    },

    # 3. 妊娠・出産・女性・健康づくり
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "14回分無料受診票",
        "title": "妊婦健康診査受診票交付",
        "amount": "妊婦一般健康診査14回分＋産婦健康診査2回分の費用助成（無料券交付）",
        "desc": "母子健康手帳の交付時に、妊婦健診14回分および産後健診の公費助成受診票を交付。県内委託医療機関・助産所での健診費用が公費負担となります。",
        "extra": "多胎妊娠（双子・三つ子等）の場合は受診票が追加交付されます。県外受診の償還払い制度もあります。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健指導係） ↗",
        "life": ["child_infant"],
        "family": ["childcare"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#妊娠期", "#健診14回無料", "#多胎加算"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "宿泊・通所・訪問サポート",
        "title": "産後ケア事業（ショートステイ・デイサービス・アウトリーチ）",
        "amount": "宿泊型（1泊2日〜）・通所型・訪問型の自己負担軽減（非課税世帯減免あり）",
        "desc": "出産後1年未満の産婦と乳児を対象に、助産所や産科医療機関で助産師等による授乳指導、乳房ケア、育児相談、休養サポートを提供します。",
        "extra": "産後の孤立や育児不安を予防するため、心身のケアが必要な方が気軽に利用できます。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健指導係） ↗",
        "life": ["child_infant"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#産後1年未満", "#宿泊・通所・訪問", "#育児不安解消"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "自己負担無料",
        "title": "新生児聴覚検査費助成",
        "amount": "初回検査費用を公費負担（受診票による全額助成）",
        "desc": "生まれつきの難聴を早期に発見し適切な療育につなげるため、出生後間もない入院中に産科医療機関で受ける「新生児聴覚検査（AABRまたはOAE）」の費用を助成します。",
        "extra": "母子健康手帳交付時に受診票が配付されます。県外出産時も償還払いに対応します。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健指導係） ↗",
        "life": ["child_infant"],
        "family": ["childcare"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#新生児", "#耳の検査無料", "#早期発見"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "先進医療等へ独自助成",
        "title": "熊本県・宇土市特定不妊治療費助成金",
        "amount": "保険適用外の先進医療費用の一部助成（1回あたり上限5万円等）",
        "desc": "不妊治療を受ける夫婦の経済的負担を軽減するため、保険適用された体外受精・顕微授精と併用して実施された「先進医療」の技術料の一部を助成します。",
        "extra": "保険診療と併用可能な先進医療が対象です。申請期限は治療終了日の属する年度内です。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健指導係） ↗",
        "life": ["newlywed", "working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#妊活・不妊治療", "#保険適用併用", "#県市独自助成"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "ワンコイン〜無料",
        "title": "成人各種がん検診・節目検診",
        "amount": "胃・肺・大腸・乳・子宮頸がん検診：自己負担500円〜1,500円程度（無料クーポン対象あり）",
        "desc": "市民の健康寿命延伸のため、胃がん、肺がん（結核含む）、大腸がん、子宮頸がん、乳がん等の集団・個別検診を実施。節目年齢の方には無料受診券が届きます。",
        "extra": "70歳以上の方や非課税世帯の方は受診料免除申請により無料となります。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健予防係） ↗",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#がん検診", "#格安・無料", "#早期発見"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "人間ドック1.5万円助成",
        "title": "国民健康保険 人間ドック・脳ドック受診費用助成",
        "amount": "1日人間ドック：助成額15,000円 / 脳ドック：助成額15,000円",
        "desc": "宇土市国民健康保険の加入者（35歳以上等）を対象に、生活習慣病の早期発見や脳血管疾患予防のための人間ドック・脳ドック受診費用を助成します。",
        "extra": "国保税の滞納がないこと、年度内に特定健診を受診していないこと等の要件があります。",
        "dept": "市民保険課 医療保険係",
        "phone": "0964-27-3318",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（医療保険係） ↗",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["business", "all"],
        "tags": ["#国保加入者", "#人間ドック", "#費用助成"]
    },

    # 4. シニア・高齢者・障がい福祉
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "バリアフリー改修支援",
        "title": "高齢者等住宅改修費助成事業",
        "amount": "介護保険給付限度額（20万円）を超えた追加工事や、独自改修に上限額まで助成",
        "desc": "要介護・要支援認定を受けた高齢者や虚弱高齢者が、住み慣れた自宅で安全に自立した生活を送れるよう、手すり設置、段差解消、滑り防止床材変更等の費用を補助します。",
        "extra": "必ず着工前の事前申請が必要です。ケアマネジャー等を通じた相談がスムーズです。",
        "dept": "高齢福祉課 介護保険係",
        "phone": "0964-27-3324",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（介護保険係） ↗",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#65歳以上", "#手すり・段差解消", "#介護保険併用"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "24時間駆けつけ・機器無償",
        "title": "緊急通報システム機器貸与事業",
        "amount": "専用通報機器・ペンダント型発信器の無償貸与（通話料実費負担）",
        "desc": "ひとり暮らしの高齢者や重度障がい者が急病や事故などの緊急時に、ボタン一つで受信センターに連絡でき、救急車の手配や安否確認を行えるシステムです。",
        "extra": "固定電話回線がない世帯にも対応したモバイル型機器の導入も進められています。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "life": ["senior"],
        "family": ["senior_only"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#ひとり暮らし高齢者", "#24時間急病通報", "#安心ペンダント"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "見守り付き栄養食",
        "title": "高齢者等配食サービス事業",
        "amount": "1食あたり約400円〜の自己負担で栄養バランスの取れたお弁当を手渡し配達",
        "desc": "食事の調理や買い物が困難な高齢者単身世帯等に対し、定期的に栄養バランスの取れたお弁当を届けるとともに、手渡し時の声かけによる安否確認を行います。",
        "extra": "配達時に異変があった場合は、市役所や緊急連絡先へ直ちに通報・連携されます。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "life": ["senior"],
        "family": ["senior_only"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#見守り配達", "#栄養バランス食", "#調理困難"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "最大2万円補助",
        "title": "高齢者補聴器購入費助成事業",
        "amount": "補聴器本体購入費用の1/2（上限20,000円）",
        "desc": "加齢による聴力低下がある高齢者の社会参加と認知症予防を支援するため、医師の診断に基づいて購入する管理医療機器補聴器の購入費を助成します。",
        "extra": "65歳以上で市民税非課税世帯等の要件があります。購入前の申請が必要です。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "life": ["senior"],
        "family": ["senior_only", "general"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#65歳以上", "#補聴器購入助成", "#上限2万円"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "年間最大24枚交付",
        "title": "宇土市福祉タクシー利用券交付事業",
        "amount": "1枚あたり初乗り運賃相当（年間最大24枚、人工透析等重度者は追加交付）",
        "desc": "重度の身体障がい者や知的障がい者、精神障がい者等の外出支援と社会参加促進のため、市内運行の提携タクシーで利用できる利用券を交付します。",
        "extra": "身体障害者手帳1・2級、療育手帳A判定、精神障害者保健福祉手帳1級等をお持ちの方が対象です。",
        "dept": "環境福祉課 障がい福祉係",
        "phone": "0964-27-3322",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（障がい福祉係） ↗",
        "life": ["senior", "working"],
        "family": ["senior_only", "disability"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#重度障がい", "#外出支援", "#タクシー助成"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "自己負担1割（上限あり）",
        "title": "重度障がい者日常生活用具給付等事業",
        "amount": "特殊寝台、車いす、入浴補助用具、意思伝達装置等の基準価格の原則9割を公費給付",
        "desc": "重度の障がいのある方に対し、日常生活を円滑に過ごすための支援用具（特殊ベッド、便器、歩行支援用具、情報通信支援用具等）の購入費用を給付します。",
        "extra": "障がいの種別・等級や年齢に応じた給付品目一覧があります。購入前の申請が必要です。",
        "dept": "環境福祉課 障がい福祉係",
        "phone": "0964-27-3322",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（障がい福祉係） ↗",
        "life": ["all"],
        "family": ["disability"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#障がい手帳", "#用具給付", "#自己負担1割"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "外出・レスパイト支援",
        "title": "障がい者（児）地域生活支援事業（移動支援・日中一時支援）",
        "amount": "ガイドヘルパー派遣費用や一時預かり費用の原則9割公費負担（所得に応じた月額上限あり）",
        "desc": "単独では外出が困難な障がいのある方への移動支援（余暇活動・通院等）や、保護者の休息・就労等のために日中の居場所を提供する日中一時支援を実施します。",
        "extra": "特別支援学校の放課後や休日の余暇支援としても活用されています。",
        "dept": "環境福祉課 障がい福祉係",
        "phone": "0964-27-3322",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（障がい福祉係） ↗",
        "life": ["all"],
        "family": ["disability", "childcare"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#移動支援", "#日中一時支援", "#レスパイト"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "毎月自宅へ無料配達",
        "title": "ねたきり高齢者等紙おむつ等支給事業",
        "amount": "紙おむつ・尿取りパッド等（月額上限相当分を現物支給）",
        "desc": "常時ねたきり状態にある65歳以上の高齢者や認知症高齢者を在宅で介護している世帯に対し、介護者の経済的負担軽減のため紙おむつ等の介護用品を自宅へ配送・支給します。",
        "extra": "要介護4または5の認定を受けた市民税非課税世帯等が対象となります。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#在宅介護", "#紙おむつ無料配達", "#要介護4・5"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "最大3億円賠償保険・市負担",
        "title": "認知症高齢者等個人賠償責任保険加入支援事業",
        "amount": "自己負担無料（保険料は宇土市が全額負担、最大3億円まで賠償補償）",
        "desc": "認知症等により行方不明となる恐れのある高齢者が「宇土市SOSネットワーク」に事前登録することで、万一の線路立ち入りや他人の財物損壊等の事故に対する賠償保険に市負担で加入できます。",
        "extra": "ご家族が多額の損害賠償を請求されるリスクを回避し、地域で安心して暮らせるセーフティネットです。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "life": ["senior"],
        "family": ["senior_only", "general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#認知症SOS", "#市全額負担", "#賠償保険最大3億"]
    },

    # 5. 移住・定住・新生活・地域コミュニティ
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "所得制限なし・最大60万円",
        "title": "宇土市結婚新生活支援事業",
        "amount": "夫婦とも29歳以下：最大60万円 / 夫婦とも39歳以下：最大30万円",
        "desc": "婚姻に伴う新生活をスタートする新婚世帯を対象に、住宅の購入費、リフォーム費用、家賃・敷金・礼金、引越し費用を幅広く補助します。",
        "extra": "【宇土市独自の特徴】一般的な自治体にある「夫婦合算所得500万円未満」の制限を宇土市独自で撤廃しており、所得制限なしで申請可能です。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1005/11993.html",
        "urlLabel": "宇土市公式：結婚新生活支援事業 ↗",
        "life": ["newlywed"],
        "family": ["general"],
        "housing": ["rental", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["employee", "business"],
        "tags": ["#新婚夫婦39歳以下", "#住宅費最大60万", "#所得制限なし"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "最大100万円＋子育て加算",
        "title": "宇土市移住支援事業支援金（東京圏からの移住）",
        "amount": "2人以上世帯：100万円 / 単身世帯：60万円（18歳未満の帯同児童1人につき100万円加算）",
        "desc": "東京23区に在住または通勤していた方が宇土市へ移住し、県内企業等へ就業、テレワーク継続、または起業した場合に国・県・市が共同で支援金を支給します。",
        "extra": "子育て世帯にはお子さん1人あたり最大100万円が上乗せ加算される手厚い制度です。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（政策推進係） ↗",
        "life": ["working", "newlywed", "child_infant", "child_school"],
        "family": ["general", "childcare"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["employee", "startup"],
        "tags": ["#東京圏からの移住", "#世帯100万円", "#子ども加算100万"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "地域活性化・最大30万円",
        "title": "まちづくり活動推進事業補助金",
        "amount": "事業費の2/3（初年度上限30万円、継続事業段階的補助）",
        "desc": "市民が主体的・自発的に取り組む地域の課題解決、環境保全、文化振興、世代間交流などのまちづくり活動・イベントの立ち上げ・実施費用を助成します。",
        "extra": "営利目的ではない市民グループやボランティア団体が対象となります。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（政策推進係） ↗",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#市民団体", "#地域づくり助成", "#上限30万円"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "自治会館新築・改修補助",
        "title": "宇土市自治会集会施設整備事業補助金",
        "amount": "新築・増築：事業費の1/2（上限1,000万円） / 改修・耐震化：事業費の1/2（上限300万円）",
        "desc": "地域の絆づくりや防災避難の拠点となる自治会公民館・集会施設の新築、建替え、大規模改修、バリアフリー化工事などの費用を補助します。",
        "extra": "地域の合意形成と自治会組織による申請が必要です。計画段階からの相談を受け付けています。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（政策推進係） ↗",
        "life": ["all"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#自治会・公民館", "#新築・改修補助", "#コミュニティ拠点"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "防災資機材の購入補助",
        "title": "自主防災組織育成事業補助金",
        "amount": "結成時資機材購入費：上限20万円 / 育成・維持資機材購入費：上限10万円",
        "desc": "地震や豪雨災害等の発生時に住民同士が助け合う「自主防災組織」の結成や、救助工具、発電機、投光器、メガホン等の防災資機材の整備費用を補助します。",
        "extra": "地域での防災訓練や避難訓練の実施と合わせて活用できます。",
        "dept": "総務課 防災交通係",
        "phone": "0964-27-3314",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（防災交通係） ↗",
        "life": ["all"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#自主防災組織", "#資機材購入", "#防災力強化"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "購入前無料診断",
        "title": "宇土市木造住宅耐震診断士派遣（空き家バンク連携）",
        "amount": "自己負担無料（市が空き家バンク物件へ耐震診断士を派遣）",
        "desc": "空き家バンクに登録された昭和56年以前建築の木造住宅について、購入や賃貸を検討する移住希望者や所有者の依頼に基づき、市が耐震診断士を無料で派遣します。",
        "extra": "安全性を確認した上で物件を取得・改修することができ、その後の耐震改修補助とも接続可能です。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "life": ["newlywed", "working"],
        "family": ["general"],
        "housing": ["vacant", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#空き家バンク", "#購入前耐震診断", "#移住者向け"]
    },

    # 6. 産業・農業・創業・中小企業支援
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "低利融資＋利子補給",
        "title": "宇土市商工振興資金融資制度（振興資金・小口資金）",
        "amount": "振興資金：最大1,500万円 / 小口資金：最大1,000万円（利子補給・保証料補助あり）",
        "desc": "市内で1年以上事業を営む中小企業者・個人事業主の運転資金・設備資金の調達を支援。熊本県信用保証協会の保証を付し、市が利子補給や信用保証料の補助を行います。",
        "extra": "市内金融機関と宇土市商工会が窓口となって手続きをサポートします。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（商工振興係） ↗",
        "life": ["working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["general"],
        "disaster": ["none"],
        "work": ["business"],
        "tags": ["#中小企業・自営業", "#低利融資", "#利子・保証料補助"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "家賃・改修最大50万円",
        "title": "宇土市新規創業者応援補助金",
        "amount": "店舗・事務所家賃補助（月額上限2万円×最長12か月）＋店舗改装費用の1/2（上限26万円）＝最大50万円",
        "desc": "市内で新たに起業・開業する個人や法人を応援するため、創業から1年以内の事業所・店舗賃借料や内外装工事・設備導入費用を助成します。",
        "extra": "宇土市商工会の「特定創業支援事業」による事業計画作成支援を受けた方が対象です。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（商工振興係） ↗",
        "life": ["working", "newlywed"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["startup", "business"],
        "tags": ["#起業・新規開業", "#家賃・改装費補助", "#最大50万円"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "販路開拓・新商品開発",
        "title": "宇土市がんばる中小企業応援補助金",
        "amount": "対象経費の1/2（上限30万円）",
        "desc": "市内の中小企業者が行う新商品・新サービスの開発、展示会出展、ECサイト構築、ブランディング等の販路開拓事業経費の一部を補助します。",
        "extra": "地域資源を活かした特産品開発やDX推進・IT導入へのチャレンジも対象となります。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（商工振興係） ↗",
        "life": ["working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["business"],
        "tags": ["#販路開拓・新商品", "#設備投資", "#市内事業者限定"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "就農給付・最大年150万",
        "title": "新規就農者育成・定着総合支援（農業次世代人材投資事業等）",
        "amount": "経営開始資金：年額最大150万円（最長3年間）＋機械・施設導入補助等",
        "desc": "宇土市内で新たに自立就農を目指す新規就農者に対し、就農直後の経営確立に向けた資金給付や、農業用機械・ビニールハウス等の導入費用の助成を行います。",
        "extra": "就農時の年齢要件（原則50歳未満等）や青年等就農計画の認定が必要です。",
        "dept": "農林水産課 農業振興係",
        "phone": "0964-27-3327",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（農業振興係） ↗",
        "life": ["working", "newlywed"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["general"],
        "disaster": ["none"],
        "work": ["agri"],
        "tags": ["#就農希望者", "#青年等就農給付", "#機械・設備支援"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "専業農家の経営強化",
        "title": "宇土市認定農業者等経営改善支援事業",
        "amount": "高性能農業機械導入費・スマート農業機器導入費の補助（国・県事業上乗せ）",
        "desc": "農業経営改善計画の認定を受けた「認定農業者」や集落営農組織に対し、生産コスト削減や省力化を実現するスマート農業機器・大型機械の導入を支援します。",
        "extra": "レンコン、不知火（デコポン）、トマトなど宇土市の基幹農産物の産地強化を推進しています。",
        "dept": "農林水産課 農業振興係",
        "phone": "0964-27-3327",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（農業振興係） ↗",
        "life": ["working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["general"],
        "disaster": ["none"],
        "work": ["agri"],
        "tags": ["#専業農家", "#認定農業者", "#経営所得安定"]
    },

    # 7. 令和8年熊本地震 特別災害支援
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "最大300万円・生活再建",
        "title": "被災者生活再建支援金",
        "amount": "基礎支援金（最大100万円）＋加算支援金（住宅再建方法に応じ最大200万円）＝合計最大300万円",
        "desc": "令和8年熊本地震により住家に著しい被害を受けた世帯に対し、被害程度に応じた「基礎支援金」と、その後の住宅再建方法（建設・購入・補修・賃借）に応じた「加算支援金」を支給します。",
        "extra": "全壊、大規模半壊、中規模半壊、または半壊解体世帯が対象。宇土市役所1階「すまい再建支援室」が申請窓口です。",
        "dept": "すまい再建支援室（都市整備課）",
        "phone": "0964-22-1111",
        "url": "uto-housing.html",
        "urlLabel": "解説：宇土市 住まいの再建支援ガイド ↗",
        "life": ["all"],
        "family": ["general", "childcare", "senior_only", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#全壊・大規模半壊", "#中規模半壊・解体", "#最大300万円"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "上限70万6千円・現物修理",
        "title": "住宅の応急修理制度（災害救助法）",
        "amount": "準半壊以上：1世帯あたり限度額706,000円（一部損壊準半壊基準あり）",
        "desc": "地震で被災した住宅の屋根、外壁、床、トイレ、給排水設備等の日常生活に不可欠な部分を、市が業者に委託して自己負担なく応急修理する制度です。",
        "extra": "【完了後のリフォーム併用】応急修理の完了後、追加で市内業者によるリフォームを行う場合、宇土市住宅リフォーム助成（最大25万商品券）を併用可能です。",
        "dept": "すまい再建支援室（都市整備課）",
        "phone": "0964-22-1111",
        "url": "uto-repair.html",
        "urlLabel": "解説：宇土市 住宅応急修理ガイド ↗",
        "life": ["all"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#準半壊以上", "#最大70.6万円", "#現物修理", "#リフォーム併用可"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "直接被害200万/定額10割",
        "title": "小規模事業者持続化補助金＜一般型 災害支援枠＞",
        "amount": "直接被害：上限200万円（定額10/10・自社施工特例あり） / 間接被害：上限100万円（補助率2/3）",
        "desc": "令和8年熊本地震で被災した宇土市内の小規模事業者・個人事業主に対し、事業再開・販路開拓のための設備導入や店舗改装費用を補助します。",
        "extra": "宇土市商工会の発行する事業支援計画書（様式4）が必要。商工会確認締切は10月9日、申請締切は10月16日です。",
        "dept": "宇土市商工会 / 商工観光課",
        "phone": "0964-22-1044",
        "url": "uto-jizokuka.html",
        "urlLabel": "解説：宇土市 持続化補助金＜災害支援枠＞ガイド ↗",
        "life": ["working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["business"],
        "tags": ["#被災小規模事業者", "#直接被害最大200万", "#定額10/10あり", "#間接100万"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "自己負担0円解体・自費償還",
        "title": "災害公費解体・自費解体費用償還事業",
        "amount": "市による直接解体撤去：自己負担無料 / 所有者が自費施工：適正算定額を市が償還",
        "desc": "り災証明書で全壊、大規模半壊、中規模半壊等の判定を受け、危険で倒壊のおそれがある被災家屋について、所有者の申請に基づき市が公費で解体撤去を行います。",
        "extra": "自費解体を行う場合も着工前の写真や契約書類の保全が必要です。すまい再建支援室へ解体前にご相談ください。",
        "dept": "すまい再建支援室（公費解体窓口）",
        "phone": "0964-22-1111",
        "url": "uto-housing.html",
        "urlLabel": "解説：宇土市 住まいの再建支援ガイド ↗",
        "life": ["all"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "vacant"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#全壊・解体必須", "#市が無料解体", "#自費解体費用償還"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "見舞金・義援金配分",
        "title": "令和8年熊本地震 災害義援金・宇土市災害見舞金",
        "amount": "住家被害程度（全壊・大規模半壊・中規模半壊・半壊・一部損壊等）に応じた現金支給",
        "desc": "全国から寄せられた災害義援金や宇土市の災害見舞金を、り災証明書の判定に基づき被災世帯へ配分・支給します（返済不要）。",
        "extra": "人的被害（死亡・重傷）や住家損壊の区分に応じて市配分委員会で決定された金額が指定口座へ順次振り込まれます。",
        "dept": "市民保険課（福祉担当）",
        "phone": "0964-27-3316",
        "url": "https://www.city.uto.lg.jp/article/view/1310/16725.html",
        "urlLabel": "宇土市公式：災害対策本部会議資料 ↗",
        "life": ["all"],
        "family": ["general", "single_parent", "senior_only", "childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#人的被害・住家被害", "#現金支給", "#返済不要"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "公的貸付・条件付無利子",
        "title": "宇土市災害援護資金貸付制度",
        "amount": "住居・家財被害や世帯主負傷に応じ最大350万円貸付（年利1%・保証人ありで無利子、据置5年）",
        "desc": "地震で被害を受けた世帯主に対し、生活の立て直しに必要な当面の生活資金を長期・低利で貸し付けます。保証人を立てることで据置期間中も含め全期間無利子（0%）となります。",
        "extra": "前年総所得要件（世帯人数に応じた限度額あり）がありますが、住家が全壊した場合は所得限度額が大幅に引き上げられます。",
        "dept": "福祉課 福祉総務係",
        "phone": "0964-27-3321",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（福祉総務係） ↗",
        "life": ["all"],
        "family": ["general", "single_parent", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income", "general"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#公的貸付最大350万", "#保証人で無利子", "#据置5年"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "税・保険料の減免・猶予",
        "title": "熊本地震に伴う市税・各種保険料の減免・徴収猶予",
        "amount": "固定資産税、市県民税、国民健康保険税、介護保険料、後期高齢者医療保険料の全額免除〜減額",
        "desc": "住家が損壊したり所得が激減した世帯を対象に、り災証明書の判定や収入減少割合に応じて、市税や各種社会保険料の減免措置や徴収猶予を実施します。",
        "extra": "申請により減免決定されます。納期限前の申請が必要な場合がありますので、お早めに税務窓口へご相談ください。",
        "dept": "税務課・市民保険課・高齢福祉課",
        "phone": "0964-27-3317",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（税務課） ↗",
        "life": ["all"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["low_income", "general"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all", "employee", "business"],
        "tags": ["#固定資産税・市県民税", "#国保税・介護保険料", "#減免・納期限延長"]
    }
]

def generate_html():
    categories = [
        {"key": "all", "name": "すべて表示"},
        {"key": "housing", "name": "住まい・耐震・環境"},
        {"key": "childcare", "name": "子育て・教育・就学"},
        {"key": "health", "name": "健康・出産・女性"},
        {"key": "senior", "name": "シニア・障がい福祉"},
        {"key": "community", "name": "移住・新婚・地域"},
        {"key": "business", "name": "産業・農業・創業"},
        {"key": "disaster", "name": "熊本地震特別支援"}
    ]

    cards_by_cat = {}
    for item in SYSTEMS:
        cards_by_cat.setdefault(item["cat"], []).append(item)

    html_parts = []
    html_parts.append('''<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>宇土市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）｜よか隊ネット熊本</title>
  <meta name="description" content="宇土市公式の平時支援制度および令和8年熊本地震特別支援の全53制度を網羅した総合ガイド。現在の状況（年齢・世帯・住まい・収入・被災度・事業）から活用可能な補助金を瞬時に調べる「かんたん条件シミュレーター」を搭載。全制度に一次情報リンクと担当窓口を明記。">
  <link rel="stylesheet" href="styles.css?v=20260907-2">
  <link rel="stylesheet" href="design-system.css?v=20260907-2">
  <link rel="stylesheet" href="org-site.css?v=20260918-1">
  <link rel="stylesheet" href="uto-support.css?v=20260921-2">
</head>
<body>
  <header></header>
  <main id="mainContent">
    <div class="container">

      <!-- パンくずリスト -->
      <nav class="breadcrumb-nav" aria-label="パンくずリスト">
        <a href="index.html">ホーム</a>
        <span>&gt;</span>
        <a href="municipalities.html">自治体別の状況</a>
        <span>&gt;</span>
        <a href="hq-uto.html">宇土市</a>
        <span>&gt;</span>
        <span aria-current="page">暮らしの支援・補助金 総合ガイド</span>
      </nav>

      <!-- ヒーローヘッダー -->
      <header class="uto-sup-hero">
        <div class="uto-sup-hero-badge">宇土市公式制度 徹底整理 · 全53制度</div>
        <h1>宇土市 暮らしの支援・補助金 総合ガイド</h1>
        <p class="uto-sup-hero-lead">
          宇土市が市民の生活安定、住環境向上、子育て、健康、福祉、産業振興のために平時から整備している公的支援・補助金制度と、令和8年熊本地震に伴う特別支援制度を体系的に整理しました。<br>
          「あなたの現在の状況」を選択して、活用できる制度を今すぐお探しいただけます。すべての制度に宇土市公式HP（一次情報）へのリンクと直通電話番号を掲載しています。
        </p>
      </header>

      <!-- かんたん条件シミュレーター -->
      <section class="uto-sim-card" id="utoSimulator" aria-labelledby="utoSimTitle">
        <div class="uto-sim-header">
          <div class="uto-sim-title-group">
            <span class="uto-sim-badge">条件シミュレーター</span>
            <h2 id="utoSimTitle">現在の状況から、使える制度を調べる</h2>
          </div>
          <button type="button" class="uto-sim-reset-btn" id="utoSimResetBtn" aria-label="すべての選択条件をリセット">
            <span aria-hidden="true">↺</span> 条件をクリア
          </button>
        </div>
        <p class="uto-sim-guide">
          お困りごとや世帯の状況に合わせて、ワンタップで探せる「クイック診断」または「詳細条件」をお選びください。<br>
          <small class="uto-sim-privacy-note">※入力・選択された情報は外部に送信されず、お使いの端末（ブラウザ）内でのみ即座に計算されます。</small>
        </p>

        <!-- ① クイック診断プリセットボタン -->
        <div class="uto-sim-presets">
          <span class="uto-sim-presets-label">おすすめクイック診断：</span>
          <div class="uto-sim-preset-grid" role="group" aria-label="おすすめクイック診断">
            <button type="button" class="uto-sim-preset-btn" data-preset="childcare">
              <span class="preset-icon">👨‍👩‍👧</span>
              <span class="preset-title">子育て・教育世帯</span>
              <span class="preset-desc">医療費・児童手当・保育料</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="senior">
              <span class="preset-icon">👴</span>
              <span class="preset-title">シニア・在宅介護</span>
              <span class="preset-desc">住宅改修・通報・補聴器</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="housing">
              <span class="preset-icon">🏠</span>
              <span class="preset-title">住まい改修・耐震</span>
              <span class="preset-desc">リフォーム25万・耐震100万</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="newlywed">
              <span class="preset-icon">💍</span>
              <span class="preset-title">新婚・若年夫婦</span>
              <span class="preset-desc">結婚新生活最大60万・制限なし</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="disaster">
              <span class="preset-icon">🚨</span>
              <span class="preset-title">熊本地震の被災世帯</span>
              <span class="preset-desc">再建金・応急修理・解体・減免</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="business">
              <span class="preset-icon">💼</span>
              <span class="preset-title">自営業・中小企業・農業</span>
              <span class="preset-desc">融資補給・創業50万・持続化</span>
            </button>
          </div>
        </div>

        <!-- ② 詳細条件折りたたみパネル -->
        <details class="uto-sim-details" id="utoSimDetails">
          <summary class="uto-sim-details-summary">
            <span>⚙️ さらに詳細な条件で絞り込む（年齢・住まい・収入・被災状況など）</span>
            <span class="uto-sim-summary-toggle">開く ▼</span>
          </summary>
          <div class="uto-sim-filter-grid">

            <!-- 年代・ライフステージ -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">年代・ライフステージ</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="child_infant">
                  <span>妊娠中・乳幼児（0〜5歳）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="child_school">
                  <span>小中高生（6〜18歳）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="newlywed">
                  <span>新婚・若者（夫婦39歳以下）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="working">
                  <span>現役・勤労世代</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="senior">
                  <span>シニア・高齢者（65歳以上）</span>
                </label>
              </div>
            </div>

            <!-- 世帯・家族構成 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">世帯・家族の状況</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simFamily" value="childcare">
                  <span>子育て中（子どもと同居）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simFamily" value="single_parent">
                  <span>ひとり親世帯（母子・父子）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simFamily" value="senior_only">
                  <span>独居・高齢者のみ世帯</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simFamily" value="disability">
                  <span>障がい者手帳・要介護認定あり</span>
                </label>
              </div>
            </div>

            <!-- 住まいの形態 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">住まいの状況</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simHousing" value="owned_wood">
                  <span>持ち家（木造一戸建て）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simHousing" value="rental">
                  <span>借家・賃貸アパート</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simHousing" value="septic">
                  <span>浄化槽使用（水洗化検討）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simHousing" value="vacant">
                  <span>空き家を所有・解体検討中</span>
                </label>
              </div>
            </div>

            <!-- 収入・所得の状況 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">所得・収入の状況</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simIncome" value="no_limit">
                  <span>所得制限なし（誰でもOK）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simIncome" value="low_income">
                  <span>住民税非課税・低所得世帯</span>
                </label>
              </div>
            </div>

            <!-- 熊本地震の被害度 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">熊本地震の被害状況</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simDisaster" value="damage_heavy">
                  <span>全壊・大規模半壊・中規模半壊</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simDisaster" value="damage_half">
                  <span>半壊（解体検討含む）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simDisaster" value="damage_partial">
                  <span>一部損壊（準半壊含む）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simDisaster" value="none">
                  <span>被害なし（平時の支援を探す）</span>
                </label>
              </div>
            </div>

            <!-- お仕事・事業 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">お仕事・事業形態</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simWork" value="employee">
                  <span>会社員・パート・一般勤労</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simWork" value="business">
                  <span>個人事業主・自営業・中小企業</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simWork" value="agri">
                  <span>農林水産業（就農・農家）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simWork" value="startup">
                  <span>新規創業・起業予定</span>
                </label>
              </div>
            </div>

          </div>
        </details>

        <!-- ③ 選択中条件の表示バー -->
        <div class="uto-sim-active-bar" id="utoSimActiveBar" style="display: none;">
          <span class="active-bar-label">適用中の条件：</span>
          <div class="active-tags-container" id="utoSimActiveTags"></div>
        </div>
      </section>

      <!-- 宇土市の3大特徴ハイライト -->
      <section class="uto-sup-highlights" aria-labelledby="uto-hl-title">
        <h2 id="uto-hl-title">知っておきたい！宇土市の制度連携・独自メリット</h2>
        <div class="uto-sup-hl-grid">
          <div class="uto-sup-hl-item">
            <span class="hl-badge">震災併用OK</span>
            <h3>住宅リフォーム助成（最大25万円商品券）</h3>
            <p>応急修理制度を終えた世帯や、被災者生活再建支援金・義援金を受給した世帯も対象。市内施工業者による修繕・追加工事で最大25万円分の商品券が交付されます。</p>
          </div>
          <div class="uto-sup-hl-item">
            <span class="hl-badge">宇土市独自</span>
            <h3>結婚新生活支援事業（所得制限なし）</h3>
            <p>一般的な自治体にある「夫婦合算所得500万円未満」の制限を宇土市独自で撤廃。新婚夫婦（39歳以下）の住居費・引越費用等を最大30万〜60万円補助します。</p>
          </div>
          <div class="uto-sup-hl-item">
            <span class="hl-badge">耐震＋建替え</span>
            <h3>木造住宅耐震診断・改修・シェルター</h3>
            <p>無料の耐震診断士派遣に加え、改修工事（最大100万）や建替え（最大100万）、高齢者寝室等の耐震シェルター設置（最大30万）まで幅広い選択肢が用意されています。</p>
          </div>
        </div>
      </section>

      <!-- 検索・絞り込みツールバー -->
      <section class="uto-sup-toolbar" aria-labelledby="uto-tool-title">
        <div class="uto-sup-search-row">
          <label for="utoSupSearch" id="uto-tool-title" class="uto-sup-search-label">キーワード検索：</label>
          <input type="text" id="utoSupSearch" class="uto-sup-search-input" placeholder="例：リフォーム、耐震、子育て、所得制限なし、商品券、解体、創業..." autocomplete="off">
        </div>
        <div class="uto-sup-cat-row" role="group" aria-label="分野別カテゴリフィルター">
''')

    for cat in categories:
        active_cls = ' active' if cat["key"] == "all" else ''
        html_parts.append(f'          <button type="button" class="uto-sup-cat-btn{active_cls}" data-target-cat="{cat["key"]}">{cat["name"]}</button>\n')

    html_parts.append('''        </div>
      </section>

      <!-- 検索結果件数表示 -->
      <div class="uto-sup-status">
        <span id="utoSupCount">表示中：''' + str(len(SYSTEMS)) + '''件 / 全''' + str(len(SYSTEMS)) + '''制度</span>
        <span class="uto-sup-status-source">情報源：宇土市公式HP・まちづくりハンドブック（最新確認）</span>
      </div>

      <!-- 一致なし表示 -->
      <div id="utoSupEmpty" class="uto-sup-empty" style="display: none;">
        <p>該当する制度が見つかりませんでした。条件シミュレーターの「条件をクリア」ボタンを押すか、別のキーワードで検索してください。</p>
      </div>
''')

    # 各カテゴリのセクション
    for cat in categories[1:]:
        c_key = cat["key"]
        c_name = cat["name"]
        items = cards_by_cat.get(c_key, [])
        if not items:
            continue

        html_parts.append(f'''
      <!-- セクション: {c_name} -->
      <section class="uto-sup-section" id="sec-{c_key}" data-cat="{c_key}">
        <header class="uto-sup-sec-header">
          <h2>{c_name}</h2>
          <span class="sec-count">（{len(items)}件）</span>
        </header>
        <div class="uto-sup-grid">
''')

        for item in items:
            extra_html = f'<div class="uto-card-extra">{item["extra"]}</div>' if item.get("extra") else ''
            phone_link = f'<a class="uto-card-phone" href="tel:{item["phone"].replace("-", "")}">{item["phone"]}</a>'
            url_target = ' target="_blank" rel="noopener"' if item["url"].startswith("http") else ''

            life_attr = ",".join(item.get("life", ["all"]))
            family_attr = ",".join(item.get("family", ["general"]))
            housing_attr = ",".join(item.get("housing", ["general"]))
            income_attr = ",".join(item.get("income", ["no_limit"]))
            disaster_attr = ",".join(item.get("disaster", ["none"]))
            work_attr = ",".join(item.get("work", ["all"]))

            tag_spans = "".join([f'<span class="card-hash-tag">{t}</span>' for t in item.get("tags", [])])

            html_parts.append(f'''          <article class="uto-card"
                   data-life="{life_attr}"
                   data-family="{family_attr}"
                   data-housing="{housing_attr}"
                   data-income="{income_attr}"
                   data-disaster="{disaster_attr}"
                   data-work="{work_attr}">
            <div class="uto-card-tag-row">
              <span class="uto-badge-cat">{item["catName"]}</span>
              <span class="uto-badge-feature">{item["badge"]}</span>
              <span class="uto-badge-match" style="display: none;">🎯 該当</span>
            </div>
            <h3>{item["title"]}</h3>
            <div class="uto-card-amount">{item["amount"]}</div>
            <p class="uto-card-desc">{item["desc"]}</p>
            {extra_html}
            <div class="uto-card-tags">
              {tag_spans}
            </div>
            <div class="uto-card-footer">
              <div class="uto-card-dept">
                <span>担当：{item["dept"]}</span>
                {phone_link}
              </div>
              <a class="uto-card-link" href="{item["url"]}"{url_target}>{item["urlLabel"]}</a>
            </div>
          </article>
''')

        html_parts.append('''        </div>
      </section>
''')

    # 庁舎案内・相談窓口フッター
    html_parts.append('''
      <!-- 窓口・庁舎案内 -->
      <section class="uto-sup-contact-box" aria-labelledby="uto-contact-title">
        <h3 id="uto-contact-title">宇土市役所 お問い合わせ・窓口案内</h3>
        <p style="font-size:0.95rem; line-height:1.6; color:#475569; margin-bottom:18px;">
          各制度の申請要件、今年度の受付期限、必要書類などは制度ごとに異なります。詳しくは各カードに記載の担当課直通電話、または市役所代表窓口へお問い合わせください。
        </p>
        <div class="uto-sup-contact-grid">
          <div class="uto-sup-contact-item">
            <b>宇土市役所（代表庁舎）</b>
            <p>〒869-0492 熊本県宇土市浦田町51<br>開庁時間：平日 8:30〜17:15</p>
            <a href="tel:0964221111">0964-22-1111（代表）</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>すまい再建支援室（熊本地震総合窓口）</b>
            <p>市役所1階 市民交流スペース<br>応急修理・仮設住宅・公費解体・生活再建支援金</p>
            <a href="tel:0964221111">0964-22-1111（内線）</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>宇土市商工会</b>
            <p>〒869-0433 宇土市新小路町30<br>持続化補助金・創業支援・事業者相談</p>
            <a href="tel:0964221044">0964-22-1044</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>宇土市社会福祉協議会</b>
            <p>〒869-0414 宇土市栄町40-1<br>ボランティアセンター・緊急小口資金等の貸付</p>
            <a href="tel:0964233355">0964-23-3355</a>
          </div>
        </div>
        <p style="margin-top:20px; font-size:0.875rem; color:#64748b;">
          関連リンク：<a href="https://www.city.uto.lg.jp/" target="_blank" rel="noopener">宇土市公式ホームページ ↗</a> · <a href="hq-uto.html">宇土市 災害対策本部会議記録</a> · <a href="uto-housing.html">宇土市 住まいの相談・再建支援ガイド</a> · <a href="uto-jizokuka.html">宇土市 小規模事業者持続化補助金ガイド</a> · <a href="municipalities.html">自治体別支援情報へ戻る</a>
        </p>
      </section>

    </div>
  </main>
  <footer></footer>
  <script src="org-site.js?v=20260907-2"></script>
  <script src="uto-support.js?v=20260921-2"></script>
</body>
</html>
''')

    content = "".join(html_parts)
    Path("uto-support.html").write_text(content, encoding="utf-8")
    print(f"Generated uto-support.html with {len(SYSTEMS)} systems.")

if __name__ == "__main__":
    generate_html()
