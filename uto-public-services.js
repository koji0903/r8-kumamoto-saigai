/**
 * 宇土市 公的施設・市民サービス マップ＆総合ガイド
 * 宇土市公式配信データ・公共施設データに基づく27施設の詳細情報とインタラクティブ機能
 */
(() => {
  // 分野カテゴリー定義
  const CATEGORIES = {
    admin: { label: "行政窓口", color: "#1d4ed8", bg: "#eff6ff", icon: "🏛️" },
    child: { label: "子育て・母子", color: "#ea580c", bg: "#fff7ed", icon: "👶" },
    health: { label: "健康・保健", color: "#16a34a", bg: "#f0fdf4", icon: "🏥" },
    welfare: { label: "福祉・シニア", color: "#9333ea", bg: "#faf5ff", icon: "🤝" },
    culture: { label: "文化・生涯学習", color: "#0d9488", bg: "#f0fdfa", icon: "📚" },
    sports: { label: "スポーツ・運動", color: "#e11d48", bg: "#fff1f2", icon: "⚽" },
    safety: { label: "防災・消防", color: "#d97706", bg: "#fffbeb", icon: "🚒" }
  };

  // エリア定義
  const AREAS = {
    central: "中心部（市役所・宇土駅周辺）",
    west: "西部（網津・網田・赤瀬）",
    north: "北部・東部（緑川・走潟・花園）"
  };

  // 宇土市 27施設の公式データ
  const FACILITIES = [
    // 1. 行政窓口
    {
      id: "uto_city_hall",
      name: "宇土市役所（本庁舎）",
      ruby: "うとしやくしょ ほんちょうしゃ",
      cat: "admin",
      area: "central",
      areaLabel: "中心部（市役所・駅周辺）",
      target: ["all"],
      targetLabel: "全市民・市外からの転入者・事業者",
      address: "宇土市浦田町51",
      lat: 32.687169,
      lng: 130.659132,
      hours: "平日 8:30〜17:15（木曜一部窓口延長）",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      isFree: false,
      quickTags: ["#証明窓口", "#マイナンバー", "#無料駐車場250台", "#授乳室完備"],
      fee: "窓口相談無料（各種証明書発行・手数料は所定料金）",
      parking: "あり（市役所立体・平面駐車場 約250台・無料）",
      phone: "0964-22-1111",
      phoneDept: "代表窓口（各課おつなぎ）",
      url: "https://www.city.uto.lg.jp/",
      urlLabel: "宇土市公式：庁舎・各課案内 ↗",
      desc: "市民生活のあらゆる公的届出・手続き・総合相談が集約された行政中枢拠点です。",
      services: [
        "住民票・戸籍謄抄本・印鑑登録証明書の発行、マイナンバーカード交付・電子証明書更新",
        "転入・転出・転居届、出生・婚姻・死亡などの戸籍届出受付",
        "国民健康保険・後期高齢者医療・国民年金の加入・脱退・給付申請",
        "児童手当・児童扶養手当・こども医療費助成・保育所入所申請・母子福祉窓口",
        "生活保護・生活困窮自立相談・障害者手帳交付・補装具費支給・介護保険認定申請",
        "市民税・固定資産税・軽自動車税の申告受付・納税相談・所得課税証明書交付",
        "木造住宅耐震診断・改修補助金・危険ブロック塀等撤去補助・空き家バンク申請",
        "生ごみ処理容器等購入補助・狂犬病予防注射・上下水道開始休止届出",
        "防災情報発信・避難情報・罹災証明書受付・被災者生活再建支援相談"
      ],
      note: "平日8:30〜17:15開庁。1階に総合案内と市民保険課・税務課・福祉課があり、バリアフリー設計・授乳室も完備。"
    },
    {
      id: "uto_branch_ouzu",
      name: "宇土市 網津支所（網津防災センター内）",
      ruby: "うとし おうづししょ",
      cat: "admin",
      area: "west",
      areaLabel: "西部（網津・網田）",
      target: ["all", "senior"],
      targetLabel: "網津・住吉・西部地域住民・全市民",
      address: "宇土市網津町1991-1",
      lat: 32.696676,
      lng: 130.600871,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      isFree: false,
      quickTags: ["#西部行政窓口", "#証明交付", "#税金納付", "#駐車場30台"],
      fee: "窓口相談無料（証明書交付は所定手数料）",
      parking: "あり（約30台・無料）",
      phone: "0964-24-3211",
      phoneDept: "網津支所直通",
      url: "https://www.city.uto.lg.jp/site/soshiki/10200.html",
      urlLabel: "宇土市公式：網津支所案内 ↗",
      desc: "網津地区・西部地区の身近な行政窓口として、本庁舎へ行かずに主要な証明交付や届出ができます。",
      services: [
        "住民票の写し、印鑑登録証明書、戸籍謄抄本等の交付",
        "市税等の各種公課証明書の発行・市税窓口収納",
        "マイナンバーカード券面記載事項更新・暗証番号再設定",
        "転居・住所変更手続きの相談および申請取次",
        "地域の福祉・防災・日常生活に関する一次相談・本庁担当課への連携"
      ],
      note: "網津防災センターに併設。敷地内にはコミュニティ広場もあり、西部地域の防災拠点としても機能しています。"
    },
    {
      id: "uto_branch_ouda",
      name: "宇土市 網田支所（網田コミセン「しとらす」内）",
      ruby: "うとし おうだししょ",
      cat: "admin",
      area: "west",
      areaLabel: "西部（網津・網田）",
      target: ["all", "senior"],
      targetLabel: "網田・赤瀬・西部地域住民・全市民",
      address: "宇土市下網田町1819",
      lat: 32.668084,
      lng: 130.550636,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      isFree: false,
      quickTags: ["#コミセンしとらす", "#証明交付", "#マイナンバー", "#駐車場50台"],
      fee: "窓口相談無料（証明書交付は所定手数料）",
      parking: "あり（網田コミセン駐車場 約50台・無料）",
      phone: "0964-27-1111",
      phoneDept: "網田支所直通",
      url: "https://www.city.uto.lg.jp/site/soshiki/10200.html",
      urlLabel: "宇土市公式：網田支所案内 ↗",
      desc: "網田地区の複合交流拠点「しとらす」内にあり、住民票や税証明の交付から地域交流まで対応します。",
      services: [
        "住民票・印鑑証明・戸籍関係証明書の交付",
        "税務証明書（所得証明・課税証明・納税証明）の交付・市税収納",
        "マイナンバーカード関連手続き（電子証明書更新・暗証番号再設定等）",
        "各種申請書・届出書の預かりおよび本庁窓口への取次",
        "網田地区コミュニティ活動・生涯学習・地域見守り相談"
      ],
      note: "2025年に最新の網田コミュニティセンター「しとらす」内へ移転。コミュニティスペースやカフェエリアも併設。"
    },

    // 2. 子育て・母子支援
    {
      id: "uto_sunsun",
      name: "つどいの広場サンサン（宇土市保健センター2F）",
      ruby: "つどいのひろば さんさん",
      cat: "child",
      area: "central",
      areaLabel: "中心部（保健センター内）",
      target: ["infant"],
      targetLabel: "おおむね0歳〜3歳児の乳幼児とその保護者（妊婦含む）",
      address: "宇土市南段原町164-3 宇土市保健センター2階",
      lat: 32.679847,
      lng: 130.662452,
      hours: "火曜〜土曜 9:30〜12:00／13:30〜16:00",
      closed: "日曜・月曜・祝日・年末年始",
      openDays: [2, 3, 4, 5, 6],
      openTime: "09:30",
      closeTime: "16:00",
      isFree: true,
      quickTags: ["#完全無料", "#土曜も開館", "#乳幼児遊び場", "#育児相談", "#授乳室完備"],
      fee: "完全無料（利用登録・予約不要、入退室自由）",
      parking: "あり（保健センター駐車場 約40台・無料）",
      phone: "0964-22-2408",
      phoneDept: "サンサン直通",
      url: "https://www.city.uto.lg.jp/article/view/1056/1040.html",
      urlLabel: "宇土市公式：子育て支援センター情報 ↗",
      desc: "令和8年4月に保健センター2階へ移設。乳幼児親子が安全に遊び、育児相談ができる市直営拠点です。",
      services: [
        "乳幼児向け知育玩具・安全マット・大型遊具・絵本コーナーの自由利用",
        "保育士・専門スタッフによる日常の育児相談（授乳・夜泣き・離乳食・発達の悩み等）",
        "保護者同士の交流促進（ママ友・パパ友づくり・情報交換）",
        "「サンサンタイム」（手遊び・絵本読み聞かせ・ふれあい遊び）",
        "月替わりの子育て講座・助産師相談会・身体測定（身長・体重計測）",
        "授乳室・オムツ替えシート・ミルク用給湯設備完備"
      ],
      note: "1階の健康づくり課（母子保健係）とも連携しており、健診や予防接種の帰りにそのまま立ち寄れます。"
    },
    {
      id: "uto_himawari",
      name: "子育て支援センターひまわり",
      ruby: "こそだてしえんせんたー ひまわり",
      cat: "child",
      area: "central",
      areaLabel: "中心部（南段原町）",
      target: ["infant"],
      targetLabel: "未就学児（0歳〜就学前）とその保護者・祖父母",
      address: "宇土市南段原町56-3 城東ビル2F",
      lat: 32.681200,
      lng: 130.664800,
      hours: "月曜〜金曜 9:30〜15:00",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "09:30",
      closeTime: "15:00",
      isFree: true,
      quickTags: ["#未就学児広場", "#離乳食相談", "#手作りおやつ", "#無料"],
      fee: "無料（事前予約不要・いつでも自由利用可）",
      parking: "あり（専用5台程度、満車時はスタッフへ声掛け）",
      phone: "0964-22-7033",
      phoneDept: "支援センター直通",
      url: "https://www.city.uto.lg.jp/article/view/1056/1040.html",
      urlLabel: "宇土市公式：ひまわり案内 ↗",
      desc: "アットホームな雰囲気で祖父母やお父さんも気軽に立ち寄れる、地域に根ざした民間委託支援センターです。",
      services: [
        "プレイルーム開放（木製おもちゃ・すべり台・ブロック・ままごと等）",
        "スタッフによる来所・電話での子育て相談（予約不要・秘密厳守）",
        "離乳食教室・手作りおやつレシピ紹介・栄養相談",
        "月刊「子育て通信ひまわり」の発行・市内子育て情報提供",
        "季節行事（七夕・クリスマス・節分など）や誕生会イベント"
      ],
      note: "好きな時間に来て好きな時間に帰れます。異なる年齢の子ども同士の刺激や、親同士の交流に最適です。"
    },
    {
      id: "uto_midorikawa_tsudoi",
      name: "子育てつどいの広場緑川",
      ruby: "こそだてつどいのひろば みどりかわ",
      cat: "child",
      area: "north",
      areaLabel: "北部・東部（緑川）",
      target: ["infant"],
      targetLabel: "乳幼児とその保護者・ファミリー",
      address: "宇土市野鶴町353",
      lat: 32.692500,
      lng: 130.631000,
      hours: "月曜〜土曜 9:30〜14:30",
      closed: "日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5, 6],
      openTime: "09:30",
      closeTime: "14:30",
      isFree: true,
      quickTags: ["#土曜も開館", "#広い園庭外遊び", "#大型遊具", "#育児相談", "#無料"],
      fee: "無料",
      parking: "あり（約8台・無料）",
      phone: "0964-22-0321",
      phoneDept: "緑川つどい直通",
      url: "https://www.city.uto.lg.jp/article/view/1056/1040.html",
      urlLabel: "宇土市公式：緑川つどい情報 ↗",
      desc: "豊かな自然に囲まれた広い園庭が特徴。外遊びやのびのびとした運動遊びができる子育て広場です。",
      services: [
        "屋外園庭・砂場・大型遊具での外遊び体験（土・水・草花遊び）",
        "室内プレイルームでの自由遊び・絵本コーナー利用",
        "子育てスキルアップ講座・パパママリフレッシュ体験イベント",
        "月刊情報誌「灯（ともしび）通信」の発行",
        "育児専門スタッフによる子育てなんでも相談"
      ],
      note: "土曜日も開所しているため、共働き家庭や休日のパパの育児参加にも大人気です。"
    },
    {
      id: "uto_amitsu_tsukushinbo",
      name: "網津つくしんぼ広場",
      ruby: "おうづつくしんぼひろば",
      cat: "child",
      area: "west",
      areaLabel: "西部（網津）",
      target: ["infant"],
      targetLabel: "西部・網津地区の乳幼児と保護者・全市民",
      address: "宇土市網津町2032",
      lat: 32.695800,
      lng: 130.599500,
      hours: "月曜〜金曜 9:30〜14:30",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "09:30",
      closeTime: "14:30",
      isFree: true,
      quickTags: ["#令和7年新設", "#西部子育て拠点", "#絵本・知育玩具", "#無料"],
      fee: "無料",
      parking: "あり（無料）",
      phone: "0964-24-3332",
      phoneDept: "つくしんぼ直通",
      url: "https://www.city.uto.lg.jp/article/view/1056/1040.html",
      urlLabel: "宇土市公式：つくしんぼ広場 ↗",
      desc: "令和7年4月に新設された網津地区の子育て拠点。地域密着で一人ひとりに寄り添う支援を行っています。",
      services: [
        "乳幼児の安心遊び場（絵本・玩具・プレイマット）",
        "個別育児相談・離乳食やトイトレの悩みアドバイス",
        "季節の制作活動・ふれあい遊びイベント",
        "「つくしんぼだより」の発行・地域子育てマップの案内"
      ],
      note: "網津支所や網津小に近接。地域密着でゆったり相談できる温かい広場です。"
    },
    {
      id: "uto_garden_kurukuru",
      name: "コミュニティーガーデン くるくる",
      ruby: "こみゅにてぃーがーでん くるくる",
      cat: "child",
      area: "north",
      areaLabel: "北部・東部（神馬町）",
      target: ["infant", "all"],
      targetLabel: "未就学児親子・地域住民・多世代",
      address: "宇土市神馬町308-1",
      lat: 32.688500,
      lng: 130.637000,
      hours: "月曜〜土曜 9:30〜14:30",
      closed: "年末年始",
      openDays: [1, 2, 3, 4, 5, 6],
      openTime: "09:30",
      closeTime: "14:30",
      isFree: true,
      quickTags: ["#土曜も開館", "#芝生ピクニック", "#カフェ併設", "#多世代交流"],
      fee: "施設利用無料（カフェメニュー等は実費）",
      parking: "あり（無料）",
      phone: "0964-24-6300",
      phoneDept: "くるくる直通",
      url: "https://www.city.uto.lg.jp/article/view/1056/1040.html",
      urlLabel: "宇土市公式：くるくる案内 ↗",
      desc: "芝生広場とカフェが併設された新しい多世代交流型コミュニティガーデンです。",
      services: [
        "広大な芝生エリアでの外遊び・ピクニック・駆け回り",
        "子育て世代同士の交流・地域多世代とのふれあいイベント",
        "併設カフェでのリラックス・休憩（軽食・ドリンク）",
        "月替わりのおたより発行・ワークショップ開催"
      ],
      note: "※一部イベントや個別予約は公式案内のQRコード等から受付。"
    },
    {
      id: "uto_nagahama_shuccho",
      name: "お出かけつどいの広場（長浜福祉館内）",
      ruby: "おでかけつどいのひろば ながはまふくしかん",
      cat: "child",
      area: "west",
      areaLabel: "西部（長浜）",
      target: ["infant"],
      targetLabel: "長浜・網田周辺の乳幼児と保護者",
      address: "宇土市長浜町411-2 長浜福祉館内",
      lat: 32.693039,
      lng: 130.565012,
      hours: "毎週月曜 10:00〜15:00",
      closed: "火曜〜日曜・祝日・年末年始",
      openDays: [1],
      openTime: "10:00",
      closeTime: "15:00",
      isFree: true,
      quickTags: ["#出張定期広場", "#毎週月曜開催", "#乳幼児相談", "#無料"],
      fee: "無料（予約不要）",
      parking: "あり（長浜福祉館駐車場 無料）",
      phone: "0964-22-2408",
      phoneDept: "つどいの広場サンサン直通",
      url: "https://www.city.uto.lg.jp/article/view/1056/1040.html",
      urlLabel: "宇土市公式：お出かけ広場案内 ↗",
      desc: "サンサンのスタッフが長浜福祉館へ出張開催。沿岸部のお住まいの方も身近に利用できます。",
      services: [
        "乳幼児向けおもちゃ・絵本の出張開放",
        "保育士スタッフによる巡回育児相談・身体計測",
        "近隣のパパママ同士の情報交換・おしゃべり交流"
      ],
      note: "毎週月曜日限定の定期開催です（祝日・年末年始はお休み）。"
    },
    {
      id: "uto_jidou_center",
      name: "宇土市児童センター",
      ruby: "うとし じどうせんたー",
      cat: "child",
      area: "central",
      areaLabel: "中心部（北段原町）",
      target: ["child"],
      targetLabel: "0歳〜18歳未満の児童生徒およびその保護者",
      address: "宇土市北段原町27-2",
      lat: 32.684500,
      lng: 130.660500,
      hours: "火曜〜日曜 9:00〜17:00",
      closed: "毎週月曜・第1日曜・祝日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "17:00",
      isFree: true,
      quickTags: ["#土日も開館", "#室内スポーツ", "#卓球・図書室", "#放課後無料"],
      fee: "入館・利用無料",
      parking: "あり（無料）",
      phone: "0964-23-3303",
      phoneDept: "児童センター事務室",
      url: "https://www.city.uto.lg.jp/site/jidoucenter/1269.html",
      urlLabel: "宇土市公式：児童センター案内 ↗",
      desc: "子どもたちが安全に遊び、学び、仲間づくりができる大型児童館。放課後や休日の居場所です。",
      services: [
        "プレイルーム・遊戯室（卓球、ボール遊び、室内スポーツ）",
        "図書室・学習室（児童書・図鑑・マンガ閲覧、宿題・自習）",
        "幼児コーナー（乳幼児専用の安全マット・知育玩具）",
        "季節の体験教室（工作教室、科学実験、七夕、クリスマス会、百人一首等）",
        "放課後の安全な居場所・児童厚生員による見守りと健全育成指導"
      ],
      note: "小中学生は放課後ランドセルのまま来て過ごすこともできます。乳幼児親子の利用も歓迎されています。"
    },

    // 3. 健康・保健
    {
      id: "uto_health_center",
      name: "宇土市保健センター（健康づくり課・こども家庭センター）",
      ruby: "うとし ほけんせんたー",
      cat: "health",
      area: "central",
      areaLabel: "中心部（南段原町）",
      target: ["all", "infant"],
      targetLabel: "全市民・妊産婦・乳幼児・高齢者",
      address: "宇土市南段原町164-3",
      lat: 32.679847,
      lng: 130.662452,
      hours: "平日 8:30〜17:15（各種健診等は指定日時）",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      isFree: true,
      quickTags: ["#集団健診", "#母子手帳交付", "#乳幼児健診", "#予防接種助成"],
      fee: "健康相談無料（集団健診等は受診券に準ずる低額負担・一部無料）",
      parking: "あり（約40台・無料）",
      phone: "0964-27-3324",
      phoneDept: "健康づくり課 健康推進係（母子保健係：0964-27-4428）",
      url: "https://www.city.uto.lg.jp/category/list/1197.html",
      urlLabel: "宇土市公式：保健センター・健診 ↗",
      desc: "市民の健康増進・生活習慣病予防と、妊娠・出産・育児を一貫して支える総合健康拠点です。",
      services: [
        "特定健康診査（国保特定健診・生活習慣病予防指導）",
        "各種がん検診（胃・肺・大腸・乳・子宮頸がん・前立腺がん検診）の実施・受診券発行",
        "母子健康手帳の交付・妊婦健康相談・「さぽUTO」連携",
        "乳幼児健康診査（3〜4か月児・7〜8か月児・1歳6か月児・3歳児健診）",
        "離乳食教室・むし歯予防フッ素塗布・歯科健診指導",
        "子どもの定期予防接種・高齢者肺炎球菌/帯状疱疹ワクチン公費助成案内",
        "こども家庭センター（妊娠期からのワンストップ相談・出産子育て応援ギフト受付）",
        "精神保健福祉相談（臨床心理士・保健師によるこころの健康相談）"
      ],
      note: "1階が保健センター窓口・診察室・相談室、2階がつどいの広場サンサンになっています。"
    },

    // 4. 福祉・シニア
    {
      id: "uto_fukushi_center",
      name: "宇土市福祉センター（宇土市社会福祉協議会）",
      ruby: "うとし ふくしせんたー",
      cat: "welfare",
      area: "central",
      areaLabel: "中心部（浦田町）",
      target: ["all", "senior"],
      targetLabel: "生活にお困りの方・高齢者・障害者・ボランティア希望者",
      address: "宇土市浦田町44",
      lat: 32.687565,
      lng: 130.658787,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      isFree: true,
      quickTags: ["#社協窓口", "#車いす無料貸出", "#生活困窮相談", "#善意銀行"],
      fee: "相談無料（福祉機器貸出原則無料）",
      parking: "あり（市役所隣接・無料）",
      phone: "0964-23-3776",
      phoneDept: "宇土市社協事務局",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：福祉センター案内 ↗",
      desc: "地域福祉の推進拠点。社会福祉協議会が常駐し、生活困窮・貸出・ボランティアを一括受付します。",
      services: [
        "生活困窮者自立相談支援（家計・仕事・住まいの総合相談受付）",
        "車いすの一時無料貸出（怪我・通院・一時帰宅・旅行等のための短期貸出）",
        "善意銀行の受付（車いす・福祉用具・寄付金の受付と地域還元）",
        "生活福祉資金貸付制度・緊急小口資金等の相談受付窓口",
        "宇土市災害ボランティアセンターの設置・運営（被災時のボランティア派遣・資機材管理）",
        "日常生活自立支援事業（高齢者・知的精神障害者の金銭管理・権利擁護）",
        "ボランティア登録・市民活動団体支援"
      ],
      note: "市役所本庁舎のすぐ西隣に位置しています。一人で悩まずどんなことでもご相談ください。"
    },
    {
      id: "uto_senior_center",
      name: "宇土市老人福祉センター",
      ruby: "うとし ろうじんふくしせんたー",
      cat: "welfare",
      area: "central",
      areaLabel: "中心部（新小路町）",
      target: ["senior"],
      targetLabel: "市内在住のおおむね60歳以上の方",
      address: "宇土市新小路町138-2",
      lat: 32.683567,
      lng: 130.662812,
      hours: "火曜〜日曜 9:00〜16:30",
      closed: "月曜日・祝日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "16:30",
      isFree: true,
      quickTags: ["#60歳以上無料", "#土日も開館", "#大広間開放", "#囲碁将棋", "#健康体操"],
      fee: "無料（一部講座の材料費等実費）",
      parking: "あり（市民会館・体育館周辺駐車場利用可）",
      phone: "0964-22-1111",
      phoneDept: "高齢介護課 高齢者支援係",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：老人福祉センター ↗",
      desc: "高齢者の健康増進・教養の向上・仲間づくりを目的とした、市街地中心部の憩いと交流の場です。",
      services: [
        "大広間・教養娯楽室の開放（囲碁・将棋・健康マージャン等）",
        "高齢者向け健康体操・ストレッチ教室・転倒予防講座",
        "趣味・生きがいサークル活動（書道・手芸・民踊・歌声等）",
        "高齢者の生活・介護・健康に関する情報提供と相談"
      ],
      note: "市民体育館や市民会館に隣接しており、散歩や運動がてら立ち寄るシニアで賑わっています。"
    },
    {
      id: "uto_west_senior_center",
      name: "宇土市 西部老人福祉センター",
      ruby: "うとし せいぶろうじんふくしせんたー",
      cat: "welfare",
      area: "west",
      areaLabel: "西部（下網田町）",
      target: ["senior"],
      targetLabel: "網田・網津・西部地区にお住まいの60歳以上の方",
      address: "宇土市下網田町1942-1",
      lat: 32.668573,
      lng: 130.551331,
      hours: "火曜〜土曜 9:00〜16:00",
      closed: "日曜・月曜・祝日・年末年始",
      openDays: [2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "16:00",
      isFree: true,
      quickTags: ["#入浴サービス", "#土曜も開館", "#網田地区", "#シニア交流"],
      fee: "無料（入浴料所定低額）",
      parking: "あり（約20台・無料）",
      phone: "0964-27-0205",
      phoneDept: "西部老人福祉センター直通",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：西部老人福祉センター ↗",
      desc: "西部（網田地区）の高齢者を対象とした入浴設備・交流広場を備えた健康福祉施設です。",
      services: [
        "入浴サービスの提供（ゆったりとくつろげる入浴設備）",
        "大広間での談話・テレビ視聴・囲碁将棋",
        "高齢者クラブ活動・生きがい交流イベント",
        "健康チェック・血圧測定・保健指導"
      ],
      note: "網田コミセン「しとらす」のすぐ近く。西部地域で安心して入浴と交流ができる貴重な施設です。"
    },

    // 5. 文化・生涯学習・図書館・公民館
    {
      id: "uto_library",
      name: "宇土市立図書館",
      ruby: "うとしりつ としょかん",
      cat: "culture",
      area: "central",
      areaLabel: "中心部（浦田町）",
      target: ["all", "child", "senior"],
      targetLabel: "宇土市在住・在勤・在学の方および近隣自治体住民",
      address: "宇土市浦田町131-1",
      lat: 32.685893,
      lng: 130.657462,
      hours: "火曜〜金曜 9:30〜18:00／土曜・日曜 9:30〜17:00",
      closed: "毎週月曜・館内整理日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:30",
      closeTime: "18:00",
      isFree: true,
      quickTags: ["#蔵書15万冊", "#土日も開館", "#無料Wi-Fi", "#自習スペース", "#読み聞かせ"],
      fee: "閲覧・貸出完全無料",
      parking: "あり（約30台・無料）",
      phone: "0964-22-0941",
      phoneDept: "市立図書館事務室",
      url: "https://www.city.uto.lg.jp/article/view/1064/15966.html",
      urlLabel: "宇土市公式：市立図書館 ↗",
      desc: "一般書・児童書・郷土資料約15万冊を収蔵。読書や調べもの、子どもの読書推進の中心的拠点です。",
      services: [
        "図書・雑誌・紙芝居の貸出（1人10冊まで、2週間）",
        "インターネット・館内検索機（OPAC）での蔵書検索・Web予約",
        "絵本コーナー・おはなしのへやでの定期おはなし会（読み聞かせ）",
        "レファレンスサービス（日常の疑問や地域の歴史・産業の調べもの相談）",
        "持ち込み学習席・自習スペース・新聞雑誌ブラウジングコーナー",
        "視覚障害者向け大活字本・拡大読書器・オーディオブック"
      ],
      note: "現在浦田町で開館中。今後整備される新しい多目的市民交流施設への移転が計画されています。"
    },
    {
      id: "uto_civic_hall",
      name: "宇土市民会館",
      ruby: "うとしみんかいかん",
      cat: "culture",
      area: "central",
      areaLabel: "中心部（新小路町）",
      target: ["all"],
      targetLabel: "市民・文化団体・各種サークル・一般",
      address: "宇土市新小路町123",
      lat: 32.684003,
      lng: 130.661253,
      hours: "9:00〜22:00",
      closed: "月曜日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      isFree: false,
      quickTags: ["#1000席大ホール", "#土日も開館", "#文化芸術発表", "#大型駐車場200台"],
      fee: "施設貸出は条例規定料金（一般催事鑑賞は公演に準ずる）",
      parking: "あり（市民会館・体育館共用 約200台・無料）",
      phone: "0964-22-0114",
      phoneDept: "市民会館管理事務所",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：市民会館案内 ↗",
      desc: "音楽・演劇・市民発表会・講演会など、宇土市の芸術文化活動の中心となる大ホール施設です。",
      services: [
        "大ホール（客席約1,000席・本格的音響照明設備）の利用貸出",
        "大会議室・中会議室・和室等の催事・研修利用",
        "市主催の文化事業・市民文化祭・音楽鑑賞会の開催",
        "ピアノ発表会・演劇・舞踊など地域サークル活動の場"
      ],
      note: "中央公民館・体育館と同一敷地エリアにあり、大規模イベントや大会のメイン会場にもなります。"
    },
    {
      id: "uto_central_kouminkan",
      name: "宇土市中央公民館",
      ruby: "うとし ちゅうおうこうみんかん",
      cat: "culture",
      area: "central",
      areaLabel: "中心部（新小路町）",
      target: ["all"],
      targetLabel: "全市民・自主学習グループ・各種サークル",
      address: "宇土市新小路町96-1",
      lat: 32.684446,
      lng: 130.661771,
      hours: "9:00〜22:00（窓口受付は平日17:15まで）",
      closed: "年末年始",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      isFree: false,
      quickTags: ["#生涯学習講座", "#土日も開館", "#調理実習室", "#サークル活動"],
      fee: "施設利用は所定料金（主催講座等は受講料無料・教材費等実費）",
      parking: "あり（共用駐車場利用）",
      phone: "0964-22-0325",
      phoneDept: "生涯学習課 公民館係",
      url: "https://www.city.uto.lg.jp/category/list/1149.html",
      urlLabel: "宇土市公式：公民館講座案内 ↗",
      desc: "生涯学習の中核施設。各種教養講座、サークル活動、市民の学びとふれあいの場を提供しています。",
      services: [
        "中央公民館定期講座（料理、絵画、陶芸、語学、ヨガ、健康麻雀等）",
        "研修室、和室、調理実習室、集会ホールの貸出利用",
        "宇土市青少年健全育成事業・PTA研修会・地域女性学級",
        "高齢者大学（シニア向け生涯学習プログラム）の開催"
      ],
      note: "自主学習グループの登録制度があり、趣味や特技を活かしたサークル活動が活発に行われています。"
    },
    {
      id: "uto_todoroki_kouminkan",
      name: "轟公民館（地区公民館）",
      ruby: "とどろきこうみんかん",
      cat: "culture",
      area: "central",
      areaLabel: "中心部・南部（石橋町）",
      target: ["all"],
      targetLabel: "轟・石橋地区住民・近隣市民",
      address: "宇土市石橋町10-2",
      lat: 32.676495,
      lng: 130.644851,
      hours: "9:00〜22:00（予約利用時）",
      closed: "年末年始",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      isFree: false,
      quickTags: ["#轟水源近く", "#土日も開館", "#地域コミュニティ", "#集会室利用"],
      fee: "施設利用は所定規定による",
      parking: "あり（約15台・無料）",
      phone: "0964-22-0325",
      phoneDept: "中央公民館（管轄窓口）",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：地区公民館 ↗",
      desc: "名水百選・轟水源のふもとに位置し、地区の自治会活動やコミュニティ講座の拠点です。",
      services: [
        "地区集会・自治会役員会・老人クラブ活動",
        "地域住民向け学習会・防災訓練の拠点",
        "和室・集会ホールの貸出利用"
      ],
      note: "隣接地には轟地区農業者トレーニングセンターがあり、地域スポーツ活動にも利用されます。"
    },
    {
      id: "uto_midorikawa_kouminkan",
      name: "緑川公民館（地区公民館）",
      ruby: "みどりかわこうみんかん",
      cat: "culture",
      area: "north",
      areaLabel: "北部・東部（野鶴町）",
      target: ["all"],
      targetLabel: "緑川・野鶴地区住民・近隣市民",
      address: "宇土市野鶴町294-1",
      lat: 32.694112,
      lng: 130.630070,
      hours: "9:00〜22:00（予約利用時）",
      closed: "年末年始",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      isFree: false,
      quickTags: ["#緑川地区", "#土日も開館", "#文教エリア", "#地域活動拠点"],
      fee: "施設利用は所定規定による",
      parking: "あり（約20台・無料）",
      phone: "0964-22-0325",
      phoneDept: "中央公民館（管轄窓口）",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：地区公民館 ↗",
      desc: "緑川校区の地域コミュニティ活動の中心。各種文化サークルや地域行事が開かれます。",
      services: [
        "校区住民のコミュニティ会合・各種団体活動",
        "生涯学習講座・子ども会行事の開催",
        "会議室・和室等の地域開放利用"
      ],
      note: "緑川小・緑川トレセン・つどいの広場緑川に近接した校区の文教エリアにあります。"
    },
    {
      id: "uto_hashirigata_kouminkan",
      name: "走潟公民館（地区公民館）",
      ruby: "はしりがたこうみんかん",
      cat: "culture",
      area: "north",
      areaLabel: "北部・東部（走潟町）",
      target: ["all"],
      targetLabel: "走潟地区住民・全市民",
      address: "宇土市走潟町822",
      lat: 32.704136,
      lng: 130.647017,
      hours: "9:00〜22:00（予約利用時）",
      closed: "年末年始",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      isFree: false,
      quickTags: ["#走潟校区", "#土日も開館", "#防災活動拠点", "#研修室貸出"],
      fee: "施設利用は所定規定による",
      parking: "あり（約20台・無料）",
      phone: "0964-22-0325",
      phoneDept: "中央公民館（管轄窓口）",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：地区公民館 ↗",
      desc: "海苔養殖や農業が盛んな走潟地区の交流拠点。地域行事や自治会総会などに広く活用されています。",
      services: [
        "走潟校区のコミュニティ活動・防災活動拠点",
        "地域住民向け学習講座・各種サークル利用",
        "ホール・研修室の貸出"
      ],
      note: "走潟小学校や地区体育館に隣接しており、地域の総合的なコミュニティの中心です。"
    },
    {
      id: "uto_ouda_kouminkan",
      name: "網田公民館（地区公民館）",
      ruby: "おうだこうみんかん",
      cat: "culture",
      area: "west",
      areaLabel: "西部（下網田町）",
      target: ["all"],
      targetLabel: "網田地区住民・全市民",
      address: "宇土市下網田町566-1",
      lat: 32.670222,
      lng: 130.556858,
      hours: "9:00〜22:00（予約利用時）",
      closed: "年末年始",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      isFree: false,
      quickTags: ["#網田校区", "#土日も開館", "#伝統文化継承", "#地域集会"],
      fee: "施設利用は所定規定による",
      parking: "あり（約15台・無料）",
      phone: "0964-22-0325",
      phoneDept: "中央公民館（管轄窓口）",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：地区公民館 ↗",
      desc: "網田地区の伝統芸能継承や地域学習、サークル活動に利用されている地区拠点です。",
      services: [
        "網田校区の地域行事・伝統文化保存活動",
        "各種教養講座・健康増進活動",
        "地域会議・集会室利用"
      ],
      note: "網田焼の歴史など地域の豊かな文化資源を学ぶ活動にも利用されています。"
    },
    {
      id: "uto_hanazono_comm",
      name: "花園コミュニティセンター",
      ruby: "はなぞのこみゅにてぃせんたー",
      cat: "culture",
      area: "north",
      areaLabel: "北部・東部（古保里町）",
      target: ["all"],
      targetLabel: "花園校区住民・全市民",
      address: "宇土市古保里町977",
      lat: 32.676378,
      lng: 130.683304,
      hours: "9:00〜22:00",
      closed: "月曜日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      isFree: false,
      quickTags: ["#花園校区", "#土日も開館", "#学童クラブ隣接", "#多目的集会室"],
      fee: "施設利用は所定規定による",
      parking: "あり（花園小隣接 約30台・無料）",
      phone: "0964-22-1111",
      phoneDept: "まちづくり推進課",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：コミュニティセンター ↗",
      desc: "花園地区の住民自治・文化交流拠点。学童クラブ（花っ子学童）や体育館にも隣接しています。",
      services: [
        "花園校区まちづくり協議会・自治会活動の拠点",
        "多目的集会室・和室等の地域貸出",
        "地域ふれあい祭り・文化展・防災教室の開催",
        "学童保育（花っ子学童クラブ）との連携拠点"
      ],
      note: "花園小学校体育館のすぐ裏手に位置し、地域の多世代交流が盛んです。"
    },

    // 6. スポーツ・健康増進
    {
      id: "uto_arena",
      name: "ecowin宇土アリーナ（宇土市民体育館）",
      ruby: "えこうぃん うとありーな（うとしみんたいいくかん）",
      cat: "sports",
      area: "central",
      areaLabel: "中心部（旭町）",
      target: ["all"],
      targetLabel: "全市民・スポーツ愛好者・少年少女スポーツクラブ・一般",
      address: "宇土市旭町504",
      lat: 32.684215,
      lng: 130.664516,
      hours: "火曜〜土曜 9:00〜22:00／日曜・祝日 9:00〜17:00",
      closed: "毎週月曜日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      isFree: false,
      quickTags: ["#冷暖房完備", "#トレーニング室", "#土日も開館", "#駐車場300台"],
      fee: "個人利用低額（トレーニング室1回200円等・専用貸切は所定料金）",
      parking: "あり（アリーナ・運動公園駐車場 約300台・無料）",
      phone: "0964-23-0105",
      phoneDept: "アリーナ管理事務所",
      url: "https://www.city.uto.lg.jp/category/list/1151.html",
      urlLabel: "宇土市公式：スポーツ施設一覧 ↗",
      desc: "冷暖房（ecowin）完備の市内最大屋内スポーツ施設。バレー・バスケ・バドミントン・武道に対応。",
      services: [
        "メインアリーナ（バスケット2面／バレー3面／バドミントン10面）の個人利用・専用貸切",
        "サブアリーナ（各種球技・体操・軽スポーツ）の利用",
        "トレーニング室（ランニングマシン、エアロバイク、筋トレ機器各種・指導員常駐時間あり）",
        "市武道館（柔道場・剣道場・弓道場での武道稽古・大会開催）",
        "市主催の各種市民スポーツ教室・健康づくり体操・ヨガ教室"
      ],
      note: "災害時には市内最大の避難所・支援物資拠点としても機能する強固な防災拠点建築です。"
    },
    {
      id: "uto_sports_center",
      name: "宇土市スポーツセンター",
      ruby: "うとし すぽーつせんたー",
      cat: "sports",
      area: "north",
      areaLabel: "北部・東部（花園町）",
      target: ["all"],
      targetLabel: "全市民・野球・陸上・テニス愛好者・学校部活動",
      address: "宇土市花園町523-2",
      lat: 32.677037,
      lng: 130.694326,
      hours: "8:30〜21:30（夜間照明設備あり）",
      closed: "年末年始",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "08:30",
      closeTime: "21:30",
      isFree: false,
      quickTags: ["#市営野球場", "#陸上トラック", "#テニスコート6面", "#ナイター照明"],
      fee: "施設利用料（専用利用は所定規定による）",
      parking: "あり（大型駐車場完備・無料）",
      phone: "0964-22-1111",
      phoneDept: "生涯スポーツ課",
      url: "https://www.city.uto.lg.jp/category/list/1151.html",
      urlLabel: "宇土市公式：スポーツセンター ↗",
      desc: "本格的な屋外スポーツゾーン。野球場、陸上競技場、全天候型テニスコートを完備しています。",
      services: [
        "市営野球場（本格的なグラウンド・観客席・スコアボード・ナイター設備）",
        "陸上競技場（全天候トラック・フィールド競技・サッカー場）",
        "テニスコート（人工芝オムニコート・夜間ナイター照明完備）",
        "各種市民スポーツ大会・中体連大会・少年少女リーグ大会の会場"
      ],
      note: "花園町に広がる広大な運動公園。ウォーキングコースとしても多くの市民に親しまれています。"
    },
    {
      id: "uto_ajisainoyu",
      name: "あじさいの湯（宇土市営温泉施設）",
      ruby: "あじさいのゆ",
      cat: "sports",
      area: "west",
      areaLabel: "西部（網津）",
      target: ["all", "senior"],
      targetLabel: "全市民・高齢者・観光客・一般",
      address: "宇土市網津町2283",
      lat: 32.689157,
      lng: 130.598309,
      hours: "10:00〜21:00（受付は20:30まで）",
      closed: "第2・第4水曜日・年末年始",
      openDays: [0, 1, 2, 4, 5, 6],
      openTime: "10:00",
      closeTime: "21:00",
      isFree: false,
      quickTags: ["#天然温泉", "#サウナ露天", "#シニア割引", "#大広間休憩", "#駐車場50台"],
      fee: "入浴料：大人400円、高齢者（宇土市内65歳以上）300円、小人200円",
      parking: "あり（約50台・無料）",
      phone: "0964-24-3456",
      phoneDept: "あじさいの湯フロント",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：あじさいの湯 ↗",
      desc: "網津の豊かな自然の中にある市営温泉。天然温泉の大浴場やサウナで日々の疲れを癒せます。",
      services: [
        "天然温泉大浴場（神経痛・筋肉痛・疲労回復等に効能）",
        "遠赤外線サウナ・水風呂・露天感覚の外気浴スペース",
        "無料休憩大広間（お風呂上がりのリラックス・飲食持ち込み等）",
        "市内高齢者向け入浴利用割引（健康増進支援）"
      ],
      note: "地域の高齢者の健康づくりと市民のリフレッシュ拠点として親しまれています。"
    },

    // 7. 防災・安全・消防
    {
      id: "uto_fire_north",
      name: "宇城広域連合 北消防署",
      ruby: "うきこういきれんごう きたしょうぼうしょ",
      cat: "safety",
      area: "central",
      areaLabel: "中心部（境目町）",
      target: ["all"],
      targetLabel: "宇土市民・宇城広域圏住民",
      address: "宇土市境目町427",
      lat: 32.698000,
      lng: 130.668000,
      hours: "24時間（火災・救急出動）／窓口受付：平日 8:30〜17:15",
      closed: "年中無休（窓口業務は土日祝休）",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "00:00",
      closeTime: "23:59",
      isFree: true,
      quickTags: ["#24時間体制", "#救命救急", "#AED講習", "#防災拠点"],
      fee: "消防救急出動・救命講習無料",
      parking: "あり（来署者用無料）",
      phone: "0964-22-0119",
      phoneDept: "消防署代表（緊急通報は119番）",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：消防・救急案内 ↗",
      desc: "宇土市全域の火災・救急・人命救助を担う中核消防拠点。市民向け普通救命講習も受付。",
      services: [
        "119番通報受付・24時間体制の消火・救急・高度救助出動",
        "普通救命講習（心肺蘇生法・AED取扱い講習・修了証発行）の定期開催・団体受付",
        "住宅用火災警報器の設置・点検・交換相談",
        "事業所・店舗・集合住宅等の防火管理・消防設備点検報告受付",
        "子ども会・自主防災組織向け消火器体験・煙避難体験訓練の指導"
      ],
      note: "国道3号沿いに立地。救命救急の普及啓発にも注力しており、個人・団体でAED講習が受講できます。"
    },
    {
      id: "uto_amitsu_bousai",
      name: "網津防災センター",
      ruby: "おうづぼうさいせんたー",
      cat: "safety",
      area: "west",
      areaLabel: "西部（網津）",
      target: ["all"],
      targetLabel: "網津・西部地区住民・全市民",
      address: "宇土市網津町1991-1",
      lat: 32.696676,
      lng: 130.600871,
      hours: "平日 8:30〜17:15（災害時24時間警戒・避難所開設）",
      closed: "土日祝（災害警戒時は即時開設）",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      isFree: true,
      quickTags: ["#一時避難所", "#高台避難", "#非常用備蓄物資", "#駐車場30台"],
      fee: "無料",
      parking: "あり（約30台・無料）",
      phone: "0964-24-3211",
      phoneDept: "網津支所窓口",
      url: "https://www.city.uto.lg.jp/article/view/1025/340.html",
      urlLabel: "宇土市公式：網津防災センター ↗",
      desc: "西部地域の防災拠点。非常用備蓄物資を常備し、高台避難や災害対策現地本部として機能します。",
      services: [
        "災害時の一時指定避難所・緊急避難場所（浸水・土砂災害警戒時）",
        "非常用備蓄食料・飲料水・毛布・簡易トイレ等の備蓄管理",
        "地域自主防災組織の防災訓練・防災研修会の会場",
        "平常時の網津支所行政サービス窓口"
      ],
      note: "海抜が高く地盤の安定した高台に建設されており、津波や高潮等の水害時にも安全な避難所です。"
    }
  ];

  // Google Maps経路URL生成
  const mapsUrl = (item) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`宇土市 ${item.name} ${item.address}`)}`;

  // お気に入り（localStorage）管理
  const FAV_STORAGE_KEY = "yokatai_uto_fav_facilities";
  function loadFavorites() {
    try {
      const saved = localStorage.getItem(FAV_STORAGE_KEY);
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  }
  function saveFavorites(set) {
    try {
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify([...set]));
    } catch {}
  }
  let favorites = loadFavorites();

  // 開館ステータス判定
  function getFacilityOpenStatus(f, now = new Date()) {
    const day = now.getDay(); // 0:日, 1:月...6:土
    const curMinutes = now.getHours() * 60 + now.getMinutes();

    if (!f.openDays || !f.openDays.includes(day)) {
      return { isOpen: false, badgeClass: "status-closed", text: "⚪ 本日休館", detail: f.closed };
    }

    if (f.openTime && f.closeTime) {
      const [oh, om] = f.openTime.split(":").map(Number);
      const [ch, cm] = f.closeTime.split(":").map(Number);
      const oMin = oh * 60 + om;
      const cMin = ch * 60 + cm;

      if (curMinutes >= oMin && curMinutes < cMin) {
        return { isOpen: true, badgeClass: "status-open", text: `🟢 開館中（〜${f.closeTime}）`, detail: f.hours };
      } else if (curMinutes < oMin) {
        return { isOpen: false, badgeClass: "status-upcoming", text: `🟡 本日 ${f.openTime}〜 開館`, detail: f.hours };
      } else {
        return { isOpen: false, badgeClass: "status-ended", text: "🔴 本日受付終了", detail: f.hours };
      }
    }

    return { isOpen: true, badgeClass: "status-open", text: "🟢 利用可能", detail: f.hours };
  }

  // DOM要素
  const mapElement = document.getElementById("publicServicesMap");
  const cardsContainer = document.getElementById("facilityCardsContainer");
  const tableContainer = document.getElementById("facilityTableContainer");
  const countDisplay = document.getElementById("facilityResultCount");
  const realtimeInfoDisplay = document.getElementById("realtimeStatusInfo");
  const searchInput = document.getElementById("serviceSearchInput");
  const catFilterContainer = document.getElementById("catFilterGroup");
  const targetFilterContainer = document.getElementById("targetFilterGroup");
  const areaFilterContainer = document.getElementById("areaFilterGroup");
  const quickTagsContainer = document.getElementById("quickTagsGroup");
  const openNowCheckbox = document.getElementById("openNowCheckbox");
  const resetBtn = document.getElementById("resetFilterBtn");
  const gestureHint = document.getElementById("mapGestureHint");
  const btnResetMap = document.getElementById("btnResetMapView");
  const btnLocate = document.getElementById("btnLocateUser");
  const btnFullscreen = document.getElementById("btnToggleFullscreen");
  const btnExitFsFloating = document.getElementById("btnExitFullscreenFloating");
  const btnViewCards = document.getElementById("btnViewCards");
  const btnViewTable = document.getElementById("btnViewTable");
  const favCountDisplay = document.getElementById("favCount");

  let activeCat = "all";
  let activeTarget = "all";
  let activeArea = "all";
  let activeQuickTag = null;
  let openNowOnly = false;
  let searchQuery = "";
  let currentViewMode = "cards"; // "cards" or "table"
  let map = null;
  let markers = [];
  let userLocationMarker = null;
  let hintTimer = null;

  // お気に入りカウント更新
  function updateFavCount() {
    if (favCountDisplay) {
      favCountDisplay.textContent = String(favorites.size);
    }
  }

  // お気に入りトグル
  window.toggleFavorite = (id, event) => {
    if (event) event.stopPropagation();
    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }
    saveFavorites(favorites);
    updateFavCount();
    renderCards();
    renderTable();
  };

  // ジェスチャーヒント表示（Google Maps風スクロール誘導）
  function showGestureHint() {
    if (!gestureHint) return;
    gestureHint.classList.add("is-visible");
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      gestureHint.classList.remove("is-visible");
    }, 1300);
  }

  // Leaflet初期化
  function initMap() {
    if (!window.L || !mapElement) return;

    map = L.map("publicServicesMap", {
      scrollWheelZoom: false,
      zoomControl: true,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: 1500,
      easeLinearity: 0.25,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true
    }).setView([32.684, 130.630], 12);

    L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      attribution: '地図：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>',
      maxZoom: 18,
      minZoom: 10
    }).addTo(map);

    // マウス操作性・スクロールジェスチャー制御
    mapElement.addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.metaKey) {
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
        showGestureHint();
      }
    }, { passive: true });

    map.on("click", () => {
      map.scrollWheelZoom.enable();
    });

    mapElement.addEventListener("mouseleave", () => {
      map.scrollWheelZoom.disable();
    });

    updateMarkers();
  }

  // マーカー更新
  function updateMarkers() {
    if (!map) return;

    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const visibleItems = getFilteredFacilities();
    const bounds = [];
    const now = new Date();

    visibleItems.forEach((f) => {
      const catInfo = CATEGORIES[f.cat] || CATEGORIES.admin;
      const status = getFacilityOpenStatus(f, now);

      const customIcon = L.divIcon({
        className: "uto-map-pin-wrap",
        html: `<div class="uto-map-pin" id="pin-${f.id}" style="background:${catInfo.color}; border-color:#fff;" title="${f.name}">
          <span>${catInfo.icon}</span>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38]
      });

      const popupHtml = `
        <div class="uto-map-popup">
          <div class="popup-header-row">
            <div class="popup-badges">
              <span class="popup-cat-badge" style="background:${catInfo.bg}; color:${catInfo.color};">${catInfo.icon} ${catInfo.label}</span>
              <span class="status-badge ${status.badgeClass}">${status.text}</span>
            </div>
          </div>
          <h4 class="popup-title">${f.name}</h4>
          <div class="popup-meta-line">
            <span>📍 ${f.address}</span>
            <span class="popup-area-badge">${f.areaLabel}</span>
          </div>
          <div class="popup-meta-line">
            <span>⏰ ${f.hours}</span>
          </div>
          ${f.quickTags ? `
            <div class="popup-chips">
              ${f.quickTags.slice(0, 3).map(t => `<span class="popup-chip">${t}</span>`).join("")}
            </div>
          ` : ""}
          <div class="popup-actions">
            <button type="button" class="popup-btn-card" onclick="window.focusFacilityCard('${f.id}')">詳細カードを見る ↓</button>
            <a href="${mapsUrl(f)}" target="_blank" rel="noopener" class="popup-btn-route">現在地から行く ↗</a>
          </div>
        </div>
      `;

      const marker = L.marker([f.lat, f.lng], { icon: customIcon }).addTo(map);

      marker.bindPopup(popupHtml, {
        maxWidth: 300,
        minWidth: 240,
        autoPan: true,
        autoPanPaddingTopLeft: L.point(30, 60),
        autoPanPaddingBottomRight: L.point(30, 30),
        closeButton: true
      });

      marker.bindTooltip(f.name, {
        direction: "top",
        offset: [0, -38],
        opacity: 0.95
      });

      marker.facilityId = f.id;

      marker.on("click", () => {
        highlightCard(f.id, false);
      });

      markers.push(marker);
      bounds.push([f.lat, f.lng]);
    });

    if (bounds.length > 0 && map) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }

  // 全体表示リセット
  window.resetMapView = () => {
    if (!map) return;
    const visibleItems = getFilteredFacilities();
    if (visibleItems.length > 0) {
      const bounds = visibleItems.map(f => [f.lat, f.lng]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView([32.684, 130.630], 12);
    }
  };

  // 現在地取得と表示
  window.locateUser = () => {
    if (!navigator.geolocation) {
      alert("お使いの端末またはブラウザは位置情報に対応していません。");
      return;
    }
    const btn = document.getElementById("btnLocateUser");
    if (btn) btn.innerHTML = "<span>⏳ 測位中...</span>";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (btn) btn.innerHTML = "<span>📍 現在地</span>";
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (userLocationMarker && map) {
          map.removeLayer(userLocationMarker);
        }

        const userIcon = L.divIcon({
          className: "uto-user-location-wrap",
          html: `<div class="uto-user-location-marker"><div class="uto-user-location-pulse"></div></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        userLocationMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
        userLocationMarker.bindPopup("<b>📍 あなたの現在地</b>").openPopup();

        map.flyTo([lat, lng], 15, { duration: 1 });
      },
      () => {
        if (btn) btn.innerHTML = "<span>📍 現在地</span>";
        alert("現在地を取得できませんでした。ブラウザの位置情報の利用を許可してください。");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 全画面モード切り替え
  window.toggleMapFullscreen = () => {
    const mapSection = document.getElementById("utoMapSection");
    const btnText = document.getElementById("fullscreenBtnText");
    if (!mapSection) return;

    const isFs = mapSection.classList.toggle("is-fullscreen");
    if (btnText) {
      btnText.textContent = isFs ? "✕ もとに戻る（通常表示）" : "⛶ 全画面拡大";
    }
    if (btnFullscreen) {
      btnFullscreen.setAttribute("aria-expanded", String(isFs));
      btnFullscreen.title = isFs ? "全画面表示を終了してもとの画面に戻る（Escキー）" : "地図を全画面表示にする";
    }

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);
  };

  // フィルタリング処理
  function getFilteredFacilities() {
    const now = new Date();

    return FACILITIES.filter(f => {
      // 1. カテゴリ
      if (activeCat !== "all" && f.cat !== activeCat) return false;

      // 2. 地域・エリア
      if (activeArea !== "all" && f.area !== activeArea) return false;

      // 3. 対象者
      if (activeTarget !== "all") {
        if (!f.target.includes(activeTarget) && !f.target.includes("all")) {
          return false;
        }
      }

      // 4. 開館中のみ
      if (openNowOnly) {
        const st = getFacilityOpenStatus(f, now);
        if (!st.isOpen) return false;
      }

      // 5. 目的別クイックタグ
      if (activeQuickTag) {
        if (activeQuickTag === "childcare" && f.cat !== "child") return false;
        if (activeQuickTag === "cert" && !f.services.some(s => s.includes("住民票") || s.includes("証明") || s.includes("マイナンバー"))) return false;
        if (activeQuickTag === "library" && f.id !== "uto_library" && f.id !== "uto_civic_hall") return false;
        if (activeQuickTag === "senior" && f.cat !== "welfare" && !f.target.includes("senior")) return false;
        if (activeQuickTag === "sports" && f.cat !== "sports") return false;
        if (activeQuickTag === "weekend" && !(f.openDays && (f.openDays.includes(0) || f.openDays.includes(6)))) return false;
        if (activeQuickTag === "parking") {
          const m = f.parking.match(/(\d+)台/);
          if (!m || parseInt(m[1], 10) < 30) return false;
        }
        if (activeQuickTag === "favorite" && !favorites.has(f.id)) return false;
      }

      // 6. 検索クエリ
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          f.name,
          f.ruby,
          f.address,
          f.areaLabel,
          f.desc,
          f.targetLabel,
          ...(f.quickTags || []),
          ...f.services,
          f.note
        ].join(" ").toLowerCase();

        const words = q.split(/\s+/).filter(Boolean);
        return words.every(w => searchable.includes(w));
      }

      return true;
    });
  }

  // リアルタイム日時の表示更新
  function updateRealtimeStatus() {
    if (!realtimeInfoDisplay) return;
    const now = new Date();
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = days[now.getDay()];
    const hour = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    realtimeInfoDisplay.textContent = `判定基準：${month}月${date}日(${day}) ${hour}:${min} 現在`;
  }

  // カード一覧レンダリング
  function renderCards() {
    if (!cardsContainer) return;

    const filtered = getFilteredFacilities();
    updateRealtimeStatus();

    if (countDisplay) {
      countDisplay.textContent = `表示中：${filtered.length}施設 / 全${FACILITIES.length}施設`;
    }

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div class="uto-empty-state">
          <p class="empty-icon">🔍</p>
          <h3>条件に一致する公的施設が見つかりませんでした</h3>
          <p>別のキーワードを入力するか、絞り込みフィルターを「すべて表示」に戻してお試しください。</p>
          <button type="button" class="empty-reset-btn" onclick="window.resetAllFilters()">絞り込み条件をリセット</button>
        </div>
      `;
      return;
    }

    const now = new Date();

    cardsContainer.innerHTML = filtered.map((f, idx) => {
      const catInfo = CATEGORIES[f.cat] || CATEGORIES.admin;
      const phoneDigits = f.phone.replace(/[^0-9]/g, "");
      const isFav = favorites.has(f.id);
      const status = getFacilityOpenStatus(f, now);

      return `
        <article class="uto-service-card" id="card-${f.id}" data-id="${f.id}" data-cat="${f.cat}">
          <header class="service-card-header">
            <div class="service-card-meta-top">
              <div class="service-card-badges">
                <span class="service-badge-cat" style="background:${catInfo.bg}; color:${catInfo.color};">
                  ${catInfo.icon} ${catInfo.label}
                </span>
                <span class="service-badge-area">📍 ${f.areaLabel}</span>
                <span class="status-badge ${status.badgeClass}">${status.text}</span>
              </div>
              <button type="button" class="btn-card-fav ${isFav ? 'is-fav' : ''}" onclick="window.toggleFavorite('${f.id}', event)" title="お気に入り登録">
                <span>${isFav ? '⭐ 保存済み' : '☆ お気に入り'}</span>
              </button>
            </div>

            <div class="service-card-title-row">
              <span class="service-card-num">${idx + 1}</span>
              <div>
                <ruby class="service-card-ruby">${f.name}<rt>${f.ruby}</rt></ruby>
                <h3 class="service-card-title">${f.name}</h3>
              </div>
            </div>

            ${f.quickTags ? `
              <div class="card-service-chips">
                ${f.quickTags.map(tag => `<span class="card-chip">${tag}</span>`).join("")}
              </div>
            ` : ""}

            <p class="service-card-desc">${f.desc}</p>
          </header>

          <div class="service-card-body">
            <div class="service-card-services-box">
              <h4 class="services-box-heading">
                <span class="heading-icon">📋</span>
                <span>この施設で受けられる公的サービス・手続き</span>
              </h4>
              <ul class="services-list">
                ${f.services.map(s => `<li>${s}</li>`).join("")}
              </ul>
            </div>

            <dl class="service-card-meta-grid">
              <div class="meta-item">
                <dt>📍 所在地</dt>
                <dd>${f.address}</dd>
              </div>
              <div class="meta-item">
                <dt>⏰ 開庁・開館日時</dt>
                <dd>${f.hours}</dd>
              </div>
              <div class="meta-item">
                <dt>🗓️ 休館・閉庁日</dt>
                <dd>${f.closed}</dd>
              </div>
              <div class="meta-item">
                <dt>💴 利用料金・費用</dt>
                <dd>${f.isFree ? '<span style="color:#16a34a; font-weight:700;">🟢 無料</span>' : ''} ${f.fee}</dd>
              </div>
              <div class="meta-item">
                <dt>🚗 駐車場</dt>
                <dd>${f.parking}</dd>
              </div>
              <div class="meta-item">
                <dt>📞 お問い合わせ</dt>
                <dd>
                  <a class="phone-link" href="tel:${phoneDigits}">${f.phone}</a>
                  <span class="phone-dept">（${f.phoneDept}）</span>
                </dd>
              </div>
            </dl>

            ${f.note ? `<p class="service-card-note">💡 <b>利用のポイント：</b>${f.note}</p>` : ""}
          </div>

          <footer class="service-card-footer">
            <button type="button" class="btn-focus-map" onclick="window.zoomToFacility('${f.id}')">
              <span>🗺️ 地図で場所を確認</span>
            </button>
            <a href="${mapsUrl(f)}" target="_blank" rel="noopener" class="btn-route-map">
              <span>🚗 現在地から行く（Googleマップ） ↗</span>
            </a>
            ${f.url ? `<a href="${f.url}" target="_blank" rel="noopener" class="btn-official-link">${f.urlLabel}</a>` : ""}
          </footer>
        </article>
      `;
    }).join("");
  }

  // コンパクト一覧表レンダリング
  function renderTable() {
    if (!tableContainer) return;

    const filtered = getFilteredFacilities();
    if (filtered.length === 0) {
      tableContainer.innerHTML = `<p style="padding:20px; text-align:center; color:#64748b;">条件に一致する公的施設がありません。</p>`;
      return;
    }

    const now = new Date();

    tableContainer.innerHTML = `
      <div class="table-scroll-hint">👆 左右にスワイプして全項目を確認できます</div>
      <table class="uto-compact-table">
        <thead>
          <tr>
            <th class="col-num">No.</th>
            <th class="col-facility">施設名・地域</th>
            <th class="col-cat">分野</th>
            <th class="col-status">開館状況</th>
            <th class="col-hours">開庁・開館日時</th>
            <th class="col-parking">駐車場</th>
            <th class="col-phone">電話番号</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((f, idx) => {
            const catInfo = CATEGORIES[f.cat] || CATEGORIES.admin;
            const phoneDigits = f.phone.replace(/[^0-9]/g, "");
            const status = getFacilityOpenStatus(f, now);

            return `
              <tr>
                <td class="col-num"><b>${idx + 1}</b></td>
                <td class="col-facility table-facility-name">
                  <b>${f.name}</b>
                  <small>📍 ${f.areaLabel}</small>
                </td>
                <td class="col-cat">
                  <span class="service-badge-cat" style="background:${catInfo.bg}; color:${catInfo.color};">
                    ${catInfo.icon} ${catInfo.label}
                  </span>
                </td>
                <td class="col-status">
                  <span class="status-badge ${status.badgeClass}">${status.text}</span>
                </td>
                <td class="col-hours">
                  <div class="table-hours-time">${f.hours}</div>
                  <div class="table-hours-closed">休：${f.closed}</div>
                </td>
                <td class="col-parking">${f.parking}</td>
                <td class="col-phone">
                  <a class="phone-link" href="tel:${phoneDigits}">📞 ${f.phone}</a>
                </td>
                <td class="col-actions">
                  <div class="table-actions">
                    <button type="button" class="table-btn table-btn-map" onclick="window.zoomToFacility('${f.id}')">🗺️ 地図</button>
                    <a href="${mapsUrl(f)}" target="_blank" rel="noopener" class="table-btn table-btn-route">🚗 経路 ↗</a>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  // 表示モード切り替え
  function setViewMode(mode) {
    currentViewMode = mode;
    if (btnViewCards) btnViewCards.classList.toggle("active", mode === "cards");
    if (btnViewTable) btnViewTable.classList.toggle("active", mode === "table");

    if (cardsContainer) cardsContainer.style.display = mode === "cards" ? "flex" : "none";
    if (tableContainer) tableContainer.style.display = mode === "table" ? "block" : "none";

    if (mode === "cards") renderCards();
    else renderTable();
  }

  // カードハイライト＆スクロール
  function highlightCard(id, shouldScroll = true) {
    document.querySelectorAll(".uto-service-card").forEach(c => c.classList.remove("highlighted"));
    const targetCard = document.getElementById(`card-${id}`);
    if (targetCard) {
      targetCard.classList.add("highlighted");
      if (shouldScroll) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "start" });
        targetCard.setAttribute("tabindex", "-1");
        targetCard.focus({ preventScroll: true });
      }
    }
  }

  // 地図ズーム＆ポップアップ表示
  window.zoomToFacility = (id) => {
    const f = FACILITIES.find(item => item.id === id);
    if (!f || !map) return;

    const mapSection = document.getElementById("utoMapSection");
    if (mapSection && !mapSection.classList.contains("is-fullscreen")) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const zoomLevel = 16;
    const targetPoint = map.project([f.lat, f.lng], zoomLevel);
    const offsetPoint = L.point(targetPoint.x, targetPoint.y - 95);
    const offsetLatLng = map.unproject(offsetPoint, zoomLevel);

    map.flyTo(offsetLatLng, zoomLevel, {
      duration: 0.8,
      easeLinearity: 0.25
    });

    setTimeout(() => {
      const targetMarker = markers.find(m => m.facilityId === id);
      if (targetMarker) {
        targetMarker.openPopup();
      }
    }, 450);

    highlightCard(id, false);
  };

  // カードへフォーカス＆確実に移動
  window.focusFacilityCard = (id) => {
    const mapSection = document.getElementById("utoMapSection");
    const isFs = mapSection && mapSection.classList.contains("is-fullscreen");

    // 1. 全画面モード中なら通常表示に戻す
    if (isFs) {
      window.toggleMapFullscreen();
    }

    // 2. 表示モードがカード形式でなければカード形式に切り替える
    if (currentViewMode !== "cards") {
      setViewMode("cards");
    }

    // 3. 対象カードが現在のフィルターで非表示になっていないか確認
    let targetCard = document.getElementById(`card-${id}`);
    if (!targetCard) {
      // フィルターによって非表示になっている場合は全件表示にリセット
      window.resetAllFilters();
    }

    // 4. 全画面解除やDOMレイアウト再計算の完了を待ってスクロール＆ハイライト
    const delay = isFs ? 280 : 50;
    setTimeout(() => {
      highlightCard(id, true);
    }, delay);
  };

  // フィルターリセット
  window.resetAllFilters = () => {
    activeCat = "all";
    activeTarget = "all";
    activeArea = "all";
    activeQuickTag = null;
    openNowOnly = false;
    searchQuery = "";

    if (searchInput) searchInput.value = "";
    if (openNowCheckbox) openNowCheckbox.checked = false;

    if (catFilterContainer) {
      catFilterContainer.querySelectorAll("button").forEach(b => {
        b.classList.toggle("active", b.dataset.cat === "all");
      });
    }
    if (targetFilterContainer) {
      targetFilterContainer.querySelectorAll("button").forEach(b => {
        b.classList.toggle("active", b.dataset.target === "all");
      });
    }
    if (areaFilterContainer) {
      areaFilterContainer.querySelectorAll("button").forEach(b => {
        b.classList.toggle("active", b.dataset.area === "all");
      });
    }
    if (quickTagsContainer) {
      quickTagsContainer.querySelectorAll("button").forEach(b => {
        b.classList.remove("active");
      });
    }

    renderCards();
    renderTable();
    updateMarkers();
  };

  // イベントリスナー設定
  function setupEvents() {
    // クイックタグボタン
    if (quickTagsContainer) {
      quickTagsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-tag]");
        if (!btn) return;
        const tag = btn.dataset.tag;

        if (activeQuickTag === tag) {
          activeQuickTag = null;
          btn.classList.remove("active");
        } else {
          quickTagsContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          activeQuickTag = tag;
        }

        renderCards();
        renderTable();
        updateMarkers();
      });
    }

    // 地域・エリアボタン
    if (areaFilterContainer) {
      areaFilterContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-area]");
        if (!btn) return;
        areaFilterContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeArea = btn.dataset.area;
        renderCards();
        renderTable();
        updateMarkers();
      });
    }

    // カテゴリボタン
    if (catFilterContainer) {
      catFilterContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-cat]");
        if (!btn) return;
        catFilterContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCat = btn.dataset.cat;
        renderCards();
        renderTable();
        updateMarkers();
      });
    }

    // 対象者ボタン
    if (targetFilterContainer) {
      targetFilterContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-target]");
        if (!btn) return;
        targetFilterContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeTarget = btn.dataset.target;
        renderCards();
        renderTable();
        updateMarkers();
      });
    }

    // 開館中トグル
    if (openNowCheckbox) {
      openNowCheckbox.addEventListener("change", (e) => {
        openNowOnly = e.target.checked;
        renderCards();
        renderTable();
        updateMarkers();
      });
    }

    // 検索入力
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        renderCards();
        renderTable();
        updateMarkers();
      });
    }

    // 表示切り替えボタン
    if (btnViewCards) {
      btnViewCards.addEventListener("click", () => setViewMode("cards"));
    }
    if (btnViewTable) {
      btnViewTable.addEventListener("click", () => setViewMode("table"));
    }

    // リセットボタン
    if (resetBtn) {
      resetBtn.addEventListener("click", window.resetAllFilters);
    }

    // 地図操作ツールバーボタン
    if (btnResetMap) {
      btnResetMap.addEventListener("click", window.resetMapView);
    }
    if (btnLocate) {
      btnLocate.addEventListener("click", window.locateUser);
    }
    if (btnFullscreen) {
      btnFullscreen.addEventListener("click", window.toggleMapFullscreen);
    }
    if (btnExitFsFloating) {
      btnExitFsFloating.addEventListener("click", window.toggleMapFullscreen);
    }

    // Escキーで全画面解除
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const mapSection = document.getElementById("utoMapSection");
        if (mapSection && mapSection.classList.contains("is-fullscreen")) {
          window.toggleMapFullscreen();
        }
      }
    });
  }

  // 初期化実行
  document.addEventListener("DOMContentLoaded", () => {
    updateFavCount();
    setupEvents();
    renderCards();
    renderTable();
    initMap();
  });
})();
