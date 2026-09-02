import { GENERATED_GUIDES } from "./generated/guides.ts";
import { EDITORIAL_PAGES } from "./content/editorial-pages.ts";

export const SITE_ORIGIN = "https://job-agent.dk";
export type NavigationGroup = "core" | "journey" | "platform" | "support";
export type PublicPage = {
  id: string; route: `/${string}`; source: string; title: string; description: string;
  openGraphTitle: string; openGraphDescription: string; sitemap: boolean; navigationGroup: NavigationGroup;
  markdownRoute?: `/${string}.md`; markdownSource?: string; authoredSource?: string; stage?: string; audience?: "jobseeker" | "advisor" | "technical"; summary?: string; lastVerified?: string;
  sourceLinks?: readonly string[]; optionalCapabilities?: readonly string[]; humanConfirmations?: readonly string[];
  readOnlyBoundary?: true; related?: readonly string[]; previous?: string; next?: string;
};
const CORE_PAGES: readonly PublicPage[] = [
  { id: "home", route: "/", source: "web/index.html", title: "Jobagenten — find dit næste job i en samtale", description: "Jobagenten er et gratis værktøj bygget af Mikkel Freltoft Krogsholm, som giver ChatGPT og Claude adgang til aktuelle job fra danske jobportaler.", openGraphTitle: "Jobagenten — find dit næste job i en samtale", openGraphDescription: "Et gratis AI-værktøj bygget af Mikkel Freltoft Krogsholm til danske jobsøgende.", sitemap: true, navigationGroup: "core" },
  ...EDITORIAL_PAGES.map(({ eyebrow: _eyebrow, heading: _heading, bodyHtml: _bodyHtml, author: _author, ...page }) => ({
    ...page,
    sitemap: true,
    navigationGroup: "core" as const,
  })),
];
export const PUBLIC_PAGES: readonly PublicPage[] = [...CORE_PAGES, ...GENERATED_GUIDES];
export const RESPONSIVE_VIEWPORTS = [{ name: "mobile", width: 390, height: 844 }, { name: "tablet-portrait", width: 768, height: 1024 }, { name: "tablet-landscape", width: 1024, height: 900 }, { name: "desktop", width: 1440, height: 1000 }] as const;
export const MACHINE_RESOURCES = [{ route: "/robots.txt", source: "web/public/robots.txt" }, { route: "/sitemap.xml", source: "web/public/sitemap.xml" }, { route: "/llms.txt", source: "web/public/llms.txt" }, { route: "/webmcp.js", source: "web/public/webmcp.js" }, { route: "/.well-known/mcp/server-card.json", source: "web/public/.well-known/mcp/server-card.json" }, { route: "/.well-known/api-catalog", source: "web/public/.well-known/api-catalog" }] as const;
export function canonicalUrl(route: string): string { return new URL(route, SITE_ORIGIN).href; }
export function renderSitemap(): string { const urls = PUBLIC_PAGES.filter((page) => page.sitemap).map((page) => `  <url><loc>${canonicalUrl(page.route)}</loc></url>`).join("\n"); return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`; }
