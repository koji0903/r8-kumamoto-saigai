window.REPORT_DATA = {
  disaster: { occurred: "2026-07-28T16:27:00+09:00", name: "令和8年熊本地震" },
  officialSources: [
    { level: "国・8月7日更新", name: "内閣府 令和8年熊本地震", description: "被害・政府対応、災害救助法、激甚災害、特定非常災害、会議資料の公式集約", url: "https://www.bousai.go.jp/updates/r8kumamoto_jishin/index.html" },
    { level: "県・8月7日更新", name: "熊本県 令和8年熊本地震", description: "被害情報、災害対策本部資料、注意喚起、生活・支援情報の公式集約", url: "https://www.pref.kumamoto.jp/soshiki/1/274517.html" },
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
      pdf: "sources/hinokuni-meetings/20260729火の国会議.pdf"
    },
    {
      date: "2026-08-02", meeting: 496, page: 3, category: "生活支援",
      areas: ["宇土市", "宇城市", "八代市", "氷川町"],
      title: "宿泊支援提供事業の実施を決定", detail: "県旅館ホテル生活衛生同業組合と連携した宿泊支援の対象。8月2日は宇土市でホテルへの移動1件が報告されました。",
      pdf: "sources/hinokuni-meetings/20260802火の国会議496回.pdf"
    },
    {
      date: "2026-08-02", meeting: 496, page: 3, category: "生活支援",
      areas: ["天草市", "上天草市", "宇土市", "宇城市", "八代市", "氷川町", "水俣市", "御船町"],
      title: "入浴支援事業を実施", detail: "県の入浴支援事業が実施中と報告されました。",
      pdf: "sources/hinokuni-meetings/20260802火の国会議496回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 2, category: "ライフライン",
      areas: ["宇城市", "甲佐町", "八代市", "氷川町"],
      title: "断水が継続", detail: "4市町の合計で44,380戸。宇城市は試験通水実施中です。市町別の戸数は資料に記載されていません。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 2, category: "生活支援",
      areas: ["熊本市", "宇土市", "宇城市", "八代市", "氷川町", "甲佐町", "美里町", "御船町", "嘉島町"],
      title: "ホテル避難の対象地域", detail: "宿泊支援提供事業の実施対象。受け入れ施設114施設、申込289件、マッチング済み6件は全体値で、市町別内訳ではありません。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 3, category: "生活支援",
      areas: ["熊本市", "天草市", "上天草市", "宇土市", "宇城市", "八代市", "氷川町", "水俣市", "御船町", "美里町"],
      title: "入浴支援事業を実施", detail: "県の入浴支援事業が実施中と報告されました。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 3, category: "住まい",
      areas: ["宇城市", "氷川町"],
      title: "建設型応急住宅の整備を決定", detail: "最初の建設型応急住宅を整備する自治体として報告されました。戸数・場所はこの資料に記載されていません。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 3, category: "住まい",
      areas: ["御船町", "甲佐町", "美里町"],
      title: "住宅支援制度の受付を開始", detail: "賃貸型応急住宅と住宅の応急修理制度の受付開始自治体として報告されました。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["熊本市"], title: "災害VCが活動開始", detail: "8月3日開所、8月4日活動開始。一般ボランティア募集は8月5日開始予定。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["嘉島町"], title: "災害VCが活動中", detail: "8月2日から活動開始と報告されました。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["益城町"], title: "災害VCが活動中", detail: "8月1日に開所・活動開始。全国から1日30人を募集。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["八代市"], title: "災害VCは開所、活動開始日は未定", detail: "7月29日開所。鏡町武道場とグラウンドに設置。設置場所も断水継続中。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["宇土市"], title: "災害VCが活動中", detail: "8月2日開所、8月3日活動開始。設置場所は時間通水。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["宇城市"], title: "災害VCは開所、活動開始日は未定", detail: "物資仕分けや段ボールベッド組み立て等を約50人で実施。ニーズ約160件は家屋内片付け等。いずれも会議報告時点の概数です。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["美里町"], title: "災害VCが活動開始", detail: "7月29日開所、8月4日活動開始。全国から募集し、当日は約30人が参加。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["御船町"], title: "災害VCが活動中", detail: "8月1日開所、8月3日活動開始。仮置き場は8月28日まで設置予定。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["甲佐町"], title: "災害VCが活動開始", detail: "7月29日開所、8月4日活動開始。九州内からボランティアを募集。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["氷川町"], title: "災害VCは活動準備中", detail: "8月3日からニーズ調査、8月8日活動開始予定。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["芦北町"], title: "災害VCを開所", detail: "8月4日開所、8月7日活動開始予定（準備ができ次第開始）。旧田ノ浦支所に設置。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-04", meeting: 498, page: 4, category: "ボランティア",
      areas: ["上天草市"], title: "通常VCとして活動見込み", detail: "通常のボランティアセンターとして活動見込みと報告されました。",
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf"
    },
    {
      date: "2026-08-05", meeting: 499, page: 2, category: "ライフライン",
      areas: ["宇城市", "甲佐町", "八代市", "氷川町"],
      title: "断水が継続", detail: "4市町の合計で43,710戸。試験通水実施中です。市町別戸数は火の国会議資料に記載されていません。",
      pdf: "sources/hinokuni-meetings/20260805火の国会議499回.pdf"
    },
    {
      date: "2026-08-05", meeting: 499, page: 2, category: "生活支援",
      areas: ["熊本市", "宇土市", "宇城市", "八代市", "氷川町", "甲佐町", "美里町", "御船町", "嘉島町", "益城町"],
      title: "ホテル避難の対象地域を拡大", detail: "受け入れ127施設、申込561件。連絡済192件のうち、マッチング済み16件、調整中54件、辞退57件、不通65件は事業全体値です。",
      pdf: "sources/hinokuni-meetings/20260805火の国会議499回.pdf"
    },
    {
      date: "2026-08-05", meeting: 499, page: 3, category: "生活支援",
      areas: ["熊本市", "天草市", "上天草市", "宇土市", "宇城市", "八代市", "氷川町", "水俣市", "御船町", "美里町", "嘉島町", "益城町"],
      title: "入浴支援事業を実施", detail: "県の入浴支援事業が実施中と報告されました。",
      pdf: "sources/hinokuni-meetings/20260805火の国会議499回.pdf"
    },
    {
      date: "2026-08-05", meeting: 499, page: 3, category: "住まい",
      areas: ["八代市", "水俣市", "菊池市", "美里町", "西原村", "御船町", "益城町", "嘉島町", "甲佐町"],
      title: "賃貸型応急住宅の受付を開始", detail: "会議資料に受付開始自治体として列挙。資料中で益城町は重複記載されています。",
      pdf: "sources/hinokuni-meetings/20260805火の国会議499回.pdf"
    },
    {
      date: "2026-08-05", meeting: 499, page: 3, category: "住まい",
      areas: ["水俣市", "菊池市", "宇土市", "上天草市", "天草市", "合志市", "美里町", "大津町", "菊陽町", "西原村", "御船町", "甲佐町", "芦北町"],
      title: "住宅の応急修理受付を開始", detail: "準備が整った自治体から受付を開始。緊急修理制度は8月27日まで延長と報告されました。",
      pdf: "sources/hinokuni-meetings/20260805火の国会議499回.pdf"
    },
    {
      date: "2026-08-05", meeting: 499, page: 4, category: "ボランティア",
      areas: ["宇城市"], title: "個人宅ニーズ受付を開始", detail: "8月5日に受付開始。民生委員と連携し約160件を把握、当日は約50人が活動したと県社協から報告されました。",
      pdf: "sources/hinokuni-meetings/20260805火の国会議499回.pdf"
    },
    {
      date: "2026-08-05", meeting: 499, page: 4, category: "ボランティア",
      areas: ["八代市"], title: "災害VC活動開始を8月10日の目標に", detail: "ニーズ受付チラシを公開・配布。鏡地区、千丁地区で大きな被害があり、サテライト設置も検討しています。",
      pdf: "sources/hinokuni-meetings/20260805火の国会議499回.pdf"
    },
    {
      date: "2026-08-05", meeting: 499, page: 5, category: "ボランティア",
      areas: ["氷川町"], title: "災害VCは8月8日活動開始予定", detail: "コンテナやスポットクーラー等を整備し、1日50人を募集して開始する予定です。",
      pdf: "sources/hinokuni-meetings/20260805火の国会議499回.pdf"
    },
    {
      date: "2026-08-06", meeting: 500, page: 2, category: "ライフライン",
      areas: ["宇城市", "甲佐町", "八代市", "氷川町"], title: "断水が継続", detail: "4市町の合計で36,880戸。試験通水実施中です。市町別戸数は火の国会議資料に記載されていません。",
      pdf: "sources/hinokuni-meetings/20260806火の国会議500回.pdf"
    },
    {
      date: "2026-08-06", meeting: 500, page: 2, category: "生活支援",
      areas: ["熊本市", "宇土市", "宇城市", "八代市", "氷川町", "甲佐町", "美里町", "御船町", "嘉島町", "益城町"],
      title: "ホテル避難の受付が進む", detail: "受け入れ134施設、申込760件。連絡済486件の内訳はマッチング済み61件、調整中225件、辞退94件、不通106件で、いずれも事業全体値です。",
      pdf: "sources/hinokuni-meetings/20260806火の国会議500回.pdf"
    },
    {
      date: "2026-08-06", meeting: 500, page: 3, category: "住まい",
      areas: ["宇城市", "氷川町", "熊本市"], title: "建設型応急住宅を整備", detail: "宇城市3団地50戸、氷川町1団地20戸を整備中。熊本市は城南地区40戸、富合地区10戸を建設予定と報告されました。",
      pdf: "sources/hinokuni-meetings/20260806火の国会議500回.pdf"
    },
    {
      date: "2026-08-06", meeting: 500, page: 5, category: "ボランティア",
      areas: ["八代市"], title: "災害VCは8月10日から活動", detail: "8月10日から16日まで1日30人を募集。鏡地区を拠点とし、離れた地区への対応が課題と報告されました。",
      pdf: "sources/hinokuni-meetings/20260806火の国会議500回.pdf"
    },
    {
      date: "2026-08-06", meeting: 500, page: 9, category: "住まい",
      areas: ["宇城市"], title: "応急危険度判定は約6割", detail: "宇城市では約8,000件が対象で約6割の判定を終了し、8月12日の完了を目標としていると建築士会から報告されました。",
      pdf: "sources/hinokuni-meetings/20260806火の国会議500回.pdf"
    },
    {
      date: "2026-08-07", meeting: 501, page: 2, category: "ライフライン",
      areas: ["宇城市", "八代市", "氷川町"], title: "断水36,730戸、応急復旧は8月末目途", detail: "3市町の合計値で、市町別戸数は原資料に記載されていません。試験通水を実施中です。",
      pdf: "sources/hinokuni-meetings/20260807火の国会議501回.pdf"
    },
    {
      date: "2026-08-07", meeting: 501, page: 2, category: "生活支援",
      areas: ["熊本市", "宇土市", "宇城市", "八代市", "氷川町", "甲佐町", "美里町", "御船町", "嘉島町", "益城町"], title: "ホテル避難の申込み868件", detail: "受入れ140施設。連絡済677件の内訳はマッチング済み88件、調整中349件、辞退102件、不通138件で、いずれも事業全体値です。",
      pdf: "sources/hinokuni-meetings/20260807火の国会議501回.pdf"
    },
    {
      date: "2026-08-07", meeting: 501, page: 3, category: "住まい",
      areas: ["宇城市", "氷川町", "熊本市"], title: "建設型応急住宅120戸を整備・予定", detail: "宇城市50戸、氷川町20戸を整備中。熊本市は城南地区40戸、富合地区10戸を建設予定です。",
      pdf: "sources/hinokuni-meetings/20260807火の国会議501回.pdf"
    },
    {
      date: "2026-08-07", meeting: 501, page: 4, category: "ボランティア",
      areas: ["芦北町", "氷川町", "八代市"], title: "災害VC11か所の活動開始見通し", detail: "芦北町は8月7日、氷川町は8月8日、八代市は8月10日に活動開始し、全センターで活動開始済みまたは開始日決定と報告されました。",
      pdf: "sources/hinokuni-meetings/20260807火の国会議501回.pdf"
    },
    {
      date: "2026-08-07", meeting: 501, page: 8, category: "要配慮者",
      areas: ["宇城市", "氷川町", "八代市"], title: "障害者・外国人への訪問支援を展開", detail: "障害のある在宅避難者への物資配布とニーズ調査を実施。氷川町と八代市には外国人向け物資拠点を設けると報告されました。",
      pdf: "sources/hinokuni-meetings/20260807火の国会議501回.pdf"
    },
    {
      date: "2026-08-08", meeting: 502, page: 2, category: "ライフライン",
      areas: ["宇城市", "八代市", "氷川町"], title: "断水34,780戸、試験通水を継続", detail: "3市町の合計値です。市町別戸数は原資料に記載されていません。8月末を目途に応急復旧の見込みと報告されました。",
      pdf: "sources/hinokuni-meetings/20260808火の国会議502回.pdf"
    },
    {
      date: "2026-08-08", meeting: 502, page: 2, category: "生活支援",
      areas: ["熊本市", "宇土市", "宇城市", "八代市", "氷川町", "甲佐町", "美里町", "御船町", "嘉島町", "益城町"], title: "ホテル避難の申込み935件", detail: "受入れ148施設。連絡済862件の内訳はマッチング済み98件、調整中450件、辞退106件、不通208件で、いずれも事業全体値です。",
      pdf: "sources/hinokuni-meetings/20260808火の国会議502回.pdf"
    },
    {
      date: "2026-08-08", meeting: 502, page: 3, category: "住まい",
      areas: ["宇城市", "氷川町", "美里町", "熊本市"], title: "建設型応急住宅132戸を整備・予定", detail: "宇城市50戸、氷川町20戸を整備中、美里町12戸は8月9日着手。熊本市は城南地区40戸、富合地区10戸を建設予定です。",
      pdf: "sources/hinokuni-meetings/20260808火の国会議502回.pdf"
    },
    {
      date: "2026-08-08", meeting: 502, page: 5, category: "ボランティア",
      areas: ["氷川町"], title: "災害VCが活動開始、52人参加", detail: "8月8日に活動を開始し、52人のボランティアが参加。県内では10市町の災害VCが稼働中と報告されました。",
      pdf: "sources/hinokuni-meetings/20260808火の国会議502回.pdf"
    },
    {
      date: "2026-08-08", meeting: 502, page: 6, category: "避難",
      areas: ["宇土市"], title: "避難所集約を検討", detail: "宇土市災害対策本部の張り紙として、8月11日15時に全避難所を閉鎖し、新たな避難所を開設予定との情報が共有されました。最新の公式情報を確認してください。",
      pdf: "sources/hinokuni-meetings/20260808火の国会議502回.pdf"
    },
    {
      date: "2026-08-08", meeting: 502, page: 8, category: "要配慮者",
      areas: ["宇城市", "美里町", "八代市", "氷川町"], title: "母子・在宅・避難所支援を継続", detail: "宇城市の母子健康避難所、感染対策、美里町の在宅・車中泊への支援、八代市の段ボールベッド活用、氷川町の福祉サービス再接続が報告されました。",
      pdf: "sources/hinokuni-meetings/20260808火の国会議502回.pdf"
    },
    {
      date: "2026-08-08", meeting: 502, page: 9, category: "住まい",
      areas: ["八代市", "宇城市", "氷川町", "宇土市"], title: "家屋保全と応急危険度判定を支援", detail: "ブルーシート展張は八代市24棟、宇城市18棟。八代市鏡の応急危険度判定は当日終了し、氷川町では緊急修理制度の簡易化した仕組みを実施。宇土市ではブロック塀廃材の搬出先が課題と報告されました。",
      pdf: "sources/hinokuni-meetings/20260808火の国会議502回.pdf"
    }
  ],
  supportCategories: [
    { key: "materials", label: "物資・食料", description: "飲料水、衛生用品、寝具、炊き出しなど" },
    { key: "water", label: "水・衛生・入浴", description: "生活用水、トイレ、衛生環境、入浴支援" },
    { key: "shelter", label: "避難生活", description: "避難所環境、段ボールベッド、車中泊" },
    { key: "housing", label: "住まい", description: "ホテル避難、応急住宅、住宅修理" },
    { key: "welfare", label: "福祉・医療", description: "要配慮者、福祉避難所、医療との連携" },
    { key: "children", label: "子ども・子育て", description: "子どもの居場所、妊産婦・乳幼児支援" },
    { key: "volunteer", label: "ボランティア・助成", description: "活動人員、災害VC、支援団体向け助成" },
    { key: "access", label: "情報・アクセシビリティ", description: "聴覚障害、外国人、情報入手支援" }
  ],
  supportEvents: [
    { date:"2026-08-01", meeting:495, page:6, category:"materials", title:"物資ニーズのマッチングを調整", detail:"水、体拭きシート、災害VC用飲料水などの物資ニーズをSEMA関連で調整中と報告。", areas:[], pdf:"sources/hinokuni-meetings/20260801火の国会議495回.pdf" },
    { date:"2026-08-01", meeting:495, page:6, category:"shelter", title:"避難所設備等のニーズを調査", detail:"トイレカー、ラップポン、段ボールベッド、紙管パーテーション、キッチンカーによる炊き出しなどをEDAN関連で調査。", areas:[], pdf:"sources/hinokuni-meetings/20260801火の国会議495回.pdf" },
    { date:"2026-08-01", meeting:495, page:7, category:"water", title:"生活用水不足が継続", detail:"八代市・氷川町では飲料水は充足してきたとの報告がある一方、生活用水不足が課題。宇土市災害VCではトイレカー支援が必要と報告。", areas:["八代市","氷川町","宇土市"], pdf:"sources/hinokuni-meetings/20260801火の国会議495回.pdf" },
    { date:"2026-08-01", meeting:495, page:8, category:"children", title:"避難所で子どもの居場所を実施", detail:"八代市第二中学校で子どもひろばを実施し、小中高校生約20人が参加。人数は会議報告時点の概数。", areas:["八代市"], pdf:"sources/hinokuni-meetings/20260801火の国会議495回.pdf" },
    { date:"2026-08-02", meeting:496, page:5, category:"volunteer", title:"避難所の物資作業に人手不足", detail:"八代市体育館で物資受付・仕分けの人手が不足し、保健師が物資作業に追われていると報告。", areas:["八代市"], pdf:"sources/hinokuni-meetings/20260802火の国会議496回.pdf" },
    { date:"2026-08-02", meeting:496, page:5, category:"shelter", title:"断水避難所の衛生・トイレを優先", detail:"水が出ない避難所では衛生・トイレの課題が深刻で、環境改善の優先順位が高いと共有。", areas:[], pdf:"sources/hinokuni-meetings/20260802火の国会議496回.pdf" },
    { date:"2026-08-02", meeting:496, page:11, category:"welfare", title:"福祉・生活ニーズを連携支援", detail:"DMATとDWATが八代市・氷川町・宇城市を中心に連携し、福祉避難所、施設入所、移送などに対応。買い物支援のニーズも報告。", areas:["八代市","氷川町","宇城市"], pdf:"sources/hinokuni-meetings/20260802火の国会議496回.pdf" },
    { date:"2026-08-03", meeting:497, page:3, category:"housing", title:"ホテル避難の移動を開始", detail:"宿泊支援提供事業で宇土市1件、宇城市1件のホテル移動を報告。受け入れ施設94施設を確保。", areas:["宇土市","宇城市"], pdf:"sources/hinokuni-meetings/20260803火の国会議497回.pdf" },
    { date:"2026-08-03", meeting:497, page:7, category:"children", title:"親子安心ステーションを開設", detail:"1歳未満の子どもを育てる家族と妊婦を対象に、八代市豊原と熊本市城南の助産院各1か所で開設。", areas:["八代市","熊本市"], pdf:"sources/hinokuni-meetings/20260803火の国会議497回.pdf" },
    { date:"2026-08-04", meeting:498, page:2, category:"housing", title:"ホテル避難の受付を拡大", detail:"対象9市町村、受け入れ114施設。8月4日14時時点で申込289件、マッチング済み6件。いずれも事業全体値。", areas:["熊本市","宇土市","宇城市","八代市","氷川町","甲佐町","美里町","御船町","嘉島町"], pdf:"sources/hinokuni-meetings/20260804火の国会議498回.pdf" },
    { date:"2026-08-04", meeting:498, page:3, category:"housing", title:"応急住宅と住宅修理の支援", detail:"宇城市・氷川町で建設型応急住宅の整備を決定。御船町・甲佐町・美里町で賃貸型応急住宅と住宅応急修理の受付を開始。", areas:["宇城市","氷川町","御船町","甲佐町","美里町"], pdf:"sources/hinokuni-meetings/20260804火の国会議498回.pdf" },
    { date:"2026-08-04", meeting:498, page:6, category:"materials", title:"飲料水と配布用品のニーズ", detail:"氷川町で飲料水ニーズを報告。2リットル水を提供する場合は紙コップも必要との意見を共有。", areas:["氷川町"], pdf:"sources/hinokuni-meetings/20260804火の国会議498回.pdf" },
    { date:"2026-08-04", meeting:498, page:8, category:"children", title:"子どもの預かり・居場所支援", detail:"美里町で片付けや仕事の間に子どもを預けたいニーズ、芦北町で子どもの心理的ストレス、八代市で遊び場支援が報告。", areas:["美里町","芦北町","八代市"], pdf:"sources/hinokuni-meetings/20260804火の国会議498回.pdf" },
    { date:"2026-08-04", meeting:498, page:9, category:"access", title:"遠隔手話通訳の利用支援", detail:"宇城市で手話話者4人、氷川町でろう者1人が避難所にいると報告。遠隔手話通訳の利用方法を周囲が支援する必要があると共有。", areas:["宇城市","氷川町"], pdf:"sources/hinokuni-meetings/20260804火の国会議498回.pdf" },
    { date:"2026-08-04", meeting:498, page:12, category:"volunteer", title:"支援団体向け助成情報を共有", detail:"日本財団の助成プログラムと、中央共同募金会の「ボラサポ・令和8年熊本地震」助成公募開始を共有。申請条件・期限は各公式情報の確認が必要。", areas:[], pdf:"sources/hinokuni-meetings/20260804火の国会議498回.pdf" },
    { date:"2026-08-05", meeting:499, page:7, category:"shelter", title:"避難所の食事・衛生・医療備品に課題", detail:"八代市の複数避難所で食事の偏り、手洗い用水、血圧計・体温計・パルスオキシメーター、暑熱下の移動式トイレなどの課題が報告されました。", areas:["八代市"], pdf:"sources/hinokuni-meetings/20260805火の国会議499回.pdf" },
    { date:"2026-08-05", meeting:499, page:7, category:"welfare", title:"避難所の福祉アセスメントを継続", detail:"DWATが八代・宇城・氷川・宇土で福祉的課題を確認し、必要時にショートステイや福祉避難所への搬送を調整しています。", areas:["八代市","宇城市","氷川町","宇土市"], pdf:"sources/hinokuni-meetings/20260805火の国会議499回.pdf" },
    { date:"2026-08-05", meeting:499, page:8, category:"materials", title:"水なしで食べられる食品・福祉用品のニーズ", detail:"断水地域では水なしで食べられる食品、高齢者施設ではおむつ・おしりふき・とろみ剤・口腔ケア用品の不足が報告されました。", areas:[], pdf:"sources/hinokuni-meetings/20260805火の国会議499回.pdf" },
    { date:"2026-08-05", meeting:499, page:8, category:"shelter", title:"車中泊ヘルプブックを配布", detail:"トヨタ自動車がグランメッセに冊子を設置し、アイシン九州へ約1,000部、トヨタ自動車九州に約5,000部を用意したと報告しました。", areas:[], pdf:"sources/hinokuni-meetings/20260805火の国会議499回.pdf" },
    { date:"2026-08-05", meeting:499, page:9, category:"children", title:"グルテンフリー離乳食の寄付予定", detail:"大津町内企業から、ほうれんそう50袋・人参50袋の計100袋（各50g）をKVOADへ寄付予定と報告されました。", areas:["大津町"], pdf:"sources/hinokuni-meetings/20260805火の国会議499回.pdf" },
    { date:"2026-08-05", meeting:499, page:10, category:"access", title:"外国人の出張相談とこころの支援を検討", detail:"八代・宇城・宇土を訪問。コミュニティに属さない人への到達や、不安・夜間の屋外就寝など見えにくい課題が報告されました。", areas:["八代市","宇城市","宇土市"], pdf:"sources/hinokuni-meetings/20260805火の国会議499回.pdf" },
    { date:"2026-08-05", meeting:499, page:10, category:"welfare", title:"ペット救護本部を設置", detail:"県獣医師会・熊本市が連携して8月4日に設置し、熊本県獣医師会を窓口にペットの一時預かりを開始しました。", areas:["熊本市"], pdf:"sources/hinokuni-meetings/20260805火の国会議499回.pdf" },
    { date:"2026-08-05", meeting:499, page:12, category:"housing", title:"緊急修理制度を8月27日まで延長", detail:"住家被害の拡大を防ぐ緊急修理制度について、発災から31日間となる8月27日まで延長と報告されました。", areas:[], pdf:"sources/hinokuni-meetings/20260805火の国会議499回.pdf" },
    { date:"2026-08-05", meeting:499, page:13, category:"volunteer", title:"交通費補助・支援団体向け助成を共有", detail:"ボラGO第1回は8月14日正午まで。日本財団、中央共同募金会、KEIRIN、公益推進協会の助成情報が共有されました。条件・期限は各公式情報の確認が必要です。", areas:[], pdf:"sources/hinokuni-meetings/20260805火の国会議499回.pdf" },
    { date:"2026-08-06", meeting:500, page:6, category:"shelter", title:"避難所運営への不満と退所を報告", detail:"食事の量・質、段ボールベッドやシャワーの未提供などへの不満から、避難所を出て車中泊を選ぶ人がいたとDWATから報告されました。個別避難所名は原資料に記載されていません。", areas:[], pdf:"sources/hinokuni-meetings/20260806火の国会議500回.pdf" },
    { date:"2026-08-06", meeting:500, page:7, category:"shelter", title:"車中泊は減少傾向、残る課題を確認", detail:"宇城市では車中泊が減る一方、建物への恐怖、仕事や子どもの校区、情報不足などから継続する人がいると報告。在宅者への情報到達も課題です。", areas:["宇城市"], pdf:"sources/hinokuni-meetings/20260806火の国会議500回.pdf" },
    { date:"2026-08-06", meeting:500, page:8, category:"materials", title:"避難所2か所へ不足物資を搬入", detail:"八代トヨオカ地建アリーナと八代市第四中学校へ、ボディシート、調理用品、食品、子ども用おむつ、湯沸かし保温ポットなどを搬入したと報告されました。", areas:["八代市"], pdf:"sources/hinokuni-meetings/20260806火の国会議500回.pdf" },
    { date:"2026-08-06", meeting:500, page:8, category:"access", title:"視覚障害者の生活支援を実施", detail:"断水地域で給水を取りに行けない人など約25人に4日ほどで対応し、水・食料の配送や専門家訪問が可能と共有されました。人数は会議報告時点の概数です。", areas:["宇城市","宇土市","氷川町","八代市"], pdf:"sources/hinokuni-meetings/20260806火の国会議500回.pdf" },
    { date:"2026-08-06", meeting:500, page:9, category:"welfare", title:"ペット同伴避難場所の環境に課題", detail:"八代市トヨオカアリーナではペット同伴避難場所の屋根状態が悪く、空調の効く代替場所や専門的助言が必要と報告されました。", areas:["八代市"], pdf:"sources/hinokuni-meetings/20260806火の国会議500回.pdf" },
    { date:"2026-08-06", meeting:500, page:12, category:"volunteer", title:"支援団体向け助成期限を更新", detail:"日本財団は申請期限を8月31日まで延長。中央共同募金会とKEIRINは8月21日締切と共有されました。申請前に各公式情報の最新条件を確認してください。", areas:[], pdf:"sources/hinokuni-meetings/20260806火の国会議500回.pdf" },
    { date:"2026-08-07", meeting:501, page:6, category:"access", title:"物資を取りに行けない在宅避難者を訪問", detail:"八代市日奈久で、車がなく物資を受け取りに行けない人へ物資を届け、支援制度の申請が難しい人を地域包括支援センター等につないだと報告されました。", areas:["八代市"], pdf:"sources/hinokuni-meetings/20260807火の国会議501回.pdf" },
    { date:"2026-08-07", meeting:501, page:6, category:"shelter", title:"避難所集約と家財取り出し支援の必要性", detail:"熊本市では拠点避難所への集約が進み、全壊・半壊相当の住家から安全に家財を取り出すための支援団体の協力が必要と共有されました。", areas:["熊本市"], pdf:"sources/hinokuni-meetings/20260807火の国会議501回.pdf" },
    { date:"2026-08-07", meeting:501, page:7, category:"children", title:"子どもの居場所と衛生面の支援を継続", detail:"避難所等で子どもの居場所づくりが進む一方、氷川町の公民館では水遊びの衛生面、八代市鏡小学校では子どもの活動機会が課題として共有されました。", areas:["氷川町","八代市"], pdf:"sources/hinokuni-meetings/20260807火の国会議501回.pdf" },
    { date:"2026-08-07", meeting:501, page:8, category:"access", title:"障害者・外国人への訪問と物資支援", detail:"宇城・氷川・八代で障害のある在宅避難者への物資配布とニーズ調査を実施。外国人向け物資拠点を氷川町と八代市に設け、県外国人サポートセンターと連携すると報告されました。", areas:["宇城市","氷川町","八代市"], pdf:"sources/hinokuni-meetings/20260807火の国会議501回.pdf" },
    { date:"2026-08-07", meeting:501, page:8, category:"materials", title:"災害VC資機材を9市町へ搬入", detail:"県社協と協働する熊本資機材ネットワークが、益城・御船・甲佐・宇土・美里・嘉島・芦北・宇城・氷川へ災害VC用資機材を搬入済みと報告しました。", areas:["益城町","御船町","甲佐町","宇土市","美里町","嘉島町","芦北町","宇城市","氷川町"], pdf:"sources/hinokuni-meetings/20260807火の国会議501回.pdf" },
    { date:"2026-08-07", meeting:501, page:9, category:"housing", title:"応急危険度判定とブルーシート施工を支援", detail:"宇城市では約8,000件を応急危険度判定の対象とし約6割を終了、8月12日の完了を目標と報告。ブルーシート施工の推奨方法をまとめた冊子の周知も依頼されました。", areas:["宇城市"], pdf:"sources/hinokuni-meetings/20260807火の国会議501回.pdf" },
    { date:"2026-08-07", meeting:501, page:4, category:"volunteer", title:"災害VC11か所の活動開始見通しが整う", detail:"芦北町は8月7日、氷川町は8月8日、八代市は8月10日に活動開始。これにより11か所すべてで活動開始済みまたは開始日決定と報告されました。", areas:["芦北町","氷川町","八代市"], pdf:"sources/hinokuni-meetings/20260807火の国会議501回.pdf" },
    { date:"2026-08-08", meeting:502, page:5, category:"volunteer", title:"氷川町災害VCが活動開始", detail:"52人のボランティアが参加し、県内10市町の災害VCが稼働中と報告。前日までの暫定累計は参加2,000人超、依頼1,200件超です。", areas:["氷川町"], pdf:"sources/hinokuni-meetings/20260808火の国会議502回.pdf" },
    { date:"2026-08-08", meeting:502, page:6, category:"shelter", title:"避難所集約と家財取り出し支援を共有", detail:"熊本市では拠点避難所への集約後、危険な住家から必要品を取り出す支援が必要。宇土市では8月11日の避難所再編予定が共有されました。", areas:["熊本市","宇土市"], pdf:"sources/hinokuni-meetings/20260808火の国会議502回.pdf" },
    { date:"2026-08-08", meeting:502, page:7, category:"materials", title:"災害VC資機材を9市町へ搬入", detail:"益城・御船・甲佐・宇土・美里・嘉島・芦北・宇城・氷川へ初動セットを搬入済み。追加要請にも随時対応中です。", areas:["益城町","御船町","甲佐町","宇土市","美里町","嘉島町","芦北町","宇城市","氷川町"], pdf:"sources/hinokuni-meetings/20260808火の国会議502回.pdf" },
    { date:"2026-08-08", meeting:502, page:7, category:"children", title:"子どもの居場所・学習支援を拡大", detail:"児童養護施設の子どもと職員をキャンプへ招待。嘉島町・美里町で遊び場づくりが進み、県立高校内の学習スペース提供も予定されています。", areas:["嘉島町","美里町"], pdf:"sources/hinokuni-meetings/20260808火の国会議502回.pdf" },
    { date:"2026-08-08", meeting:502, page:8, category:"welfare", title:"母子健康避難所・感染対策・福祉接続を支援", detail:"宇城市の母子健康避難所に2世帯が避難。新型コロナ事例を踏まえた感染対策、美里町の在宅・車中泊支援、八代市の段ボールベッド活用、氷川町の福祉サービス再接続が共有されました。", areas:["宇城市","美里町","八代市","氷川町"], pdf:"sources/hinokuni-meetings/20260808火の国会議502回.pdf" },
    { date:"2026-08-08", meeting:502, page:9, category:"access", title:"外国人向け食材配布拠点を案内", detail:"八代市田中西町のアジア・ベトナム食品店で、国籍を問わず食材を配布し、ハラル食も用意しているとの情報が共有されました。", areas:["八代市"], pdf:"sources/hinokuni-meetings/20260808火の国会議502回.pdf" },
    { date:"2026-08-08", meeting:502, page:9, category:"welfare", title:"被災ペットの一時預かりを受付", detail:"熊本県獣医師会を窓口に、被災ペットの一時預かり受付が開始されたと案内されました。", areas:[], pdf:"sources/hinokuni-meetings/20260808火の国会議502回.pdf" },
    { date:"2026-08-08", meeting:502, page:9, category:"housing", title:"家屋保全・緊急修理の支援を前進", detail:"県要請のブルーシート展張は八代市24棟、宇城市18棟。氷川町では緊急修理制度の簡易化した仕組みを実施し、県域の瓦業者による支援準備も報告されました。", areas:["八代市","宇城市","氷川町"], pdf:"sources/hinokuni-meetings/20260808火の国会議502回.pdf" },
    { date:"2026-08-08", meeting:502, page:10, category:"volunteer", title:"写真洗浄と支援団体向け助成を案内", detail:"八代・氷川の避難所と災害VCへ写真洗浄のチラシを配布。ボラGO、日本財団、中央共同募金会、KEIRIN等の助成・交通費支援情報も共有されました。", areas:["八代市","氷川町"], pdf:"sources/hinokuni-meetings/20260808火の国会議502回.pdf" }
  ],
  metrics: [
    { key: "evacuees", label: "避難者", unit: "人", color: "#e45e35" },
    { key: "shelters", label: "避難所", unit: "か所", color: "#d39b2b" },
    { key: "outages", label: "停電・受付", unit: "件／戸", color: "#3b8a78" },
    { key: "waterOutages", label: "断水", unit: "戸", color: "#2d79a8" },
    { key: "homes", label: "住家被害（把握・推定）", unit: "棟", color: "#6577a6" }
  ],
  days: [
    {
      date: "2026-07-29", meeting: 492, disasterDay: 2, attendees: 499,
      pdf: "sources/hinokuni-meetings/20260729火の国会議.pdf",
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
      pdf: "sources/hinokuni-meetings/20260730火の国会議493回.pdf",
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
      pdf: "sources/hinokuni-meetings/20260731火の国会議494回.pdf",
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
      pdf: "sources/hinokuni-meetings/20260801火の国会議495回.pdf",
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
      pdf: "sources/hinokuni-meetings/20260802火の国会議496回.pdf",
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
      pdf: "sources/hinokuni-meetings/20260803火の国会議497回.pdf",
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
      pdf: "sources/hinokuni-meetings/20260804火の国会議498回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 161, deaths: 38, evacuees: 7646, shelters: 146, outages: null, outageStatus: "おおむね解消", homes: 13393, waterOutages: 44380, waterOutageAreas: ["宇城市", "甲佐町", "八代市", "氷川町"] },
      topics: ["被害", "避難", "断水", "住まい", "宿泊", "ボランティア"],
      headline: "停電はおおむね解消、応急住宅整備へ",
      summary: "停電はおおむね解消し、避難者は7,646人まで減少。一方で断水は44,380戸で続き、ホテル避難、応急住宅、災害ボランティア活動が本格化しています。",
      actions: ["ホテル避難の受け入れを114施設へ拡大", "宇城市・氷川町で最初の建設型応急住宅整備を決定", "熊本市・美里町・甲佐町で災害VC活動を開始"],
      note: "住家被害13,393棟は推定値。停電は会議資料の表現どおり『おおむね解消』で、0件とは扱っていません。"
    },
    {
      date: "2026-08-05", meeting: 499, disasterDay: 9, attendees: 217,
      pdf: "sources/hinokuni-meetings/20260805火の国会議499回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 181, deaths: 38, evacuees: 7155, shelters: 133, outages: null, outageStatus: "おおむね解消", homes: 14562, waterOutages: 43710, waterOutageAreas: ["宇城市", "甲佐町", "八代市", "氷川町"] },
      topics: ["被害", "避難", "断水", "住まい", "宿泊", "ボランティア", "避難所環境"],
      headline: "避難者7,155人、現場ニーズの具体化が進む",
      summary: "避難者は7,155人、避難所は133か所へ減少しました。断水は43,710戸で継続。ホテル避難の申込増加、災害VCの本格化とともに、避難所の食事・衛生・医療備品など具体的な課題が報告されています。",
      actions: ["ホテル避難の受け入れを127施設へ拡大", "宇城市で個人宅ニーズ受付を開始", "緊急修理制度を8月27日まで延長"],
      note: "人的被害181人は死亡38人を含む会議資料の総数。住家被害14,562棟は推定値。停電は前日の会議資料の『おおむね解消』を継承し、0件とは扱っていません。"
    },
    {
      date: "2026-08-06", meeting: 500, disasterDay: 10, attendees: 191,
      pdf: "sources/hinokuni-meetings/20260806火の国会議500回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 184, deaths: 38, evacuees: 6721, shelters: 125, outages: null, outageStatus: "おおむね解消", homes: 15697, waterOutages: 36880, waterOutageAreas: ["宇城市", "甲佐町", "八代市", "氷川町"] },
      topics: ["被害", "避難", "断水", "住まい", "宿泊", "ボランティア", "避難所環境", "要配慮者"],
      headline: "避難者6,721人、在宅・車中泊への支援が課題に",
      summary: "避難者は6,721人、避難所は125か所へ減少し、断水は36,880戸で継続しています。ホテル避難と応急住宅整備が進む一方、避難所運営への不満、在宅・車中泊者への情報、要配慮者支援が報告されました。",
      actions: ["ホテル避難の受け入れを134施設へ拡大", "宇城・氷川・熊本で建設型応急住宅を整備", "八代市災害VCの8月10日活動開始を決定"],
      note: "人的被害184人は死亡38人を含む会議資料の総数。住家被害15,697棟は推定値。PDF表紙は日時を2026年8月5日と記載していますが、ファイル名と本文の県資料・事業実績が8月6日時点のため、本サイトでは8月6日の記録として掲載します。参加者は現地20人、オンライン174人に対し、原資料の合計欄は191人です。"
    },
    {
      date: "2026-08-07", meeting: 501, disasterDay: 11, attendees: 167,
      pdf: "sources/hinokuni-meetings/20260807火の国会議501回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 200, deaths: 38, evacuees: 6651, shelters: 125, outages: null, outageStatus: "おおむね解消", homes: 17306, waterOutages: 36730, waterOutageAreas: ["宇城市", "八代市", "氷川町"] },
      topics: ["被害", "避難", "断水", "住まい", "宿泊", "ボランティア", "在宅避難", "子ども", "要配慮者"],
      headline: "避難者6,651人、在宅・要配慮者支援を具体化",
      summary: "避難者は6,651人、避難所は125か所。断水は36,730戸で続く一方、ホテル避難の申込みは868件となり、在宅避難者、子ども、障害者、外国人への訪問・物資支援が具体化しています。",
      actions: ["ホテル避難の受入施設を140施設へ拡大", "災害VC11か所すべての活動開始見通しを確認", "障害者・外国人向け物資拠点と訪問支援を展開"],
      note: "人的被害200人は死亡38人を含む会議資料の総数。住家被害17,306棟は推定値。PDF表紙の日時は2026年8月5日と記載されていますが、ファイル名と本文の情報時点が8月7日のため、本サイトでは8月7日の記録として掲載します。"
    },
    {
      date: "2026-08-08", meeting: 502, disasterDay: 12, attendees: 99,
      pdf: "sources/hinokuni-meetings/20260808火の国会議502回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 208, deaths: 39, evacuees: 6355, shelters: 118, outages: null, outageStatus: "おおむね解消", homes: 18791, waterOutages: 34780, waterOutageAreas: ["宇城市", "八代市", "氷川町"] },
      topics: ["被害", "避難", "断水", "住まい", "宿泊", "ボランティア", "子ども", "要配慮者", "家屋保全"],
      headline: "避難者6,355人、地域別の生活再建支援が進む",
      summary: "避難所は118か所、避難者は6,355人へ減少し、断水は34,780戸で継続しています。氷川町災害VCが活動を開始し、避難所再編、応急住宅、子ども・要配慮者・家屋保全への支援が進みました。",
      actions: ["氷川町災害VCが52人で活動開始", "ホテル避難の受入施設を148施設へ拡大", "宇城・氷川・美里・熊本で建設型応急住宅を整備・予定"],
      note: "人的被害208人は死亡39人を含む会議資料の総数。住家被害18,791棟は推定値。断水34,780戸は宇城市・八代市・氷川町の3市町合計で、市町別戸数は原資料に記載されていません。"
    },
    {
      date: "2026-08-10", meeting: 503, disasterDay: 14, attendees: 176,
      pdf: "sources/hinokuni-meetings/20260810火の国会議503回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 211, deaths: 39, evacuees: 6108, shelters: 97, outages: null, outageStatus: "おおむね解消", homes: 21815, waterOutages: 34040, waterOutageAreas: ["宇城市", "八代市", "氷川町"] },
      topics: ["被害", "避難", "断水", "住まい", "ボランティア", "子ども", "要配慮者", "家屋保全", "制度"],
      headline: "県内全市町村へ生活再建支援法を適用、全11災害VCが活動開始",
      summary: "避難所は97か所、避難者は6,108人へ減少し、断水は34,040戸で継続しています。県内全市町村への被災者生活再建支援法の適用が決まり、八代市の開始により11市町すべての災害VCが活動を開始しました。",
      actions: ["県内全市町村へ被災者生活再建支援法を適用", "八代市災害VCが78人で活動を開始", "応急住宅・住宅修理の受付地域を拡大"],
      note: "人的被害211人は死亡39人を含む会議資料の総数。住家被害の総数欄は12,815棟と記載されていますが、内訳（全壊699、大規模半壊20、半壊1,025、一部破損7,974、未確定12,097）の合計と同日の熊本県公式集計はいずれも21,815棟のため、21,815棟として整理しています。断水34,040戸は宇城市・八代市・氷川町の3市町合計です。"
    },
    {
      date: "2026-08-11", meeting: 504, disasterDay: 15, attendees: 104,
      pdf: "sources/hinokuni-meetings/20260811火の国会議504回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 392, deaths: 39, evacuees: 3714, shelters: 89, outages: null, outageStatus: "おおむね解消", homes: 23404, waterOutages: 33300, waterOutageAreas: ["宇城市", "八代市", "氷川町"] },
      topics: ["被害", "避難", "断水", "住まい", "ボランティア", "子ども", "要配慮者", "家屋保全", "制度"],
      headline: "避難者3,714人、避難所環境と生活再建の支援を継続",
      summary: "避難所は89か所、避難者は3,714人となり、断水は33,300戸で継続しています。避難所の通信・洗濯環境、子どもや要配慮者、家屋保全など、生活再建に向けた個別課題が共有されました。",
      actions: ["はくおうIIの入浴・休憩利用を再開", "避難所の通信・洗濯環境の改善を調整", "ブルーシート施工前の被害写真記録を周知"],
      note: "人的被害392人は死亡39人を含む会議資料の総数。住家被害23,404棟は推定値。表紙は現地19人・オンライン96人に対して合計104人と記載されており、日別一覧では原資料の合計欄を採用しています。"
    },
    {
      date: "2026-08-12", meeting: 505, disasterDay: 16, attendees: 157,
      pdf: "sources/hinokuni-meetings/20260812火の国会議505回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 392, deaths: 39, evacuees: 3714, shelters: 89, outages: null, outageStatus: "おおむね解消", homes: 23404, waterOutages: 33300, waterOutageAreas: ["宇城市", "八代市", "氷川町"] },
      topics: ["避難", "断水", "食事", "住まい", "子ども", "要配慮者", "外国人", "家屋保全"],
      headline: "避難所・在宅避難者の食事、水、衛生環境を重点共有",
      summary: "8月11日時点の県集計を継続掲載。避難所の通信・シャワー、在宅避難者を含む食事支援、断水地域の高齢者施設、乳児院や外国人への支援課題が共有されました。",
      actions: ["氷川町避難所のモバイルルーター運用を確認", "熊本市3避難所へシャワーを設置", "断水地域の高齢者施設と乳児院の状況把握を進める"],
      note: "被害統計は8月11日時点の第21回熊本県災害対策本部会議資料。人的被害392人は死亡39人を含み、住家被害23,404棟は推定値です。"
    },
    {
      date: "2026-08-13", meeting: 506, disasterDay: 17, attendees: 135,
      pdf: "sources/hinokuni-meetings/20260813火の国会議506回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 393, deaths: 39, evacuees: 3684, shelters: 82, outages: null, outageStatus: "おおむね解消", homes: 28203, waterOutages: 27760, waterOutageAreas: ["宇城市", "八代市", "氷川町"] },
      topics: ["被害", "避難", "断水", "住まい", "食事", "子ども", "物資", "要配慮者", "家屋保全"],
      headline: "断水は27,760戸へ減少、支援情報を地域へ届ける課題を共有",
      summary: "避難所は82か所、避難者は3,684人、断水は27,760戸となりました。物資が初めて届いたという住民の声や、罹災証明を取得しにくい要配慮者など、制度・支援情報の周知課題が共有されました。",
      actions: ["住家被害認定調査と罹災証明交付の進捗を共有", "氷川町の炊き出し調整窓口を案内", "巡回支援時に公的支援情報も届けるよう推奨"],
      note: "人的被害393人は死亡39人を含む会議資料の総数。住家被害28,203棟は推定値。断水27,760戸は宇城市・八代市・氷川町の3市町合計です。"
    },
    {
      date: "2026-08-14", meeting: 507, disasterDay: 18, attendees: 112,
      pdf: "sources/hinokuni-meetings/20260814火の国会議507回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: { injured: 393, deaths: 39, evacuees: 3684, shelters: 82, outages: null, outageStatus: "おおむね解消", homes: 28203, waterOutages: 27760, waterOutageAreas: ["宇城市", "八代市", "氷川町"] },
      topics: ["避難", "断水", "住まい", "食事", "子ども", "物資", "要配慮者", "ペット", "家屋保全"],
      headline: "複合的な生活課題と、支援情報の確実な伝達を確認",
      summary: "県災害対策本部が未開催のため、被害統計は8月13日時点を掲載。避難所の食事、断水地域の施設、子ども、ペット同伴世帯、危険度判定後の家屋対応など複合的な課題が共有されました。",
      actions: ["避難所の食事供給状況を再確認", "ペット同伴で住まいに困る要配慮世帯を支援につなぐ", "応急危険度判定結果を市町村・支援団体へ共有するよう提言"],
      note: "本日は熊本県災害対策本部会議が未開催のため、人的被害・住家被害・避難・断水は8月13日時点の第22回会議資料を再掲しています。"
    },
    {
      date: "2026-08-15", meeting: 508, disasterDay: 19, attendees: 130,
      pdf: "sources/hinokuni-meetings/20260815火の国会議508回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "上天草市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: {
        injured: 393, deaths: 39,
        evacuees: 3205, shelters: 80,
        outages: null, outageStatus: "おおむね解消",
        homes: 30894, waterOutages: 26450,
        waterOutageAreas: ["宇城市", "八代市", "氷川町"]
      },
      topics: ["被害", "避難", "断水", "住まい", "証明", "食事", "子ども", "物資", "要配慮者", "ペット", "家屋保全", "ボランティア"],
      headline: "生活再建支援金が全市町村に適用、応急危険度判定は終了",
      summary: "避難者は3,205人まで減少し、断水は8月末を目途に解消の見込みが示されました。被災者生活再建支援法が県内全市町村に適用され、応急危険度判定は8月12日で終了。一方、水道未契約の井戸水世帯の断水が統計に表れていない問題が報告されました。",
      actions: [
        "被災者生活再建支援金の申請窓口を準備が整った市町村から順次開設",
        "8月17日に県のホテル等避難者健康観察コールセンターを開設",
        "災害ごみ集積場の混雑解消に向け開場時間の延長・変更を調整"
      ],
      note: "避難所80か所・避難者3,205人は11市町の合計で、7月30日のピーク時は26市町村9,450人でした。断水26,450戸には水道契約のない井戸水世帯が含まれておらず、八代市松崎町では約200世帯が公式統計外で影響を受けていると報告されています。"
    },
    {
      date: "2026-08-16", meeting: 509, disasterDay: 20, attendees: 90,
      pdf: "sources/hinokuni-meetings/20260816火の国会議509回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "上天草市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: {
        injured: 393, deaths: 39,
        evacuees: 3205, shelters: 80,
        outages: null, outageStatus: "おおむね解消",
        homes: 30894, waterOutages: 26450,
        waterOutageAreas: ["宇城市", "八代市", "氷川町"]
      },
      topics: ["ボランティア", "避難", "断水", "住まい", "証明", "食事", "子ども", "物資", "要配慮者", "外国人", "ペット", "家屋保全"],
      headline: "災害ボランティアセンターへ県外ブロックの応援派遣が始まる",
      summary: "8月16日から県外ブロックの応援職員が4市町の災害ボランティアセンターに入りました。熊本市は8月14日に復興総室を設置し、罹災証明の交付後の手続きをまとめて受けられる窓口を南区に置く方向で調整しています。被害統計は8月15日時点の県資料を引き続き掲載しています。",
      actions: [
        "熊本市・八代市・宇城市・氷川町の災害VCが県外ブロックの応援を受け入れ",
        "熊本市が復興総室を設置し、ワンストップ窓口を南区に置く方向で調整",
        "宇土市の一部地域で応急危険度判定が未実施のため、県へ調査区域の見直しを要請する方針を確認"
      ],
      note: "議事録が引用しているのは8月15日14時時点の第23回熊本県災害対策本部会議資料で、前日の第508回と同じ数値です。断水26,450戸には水道契約のない井戸水世帯は含まれていません。"
    },
    {
      date: "2026-08-17", meeting: 510, disasterDay: 21, attendees: 102,
      pdf: "sources/hinokuni-meetings/20260817火の国会議510回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "上天草市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: {
        injured: 396, deaths: 39,
        evacuees: 3053, shelters: 70,
        outages: null, outageStatus: "おおむね解消",
        homes: 31951, waterOutages: 7380,
        waterOutageAreas: ["宇城市", "八代市", "氷川町"]
      },
      topics: ["被害", "断水", "避難", "住まい", "証明", "食事", "子ども", "物資", "要配慮者", "外国人", "ペット", "家屋保全"],
      headline: "断水が26,450戸から7,380戸へ、避難所は70か所に",
      summary: "断水が7,380戸まで減り、避難所は70か所・避難者は3,053人となりました。一方で宇城市小川地区では断水が続き、洗濯や入浴ができず川で行水している方がいると報告されています。ホテル避難はマッチング323件・727人に増え、辞退240件も記録されました。",
      actions: [
        "8月30日に氷川町で外国から来た方のための出張相談会を開催",
        "災害ごみ仮置場の運用を環境省・熊本県社協・KVOADで協議",
        "断水が続く地域向けに500〜1,000Lの給水タンクの提供を呼びかけ"
      ],
      note: "議事録の見出しは8月15日・第23回災害対策本部会議ですが、掲載された数値は県が公表した8月17日14時時点（第24回）と一致します。半壊1,163棟だけは内訳の合計が住家被害31,951棟に合わず、県の同時点の資料では1,268棟です。"
    },
    {
      date: "2026-08-18", meeting: 511, disasterDay: 22, attendees: 95,
      pdf: "sources/hinokuni-meetings/20260818火の国会議511回.pdf",
      areas: ["熊本市", "八代市", "宇土市", "宇城市", "上天草市", "美里町", "御船町", "嘉島町", "益城町", "甲佐町", "氷川町", "芦北町"],
      stats: {
        injured: 396, deaths: 39,
        evacuees: 3053, shelters: 70,
        outages: null, outageStatus: "おおむね解消",
        homes: 31951, waterOutages: 7380,
        waterOutageAreas: ["宇城市", "八代市", "氷川町"]
      },
      topics: ["避難", "断水", "住まい", "子ども", "物資", "要配慮者", "外国人", "家屋保全", "ボランティア"],
      headline: "避難所を生活の場に戻す運営と、障害のある方の相談窓口",
      summary: "八代市の主要2避難所で熊本YMCAが運営支援を始めました。10年前の避難所運営の経験者から、避難者が日常を取り戻し、地域へ温かく送り出せる関係をつくる運営の考え方が共有されました。障害種別を問わず相談を受ける被災地障害者センターも立ち上がっています。",
      actions: [
        "八代市の主要2避難所で熊本YMCAが運営支援を開始",
        "被災地障害者センターが障害種別を問わず相談を受付",
        "災害VCの敷地内に専用の災害ごみ仮置場を設ける案を検討"
      ],
      note: "被害統計は8月17日14時時点の第24回熊本県災害対策本部会議資料。人的被害396人は死亡39人を含む総数で、住家被害31,951棟は推定値、断水7,380戸は宇城市・八代市・氷川町の3市町合計です。"
    }
  ]
};
