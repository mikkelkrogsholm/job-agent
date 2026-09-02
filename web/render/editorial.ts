import type { EditorialPage } from "../content/editorial-pages.ts";
import { renderSiteFooter, renderSiteHeader } from "./site-shell.ts";

export function renderEditorialHtml(page: EditorialPage): string {
  const author = page.author ? `<meta name="author" content="${page.author}">` : "";
  return `<!doctype html>
<html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.title}</title><meta name="description" content="${page.description}">${author}
<meta property="og:title" content="${page.openGraphTitle}"><meta property="og:description" content="${page.openGraphDescription}"><meta property="og:image" content="https://job-agent.dk/assets/jobagenten-social-preview.png"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="https://job-agent.dk${page.route}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/site-shell.css"><link rel="stylesheet" href="/legal.css"></head>
<body class="editorial-page"><a class="skip-link" href="#main">Gå til indhold</a>${renderSiteHeader(page.route)}
<main class="editorial-main" id="main"><article class="editorial-article"><header class="editorial-intro" data-component-reveal><p class="meta">${page.eyebrow}</p><h1>${page.heading}</h1></header><div class="editorial-content">${page.bodyHtml}</div></article></main>
${renderSiteFooter()}<script src="/site-shell.js"></script></body></html>\n`;
}
