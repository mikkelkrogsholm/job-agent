# Testing

## Deterministic suite

```bash
bun run check
```

This performs strict TypeScript 7 checking and `bun test --parallel`. Tests never require network access. They cover:

- filter serialization and defaulting;
- Bun-native RSS/XML normalization, including valid empty channels and deterministic rejection of malformed/non-RSS feeds and title/link-less items;
- HTML entity/sanitization and truncation;
- upstream headers, GET/POST cache keys, JSON errors, HTTP status errors, TTL-boundary expiry/sweeping, and 256-entry FIFO cache eviction;
- Jobbank search and detail parsing, strict result URLs, and provider-labelled malformed RSS/blank-detail errors;
- Jobindex navigation to its published RSS result representation, strict result URLs, and provider-labelled malformed RSS/blank-detail errors;
- Jobdanmark settings, location resolution, POST body, unknown IDs, and JSON-LD details;
- discovery and successful invocation of every MCP tool through linked in-memory transports;
- concurrent combined search, partial versus total provider failure, conservative normalized deduplication, sorting, exact HTTPS detail routing, and schema rejection;
- read-only annotations, structured output, and representative schema rejection.

Fixtures are deliberately small and assert contracts rather than volatile result counts.

## Live read-only smoke tests

```bash
bun run smoke       # deep Jobnet smoke
bun run smoke:all   # one small search per provider plus live taxonomies
```

Live checks are manual/CI-scheduled integration diagnostics, not unit tests. Failure can mean portal downtime or a changed undocumented contract.

## Docker

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
curl -fsS http://127.0.0.1:3000/health
curl -fsS http://127.0.0.1:3001/health
curl -fsS http://127.0.0.1:3002/health
curl -fsS http://127.0.0.1:3003/health
curl -fsS http://127.0.0.1:3004/health
docker compose down
```

Health only proves the MCP process is listening. Use `smoke:all` to prove upstream compatibility.
