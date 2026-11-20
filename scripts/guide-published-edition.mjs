const editionPattern = /第\s*(\d+)\s*版/g;
const visibleText = (html) => html
  .replace(/<!--[\s\S]*?-->|<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .normalize("NFKC");

function pdfLinks(html, baseUrl) {
  const links = [];
  const markup = html.replace(/<!--[\s\S]*?-->|<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  for (const match of markup.matchAll(/<a\b[^>]*\shref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi)) {
    let url;
    try {
      url = new URL((match[1] ?? match[2]).replaceAll("&amp;", "&"), baseUrl);
    } catch {
      continue;
    }
    if (url.protocol !== "https:" || !/\.pdf$/i.test(url.pathname)) continue;
    url.hash = "";
    links.push({ url: url.href, label: visibleText(match[3]) });
  }
  return links;
}

const editionsIn = (text) => [...text.matchAll(editionPattern)].map(match => Number(match[1]));

export function officialEdition(html, sourceUrl, linkLabel) {
  const candidates = pdfLinks(html, sourceUrl)
    .filter(link => link.label.replace(/\s+/g, "").includes(linkLabel))
    .flatMap(link => editionsIn(link.label).map(edition => ({ edition, pdf: link.url })));
  const latest = Math.max(...candidates.map(candidate => candidate.edition));
  const pdfs = new Set(candidates.filter(candidate => candidate.edition === latest).map(candidate => candidate.pdf));
  if (pdfs.size !== 1) return null;
  return { edition: latest, pdf: [...pdfs][0] };
}

export function publishedEditionProblems(html, pageUrl, expected, requiresPdf) {
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "";
  const shown = editionsIn(visibleText(requiresPdf ? heading : html));
  const problems = [];
  if (!shown.includes(expected.edition)) {
    problems.push(`第${expected.edition}版の表記を確認できません（${shown.length ? [...new Set(shown)].map(n => `第${n}版`).join("、") : "版表記なし"}）`);
  }
  if (requiresPdf) {
    const pdfDirectory = new URL(".", expected.pdf).href;
    const linkedPdfs = new Set(pdfLinks(html, pageUrl).map(link => link.url));
    if (!linkedPdfs.has(expected.pdf)) problems.push("現行版PDFへのリンクがありません");
    if ([...linkedPdfs].some(url => url.startsWith(pdfDirectory) && url !== expected.pdf)) {
      problems.push("同じ公式掲載先の別PDFへのリンクが残っています");
    }
  }
  return problems;
}
