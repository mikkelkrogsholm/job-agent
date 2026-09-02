import { serveHttp } from "../../shared/serve-http.ts";
import { createJobdanmarkServer } from "./server.ts";
serveHttp(createJobdanmarkServer, "jobdanmark-mcp", 3003);
