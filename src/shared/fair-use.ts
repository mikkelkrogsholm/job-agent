const FIVE_MINUTES_SECONDS = 300;

export interface FairUseOptions {
  enabled: boolean;
  clientUnitsPerFiveMinutes: number;
  clientBurstUnits: number;
  ipUnitsPerFiveMinutes: number;
  ipBurstUnits: number;
  globalUnitsPerFiveMinutes: number;
  globalBurstUnits: number;
  maxConcurrentRequests: number;
  maxRequestBytes: number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

interface LimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface FairUsePermit {
  response?: Response;
  release(): void;
}

export class FairUseGuard {
  private readonly clientLimiter: TokenBucketLimiter;
  private readonly ipLimiter: TokenBucketLimiter;
  private readonly globalLimiter: TokenBucketLimiter;
  private activeRequests = 0;

  constructor(
    private readonly options = fairUseOptionsFromEnv(),
    private readonly now: () => number = Date.now,
  ) {
    this.clientLimiter = limiter(options.clientBurstUnits, options.clientUnitsPerFiveMinutes);
    this.ipLimiter = limiter(options.ipBurstUnits, options.ipUnitsPerFiveMinutes);
    this.globalLimiter = limiter(options.globalBurstUnits, options.globalUnitsPerFiveMinutes);
  }

  async permit(request: Request, remoteAddress: string | null): Promise<FairUsePermit> {
    if (!this.options.enabled || request.method !== "POST") return NOOP_PERMIT;

    const contentLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
    if (Number.isFinite(contentLength) && contentLength > this.options.maxRequestBytes) {
      return denied(413, 0, "Requesten er for stor.", "request-size");
    }

    if (this.activeRequests >= this.options.maxConcurrentRequests) {
      return denied(503, 1, "Serveren er optaget. Prøv igen om et øjeblik.", "concurrency");
    }

    this.activeRequests++;
    let cost: number;
    try {
      cost = await requestWorkUnits(request, this.options.maxRequestBytes);
    } catch (error) {
      this.activeRequests--;
      if (error instanceof RequestTooLargeError) {
        return denied(413, 0, "Requesten er for stor.", "request-size");
      }
      throw error;
    }
    const now = this.now();
    const ipKey = clientAddress(request, remoteAddress);
    const sessionId = normalizedHeader(request.headers.get("mcp-session-id"));
    const decisions: Array<[string, LimitDecision]> = [
      ...(sessionId
        ? [["client", this.clientLimiter.consume(`session:${sessionId}`, cost, now)] as [string, LimitDecision]]
        : []),
      ["ip", this.ipLimiter.consume(ipKey, cost, now)],
      ["global", this.globalLimiter.consume("global", cost, now)],
    ];
    const rejection = decisions.find(([, decision]) => !decision.allowed);
    if (rejection) {
      this.activeRequests--;
      return denied(
        429,
        rejection[1].retryAfterSeconds,
        "Fair-use-grænsen er midlertidigt nået. Prøv igen om lidt.",
        rejection[0],
      );
    }

    let released = false;
    return {
      release: () => {
        if (released) return;
        released = true;
        this.activeRequests--;
      },
    };
  }
}

export function clientAddress(
  request: Request,
  remoteAddress: string | null,
  trustProxy = Bun.env.MCP_TRUST_PROXY === "true",
): string {
  if (trustProxy) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",", 1)[0];
    if (forwarded) return normalizedIp(forwarded);
  }
  return normalizedIp(remoteAddress);
}

export function fairUseOptionsFromEnv(env: Record<string, string | undefined> = Bun.env): FairUseOptions {
  return {
    enabled: env.MCP_FAIR_USE_ENABLED !== "false",
    clientUnitsPerFiveMinutes: positiveNumber(env.MCP_CLIENT_UNITS_PER_5_MIN, 30),
    clientBurstUnits: positiveNumber(env.MCP_CLIENT_BURST_UNITS, 12),
    ipUnitsPerFiveMinutes: positiveNumber(env.MCP_IP_UNITS_PER_5_MIN, 300),
    ipBurstUnits: positiveNumber(env.MCP_IP_BURST_UNITS, 120),
    globalUnitsPerFiveMinutes: positiveNumber(env.MCP_GLOBAL_UNITS_PER_5_MIN, 1_500),
    globalBurstUnits: positiveNumber(env.MCP_GLOBAL_BURST_UNITS, 300),
    maxConcurrentRequests: positiveInteger(env.MCP_MAX_CONCURRENT_REQUESTS, 8),
    maxRequestBytes: positiveInteger(env.MCP_MAX_REQUEST_BYTES, 131_072),
  };
}

export async function requestWorkUnits(request: Request, maxBytes = Number.POSITIVE_INFINITY): Promise<number> {
  try {
    const body: unknown = await boundedJson(request, maxBytes);
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api/webmcp/v1/jobs/search" && isRecord(body)) {
      const providers = Array.isArray(body.providers) ? body.providers.length : 4;
      return Math.max(1, Math.min(4, providers));
    }
    if (pathname === "/api/webmcp/v1/jobs/details") return 1;
    const messages = Array.isArray(body) ? body : [body];
    return Math.max(0.25, messages.reduce((sum, message) => sum + messageWorkUnits(message), 0));
  } catch (error) {
    if (error instanceof RequestTooLargeError) throw error;
    return 0.25;
  }
}

class RequestTooLargeError extends Error {}

async function boundedJson(request: Request, maxBytes: number): Promise<unknown> {
  const reader = request.clone().body?.getReader();
  if (!reader) return undefined;
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RequestTooLargeError();
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

class TokenBucketLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly capacity: number,
    private readonly refillPerMillisecond: number,
    private readonly maxKeys = 20_000,
  ) {}

  consume(key: string, cost: number, now: number): LimitDecision {
    const previous = this.buckets.get(key);
    const tokens = previous
      ? Math.min(this.capacity, previous.tokens + Math.max(0, now - previous.updatedAt) * this.refillPerMillisecond)
      : this.capacity;
    if (tokens < cost) {
      this.touch(key, { tokens, updatedAt: now });
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((cost - tokens) / this.refillPerMillisecond / 1_000)),
      };
    }
    this.touch(key, { tokens: tokens - cost, updatedAt: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  private touch(key: string, bucket: Bucket): void {
    this.buckets.delete(key);
    this.buckets.set(key, bucket);
    if (this.buckets.size > this.maxKeys) {
      const oldestKey = this.buckets.keys().next().value;
      if (oldestKey !== undefined) this.buckets.delete(oldestKey);
    }
  }
}

function limiter(burst: number, unitsPerFiveMinutes: number): TokenBucketLimiter {
  return new TokenBucketLimiter(burst, unitsPerFiveMinutes / FIVE_MINUTES_SECONDS / 1_000);
}

function messageWorkUnits(value: unknown): number {
  if (!isRecord(value) || value.method !== "tools/call") return 0.25;
  const params = isRecord(value.params) ? value.params : {};
  const name = typeof params.name === "string" ? params.name : "";
  if (name === "search_danish_jobs") {
    const args = isRecord(params.arguments) ? params.arguments : {};
    const providers = Array.isArray(args.providers) ? args.providers.length : 4;
    return Math.max(1, Math.min(4, providers));
  }
  return 1;
}

function denied(status: number, retryAfter: number, message: string, scope: string): FairUsePermit {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-rate-limit-scope": scope,
  });
  if (retryAfter > 0) headers.set("retry-after", String(retryAfter));
  return {
    response: new Response(JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32_000, message },
      id: null,
    }), { status, headers }),
    release() {},
  };
}

function normalizedIp(value: string | null): string {
  const normalized = value?.trim().slice(0, 64);
  return normalized || "unknown-ip";
}

function normalizedHeader(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.replace(/[^\x20-\x7E]/g, "").trim().slice(0, 160);
  return normalized || null;
}

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  return Math.max(1, Math.floor(positiveNumber(value, fallback)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const NOOP_PERMIT: FairUsePermit = { release() {} };
