import { GUIDE_SAFETY, PRIMARY_NAVIGATION } from "../site-config.ts";
import type { GuideFrontmatter } from "../content/schema.ts";

const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const nav = PRIMARY_NAVIGATION.map(({ href, label }) => `<a href="${href}">${label}</a>`).join("");

export function renderGuideHtml(frontmatter: GuideFrontmatter, body: string, route: string, markdownRoute: string): string {
  const canonical = `https://job-agent.dk${route}`;
  const markdown = Bun.markdown.html(body);
  const sources = frontmatter.sourceLinks.length ? `<p class="guide-meta">Kontrolleret ${frontmatter.lastVerified}. Kilder: ${frontmatter.sourceLinks.map((url) => `<a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(new URL(url).hostname)}</a>`).join(", ")}</p>` : `<p class="guide-meta">Senest kontrolleret: ${frontmatter.lastVerified}</p>`;
  return `<!doctype html>
<html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(frontmatter.title)}</title><meta name="description" content="${escapeHtml(frontmatter.description)}">
<link rel="canonical" href="${canonical}"><link rel="alternate" type="text/markdown" href="${markdownRoute}" title="Markdown-version"><link rel="describedby" type="text/markdown" href="/ai/jobsoegning.md">
<meta property="og:title" content="${escapeHtml(frontmatter.title)}"><meta property="og:description" content="${escapeHtml(frontmatter.summary)}"><meta property="og:image" content="https://job-agent.dk/assets/jobagenten-social-preview.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/guide.css"></head>
<body><a class="skip-link" href="#indhold">Gå til indhold</a><header class="guide-header"><a class="brand" href="/">Jobagenten</a><nav aria-label="Hovednavigation">${nav}</nav></header>
<main id="indhold"><nav class="breadcrumbs" aria-label="Brødkrummer"><a href="/">Forside</a><span aria-hidden="true">/</span><span>Find og søg job</span></nav><article>${markdown}${sources}</article>
<aside class="safety" aria-label="Vigtige grænser"><h2>Du har kontrollen</h2><ul>${GUIDE_SAFETY.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul></aside></main>
<footer><nav aria-label="Footer"><a href="/privacy/">Privatliv</a><a href="/kontakt/">Kontakt</a><a href="${markdownRoute}">Læs som Markdown</a></nav></footer><script src="/guide.js"></script></body></html>\n`;
}
