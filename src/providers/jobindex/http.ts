import { serveHttp } from "../../shared/serve-http.ts";
import { createJobindexServer } from "./server.ts";
serveHttp(createJobindexServer, "jobindex-mcp", 3002);
