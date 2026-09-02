#!/usr/bin/env bun
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createJobbankServer } from "./server.ts";
serveStdio(() => createJobbankServer());
