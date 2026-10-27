import { readdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://www.yokatainet.jp";
const siteName = "よか隊ネット熊本　災害・支援状況レポート";
const excluded = new Set(["404.html"]);
// ページ専用のOGP画像。python3 tools/build-ogp-images.py で作る。
// ここに足したら画像も作ること（scripts/test-ogp.mjs が実体を確認する）。
const specialImages = new Map([
  ["demolition.html", "/ogp-demolition.png"],
  ["yatsushiro-demolition.html", "/ogp-yatsushiro-demolition.png"],
  ["uto-demolition.html", "/ogp-uto-demolition.png"],
  ["uki-demolition.html", "/ogp-uki-demolition.png"],
  ["kumamoto-demolition.html", "/ogp-kumamoto-demolition.png"],
  ["uto-public-services.html", "/ogp-uto-public-services.png"],
  ["uki-public-services.html", "/ogp-uki-public-services.png"],
  ["yatsushiro-public-services.html", "/ogp-yatsushiro-public-services.png"],
  ["hikawa-public-services.html", "/ogp-hikawa-public-services.png"],
  ["uto-handbook.html", "/ogp-uto-handbook.png"],
  ["uki-einou-saikai.html", "/ogp-uki-einou-saikai.png"],
  ["kumamoto-living-support.html", "/ogp-kumamoto-living-support.png"],
  ["yatsushiro-living-support.html", "/ogp-yatsushiro-living-support.png"],
  ["hikawa-living-support.html", "/ogp-hikawa-living-support.png"],
  ["uki-living-support.html", "/ogp-uki-living-support.png"],
  ["uto-support.html", "/ogp-uto-support.png"],
  ["uki-consultation.html", "/ogp-uki-consultation.png"],
  ["yatsushiro-safetynet4.html", "/ogp-yatsushiro-safetynet4.png"],
  ["priority-support-summary.html", "/ogp-priority-support.png"],
  ["yatsushiro-loan.html", "/ogp-yatsushiro-loan.png"],
  ["uto-jizokuka.html", "/ogp-uto-jizokuka.png"],
  ["kumamoto-saishuppatsu.html", "/ogp-kumamoto-saishuppatsu.png"],
  ["yatsushiro-rebuild.html", "/ogp-yatsushiro-rebuild.png"],
  ["yatsushiro-support.html", "/ogp-yatsushiro-support.png"],
  ["404.html", "/ogp-404.png"],
  ["index.html", "/ogp-home.png"],
  ["about.html", "/ogp-about.png"],
  ["join.html", "/ogp-join.png"],
  ["contact.html", "/ogp-contact.png"],
  ["privacy.html", "/ogp-privacy.png"],
  ["accessibility.html", "/ogp-accessibility.png"],
  ["kumamoto-support.html", "/ogp-kumamoto-support.png"],
  ["municipality-updates.html", "/ogp-municipality-updates.png"],
  ["uto-waste.html", "/ogp-uto-waste.png"],
  ["uto-bulletin.html", "/ogp-uto-bulletin.png"],
  ["uto-housing.html", "/ogp-uto-housing.png"],
  ["uto-repair.html", "/ogp-uto-repair.png"],
  ["alert-channels.html", "/ogp-alert-channels.png"],
  ["volunteer-centers.html", "/ogp-volunteer-centers.png"],
  ["official-timeline.html", "/ogp-official-timeline.png"],
  ["official-water-recovery.html", "/ogp-official-water.png"],
  ["official-response-tracks.html", "/ogp-official-tracks.png"],
  ["hq-kumamoto.html", "/ogp-hq-kumamoto.png"],
  ["hq-yatsushiro.html", "/ogp-hq-yatsushiro.png"],
  ["risai-certificate.html", "/ogp-risai-certificate.png"],
  ["hikawa-support.html", "/ogp-hikawa-support.png"],
  ["hikawa-demolition.html", "/ogp-hikawa-demolition.png"],
  ["hikawa-interest-subsidy.html", "/ogp-hikawa-interest-subsidy.png"],
  ["uki-support.html", "/ogp-uki-support.png"],
  ["reconstruction.html", "/ogp-reconstruction.png"],
  ["temporary-housing.html", "/ogp-temporary-housing.png"],
  ["disaster-laws.html", "/ogp-disaster-laws.png"],
  ["guide.html", "/ogp-guide.png"],
  ["municipalities.html", "/ogp-municipalities.png"],
  ["municipality-support-compare.html", "/ogp-support-compare.png"],
  ["hq-uto.html", "/ogp-hq-uto.png"],
  ["shelters.html", "/ogp-shelters.png"],
  ["timeline.html", "/ogp-timeline.png"],
  ["meetings.html", "/ogp-meetings.png"],
  ["terms.html", "/ogp-terms.png"],
  ["reconstruction-documents.html", "/ogp-reconstruction-documents.png"],
  ["reconstruction-money.html", "/ogp-reconstruction-money.png"],
  ["reconstruction-health-care.html", "/ogp-reconstruction-health.png"],
  ["reconstruction-family.html", "/ogp-reconstruction-family.png"],
  ["reconstruction-work-business.html", "/ogp-reconstruction-work.png"],
  ["reconstruction-agriculture-fishery.html", "/ogp-reconstruction-agri.png"],
  ["reconstruction-search.html", "/ogp-reconstruction-search.png"],
  ["reconstruction-official.html", "/ogp-reconstruction-official.png"],
  ["disaster.html", "/ogp-disaster-portal.png"],
  ["affected.html", "/ogp-affected.png"],
  ["supporters.html", "/ogp-supporters.png"],
  ["official.html", "/ogp-official.png"],
  ["support.html", "/ogp-support-fields.png"],
  ["sitemap.html", "/ogp-sitemap.png"],
  ["yatsushiro-well-repair.html", "/ogp-yatsushiro-well-repair.png"]
]);
const checkOnly = process.argv.includes("--check");
const stale = [];
const todayInJapan = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());

const escapeAttribute = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
const meta = (property, content, name = false) => `<meta ${name ? "name" : "property"}="${property}" content="${escapeAttribute(content)}">`;

function stripSeo(html) {
  return html
    .replace(/\s*<meta\s+(?:property|name)="(?:og:[^"]+|twitter:[^"]+|robots)"[^>]*>/gi, "")
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/\s*<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "");
}

function canonicalFor(file) {
  return file === "index.html" ? `${origin}/` : `${origin}/${file}`;
}

const specialFaqs = new Map([
  [
    "risai-certificate.html",
    [
      {
        q: "り災証明書と被災届出証明書の違いは何ですか？",
        a: "り災証明書は住家（居住用の家屋）の被害の程度（全壊、大規模半壊、中規模半壊、半壊、準半壊、一部損壊など）を自治体が現地調査・判定して公的に証明する書類です。公的支援金や住宅の応急修理、仮設住宅の申請に必要となります。一方、被災届出証明書は非住家（店舗、倉庫、車庫等）や動産（車、家財等）の被害について、届出があった事実を自治体が証明する書類です。"
      },
      {
        q: "片付けや修理の前に被害状況の写真を撮る際のポイントは？",
        a: "家の全景（4方向から）、浸水深が分かる引きの写真、表札、損壊した屋根・外壁・柱・基礎、室内の各部屋の被害状況（全景と床・壁・天井・建具の破損部位の拡大）を撮影してください。メジャー等を当てて被害の深さや幅が分かるようにすると判定がスムーズになります。"
      },
      {
        q: "り災証明書の申請に必要な書類は何ですか？",
        a: "1. 罹災証明書交付申請書（各自治体窓口またはHPからダウンロード）、2. 本人確認書類（マイナンバーカード、運転免許証、保険証等）、3. 被害状況が確認できるカラー写真です。代理人が申請する場合は委任状が必要となります。"
      }
    ]
  ],
  [
    "temporary-housing.html",
    [
      {
        q: "建設型応急住宅（仮設住宅）の入居要件はどうなっていますか？",
        a: "原則として、り災証明書の判定が「全壊」「大規模半壊」、または「中規模半壊」「半壊」であって解体・撤去を余儀なくされるなど、居住する住家を失った方が対象となります。自治体によって高齢者世帯や障害者世帯等の優先枠が設定されます。"
      },
      {
        q: "賃貸型応急住宅（みなし仮設）とはどのような制度ですか？",
        a: "民間の賃貸住宅を自治体が借り上げ、被災された方に無償で提供する制度です。家賃の上限額や入居期間（原則2年間）が定められており、被災者自身が物件を探して自治体と契約を結ぶ流れが一般的です。"
      }
    ]
  ],
  [
    "uto-repair.html",
    [
      {
        q: "住宅の応急修理制度（災害救助法）の限度額はいくらですか？",
        a: "1世帯あたりの限度額は最大757,000円（準半壊の場合は367,000円）です。日常生活に不可欠な最小限の修理（屋根、外壁、給排水、電気、トイレ等）が対象となります。"
      },
      {
        q: "応急修理制度を利用した工事の前に着工してしまった場合は対象になりますか？",
        a: "原則として自治体による工事前確認と依頼が必要です。ただし災害救助の緊急性から事前着工の救済措置が取られる場合もあるため、着工前の被災写真と見積書・領収書を必ず保管の上、宇土市役所の窓口へご相談ください。"
      }
    ]
  ],
  [
    "affected.html",
    [
      {
        q: "被災直後、まず何から手続きを進めればよいですか？",
        a: "まずは安全を確保した上で、家の被害状況を写真に記録してください（片付け・修理前）。次に自治体窓口またはオンラインで「り災証明書」の交付申請を行い、避難所の利用、住宅応急修理制度や仮設住宅の相談を進めます。"
      },
      {
        q: "生活費や当面の資金が足りない場合の公的支援はありますか？",
        a: "生活福祉資金の緊急小口資金（特例貸付）や、災害弔慰金・災害障害見舞金、被災者生活再建支援金（基礎支援金・加算支援金）、自治体独自の災害見舞金などがあります。社会福祉協議会や市役所の福祉課窓口で相談できます。"
      }
    ]
  ],
  [
    "kumamoto-saishuppatsu.html",
    [
      {
        q: "すでに修理を発注・完了してしまったが補助対象になりますか？",
        a: "対象になります（事前着手特例）。発災日（令和8年7月28日）以降に着手または完了した復旧事業であれば、交付決定前であっても補助対象に含まれます。ただし、被災前の状況や被害箇所の写真、発注書・契約書、請求書、口座振込の領収書・出金記録が揃っている必要があります。"
      },
      {
        q: "車両を買い替える（入替購入）場合の必須条件は何ですか？",
        a: "被災車両を必ず廃車（永久抹消登録）にすることが絶対条件です。下取りに出して中古車市場で再流通できる車両は「修理可能」とみなされ入替購入は認められません。また復旧後の車両には車体に企業名・屋号を明示し、運行日誌の記録、事業所車庫、任意保険の事業用登録を遵守する必要があります。"
      },
      {
        q: "見積書は1社だけでもよいですか？",
        a: "1件当たりの工事・購入費が税込100万円以上の場合は、原則として2者以上からの相見積もりが必要です。すでに発注済みで複数取得が困難な場合などは、「見積書が不足している理由書」を提出することで1者見積もりが例外的に認められます。"
      }
    ]
  ],
  [
    "demolition.html",
    [
      {
        q: "公費解体と自費解体（費用償還）の違いは何ですか？",
        a: "公費解体は自治体が所有者に代わって被災家屋の解体・運搬・処分を直接発注し、費用を全額公費（自己負担0円）で実施する制度です。自費解体（費用償還）は所有者が自ら解体業者と契約して費用を立替払いし、後日自治体が適正算定基準に基づき費用を償還（返金）する制度です。自費解体の場合も着工前の届出・写真やマニフェスト等の書類保全が必須となります。"
      },
      {
        q: "罹災証明書が「準半壊」や「一部損壊」でも公費解体の対象になりますか？",
        a: "国の災害廃棄物処理指針では原則として「全壊」「大規模半壊」「中規模半壊」が対象となります。ただし、半壊であっても倒壊や崩落のおそれが著しくそのままでは危険な場合や、自治体独自の危険家屋判定基準を満たす場合は対象となるケースがあります。各自治体の解体相談窓口へご確認ください。"
      },
      {
        q: "増築部分や物置・倉庫だけを部分的に解体することはできますか？",
        a: "環境省の災害廃棄物処理指針に基づき、住家としての一体性や構造上切り離しが可能な場合に限り、罹災判定を受けた危険な増築部分・別棟のみを公費解体の対象として申請できる場合があります。事前の現地立会確認が必要です。"
      }
    ]
  ],
  [
    "uto-support.html",
    [
      {
        q: "宇土市の住宅リフォーム助成事業は地震の応急修理と併用できますか？",
        a: "併用可能です。災害救助法に基づく住宅の応急修理制度（最大75.7万円）の完了後、市内施工業者によって追加のリフォームや改修工事を行う場合、宇土市独自の住宅リフォーム助成事業として最大25万円分の商品券交付を受けることができます。"
      },
      {
        q: "宇土市の子ども医療費助成の対象年齢と自己負担はどうなっていますか？",
        a: "宇土市では0歳から高校生年代（18歳到達後の最初の3月31日）までの通院・入院にかかる医療費（保険適用分）を全額助成しています。窓口で受給資格者証を提示することで現物給付（窓口無料）となります。"
      },
      {
        q: "宇土市の被災家屋公費解体の申請期限と窓口はどこですか？",
        a: "宇土市役所1階「すまい再建支援室」にて当日整理券制で申請を受け付けています。申請受付期限は令和8年12月28日までとなっています。"
      }
    ]
  ],
  [
    "yatsushiro-well-repair.html",
    [
      {
        q: "八代市で被災した井戸の公費修理（最大75.7万円）の対象条件は何ですか？",
        a: "令和8年熊本地震により破損・出水不良等が生じた井戸で、り災証明書の判定が半壊以上（準半壊は最大36.7万円）の世帯において、日常生活に不可欠な生活用水・飲用水として使用していた井戸が対象となります。市による事前現地確認と業者委託により実施されます。"
      },
      {
        q: "共同利用している井戸の場合、補助限度額はどうなりますか？",
        a: "複数の被災世帯で共同利用している井戸の場合、利用世帯数に応じて限度額が合算され、最大4世帯で最大302.8万円（1世帯あたり最大75.7万円×世帯数）まで公費修理の対象となります。"
      },
      {
        q: "井戸が復旧するまでの間の生活用水や給水支援はどうなっていますか？",
        a: "八代市環境課にて生活用水用の給水タンク設置や、要配慮世帯（高齢者・障がい者・乳幼児のいる世帯等）への戸別給水配送、および生活用水用ホース等の無料貸出支援が実施されています。"
      }
    ]
  ],
  [
    "yatsushiro-living-support.html",
    [
      {
        q: "八代市の被災者生活再建支援金の支給額と申請方法は？",
        a: "住家の全壊、大規模半壊、中規模半壊、半壊解体等の世帯に対し、基礎支援金（最大100万円）と住宅再建方法（建設・購入・補修・賃借）に応じた加算支援金（最大200万円）の合計最大300万円が支給されます。八代市役所本庁・各支所の特設窓口で申請できます。"
      },
      {
        q: "八代市で保育料の無償化や子育て支援はありますか？",
        a: "八代市では国制度の3〜5歳児無償化に加え、市独自事業として第2子以降の保育料無償化や0〜2歳児の児童発達支援無償化、高校生等までのこども医療費助成を実施しています。"
      }
    ]
  ],
  [
    "uki-living-support.html",
    [
      {
        q: "宇城市の高校生等医療費無償化の対象と申請方法は？",
        a: "宇城市にお住まいの0歳から18歳（高校生相当）までのお子さまを対象に、通院・入院時の保険診療自己負担分を全額助成しています。ひまわりカード（受給資格証）を県内医療機関の窓口に提示することで窓口負担なく受診できます。"
      },
      {
        q: "宇城市で木造住宅の耐震改修補助金はいくら受けられますか？",
        a: "昭和56年5月31日以前に着工された木造住宅を対象に、耐震診断の補助（自己負担原則無料〜少額）および耐震改修工事費用の補助（最大100万円等の助成枠）を実施しています。着工前の事前申請が必要です。"
      }
    ]
  ],
  [
    "hikawa-living-support.html",
    [
      {
        q: "氷川町独自の畳表張替助成（最大10万円）の対象条件は何ですか？",
        a: "氷川町内の特産であるい草・畳産業振興と定住支援のため、町内施工業者を利用して自宅の畳表張替・新調を行う町民に対し、費用の一部（最大10万円）を補助する町独自制度です。申請窓口は竜北庁舎産業振興課です。"
      },
      {
        q: "氷川町での被災者支援窓口や公費解体の受付はどこですか？",
        a: "福祉・義援金・り災証明関連の総合窓口は氷川町役場宮原庁舎、公費解体や上下水道・インフラ関連は竜北庁舎にて受け付けています。また竜翔センター内に地域支え合いセンターも開所しています。"
      }
    ]
  ],
  [
    "yatsushiro-loan.html",
    [
      {
        q: "災害援護資金貸付制度はどのような条件で無利子になりますか？",
        a: "世帯主の負傷や住家・家財の損壊被害を受けた世帯に対し最大350万円を貸し付ける制度です。保証人を立てることで据置期間（原則5年）を含め全期間「無利子（0%）」となります。保証人を立てない場合も年利1%の低利で利用できます。"
      },
      {
        q: "災害援護資金の所得制限の基準はどうなっていますか？",
        a: "世帯人員に応じた前年総所得限度額（1人世帯220万円、2人世帯430万円、3人世帯620万円など）が定められていますが、住家が全壊した場合は特例により所得制限限度額が大幅に引き上げられ（1,270万円まで）対象が広がります。"
      }
    ]
  ],
  [
    "uto-public-services.html",
    [
      {
        q: "宇土市役所の窓口開庁時間と、休日・夜間に証明書を取得する方法は？",
        a: "本庁舎の開庁時間は平日8:30〜17:15です。マイナンバーカードをお持ちの方は全国のコンビニエンスストアのマルチコピー機にて、土日祝日や夜間（6:30〜23:00）でも住民票の写しや印鑑登録証明書を取得できます。"
      },
      {
        q: "10月17日開所の宇土市地域支え合いセンターではどのような相談ができますか？",
        a: "宇土市福祉センター内に開設されており、仮設住宅（浦田町団地等）や在宅で避難生活を送る高齢者・被災世帯への戸別訪問、生活再建に向けた手続きの伴走支援、福祉・健康相談を社協と連携して実施しています。"
      }
    ]
  ]
]);

function buildStructuredData(file, pageTitle, description, canonical, fileDate) {
  const pageDate = fileDate || todayInJapan;
  const graph = [
    {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: "一般社団法人よか隊ネット熊本",
      url: `${origin}/`,
      logo: `${origin}/yokatai-logo.png`,
      address: {
        "@type": "PostalAddress",
        postalCode: "869-0404",
        addressRegion: "熊本県",
        addressLocality: "宇土市",
        streetAddress: "走潟町2235"
      },
      telephone: "090-2719-4037",
      email: "info.yokatai@gmail.com"
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      url: `${origin}/`,
      name: "一般社団法人よか隊ネット熊本",
      publisher: { "@id": `${origin}/#organization` },
      inLanguage: "ja",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${origin}/sitemap.html?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: pageTitle,
      description: description,
      isPartOf: { "@id": `${origin}/#website` },
      inLanguage: "ja",
      datePublished: "2026-07-28",
      dateModified: pageDate
    }
  ];

  if (file !== "index.html") {
    const breadcrumbItems = [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${origin}/` }
    ];

    const orgPages = ["join.html", "contact.html", "privacy.html", "accessibility.html"];
    const recordPages = ["timeline.html", "meetings.html", "official-timeline.html", "official-water-recovery.html", "official-response-tracks.html", "terms.html"];

    if (file === "about.html") {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: pageTitle, item: canonical });
    } else if (orgPages.includes(file)) {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "団体情報", item: `${origin}/about.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    } else if (file === "reconstruction.html") {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: pageTitle, item: canonical });
    } else if (file.startsWith("reconstruction-")) {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "暮らしの再建ナビ", item: `${origin}/reconstruction.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    } else if (file.startsWith("uto-")) {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "宇土市の支援・情報", item: `${origin}/municipalities.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    } else if (file.startsWith("uki-")) {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "宇城市の支援・情報", item: `${origin}/municipalities.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    } else if (file.startsWith("hikawa-")) {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "氷川町の支援・情報", item: `${origin}/municipalities.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    } else if (file.startsWith("yatsushiro-")) {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "八代市の支援・情報", item: `${origin}/municipalities.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    } else if (file.startsWith("kumamoto-")) {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "熊本市の支援・情報", item: `${origin}/municipalities.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    } else if (file.startsWith("hq-")) {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "自治体災害対策本部会議", item: `${origin}/municipalities.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    } else if (recordPages.includes(file)) {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "被災地の記録・検証", item: `${origin}/timeline.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    } else if (file === "disaster.html") {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: pageTitle, item: canonical });
    } else {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "令和8年熊本地震 支援情報", item: `${origin}/disaster.html` });
      breadcrumbItems.push({ "@type": "ListItem", position: 3, name: pageTitle, item: canonical });
    }

    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems
    });
  }

  const faqs = specialFaqs.get(file);
  if (faqs && faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map(faq => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a
        }
      }))
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function getSitemapMeta(file) {
  if (file === "index.html") {
    return { priority: "1.0", changefreq: "daily" };
  }
  const highPriority = [
    "disaster.html", "affected.html", "supporters.html", "municipalities.html",
    "municipality-updates.html", "reconstruction.html", "priority-support-summary.html",
    "municipality-support-compare.html", "disaster-laws.html", "demolition.html",
    "uto-support.html", "yatsushiro-living-support.html", "uki-living-support.html",
    "hikawa-living-support.html", "kumamoto-living-support.html", "yatsushiro-well-repair.html"
  ];
  if (highPriority.includes(file)) {
    return { priority: "0.9", changefreq: "daily" };
  }
  if (file === "sitemap.html") {
    return { priority: "0.7", changefreq: "weekly" };
  }
  const livingSupportPages = [
    "uto-living-support.html", "uto-repair.html", "uto-housing.html", "uto-jizokuka.html",
    "uto-demolition.html", "uto-public-services.html",
    "kumamoto-saishuppatsu.html", "kumamoto-support.html", "kumamoto-demolition.html",
    "uki-support.html", "uki-consultation.html", "uki-einou-saikai.html", "uki-demolition.html", "uki-public-services.html",
    "hikawa-support.html", "hikawa-demolition.html", "hikawa-interest-subsidy.html", "hikawa-public-services.html",
    "yatsushiro-support.html", "yatsushiro-rebuild.html", "yatsushiro-loan.html", "yatsushiro-safetynet4.html",
    "yatsushiro-demolition.html", "yatsushiro-public-services.html",
    "risai-certificate.html", "temporary-housing.html", "shelters.html", "volunteer-centers.html"
  ];
  if (livingSupportPages.includes(file) || file.startsWith("reconstruction-")) {
    return { priority: "0.8", changefreq: "weekly" };
  }
  const lowPriority = ["about.html", "join.html", "contact.html", "privacy.html", "accessibility.html"];
  if (lowPriority.includes(file)) {
    return { priority: "0.4", changefreq: "monthly" };
  }
  return { priority: "0.6", changefreq: "weekly" };
}

const globalAssets = new Set([
  "styles.css",
  "design-system.css",
  "org-site.css",
  "org-site.js",
  "site-phase.js",
  "favicon.png",
  "apple-touch-icon.png",
  "manifest.webmanifest",
  "vendor/leaflet/leaflet.js",
  "vendor/leaflet/leaflet.css"
]);

const gitDateCache = new Map();

function getFileDate(relPath) {
  if (gitDateCache.has(relPath)) return gitDateCache.get(relPath);
  try {
    const dirty = execFileSync("git", ["status", "--porcelain", "--", relPath], { cwd: root, encoding: "utf8" }).trim();
    if (dirty) {
      gitDateCache.set(relPath, todayInJapan);
      return todayInJapan;
    }
    // 未コミット時の todayInJapan と揃えるため、コミット日時も日本時間の日付で取る。
    // %cs（UTC基準）だと、日本時間の朝9時より前に作られたコミットが前日付になり検査が落ちる。
    const d = execFileSync("git", ["log", "-1", "--format=%cd", "--date=format-local:%Y-%m-%d", "--", relPath], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, TZ: "Asia/Tokyo" }
    }).trim();
    gitDateCache.set(relPath, d);
    return d;
  } catch {
    gitDateCache.set(relPath, "");
    return "";
  }
}

function lastModified(file, html = "") {
  const deps = [file];
  const scripts = [...html.matchAll(/<script[^>]+src=["\x27]([^"\x27?#]+)/gi)].map(m => m[1]);
  const links = [...html.matchAll(/<link[^>]+(?:rel=["\x27]stylesheet["\x27][^>]+href=["\x27]|href=["\x27][^"\x27]+["\x27][^>]+rel=["\x27]stylesheet["\x27])([^"\x27?#]+)/gi)].map(m => m[1]);

  for (const item of [...scripts, ...links]) {
    if (globalAssets.has(item)) continue;
    if (item.startsWith("http://") || item.startsWith("https://") || item.startsWith("//") || item.includes("..")) continue;
    const rel = item.startsWith("/") ? item.slice(1) : item;
    if (globalAssets.has(rel)) continue;
    deps.push(rel);
  }

  let latestDate = "";
  for (const dep of deps) {
    const d = getFileDate(dep);
    if (d > latestDate) latestDate = d;
  }
  return latestDate || todayInJapan;
}

const htmlContents = new Map();
const files = (await readdir(root)).filter(file => file.endsWith(".html") && !/^google[\w-]+\.html$/i.test(file));
for (const file of files) {
  const target = path.join(root, file);
  const original = await readFile(target, "utf8");
  htmlContents.set(file, original);
  let html = original;
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  if (!title || !description) throw new Error(`${file}: title または description がありません`);
  html = stripSeo(html);
  const canonical = canonicalFor(file);
  const imagePath = specialImages.get(file);
  if (!imagePath) throw new Error(`${file}: ページ専用OGP画像の割り当てがありません`);
  const image = `${origin}${imagePath}`;
  const pageTitle = title.split("｜")[0];
  const robots = excluded.has(file) ? "noindex,follow" : "index,follow,max-image-preview:large";
  const fileDate = lastModified(file, original);
  const jsonLd = buildStructuredData(file, pageTitle, description, canonical, fileDate);
  const tags = [
    `<link rel="canonical" href="${canonical}">`,
    meta("robots", robots, true),
    meta("og:type", "website"), meta("og:locale", "ja_JP"), meta("og:site_name", siteName),
    meta("og:title", pageTitle), meta("og:description", description), meta("og:url", canonical),
    meta("og:image", image), meta("og:image:secure_url", image), meta("og:image:type", "image/png"),
    meta("og:image:width", "1200"), meta("og:image:height", "630"), meta("og:image:alt", `${pageTitle}｜${siteName}`),
    meta("twitter:card", "summary_large_image", true), meta("twitter:title", pageTitle, true),
    meta("twitter:description", description, true), meta("twitter:image", image, true),
    `<script type="application/ld+json">${jsonLd}</script>`
  ].join("\n  ");
  html = html.replace(/<\/head>/i, `  ${tags}\n</head>`);
  if (html !== original) stale.push(file);
  if (!checkOnly) await writeFile(target, html);
}

const sitemapFiles = files.filter(file => !excluded.has(file)).sort((a, b) => {
  if (a === "index.html") return -1;
  if (b === "index.html") return 1;
  return a.localeCompare(b, "en");
});
const urls = sitemapFiles.map(file => {
  const date = lastModified(file, htmlContents.get(file));
  const { priority, changefreq } = getSitemapMeta(file);
  const imagePath = specialImages.get(file);
  const imageXml = imagePath ? `\n    <image:image>\n      <image:loc>${origin}${imagePath}</image:loc>\n    </image:image>` : "";
  return `  <url>\n    <loc>${canonicalFor(file)}</loc>${date ? `\n    <lastmod>${date}</lastmod>` : ""}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${imageXml}\n  </url>`;
});

// 自治体配信記事アーカイブ目録（official-articles/）をサイトマップに登録
try {
  const archiveIndexPath = path.join(root, "official-articles/index.html");
  const archiveContent = await readFile(archiveIndexPath, "utf8").catch(() => "");
  if (archiveContent) {
    const archiveDate = lastModified("official-articles/index.html", archiveContent);
    urls.push(`  <url>\n    <loc>${origin}/official-articles/</loc>${archiveDate ? `\n    <lastmod>${archiveDate}</lastmod>` : ""}\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`);
  }
} catch {}

const sitemapPath = path.join(root, "sitemap.xml");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`;
const currentSitemap = await readFile(sitemapPath, "utf8").catch(() => "");
if (sitemap !== currentSitemap) stale.push("sitemap.xml");
if (!checkOnly) await writeFile(sitemapPath, sitemap);
if (checkOnly && stale.length) throw new Error(`SEO生成物が未更新です: ${stale.join(", ")}。node tools/build-seo.mjs を実行してください`);
console.log(`SEOメタ情報 ${files.length}ページ / サイトマップ ${urls.length}URL ${checkOnly ? "検査OK" : "を更新"}`);
execFileSync(process.execPath,["tools/build-site-search.mjs",...(checkOnly?["--check"]:[])],{cwd:root,stdio:"inherit"});
