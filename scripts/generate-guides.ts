import { readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { validateGuideFrontmatter } from "../web/content/schema.ts";
import { renderGuideHtml, type GuideLink } from "../web/render/guide.ts";

const root = process.cwd();
const contentRoot = join(root, "web/content/guides");
const publicRoot = join(root, "web/public");
type Frontmatter = ReturnType<typeof validateGuideFrontmatter>;
type Guide = Omit<Frontmatter, "route" | "markdownRoute"> & {
  route: `/${string}/`;
  markdownRoute: `/${string}.md`;
  authoredSource: string;
  source: string;
  body: string;
  group: "journey" | "platform" | "support";
};

async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    if (entry.isDirectory()) return markdownFiles(join(directory, entry.name));
    return entry.isFile() && entry.name === "index.md" ? [join(directory, entry.name)] : [];
  }));
  return nested.flat().sort();
}

function parse(source: string, file: string): { frontmatter: Frontmatter; body: string } {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match?.[1] || match[2] === undefined) throw new Error(`${file}: forventer YAML-frontmatter`);
  if (/<\/?[a-z][^>]*>/i.test(match[2])) throw new Error(`${file}: rå HTML er ikke tilladt i guide-Markdown`);
  return { frontmatter: validateGuideFrontmatter(Bun.YAML.parse(match[1]), file), body: match[2] };
}

const guides: Guide[] = [];
for (const file of await markdownFiles(contentRoot)) {
  const source = await Bun.file(file).text();
  const { frontmatter, body } = parse(source, file);
  const folder = relative(contentRoot, dirname(file));
  const derivedRoute = `/${folder === "." ? "" : `${folder}/`}` as `/${string}/`;
  const route = frontmatter.route ?? derivedRoute;
  const markdownRoute = frontmatter.markdownRoute ?? `${route.slice(0, -1)}.md` as `/${string}.md`;
  const group = route.startsWith("/forloeb/")
    ? "journey"
    : route.startsWith("/platforme/")
      ? "platform"
      : "support";
  const { route: _route, markdownRoute: _markdownRoute, ...metadata } = frontmatter;
  guides.push({ ...metadata, route, markdownRoute, authoredSource: relative(root, file), source, body, group });
}

function assertUnique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} er ikke unik`);
}
assertUnique(guides.map((guide) => guide.id), "Guide-id");
assertUnique(guides.map((guide) => guide.route), "Guide-route");
assertUnique(guides.map((guide) => guide.markdownRoute), "Guide-Markdown-route");

const promptIds: Record<string, string> = {
  "Jeg ved ikke, hvad jeg skal søge": "find_jobretning",
  "Jeg vil lave en jobprofil": "lav_jobprofil",
  "Jeg vil finde aktuelle job": "find_aktuelle_job",
  "Jeg vil holde øje med nye job": "hold_oeje_med_job",
  "Jeg vil sammenligne job": "sammenlign_job",
  "Jeg vil tilpasse mit CV": "tilpas_cv",
  "Jeg vil skrive en ansøgning": "skriv_ansoegning",
  "Jeg vil kvalitetstjekke før afsendelse": "kvalitetstjek_ansogning",
  "Jeg vil øve jobsamtalen": "oev_jobsamtale",
  "Jeg vil følge op": "foelg_op",
};

const promptGuide = guides.find((guide) => guide.id === "prompts");
if (!promptGuide) throw new Error("Promptguiden mangler");
const agentPrompts = [...promptGuide.body.matchAll(/^## (.+)\n\n((?:> .*\n?)+)/gm)].map((match) => {
  const title = match[1]!.trim();
  const id = promptIds[title];
  if (!id) throw new Error(`Promptguiden har en ukendt besked: ${title}`);
  return {
    id,
    title,
    description: `Brug denne besked til trinnet: ${title.toLowerCase()}.`,
    text: match[2]!.replace(/^> ?/gm, "").trim(),
  };
});
if (agentPrompts.length !== 10) throw new Error(`Forventede 10 agentbeskeder, fandt ${agentPrompts.length}`);
assertUnique(agentPrompts.map((prompt) => prompt.id), "Agentbesked-id");

const agentGuides = guides.map((guide) => {
  const contentMarkdown = guide.body.trim();
  if (contentMarkdown.length > 12_000) throw new Error(`${guide.authoredSource}: guide er for lang til agentpakken`);
  return {
    id: guide.id,
    title: guide.title.replace(/ · Jobagenten$/, ""),
    summary: guide.summary,
    stage: guide.stage,
    route: guide.route,
    markdownRoute: guide.markdownRoute,
    group: guide.group,
    optionalCapabilities: guide.optionalCapabilities,
    humanConfirmations: guide.humanConfirmations,
    contentMarkdown,
  };
});

const coreLinks: Record<string, GuideLink> = {
  "/": { href: "/", label: "Forside" },
  "/about/": { href: "/about/", label: "Om Jobagenten" },
  "/kontakt/": { href: "/kontakt/", label: "Kontakt" },
  "/privacy/": { href: "/privacy/", label: "Privatliv" },
};
function resolve(reference: string | undefined, source: Guide): GuideLink | undefined {
  if (!reference) return undefined;
  if (coreLinks[reference]) return coreLinks[reference];
  const candidate = guides.find((guide) => guide.id === reference || guide.route === reference)
    ?? guides.find((guide) => reference === `forloeb-${guide.route.split("/").filter(Boolean).at(-1)}`);
  if (!candidate) throw new Error(`${source.authoredSource}: ukendt guiderelation ${reference}`);
  return { href: candidate.route, label: candidate.title.replace(/ · Jobagenten$/, "") };
}

const manifest = `// Generated by scripts/generate-guides.ts. Do not edit by hand.\nimport type { PublicPage } from "../pages.ts";\nexport const GENERATED_GUIDES: readonly PublicPage[] = ${JSON.stringify(guides.map(({ body, source, group, authoredSource, ...guide }) => ({
  ...guide,
  source: `web/public${guide.route}index.html`,
  authoredSource,
  markdownSource: `web/public${guide.markdownRoute}`,
  title: guide.title,
  description: guide.description,
  openGraphTitle: guide.title,
  openGraphDescription: guide.summary,
  sitemap: true,
  navigationGroup: group,
  readOnlyBoundary: true,
})), null, 2)} as const;\n`;

for (const guide of guides) {
  const previous = resolve(guide.previous, guide);
  const next = resolve(guide.next, guide);
  const related = guide.related.map((reference) => resolve(reference, guide)!);
  await Bun.write(join(publicRoot, guide.markdownRoute), guide.source);
  await Bun.write(join(publicRoot, guide.route, "index.html"), renderGuideHtml(guide, guide.body, {
    route: guide.route,
    markdownRoute: guide.markdownRoute,
    group: guide.group,
    ...(previous ? { previous } : {}),
    ...(next ? { next } : {}),
    related,
  }));
}
await Bun.write(join(root, "web/generated/guides.ts"), manifest);
await Bun.write(join(root, "web/generated/agent-pack.ts"), `// Generated by scripts/generate-guides.ts. Do not edit by hand.\nexport const AGENT_GUIDES = ${JSON.stringify(agentGuides, null, 2)} as const;\n\nexport const AGENT_PROMPTS = ${JSON.stringify(agentPrompts, null, 2)} as const;\n`);
console.log(`Genererede ${guides.length} guider`);
