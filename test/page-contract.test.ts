import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import {
  MACHINE_RESOURCES,
  PUBLIC_PAGES,
  canonicalUrl,
  renderSitemap,
} from "../web/pages.ts";

type ParsedHtml = {
  title: string;
  description: string;
  canonical: string;
  language: string;
  viewport: string;
  favicon: string;
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImage: string;
  twitterCard: string;
  h1Count: number;
  mainCount: number;
  ids: Set<string>;
  links: Array<{ href: string; target: string; rel: string }>;
};

function attribute(tag: string, name: string): string {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return match?.[1]?.trim() ?? "";
}

function metaContent(html: string, attributeName: "name" | "property", value: string): string {
  const tag = (html.match(/<meta\b[^>]*>/gi) ?? []).find(
    (candidate) => attribute(candidate, attributeName) === value,
  );
  return tag ? attribute(tag, "content") : "";
}

function parseHtml(html: string): ParsedHtml {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  const canonicalTag = linkTags.find((tag) =>
    attribute(tag, "rel").split(/\s+/).includes("canonical"),
  );
  const faviconTag = linkTags.find((tag) =>
    attribute(tag, "rel").split(/\s+/).includes("icon"),
  );
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const ids = new Set(
    (html.match(/\bid=["'][^"']+["']/gi) ?? []).map((match) => attribute(match, "id")),
  );
  const links = (html.match(/<a\b[^>]*>/gi) ?? []).map((tag) => ({
    href: attribute(tag, "href"),
    target: attribute(tag, "target"),
    rel: attribute(tag, "rel"),
  }));

  return {
    title,
    description: metaContent(html, "name", "description"),
    canonical: canonicalTag ? attribute(canonicalTag, "href") : "",
    language: attribute(htmlTag, "lang"),
    viewport: metaContent(html, "name", "viewport"),
    favicon: faviconTag ? attribute(faviconTag, "href") : "",
    openGraphTitle: metaContent(html, "property", "og:title"),
    openGraphDescription: metaContent(html, "property", "og:description"),
    openGraphImage: metaContent(html, "property", "og:image"),
    twitterCard: metaContent(html, "name", "twitter:card"),
    h1Count: html.match(/<h1\b/gi)?.length ?? 0,
    mainCount: html.match(/<main\b/gi)?.length ?? 0,
    ids,
    links,
  };
}

async function findPublicHtmlEntrypoints(): Promise<string[]> {
  const entries = ["web/index.html"];
  const publicRoot = join(process.cwd(), "web/public");

  async function walk(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      if (entry.isFile() && entry.name === "index.html") {
        entries.push(path.slice(process.cwd().length + 1));
      }
    }
  }

  await walk(publicRoot);
  return entries.sort();
}

describe("public page registry", () => {
  test("registers every public HTML entrypoint exactly once", async () => {
    const registered: string[] = PUBLIC_PAGES.map((page) => page.source).sort();
    expect(registered).toEqual(await findPublicHtmlEntrypoints());
    expect(new Set(PUBLIC_PAGES.map((page) => page.route)).size).toBe(PUBLIC_PAGES.length);
  });

  test("keeps titles and descriptions unique", () => {
    expect(new Set(PUBLIC_PAGES.map((page) => page.title)).size).toBe(PUBLIC_PAGES.length);
    expect(new Set(PUBLIC_PAGES.map((page) => page.description)).size).toBe(
      PUBLIC_PAGES.length,
    );
  });
});

describe("public page contract", () => {
  for (const page of PUBLIC_PAGES) {
    test(`${page.route} has required structure, metadata, navigation, and valid links`, async () => {
      const source = Bun.file(join(process.cwd(), page.source));
      expect(await source.exists()).toBe(true);
      const parsed = parseHtml(await source.text());

      expect(parsed.language).toBe("da");
      expect(parsed.viewport).toContain("width=device-width");
      expect(parsed.title).toBe(page.title);
      expect(parsed.title.length).toBeLessThanOrEqual(60);
      expect(parsed.description).toBe(page.description);
      expect(parsed.description.length).toBeGreaterThanOrEqual(100);
      expect(parsed.description.length).toBeLessThanOrEqual(170);
      expect(parsed.canonical).toBe(canonicalUrl(page.route));
      expect(parsed.favicon).toEndWith("/assets/favicon.svg");
      expect(parsed.openGraphTitle).toBe(page.openGraphTitle);
      expect(parsed.openGraphDescription).toBe(page.openGraphDescription);
      expect(parsed.openGraphImage).toBe(`${canonicalUrl("/")}assets/jobagenten-social-preview.png`);
      expect(parsed.twitterCard).toBe("summary_large_image");
      expect(parsed.h1Count).toBe(1);
      expect(parsed.mainCount).toBe(1);

      const internalRoutes = new Set(
        parsed.links
          .map((link) => link.href)
          .filter((href) => href.startsWith("/") && !href.startsWith("//")),
      );
      if (page.markdownRoute) {
        expect(internalRoutes.has("/")).toBe(true);
        expect(internalRoutes.has("/forloeb/")).toBe(true);
        expect(internalRoutes.has("/about/")).toBe(true);
        expect(internalRoutes.has("/kontakt/")).toBe(true);
        expect(parsed.links.some((link) => link.href === page.markdownRoute)).toBe(true);
      }

      for (const link of parsed.links) {
        if (link.target === "_blank") expect(link.rel.split(/\s+/)).toContain("noopener");
        if (link.href.startsWith("#")) expect(parsed.ids.has(link.href.slice(1))).toBe(true);
        if (link.href.startsWith("/") && !link.href.startsWith("//")) {
          const route = new URL(link.href, canonicalUrl(page.route)).pathname;
          const knownRoute = PUBLIC_PAGES.some((candidate) => candidate.route === route);
          const machineRoute = MACHINE_RESOURCES.some((resource) => resource.route === route);
          const markdownRoute = PUBLIC_PAGES.some((candidate) => candidate.markdownRoute === route);
          expect(knownRoute || machineRoute || markdownRoute || route === "/health").toBe(true);
        }
      }
    });
  }
});

describe("machine-readable contract", () => {
  test("keeps every machine resource present", async () => {
    for (const resource of MACHINE_RESOURCES) {
      expect(await Bun.file(join(process.cwd(), resource.source)).exists()).toBe(true);
    }
  });

  test("generates sitemap from the page registry", async () => {
    expect(await Bun.file("web/public/sitemap.xml").text()).toBe(renderSitemap());
  });

  test("keeps generated guide Markdown and HTML in sync with their authored sources", async () => {
    for (const page of PUBLIC_PAGES.filter((candidate) => candidate.markdownSource)) {
      const authored = Bun.file(page.authoredSource!);
      expect(await authored.exists()).toBe(true);
      expect(await Bun.file(page.markdownSource!).text()).toBe(await authored.text());
      const source = await authored.text();
      const body = source.replace(/^---\n[\s\S]*?\n---\n/, "");
      const html = await Bun.file(page.source).text();
      expect(html).toContain(Bun.markdown.html(body));
      expect(html).toContain(`rel="alternate" type="text/markdown" href="${page.markdownRoute}"`);
      expect(html).toContain('rel="describedby" type="text/markdown" href="/ai/jobsoegning.md"');
      expect(html).toContain("Jobagenten er read-only");
      expect(html).toContain('<script type="module" src="/webmcp.js"></script>');
    }
  });

  test("protects service endpoints in robots.txt", async () => {
    const robots = await Bun.file("web/public/robots.txt").text();
    expect(robots).toContain("Disallow: /mcp");
    expect(robots).toContain("Disallow: /health");
    expect(robots).toContain("Disallow: /api/webmcp/");
    expect(robots).toContain(`Sitemap: ${canonicalUrl("/sitemap.xml")}`);
  });

  test("serves valid JSON discovery documents", async () => {
    const jsonResources = MACHINE_RESOURCES.filter(
      ({ source }) => source.endsWith(".json") || source.endsWith("api-catalog"),
    );
    for (const resource of jsonResources) {
      const contents = await Bun.file(resource.source).text();
      expect(() => JSON.parse(contents)).not.toThrow();
    }
  });

  test("uses the RFC 9727 Linkset shape at the reserved API-catalog URI", async () => {
    const catalog = JSON.parse(await Bun.file("web/public/.well-known/api-catalog").text()) as { linkset?: unknown[] };
    expect(Array.isArray(catalog.linkset)).toBe(true);
    expect(catalog.linkset?.[0]).toHaveProperty("anchor", canonicalUrl("/"));
    expect(catalog.linkset?.[0]).toHaveProperty("link");
  });
});
