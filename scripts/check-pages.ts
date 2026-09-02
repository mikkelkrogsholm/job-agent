import { PUBLIC_PAGES, renderSitemap } from "../web/pages.ts";

for (const page of PUBLIC_PAGES.filter((candidate) => candidate.markdownSource)) {
  const source = page.authoredSource!;
  if (!(await Bun.file(source).exists())) throw new Error(`Manglende guidekilde: ${source}`);
  if ((await Bun.file(source).text()) !== (await Bun.file(page.markdownSource!).text())) throw new Error(`Genereret Markdown er ikke synkroniseret: ${page.markdownRoute}`);
}
if ((await Bun.file("web/public/sitemap.xml").text()) !== renderSitemap()) throw new Error("sitemap.xml er ikke synkroniseret");
const llms = await Bun.file("web/public/llms.txt").text();
for (const page of PUBLIC_PAGES.filter((candidate) => candidate.markdownRoute)) if (!llms.includes(page.markdownRoute!)) throw new Error(`llms.txt mangler ${page.markdownRoute}`);
const catalog = JSON.parse(await Bun.file("web/public/.well-known/api-catalog").text()) as { linkset?: unknown };
if (!Array.isArray(catalog.linkset)) throw new Error("api-catalog er ikke et Linkset JSON-dokument");
console.log("Sideartefakter er synkroniserede uden at ændre filer");
