#!/usr/bin/env bun
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createJobdanmarkServer } from "./server.ts";
serveStdio(() => createJobdanmarkServer());
