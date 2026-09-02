import { describe, expect, mock, test } from "bun:test";
import { ProviderHttpClient, ProviderHttpError } from "../src/shared/provider-http.ts";

describe("ProviderHttpClient", () => {
  test("sets safe headers and caches equal requests", async () => {
    const fetchMock = mock(async (_url: URL | RequestInfo, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("user-agent")).toContain("job-mcp/2.0");
      return Response.json({ ok: true });
    });
    const client = new ProviderHttpClient("Test", { baseUrl: "https://example.test", fetch: fetchMock as unknown as typeof fetch });
    await client.json("/x");
    await client.json("/x");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("keeps POST bodies in the cache key and reports invalid JSON/status", async () => {
    const post = mock(async () => new Response("{}"));
    const client = new ProviderHttpClient("Test", { baseUrl: "https://example.test", fetch: post as unknown as typeof fetch });
    await client.json("/x", { method: "POST", body: "a" });
    await client.json("/x", { method: "POST", body: "b" });
    expect(post).toHaveBeenCalledTimes(2);

    const invalid = new ProviderHttpClient("Test", { baseUrl: "https://example.test", fetch: (async () => new Response("no")) as unknown as typeof fetch });
    await expect(invalid.json("/x")).rejects.toBeInstanceOf(ProviderHttpError);
    const failed = new ProviderHttpClient("Test", { baseUrl: "https://example.test", fetch: (async () => new Response("down", { status: 503 })) as unknown as typeof fetch });
    await expect(failed.text("/x")).rejects.toMatchObject({ status: 503 });
  });

  test("does not cache failed responses", async () => {
    let attempts = 0;
    const fetchMock = mock(async () => ++attempts === 1
      ? new Response("down", { status: 503 })
      : new Response("recovered"));
    const client = new ProviderHttpClient("Test", { baseUrl: "https://example.test", fetch: fetchMock as unknown as typeof fetch });
    await expect(client.text("/retry")).rejects.toMatchObject({ status: 503 });
    await expect(client.text("/retry")).resolves.toBe("recovered");
    await expect(client.text("/retry")).resolves.toBe("recovered");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("expires at the TTL boundary, sweeps expired entries, and evicts FIFO after 256 successes", async () => {
    let now = 0;
    const fetchMock = mock(async (url: URL | RequestInfo) => new Response(String(url)));
    const client = new ProviderHttpClient("Test", { baseUrl: "https://example.test", fetch: fetchMock as unknown as typeof fetch, cacheTtlMs: 10, now: () => now });
    await client.text("/ttl");
    now = 10;
    await client.text("/ttl");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    now = 20;
    await client.text("/fresh");
    for (let index = 0; index <= 256; index++) await client.text(`/job-${index}`);
    await client.text("/fresh");
    expect(fetchMock).toHaveBeenCalledTimes(261);
  });
});
