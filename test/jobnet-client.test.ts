import { describe, expect, mock, test } from "bun:test";
import {
  JobnetClient,
  JobnetError,
  buildSearchQuery,
} from "../src/jobnet-client.ts";

describe("buildSearchQuery", () => {
  test("serializes every filter and repeats array values", () => {
    const query = buildSearchQuery({
      searchString: "dataanalytiker",
      resultsPerPage: 20,
      pageNumber: 2,
      orderType: "PublicationDate",
      workplaceFilter: "NonFixed",
      employmentDurationType: "Permanent",
      workHoursType: "FullTime",
      workHourMin: 20,
      workHourMax: 30,
      countries: ["DK", "GL"],
      regions: ["Nordjylland", "Midtjylland"],
      postalCode: 9000,
      kmRadius: 25,
      occupationAreas: ["10000"],
      occupationGroups: ["10060"],
      occupations: ["528142f0-f29c-420f-92d6-d9986c8d337d"],
      aliasIdentifiers: ["17d1d801-11d9-4319-8c39-5e3907d2c034"],
      jobAnnouncementType: "Ordinaert",
    });

    expect(query.getAll("regions")).toEqual(["Nordjylland", "Midtjylland"]);
    expect(query.getAll("countries")).toEqual(["DK", "GL"]);
    expect(query.get("postalCode")).toBe("9000");
    expect(query.get("workHourMin")).toBe("20");
    expect(query.get("occupationGroups")).toBe("10060");
    expect(query.get("aliasIdentifiers")).toBe(
      "17d1d801-11d9-4319-8c39-5e3907d2c034",
    );
  });

  test("adds Jobnet defaults", () => {
    const query = buildSearchQuery({
      resultsPerPage: 10,
      pageNumber: 1,
      orderType: "BestMatch",
      kmRadius: 50,
    });

    expect(query.get("searchString")).toBe("");
    expect(query.get("resultsPerPage")).toBe("10");
    expect(query.get("pageNumber")).toBe("1");
    expect(query.get("orderType")).toBe("BestMatch");
    expect(query.get("kmRadius")).toBe("50");
  });
});

describe("JobnetClient", () => {
  test("uses the required headers and returns JSON", async () => {
    const fetchMock = mock(
      async (request: URL | RequestInfo, init?: RequestInit) => {
        expect(String(request)).toContain(
          "/FindJob/GetTypeaheadSuggestions?query=data",
        );
        expect(new Headers(init?.headers).get("x-csrf")).toBe("1");
        return Response.json(["dataanalyse"]);
      },
    );
    const client = new JobnetClient({
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.suggestTerms("data")).resolves.toEqual(["dataanalyse"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("converts non-success responses to JobnetError", async () => {
    const client = new JobnetClient({
      fetch: mock(
        async () => new Response("bad gateway", { status: 502 }),
      ) as unknown as typeof fetch,
    });

    await expect(
      client.getJob("f4fa5c1f-8c43-4afe-9eff-a984d9bc32a1"),
    ).rejects.toBeInstanceOf(JobnetError);
  });
});
