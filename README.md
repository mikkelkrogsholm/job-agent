# Jobagenten

Find dit næste job i en samtale. Jobagenten er en åben, read-only MCP-server,
der giver Claude, ChatGPT, Codex og Claude Code adgang til aktuelle annoncer
fra danske jobportaler.

Bygget og drevet af
[Mikkel Freltoft Krogsholm](https://mikkelkrogsholm.dk/da/about/) gennem
[Brokk og Sindre ApS](https://brokk-sindre.dk/).

![Jobagenten — find dit næste job i en samtale](web/assets/jobagenten-social-preview.png)

Bidrag er meget velkomne. Se [CONTRIBUTING.md](CONTRIBUTING.md) for en kort
lokal opsætning, projektprincipper og forslag til gode første bidrag.

## MCP-serverne

Four standalone, read-only portal servers plus one small combined Danish search server. Each adapter uses the portal's own search mechanism; the combined server only normalizes and deduplicates the returned pages.

| Server | Search mechanism | HTTP port | Tools |
| --- | --- | ---: | ---: |
| Jobnet | Public website JSON BFF | 3000 | 6 |
| Akademikernes Jobbank | Server-side filtered search/RSS representation | 3001 | 3 |
| Jobindex | Navigable search page and its published RSS representation | 3002 | 3 |
| Jobdanmark | JSON settings, location, and search endpoints used by its frontend | 3003 | 4 |
| Danish jobs | Parallel search across the four adapters | 3004 | 2 |

The adapters are deliberately independent: each has its own client, schemas, MCP server, stdio entry point, HTTP entry point, tests, upstream limitations, and environment variables. A failing portal does not prevent the others from returning successful results; if every selected portal fails, the combined tool returns an error.

## Runtime

- Bun `1.4.0`, pinned in `packageManager` and Docker
- TypeScript `7.0.2`, strict, type-check only; Bun executes `.ts` directly
- Zod 4 tool validation
- MCP SDK 2

Install and verify:

```bash
bun install --frozen-lockfile
bun run check
bun run smoke:all
```

`check` runs TypeScript 7 and all deterministic tests with Bun 1.4's parallel test runner. `smoke:all` makes a small number of live, read-only requests and is intentionally separate from ordinary tests.

## Run one standalone MCP over stdio

```bash
bun run start:jobnet
bun run start:jobbank
bun run start:jobindex
bun run start:jobdanmark
bun run start:danish
```

Example client configuration (replace `/absolute/path/to/job-mcp` with the
folder where you cloned this repository):

```json
{
  "mcpServers": {
    "jobnet": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/job-mcp/src/providers/jobnet/index.ts"]
    },
    "jobdanmark": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/job-mcp/src/providers/jobdanmark/index.ts"]
    }
  }
}
```

The legacy `bun run start` and `bun run start:http` aliases still start Jobnet.

## Landing page

The combined Danish HTTP server also serves the Danish beginner-facing landing
page at `/`; its MCP transport remains available at `/mcp`.

```bash
bun run dev:site
```

Open `http://127.0.0.1:3004/`. The frontend is semantic HTML, modern CSS and
TypeScript bundled by Bun, with GSAP used only for the hero choreography and
pointer response. It includes keyboard-operated guide tabs, copy feedback, and
a complete `prefers-reduced-motion` fallback. Build its production assets with:

```bash
bun run build:site
```

Production uses separate containers: Caddy serves the static build and proxies
only `/mcp` to a private Bun 1.4 container. See
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the topology, anonymous fair-use
policy, deployment, and rollback procedure.

## Run all four in Docker

```bash
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3001/health
curl http://127.0.0.1:3002/health
curl http://127.0.0.1:3003/health
curl http://127.0.0.1:3004/health
```

Every MCP endpoint is `/mcp`; the combined service also exposes the landing page
at `/`. Compose binds only to loopback, runs as the unprivileged `bun` user, uses
a read-only root filesystem, and disables privilege escalation. These HTTP
endpoints have no application authentication; keep them local or add a reviewed
reverse proxy with TLS, authentication, authorization, rate limiting, and
request limits.

Host ports can be overridden with `JOBNET_PORT`, `JOBBANK_PORT`, `JOBINDEX_PORT`, `JOBDANMARK_PORT`, and `DANISH_JOBS_PORT`.

### Combined Danish search

- `search_danish_jobs`: structured occupation/location search (with backwards-compatible parsing of phrases such as `elektriker i Aalborg`) across selected portals, executed concurrently. It uses provider-native geography where available, returns `rawCount` and `uniqueCount`, normalizes metadata, conservatively merges cross-portal copies, deterministically prioritizes explicit title/location matches, and reports individual portal failures without calling the results objectively relevant.
- `get_danish_job_details`: routes an exact combined-search result to the correct existing detail adapter. Detail URLs must use HTTPS, the exact provider host, and that provider's job path.

Use the combined server for ordinary discovery. Use a standalone portal server whenever the user asks for exact portal-specific filters.

## Tool overview

### Jobnet

- `search_jobs`: the complete verified Find job filter model: text, order, workplace, duration, hours and weekly-hour range, countries, Danish regions, postal radius, occupation hierarchy, aliases, announcement type, and pagination.
- `get_job_details`: full advertisement by Jobnet UUID, with a bounded fallback for external advertisements.
- `get_job_facets`: live counts under the current filter set.
- `list_occupations`: area → group → occupation → alias taxonomy.
- `suggest_search_terms`: Jobnet typeahead.
- `get_filter_reference`: fixed enums and rules.

### Akademikernes Jobbank

- `search_jobbank_jobs`: keywords/exclusions, job type, education area, Danish area, work function, industry, suitability, company, remote mode, posted-since date, page, and limit.
- `get_jobbank_job_details`: full public advertisement.
- `get_jobbank_filter_reference`: complete verified numeric ID tables.

### Jobindex

- `search_jobindex_jobs`: broad/exact query, verified category path, Danish area, maximum age, page, and limit.
- `get_jobindex_job_details`: full result or teaser, including the employer application URL.
- `get_jobindex_filter_reference`: verified area/category rules and an explicit unsupported-filter list.

### Jobdanmark

- `search_jobdanmark_jobs`: free text, six job types, live category IDs, live job-title slugs, typed locations, page, and limit.
- `list_jobdanmark_filters`: current categories, job types, and optionally all job titles.
- `suggest_jobdanmark_locations`: the portal's own typed location autocomplete.
- `get_jobdanmark_job_details`: JobPosting structured data and sanitized body.

The tool descriptions and every input field contain agent-facing usage instructions. See [docs/MCP_TOOLS.md](docs/MCP_TOOLS.md) for exact workflows and examples.

## Environment

| Variable | Default |
| --- | --- |
| `MCP_HOST` | `127.0.0.1` |
| `MCP_PORT` | provider default above |
| `JOBNET_BASE_URL` | `https://jobnet.dk/bff` |
| `JOBBANK_BASE_URL` | `https://jobbank.dk` |
| `JOBINDEX_BASE_URL` | `https://www.jobindex.dk` |
| `JOBDANMARK_BASE_URL` | `https://jobdanmark.dk` |
| `<PROVIDER>_TIMEOUT_MS` | `15000` |
| `MCP_TRUST_PROXY` | `false` |
| `MCP_FAIR_USE_ENABLED` | `true` |
| `MCP_CLIENT_UNITS_PER_5_MIN` / `MCP_CLIENT_BURST_UNITS` | `30` / `12` |
| `MCP_IP_UNITS_PER_5_MIN` / `MCP_IP_BURST_UNITS` | `300` / `120` |
| `MCP_GLOBAL_UNITS_PER_5_MIN` / `MCP_GLOBAL_BURST_UNITS` | `1500` / `300` |
| `MCP_MAX_CONCURRENT_REQUESTS` | `8` |
| `MCP_MAX_REQUEST_BYTES` | `131072` |
| `WEBMCP_ENABLED` | `false` |

The combined Danish HTTP server can progressively expose five same-origin,
read-only WebMCP site tools when `WEBMCP_ENABLED=true`: capability discovery,
a guided journey start, full guide lookup, bounded job search, and bounded job details. WebMCP is optional
and experimental; ordinary HTML, Markdown, and `/mcp` continue to work when it
is disabled or unsupported. Browser requests use the same fair-use guard, and
job content remains explicitly marked as untrusted third-party content.

The ordinary combined MCP exposes the same journey start and full-guide tools,
24 Markdown resources (`jobagenten://start`, `jobagenten://prompts`, and all 22
guides), plus ten reusable MCP prompts. The package is generated from the same
canonical guide sources as the public HTML and Markdown pages, so human and
agent instructions cannot drift independently.

## Important limitations

These are public website interfaces, not promised stable third-party APIs. Jobnet's BFF and Jobdanmark's JSON endpoints are undocumented; Jobbank and Jobindex can change their HTML/RSS contracts. Jobbank and Jobindex reject invalid RSS/item shapes instead of treating them as empty results. Provider HTTP clients cache successful requests only, up to 256 entries per instance, with TTL expiry and FIFO eviction. Be conservative with volume and caching, honor portal terms and robots policies, and seek agreements before a public or high-volume deployment. No adapter logs in, mutates profiles, saves jobs, creates alerts, or applies.

See:

- [docs/PROVIDERS.md](docs/PROVIDERS.md) — exact integration mechanics and support boundary
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — modular design and security model
- [docs/TESTING.md](docs/TESTING.md) — deterministic, live, and Docker verification
- [docs/BUN-1.4-TYPESCRIPT-7.md](docs/BUN-1.4-TYPESCRIPT-7.md) — runtime/compiler audit
- [docs/JOBSOEGERREJSEN.md](docs/JOBSOEGERREJSEN.md) — produktretningen fra jobprofil og søgning til en ansøgning, brugeren selv sender
- [docs/JOBSOEGERREJSEN_RESEARCH.md](docs/JOBSOEGERREJSEN_RESEARCH.md) — danske kilder og redaktionelt faktagrundlag for jobsøgerrejsen
- [docs/PLATFORM_GUIDE_RESEARCH.md](docs/PLATFORM_GUIDE_RESEARCH.md) — verificerede og uafklarede capabilities på ChatGPT-, Claude- og Codex-flader
- [docs/GUIDED_PROMPTS.md](docs/GUIDED_PROMPTS.md) — fælles promptkontrakt og atten guidede jobsøgningsforløb
- [docs/AGENT_READABLE_GUIDES.md](docs/AGENT_READABLE_GUIDES.md) — capability-check, Markdown/discovery-lag og maskinlæsbare acceptkriterier
- [docs/PUBLIC_GUIDE_SITE_PLAN.md](docs/PUBLIC_GUIDE_SITE_PLAN.md) — implementerbar plan for alle forløbs-, platform-, prompt-, trygheds- og AI-sider

## License

MIT
