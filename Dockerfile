FROM oven/bun:1.4.0-alpine

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY src ./src
COPY web ./web

USER bun

ENV MCP_HOST=0.0.0.0
ENV MCP_PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD ["bun", "-e", "const p=Bun.env.MCP_PORT??'3000';const r=await fetch(`http://127.0.0.1:${p}/health`);if(!r.ok)process.exit(1)"]

CMD ["bun", "run", "src/http.ts"]
