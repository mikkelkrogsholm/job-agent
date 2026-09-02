export interface ProviderHttpOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  cacheTtlMs?: number;
  now?: () => number;
}

export class ProviderHttpError extends Error {
  constructor(
    readonly provider: string,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderHttpError";
  }
}

export class ProviderHttpClient {
  private static readonly maximumCacheEntries = 256;
  readonly baseUrl: string;
  private readonly fetchImplementation: typeof globalThis.fetch;
  private readonly timeoutMs: number;
  private readonly cacheTtlMs: number;
  private readonly now: () => number;
  private readonly cache = new Map<
    string,
    { expiresAt: number; value: Uint8Array }
  >();

  constructor(
    readonly provider: string,
    options: ProviderHttpOptions,
  ) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.fetchImplementation = options.fetch ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.cacheTtlMs = options.cacheTtlMs ?? 5 * 60 * 1000;
    this.now = options.now ?? Date.now;
  }

  async bytes(
    pathOrUrl: string,
    init: RequestInit = {},
    externalSignal?: AbortSignal,
  ): Promise<Uint8Array> {
    const url = pathOrUrl.startsWith("http")
      ? new URL(pathOrUrl)
      : new URL(`${this.baseUrl}${pathOrUrl}`);
    const method = init.method?.toUpperCase() ?? "GET";
    const cacheKey = `${method} ${url} ${typeof init.body === "string" ? init.body : ""}`;
    const now = this.now();
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt <= now) this.cache.delete(key);
    }
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.value;

    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort(), this.timeoutMs);
    const signal = externalSignal
      ? AbortSignal.any([externalSignal, timeoutController.signal])
      : timeoutController.signal;

    try {
      const headers = new Headers(init.headers);
      if (!headers.has("accept")) headers.set("accept", "*/*");
      if (!headers.has("user-agent")) {
        headers.set("user-agent", "job-mcp/2.0 (read-only Danish job search)");
      }
      const response = await this.fetchImplementation(url, {
        ...init,
        headers,
        signal,
      });
      if (!response.ok) {
        const body = (await response.text()).slice(0, 500);
        throw new ProviderHttpError(
          this.provider,
          `${this.provider} returned ${response.status} ${response.statusText}${body ? `: ${body}` : ""}`,
          response.status,
        );
      }
      const value = new Uint8Array(await response.arrayBuffer());
      if (this.cache.size >= ProviderHttpClient.maximumCacheEntries) {
        this.cache.delete(this.cache.keys().next().value!);
      }
      this.cache.set(cacheKey, {
        expiresAt: now + this.cacheTtlMs,
        value,
      });
      return value;
    } catch (error) {
      if (error instanceof ProviderHttpError) throw error;
      if (signal.aborted) {
        throw new ProviderHttpError(
          this.provider,
          `${this.provider} request was cancelled or timed out`,
        );
      }
      throw new ProviderHttpError(
        this.provider,
        `Could not reach ${this.provider}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async text(
    pathOrUrl: string,
    init?: RequestInit,
    signal?: AbortSignal,
  ): Promise<string> {
    return new TextDecoder().decode(await this.bytes(pathOrUrl, init, signal));
  }

  async json<T>(
    pathOrUrl: string,
    init?: RequestInit,
    signal?: AbortSignal,
  ): Promise<T> {
    const text = await this.text(pathOrUrl, init, signal);
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ProviderHttpError(
        this.provider,
        `${this.provider} returned invalid JSON`,
      );
    }
  }
}
