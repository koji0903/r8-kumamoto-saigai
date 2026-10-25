/**
 * 八代市 公的施設・市民サービス マップ＆総合ガイド
 * 八代市公式データ・公共施設データに基づく主要26施設の詳細情報とインタラクティブ機能
 */
(() => {
  const CATEGORIES = {
    admin: { label: "行政窓口", color: "#1d4ed8", bg: "#eff6ff", icon: "🏛️" },
    child: { label: "子育て・母子", color: "#ea580c", bg: "#fff7ed", icon: "👶" },
    health: { label: "健康・保健", color: "#16a34a", bg: "#f0fdf4", icon: "🏥" },
    welfare: { label: "福祉・シニア", color: "#9333ea", bg: "#faf5ff", icon: "🤝" },
    culture: { label: "文化・生涯学習", color: "#0d9488", bg: "#f0fdfa", icon: "📚" },
    sports: { label: "スポーツ・運動", color: "#e11d48", bg: "#fff1f2", icon: "⚽" },
    safety: { label: "防災・消防", color: "#d97706", bg: "#fffbeb", icon: "🚒" }
  };

  const AREAS = {
    central: "中心部（市役所本庁・八代城跡・緑町周辺）",
    kagami: "鏡地区（鏡支所・文政・有佐周辺）",
    sencho: "千丁地区（千丁支所・新牟田周辺）",
    sakamoto: "坂本地区（坂本支所・球磨川上流）",
    toyo: "東陽地区（東陽支所・石橋の里）",
    izumi: "泉地区（泉支所・五家荘方面）"
  };

  function getRawHoliday(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const vernalEquinoxDay = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
    const autumnEquinoxDay = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));

    const getNthMonday = (m, n) => {
      const firstDay = new Date(year, m - 1, 1).getDay();
      const firstMonday = (firstDay <= 1) ? (1 + (1 - firstDay)) : (1 + (8 - firstDay));
      return firstMonday + (n - 1) * 7;
    };

    if (month === 1) {
      if (day === 1) return "元日";
      if (day === getNthMonday(1, 2)) return "成人の日";
    } else if (month === 2) {
      if (day === 11) return "建国記念の日";
      if (day === 23) return "天皇誕生日";
    } else if (month === 3) {
      if (day === vernalEquinoxDay) return "春分の日";
    } else if (month === 4) {
      if (day === 29) return "昭和の日";
    } else if (month === 5) {
      if (day === 3) return "憲法記念日";
      if (day === 4) return "みどりの日";
      if (day === 5) return "こどもの日";
    } else if (month === 7) {
      if (day === getNthMonday(7, 3)) return "海の日";
    } else if (month === 8) {
      if (day === 11) return "山の日";
    } else if (month === 9) {
      const respectDay = getNthMonday(9, 3);
      if (day === respectDay) return "敬老の日";
      if (day === autumnEquinoxDay) return "秋分の日";
      if (autumnEquinoxDay - respectDay === 2 && day === respectDay + 1) return "国民の休日";
    } else if (month === 10) {
      if (day === getNthMonday(10, 2)) return "スポーツの日";
    } else if (month === 11) {
      if (day === 3) return "文化の日";
      if (day === 23) return "勤労感謝の日";
    }
    return null;
  }

  function getJapaneseHoliday(date) {
    const raw = getRawHoliday(date);
    if (raw) return raw;

    const dayOfWeek = date.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 3) {
      let checkDate = new Date(date);
      checkDate.setDate(date.getDate() - 1);
      while (checkDate.getDay() !== 6) {
        if (checkDate.getDay() === 0) {
          if (getRawHoliday(checkDate)) return "振替休日";
          break;
        }
        if (!getRawHoliday(checkDate)) break;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    return null;
  }

  const FACILITIES = [
    // 1. 行政窓口
    {
      id: "yatsushiro_city_hall",
      name: "八代市役所（本庁舎）",
      ruby: "やつしろしやくしょ ほんちょうしゃ",
      cat: "admin",
      area: "central",
      areaLabel: "中心部（松江城町）",
      target: ["all"],
      targetLabel: "全市民・市外転入者・事業者",
      address: "八代市松江城町1-25",
      lat: 32.508512,
      lng: 130.601523,
      hours: "平日 8:30〜17:15（毎週木曜窓口延長 19:00まで）",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#総合窓口", "#証明書交付", "#マイナンバー", "#被災者支援窓口"],
      fee: "窓口相談無料（証明発行所定手数料）",
      parking: "あり（市役所来庁者駐車場 約200台・無料）",
      phone: "0965-33-4111",
      phoneDept: "代表電話（各課おつなぎ）",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "八代市公式：庁舎・各課案内 ↗",
      desc: "八代市の行政中枢拠点。市民課・福祉・税務・子育て・住宅再建窓口が集約されています。",
      services: [
        "住民票・戸籍・印鑑証明・マイナンバーカードの交付・手続き",
        "転出入・婚姻・出生・死亡などの戸籍届出",
        "国民健康保険・年金・後期高齢者医療窓口",
        "被災者支援ワンストップセンター（生活再建支援金・災害援護資金・住宅応急修理・井戸公費修理等）",
        "市民税・固定資産税・軽自動車税の申告・納税相談・減免申請",
        "子育て支援金・児童手当・保育所入所申請・生活保護相談"
      ],
      note: "木曜夜間窓口延長（一部窓口）。1階に総合案内、エレベーター・授乳室完備。"
    },
    {
      id: "yatsushiro_kagami_branch",
      name: "八代市 鏡支所",
      ruby: "やつしろし かがみししょ",
      cat: "admin",
      area: "kagami",
      areaLabel: "鏡地区（鏡町内田）",
      target: ["all", "senior"],
      targetLabel: "鏡地区住民・全市民",
      address: "八代市鏡町内田453-1",
      lat: 32.553212,
      lng: 130.686523,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#証明窓口", "#鏡地区", "#北部行政拠点", "#情報共有会議会場"],
      fee: "窓口相談無料",
      parking: "あり（鏡支所駐車場 無料）",
      phone: "0965-52-1111",
      phoneDept: "鏡支所 地域振興課",
      url: "https://www.city.yatsushiro.lg.jp/soshiki/38/",
      urlLabel: "八代市公式：鏡支所案内 ↗",
      desc: "北部（鏡・文政・有佐地域）の行政中核拠点。証明書発行や生活再建手続きに対応します。",
      services: [
        "住民票・戸籍・印鑑証明・税関係証明の発行",
        "転出入・国民健康保険・国民年金手続き受付",
        "高齢者福祉・介護保険・被災者支援相談の取次"
      ],
      note: "2階会議室は毎週水曜日に「八代市域情報共有会議」の会場としても活用されています。"
    },
    {
      id: "yatsushiro_sencho_branch",
      name: "八代市 千丁支所",
      ruby: "やつしろし せんちょうししょ",
      cat: "admin",
      area: "sencho",
      areaLabel: "千丁地区（新牟田）",
      target: ["all"],
      targetLabel: "千丁地区住民・全市民",
      address: "八代市千丁町新牟田1433",
      lat: 32.535812,
      lng: 130.638923,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#千丁支所", "#証明書窓口", "#い草の里"],
      fee: "窓口相談無料",
      parking: "あり（無料）",
      phone: "0965-46-1111",
      phoneDept: "千丁支所",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "千丁支所案内 ↗",
      desc: "千丁地区の公的行政窓口。各種証明書の発行や市民生活の届出受付を行います。",
      services: [
        "住民票・戸籍・印鑑証明の発行",
        "国保・年金・税務関係の届出受付"
      ],
      note: "千丁公民館や体育館が隣接しています。"
    },
    {
      id: "yatsushiro_sakamoto_branch",
      name: "八代市 坂本支所",
      ruby: "やつしろし さかもとししょ",
      cat: "admin",
      area: "sakamoto",
      areaLabel: "坂本地区（球磨川沿い）",
      target: ["all", "senior"],
      targetLabel: "坂本地区住民・全市民",
      address: "八代市坂本町坂本522-3",
      lat: 32.428512,
      lng: 130.645123,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#坂本支所", "#中山間地域", "#復興支援窓口"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0965-45-2211",
      phoneDept: "坂本支所",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "坂本支所案内 ↗",
      desc: "球磨川沿いの中山間地域・坂本地区の行政・生活再建・福祉拠点です。",
      services: [
        "住民票・各種証明書交付",
        "被災者生活再建・土砂災害復旧相談受付",
        "地域包括・高齢者見守り相談窓口"
      ],
      note: "令和2年7月豪雨および熊本地震からの生活再建を支える重要拠点です。"
    },

    // 2. 子育て・母子
    {
      id: "yatsushiro_kosodate_plaza",
      name: "八代市 子育て支援総合センター",
      ruby: "やつしろし こそだてしえんそうごうせんたー",
      cat: "child",
      area: "central",
      areaLabel: "中心部（本町商店街周辺）",
      target: ["child", "parent"],
      targetLabel: "妊産婦・乳幼児と保護者",
      address: "八代市本町1丁目10-38",
      lat: 32.503512,
      lng: 130.602823,
      hours: "火曜〜日曜 9:00〜17:00",
      closed: "月曜日・祝日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "17:00",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#子育て支援", "#プレイルーム", "#育児相談", "#土日開館", "#絵本読書"],
      fee: "利用無料",
      parking: "あり（本町駐車場等利用補助あり）",
      phone: "0965-30-7310",
      phoneDept: "子育て総合センター直通",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "子育て支援総合センター案内 ↗",
      desc: "大型遊具や絵本を備え、親子が自由に遊んで交流できる地域最大の子育て拠点です。",
      services: [
        "屋内プレイルームの無料開放（大型すべり台・ボールプール・木製玩具）",
        "保育士・保健師による子育て相談・発育測定",
        "子育てサークル活動・離乳食講座・親子ふれあいイベント"
      ],
      note: "商店街中心部にあり買い物や通院の合間にも立ち寄れます。"
    },

    // 3. 健康・保健
    {
      id: "yatsushiro_health_center",
      name: "八代市 保健センター",
      ruby: "やつしろし ほけんせんたー",
      cat: "health",
      area: "central",
      areaLabel: "中心部（松江城町）",
      target: ["all", "child", "senior"],
      targetLabel: "全市民・乳幼児健診対象者・成人・シニア",
      address: "八代市松江城町1-25 市役所本庁舎内",
      lat: 32.508512,
      lng: 130.601523,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#乳幼児健診", "#母子手帳", "#がん検診", "#予防接種"],
      fee: "相談無料（検診等は所定公費負担あり）",
      parking: "あり（市役所駐車場利用・無料）",
      phone: "0965-32-7200",
      phoneDept: "健康推進課",
      url: "https://www.city.yatsushiro.lg.jp/soshiki/19/",
      urlLabel: "八代市公式：健康推進案内 ↗",
      desc: "市民の健康寿命延伸と母子保健・生活習慣病予防・予防接種を一元管理する中枢です。",
      services: [
        "乳幼児健診（4か月・10か月・1歳6か月・3歳児健診）",
        "特定健康診査・各種がん検診・胃カメラ・大腸がん検診",
        "母子健康手帳交付・プレママ面談・妊婦相談",
        "こころのケア健康相談・車中泊避難者健康フォロー"
      ],
      note: "新庁舎内にあり、最新の健診設備とバリアフリーを完備。"
    },

    // 4. 福祉・シニア
    {
      id: "yatsushiro_fukushi_center",
      name: "八代市 総合福祉センター・社会福祉協議会",
      ruby: "やつしろし そうごうふくしせんたー",
      cat: "welfare",
      area: "central",
      areaLabel: "中心部（松江城町）",
      target: ["all", "senior"],
      targetLabel: "生活困窮者・高齢者・障がい者・ボランティア",
      address: "八代市松江城町1-25",
      lat: 32.508512,
      lng: 130.601523,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#社協事務局", "#生活福祉資金", "#車いす無料貸出", "#ボランティア"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0965-32-6011",
      phoneDept: "八代市社協 代表窓口",
      url: "https://www.yatsushiro-shakyo.jp/",
      urlLabel: "八代市社会福祉協議会 公式サイト ↗",
      desc: "八代市全体の地域福祉の拠点。生活困窮自立相談や車いす貸出、ボランティア運営を担当。",
      services: [
        "生活困窮者自立支援制度相談窓口（くらし・しごと相談）",
        "福祉用具・車いすの一時無料貸出",
        "緊急小口資金・生活福祉資金の貸付相談・申請受付",
        "八代市災害ボランティアセンター運営（被災家屋片付け等）"
      ],
      note: "本庁舎敷地内に所在。生活の困りごとを幅広く受け止めます。"
    },
    {
      id: "yatsushiro_sasaeai_center",
      name: "八代市 地域支え合いセンター",
      ruby: "やつしろし ちいきささえあいせんたー",
      cat: "welfare",
      area: "central",
      areaLabel: "中心部（松江城町）",
      target: ["all", "senior"],
      targetLabel: "被災高齢者・孤立不安世帯・仮設入居者",
      address: "八代市松江城町1-25",
      lat: 32.508512,
      lng: 130.601523,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#10月15日開所", "#支え合いセンター", "#戸別訪問", "#生活再建見守り"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0965-33-4111",
      phoneDept: "支え合いセンター直通",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "八代市公式：支え合い支援 ↗",
      desc: "令和8年10月15日に開所。仮設住宅や在宅被災者への戸別訪問、生活課題の把握と見守り拠点。",
      services: [
        "建設型仮設・みなし仮設入居世帯への巡回訪問・安否確認",
        "高齢者・要配慮世帯への生活再建伴走・健康介護相談",
        "仮設団地でのサロン活動・コミュニティ支援・生協移動販売連携"
      ],
      note: "社協・支援団体と連携し、被災者の孤立防止と生活再建を支えています。"
    },

    // 5. 文化・生涯学習・図書館
    {
      id: "yatsushiro_library",
      name: "八代市立図書館 本館",
      ruby: "やつしろしりつとしょかん ほんかん",
      cat: "culture",
      area: "central",
      areaLabel: "中心部（西松江城町）",
      target: ["all"],
      targetLabel: "全市民・市外読書愛好者・児童学生",
      address: "八代市西松江城町1-47",
      lat: 32.506512,
      lng: 130.598523,
      hours: "火曜〜日曜 9:00〜19:00（土日は17:00まで）",
      closed: "月曜日・祝日・年末年始・館内整理日",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "19:00",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#市立図書館", "#閲覧学習席", "#児童図書", "#無料Wi-Fi", "#八代城跡前"],
      fee: "無料",
      parking: "あり（約80台・無料）",
      phone: "0965-32-3385",
      phoneDept: "図書館事務室",
      url: "https://www.city.yatsushiro.lg.jp/library/",
      urlLabel: "八代市立図書館 公式 ↗",
      desc: "豊富な蔵書と落ち着いた学習環境を備えた中央図書館。八代城跡の緑豊かな環境に位置。",
      services: [
        "一般書・専門書・郷土資料・雑誌の閲覧・貸出・予約",
        "こども図書館コーナー（絵本読み聞かせ・紙芝居）",
        "学習閲覧席・インターネット検索コーナー利用"
      ],
      note: "八代城跡公園のすぐ西側に位置しています。"
    },
    {
      id: "yatsushiro_hall",
      name: "桜十字ホール八代（八代市厚生会館）",
      ruby: "さくらじゅうじほーるやつしろ",
      cat: "culture",
      area: "central",
      areaLabel: "中心部（新町）",
      target: ["all"],
      targetLabel: "市民・文化公演利用者",
      address: "八代市新町5-20",
      lat: 32.505212,
      lng: 130.605123,
      hours: "9:00〜22:00",
      closed: "火曜日（祝日の場合は翌平日）・年末年始",
      openDays: [0, 1, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      holidayRule: "transfer_if_monday",
      isFree: false,
      quickTags: ["#大ホール", "#市民会館", "#コンサート", "#展示室"],
      fee: "施設利用所定料金",
      parking: "あり（約120台・無料）",
      phone: "0965-33-3111",
      phoneDept: "ホール管理室",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "桜十字ホール八代案内 ↗",
      desc: "大規模コンサートや演劇、市民発表会が開催できる市内最大の文化ホール施設です。",
      services: [
        "大ホール（1,300席規模）での音楽・演劇公演",
        "大会議室・練習室・和室の貸出利用"
      ],
      note: "新町中心部に位置し、商店街からも徒歩圏内。"
    },

    // 6. スポーツ・運動
    {
      id: "yatsushiro_toyooka_arena",
      name: "八代トヨオカ地建アリーナ（八代市総合体育館）",
      ruby: "やつしろとよおかちけんありーな",
      cat: "sports",
      area: "central",
      areaLabel: "中心部（緑町）",
      target: ["all"],
      targetLabel: "スポーツ利用者・市民・避難者",
      address: "八代市緑町11-1",
      lat: 32.518512,
      lng: 130.593523,
      hours: "8:30〜22:00",
      closed: "第2・第4月曜日・年末年始",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "08:30",
      closeTime: "22:00",
      holidayRule: "transfer_if_monday",
      isFree: false,
      quickTags: ["#大アリーナ", "#トレーニングジム", "#総合体育館", "#主要避難所"],
      fee: "個人利用低額（トレーニングジム・一般競技）・専用貸出所定",
      parking: "あり（約300台・無料）",
      phone: "0965-35-0150",
      phoneDept: "体育館管理事務所",
      url: "https://www.city.yatsushiro.lg.jp/kiji00325492/index.html",
      urlLabel: "トヨオカ地建アリーナ案内 ↗",
      desc: "大アリーナ・中アリーナ・武道場・トレーニングジムを備える県南最大のスポーツ複合施設。",
      services: [
        "バスケット・バレー・バドミントン・卓球等の競技利用",
        "充実した器具を備えたトレーニングジム（個人利用）",
        "災害時の大規模中核避難所（大アリーナ集約運営拠点）"
      ],
      note: "熊本地震では修繕完了の大アリーナに避難所が集約され、YMCA等による生活支援体制が整備。"
    },

    // 7. 防災・安全・ライフライン
    {
      id: "yatsushiro_police",
      name: "八代警察署",
      ruby: "やつしろけいさつしょ",
      cat: "safety",
      area: "central",
      areaLabel: "中心部（松江城町）",
      target: ["all"],
      targetLabel: "全市民・運転免許更新者・相談者",
      address: "八代市松江城町10-18",
      lat: 32.509812,
      lng: 130.603523,
      hours: "平日 8:30〜17:15（事件事故24時間対応）",
      closed: "土日祝休（緊急受付24時間）",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#警察署", "#免許更新", "#24時間緊急通報", "#交通安全"],
      fee: "相談無料（各種免許手数料所定料金）",
      parking: "あり（無料）",
      phone: "0965-33-0110",
      phoneDept: "代表窓口（緊急は110番）",
      url: "https://www.pref.kumamoto.jp/site/police/",
      urlLabel: "熊本県警察：八代警察署案内 ↗",
      desc: "八代市全域の治安と交通安全を守る警察署。運転免許更新や防犯相談窓口。",
      services: [
        "運転免許更新・記載事項変更・高齢者免許返納",
        "車庫証明・道路使用許可申請受付",
        "落とし物届出・防犯相談・パトロール"
      ],
      note: "市役所本庁舎のすぐ北東に位置。"
    },
    {
      id: "yatsushiro_fire_dept",
      name: "八代広域消防本部・八代消防署",
      ruby: "やつしろこういきしょうぼうほんぶ",
      cat: "safety",
      area: "central",
      areaLabel: "中心部（大村町）",
      target: ["all"],
      targetLabel: "市民・事業者・救急出動通報",
      address: "八代市大村町970",
      lat: 32.515212,
      lng: 130.622523,
      hours: "窓口 平日 8:30〜17:15（救急・消火24時間出動）",
      closed: "窓口土日祝休（119番年中無休）",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#119番出動", "#救急車", "#救命講習", "#消防指導"],
      fee: "無料",
      parking: "あり（無料）",
      phone: "0965-32-5211",
      phoneDept: "消防本部総務課（緊急は119番）",
      url: "http://www.yatsushiro-fd.jp/",
      urlLabel: "八代広域消防本部 公式 ↗",
      desc: "八代市・氷川町の消防・救急・人命救助を統括する防災司令拠点です。",
      services: [
        "24時間体制での火災出動・救急救命・水難救助活動",
        "普通救命講習会・AED取扱講習・防火管理指導"
      ],
      note: "火事・急病時の緊急通報は「119」へ。"
    },
    {
      id: "yatsushiro_water_dept",
      name: "八代市 上下水道局",
      ruby: "やつしろし じょうげすいどうきょく",
      cat: "admin",
      area: "central",
      areaLabel: "中心部（緑町）",
      target: ["all"],
      targetLabel: "市民・転入者・水道井戸使用者",
      address: "八代市緑町1-1",
      lat: 32.517512,
      lng: 130.596523,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#水道開始中止", "#水道料金", "#井戸公費修理相談", "#漏水通報"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0965-32-4114",
      phoneDept: "お客様センター",
      url: "https://www.city.yatsushiro.lg.jp/water/",
      urlLabel: "八代市上下水道局 公式 ↗",
      desc: "上水道の給水管理および下水道処理を担当。井戸の公費修理相談窓口とも連携。",
      services: [
        "水道使用開始（開栓）・中止（閉栓）の手続き",
        "水道料金の口座振替・納付相談・減免窓口",
        "被災井戸の応急修理制度・要配慮世帯個別給水連携案内"
      ],
      note: "トヨオカアリーナのすぐ近くにあります。"
    },
    {
      id: "yatsushiro_ecoclean",
      name: "八代市 エコクリーンセンター（ごみ処理施設）",
      ruby: "やつしろし えこくりーんせんたー",
      cat: "safety",
      area: "central",
      areaLabel: "南部湾岸（水島町）",
      target: ["all"],
      targetLabel: "市民・事業者・ごみ搬入者",
      address: "八代市水島町2507",
      lat: 32.485212,
      lng: 130.575523,
      hours: "平日・土曜 8:30〜16:30",
      closed: "日曜日・年末年始",
      openDays: [1, 2, 3, 4, 5, 6],
      openTime: "08:30",
      closeTime: "16:30",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#ごみ自己搬入", "#粗大ごみ受入", "#土曜開場", "#災害ごみ搬入"],
      fee: "重量制手数料（被災廃棄物は免除手続あり）",
      parking: "あり（計量レーン完備）",
      phone: "0965-37-1234",
      phoneDept: "クリーンセンター管理棟",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "八代市公式：ごみ搬入案内 ↗",
      desc: "八代市の燃えるごみ・燃えないごみ・粗大ごみの自己搬入を受け付ける清掃工場。",
      services: [
        "一般家庭ごみ・引越しごみ・粗大ごみの自己搬入計量受付",
        "災害廃棄物・損壊家財の分別搬入受付"
      ],
      note: "土曜日も受入実施。事前に分別して搬入してください。"
    },
    {
      id: "yatsushiro_toyo_branch",
      name: "八代市 東陽支所",
      ruby: "やつしろし とうようししょ",
      cat: "admin",
      area: "toyo",
      areaLabel: "東陽地区",
      target: ["general", "senior", "parent"],
      address: "八代市東陽町南3415",
      lat: 32.5478,
      lng: 130.6865,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#東陽支所", "#総合窓口", "#証明書発行", "#中山間地域支援"],
      fee: "住民票等手数料（被災者減免あり）",
      parking: "あり（無料 30台）",
      phone: "0965-65-2111",
      phoneDept: "地域振興課",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "八代市公式：東陽支所案内 ↗",
      desc: "東陽地区の行政窓口。戸籍・住民票・税証明の発行や各種福祉・支援申請の取次ぎを行っています。",
      services: [
        "戸籍・住民票・印鑑証明・所得課税証明の発行",
        "国民健康保険・年金・介護保険の申請受付",
        "被災者生活再建支援制度・各種支援金・給付金の取次窓口",
        "地域コミュニティ・生活交通・中山間地域生活相談"
      ],
      note: "平日8:30〜17:15開庁。駐車場完備。"
    },
    {
      id: "yatsushiro_izumi_branch",
      name: "八代市 泉支所",
      ruby: "やつしろし いずみししょ",
      cat: "admin",
      area: "izumi",
      areaLabel: "泉地区",
      target: ["general", "senior", "parent"],
      address: "八代市泉町柿迫3131",
      lat: 32.5512,
      lng: 130.7320,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#泉支所", "#総合窓口", "#証明書発行", "#山間地域支援"],
      fee: "住民票等手数料（被災者減免あり）",
      parking: "あり（無料 25台）",
      phone: "0965-67-2111",
      phoneDept: "地域振興課",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "八代市公式：泉支所案内 ↗",
      desc: "泉地区の行政拠点。各種証明書交付、福祉申請、生活支援・道路インフラ等の相談を受付。",
      services: [
        "戸籍謄本・抄本、住民票、印鑑証明書の交付",
        "市税納付・納税証明・固定資産税関係申請",
        "高齢者・障がい者福祉サービス・介護保険相談受付",
        "災害関連支援・被災相談の総合受付・取次"
      ],
      note: "山間部にお住まいの方の最寄り行政窓口です。"
    },
    {
      id: "yatsushiro_hinagu_office",
      name: "八代市役所 日奈久出張所",
      ruby: "やつしろしやくしょ ひなぐしゅっちょうしょ",
      cat: "admin",
      area: "central",
      areaLabel: "中心部（日奈久）",
      target: ["general", "senior"],
      address: "八代市日奈久中西町507-1",
      lat: 32.4362,
      lng: 130.5731,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#日奈久出張所", "#証明書交付", "#温泉街窓口"],
      fee: "各種証明手数料",
      parking: "あり（無料 10台）",
      phone: "0965-38-0242",
      phoneDept: "出張所窓口",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "八代市公式：出張所案内 ↗",
      desc: "日奈久地区の身近な行政窓口。各種証明書の発行や公金の収納を行っています。",
      services: [
        "住民票の写し・印鑑登録証明書・戸籍証明の交付",
        "市税・国民健康保険料・水道料金等の納付受付",
        "市政に関する身近な相談・案内"
      ],
      note: "日奈久温泉街の中心部に位置しています。"
    },
    {
      id: "yatsushiro_kagami_lib",
      name: "八代市立図書館 鏡分館",
      ruby: "やつしろしりつとしょかん かがみぶんかん",
      cat: "culture",
      area: "kagami",
      areaLabel: "鏡地区",
      target: ["general", "child", "parent", "senior"],
      address: "八代市鏡町内田453-1",
      lat: 32.5621,
      lng: 130.6358,
      hours: "火曜〜日曜 9:00〜17:00",
      closed: "月曜日・祝日・年末年始・特別整理期間",
      openDays: [2, 3, 4, 5, 6, 0],
      openTime: "09:00",
      closeTime: "17:00",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#鏡図書館", "#図書閲覧貸出", "#Wi-Fi", "#学習スペース"],
      fee: "無料（貸出利用カード登録無料）",
      parking: "あり（鏡支所・文化センター共用）",
      phone: "0965-52-1114",
      phoneDept: "鏡分館カウンター",
      url: "https://www.city.yatsushiro.lg.jp/lib/",
      urlLabel: "八代市立図書館 公式 ↗",
      desc: "鏡地区の文化交流拠点。児童書・一般図書の貸出、読書スペース、本館との連携取寄せを提供。",
      services: [
        "図書・雑誌・紙芝居の閲覧および貸出（1人10冊まで2週間）",
        "予約本・八代市立図書館本館からの相互取寄せサービス",
        "児童コーナー・絵本読み聞かせスペースの提供",
        "自習・読書デスク席の利用"
      ],
      note: "月曜祝日の場合は翌平日休館。"
    },
    {
      id: "yatsushiro_sakamoto_fukushi",
      name: "八代市 坂本住民福祉センター",
      ruby: "やつしろし さかもとじゅうみんふくしせんたー",
      cat: "welfare",
      area: "sakamoto",
      areaLabel: "坂本地区",
      target: ["general", "senior", "parent"],
      address: "八代市坂本町坂本4228-12",
      lat: 32.4415,
      lng: 130.6552,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#坂本福祉センター", "#高齢者サロン", "#生活相談", "#支え合い拠点"],
      fee: "無料（施設利用は一部予約制）",
      parking: "あり（無料 15台）",
      phone: "0965-45-2134",
      phoneDept: "管理窓口",
      url: "https://www.city.yatsushiro.lg.jp/",
      urlLabel: "八代市公式：福祉施設案内 ↗",
      desc: "坂本地区における地域住民の福祉増進拠点。高齢者の集いや生活相談、健康づくり活動に利用されています。",
      services: [
        "地域包括支援センター出張相談・高齢者生活見守り",
        "被災高齢者・在宅療養者の健康福祉相談",
        "住民交流サークル活動・サロン・健康体操の場提供",
        "社会福祉協議会坂本支所と連携した生活支援・見守り活動"
      ],
      note: "坂本支所近接。坂本地区の生活再建・福祉の重要拠点です。"
    }
  ];

  window.YATSUSHIRO_FACILITIES = FACILITIES;

  let mapInstance = null;
  let markersLayer = null;
  const facilityMarkers = {};

  function initMap() {
    const container = document.getElementById("publicServicesMap");
    if (!container || !window.L) return;

    mapInstance = L.map("publicServicesMap", {
      center: [32.5085, 130.6015],
      zoom: 12,
      scrollWheelZoom: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);

    FACILITIES.forEach((f) => {
      const cat = CATEGORIES[f.cat] || { icon: "📍", color: "#1d4ed8" };
      const icon = L.divIcon({
        className: "uto-custom-map-icon",
        html: `<div class="uto-map-pin" style="background-color: ${cat.color}; border-color: #fff;" title="${f.name}"><span>${cat.icon}</span></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      });

      const marker = L.marker([f.lat, f.lng], { icon }).addTo(markersLayer);
      marker.bindPopup(`
        <div class="uto-map-popup">
          <span class="popup-cat" style="background-color: ${cat.color};">${cat.label}</span>
          <b class="popup-title">${f.name}</b>
          <p class="popup-address">${f.address}</p>
          <p class="popup-hours">🕒 ${f.hours}</p>
          <div class="popup-actions">
            <button type="button" class="btn-popup-focus" onclick="window.focusFacilityCard('${f.id}')">詳細カードを見る</button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}" target="_blank" rel="noopener" class="btn-popup-route">経路 ↗</a>
          </div>
        </div>
      `);

      facilityMarkers[f.id] = marker;
    });
  }

  window.focusFacilityCard = function(id) {
    const card = document.getElementById(`facility_card_${id}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("card-highlight");
      setTimeout(() => card.classList.remove("card-highlight"), 2500);
    }
  };

  function getFacilityStatus(f, targetDate) {
    const d = targetDate || new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = d.getDay();
    const holiday = getJapaneseHoliday(d);

    if (f.holidayRule === "always_open") {
      const nowTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      if (nowTime >= f.openTime && nowTime <= f.closeTime) {
        return { isOpen: true, badgeClass: "status-open", text: "🟢 現在開館中", detail: `本日開館（${f.openTime}〜${f.closeTime}）` };
      }
      return { isOpen: false, badgeClass: "status-closed", text: "⚪ 時間外", detail: `開館時間：${f.openTime}〜${f.closeTime}` };
    }

    if ((month === 12 && date >= 29) || (month === 1 && date <= 3)) {
      return { isOpen: false, badgeClass: "status-closed", text: "⚪ 年末年始休館", detail: "12月29日〜1月3日は休館" };
    }

    if (holiday && f.holidayRule === "closed_holidays_and_year_end") {
      return { isOpen: false, badgeClass: "status-closed", text: `⚪ 本日休館（${holiday}）`, detail: `祝日休館（${holiday}）` };
    }

    if (!f.openDays.includes(day)) {
      return { isOpen: false, badgeClass: "status-closed", text: "⚪ 本日休館（定期休館日）", detail: f.closed };
    }

    const nowMinutes = d.getHours() * 60 + d.getMinutes();
    const [openH, openM] = f.openTime.split(":").map(Number);
    const [closeH, closeM] = f.closeTime.split(":").map(Number);
    const openTotal = openH * 60 + openM;
    const closeTotal = closeH * 60 + closeM;

    if (nowMinutes >= openTotal && nowMinutes <= closeTotal) {
      return { isOpen: true, badgeClass: "status-open", text: "🟢 現在開館中", detail: `本日開館中（${f.openTime}〜${f.closeTime}）` };
    }
    return { isOpen: false, badgeClass: "status-closed", text: "⚪ 現在は受付時間外", detail: `受付時間：${f.openTime}〜${f.closeTime}` };
  }

  function renderFacilities() {
    const container = document.getElementById("facilityCardsContainer");
    const tableContainer = document.getElementById("facilityTableContainer");
    const countEl = document.getElementById("resultCount");
    if (!container) return;

    const query = (document.getElementById("serviceSearchInput")?.value || "").trim().toLowerCase();
    const activeCat = document.querySelector("#catFilterGroup .filter-pill.is-active")?.dataset.cat || "all";
    const activeTarget = document.querySelector("#targetFilterGroup .filter-pill.is-active")?.dataset.target || "all";
    const activeArea = document.querySelector("#areaFilterGroup .filter-pill.is-active")?.dataset.area || "all";
    const openNowOnly = document.getElementById("openNowCheckbox")?.checked || false;

    const now = new Date();

    const filtered = FACILITIES.filter((f) => {
      if (activeCat !== "all" && f.cat !== activeCat) return false;
      if (activeTarget !== "all" && !f.target.includes(activeTarget) && !f.target.includes("all")) return false;
      if (activeArea !== "all" && f.area !== activeArea) return false;

      const status = getFacilityStatus(f, now);
      if (openNowOnly && !status.isOpen) return false;

      if (query) {
        const textToSearch = [
          f.name, f.ruby, f.address, f.desc, f.services.join(" "), f.quickTags.join(" "), f.areaLabel
        ].join(" ").toLowerCase();
        if (!textToSearch.includes(query)) return false;
      }
      return true;
    });

    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="uto-empty-state">
          <b>条件に一致する施設が見つかりませんでした</b>
          <p>検索ワードを短くするか、フィルターの選択を「すべて」に戻してお試しください。</p>
        </div>
      `;
    } else {
      container.innerHTML = filtered.map((f) => {
        const cat = CATEGORIES[f.cat];
        const status = getFacilityStatus(f, now);
        return `
          <article class="uto-service-card" id="facility_card_${f.id}" data-id="${f.id}">
            <div class="card-header">
              <span class="card-cat-badge" style="background: ${cat.bg}; color: ${cat.color}; border: 1px solid ${cat.color}33;">
                ${cat.icon} ${cat.label}
              </span>
              <span class="card-area-badge">${f.areaLabel.split("（")[0]}</span>
              <span class="status-badge ${status.badgeClass}">${status.text}</span>
            </div>

            <h3 class="card-name">${f.name}</h3>
            <p class="card-ruby">${f.ruby}</p>
            <p class="card-address">📍 ${f.address}</p>

            <div class="card-meta-list">
              <div class="meta-row"><span>🕒 時間</span><b>${f.hours}</b></div>
              <div class="meta-row"><span>🚪 休館</span><span>${f.closed}</span></div>
              <div class="meta-row"><span>📞 電話</span><b>${f.phone}</b> <small>(${f.phoneDept})</small></div>
              <div class="meta-row"><span>🚗 駐車</span><span>${f.parking}</span></div>
            </div>

            <div class="card-quick-tags">
              ${f.quickTags.map((t) => `<span class="tag-pill">${t}</span>`).join(" ")}
            </div>

            <p class="card-desc">${f.desc}</p>

            <div class="card-services-box">
              <b>受けられる主なサービス・届出：</b>
              <ul>
                ${f.services.map((s) => `<li>${s}</li>`).join("")}
              </ul>
            </div>

            <div class="card-actions">
              <button type="button" class="btn-focus-map" onclick="window.focusFacilityMap('${f.id}', ${f.lat}, ${f.lng})">地図で位置を見る</button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}" target="_blank" rel="noopener" class="btn-route-map">現在地から行く ↗</a>
              <a href="${f.url}" target="_blank" rel="noopener" class="btn-official-link">${f.urlLabel}</a>
            </div>
          </article>
        `;
      }).join("");
    }

    if (tableContainer) {
      if (filtered.length === 0) {
        tableContainer.innerHTML = `<div class="uto-empty-state"><p>該当する施設はありません</p></div>`;
      } else {
        tableContainer.innerHTML = `
          <div class="table-responsive">
            <table class="uto-compact-table">
              <thead>
                <tr>
                  <th>分野</th>
                  <th>施設名</th>
                  <th>地域</th>
                  <th>開館時間</th>
                  <th>電話番号</th>
                  <th>主な手続き・機能</th>
                  <th>地図</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map((f) => {
                  const cat = CATEGORIES[f.cat];
                  return `
                    <tr>
                      <td><span class="table-cat" style="color: ${cat.color};">${cat.icon} ${cat.label}</span></td>
                      <td><b>${f.name}</b><br><small>${f.address}</small></td>
                      <td>${f.areaLabel.split("（")[0]}</td>
                      <td><small>${f.hours}</small></td>
                      <td><b>${f.phone}</b></td>
                      <td><small>${f.services.slice(0, 2).join("、")}等</small></td>
                      <td>
                        <button type="button" class="btn-table-map" onclick="window.focusFacilityMap('${f.id}', ${f.lat}, ${f.lng})">地図</button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        `;
      }
    }
  }

  window.focusFacilityMap = function(id, lat, lng) {
    if (!mapInstance) return;
    mapInstance.setView([lat, lng], 15, { animate: true });
    const marker = facilityMarkers[id];
    if (marker) marker.openPopup();
    const mapEl = document.getElementById("publicServicesMap");
    if (mapEl) mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initMap();
    renderFacilities();

    const searchInput = document.getElementById("serviceSearchInput");
    searchInput?.addEventListener("input", renderFacilities);

    document.querySelectorAll(".filter-pill-group").forEach((group) => {
      group.addEventListener("click", (e) => {
        const pill = e.target.closest(".filter-pill");
        if (!pill) return;
        group.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        renderFacilities();
      });
    });

    document.getElementById("openNowCheckbox")?.addEventListener("change", renderFacilities);

    document.getElementById("quickTagsGroup")?.addEventListener("click", (e) => {
      const tag = e.target.closest(".quick-tag-btn");
      if (!tag || !searchInput) return;
      searchInput.value = tag.dataset.tag || tag.textContent.replace("#", "");
      renderFacilities();
    });

    const btnCards = document.getElementById("btnViewCards");
    const btnTable = document.getElementById("btnViewTable");
    const cardsEl = document.getElementById("facilityCardsContainer");
    const tableEl = document.getElementById("facilityTableContainer");

    btnCards?.addEventListener("click", () => {
      btnCards.classList.add("is-active");
      btnTable?.classList.remove("is-active");
      cardsEl.style.display = "grid";
      tableEl.style.display = "none";
    });

    btnTable?.addEventListener("click", () => {
      btnTable.classList.add("is-active");
      btnCards?.classList.remove("is-active");
      cardsEl.style.display = "none";
      tableEl.style.display = "block";
    });

    document.getElementById("btnResetMapView")?.addEventListener("click", () => {
      if (mapInstance) mapInstance.setView([32.5085, 130.6015], 12);
    });

    document.getElementById("btnLocateUser")?.addEventListener("click", () => {
      if (!navigator.geolocation || !mapInstance) return alert("お使いの端末では位置情報が利用できません");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          mapInstance.setView([lat, lng], 14);
          L.circleMarker([lat, lng], { radius: 8, color: "#1d4ed8", fillColor: "#38bdf8", fillOpacity: 0.9 }).addTo(mapInstance).bindPopup("現在地").openPopup();
        },
        () => alert("位置情報を取得できませんでした")
      );
    });
  });
})();
