import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = (await readdir(root))
  .filter(file => file.endsWith(".html") && file !== "404.html" && !/^google/i.test(file))
  .sort();

const decode = value =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number(code)));

const text = value =>
  decode(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

const match = (html, pattern) => text(html.match(pattern)?.[1] || "");

const detectCategory = (file) => {
  if (/demolition|repair|temporary-housing|uto-housing|well-repair/.test(file)) return "住まい・解体";
  if (/loan|rebuild|safetynet|jizokuka|saishuppatsu|interest-subsidy|einou-saikai|consultation|living-support|support-compare|reconstruction-money|priority-support|handbook|risai|guide\./.test(file)) return "支援制度・お金";
  if (/shelter|waste|public-services|alert-channels|water-recovery/.test(file)) return "被害・避難所";
  if (/timeline|meeting|hq-|official|terms|disaster-laws/.test(file)) return "日々の記録・会議";
  if (/volunteer|supporter|support\.html/.test(file)) return "支援活動・VC";
  if (/uto-|uki-|yatsushiro-|hikawa-|kumamoto-/.test(file)) return "支援制度・お金";
  if (/about|join|contact|privacy|accessibility/.test(file)) return "団体情報";
  return "総合案内・ナビ";
};

const detectArea = (file, title) => {
  if (/yatsushiro/.test(file) || /八代/.test(title)) return "八代市";
  if (/uto/.test(file) || /宇土/.test(title)) return "宇土市";
  if (/uki/.test(file) || /宇城/.test(title)) return "宇城市";
  if (/hikawa/.test(file) || /氷川/.test(title)) return "氷川町";
  if (/kumamoto/.test(file) || /熊本市/.test(title)) return "熊本市";
  return "熊本県全域";
};

const detectPriority = (file) => {
  if (["affected.html", "disaster.html", "reconstruction.html", "municipality-support-compare.html"].includes(file)) return 100;
  if (["shelters.html", "timeline.html", "meetings.html", "volunteer-centers.html"].includes(file)) return 90;
  if (/living-support|well-repair|uto-repair|demolition/.test(file)) return 80;
  if (/yatsushiro-loan|yatsushiro-rebuild|uto-handbook|saishuppatsu/.test(file)) return 75;
  if (["sitemap.html", "official.html", "alert-channels.html"].includes(file)) return 70;
  return 50;
};

const items = [];
for (const file of files) {
  const html = await readFile(path.join(root, file), "utf8");
  const title = match(html, /<title>([\s\S]*?)<\/title>/i).split("｜")[0].trim();
  const description = decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || "");
  const headings = [...html.matchAll(/<h[123]\b[^>]*>([\s\S]*?)<\/h[123]>/gi)]
    .map(result => text(result[1]))
    .filter(h => h && h.length > 1 && !/^(メニュー|サイト内検索|目次|共有|関連|pagetop)$/i.test(h));

  if (title) {
    items.push({
      url: file,
      title,
      description,
      category: detectCategory(file),
      area: detectArea(file, title),
      priority: detectPriority(file),
      headings: [...new Set(headings)].slice(0, 24)
    });
  }
}

const target = path.join(root, "public-data/site-search-index.json");
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  const current = JSON.parse(await readFile(target, "utf8"));
  if (JSON.stringify(current.items) !== JSON.stringify(items)) {
    throw new Error("サイト内検索インデックスが古いです。node tools/build-site-search.mjs を実行してください");
  }
  console.log(`サイト内検索インデックス ${items.length}ページ 検査OK`);
} else {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(
    target,
    `${JSON.stringify({ version: 2, generatedAt: new Date().toISOString(), count: items.length, items }, null, 2)}\n`
  );
  console.log(`サイト内検索インデックス ${items.length}ページを更新`);
}
