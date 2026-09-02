import { afterEach, describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport, type McpServer } from "@modelcontextprotocol/server";
import type { JobnetClient } from "../src/jobnet-client.ts";
import type { JobbankClient } from "../src/providers/jobbank/client.ts";
import type { JobindexClient } from "../src/providers/jobindex/client.ts";
import type { JobdanmarkClient } from "../src/providers/jobdanmark/client.ts";
import { DanishJobsClient, deduplicateJobs, resolveSearchIntent, type DanishJobsDependencies } from "../src/providers/danish/client.ts";
import { createDanishJobsServer } from "../src/providers/danish/server.ts";

const open: Array<{ client: Client; server: McpServer }> = [];
afterEach(async () => Promise.all(open.splice(0).map(({ client, server }) => Promise.all([client.close(), server.close()]))));

describe("DanishJobsClient", () => {
  test("searches selected providers concurrently and normalizes results", async () => {
    let active = 0;
    let maximumActive = 0;
    const pause = async () => { active++; maximumActive = Math.max(maximumActive, active); await Bun.sleep(5); active--; };
    const client = new DanishJobsClient(fakeDependencies({ pause }));
    const result = await client.search({ query: "data", providers: ["jobnet", "jobbank", "jobindex", "jobdanmark"], limitPerProvider: 5, radiusKm: 50 });
    expect(maximumActive).toBe(4);
    expect(result.failures).toEqual([]);
    expect(result).toMatchObject({ rawCount: 4, uniqueCount: 4 });
    expect(result.jobs.every((job) => job.title && job.canonicalUrl && "postedDate" in job && "deadline" in job)).toBe(true);
  });

  test("splits ordinary Danish occupation and location requests before provider search", () => {
    expect(resolveSearchIntent({ query: "Elektriker i Aalborg", providers: ["jobnet"], limitPerProvider: 10, radiusKm: 25 })).toEqual({
      occupation: "Elektriker", location: "Aalborg", postalCode: 9000, radiusKm: 25, interpretation: "parsed_query",
    });
    expect(resolveSearchIntent({ query: "find arbejde", occupation: "Controller", location: "København", providers: ["jobnet"], limitPerProvider: 10, radiusKm: 50 })).toMatchObject({
      occupation: "Controller", location: "København", postalCode: 1050, interpretation: "structured",
    });
  });

  test("keeps successful results when one provider fails", async () => {
    const dependencies = fakeDependencies();
    dependencies.jobindex = { search: async () => { throw new Error("temporarily unavailable"); } } as unknown as JobindexClient;
    const result = await new DanishJobsClient(dependencies).search({ query: "data", providers: ["jobnet", "jobindex"], limitPerProvider: 5, radiusKm: 50 });
    expect(result.jobs).toHaveLength(1);
    expect(result.failures).toEqual([{ provider: "jobindex", error: "temporarily unavailable" }]);
  });

  test("rejects deterministically when every selected provider fails", async () => {
    const dependencies = fakeDependencies();
    dependencies.jobnet = { search: async () => { throw new Error("jobnet down"); } } as unknown as JobnetClient;
    dependencies.jobindex = { search: async () => { throw new Error("jobindex down"); } } as unknown as JobindexClient;
    await expect(new DanishJobsClient(dependencies).search({ query: "data", providers: ["jobnet", "jobindex"], limitPerProvider: 5, radiusKm: 50 }))
      .rejects.toThrow("All selected providers failed: jobnet: jobnet down; jobindex: jobindex down");
  });

  test("merges only exact URLs or complete title/company/location matches and sorts dated jobs first", () => {
    const jobs = deduplicateJobs([
      { provider: "jobnet", providerJobId: "1", title: "Dataanalytiker", company: "Acme A/S", location: "Aarhus", postedDate: "2026-09-01", deadline: null, canonicalUrl: "https://jobnet.dk/find-job/1", alsoFoundOn: [] },
      { provider: "jobindex", providerJobId: "2", title: "Dataanalytiker", company: "ACME A/S", location: null, postedDate: "2026-09-02", deadline: "2026-09-30", canonicalUrl: "https://www.jobindex.dk/vis-job/2", alsoFoundOn: [] },
      { provider: "jobdanmark", providerJobId: "3", title: "Controller", company: "Beta", location: null, postedDate: null, deadline: null, canonicalUrl: "https://jobdanmark.dk/job/3", alsoFoundOn: [] },
    ]);
    expect(jobs).toHaveLength(3);
    expect(jobs.map((job) => job.location)).toContain(null);
    const merged = deduplicateJobs([
      { provider: "jobnet", providerJobId: "1", title: "Dataanalytiker", company: "Acme", location: "Aarhus", postedDate: null, deadline: null, canonicalUrl: "https://jobnet.dk/find-job/1", alsoFoundOn: [] },
      { provider: "jobindex", providerJobId: "2", title: "dataanalytiker", company: "ACME", location: "Aarhus", postedDate: null, deadline: null, canonicalUrl: "https://www.jobindex.dk/vis-job/2", alsoFoundOn: [] },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.alsoFoundOn).toEqual(["jobindex"]);
    const sameProvider = deduplicateJobs([
      { provider: "jobnet", providerJobId: "1", title: "Pædagog", company: "Kommune", location: "Aarhus", postedDate: null, deadline: null, canonicalUrl: "https://jobnet.dk/find-job/1", alsoFoundOn: [] },
      { provider: "jobnet", providerJobId: "2", title: "Pædagog", company: "Kommune", location: "Aarhus", postedDate: null, deadline: null, canonicalUrl: "https://jobnet.dk/find-job/2", alsoFoundOn: [] },
    ]);
    expect(sameProvider).toHaveLength(2);
  });

  test("routes details and rejects mismatched provider URLs", async () => {
    const client = new DanishJobsClient(fakeDependencies());
    await expect(client.getDetails("jobbank", "https://jobbank.dk/job/10/test", 500)).resolves.toMatchObject({ title: "Detail" });
    await expect(client.getDetails("jobbank", "https://jobdanmark.dk/job/test", 500)).rejects.toThrow("exact https jobbank job URL");
  });
});

describe("Danish jobs MCP", () => {
  test("publishes and executes its four read-only tools", async () => {
    const server = createDanishJobsServer({ client: new DanishJobsClient(fakeDependencies()), now: () => new Date("2026-09-02T10:00:00Z") });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "danish-jobs-test", version: "1" });
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    open.push({ client, server });
    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name).sort()).toEqual(["get_danish_job_details", "get_jobseeker_guide", "search_danish_jobs", "start_jobseeker_journey"]);
    expect(tools.tools.every((tool) => tool.annotations?.readOnlyHint === true)).toBe(true);
    const start = await client.callTool({ name: "start_jobseeker_journey", arguments: { goal: "find_jobs" } });
    expect(start.isError).not.toBe(true);
    expect(start.structuredContent).toMatchObject({ goal: "find_jobs", nextStep: { guideId: "forloeb-find-job" } });
    const guide = await client.callTool({ name: "get_jobseeker_guide", arguments: { guideId: "forloeb-find-job" } });
    expect(guide.isError).not.toBe(true);
    expect(guide.structuredContent).toMatchObject({ id: "forloeb-find-job", readOnlyBoundary: true });
    expect((guide.structuredContent as { contentMarkdown: string }).contentMarkdown).toContain("# Find aktuelle job");
    const search = await client.callTool({ name: "search_danish_jobs", arguments: { query: "data", providers: ["jobbank"] } });
    expect(search.isError).not.toBe(true);
    expect(search.structuredContent).toMatchObject({ rawCount: 1, uniqueCount: 1, successfulProviders: ["jobbank"] });
    const detail = await client.callTool({ name: "get_danish_job_details", arguments: { provider: "jobbank", canonicalUrl: "https://jobbank.dk/job/10/test" } });
    expect(detail.isError).not.toBe(true);
  });

  test("publishes the full guide pack as resources and ten reusable prompts", async () => {
    const server = createDanishJobsServer({ client: new DanishJobsClient(fakeDependencies()) });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "danish-agent-pack-test", version: "1" });
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    open.push({ client, server });

    const resources = await client.listResources();
    expect(resources.resources).toHaveLength(24);
    expect(resources.resources.map((resource) => resource.uri)).toContain("jobagenten://start");
    expect(resources.resources.map((resource) => resource.uri)).toContain("jobagenten://guides/ansoegning");
    const start = await client.readResource({ uri: "jobagenten://start" });
    expect(start.contents[0]).toMatchObject({ mimeType: "text/markdown" });
    expect((start.contents[0] as { text: string }).text).toContain("# Start med Jobagenten");

    const prompts = await client.listPrompts();
    expect(prompts.prompts).toHaveLength(10);
    expect(prompts.prompts.map((prompt) => prompt.name)).toContain("find_aktuelle_job");
    const prompt = await client.getPrompt({ name: "find_aktuelle_job" });
    expect(prompt.messages[0]?.content).toMatchObject({ type: "text" });
    expect((prompt.messages[0]?.content as { type: "text"; text: string }).text).toContain("aktuelle job");
  });

  test("rejects invalid combined detail URLs before routing and returns all-provider failure as MCP error", async () => {
    const dependencies = fakeDependencies();
    dependencies.jobbank = { search: async () => { throw new Error("down"); } } as unknown as JobbankClient;
    const server = createDanishJobsServer({ client: new DanishJobsClient(dependencies) });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "danish-jobs-error-test", version: "1" });
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    open.push({ client, server });
    for (const canonicalUrl of [
      "http://jobbank.dk/job/10/test",
      "https://www.jobbank.dk/job/10/test",
      "https://jobbank.dk:444/job/10/acme/test",
      "https://user:password@jobbank.dk/job/10/acme/test",
      "https://jobbank.dk/not-a-job/10",
    ]) expect((await client.callTool({ name: "get_danish_job_details", arguments: { provider: "jobbank", canonicalUrl } })).isError).toBe(true);
    expect((await client.callTool({ name: "search_danish_jobs", arguments: { query: "data", providers: ["jobbank"] } })).isError).toBe(true);
  });
});

function fakeDependencies(options: { pause?: () => Promise<void> } = {}): DanishJobsDependencies {
  const wait = options.pause ?? (async () => {});
  return {
    jobnet: { search: async () => { await wait(); return { totalJobAdCount: 1, searchString: "data", searchFacets: {}, jobAds: [{ jobAdId: "jn1", title: "Data engineer", hiringOrgName: "Acme", postalCode: 8000, postalDistrictName: "Aarhus", publicationDate: "2026-09-02" }] }; }, getJob: async (id: string) => ({ id, title: "Detail" }) } as unknown as JobnetClient,
    jobbank: { search: async () => { await wait(); return { jobs: [{ id: "jb1", title: "Analytiker", employer: "Beta", publicationDate: "Tue, 01 Sep 2026 08:00:00 GMT", applicationDeadline: "30-09-2026", canonicalUrl: "https://jobbank.dk/job/10/test" }] }; }, getDetails: async () => ({ title: "Detail" }) } as unknown as JobbankClient,
    jobindex: { search: async () => { await wait(); return { jobs: [{ id: "ji1", title: "BI specialist", employer: "Gamma", location: "Odense", publicationDate: "2026-08-31", canonicalUrl: "https://www.jobindex.dk/vis-job/ji1" }] }; }, getDetails: async () => ({ title: "Detail" }) } as unknown as JobindexClient,
    jobdanmark: { search: async () => { await wait(); return { jobs: [{ id: "jd1", title: "Data scientist", employer: "Delta", location: "København", publicationDate: "02-09-2026", applicationDeadline: null, canonicalUrl: "https://jobdanmark.dk/job/jd1" }] }; }, getDetails: async () => ({ title: "Detail" }) } as unknown as JobdanmarkClient,
  };
}
