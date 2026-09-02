import { serveHttp } from "../../shared/serve-http.ts";
import { createDanishJobsServer } from "./server.ts";
import { createDanishWebMcpHandler } from "./webmcp-http.ts";

serveHttp(createDanishJobsServer, "danish-jobs-mcp", 3004, undefined, createDanishWebMcpHandler());
