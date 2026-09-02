import { describe, expect, mock, test } from "bun:test";
import { JobbankClient, buildJobbankQuery } from "../src/providers/jobbank/client.ts";
import { JobindexClient, buildJobindexSearchPath } from "../src/providers/jobindex/client.ts";
import { JobdanmarkClient } from "../src/providers/jobdanmark/client.ts";

const rss = `<?xml version="1.0"?><rss><channel><title>Resultater</title><description>Test</description><link>https://example.test</link><item><title>Dataanalytiker, Acme</title><link>https://jobbank.dk/job/123/acme/data</link><guid>123</guid><description><![CDATA[Job hos Acme, (København) Ansøgningsfrist: 30-09-2026]]></description><pubDate>Tue, 02 Sep 2026 08:00:00 GMT</pubDate><category>Data</category></item></channel></rss>`;

describe("JobbankClient", () => {
  test("serializes every server-side filter", () => {
    const query = buildJobbankQuery({ keywords: "data", excludeKeywords: "senior", jobTypeIds: [1, 2], educationAreaIds: [24], locationIds: [2], workAreaIds: [43], industryIds: [10331], suitabilityIds: [5], company: "Acme", remoteWork: "helt", postedSince: "2026-09-01", page: 2, limit: 10 });
    expect(query.getAll("cvtype")).toEqual(["1", "2"]);
    expect(query.toString()).toContain("fjernarbejde=helt");
    expect(query.get("page")).toBe("2");
  });

  test("uses Jobbank's filtered RSS and parses details", async () => {
    const fetchMock = mock(async (url: URL | RequestInfo) => String(url).includes("/job/rss")
      ? new Response(rss)
      : new Response(`<h1 itemprop="title">Dataanalytiker</h1><h2 itemprop="hiringOrganization">Acme</h2><div class="jobContent" itemprop="description"><p>Arbejd med data</p></div><span itemprop="validThrough">30-09-2026</span><i title="Geografiske områder: København"></i>`));
    const client = new JobbankClient({ fetch: fetchMock as unknown as typeof fetch });
    const result = await client.search({ keywords: "data", page: 1, limit: 5 });
    expect(result.jobs[0]).toMatchObject({ id: "123", employer: "Acme" });
    const detail = await client.getDetails(result.jobs[0]!.canonicalUrl, 500);
    expect(detail).toMatchObject({ title: "Dataanalytiker", employer: "Acme", body: "Arbejd med data" });
  });

  test("labels malformed RSS, invalid result URLs, and blank details as provider errors", async () => {
    const empty = new JobbankClient({ fetch: (async () => new Response("<rss><channel><title>Ingen resultater</title></channel></rss>")) as unknown as typeof fetch });
    await expect(empty.search({ page: 1, limit: 5 })).resolves.toMatchObject({ jobs: [] });
    const invalidRss = new JobbankClient({ fetch: (async () => new Response("<rss></rss>")) as unknown as typeof fetch });
    await expect(invalidRss.search({ page: 1, limit: 5 })).rejects.toMatchObject({ provider: "Jobbank" });
    const invalidUrl = new JobbankClient({ fetch: (async () => new Response(rss.replace("https://jobbank.dk/job/123/acme/data", "https://evil.test/job/123"))) as unknown as typeof fetch });
    await expect(invalidUrl.search({ page: 1, limit: 5 })).rejects.toMatchObject({ provider: "Jobbank" });
    const blankDetail = new JobbankClient({ fetch: (async () => new Response("<h1 itemprop=\"title\"> </h1>")) as unknown as typeof fetch });
    await expect(blankDetail.getDetails("https://jobbank.dk/job/123/test", 500)).rejects.toMatchObject({ provider: "Jobbank" });
  });
});

describe("JobindexClient", () => {
  test("builds the navigable search path", () => {
    expect(buildJobindexSearchPath({ query: "data", exactPhrase: true, area: "storkoebenhavn", categoryGroup: "it", categorySlug: "itdrift", maxAgeDays: 7, page: 2, limit: 10 })).toBe("/jobsoegning/it/itdrift/storkoebenhavn?q=%27data%27&jobage=7&page=2");
  });

  test("follows the RSS representation published by the search page", async () => {
    const jobindexRss = rss.replace("https://jobbank.dk/job/123/acme/data", "https://www.jobindex.dk/vis-job/abc");
    const fetchMock = mock(async (url: URL | RequestInfo) => String(url).includes("jobsoegning.rss")
      ? new Response(jobindexRss)
      : new Response(`<link rel="alternate" href="/jobsoegning.rss?q=data" type="application/rss+xml">`));
    const client = new JobindexClient({ fetch: fetchMock as unknown as typeof fetch });
    const result = await client.search({ query: "data", exactPhrase: false, page: 1, limit: 5 });
    expect(result.resultsUrl).toContain("jobsoegning.rss");
    expect(result.jobs[0]).toMatchObject({ id: "abc", employer: "Acme" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("labels malformed RSS, invalid result URLs, and blank details as provider errors", async () => {
    const empty = new JobindexClient({ fetch: (async (url: URL | RequestInfo) => String(url).includes(".rss") ? new Response("<rss><channel><title>Ingen resultater</title></channel></rss>") : new Response("<link href=\"/results.rss\" type=\"application/rss+xml\">")) as unknown as typeof fetch });
    await expect(empty.search({ exactPhrase: false, page: 1, limit: 5 })).resolves.toMatchObject({ jobs: [] });
    const invalidRss = new JobindexClient({ fetch: (async (url: URL | RequestInfo) => String(url).includes(".rss") ? new Response("<rss></rss>") : new Response("<link href=\"/results.rss\" type=\"application/rss+xml\">")) as unknown as typeof fetch });
    await expect(invalidRss.search({ exactPhrase: false, page: 1, limit: 5 })).rejects.toMatchObject({ provider: "Jobindex" });
    const invalidUrl = new JobindexClient({ fetch: (async (url: URL | RequestInfo) => String(url).includes(".rss") ? new Response(rss.replace("https://jobbank.dk/job/123/acme/data", "https://www.jobindex.dk/job/123")) : new Response("<link href=\"/results.rss\" type=\"application/rss+xml\">")) as unknown as typeof fetch });
    await expect(invalidUrl.search({ exactPhrase: false, page: 1, limit: 5 })).rejects.toMatchObject({ provider: "Jobindex" });
    const blankNormalizedTitle = new JobindexClient({ fetch: (async (url: URL | RequestInfo) => String(url).includes(".rss") ? new Response(rss.replace("Dataanalytiker, Acme", ", Acme").replace("https://jobbank.dk/job/123/acme/data", "https://www.jobindex.dk/vis-job/abc")) : new Response("<link href=\"/results.rss\" type=\"application/rss+xml\">")) as unknown as typeof fetch });
    await expect(blankNormalizedTitle.search({ exactPhrase: false, page: 1, limit: 5 })).rejects.toMatchObject({ provider: "Jobindex" });
    const blankDetail = new JobindexClient({ fetch: (async () => new Response("<h1>Jobannonce: </h1>")) as unknown as typeof fetch });
    await expect(blankDetail.getDetails("https://www.jobindex.dk/vis-job/abc", 500)).rejects.toMatchObject({ provider: "Jobindex" });
  });
});

describe("JobdanmarkClient", () => {
  test("resolves live filter values and POSTs the website search body", async () => {
    const requests: Array<{ url: string; body?: string }> = [];
    const fetchMock = mock(async (url: URL | RequestInfo, init?: RequestInit) => {
      requests.push({ url: String(url), ...(typeof init?.body === "string" ? { body: init.body } : {}) });
      if (String(url).endsWith("/settings")) return Response.json({ categories: [{ id: 7, title: "IT" }], jobTitles: [{ id: 8, name: "Dataanalytiker", slug: "dataanalytiker" }], jobTypes: ["fuldtid"] });
      if (String(url).includes("/locations")) return Response.json([{ title: "By", items: [{ id: "cph", text: "København", value: "København", category: "city", slug: "koebenhavn" }] }]);
      return Response.json({ currentPage: 1, items: [{ title: "Dataanalytiker", companyName: "Acme", url: "/job/abc" }], itemsPrPage: 30, totalItems: 1, totalPages: 1 });
    });
    const client = new JobdanmarkClient({ fetch: fetchMock as unknown as typeof fetch });
    const result = await client.search({ query: "data", jobTypes: ["fuldtid"], categoryIds: [7], jobTitleSlugs: ["dataanalytiker"], locations: [{ query: "København", type: "city" }], page: 1, limit: 30 });
    expect(result.jobs[0]?.canonicalUrl).toBe("https://jobdanmark.dk/job/abc");
    expect(JSON.parse(requests.at(-1)!.body!)).toMatchObject({ jobTypes: ["fuldtid"], filters: [{ type: "freetext" }, { type: "category" }, { type: "jobtitle" }, { type: "city" }] });
  });

  test("parses JobPosting JSON-LD details and rejects unknown IDs", async () => {
    const html = `<script type="application/ld&#x2B;json">{"title":"Data &amp; AI","description":"&lt;p&gt;Analyse&lt;/p&gt;","hiringOrganization":{"name":"Acme"},"datePosted":"2026-09-02"}</script>`;
    const client = new JobdanmarkClient({ fetch: (async (url: URL | RequestInfo) => String(url).endsWith("/settings") ? Response.json({ categories: [], jobTitles: [], jobTypes: [] }) : new Response(html)) as unknown as typeof fetch });
    const detail = await client.getDetails("https://jobdanmark.dk/job/abc", 500);
    expect(detail).toMatchObject({ title: "Data & AI", employer: "Acme", body: "Analyse" });
    await expect(client.search({ categoryIds: [999], page: 1, limit: 30 })).rejects.toThrow("Unknown Jobdanmark category ID");
  });
});
