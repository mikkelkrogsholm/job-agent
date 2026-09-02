import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const publicRoot = join(process.cwd(), "web/public");

async function guidePages(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return guidePages(path);
    return entry.name === "index.html" ? [path] : [];
  }));
  return pages.flat();
}

describe("guide design contract", () => {
  test("defines the canonical reusable component inventory", async () => {
    const design = await Bun.file("DESIGN.md").text();
    for (const component of [
      "`SiteHeader`",
      "`NavigationToggle`",
      "`SiteFooter`",
      "`Wordmark`",
      "`PageIntro`",
      "`Breadcrumbs`",
      "`GuideLayout`",
      "`SafetyPanel`",
      "`RelatedLinks`",
      "`StepNavigation`",
      "`PromptCard`",
      "`SourceMeta`",
      "`EditorialPage`",
      "`Reveal`",
    ]) expect(design).toContain(component);
    expect(design).toContain("web/render/site-shell.ts");
    expect(design).toContain("web/public/site-shell.js");
    expect(design).toContain("finite response");
  });

  test("uses the documented warm editorial foundations", async () => {
    const design = await Bun.file("DESIGN.md").text();
    const css = await Bun.file("web/public/guide.css").text();

    for (const token of ["#f3efe5", "#17211c", "#2855e8", "Newsreader Variable", "Manrope Variable"]) {
      expect(design).toContain(token);
      expect(css).toContain(token);
    }
    expect(css).toContain("background-image: url(");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(await Bun.file("web/assets/fonts/manrope-latin-wght-normal.woff2").exists()).toBe(true);
    expect(await Bun.file("web/assets/fonts/newsreader-latin-opsz-normal.woff2").exists()).toBe(true);
    expect(css).toContain('url("/assets/fonts/manrope-latin-wght-normal.woff2")');
  });

  test("keeps every generated guide inside the shared accessible system", async () => {
    const pages = await guidePages(join(publicRoot, "forloeb"));
    pages.push(...await guidePages(join(publicRoot, "platforme")));
    for (const route of ["prompts/index.html", "tryghed/index.html", "ai/index.html"]) {
      pages.push(join(publicRoot, route));
    }

    for (const page of pages) {
      const html = await Bun.file(page).text();
      expect(html).toContain('class="guide-page guide-page--');
      expect(html).toContain('class="wordmark"');
      expect(html).toContain('class="wordmark-mark"');
      expect(html).toContain('data-shell-reveal="header"');
      expect(html).toContain('data-shell-reveal="footer"');
      expect(html).toContain('class="guide-intro" data-guide-reveal="intro"');
      expect(html).toContain('class="safety"');
      expect(html).toContain('class="related"');
      expect(html).toContain('<script src="/site-shell.js"></script>');
      expect(html).toContain('<script src="/guide.js"></script>');
      expect(html).toContain('<script type="module" src="/webmcp.js"></script>');
    }
  });

  test("retains prompt copy selectors and accessible feedback hooks", async () => {
    const script = await Bun.file("web/public/guide.js").text();
    expect(script).toContain('"article blockquote"');
    expect(script).toContain('button.className = "prompt-copy"');
    expect(script).toContain('copySource.className = "prompt-copy-source"');
    expect(script).toContain('copyFeedback.setAttribute("aria-live", "polite")');
    expect(script).toContain("IntersectionObserver");
  });

  test("keeps internal research language out of human-facing guides", async () => {
    const pages = await guidePages(join(publicRoot, "forloeb"));
    pages.push(...await guidePages(join(publicRoot, "platforme")));
    for (const route of ["prompts/index.html", "tryghed/index.html", "ai/index.html"]) pages.push(join(publicRoot, route));
    const internalLanguage = /Hvad der er kendt|Capability-check|Til AI-assistenten|ikke verificeret|\bfallback\b|\bscope\b|\bcadence\b|\bscheduler\b|\btrade-offs\b|\bevidenskort\b/i;
    for (const page of pages) {
      const html = await Bun.file(page).text();
      expect(html).not.toMatch(internalLanguage);
    }
  });
});
