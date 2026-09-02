import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServer } from "./server.ts";

const host = Bun.env.MCP_HOST ?? "127.0.0.1";
const port = parsePort(Bun.env.MCP_PORT);
const handler = createMcpHandler(() => createServer());

const server = Bun.serve({
  hostname: host,
  port,
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ status: "ok", service: "jobnet-mcp" });
    }
    if (url.pathname === "/mcp") {
      return handler.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
});

console.error(
  `Jobnet MCP listening on http://${server.hostname}:${server.port}/mcp`,
);

function parsePort(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 65_535
    ? parsed
    : 3000;
}
