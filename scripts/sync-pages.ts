import { renderSitemap } from "../web/pages.ts";

const sitemapPath = new URL("../web/public/sitemap.xml", import.meta.url);
await Bun.write(sitemapPath, renderSitemap());

console.log("Synkroniserede web/public/sitemap.xml fra web/pages.ts");
