#!/usr/bin/env bun

import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createServer } from "./server.ts";

serveStdio(() => createServer());
