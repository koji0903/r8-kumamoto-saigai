import { readdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://www.yokatainet.jp";
const siteName = "よか隊ネット熊本　災害・支援状況レポート";
const excluded = new Set(["404.html"]);
const organizationPages = new Set(["404.html", "index.html", "about.html", "join.html", "contact.html", "privacy.html", "accessibility.html"]);
// ページ専用のOGP画像。python3 tools/build-ogp-images.py で作る。
// ここに足したら画像も作ること（scripts/test-ogp.mjs が実体を確認する）。
const specialImages = new Map([
  ["uto-waste.html", "/ogp-uto-waste.png"],
  ["uto-bulletin.html", "/ogp-uto-bulletin.png"],
  ["uto-housing.html", "/ogp-uto-housing.png"],
  ["alert-channels.html", "/ogp-alert-channels.png"],
  ["volunteer-centers.html", "/ogp-volunteer-centers.png"],
  ["official-timeline.html", "/ogp-official-timeline.png"],
  ["official-water-recovery.html", "/ogp-official-water.png"],
  ["official-response-tracks.html", "/ogp-official-tracks.png"],
  ["hq-kumamoto.html", "/ogp-hq-kumamoto.png"],
  ["hq-yatsushiro.html", "/ogp-hq-yatsushiro.png"]
]);
const checkOnly = process.argv.includes("--check");
const stale = [];
const todayInJapan = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());

const escapeAttribute = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
const meta = (property, content, name = false) => `<meta ${name ? "name" : "property"}="${property}" content="${escapeAttribute(content)}">`;

function stripSeo(html) {
  return html
    .replace(/\s*<meta\s+(?:property|name)="(?:og:[^"]+|twitter:[^"]+|robots)"[^>]*>/gi, "")
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "");
}

function canonicalFor(file) {
  return file === "index.html" ? `${origin}/` : `${origin}/${file}`;
}

function lastModified(file) {
  try {
    const dirty = execFileSync("git", ["status", "--porcelain", "--", file], { cwd: root, encoding: "utf8" }).trim();
    if (dirty) return todayInJapan;
    return execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

const files = (await readdir(root)).filter(file => file.endsWith(".html") && !/^google[\w-]+\.html$/i.test(file));
for (const file of files) {
  const target = path.join(root, file);
  const original = await readFile(target, "utf8");
  let html = original;
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  if (!title || !description) throw new Error(`${file}: title または description がありません`);
  html = stripSeo(html);
  const canonical = canonicalFor(file);
  const isOrganizationPage = organizationPages.has(file) || /<body\b[^>]*class="[^"]*\borg-page\b/i.test(html);
  const imagePath = specialImages.get(file) || (isOrganizationPage ? "/ogp-organization.png" : "/ogp-disaster.png");
  const image = `${origin}${imagePath}`;
  const pageTitle = title.split("｜")[0];
  const robots = excluded.has(file) ? "noindex,follow" : "index,follow,max-image-preview:large";
  const tags = [
    `<link rel="canonical" href="${canonical}">`,
    meta("robots", robots, true),
    meta("og:type", "website"), meta("og:locale", "ja_JP"), meta("og:site_name", siteName),
    meta("og:title", pageTitle), meta("og:description", description), meta("og:url", canonical),
    meta("og:image", image), meta("og:image:secure_url", image), meta("og:image:type", "image/png"),
    meta("og:image:width", "1200"), meta("og:image:height", "630"), meta("og:image:alt", `${pageTitle}｜${siteName}`),
    meta("twitter:card", "summary_large_image", true), meta("twitter:title", pageTitle, true),
    meta("twitter:description", description, true), meta("twitter:image", image, true)
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
  const date = lastModified(file);
  return `  <url>\n    <loc>${canonicalFor(file)}</loc>${date ? `\n    <lastmod>${date}</lastmod>` : ""}\n  </url>`;
}).join("\n");
const sitemapPath = path.join(root, "sitemap.xml");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const currentSitemap = await readFile(sitemapPath, "utf8").catch(() => "");
if (sitemap !== currentSitemap) stale.push("sitemap.xml");
if (!checkOnly) await writeFile(sitemapPath, sitemap);
if (checkOnly && stale.length) throw new Error(`SEO生成物が未更新です: ${stale.join(", ")}。node tools/build-seo.mjs を実行してください`);
console.log(`SEOメタ情報 ${files.length}ページ / サイトマップ ${sitemapFiles.length}URL ${checkOnly ? "検査OK" : "を更新"}`);
