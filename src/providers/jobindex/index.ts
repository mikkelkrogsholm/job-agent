#!/usr/bin/env bun
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createJobindexServer } from "./server.ts";
serveStdio(() => createJobindexServer());
