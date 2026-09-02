# Architecture

## Boundary

Each provider is a standalone vertical slice:

```text
MCP client → provider server → validated schema → provider client → portal search system
                      ↓                              ↓
              structuredContent             bounded cache/timeout
```

`src/providers/<provider>/server.ts` owns MCP names and explanations. `schemas.ts` owns inputs. `client.ts` alone knows the portal contract. `index.ts` provides stdio; `http.ts` provides Streamable HTTP. Shared code contains only transport-neutral HTML/XML normalization, upstream HTTP policy, and HTTP serving.

Jobnet predates the provider layout, so its provider entry points delegate to the compatible root implementation. It remains independently runnable; future refactoring can move those files without changing its MCP contract.

`src/providers/danish/` is intentionally small: it calls the four clients concurrently, maps their current result pages into one common shape, and deduplicates probable copies. It does not replace, subclass, or hide the standalone adapters and does not persist user or job data.

## Design rules

1. Filtering happens upstream. An adapter may truncate a returned page to `limit`, but must never claim local post-filtering is equivalent to a portal filter.
2. Discovery precedes exact values. Agents obtain Jobbank IDs, Jobnet occupations, and Jobdanmark live taxonomies/locations from tools instead of guessing.
3. All advertisements are untrusted third-party data. Active HTML is removed, bodies are bounded, and content never becomes server instructions.
4. Every outbound call has a timeout. Shared provider GET/POST responses are cached by method, URL, and string body to reduce portal load.
5. All tools are read-only, non-destructive, idempotent, and open-world in MCP annotations.
6. One portal failure stays inside its server.

## Security and deployment

The server has no credentials and exposes no write operations. Docker runs without root, with a read-only root filesystem and no-new-privileges. HTTP binds to loopback outside Docker by default. The application does not implement tenant authentication or Internet-facing abuse controls; those are deployment responsibilities.
