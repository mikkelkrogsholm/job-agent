import { GENERATED_GUIDES } from "./generated/guides.ts";

export const SITE_ORIGIN = "https://job-agent.dk";
export type NavigationGroup = "core" | "journey" | "platform" | "support";
export type PublicPage = {
  id: string; route: `/${string}`; source: string; title: string; description: string;
  openGraphTitle: string; openGraphDescription: string; sitemap: boolean; navigationGroup: NavigationGroup;
  markdownRoute?: `/${string}.md`; markdownSource?: string; stage?: string; audience?: "jobseeker" | "advisor" | "technical"; summary?: string; lastVerified?: string;
  sourceLinks?: readonly string[]; optionalCapabilities?: readonly string[]; humanConfirmations?: readonly string[];
  readOnlyBoundary?: true; related?: readonly string[]; previous?: string; next?: string;
};
const CORE_PAGES: readonly PublicPage[] = [
  { id: "home", route: "/", source: "web/index.html", title: "Jobagenten — find dit næste job i en samtale", description: "Jobagenten er et gratis værktøj bygget af Mikkel Freltoft Krogsholm, som giver ChatGPT og Claude adgang til aktuelle job fra danske jobportaler.", openGraphTitle: "Jobagenten — find dit næste job i en samtale", openGraphDescription: "Et gratis AI-værktøj bygget af Mikkel Freltoft Krogsholm til danske jobsøgende.", sitemap: true, navigationGroup: "core" },
  { id: "about", route: "/about/", source: "web/public/about/index.html", title: "Om Mikkel Freltoft Krogsholm · Jobagenten", description: "Mød Mikkel Freltoft Krogsholm, AI-specialisten og udvikleren bag Jobagenten, og læs om hans arbejde med konkrete AI-værktøjer.", openGraphTitle: "Om Mikkel Freltoft Krogsholm · Jobagenten", openGraphDescription: "Mød AI-specialisten og udvikleren bag Jobagenten.", sitemap: true, navigationGroup: "core" },
  { id: "privacy", route: "/privacy/", source: "web/public/privacy/index.html", title: "Privatliv og databehandling · Jobagenten", description: "Læs hvordan den gratis Jobagent håndterer søgninger, tekniske data, fair-use-begrænsning og eksterne jobportaler uden login eller konto.", openGraphTitle: "Privatliv og databehandling · Jobagenten", openGraphDescription: "Sådan beskytter Jobagenten dit privatliv uden login eller konto.", sitemap: true, navigationGroup: "core" },
  { id: "contact", route: "/kontakt/", source: "web/public/kontakt/index.html", title: "Kontakt Mikkel om Jobagenten og AI-samarbejde", description: "Kontakt Mikkel Freltoft Krogsholm om Jobagenten, bidrag, fejl, foredrag eller et konkret AI-samarbejde gennem Brokk og Sindre ApS.", openGraphTitle: "Kontakt Mikkel · Jobagenten", openGraphDescription: "Kontakt skaberen af Jobagenten om værktøjet eller AI-samarbejde.", sitemap: true, navigationGroup: "core" },
];
export const PUBLIC_PAGES: readonly PublicPage[] = [...CORE_PAGES, ...GENERATED_GUIDES];
export const RESPONSIVE_VIEWPORTS = [{ name: "mobile", width: 390, height: 844 }, { name: "tablet-portrait", width: 768, height: 1024 }, { name: "tablet-landscape", width: 1024, height: 900 }, { name: "desktop", width: 1440, height: 1000 }] as const;
export const MACHINE_RESOURCES = [{ route: "/robots.txt", source: "web/public/robots.txt" }, { route: "/sitemap.xml", source: "web/public/sitemap.xml" }, { route: "/llms.txt", source: "web/public/llms.txt" }, { route: "/.well-known/mcp/server-card.json", source: "web/public/.well-known/mcp/server-card.json" }, { route: "/.well-known/api-catalog", source: "web/public/.well-known/api-catalog" }] as const;
export function canonicalUrl(route: string): string { return new URL(route, SITE_ORIGIN).href; }
export function renderSitemap(): string { const urls = PUBLIC_PAGES.filter((page) => page.sitemap).map((page) => `  <url><loc>${canonicalUrl(page.route)}</loc></url>`).join("\n"); return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`; }
