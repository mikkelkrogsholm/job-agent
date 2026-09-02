import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, normalize } from "node:path";
import { chromium, type Page } from "playwright";
import { MACHINE_RESOURCES, PUBLIC_PAGES, RESPONSIVE_VIEWPORTS } from "../web/pages.ts";

const projectRoot = process.cwd();
const outputDirectory = await mkdtemp(join(tmpdir(), "jobagenten-page-contract-"));

function responseFor(file: Bun.BunFile, contentType?: string): Response {
  return new Response(file, contentType ? { headers: { "content-type": contentType } } : undefined);
}

async function serveFile(path: string): Promise<Response | undefined> {
  const file = Bun.file(path);
  return (await file.exists()) ? responseFor(file) : undefined;
}

async function checkPage(page: Page, url: string, label: string): Promise<void> {
  const failures: string[] = [];
  const onConsole = (message: { type(): string; text(): string }) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  };
  const onPageError = (error: Error) => failures.push(`pageerror: ${error.message}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  const response = await page.goto(url, { waitUntil: "networkidle" });
  if (!response?.ok()) failures.push(`HTTP ${response?.status() ?? "intet svar"}`);

  const layout = await page.evaluate(() => {
    const isVisible = (element: Element | null) => {
      if (!(element instanceof HTMLElement)) return false;
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
    };
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1Count: document.querySelectorAll("h1").length,
      h1Visible: isVisible(document.querySelector("h1")),
      mainVisible: isVisible(document.querySelector("main")),
    };
  });

  if (layout.overflow > 1) failures.push(`vandret overflow på ${layout.overflow}px`);
  if (layout.h1Count !== 1) failures.push(`${layout.h1Count} h1-elementer`);
  if (!layout.h1Visible) failures.push("h1 er ikke synlig");
  if (!layout.mainVisible) failures.push("main er ikke synlig");

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  if (failures.length > 0) throw new Error(`${label}: ${failures.join("; ")}`);
}

let server: ReturnType<typeof Bun.serve> | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

try {
  const build = await Bun.build({
    entrypoints: [join(projectRoot, "web/index.html")],
    outdir: outputDirectory,
    target: "browser",
    minify: true,
  });
  if (!build.success) throw new AggregateError(build.logs, "Kunne ikke bygge landingssiden");

  server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const url = new URL(request.url);
      const publicPage = PUBLIC_PAGES.find((page) => page.route === url.pathname);
      if (publicPage && publicPage.route !== "/") {
        return responseFor(Bun.file(join(projectRoot, publicPage.source)), "text/html; charset=utf-8");
      }
      if (url.pathname === "/") {
        return responseFor(Bun.file(join(outputDirectory, "index.html")), "text/html; charset=utf-8");
      }

      const machineResource = MACHINE_RESOURCES.find((resource) => resource.route === url.pathname);
      if (machineResource) return responseFor(Bun.file(join(projectRoot, machineResource.source)));
      if (url.pathname === "/legal.css") {
        return responseFor(Bun.file(join(projectRoot, "web/public/legal.css")), "text/css");
      }
      if (url.pathname.startsWith("/guide.") || url.pathname.endsWith(".md")) {
        const publicPath = normalize(join(projectRoot, "web/public", decodeURIComponent(url.pathname)));
        if (publicPath.startsWith(join(projectRoot, "web/public"))) {
          const publicFile = await serveFile(publicPath);
          if (publicFile) return publicFile;
        }
      }
      if (url.pathname.startsWith("/assets/")) {
        const asset = await serveFile(join(projectRoot, "web", url.pathname));
        if (asset) return asset;
      }

      const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const builtPath = normalize(join(outputDirectory, relativePath));
      if (builtPath.startsWith(outputDirectory)) {
        const builtAsset = await serveFile(builtPath);
        if (builtAsset) return builtAsset;
      }
      return new Response("Ikke fundet", { status: 404 });
    },
  });

  browser = await chromium.launch({ headless: true });
  const origin = `http://${server.hostname}:${server.port}`;

  for (const viewport of RESPONSIVE_VIEWPORTS) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const publicPage of PUBLIC_PAGES) {
      await checkPage(
        page,
        `${origin}${publicPage.route}`,
        `${publicPage.route} ved ${viewport.name} (${viewport.width}px)`,
      );
    }

    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
    await page.locator("#tab-chatgpt").click();
    if ((await page.locator("#tab-chatgpt").getAttribute("aria-selected")) !== "true") {
      throw new Error(`ChatGPT-fanen virker ikke ved ${viewport.name}`);
    }
    if (!(await page.locator("#chatgpt-guide").isVisible())) {
      throw new Error(`ChatGPT-guiden er ikke synlig ved ${viewport.name}`);
    }
    await context.close();
  }

  const reducedMotionContext = await browser.newContext({
    viewport: RESPONSIVE_VIEWPORTS[0],
    reducedMotion: "reduce",
  });
  const reducedMotionPage = await reducedMotionContext.newPage();
  await reducedMotionPage.goto(`${origin}/`, { waitUntil: "networkidle" });
  const reducedMotionWorks = await reducedMotionPage.evaluate(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  if (!reducedMotionWorks) throw new Error("Reduced-motion-kontrakten blev ikke aktiveret");
  await reducedMotionContext.close();

  console.log(
    `Responsiv sidekontrakt bestået: ${PUBLIC_PAGES.length} sider × ${RESPONSIVE_VIEWPORTS.length} viewports`,
  );
} finally {
  await browser?.close();
  server?.stop(true);
  await rm(outputDirectory, { recursive: true, force: true });
}
