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
      headerCount: document.querySelectorAll(".site-header").length,
      headerVisible: isVisible(document.querySelector(".site-header")),
      footerCount: document.querySelectorAll(".site-footer").length,
      footerVisible: isVisible(document.querySelector(".site-footer")),
    };
  });

  if (layout.overflow > 1) failures.push(`vandret overflow på ${layout.overflow}px`);
  if (layout.h1Count !== 1) failures.push(`${layout.h1Count} h1-elementer`);
  if (!layout.h1Visible) failures.push("h1 er ikke synlig");
  if (!layout.mainVisible) failures.push("main er ikke synlig");
  if (layout.headerCount !== 1) failures.push(`${layout.headerCount} site-header-elementer`);
  if (!layout.headerVisible) failures.push("site-header er ikke synlig");
  if (layout.footerCount !== 1) failures.push(`${layout.footerCount} site-footer-elementer`);
  if (!layout.footerVisible) failures.push("site-footer er ikke synlig");

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
      if (url.pathname === "/api/webmcp/v1/capabilities") {
        return Response.json({ enabled: true, readOnly: true });
      }

      const machineResource = MACHINE_RESOURCES.find((resource) => resource.route === url.pathname);
      if (machineResource) return responseFor(Bun.file(join(projectRoot, machineResource.source)));
      if (["/legal.css", "/site-shell.css", "/site-shell.js"].includes(url.pathname)) {
        const contentType = url.pathname.endsWith(".css") ? "text/css" : "text/javascript";
        return responseFor(Bun.file(join(projectRoot, "web/public", url.pathname)), contentType);
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
    await page.goto(`${origin}/prompts/`, { waitUntil: "networkidle" });
    if (await page.locator("article blockquote").count() !== 10) {
      throw new Error(`Promptbiblioteket har ikke 10 enkle beskeder ved ${viewport.name}`);
    }
    if (await page.locator(".prompt-copy").count() !== 10) {
      throw new Error(`Promptbiblioteket har ikke 18 kopiknapper ved ${viewport.name}`);
    }
    if (viewport.name === "mobile") {
      const firstBlock = (await page.locator("article blockquote").first().textContent())?.trim() ?? "";
      const assembled = await page.locator(".prompt-copy-source").first().inputValue();
      if (!assembled.includes("Jeg kan altid svare") || !assembled.endsWith(firstBlock)) {
        throw new Error("Den samlede kopiprompt mangler sikkerhedskerne eller modultekst");
      }
      await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => { throw new Error("test-fallback"); } },
      }));
      await page.locator(".prompt-copy").first().click();
      const fallback = await page.locator(".prompt-copy-source").first().evaluate((element) => {
        const source = element as HTMLTextAreaElement;
        return { active: document.activeElement === source, start: source.selectionStart, end: source.selectionEnd, length: source.value.length };
      });
      if (!fallback.active || fallback.start !== 0 || fallback.end !== fallback.length) {
        throw new Error("Clipboard-fallbacken markerer ikke hele den samlede prompt");
      }
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

  const webMcpContext = await browser.newContext({ viewport: RESPONSIVE_VIEWPORTS[0] });
  await webMcpContext.addInitScript(() => {
    const browserGlobal = globalThis as typeof globalThis & { __jobagentenTools?: string[]; __jobagentenSignals?: AbortSignal[] };
    browserGlobal.__jobagentenTools = [];
    browserGlobal.__jobagentenSignals = [];
    Object.defineProperty(Document.prototype, "modelContext", {
      configurable: true,
      get: () => ({ registerTool: async (tool: { name: string }, options?: { signal?: AbortSignal }) => {
        browserGlobal.__jobagentenTools?.push(tool.name);
        if (options?.signal) browserGlobal.__jobagentenSignals?.push(options.signal);
      } }),
    });
  });
  const webMcpPage = await webMcpContext.newPage();
  await webMcpPage.goto(`${origin}/forloeb/`, { waitUntil: "networkidle" });
  await webMcpPage.waitForFunction(() => (globalThis as typeof globalThis & { __jobagentenTools?: string[] }).__jobagentenTools?.length === 4);
  const registeredTools = await webMcpPage.evaluate(() => (globalThis as typeof globalThis & { __jobagentenTools?: string[] }).__jobagentenTools);
  if (JSON.stringify(registeredTools?.sort()) !== JSON.stringify(["get_danish_job_details", "get_jobagenten_capabilities", "get_jobseeker_guide", "search_danish_jobs"])) {
    throw new Error(`WebMCP registrerede uventede tools: ${JSON.stringify(registeredTools)}`);
  }
  const persistedKeepsTools = await webMcpPage.evaluate(() => {
    const browserGlobal = globalThis as typeof globalThis & { __jobagentenSignals?: AbortSignal[] };
    dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true }));
    return browserGlobal.__jobagentenSignals?.every((signal) => !signal.aborted);
  });
  if (!persistedKeepsTools) throw new Error("WebMCP-tools blev afbrudt ved BFCache-entry");
  const navigationAbortsTools = await webMcpPage.evaluate(() => {
    const browserGlobal = globalThis as typeof globalThis & { __jobagentenSignals?: AbortSignal[] };
    dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }));
    return browserGlobal.__jobagentenSignals?.every((signal) => signal.aborted);
  });
  if (!navigationAbortsTools) throw new Error("WebMCP-tools blev ikke afbrudt ved rigtig navigation");
  await webMcpContext.close();

  const rejectedRegistrationContext = await browser.newContext({ viewport: RESPONSIVE_VIEWPORTS[0] });
  await rejectedRegistrationContext.addInitScript(() => {
    Object.defineProperty(Document.prototype, "modelContext", {
      configurable: true,
      get: () => ({ registerTool: async () => { throw new Error("test-registration-rejection"); } }),
    });
  });
  const rejectedRegistrationPage = await rejectedRegistrationContext.newPage();
  const registrationErrors: Error[] = [];
  rejectedRegistrationPage.on("pageerror", (error) => registrationErrors.push(error));
  await rejectedRegistrationPage.goto(`${origin}/forloeb/`, { waitUntil: "networkidle" });
  await rejectedRegistrationPage.waitForTimeout(50);
  if (registrationErrors.length) throw new Error(`Afvist WebMCP-registrering gav uhåndteret fejl: ${registrationErrors[0]?.message}`);
  await rejectedRegistrationContext.close();

  console.log(
    `Responsiv sidekontrakt bestået: ${PUBLIC_PAGES.length} sider × ${RESPONSIVE_VIEWPORTS.length} viewports`,
  );
} finally {
  await browser?.close();
  server?.stop(true);
  await rm(outputDirectory, { recursive: true, force: true });
}
