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
  ["uto-public-services.html", "/ogp-uto-public-services.png"],
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
  ["uki-support.html", "/ogp-uki-support.png"],
  ["reconstruction.html", "/ogp-reconstruction.png"],
  ["temporary-housing.html", "/ogp-temporary-housing.png"],
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
  ["support.html", "/ogp-support-fields.png"]
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
  ]
]);

function buildStructuredData(file, pageTitle, description, canonical) {
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
      inLanguage: "ja"
    },
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: pageTitle,
      description: description,
      isPartOf: { "@id": `${origin}/#website` },
      inLanguage: "ja"
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
    "municipality-support-compare.html"
  ];
  if (highPriority.includes(file)) {
    return { priority: "0.9", changefreq: "daily" };
  }
  const livingSupportPages = [
    "uto-support.html", "uto-living-support.html", "uto-repair.html", "uto-housing.html", "uto-jizokuka.html",
    "kumamoto-saishuppatsu.html",
    "uki-support.html", "uki-living-support.html",
    "hikawa-support.html", "hikawa-living-support.html", "hikawa-demolition.html",
    "yatsushiro-support.html", "yatsushiro-living-support.html", "yatsushiro-rebuild.html",
    "kumamoto-support.html", "kumamoto-living-support.html",
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
    if (item.startsWith("http://") || item.startsWith("https://") || item.startsWith("//")) continue;
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
  const jsonLd = buildStructuredData(file, pageTitle, description, canonical);
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
  return `  <url>\n    <loc>${canonicalFor(file)}</loc>${date ? `\n    <lastmod>${date}</lastmod>` : ""}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join("\n");
const sitemapPath = path.join(root, "sitemap.xml");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const currentSitemap = await readFile(sitemapPath, "utf8").catch(() => "");
if (sitemap !== currentSitemap) stale.push("sitemap.xml");
if (!checkOnly) await writeFile(sitemapPath, sitemap);
if (checkOnly && stale.length) throw new Error(`SEO生成物が未更新です: ${stale.join(", ")}。node tools/build-seo.mjs を実行してください`);
console.log(`SEOメタ情報 ${files.length}ページ / サイトマップ ${sitemapFiles.length}URL ${checkOnly ? "検査OK" : "を更新"}`);
execFileSync(process.execPath,["tools/build-site-search.mjs",...(checkOnly?["--check"]:[])],{cwd:root,stdio:"inherit"});
