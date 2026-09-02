import { serveHttp } from "../../shared/serve-http.ts";
import { createJobbankServer } from "./server.ts";
serveHttp(createJobbankServer, "jobbank-mcp", 3001);
