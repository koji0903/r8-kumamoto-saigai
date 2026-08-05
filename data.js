window.REPORT_DATA = {
  disaster: { occurred: "2026-07-28T16:27:00+09:00", name: "令和8年熊本地震" },
  officialSources: [
    { level: "国", name: "内閣府 防災情報", description: "政府の災害情報、被害・対応状況、関係省庁資料", url: "https://www.bousai.go.jp/" },
    { level: "県", name: "熊本県 災害・防災情報", description: "県の被害情報、災害対策本部資料、生活再建・支援制度", url: "https://www.pref.kumamoto.jp/life/1/2/index.html" },
    { level: "県・リアルタイム", name: "防災情報くまもと", description: "避難情報、避難所、気象・河川・地震などの発令・観測情報", url: "https://portal.bousai.pref.kumamoto.jp/" }
  ],
  municipalities: [
    { name: "熊本市", url: "https://www.city.kumamoto.jp/" }, { name: "八代市", url: "https://www.city.yatsushiro.lg.jp/" },
    { name: "水俣市", url: "https://www.city.minamata.lg.jp/" }, { name: "山鹿市", url: "https://www.city.yamaga.kumamoto.jp/" },
    { name: "菊池市", url: "https://www.city.kikuchi.lg.jp/" }, { name: "宇土市", url: "https://www.city.uto.lg.jp/" },
    { name: "上天草市", url: "https://www.city.kamiamakusa.kumamoto.jp/" }, { name: "宇城市", url: "https://www.city.uki.kumamoto.jp/" },
    { name: "天草市", url: "https://www.city.amakusa.kumamoto.jp/" }, { name: "合志市", url: "https://www.city.koshi.lg.jp/" },
    { name: "美里町", url: "https://www.town.kumamoto-misato.lg.jp/" }, { name: "大津町", url: "https://www.town.ozu.kumamoto.jp/" },
    { name: "菊陽町", url: "https://www.town.kikuyo.lg.jp/" }, { name: "西原村", url: "https://www.vill.nishihara.kumamoto.jp/" },
    { name: "御船町", url: "https://www.town.mifune.kumamoto.jp/" }, { name: "嘉島町", url: "https://www.town.kumamoto-kashima.lg.jp/" },
    { name: "益城町", url: "https://www.town.mashiki.lg.jp/" }, { name: "甲佐町", url: "https://www.town.kosa.lg.jp/" },
    { name: "氷川町", url: "https://www.town.hikawa.kumamoto.jp/" }, { name: "芦北町", url: "https://www.town.ashikita.lg.jp/" },
    { name: "津奈木町", url: "https://www.town.tsunagi.lg.jp/" }
  ],
  municipalEvents: [
    {
      date: "2026-07-29", meeting: 492, page: 2, category: "制度",
      areas: ["熊本市", "八代市", "水俣市", "山鹿市", "菊池市", "宇土市", "上天草市", "宇城市", "天草市", "合志市", "美里町", "大津町", "菊陽町", "西原村", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町", "津奈木町"],
      title: "災害救助法を適用", detail: "震度5強以上の市町村として、災害救助法の適用対象に含まれています。",
      pdf: "20260729火の国会議.pdf"
    },
    {
      date: "2026-08-02", meeting: 496, page: 3, category: "生活支援",
      areas: ["宇土市", "宇城市", "八代市", "氷川町"],
      title: "宿泊支援提供事業の実施を決定", detail: "県旅館ホテル生活衛生同業組合と連携した宿泊支援の対象。8月2日は宇土市でホテルへの移動1件が報告されました。",
      pdf: "20260802火の国会議496回.pdf"
    },
    {
      date: "2026-08-02", meeting: 496, page: 3, category: "生活支援",
      areas: ["天草市", "上天草市", "宇土市", "宇城市", "八代市", "氷川町", "水俣市", "御船町"],
      title: "入浴支援事業を実施", detail: "県の入浴支援事業が実施中と報告されました。",
      pdf: "20260802火の国会議496回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 2, category: "ライフライン",
      areas: ["宇城市", "甲佐町", "八代市", "氷川町"],
      title: "断水が継続", detail: "4市町の合計で44,380戸。宇城市は試験通水実施中です。市町別の戸数は資料に記載されていません。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 2, category: "生活支援",
      areas: ["熊本市", "宇土市", "宇城市", "八代市", "氷川町", "甲佐町", "美里町", "御船町", "嘉島町"],
      title: "ホテル避難の対象地域", detail: "宿泊支援提供事業の実施対象。受け入れ施設114施設、申込289件、マッチング済み6件は全体値で、市町別内訳ではありません。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 3, category: "生活支援",
      areas: ["熊本市", "天草市", "上天草市", "宇土市", "宇城市", "八代市", "氷川町", "水俣市", "御船町", "美里町"],
      title: "入浴支援事業を実施", detail: "県の入浴支援事業が実施中と報告されました。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 3, category: "住まい",
      areas: ["宇城市", "氷川町"],
      title: "建設型応急住宅の整備を決定", detail: "最初の建設型応急住宅を整備する自治体として報告されました。戸数・場所はこの資料に記載されていません。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 3, category: "住まい",
      areas: ["御船町", "甲佐町", "美里町"],
      title: "住宅支援制度の受付を開始", detail: "賃貸型応急住宅と住宅の応急修理制度の受付開始自治体として報告されました。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["熊本市"], title: "災害VCが活動開始", detail: "8月3日開所、8月4日活動開始。一般ボランティア募集は8月5日開始予定。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["嘉島町"], title: "災害VCが活動中", detail: "8月2日から活動開始と報告されました。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["益城町"], title: "災害VCが活動中", detail: "8月1日に開所・活動開始。全国から1日30人を募集。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["八代市"], title: "災害VCは開所、活動開始日は未定", detail: "7月29日開所。鏡町武道場とグラウンドに設置。設置場所も断水継続中。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["宇土市"], title: "災害VCが活動中", detail: "8月2日開所、8月3日活動開始。設置場所は時間通水。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["宇城市"], title: "災害VCは開所、活動開始日は未定", detail: "物資仕分けや段ボールベッド組み立て等を約50人で実施。ニーズ約160件は家屋内片付け等。いずれも会議報告時点の概数です。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["美里町"], title: "災害VCが活動開始", detail: "7月29日開所、8月4日活動開始。全国から募集し、当日は約30人が参加。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["御船町"], title: "災害VCが活動中", detail: "8月1日開所、8月3日活動開始。仮置き場は8月28日まで設置予定。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["甲佐町"], title: "災害VCが活動開始", detail: "7月29日開所、8月4日活動開始。九州内からボランティアを募集。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["氷川町"], title: "災害VCは活動準備中", detail: "8月3日からニーズ調査、8月8日活動開始予定。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["芦北町"], title: "災害VCを開所", detail: "8月4日開所、8月7日活動開始予定（準備ができ次第開始）。旧田ノ浦支所に設置。",
      pdf: "20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["上天草市"], title: "通常VCとして活動見込み", detail: "通常のボランティアセンターとして活動見込みと報告されました。",
      pdf: "20260804火の国会議498回.pdf"
    }
  ],
  metrics: [
    { key: "evacuees", label: "避難者", unit: "人", color: "#e45e35" },
    { key: "shelters", label: "避難所", unit: "か所", color: "#d39b2b" },
    { key: "outages", label: "停電・受付", unit: "件／戸", color: "#3b8a78" },
    { key: "homes", label: "住家被害（把握・推定）", unit: "棟", color: "#6577a6" }
  ],
  days: [
    {
      date: "2026-07-29", meeting: 492, disasterDay: 2, attendees: 499,
      pdf: "20260729火の国会議.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "天草市", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 80, deaths: 12, evacuees: 8886, shelters: 432, outages: 34880, homes: null },
      topics: ["被害", "避難", "ライフライン", "支援"],
      headline: "県内21市町村に災害救助法を適用",
      summary: "避難所432か所に8,886人。大規模な停電・断水が続くなか、各地で災害ボランティアセンターの立ち上げ準備が始まりました。",
      actions: ["14市町で給水所を設置", "災害VCの立ち上げ見込みを共有", "避難所・福祉避難所のニーズ把握を開始"],
      note: "住家被害は調査中。氷川町では17時時点で全壊125戸との報告。"
    },
    {
      date: "2026-07-30", meeting: 493, disasterDay: 3, attendees: 253,
      pdf: "20260730火の国会議493回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "益城町", "甲佐町", "津奈木町"],
      stats: { injured: 120, deaths: 34, evacuees: 9450, shelters: 406, outages: 18910, homes: null },
      topics: ["被害", "避難", "ライフライン", "ボランティア"],
      headline: "11か所で災害VC設置の見込み",
      summary: "避難者は9,450人に増加。一方、停電戸数は前日からおよそ半減しました。各市町村でボランティア受け入れ体制の具体化が進みました。",
      actions: ["高速道路の無料措置を開始", "宇城・御船・益城などで災害VCの開設日程を調整", "生活用水・入浴支援のニーズを調査"],
      note: "避難者数には把握できている車中泊者を含む。住家被害は調査中。"
    },
    {
      date: "2026-07-31", meeting: 494, disasterDay: 4,
      pdf: "20260731火の国会議494回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町"],
      stats: { injured: 131, deaths: 35, evacuees: 9134, shelters: 374, outages: 1590, homes: 1507 },
      topics: ["被害", "避難", "ライフライン", "ボランティア", "入浴"],
      headline: "住家被害の判定が進み、1,507棟を確認",
      summary: "停電は約1,590戸まで改善。住家被害の把握が進む一方、避難生活の長期化を見据えた入浴・子ども・福祉支援が課題として共有されました。",
      actions: ["火の君文化会館で入浴支援を開始", "熊本市・宇土市などの災害VC日程を具体化", "八代市の福祉避難所開設を完了"],
      note: "住家被害は現在判定分。今後の調査により増える可能性があります。"
    },
    {
      date: "2026-08-01", meeting: 495, disasterDay: 5, attendees: 210,
      pdf: "20260801火の国会議495回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "益城町", "甲佐町", "氷川町"],
      stats: { injured: 139, deaths: 36, evacuees: 9068, shelters: 218, outages: 1545, homes: 3429 },
      topics: ["被害", "避難", "ライフライン", "物資", "ボランティア"],
      headline: "支援ニーズのマッチングが本格化",
      summary: "避難所数が218か所へ減少。飲料水、衛生用品、簡易トイレ、段ボールベッドなど、具体的な物資・設備ニーズの調整が進みました。",
      actions: ["宇土市災害VCの開所準備", "物資ニーズをSEMA・EDAN等と調整", "断水地域で水を運べない世帯への支援を実施"],
      note: "停電値は『送電されているが停電している』事故受付数で、前日までの停電戸数とは定義が異なります。"
    },
    {
      date: "2026-08-02", meeting: 496, disasterDay: 6, attendees: 194,
      pdf: "20260802火の国会議496回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "益城町", "甲佐町", "氷川町"],
      stats: { injured: 152, deaths: 38, evacuees: 8556, shelters: 206, outages: 536, homes: 4042 },
      topics: ["被害", "避難", "断水", "住まい", "ボランティア"],
      headline: "避難者は8,556人、住まいの支援へ",
      summary: "避難者はピーク時から894人減少。断水は46,700戸で継続し、衛生・トイレ環境が優先課題に。宿泊、入浴、応急住宅の支援が動き始めました。",
      actions: ["宇土市災害VCが開所、翌日活動開始", "4市町で宿泊支援提供事業を決定", "賃貸型応急住宅・住宅応急修理の窓口を順次開設"],
      note: "住家被害4,042棟は現在判定分。断水は熊本市、宇城市、甲佐町、八代市、氷川町の計。"
    },
    {
      date: "2026-08-03", meeting: 497, disasterDay: 7, attendees: 258,
      pdf: "20260803火の国会議497回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 157, deaths: 38, evacuees: 8383, shelters: 162, outages: 85, homes: 12024, waterOutages: 45280 },
      topics: ["被害", "避難", "断水", "宿泊", "ボランティア", "気象"],
      headline: "ホテル避難の受付と災害VC活動が拡大",
      summary: "避難者は8,383人、避難所は162か所へ減少。ホテル避難の受付が始まり、熊本・宇土・御船などで災害ボランティアセンターの活動が進みました。",
      actions: ["ホテル避難の受け入れ94施設を確保", "宇土市・御船町で災害VC活動を開始", "台風接近を見据え土砂災害・強風・熱中症への注意を共有"],
      note: "住家被害はこの日から推定値で、前日までの現在判定分とは定義が異なります。停電値は事故受付数です。"
    },
    {
      date: "2026-08-04", meeting: 498, disasterDay: 8,
      pdf: "20260804火の国会議498回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 161, deaths: 38, evacuees: 7646, shelters: 146, outages: null, outageStatus: "おおむね解消", homes: 13393, waterOutages: 44380 },
      topics: ["被害", "避難", "断水", "住まい", "宿泊", "ボランティア"],
      headline: "停電はおおむね解消、応急住宅整備へ",
      summary: "停電はおおむね解消し、避難者は7,646人まで減少。一方で断水は44,380戸で続き、ホテル避難、応急住宅、災害ボランティア活動が本格化しています。",
      actions: ["ホテル避難の受け入れを114施設へ拡大", "宇城市・氷川町で最初の建設型応急住宅整備を決定", "熊本市・美里町・甲佐町で災害VC活動を開始"],
      note: "住家被害13,393棟は推定値。停電は会議資料の表現どおり『おおむね解消』で、0件とは扱っていません。"
    }
  ]
};
