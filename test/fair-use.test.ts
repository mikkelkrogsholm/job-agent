import { describe, expect, test } from "bun:test";
import { clientAddress, FairUseGuard, fairUseOptionsFromEnv, requestWorkUnits, type FairUseOptions } from "../src/shared/fair-use.ts";

const defaults: FairUseOptions = {
  enabled: true,
  clientUnitsPerFiveMinutes: 30,
  clientBurstUnits: 4,
  ipUnitsPerFiveMinutes: 300,
  ipBurstUnits: 100,
  globalUnitsPerFiveMinutes: 1_500,
  globalBurstUnits: 100,
  maxConcurrentRequests: 2,
  maxRequestBytes: 1_024,
};

describe("public MCP fair use", () => {
  test("weights a combined search by selected provider count", async () => {
    expect(await requestWorkUnits(mcpRequest("search_danish_jobs", { providers: ["jobnet", "jobbank", "jobindex"] }))).toBe(3);
    expect(await requestWorkUnits(mcpRequest("search_danish_jobs", {}))).toBe(4);
    expect(await requestWorkUnits(mcpRequest("get_danish_job_details", {}))).toBe(1);
    expect(await requestWorkUnits(jsonRpcRequest("initialize"))).toBe(0.25);
  });

  test("allows a conversational burst and then returns a temporary 429", async () => {
    const guard = new FairUseGuard(defaults, () => 1_000);
    const request = mcpRequest("search_danish_jobs", { providers: ["jobnet", "jobbank"] }, "session-a");
    const first = await guard.permit(request, "192.0.2.1");
    expect(first.response).toBeUndefined();
    first.release();
    const second = await guard.permit(request, "192.0.2.1");
    expect(second.response).toBeUndefined();
    second.release();
    const denied = await guard.permit(request, "192.0.2.1");
    expect(denied.response?.status).toBe(429);
    expect(denied.response?.headers.get("retry-after")).toBe("20");
    expect(denied.response?.headers.get("x-rate-limit-scope")).toBe("client");
  });

  test("keeps clients on the same IP in separate session buckets", async () => {
    const guard = new FairUseGuard(defaults, () => 1_000);
    const expensiveA = mcpRequest("search_danish_jobs", {}, "session-a");
    const cheapB = mcpRequest("get_danish_job_details", {}, "session-b");
    expect((await guard.permit(expensiveA, "192.0.2.1")).response).toBeUndefined();
    expect((await guard.permit(cheapB, "192.0.2.1")).response).toBeUndefined();
  });

  test("does not apply the small session bucket when a cloud client sends no session ID", async () => {
    const guard = new FairUseGuard(defaults, () => 1_000);
    const request = mcpRequest("search_danish_jobs", {});
    for (let index = 0; index < 5; index++) {
      const permit = await guard.permit(request, "192.0.2.1");
      expect(permit.response).toBeUndefined();
      permit.release();
    }
  });

  test("caps concurrent POST work and releases permits", async () => {
    const guard = new FairUseGuard({ ...defaults, clientBurstUnits: 100 }, () => 1_000);
    const first = await guard.permit(mcpRequest("get_danish_job_details", {}, "a"), "192.0.2.1");
    const second = await guard.permit(mcpRequest("get_danish_job_details", {}, "b"), "192.0.2.2");
    expect((await guard.permit(mcpRequest("get_danish_job_details", {}, "c"), "192.0.2.3")).response?.status).toBe(503);
    first.release();
    expect((await guard.permit(mcpRequest("get_danish_job_details", {}, "c"), "192.0.2.3")).response).toBeUndefined();
    second.release();
  });

  test("rejects an oversized declared request before parsing it", async () => {
    const guard = new FairUseGuard(defaults);
    const request = new Request("http://localhost/mcp", { method: "POST", headers: { "content-length": "2048" }, body: "{}" });
    expect((await guard.permit(request, "192.0.2.1")).response?.status).toBe(413);
  });

  test("rejects an oversized body without content-length after reserving concurrency", async () => {
    const guard = new FairUseGuard({ ...defaults, maxRequestBytes: 256 });
    const request = new Request("http://localhost/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "x".repeat(1_000) }),
    });
    expect(request.headers.get("content-length")).toBeNull();
    expect((await guard.permit(request, "192.0.2.1")).response?.status).toBe(413);
    const valid = mcpRequest("get_danish_job_details", {}, "after-oversize");
    expect((await guard.permit(valid, "192.0.2.1")).response).toBeUndefined();
  });

  test("parses environment overrides without accepting invalid values", () => {
    const options = fairUseOptionsFromEnv({ MCP_FAIR_USE_ENABLED: "false", MCP_CLIENT_BURST_UNITS: "20", MCP_MAX_REQUEST_BYTES: "nope" });
    expect(options.enabled).toBe(false);
    expect(options.clientBurstUnits).toBe(20);
    expect(options.maxRequestBytes).toBe(131_072);
  });

  test("trusts forwarding headers only when explicitly configured", () => {
    const request = new Request("http://localhost/mcp", { headers: { "x-forwarded-for": "198.51.100.7, 172.18.0.2" } });
    expect(clientAddress(request, "172.18.0.2", false)).toBe("172.18.0.2");
    expect(clientAddress(request, "172.18.0.2", true)).toBe("198.51.100.7");
  });
});

function mcpRequest(name: string, args: Record<string, unknown>, sessionId?: string): Request {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (sessionId) headers["mcp-session-id"] = sessionId;
  return new Request("http://localhost/mcp", {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
  });
}

function jsonRpcRequest(method: string): Request {
  return new Request("http://localhost/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method }),
  });
}
