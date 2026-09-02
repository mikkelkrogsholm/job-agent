import type { GuideFrontmatter } from "../content/schema.ts";
import { GUIDE_SAFETY } from "../site-config.ts";
import { renderSiteFooter, renderSiteHeader } from "./site-shell.ts";

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
  const headingMatch = markdown.match(/^<h1>[\s\S]*?<\/h1>\n?/);
  const guideHeading = headingMatch?.[0] ?? `<h1>${escapeHtml(frontmatter.title.replace(/ · Jobagenten$/, ""))}</h1>`;
  const guideContent = headingMatch ? markdown.slice(headingMatch[0].length) : markdown;
  const group = context.group === "journey"
    ? { href: "/forloeb/", label: "Find og søg job" }
    : context.group === "platform"
      ? { href: "/platforme/", label: "Vælg din AI" }
      : { href: "/", label: "Jobagenten" };
  const sources = frontmatter.sourceLinks.length
    ? `<p class="guide-meta">Læs mere hos: ${frontmatter.sourceLinks.map((url) => `<a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(new URL(url).hostname)}</a>`).join(", ")}</p>`
    : "";
  const related = context.related.length
    ? `<aside class="related" aria-labelledby="related-title"><h2 id="related-title">Relaterede guides</h2><ul>${context.related.map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`).join("")}</ul></aside>`
    : "";

  return `<!doctype html>
<html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(frontmatter.title)}</title><meta name="description" content="${escapeHtml(frontmatter.description)}">
<link rel="canonical" href="${canonical}"><link rel="alternate" type="text/markdown" href="${context.markdownRoute}" title="Markdown-version"><link rel="describedby" type="text/markdown" href="/ai/jobsoegning.md">
<meta property="og:title" content="${escapeHtml(frontmatter.title)}"><meta property="og:description" content="${escapeHtml(frontmatter.summary)}"><meta property="og:image" content="https://job-agent.dk/assets/jobagenten-social-preview.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/site-shell.css"><link rel="stylesheet" href="/guide.css"></head>
<body class="guide-page guide-page--${context.group}"><a class="skip-link" href="#indhold">Gå til indhold</a>${renderSiteHeader(context.route)}
<main id="indhold"><nav class="breadcrumbs" aria-label="Brødkrummer"><a href="/">Forside</a><span aria-hidden="true">/</span>${context.route === group.href ? `<span>${group.label}</span>` : `<a href="${group.href}">${group.label}</a><span aria-hidden="true">/</span><span>${escapeHtml(frontmatter.title.replace(/ · Jobagenten$/, ""))}</span>`}</nav>
<div class="guide-layout"><article class="guide-article"><div class="guide-intro" data-guide-reveal="intro"><p class="eyebrow">${group.label}</p>${guideHeading}<p class="guide-summary">${escapeHtml(frontmatter.summary)}</p></div><div class="guide-content">${guideContent}</div>${sources}<p class="guide-machine-link"><a href="${context.markdownRoute}">Lad din AI læse siden</a></p>${renderJourneyNavigation(context)}</article>
<div class="guide-asides"><aside class="safety" aria-label="Vigtige grænser"><h2>Du har kontrollen</h2><ul>${GUIDE_SAFETY.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul></aside>${related}</div></div></main>
${renderSiteFooter()}<script src="/site-shell.js"></script><script src="/guide.js"></script><script type="module" src="/webmcp.js"></script></body></html>\n`;
}
