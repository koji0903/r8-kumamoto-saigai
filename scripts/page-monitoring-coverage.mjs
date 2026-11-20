import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
export const REPORT_PATH = path.join(ROOT, "reports/all-page-official-link-watch.json");

const CUSTOM_OFFICIAL_HOSTS = new Set([
  "www.reihoku-kumamoto.jp"
]);

export const discoverPublicPages = () => fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith(".html"))
  .map(entry => entry.name)
  .filter(name => !/^google.*\.html$/i.test(name))
  .sort((a, b) => a.localeCompare(b));

export const isOfficialUrl = value => {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname.endsWith(".go.jp")
      || hostname.endsWith(".lg.jp")
      || /(^|\.)(?:city|town|vill|pref)\./.test(hostname)
      || CUSTOM_OFFICIAL_HOSTS.has(hostname);
  } catch {
    return false;
  }
};

const normalizeUrl = value => {
  try {
    const url = new URL(value.replaceAll("&amp;", "&"));
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
};

export const extractOfficialUrls = html => {
  const urls = new Set();
  for (const match of html.matchAll(/https?:\/\/[^\s"'<>]+/gi)) {
    const normalized = normalizeUrl(match[0].replace(/[),.;。、，）】]+$/u, ""));
    if (normalized && isOfficialUrl(normalized)) urls.add(normalized);
  }
  return [...urls].sort((a, b) => a.localeCompare(b));
};

const localDataAssets = (source, extensionPattern) => {
  const files = new Set();
  for (const match of source.matchAll(new RegExp(`["']([^"'?#]+\\.(?:${extensionPattern}))(?:[?#][^"']*)?["']`, "gi"))) {
    const relative = match[1].replace(/^\.\//, "");
    if (!relative.startsWith("../") && !relative.startsWith("/") && !relative.includes("://")) files.add(relative);
  }
  return [...files];
};

const officialUrlsForPage = page => {
  const html = fs.readFileSync(path.join(ROOT, page), "utf8");
  const sources = [html];
  for (const jsFile of localDataAssets(html, "m?js")) {
    if (jsFile.startsWith("data/generated/")) continue;
    const jsPath = path.join(ROOT, jsFile);
    if (!fs.existsSync(jsPath) || !fs.statSync(jsPath).isFile()) continue;
    const js = fs.readFileSync(jsPath, "utf8");
    sources.push(js);
  }
  return [...new Set(sources.flatMap(extractOfficialUrls))].sort((a, b) => a.localeCompare(b));
};

export const buildPageInventory = () => {
  const pages = discoverPublicPages();
  const urlPages = new Map();
  const inventory = pages.map(page => {
    // 画面表示時にJSから組み立てられる公式リンクも、その掲載ページへ紐づける。
    // 大規模な生成JSONは頻回の公式データ更新Workflow側で監視する。
    const urls = officialUrlsForPage(page);
    for (const url of urls) {
      if (!urlPages.has(url)) urlPages.set(url, []);
      urlPages.get(url).push(page);
    }
    return { page, officialLinkCount: urls.length };
  });
  return { pages, inventory, urlPages };
};

export const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));

export const buildMonitoringCoverage = () => {
  const { pages, inventory, urlPages } = buildPageInventory();
  const priority = readJson(path.join(ROOT, "sources/guide-official-watch.json"));
  const living = readJson(path.join(ROOT, "sources/living-support-coverage-targets.json"));
  const priorityPages = new Set(priority.targets.flatMap(target => target.guidePages));
  const livingPages = new Set(living.municipalities.flatMap(item => [item.page, ...(item.siblingPages || [])]));

  return {
    pages,
    inventory: inventory.map(item => ({
      ...item,
      channels: [
        "all-page-official-link-watch",
        ...(priorityPages.has(item.page) ? ["priority-content-watch"] : []),
        ...(livingPages.has(item.page) ? ["living-support-index-watch"] : [])
      ]
    })),
    urlPages,
    priorityPages,
    livingPages
  };
};
