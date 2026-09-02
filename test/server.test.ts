import { afterEach, describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { JobnetClient, type RawSearchResponse } from "../src/jobnet-client.ts";
import { createServer } from "../src/server.ts";

const connected: Array<{
  client: Client;
  server: ReturnType<typeof createServer>;
}> = [];

afterEach(async () => {
  await Promise.all(
    connected
      .splice(0)
      .map(({ client, server }) =>
        Promise.all([client.close(), server.close()]),
      ),
  );
});

describe("MCP contract", () => {
  test("publishes the complete read-only tool surface", async () => {
    const { client } = await connect(new FakeJobnetClient());
    const tools = await client.listTools();

    expect(tools.tools.map((tool) => tool.name).sort()).toEqual([
      "get_filter_reference",
      "get_job_details",
      "get_job_facets",
      "list_occupations",
      "search_jobs",
      "suggest_search_terms",
    ]);
    expect(
      tools.tools.every((tool) => tool.annotations?.readOnlyHint === true),
    ).toBe(true);
  });

  test("search_jobs applies defaults and returns structured content", async () => {
    const fake = new FakeJobnetClient();
    const { client } = await connect(fake);

    const result = await client.callTool({
      name: "search_jobs",
      arguments: { searchString: "dataanalytiker", regions: ["Nordjylland"] },
    });

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({
      total: 1,
      pageNumber: 1,
      resultsPerPage: 10,
      jobs: [{ title: "Dataanalytiker" }],
    });
    expect(fake.lastSearchInput).toMatchObject({
      searchString: "dataanalytiker",
      regions: ["Nordjylland"],
      resultsPerPage: 10,
      pageNumber: 1,
      orderType: "BestMatch",
      kmRadius: 50,
    });
  });

  test("rejects invalid weekly-hour ranges before calling Jobnet", async () => {
    const fake = new FakeJobnetClient();
    const { client } = await connect(fake);

    const result = await client.callTool({
      name: "search_jobs",
      arguments: { workHourMin: 30, workHourMax: 20 },
    });

    expect(result.isError).toBe(true);
    expect(fake.lastSearchInput).toBeUndefined();
  });

  test("executes every non-search Jobnet endpoint", async () => {
    const { client } = await connect(new FakeJobnetClient());
    const id = "f4fa5c1f-8c43-4afe-9eff-a984d9bc32a1";
    for (const request of [
      { name: "get_job_details", arguments: { jobId: id } },
      { name: "get_job_facets", arguments: { facetTypes: ["regions"] } },
      { name: "list_occupations", arguments: {} },
      { name: "suggest_search_terms", arguments: { query: "data" } },
      { name: "get_filter_reference", arguments: {} },
    ]) {
      const result = await client.callTool(request);
      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toBeDefined();
    }
  });
});

async function connect(
  jobnetClient: JobnetClient,
): Promise<{ client: Client }> {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const server = createServer({
    client: jobnetClient,
    now: () => new Date("2026-09-02T08:00:00.000Z"),
  });
  const client = new Client({ name: "jobnet-mcp-test", version: "1.0.0" });

  await server.connect(serverTransport);
  await client.connect(clientTransport);
  connected.push({ client, server });
  return { client };
}

class FakeJobnetClient extends JobnetClient {
  lastSearchInput?: Record<string, unknown>;

  override async search(
    input: Parameters<JobnetClient["search"]>[0],
  ): Promise<RawSearchResponse> {
    this.lastSearchInput = input;
    return {
      totalJobAdCount: 1,
      searchString: String(input.searchString ?? ""),
      searchFacets: { regions: [{ value: "Nordjylland", count: 1 }] },
      jobAds: [
        {
          jobAdId: "f4fa5c1f-8c43-4afe-9eff-a984d9bc32a1",
          title: "Dataanalytiker",
          hiringOrgName: "Eksempel A/S",
          postalCode: 9000,
          postalDistrictName: "Aalborg",
          description: "<p>Arbejd med data.</p>",
        },
      ],
    };
  }

  override async getJob(jobId: string) {
    return { id: jobId, title: "Dataanalytiker", body: "<p>Arbejd med data.</p>" };
  }

  override async listOccupations() {
    return [{ name: "IT", identifier: "10000", hierarchyLevel: "OccupationArea", parentIdentifier: "" }];
  }

  override async suggestTerms() {
    return ["dataanalytiker"];
  }
}
