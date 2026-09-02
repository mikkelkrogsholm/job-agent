import { serveHttp } from "../../shared/serve-http.ts";
import { createDanishJobsServer } from "./server.ts";
import landingPage from "../../../web/index.html";

serveHttp(createDanishJobsServer, "danish-jobs-mcp", 3004, landingPage);
