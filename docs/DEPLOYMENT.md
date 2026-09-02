# Production deployment

`job-agent.dk` runs as two isolated services on one Docker network:

```text
Internet -> Caddy/web (80/443) -> Bun MCP (private port 3004)
```

The web image builds the landing page with Bun 1.4 and serves only static files.
The MCP image contains only server code plus the generated guide metadata it
needs for WebMCP guide lookup; it has no published host port. Caddy terminates
TLS and forwards `/mcp`, `/health`, and the bounded `/api/webmcp/v1/*` routes
to the MCP service.

## Deploy

On a host with Docker Engine and the Compose plugin:

```bash
git clone https://github.com/mikkelkrogsholm/job-agent.git
cd job-agent/deploy
docker compose up -d --build
docker compose ps
docker compose logs --tail=100
```

Only TCP 22, TCP 80, TCP 443, and UDP 443 need to be allowed through the host
firewall. DNS A records for `@` and `www` must point to the server before Caddy
can obtain certificates.

## Anonymous fair use

There is no account, API key, or login. POST requests to `/mcp` use weighted,
in-memory token buckets:

- a combined search costs one unit per selected portal (four by default);
- other tool calls cost one unit;
- MCP control messages cost 0.25 units;
- the per-session conversational burst is 12 units and refills at 30 units per
  five minutes;
- the fallback IP pool allows a burst of 120 and refills at 300 units per five
  minutes, accommodating shared cloud egress addresses;
- the global pool allows a burst of 300 and refills at 1,500 units per five
  minutes;
- at most eight MCP POST requests run concurrently;
- request bodies are capped at 128 KiB in both Caddy and Bun.

When present, `Mcp-Session-Id` gets the smaller conversational bucket. Without
it, only the much more generous forwarded-IP and global pools apply, avoiding a
small shared bucket for cloud clients. Caddy is the only public ingress, so the
MCP container explicitly trusts its forwarding header. Rate-limit state is
ephemeral and no request bodies, search terms, CV data, or IP-address access log
is retained. Temporary limits return HTTP 429 or 503 with `Retry-After`.

The environment variables in `deploy/compose.yml` tune these defaults. Set
`MCP_FAIR_USE_ENABLED=false` only for isolated local debugging.

## Update and rollback

```bash
git pull --ff-only
cd deploy
docker compose up -d --build
docker compose ps
```

To roll back, check out a known good commit and run the same Compose command.
Caddy certificate data persists in the named `caddy_data` volume.
