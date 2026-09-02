import { serveHttp } from "../../shared/serve-http.ts";
import { createDanishJobsServer } from "./server.ts";

serveHttp(createDanishJobsServer, "danish-jobs-mcp", 3004);
