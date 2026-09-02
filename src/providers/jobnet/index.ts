#!/usr/bin/env bun
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createJobnetServer } from "./server.ts";
serveStdio(() => createJobnetServer());
