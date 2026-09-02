import type { GuideFrontmatter } from "../content/schema.ts";
import { GUIDE_SAFETY, PRIMARY_NAVIGATION } from "../site-config.ts";

export type GuideLink = { href: string; label: string };
export type GuideRenderContext = {
  route: string;
  markdownRoute: string;
  group: "journey" | "platform" | "support";
  previous?: GuideLink;
  next?: GuideLink;
  related: GuideLink[];
};

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function renderNavigation(route: string): string {
  return PRIMARY_NAVIGATION.map(({ href, label }) => {
    const active = route === href || route.startsWith(href);
    return `<a href="${href}"${active ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");
}

function renderJourneyNavigation(context: GuideRenderContext): string {
  if (!context.previous && !context.next) return "";
  return `<nav class="step-navigation" aria-label="Forrige og næste trin">
    ${context.previous ? `<a class="step-link step-previous" href="${context.previous.href}"><small>Forrige</small><span>← ${escapeHtml(context.previous.label)}</span></a>` : "<span></span>"}
    ${context.next ? `<a class="step-link step-next" href="${context.next.href}"><small>Næste</small><span>${escapeHtml(context.next.label)} →</span></a>` : ""}
  </nav>`;
}

export function renderGuideHtml(
  frontmatter: GuideFrontmatter,
  body: string,
  context: GuideRenderContext,
): string {
  const canonical = `https://job-agent.dk${context.route}`;
  const markdown = Bun.markdown.html(body);
  const group = context.group === "journey"
    ? { href: "/forloeb/", label: "Find og søg job" }
    : context.group === "platform"
      ? { href: "/platforme/", label: "Vælg din AI" }
      : { href: "/", label: "Jobagenten" };
  const sources = frontmatter.sourceLinks.length
    ? `<p class="guide-meta">Kontrolleret ${frontmatter.lastVerified}. Kilder: ${frontmatter.sourceLinks.map((url) => `<a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(new URL(url).hostname)}</a>`).join(", ")}</p>`
    : `<p class="guide-meta">Senest kontrolleret: ${frontmatter.lastVerified}</p>`;
  const related = context.related.length
    ? `<aside class="related" aria-labelledby="related-title"><h2 id="related-title">Relaterede guides</h2><ul>${context.related.map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`).join("")}</ul></aside>`
    : "";

  return `<!doctype html>
<html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(frontmatter.title)}</title><meta name="description" content="${escapeHtml(frontmatter.description)}">
<link rel="canonical" href="${canonical}"><link rel="alternate" type="text/markdown" href="${context.markdownRoute}" title="Markdown-version"><link rel="describedby" type="text/markdown" href="/ai/jobsoegning.md">
<meta property="og:title" content="${escapeHtml(frontmatter.title)}"><meta property="og:description" content="${escapeHtml(frontmatter.summary)}"><meta property="og:image" content="https://job-agent.dk/assets/jobagenten-social-preview.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/guide.css"></head>
<body><a class="skip-link" href="#indhold">Gå til indhold</a><header class="guide-header"><a class="brand" href="/">Jobagenten</a><nav aria-label="Hovednavigation">${renderNavigation(context.route)}</nav></header>
<main id="indhold"><nav class="breadcrumbs" aria-label="Brødkrummer"><a href="/">Forside</a><span aria-hidden="true">/</span>${context.route === group.href ? `<span>${group.label}</span>` : `<a href="${group.href}">${group.label}</a><span aria-hidden="true">/</span><span>${escapeHtml(frontmatter.title.replace(/ · Jobagenten$/, ""))}</span>`}</nav>
<div class="guide-layout"><article><p class="guide-summary">${escapeHtml(frontmatter.summary)}</p>${markdown}${sources}${renderJourneyNavigation(context)}</article>
<div class="guide-asides"><aside class="safety" aria-label="Vigtige grænser"><h2>Du har kontrollen</h2><ul>${GUIDE_SAFETY.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul></aside>${related}</div></div></main>
<footer><nav aria-label="Footer"><a href="/privacy/">Privatliv</a><a href="/kontakt/">Kontakt</a><a href="/ai/">Til AI-assistenter</a><a href="${context.markdownRoute}">Læs som Markdown</a></nav></footer><script src="/guide.js"></script><script type="module" src="/webmcp.js"></script></body></html>\n`;
}
