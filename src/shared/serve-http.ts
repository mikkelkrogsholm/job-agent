import { createMcpHandler, type McpServer } from "@modelcontextprotocol/server";
import { FairUseGuard } from "./fair-use.ts";

export function serveHttp(
  createServer: () => McpServer,
  service: string,
  defaultPort: number,
  landingPage?: Bun.HTMLBundle,
): void {
  const host = Bun.env.MCP_HOST ?? "127.0.0.1";
  const configured = Number.parseInt(Bun.env.MCP_PORT ?? "", 10);
  const port =
    Number.isFinite(configured) && configured > 0 && configured <= 65_535
      ? configured
      : defaultPort;
  const handler = createMcpHandler(createServer);
  const fairUse = new FairUseGuard();
  const server = Bun.serve({
    hostname: host,
    port,
    routes: {
      "/": landingPage ?? new Response("Not found", { status: 404 }),
      "/assets/*": landingPage
        ? { dir: "./web/assets" }
        : new Response("Not found", { status: 404 }),
    },
    async fetch(request) {
      const url = new URL(request.url);
      if (request.method === "GET" && url.pathname === "/health") {
        return Response.json({ status: "ok", service });
      }
      if (url.pathname === "/mcp") {
        const remoteAddress = server.requestIP(request)?.address ?? null;
        const permit = await fairUse.permit(request, remoteAddress);
        if (permit.response) return permit.response;
        try {
          return await handler.fetch(request);
        } finally {
          permit.release();
        }
      }
      return new Response("Not found", { status: 404 });
    },
  });
  console.error(`${service} listening on http://${server.hostname}:${server.port}/mcp`);
}
