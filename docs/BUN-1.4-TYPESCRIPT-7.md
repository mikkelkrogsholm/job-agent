# Bun 1.4 and TypeScript 7 audit

## Used deliberately

- Bun 1.4.0 is pinned locally and in `oven/bun:1.4.0-alpine`.
- Bun executes TypeScript entry points directly; there is no Node transpile/build layer.
- `Bun.serve` hosts Streamable HTTP and health endpoints.
- `bun:test --parallel` runs independent test files using Bun 1.4 parallelism.
- `Bun.XML` parses RSS directly from response bytes. This matters for XML declarations and legacy encodings such as Jobindex feeds.
- `Bun.env` supplies provider-specific deployment configuration.
- Bun's native fetch, AbortSignal support, timers, and lockfile/install flow provide the runtime primitives.

## TypeScript 7 configuration

The project uses `typescript@7.0.2`, `@types/bun@1.4.0`, and the Bun-recommended modern compiler shape: `target: ESNext`, `module: Preserve`, `moduleResolution: Bundler`, `moduleDetection: force`, `verbatimModuleSyntax`, `allowImportingTsExtensions`, `noEmit`, Bun types, and strict safety flags including unchecked-index, override, fallthrough, and exact-optional checks.

This is a real TS7 migration, not merely a dependency declaration: the full repository and tests pass the TS7 checker.

## Bun 1.4 features intentionally not used

`Bun.WebView`, `Bun.Image`, `Bun.markdown`, `Bun.cron`, and `Bun.Terminal` solve desktop UI, image, Markdown, scheduling, and PTY problems. Adding them to a stateless read-only MCP server would increase surface area without improving search correctness. WebView could later support a portal that exposes an essential filter only through client-side UI, but it should be a separate, tested fallback rather than the default scraping architecture.

Single-file executable compilation is also optional rather than the Docker default: the pinned Bun image is easier to inspect and supports four entry points from one immutable image.
