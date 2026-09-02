import { describe, expect, test } from "bun:test";

const analyticsOrigin = "https://umami.mikkelkrogsholm.dk";
const websiteId = "21fd36d8-1cd9-4071-817a-d20fde71de9b";

describe("privacy-friendly usage analytics", () => {
  test("loads Umami only on the canonical production hostname", async () => {
    const shell = await Bun.file("web/public/site-shell.js").text();
    expect(shell).toContain('const analyticsHostname = "job-agent.dk"');
    expect(shell).toContain(`const analyticsOrigin = "${analyticsOrigin}"`);
    expect(shell).toContain(`const analyticsWebsiteId = "${websiteId}"`);
    expect(shell).toContain('analyticsScript.dataset.doNotTrack = "true"');
    expect(shell).toContain("window.location.hostname === analyticsHostname");
  });

  test("permits only the configured analytics origin in the production CSP", async () => {
    const caddyfile = await Bun.file("deploy/Caddyfile").text();
    expect(caddyfile).toContain(`script-src 'self' ${analyticsOrigin}`);
    expect(caddyfile).toContain(`connect-src 'self' ${analyticsOrigin}`);
  });

  test("documents analytics without claiming that job-search content is collected", async () => {
    const privacy = await Bun.file("web/public/privacy/index.html").text();
    expect(privacy).toContain("vores egen Umami-løsning");
    expect(privacy).toContain("Den sætter ikke cookies");
    expect(privacy).toContain("CV, søgetekster og indholdet af beskeder sendes ikke til Umami");
  });
});
