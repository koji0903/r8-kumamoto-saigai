/**
 * 氷川町 公的施設・市民サービス マップ＆総合ガイド
 * 氷川町公式データ・公共施設データに基づく主要16施設の詳細情報とインタラクティブ機能
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
    miyahara: "宮原地区（本庁舎・クリニック・宮原体育館周辺）",
    ryuhoku: "竜北地区（竜北庁舎・竜翔センター・体育館周辺）"
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
      id: "hikawa_town_hall_miyahara",
      name: "氷川町役場（宮原庁舎）",
      ruby: "ひかわちょうやくば みやはらちょうしゃ",
      cat: "admin",
      area: "miyahara",
      areaLabel: "宮原地区（本庁舎周辺）",
      target: ["all"],
      targetLabel: "町民・転入者・事業者",
      address: "八代郡氷川町宮原522-1",
      lat: 32.569512,
      lng: 130.697823,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#宮原庁舎", "#住民票交付", "#マイナンバー", "#被災者支援総合窓口"],
      fee: "相談無料（証明書所定手数料）",
      parking: "あり（無料）",
      phone: "0965-62-2111",
      phoneDept: "総務課・住民福祉課",
      url: "https://www.town.hikawa.kumamoto.jp/",
      urlLabel: "氷川町公式：宮原庁舎案内 ↗",
      desc: "氷川町の行政中核拠点。住民票・戸籍・税・生活再建・福祉窓口が開設されています。",
      services: [
        "住民票・印鑑登録証明・戸籍謄抄本交付、マイナンバー手続き",
        "転出入・出生・婚姻・死亡などの戸籍届出",
        "被災者生活再建支援金・災害援護資金・公費解体・住宅応急修理申請窓口",
        "町民税・固定資産税・軽自動車税の申告・納税相談・減免"
      ],
      note: "宮原振興クリニックに隣接。国道3号線近くに位置。"
    },
    {
      id: "hikawa_town_hall_ryuhoku",
      name: "氷川町役場（竜北庁舎）",
      ruby: "ひかわちょうやくば りゅうほくちょうしゃ",
      cat: "admin",
      area: "ryuhoku",
      areaLabel: "竜北地区（竜北庁舎周辺）",
      target: ["all"],
      targetLabel: "竜北地区住民・全町民",
      address: "八代郡氷川町島地342-1",
      lat: 32.583512,
      lng: 130.681223,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#竜北庁舎", "#証明書交付", "#農林建設課", "#水道窓口"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0965-52-5850",
      phoneDept: "竜北庁舎窓口",
      url: "https://www.town.hikawa.kumamoto.jp/",
      urlLabel: "竜北庁舎案内 ↗",
      desc: "竜北地区の行政拠点。各種証明書交付、農政、建設、上下水道の窓口を担当。",
      services: [
        "住民票・戸籍・印鑑証明・各種税証明の交付",
        "農地・農業振興・土木・道路河川の相談",
        "上下水道の使用開始・休止手続き"
      ],
      note: "竜北グラウンドや竜翔センターの近く。"
    },

    // 2. 子育て・母子
    {
      id: "hikawa_kosodate_center",
      name: "氷川町 子育て支援センター「わくわく」",
      ruby: "ひかわちょう こそだてしえんせんたー",
      cat: "child",
      area: "miyahara",
      areaLabel: "宮原地区（中央公民館隣接）",
      target: ["child", "parent"],
      targetLabel: "乳幼児と保護者",
      address: "八代郡氷川町宮原栄久33",
      lat: 32.568112,
      lng: 130.698523,
      hours: "平日 9:00〜16:00",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "09:00",
      closeTime: "16:00",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#子育て広場", "#親子交流", "#育児相談", "#プレイルーム"],
      fee: "無料",
      parking: "あり（公民館駐車場利用・無料）",
      phone: "0965-62-4500",
      phoneDept: "子育て支援センター",
      url: "https://www.town.hikawa.kumamoto.jp/",
      urlLabel: "氷川町公式：子育て支援 ↗",
      desc: "就学前の乳幼児と保護者が自由に遊んで交流できるアットホームな支援拠点です。",
      services: [
        "プレイルーム開放（木製おもちゃ・絵本）",
        "保育士による育児相談・身体測定",
        "季節のイベント・親子ふれあい講座"
      ],
      note: "中央公民館と同じ敷地内にあります。"
    },

    // 3. 健康・保健
    {
      id: "hikawa_health_center",
      name: "氷川町 保健センター（竜翔センター内）",
      ruby: "ひかわちょう ほけんせんたー",
      cat: "health",
      area: "ryuhoku",
      areaLabel: "竜北地区（島地）",
      target: ["all", "child", "senior"],
      targetLabel: "全町民・乳幼児・高齢者",
      address: "八代郡氷川町島地651",
      lat: 32.581512,
      lng: 130.682823,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#乳幼児健診", "#母子手帳", "#がん検診", "#竜翔センター"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0965-52-7171",
      phoneDept: "健康福祉課 保健予防係",
      url: "https://www.town.hikawa.kumamoto.jp/",
      urlLabel: "氷川町公式：保健センター ↗",
      desc: "町民の健診・予防接種・母子保健・生活習慣病対策を担う総合保健拠点です。",
      services: [
        "乳幼児健診・各種集団健診・特定健診",
        "母子健康手帳交付・プレママ面談",
        "予防接種・保健師相談"
      ],
      note: "竜翔センター内に社協・支え合いセンターとともに集約。"
    },

    // 4. 福祉・シニア
    {
      id: "hikawa_ryusho_center",
      name: "氷川町 竜翔センター・社会福祉協議会",
      ruby: "ひかわちょう りゅうしょうせんたー",
      cat: "welfare",
      area: "ryuhoku",
      areaLabel: "竜北地区（島地）",
      target: ["all", "senior"],
      targetLabel: "生活困窮者・高齢者・ボランティア",
      address: "八代郡氷川町島地651",
      lat: 32.581512,
      lng: 130.682823,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#社協事務局", "#生活困窮相談", "#ボランティア", "#無料法律相談会場"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0965-52-7171",
      phoneDept: "氷川町社協",
      url: "https://www.town.hikawa.kumamoto.jp/",
      urlLabel: "竜翔センター案内 ↗",
      desc: "氷川町の地域福祉拠点。社会福祉協議会が常駐し、生活困窮・貸付・VC活動を担当。",
      services: [
        "生活困窮相談・生活福祉資金貸付窓口",
        "氷川町災害ボランティアセンター運営",
        "無料法律相談会会場（毎週火・金開催）",
        "高齢者デイサービス・地域包括支援"
      ],
      note: "弁護士等による無料相談会が火曜・金曜に開催されています。"
    },
    {
      id: "hikawa_sasaeai_center",
      name: "氷川町 地域支え合いセンター",
      ruby: "ひかわちょう ちいきささえあいせんたー",
      cat: "welfare",
      area: "ryuhoku",
      areaLabel: "竜北地区（竜翔センター内）",
      target: ["all", "senior"],
      targetLabel: "被災高齢者・在宅避難者・仮設住宅入居者",
      address: "八代郡氷川町島地651",
      lat: 32.581512,
      lng: 130.682823,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#支え合いセンター", "#戸別訪問", "#物資管理配布", "#生活再建見守り"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0965-52-7171",
      phoneDept: "支え合いセンター担当",
      url: "https://www.town.hikawa.kumamoto.jp/",
      urlLabel: "氷川町公式：支え合い支援 ↗",
      desc: "仮設住宅や在宅被災者への戸別訪問、支援物資の管理配布、見守り支援を担当。",
      services: [
        "新村仮設・宮原仮設・吉本仮設および在宅被災者への訪問活動",
        "支援物資の一括管理・希望世帯への配布",
        "高齢者・障がい者の生活再建伴走"
      ],
      note: "竜翔センター内に設置され、巡回訪問を実施しています。"
    },

    // 5. 文化・生涯学習・図書館
    {
      id: "hikawa_community_center",
      name: "氷川町 中央公民館・図書室",
      ruby: "ひかわちょう ちゅうおうこうみんかん としょしつ",
      cat: "culture",
      area: "miyahara",
      areaLabel: "宮原地区（栄久）",
      target: ["all"],
      targetLabel: "全町民・児童生徒",
      address: "八代郡氷川町宮原栄久33",
      lat: 32.567812,
      lng: 130.699123,
      hours: "8:30〜22:00（図書室は17:00まで）",
      closed: "月曜日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "08:30",
      closeTime: "22:00",
      holidayRule: "transfer_if_monday",
      isFree: false,
      quickTags: ["#中央公民館", "#図書室", "#生涯学習", "#研修室貸出"],
      fee: "図書室無料（施設利用所定料金）",
      parking: "あり（無料）",
      phone: "0965-62-1111",
      phoneDept: "中央公民館事務室",
      url: "https://www.town.hikawa.kumamoto.jp/",
      urlLabel: "中央公民館案内 ↗",
      desc: "大ホール・研修室・和室・図書室を備えた宮原地区の生涯学習・地域交流拠点です。",
      services: [
        "町民図書室での本・雑誌の閲覧・貸出",
        "研修室・会議室・和室の利用貸出",
        "各種文化講座・生涯学習サークル活動"
      ],
      note: "子育て支援センター「わくわく」に隣接。"
    },

    // 6. スポーツ・運動
    {
      id: "hikawa_ryuhoku_gym",
      name: "氷川町 竜北体育館",
      ruby: "ひかわちょう りゅうほくたいいくかん",
      cat: "sports",
      area: "ryuhoku",
      areaLabel: "竜北地区（島地）",
      target: ["all"],
      targetLabel: "町民・スポーツ愛好者・避難所利用",
      address: "八代郡氷川町島地",
      lat: 32.582812,
      lng: 130.682523,
      hours: "8:30〜22:00",
      closed: "月曜日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "08:30",
      closeTime: "22:00",
      holidayRule: "transfer_if_monday",
      isFree: false,
      quickTags: ["#竜北体育館", "#アリーナ", "#指定避難所", "#スポーツ利用"],
      fee: "所定使用料",
      parking: "あり（無料）",
      phone: "0965-52-5850",
      phoneDept: "町教育委員会体育係",
      url: "https://www.town.hikawa.kumamoto.jp/",
      urlLabel: "竜北体育館案内 ↗",
      desc: "バスケット・バレー・バドミントン競技が行える屋内体育施設。指定避難所。",
      services: [
        "屋内スポーツ競技・サークル利用",
        "指定避難所機能（竜北中学校集会所ではペット同行避難にも対応）"
      ],
      note: "竜北庁舎のすぐ近くに位置しています。"
    },

    // 7. 防災・安全
    {
      id: "hikawa_fire_station",
      name: "八代広域消防本部 氷川分署",
      ruby: "ひかわしょうぼうぶんしょ",
      cat: "safety",
      area: "miyahara",
      areaLabel: "宮原地区（野津）",
      target: ["all"],
      targetLabel: "町民・救急消火通報",
      address: "八代郡氷川町野津",
      lat: 32.576512,
      lng: 130.688523,
      hours: "24時間出動体制",
      closed: "年中無休",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "00:00",
      closeTime: "23:59",
      holidayRule: "always_open",
      isFree: true,
      quickTags: ["#消防署", "#24時間救急出動", "#119番"],
      fee: "無料",
      parking: "あり",
      phone: "0965-62-0119",
      phoneDept: "氷川分署（緊急通報は119番）",
      url: "http://www.yatsushiro-fd.jp/",
      urlLabel: "八代広域消防本部 ↗",
      desc: "氷川町全域の消火・救急・救助を担う消防分署。24時間体制で出動します。",
      services: [
        "24時間救急搬送・消火活動・救助活動",
        "AED設置・普通救命講習案内"
      ],
      note: "火事・救急の緊急通報は局番なし「119」へ。"
    },
    {
      id: "hikawa_ryuhoku_kouminkan",
      name: "氷川町 竜北公民館",
      ruby: "ひかわちょう りゅうほくこうみんかん",
      cat: "culture",
      area: "ryuhoku",
      areaLabel: "竜北地区",
      target: ["general", "senior", "parent"],
      address: "八代郡氷川町島地589",
      lat: 32.5855,
      lng: 130.6720,
      hours: "平日 8:30〜22:00（窓口は17:15まで）",
      closed: "年末年始（12/29〜1/3）",
      openDays: [1, 2, 3, 4, 5, 6, 0],
      openTime: "08:30",
      closeTime: "22:00",
      holidayRule: "year_end_only",
      isFree: true,
      quickTags: ["#竜北公民館", "#研修室貸出", "#サークル活動", "#地域拠点"],
      fee: "会議室利用有料（減免あり）、ロビー無料",
      parking: "あり（無料 40台）",
      phone: "0965-52-1111",
      phoneDept: "文化・生涯学習係",
      url: "https://www.hikawacyo.hinokuni-net.jp/",
      urlLabel: "氷川町公式：公共施設案内 ↗",
      desc: "竜北地区の社会教育・地域住民活動の拠点施設。会議室、和室、調理実習室を備えます。",
      services: [
        "地域住民の集会・サークル・各種団体の会議室利用",
        "生涯学習・地域づくり講座・防災研修の開催",
        "公衆Wi-Fi・地域情報掲示コーナーの利用"
      ],
      note: "竜北庁舎近接。部屋利用は事前申請が必要です。"
    },
    {
      id: "hikawa_miyahara_koban",
      name: "八代警察署 宮原交番",
      ruby: "やつしろけいさつしょ みやはらこうばん",
      cat: "safety",
      area: "miyahara",
      areaLabel: "宮原地区",
      target: ["general", "senior"],
      address: "八代郡氷川町宮原栄久32-1",
      lat: 32.5695,
      lng: 130.6860,
      hours: "24時間対応（不在時は警察署へ直通連絡）",
      closed: "年中無休",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "00:00",
      closeTime: "23:59",
      holidayRule: "always_open",
      isFree: true,
      quickTags: ["#宮原交番", "#地域警察", "#落とし物", "#防犯パトロール"],
      fee: "無料",
      parking: "あり（来所用 2台）",
      phone: "0965-62-2110",
      phoneDept: "宮原交番（緊急通報は110番）",
      url: "https://www.pref.kumamoto.jp/site/police/",
      urlLabel: "熊本県警察公式 ↗",
      desc: "氷川町・宮原地区の地域治安と交通安全を守る交番。地域パトロールや届出受付を実施。",
      services: [
        "遺失物・拾得物（落とし物・忘れ物）の届出受付",
        "交通事故・事件の初期対応・安全指導",
        "地域防犯パトロール・高齢者宅巡回連絡",
        "通学路見守り・防犯相談"
      ],
      note: "緊急時の110番通報は携帯電話からもそのまま発信できます。"
    },
    {
      id: "hikawa_ryuhoku_fureai",
      name: "氷川町 竜北ふれあい公園",
      ruby: "ひかわちょう りゅうほくふれあいこうえん",
      cat: "sports",
      area: "ryuhoku",
      areaLabel: "竜北地区",
      target: ["general", "child", "parent"],
      address: "八代郡氷川町島地670",
      lat: 32.5820,
      lng: 130.6750,
      hours: "終日開放（管理棟・施設利用は8:30〜17:00）",
      closed: "年中無休",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "08:30",
      closeTime: "17:00",
      holidayRule: "always_open",
      isFree: true,
      quickTags: ["#ふれあい公園", "#大型遊具", "#芝生広場", "#ウォーキング"],
      fee: "公園利用無料",
      parking: "あり（無料 50台）",
      phone: "0965-52-1111",
      phoneDept: "産業振興課",
      url: "https://www.hikawacyo.hinokuni-net.jp/",
      urlLabel: "氷川町公式：公園案内 ↗",
      desc: "広大な芝生広場と大型複合遊具、ウォーキングコースを備えた町民憩いの公園・一時避難場所。",
      services: [
        "子ども向け大型コンビネーション遊具・すべり台利用",
        "芝生広場・健康ウォーキング・ジョギングコース",
        "災害時の一時避難場所・オープンスペース"
      ],
      note: "竜北庁舎・体育館から徒歩圏内。休日は多くの家族連れで賑わいます。"
    }
  ];

  window.HIKAWA_FACILITIES = FACILITIES;

  let mapInstance = null;
  let markersLayer = null;
  const facilityMarkers = {};

  function initMap() {
    const container = document.getElementById("publicServicesMap");
    if (!container || !window.L) return;

    mapInstance = L.map("publicServicesMap", {
      center: [32.5765, 130.6900],
      zoom: 13,
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
      if (mapInstance) mapInstance.setView([32.5765, 130.6900], 13);
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
