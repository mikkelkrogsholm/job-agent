import { serveHttp } from "../../shared/serve-http.ts";
import { createJobnetServer } from "./server.ts";
serveHttp(createJobnetServer, "jobnet-mcp", 3000);
