import { afterEach, describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport, type McpServer } from "@modelcontextprotocol/server";
import type { JobbankClient } from "../src/providers/jobbank/client.ts";
import { createJobbankServer } from "../src/providers/jobbank/server.ts";
import type { JobindexClient } from "../src/providers/jobindex/client.ts";
import { createJobindexServer } from "../src/providers/jobindex/server.ts";
import type { JobdanmarkClient } from "../src/providers/jobdanmark/client.ts";
import { createJobdanmarkServer } from "../src/providers/jobdanmark/server.ts";

const open: Array<{ client: Client; server: McpServer }> = [];
afterEach(async () => Promise.all(open.splice(0).map(({ client, server }) => Promise.all([client.close(), server.close()]))));

const sourceNow = () => new Date("2026-09-02T08:00:00Z");
const job = { canonicalUrl: "https://example.test/job/1", title: "Data", employer: "Acme" };

describe("standalone provider MCP contracts", () => {
  test("Jobbank publishes and executes all three read-only tools", async () => {
    const fake = { search: async () => ({ jobs: [job] }), getDetails: async () => job } as unknown as JobbankClient;
    const client = await connect(createJobbankServer({ client: fake, now: sourceNow }));
    await expectTools(client, ["get_jobbank_filter_reference", "get_jobbank_job_details", "search_jobbank_jobs"]);
    expect((await client.callTool({ name: "search_jobbank_jobs", arguments: {} })).isError).not.toBe(true);
    expect((await client.callTool({ name: "get_jobbank_filter_reference", arguments: {} })).structuredContent).toHaveProperty("filters");
    expect((await client.callTool({ name: "get_jobbank_job_details", arguments: { url: "https://jobbank.dk/job/1/test" } })).isError).not.toBe(true);
    for (const url of ["http://jobbank.dk/job/1/test", "https://www.jobbank.dk/job/1/test", "https://jobbank.dk/job/not-a-number/test"]) {
      expect((await client.callTool({ name: "get_jobbank_job_details", arguments: { url } })).isError).toBe(true);
    }
  });

  test("Jobindex publishes and executes all three read-only tools", async () => {
    const fake = { search: async () => ({ jobs: [job] }), getDetails: async () => job } as unknown as JobindexClient;
    const client = await connect(createJobindexServer({ client: fake, now: sourceNow }));
    await expectTools(client, ["get_jobindex_filter_reference", "get_jobindex_job_details", "search_jobindex_jobs"]);
    expect((await client.callTool({ name: "search_jobindex_jobs", arguments: {} })).isError).not.toBe(true);
    expect((await client.callTool({ name: "get_jobindex_filter_reference", arguments: {} })).structuredContent).toHaveProperty("areas");
    expect((await client.callTool({ name: "get_jobindex_job_details", arguments: { url: "https://www.jobindex.dk/vis-job/abc" } })).isError).not.toBe(true);
    expect((await client.callTool({ name: "get_jobindex_job_details", arguments: { url: "https://jobindex.dk/vis-job/abc" } })).isError).toBe(true);
    expect((await client.callTool({ name: "search_jobindex_jobs", arguments: { categoryGroup: "it" } })).isError).toBe(true);
  });

  test("Jobdanmark publishes and executes all four read-only tools", async () => {
    const fake = {
      search: async () => ({ jobs: [job] }),
      getDetails: async () => job,
      getSettings: async () => ({ categories: [{ id: 1, title: "IT" }], jobTitles: [{ id: 2, name: "Data", slug: "data" }], jobTypes: ["fuldtid"] }),
      listLocations: async () => [{ title: "By", items: [{ category: "city", value: "Aalborg", text: "Aalborg", slug: "aalborg" }] }],
    } as unknown as JobdanmarkClient;
    const client = await connect(createJobdanmarkServer({ client: fake, now: sourceNow }));
    await expectTools(client, ["get_jobdanmark_job_details", "list_jobdanmark_filters", "search_jobdanmark_jobs", "suggest_jobdanmark_locations"]);
    for (const request of [
      { name: "search_jobdanmark_jobs", arguments: {} },
      { name: "list_jobdanmark_filters", arguments: { includeJobTitles: true } },
      { name: "suggest_jobdanmark_locations", arguments: { query: "Aalborg" } },
      { name: "get_jobdanmark_job_details", arguments: { url: "https://jobdanmark.dk/job/abc" } },
    ]) expect((await client.callTool(request)).isError).not.toBe(true);
    expect((await client.callTool({ name: "get_jobdanmark_job_details", arguments: { url: "https://jobdanmark.dk/job/abc/more" } })).isError).toBe(true);
  });
});

async function connect(server: McpServer): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "provider-test", version: "1" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  open.push({ client, server });
  return client;
}

async function expectTools(client: Client, expected: string[]): Promise<void> {
  const result = await client.listTools();
  expect(result.tools.map((tool) => tool.name).sort()).toEqual(expected);
  expect(result.tools.every((tool) => tool.annotations?.readOnlyHint === true)).toBe(true);
  expect(result.tools.every((tool) => (tool.description?.length ?? 0) > 100)).toBe(true);
}
