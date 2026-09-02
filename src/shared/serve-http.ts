import { createMcpHandler, type McpServer } from "@modelcontextprotocol/server";

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
      if (url.pathname === "/mcp") return handler.fetch(request);
      return new Response("Not found", { status: 404 });
    },
  });
  console.error(`${service} listening on http://${server.hostname}:${server.port}/mcp`);
}
