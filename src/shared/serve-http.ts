import { createMcpHandler, type McpServer } from "@modelcontextprotocol/server";
import { join, normalize, relative } from "node:path";
import { FairUseGuard } from "./fair-use.ts";

const publicRoot = join(process.cwd(), "web/public");
function contentType(path: string): string {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".md")) return "text/markdown; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".xml")) return "application/xml; charset=utf-8";
  if (path.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (path.endsWith("api-catalog")) return "application/linkset+json; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}
async function servePublic(pathname: string, method: string): Promise<Response | undefined> {
  if (method !== "GET" && method !== "HEAD") return undefined;
  const decoded = decodeURIComponent(pathname);
  if (decoded.includes("\0")) return undefined;
  const relativePath = decoded === "/" ? "" : decoded.replace(/^\/+/, "");
  const candidate = normalize(join(publicRoot, relativePath || "index.html"));
  const path = relative(publicRoot, candidate);
  if (path.startsWith("..") || path === "") return undefined;
  const direct = Bun.file(candidate);
  const file = (await direct.exists()) ? direct : pathname.endsWith("/") ? Bun.file(join(candidate, "index.html")) : undefined;
  if (!file || !(await file.exists())) return undefined;
  const headers = { "content-type": contentType(pathname.endsWith("/") ? `${pathname}index.html` : pathname) };
  return method === "HEAD" ? new Response(null, { headers }) : new Response(file, { headers });
}

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
      const publicFile = await servePublic(url.pathname, request.method);
      if (publicFile) return publicFile;
      return new Response("Not found", { status: 404 });
    },
  });
  console.error(`${service} listening on http://${server.hostname}:${server.port}/mcp`);
}
