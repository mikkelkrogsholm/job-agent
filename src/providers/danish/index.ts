#!/usr/bin/env bun
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createDanishJobsServer } from "./server.ts";
serveStdio(() => createDanishJobsServer());
