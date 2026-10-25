/**
 * 宇城市 公的施設・市民サービス マップ＆総合ガイド
 * 宇城市公式配信データ・公共施設データに基づく主要30施設の詳細情報とインタラクティブ機能
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
    matsubase: "松橋地区（市役所本庁・中心部）",
    ogawa: "小川地区（支所・ラポート周辺）",
    shiranuhi: "不知火地区（美術館・図書館・支所）",
    misumi: "三角地区（三角港・支所周辺）",
    toyono: "豊野地区（支所・公民館周辺）"
  };

  // 国民の祝日（基本祝日）判定ヘルパー
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
      id: "uki_city_hall",
      name: "宇城市役所（本庁舎）",
      ruby: "うきしやくしょ ほんちょうしゃ",
      cat: "admin",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all"],
      targetLabel: "全市民・市外からの転入者・事業者",
      address: "宇城市松橋町大野85",
      lat: 32.654812,
      lng: 130.690823,
      hours: "平日 8:30〜17:15（毎週木曜窓口延長 19:00まで）",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#証明窓口", "#マイナンバー", "#無料駐車場完備", "#総合窓口"],
      fee: "窓口相談無料（証明発行手数料所定料金）",
      parking: "あり（市役所敷地内駐車場 無料）",
      phone: "0964-32-1111",
      phoneDept: "代表窓口（各課おつなぎ）",
      url: "https://www.city.uki.kumamoto.jp/",
      urlLabel: "宇城市公式：庁舎・各課案内 ↗",
      desc: "市民生活のあらゆる公的届出・手続き・総合相談が集約された行政中枢拠点です。",
      services: [
        "住民票・戸籍謄抄本・印鑑証明の発行、マイナンバーカード交付・暗証番号再設定",
        "転入・転出・出生・婚姻・死亡などの戸籍届出受付",
        "国民健康保険・国民年金・後期高齢者医療の加入・給付・減免申請",
        "児童手当・こども医療費助成・保育所入所手続き・母子福祉窓口",
        "市民税・固定資産税・軽自動車税の納税相談・課税証明書交付",
        "被災者生活再建支援金・災害援護資金・住宅応急修理・公費解体総合窓口",
        "上下水道使用開始・休止手続き、ごみ収集・環境衛生相談"
      ],
      note: "平日8:30〜17:15。1階総合案内、バリアフリー完備。ウイングまつばせ隣接。"
    },
    {
      id: "uki_ogawa_branch",
      name: "宇城市 小川支所",
      ruby: "うきし おがわししょ",
      cat: "admin",
      area: "ogawa",
      areaLabel: "小川地区（支所・ラポート周辺）",
      target: ["all", "senior"],
      targetLabel: "小川地区住民・全市民",
      address: "宇城市小川町小川85",
      lat: 32.593741,
      lng: 130.709321,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#証明窓口", "#小川地区", "#マイナンバー", "#福祉窓口"],
      fee: "窓口相談無料（証明発行手数料所定料金）",
      parking: "あり（小川支所駐車場 無料）",
      phone: "0964-43-1111",
      phoneDept: "小川支所 総合窓口課",
      url: "https://www.city.uki.kumamoto.jp/soshiki/47/",
      urlLabel: "宇城市公式：小川支所案内 ↗",
      desc: "小川地区の行政サービス中核拠点。本庁舎と同じく各種証明発行や公的届出が可能です。",
      services: [
        "住民票・戸籍証明・印鑑証明・税証明の交付",
        "マイナンバーカード手続き・転出入受付",
        "国保・年金・高齢者福祉・児童手当申請受付",
        "生活再建相談・各種公的申請書類の配布・受付"
      ],
      note: "小川町中心部に位置し、駐車場も広くアクセスしやすい拠点です。"
    },
    {
      id: "uki_shiranuhi_branch",
      name: "宇城市 不知火支所",
      ruby: "うきし しらぬひししょ",
      cat: "admin",
      area: "shiranuhi",
      areaLabel: "不知火地区（美術館・図書館・支所）",
      target: ["all", "senior"],
      targetLabel: "不知火地区住民・全市民",
      address: "宇城市不知火町高良2273-1",
      lat: 32.650812,
      lng: 130.665123,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#証明窓口", "#不知火地区", "#福祉相談", "#図書館近接"],
      fee: "窓口相談無料（証明発行手数料所定料金）",
      parking: "あり（無料）",
      phone: "0964-33-1111",
      phoneDept: "不知火支所 総合窓口課",
      url: "https://www.city.uki.kumamoto.jp/soshiki/46/",
      urlLabel: "宇城市公式：不知火支所案内 ↗",
      desc: "不知火地区の行政総合拠点。各種公的証明の発行や市民生活の届出を受け付けます。",
      services: [
        "住民票・戸籍謄抄本・印鑑証明書の発行",
        "国民健康保険・年金・税関係証明・マイナンバー受付",
        "福祉・介護・子育て関連の申請受付・取次"
      ],
      note: "不知火美術館・図書館や不知火体育館の近くに位置しています。"
    },
    {
      id: "uki_misumi_branch",
      name: "宇城市 三角支所",
      ruby: "うきし みすみししょ",
      cat: "admin",
      area: "misumi",
      areaLabel: "三角地区（三角港・支所周辺）",
      target: ["all", "senior"],
      targetLabel: "三角地区住民・全市民",
      address: "宇城市三角町三角浦1159-1",
      lat: 32.617512,
      lng: 130.472134,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#証明窓口", "#三角地区", "#港湾地域", "#マイナンバー"],
      fee: "窓口相談無料（証明発行手数料所定料金）",
      parking: "あり（無料）",
      phone: "0964-53-1111",
      phoneDept: "三角支所 総合窓口課",
      url: "https://www.city.uki.kumamoto.jp/soshiki/45/",
      urlLabel: "宇城市公式：三角支所案内 ↗",
      desc: "三角地区の行政拠点。市民課業務・税・福祉の各種申請・証明書発行に対応しています。",
      services: [
        "住民票・戸籍・印鑑証明・各種税証明の交付",
        "転入・転出届出・マイナンバーカード手続き",
        "福祉・保険・年金の各種届出受付"
      ],
      note: "JR三角駅や三角港からアクセス良好な立地です。"
    },
    {
      id: "uki_toyono_branch",
      name: "宇城市 豊野支所",
      ruby: "うきし とよのししょ",
      cat: "admin",
      area: "toyono",
      areaLabel: "豊野地区（支所・公民館周辺）",
      target: ["all", "senior"],
      targetLabel: "豊野地区住民・全市民",
      address: "宇城市豊野町糸石3516-1",
      lat: 32.637812,
      lng: 130.771234,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#証明窓口", "#豊野地区", "#山間地域窓口"],
      fee: "窓口相談無料（証明発行手数料所定料金）",
      parking: "あり（無料）",
      phone: "0964-45-2111",
      phoneDept: "豊野支所 総合窓口課",
      url: "https://www.city.uki.kumamoto.jp/soshiki/48/",
      urlLabel: "宇城市公式：豊野支所案内 ↗",
      desc: "豊野地区の行政サービス拠点。証明発行から地域包括相談まで身近に対応します。",
      services: [
        "住民票・戸籍・印鑑証明の発行",
        "税金関係証明・国保・年金窓口",
        "福祉・農政・地域振興の各種相談"
      ],
      note: "豊野公民館に隣接しています。"
    },

    // 2. 子育て・母子
    {
      id: "uki_kosodate_center",
      name: "宇城市 子育て世代包括支援センター「うきっ子」",
      ruby: "うきし こそだてせだいほうかつしえんせんたー",
      cat: "child",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["child", "parent"],
      targetLabel: "妊産婦・乳幼児〜高校生世代の保護者",
      address: "宇城市松橋町大野85 市役所本庁舎1階",
      lat: 32.654812,
      lng: 130.690823,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#母子手帳交付", "#助産師保健師相談", "#妊婦面談", "#無料相談"],
      fee: "相談無料",
      parking: "あり（市役所駐車場利用）",
      phone: "0964-32-1111",
      phoneDept: "こども未来課 子育て支援係",
      url: "https://www.city.uki.kumamoto.jp/soshiki/17/",
      urlLabel: "宇城市公式：子育て支援案内 ↗",
      desc: "妊娠期から子育て期まで切れ目なく支援する専門窓口。保健師・助産師が常駐します。",
      services: [
        "母子健康手帳の交付・妊婦健診受診票の発行・面談",
        "出産・子育て応援給付金の申請受付",
        "産前産後ケア事業・新生児訪問・乳児健診の案内",
        "子育ての不安・発達相談・児童虐待防止相談"
      ],
      note: "市役所1階。授乳室・オムツ替えスペースも備えています。"
    },
    {
      id: "uki_jidoukan_matsubase",
      name: "宇城市 松橋児童館",
      ruby: "うきし まつばせじどうかん",
      cat: "child",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["child", "parent"],
      targetLabel: "0歳〜18歳未満の児童・幼児と保護者",
      address: "宇城市松橋町松橋396-1",
      lat: 32.653112,
      lng: 130.697523,
      hours: "火曜〜日曜 9:00〜17:00",
      closed: "月曜日・祝日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "17:00",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#児童館", "#遊戯室", "#土日開館", "#絵本読書", "#子育て交流"],
      fee: "無料",
      parking: "あり（無料）",
      phone: "0964-32-0056",
      phoneDept: "松橋児童館直通",
      url: "https://www.city.uki.kumamoto.jp/",
      urlLabel: "宇城市公式：児童館案内 ↗",
      desc: "子どもたちが安全に遊べる遊び場・交流スペース。遊具や絵本が充実しています。",
      services: [
        "遊戯室・図書室・プレイルームの無料開放",
        "季節の行事・工作教室・親子ふれあい遊び",
        "学童クラブ（放課後児童健全育成事業）の実施"
      ],
      note: "松橋総合体育館の近く。土日も開館しており、親子の憩いの場となっています。"
    },

    // 3. 健康・保健
    {
      id: "uki_health_center",
      name: "宇城市 保健福祉センター",
      ruby: "うきし ほけんふくしせんたー",
      cat: "health",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all", "senior", "child"],
      targetLabel: "市民・乳幼児健診対象者・成人・高齢者",
      address: "宇城市松橋町久具400-1",
      lat: 32.661212,
      lng: 130.693421,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#集団健診", "#乳幼児健診", "#予防接種", "#保健師相談"],
      fee: "相談無料（各種健診は所定料金・公費助成あり）",
      parking: "あり（約80台・無料）",
      phone: "0964-32-7100",
      phoneDept: "宇城市保健センター",
      url: "https://www.city.uki.kumamoto.jp/soshiki/18/",
      urlLabel: "宇城市公式：保健福祉案内 ↗",
      desc: "市民の健康づくり・母子保健・成人病予防・予防接種を統括する拠点施設です。",
      services: [
        "乳幼児健診（4か月・1歳6か月・3歳児健診等）の実施",
        "特定健診・がん検診・骨粗しょう症検診の受付・実施",
        "各種予防接種（小児定期・高齢者肺炎球菌・インフルエンザ・コロナ）",
        "栄養指導・健康相談・こころの健康相談"
      ],
      note: "社会福祉協議会や地域支え合いセンター、包括支援センターが同敷地内に集約。"
    },

    // 4. 福祉・シニア
    {
      id: "uki_shakyo",
      name: "宇城市社会福祉協議会 本所",
      ruby: "うきし しゃかいふくしきょうぎかい",
      cat: "welfare",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all", "senior"],
      targetLabel: "生活困窮者・高齢者・障がい者・ボランティア",
      address: "宇城市松橋町久具400-1 保健福祉センター内",
      lat: 32.661212,
      lng: 130.693421,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#社協窓口", "#生活困窮相談", "#車いす無料貸出", "#ボランティア"],
      fee: "相談無料（福祉機器貸出無料）",
      parking: "あり（無料）",
      phone: "0964-32-1322",
      phoneDept: "宇城市社協 代表窓口",
      url: "http://www.ukishakyo.jp/",
      urlLabel: "宇城市社会福祉協議会 公式サイト ↗",
      desc: "地域福祉推進の中核。生活困窮・貸付・車いす貸出・ボランティアを一括受付します。",
      services: [
        "生活困窮者自立相談支援事業（くらし・しごと・家計の総合相談）",
        "福祉用具・車いすの一時無料貸出事業",
        "緊急小口資金・生活福祉資金の申請相談受付",
        "宇城市災害ボランティアセンターの設置・被災者支援運営",
        "地域包括ケア・日常生活自立支援事業（金銭管理等）"
      ],
      note: "保健福祉センター内にあります。どんな困りごとでも一人で抱え込まずご相談ください。"
    },
    {
      id: "uki_sasaeai_center",
      name: "宇城市 地域支え合いセンター",
      ruby: "うきし ちいきささえあいせんたー",
      cat: "welfare",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all", "senior"],
      targetLabel: "被災高齢者・孤立不安のある世帯・生活再建者",
      address: "宇城市松橋町久具400-1 保健福祉センター内",
      lat: 32.661212,
      lng: 130.693421,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#支え合いセンター", "#戸別訪問", "#見守り支援", "#生活再建伴走"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0964-32-1322",
      phoneDept: "支え合いセンター担当",
      url: "https://www.city.uki.kumamoto.jp/",
      urlLabel: "宇城市公式：支え合い支援 ↗",
      desc: "熊本地震で被災された世帯や仮設住宅・在宅避難者への戸別訪問・見守り・生活再建伴走拠点です。",
      services: [
        "建設型仮設・みなし仮設住宅および在宅被災者への戸別訪問・安否確認",
        "健康・介護・生活困窮・住まい再建の個別相談と専門機関への接続",
        "仮設団地でのサロン活動・コミュニティ形成支援・移動販売連携"
      ],
      note: "専門相談員が各地域を巡回訪問しています。"
    },
    {
      id: "uki_houkatsu_center",
      name: "宇城市 地域包括支援センター",
      ruby: "うきし ちいきほうかつしえんせんたー",
      cat: "welfare",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["senior", "all"],
      targetLabel: "高齢者本人・家族・ケアマネジャー",
      address: "宇城市松橋町久具400-1",
      lat: 32.661212,
      lng: 130.693421,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#地域包括", "#介護保険", "#認知症相談", "#高齢者総合支援"],
      fee: "相談無料",
      parking: "あり（無料）",
      phone: "0964-32-1405",
      phoneDept: "地域包括支援センター直通",
      url: "https://www.city.uki.kumamoto.jp/soshiki/19/",
      urlLabel: "宇城市公式：地域包括案内 ↗",
      desc: "高齢者が住み慣れた地域で安心して暮らし続けるための総合相談窓口です。",
      services: [
        "介護予防ケアマネジメント・要支援認定者のケアプラン作成",
        "認知症初期集中支援・専門医療機関との連携",
        "高齢者虐待防止・成年後見制度の利用支援・権利擁護"
      ],
      note: "各支所とも連携して市内全域をカバーしています。"
    },

    // 5. 文化・生涯学習・図書館
    {
      id: "uki_shiranuhi_museum_lib",
      name: "宇城市 不知火美術館・図書館",
      ruby: "うきし しらぬひびじゅつかん としょかん",
      cat: "culture",
      area: "shiranuhi",
      areaLabel: "不知火地区（美術館・図書館・支所）",
      target: ["all"],
      targetLabel: "全市民・市外利用者・読書愛好者・子ども",
      address: "宇城市不知火町高良2352",
      lat: 32.650212,
      lng: 130.667823,
      hours: "9:00〜21:00（年中無休）",
      closed: "年中無休（館内整理日を除く）",
      openDays: [0, 1, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "21:00",
      holidayRule: "always_open",
      isFree: true,
      quickTags: ["#年中無休", "#夜21時まで開館", "#カフェ併設", "#Wi-Fi完備", "#こども絵本広場"],
      fee: "図書館無料（美術館企画展は所定観覧料）",
      parking: "あり（約150台・無料）",
      phone: "0964-32-6222",
      phoneDept: "不知火美術館・図書館",
      url: "https://www.museum-library-uki.jp/",
      urlLabel: "不知火美術館・図書館 公式サイト ↗",
      desc: "カフェや子ども絵本スペースを備えた年中無休・夜21時まで開館する文化・交流拠点です。",
      services: [
        "図書・雑誌・視聴覚資料の貸出・返却・予約・レファレンス",
        "無料公衆Wi-Fi・電源付き学習デスク・読書ラウンジの利用",
        "美術館企画展・常設展・市民ギャラリー展示",
        "こども絵本読み聞かせ・各種文化ワークショップ"
      ],
      note: "スターバックスコーヒー併設。平日はもちろん土日祝日も夜遅くまで利用できる大人気施設です。"
    },
    {
      id: "uki_wing_matsubase",
      name: "ウイングまつばせ（宇城市民会館）",
      ruby: "ういんぐまつばせ",
      cat: "culture",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all"],
      targetLabel: "市民・文化団体・各種集会利用者",
      address: "宇城市松橋町大野85",
      lat: 32.655212,
      lng: 130.691421,
      hours: "9:00〜22:00",
      closed: "火曜日（祝日の場合は翌平日）・年末年始",
      openDays: [0, 1, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      holidayRule: "transfer_if_monday",
      isFree: false,
      quickTags: ["#大ホール", "#コミュニティセンター", "#会議室利用", "#指定避難所"],
      fee: "施設利用所定料金（ロビー利用無料）",
      parking: "あり（市役所共用 約300台・無料）",
      phone: "0964-32-5555",
      phoneDept: "ウイングまつばせ管理事務室",
      url: "https://www.city.uki.kumamoto.jp/",
      urlLabel: "ウイングまつばせ案内 ↗",
      desc: "コンサートや式典が開催できる大ホール・会議室・練習室を備えた文化の殿堂です。",
      services: [
        "大ホール（1,000席規模）・多目的ホールの利用貸出",
        "会議室・和室・調理実習室・リハーサル室の貸出",
        "各種文化公演・市民フェスティバル会場・指定避難所機能"
      ],
      note: "市役所本庁舎のすぐ北側に隣接しています。"
    },
    {
      id: "uki_ogawa_rapport",
      name: "小川総合文化センター「ラポート」",
      ruby: "おがわそうごうぶんかせんたー らぽーと",
      cat: "culture",
      area: "ogawa",
      areaLabel: "小川地区（支所・ラポート周辺）",
      target: ["all"],
      targetLabel: "市民・小川地区住民・文化サークル",
      address: "宇城市小川町江頭80",
      lat: 32.595812,
      lng: 130.702123,
      hours: "9:00〜22:00",
      closed: "月曜日（祝日の場合は翌平日）・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "09:00",
      closeTime: "22:00",
      holidayRule: "transfer_if_monday",
      isFree: false,
      quickTags: ["#小川文化ホール", "#図書館分館", "#研修室", "#無料法律相談会場"],
      fee: "施設利用所定料金（図書室無料）",
      parking: "あり（約200台・無料）",
      phone: "0964-43-0004",
      phoneDept: "ラポート管理事務室",
      url: "https://www.city.uki.kumamoto.jp/",
      urlLabel: "小川総合文化センター 案内 ↗",
      desc: "大ホール・展示室・図書室・研修室を備えた小川地区の生涯学習・文化活動の中核拠点です。",
      services: [
        "文化ホール（600席）でのコンサート・演劇・講演会開催",
        "小川図書室での図書貸出・返却・閲覧",
        "会議室・研修室・和室の貸出利用",
        "被災者支援無料法律相談会（弁護士・司法書士相談）の定期開催会場"
      ],
      note: "毎週水曜日に被災者支援無料相談会会場としても活用されています。"
    },

    // 6. スポーツ・運動
    {
      id: "uki_matsubase_gym",
      name: "松橋総合体育館",
      ruby: "まつばせそうごうたいいくかん",
      cat: "sports",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all"],
      targetLabel: "スポーツ愛好者・一般市民・児童生徒",
      address: "宇城市松橋町松橋396-1",
      lat: 32.652812,
      lng: 130.698123,
      hours: "8:30〜22:00",
      closed: "月曜日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "08:30",
      closeTime: "22:00",
      holidayRule: "transfer_if_monday",
      isFree: false,
      quickTags: ["#メインアリーナ", "#トレーニング室", "#武道場", "#夜間利用可"],
      fee: "個人利用低額（100〜200円）・専用貸出所定料金",
      parking: "あり（約150台・無料）",
      phone: "0964-32-0777",
      phoneDept: "体育館管理事務所",
      url: "https://www.city.uki.kumamoto.jp/",
      urlLabel: "松橋総合体育館案内 ↗",
      desc: "アリーナ・トレーニング室・弓道場・武道場を備えた地域最大のスポーツ拠点です。",
      services: [
        "バスケットボール・バレー・バドミントン等の競技利用",
        "トレーニングジムでのマシントレーニング（個人利用可）",
        "市スポーツ推進委員講座・各種健康増進教室"
      ],
      note: "更衣室・シャワー完備。松橋児童館に隣接。"
    },
    {
      id: "uki_shiranuhi_gym",
      name: "不知火体育館",
      ruby: "しらぬひたいいくかん",
      cat: "sports",
      area: "shiranuhi",
      areaLabel: "不知火地区（美術館・図書館・支所）",
      target: ["all"],
      targetLabel: "一般市民・スポーツ団体・ペット同行避難者",
      address: "宇城市不知火町高良",
      lat: 32.651512,
      lng: 130.666423,
      hours: "8:30〜22:00",
      closed: "月曜日・年末年始",
      openDays: [0, 2, 3, 4, 5, 6],
      openTime: "08:30",
      closeTime: "22:00",
      holidayRule: "transfer_if_monday",
      isFree: false,
      quickTags: ["#体育館", "#不知火地区", "#指定避難所", "#ペット同行避難対応"],
      fee: "所定料金",
      parking: "あり（無料）",
      phone: "0964-32-1111",
      phoneDept: "市スポーツ振興課",
      url: "https://www.city.uki.kumamoto.jp/",
      urlLabel: "不知火体育館案内 ↗",
      desc: "各種屋内スポーツが行えるアリーナ。災害時にはペット同行避難トレーラーハウスも設置。",
      services: [
        "バドミントン・卓球・バレーボール等の屋内競技利用",
        "指定避難所（ペット同行受け入れトレーラーハウス配備）"
      ],
      note: "不知火支所・美術館・図書館と一体的な公共ゾーンを形成。"
    },

    // 7. 防災・安全・ライフライン
    {
      id: "uki_police",
      name: "宇城警察署",
      ruby: "うきけいさつしょ",
      cat: "safety",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all"],
      targetLabel: "全市民・運転免許更新者・相談者",
      address: "宇城市松橋町久具359-2",
      lat: 32.662512,
      lng: 130.692823,
      hours: "平日 8:30〜17:15（事件事故24時間対応）",
      closed: "土日祝休（緊急対応年中無休）",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#運転免許更新", "#車庫証明", "#防犯交通安全", "#24時間緊急通報"],
      fee: "相談無料（各種申請手数料所定料金）",
      parking: "あり（無料）",
      phone: "0964-32-0110",
      phoneDept: "代表窓口（110番は24時間受付）",
      url: "https://www.pref.kumamoto.jp/site/police/",
      urlLabel: "熊本県警察：宇城警察署案内 ↗",
      desc: "宇城市・宇土市・美里町・氷川町を管轄する警察署。免許更新・道路使用許可・防犯相談等。",
      services: [
        "運転免許証の更新・住所変更・自主返納手続き",
        "車庫証明・道路使用許可・古物商等の営業許可申請",
        "遺失物・拾得物の届出受付、DV・ストーカー・防犯相談"
      ],
      note: "国道3号線沿いに位置。緊急時は迷わず110番へ通報してください。"
    },
    {
      id: "uki_fire_dept",
      name: "宇城広域連合消防本部・南消防署",
      ruby: "うきこういきれんごうしょうぼうほんぶ",
      cat: "safety",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all"],
      targetLabel: "全市民・事業者・救急火災通報",
      address: "宇城市松橋町久具433-2",
      lat: 32.663112,
      lng: 130.694123,
      hours: "窓口 平日 8:30〜17:15（救急・消火24時間出動）",
      closed: "窓口土日祝休（119番緊急受付年中無休）",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: true,
      quickTags: ["#119番受付", "#24時間出動", "#救命講習", "#消防訓練"],
      fee: "無料（救急・消火出動費用なし）",
      parking: "あり（無料）",
      phone: "0964-32-0119",
      phoneDept: "消防本部代表（緊急通報は119番）",
      url: "http://www.ukifire.jp/",
      urlLabel: "宇城広域連合消防本部 公式 ↗",
      desc: "宇城地域全域の消防・救急・救助を担う司令基地。24時間体制で市民の命を守ります。",
      services: [
        "火災出動・救急搬送・救助活動（24時間365日）",
        "普通救命講習・上級救命講習・AED講習の受付",
        "防火管理者講習・消防用設備点検報告・危険物保安監督受付"
      ],
      note: "火災・救急の緊急通報は局番なしの「119」へ。"
    },
    {
      id: "uki_water_dept",
      name: "宇城市 上下水道局",
      ruby: "うきし じょうげすいどうきょく",
      cat: "admin",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all"],
      targetLabel: "市民・転入者・水道使用者・指定工事店",
      address: "宇城市松橋町大野85 市役所本庁舎西分館",
      lat: 32.654812,
      lng: 130.690823,
      hours: "平日 8:30〜17:15",
      closed: "土曜・日曜・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5],
      openTime: "08:30",
      closeTime: "17:15",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#水道開栓閉栓", "#漏水相談", "#水道料金", "#給水管修理"],
      fee: "相談無料（使用料金・工事費所定）",
      parking: "あり（市役所駐車場共用）",
      phone: "0964-32-1773",
      phoneDept: "上下水道局 お客さま窓口",
      url: "https://www.city.uki.kumamoto.jp/soshiki/33/",
      urlLabel: "宇城市公式：上下水道局案内 ↗",
      desc: "安全でおいしい水の供給と下水道維持管理を担当。引越し時の開栓・閉栓や漏水相談窓口。",
      services: [
        "水道の開栓（開始）・閉栓（中止）の受付・名義変更",
        "水道料金・下水道使用料の口座振替・納付相談・減免申請",
        "道路漏水通報・宅内漏水確認方法案内・指定給水装置工事事業者一覧提供"
      ],
      note: "夜間・休日の緊急漏水通報先は代表番号から当直へ接続されます。"
    },
    {
      id: "uki_clean_center",
      name: "宇城クリーンセンター（ごみ処理施設）",
      ruby: "うきくりーんせんたー",
      cat: "safety",
      area: "matsubase",
      areaLabel: "松橋地区（市役所本庁・中心部）",
      target: ["all"],
      targetLabel: "市民・一般持ち込み者・事業者",
      address: "宇城市松橋町古保山2430",
      lat: 32.635812,
      lng: 130.672123,
      hours: "平日・土曜 8:30〜16:30（正午〜13:00も受入）",
      closed: "日曜日・祝日・年末年始",
      openDays: [1, 2, 3, 4, 5, 6],
      openTime: "08:30",
      closeTime: "16:30",
      holidayRule: "closed_holidays_and_year_end",
      isFree: false,
      quickTags: ["#ごみ持ち込み", "#粗大ごみ", "#土曜搬入可", "#計量受入"],
      fee: "ごみ処理手数料所定（被災ごみは所定免除手続きあり）",
      parking: "あり（計量棟・搬入レーン完備）",
      phone: "0964-32-2617",
      phoneDept: "クリーンセンター直通",
      url: "https://www.city.uki.kumamoto.jp/",
      urlLabel: "宇城市公式：ごみ処理案内 ↗",
      desc: "可燃ごみ・不燃ごみ・粗大ごみの自己搬入を受け付ける広域清掃工場です。",
      services: [
        "家庭用粗大ごみ・剪定枝・家具・引越しごみの計量自己搬入受入",
        "資源ごみ・リサイクル対象物の分別回収受入",
        "罹災世帯に対する災害廃棄物搬入手続き案内"
      ],
      note: "土曜日も搬入可能。搬入前に必ず分別ルールをご確認ください。"
    }
  ];

  // グローバル公開と初期化
  window.UKI_FACILITIES = FACILITIES;

  let mapInstance = null;
  let markersLayer = null;
  let activeFacilityId = null;
  const facilityMarkers = {};

  function initMap() {
    const container = document.getElementById("publicServicesMap");
    if (!container || !window.L) return;

    // 宇城市役所を中心とした初期表示
    mapInstance = L.map("publicServicesMap", {
      center: [32.6548, 130.6908],
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

  // カードフォーカス関数
  window.focusFacilityCard = function(id) {
    const card = document.getElementById(`facility_card_${id}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("card-highlight");
      setTimeout(() => card.classList.remove("card-highlight"), 2500);
    }
  };

  // 開館シミュレーション判定
  function getFacilityStatus(f, targetDate) {
    const d = targetDate || new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = d.getDay();
    const holiday = getJapaneseHoliday(d);

    // 年中無休
    if (f.holidayRule === "always_open") {
      const nowTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      if (nowTime >= f.openTime && nowTime <= f.closeTime) {
        return { isOpen: true, badgeClass: "status-open", text: "🟢 現在開館中", detail: `本日開館（${f.openTime}〜${f.closeTime}）` };
      }
      return { isOpen: false, badgeClass: "status-closed", text: "⚪ 時間外", detail: `開館時間：${f.openTime}〜${f.closeTime}` };
    }

    // 年末年始休業 (12/29〜1/3)
    if (f.holidayRule !== "ajisai_special") {
      if ((month === 12 && date >= 29) || (month === 1 && date <= 3)) {
        return { isOpen: false, badgeClass: "status-closed", text: "⚪ 年末年始休館", detail: "12月29日〜1月3日は休館" };
      }
    }

    // 祝日判定
    if (holiday && f.holidayRule === "closed_holidays_and_year_end") {
      return { isOpen: false, badgeClass: "status-closed", text: `⚪ 本日休館（${holiday}）`, detail: `祝日休館（${holiday}）` };
    }

    // 曜日判定
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

  // レンダリング・フィルター
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

    // カード描画
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

    // テーブル描画
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

  // イベントリスナー設定
  document.addEventListener("DOMContentLoaded", () => {
    initMap();
    renderFacilities();

    // 検索入力
    const searchInput = document.getElementById("serviceSearchInput");
    searchInput?.addEventListener("input", renderFacilities);

    // フィルターピル
    document.querySelectorAll(".filter-pill-group").forEach((group) => {
      group.addEventListener("click", (e) => {
        const pill = e.target.closest(".filter-pill");
        if (!pill) return;
        group.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        renderFacilities();
      });
    });

    // 開館中トグル
    document.getElementById("openNowCheckbox")?.addEventListener("change", renderFacilities);

    // クイックタグクリック
    document.getElementById("quickTagsGroup")?.addEventListener("click", (e) => {
      const tag = e.target.closest(".quick-tag-btn");
      if (!tag || !searchInput) return;
      searchInput.value = tag.dataset.tag || tag.textContent.replace("#", "");
      renderFacilities();
    });

    // 表示切り替え
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

    // 地図リセット
    document.getElementById("btnResetMapView")?.addEventListener("click", () => {
      if (mapInstance) mapInstance.setView([32.6548, 130.6908], 12);
    });

    // 現在地取得
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
