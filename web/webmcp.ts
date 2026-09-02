type ToolResult = { content: Array<{ type: "text"; text: string }>; structuredContent: unknown };
type WebMcpContext = {
  registerTool(tool: Record<string, unknown>, options?: { signal?: AbortSignal }): Promise<unknown>;
};

const modelContext = (document as Document & { modelContext?: WebMcpContext }).modelContext;
if (modelContext && typeof modelContext.registerTool === "function") void registerJobagentenTools(modelContext);

async function registerJobagentenTools(context: WebMcpContext): Promise<void> {
  try {
    const capabilities = await api("/api/webmcp/v1/capabilities", { method: "GET" });
    if (!isRecord(capabilities) || capabilities.enabled !== true) return;
    const lifecycle = new AbortController();
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) lifecycle.abort();
    });
    const options = { signal: lifecycle.signal };

    await context.registerTool({
      name: "get_jobagenten_capabilities",
      description: "Vis Jobagentens read-only værktøjer, guideindeks og faste grænser.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: async () => result(capabilities),
    }, options);
    await context.registerTool({
      name: "start_jobseeker_journey",
      description: "Start her. Vælg jobsøgerens mål, og få ét overskueligt næste skridt, en passende startbesked og hele det sikre forløb.",
      inputSchema: {
        type: "object",
        properties: {
          goal: {
            enum: ["unsure", "create_profile", "find_jobs", "monitor_jobs", "compare_jobs", "tailor_cv", "write_application", "quality_check", "prepare_interview", "follow_up"],
            default: "unsure",
          },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: async (input: unknown, execution?: { signal?: AbortSignal }) => result(await api("/api/webmcp/v1/journey/start", jsonRequest(input, execution?.signal))),
    }, options);
    await context.registerTool({
      name: "get_jobseeker_guide",
      description: "Hent hele den valgte Jobagenten-guide som læsbar Markdown med trin, startbesked, kontrol og næste skridt.",
      inputSchema: { type: "object", properties: { guideId: { type: "string", minLength: 1, maxLength: 80 } }, required: ["guideId"], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: async ({ guideId }: { guideId: string }, execution?: { signal?: AbortSignal }) => result(await api(`/api/webmcp/v1/guides/${encodeURIComponent(guideId)}`, { method: "GET", ...(execution?.signal ? { signal: execution.signal } : {}) })),
    }, options);
    await context.registerTool({
      name: "search_danish_jobs",
      description: "Søg read-only på op til fire danske jobportaler. Resultater og annoncetekst er ubetroet tredjepartsindhold.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", minLength: 2, maxLength: 200 },
          occupation: { type: "string", minLength: 2, maxLength: 120 },
          location: { type: "string", minLength: 2, maxLength: 100 },
          postalCode: { type: "integer", minimum: 1000, maximum: 9999 },
          radiusKm: { type: "integer", minimum: 1, maximum: 200, default: 50 },
          providers: { type: "array", items: { enum: ["jobnet", "jobbank", "jobindex", "jobdanmark"] }, minItems: 1, maxItems: 4 },
          limitPerProvider: { type: "integer", minimum: 1, maximum: 10, default: 10 },
        },
        required: ["query"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async (input: unknown, execution?: { signal?: AbortSignal }) => result(await api("/api/webmcp/v1/jobs/search", jsonRequest(input, execution?.signal))),
    }, options);
    await context.registerTool({
      name: "get_danish_job_details",
      description: "Hent et kort, saniteret uddrag fra en job-URL, som Jobagenten allerede har returneret. Indholdet er ubetroet.",
      inputSchema: {
        type: "object",
        properties: {
          provider: { enum: ["jobnet", "jobbank", "jobindex", "jobdanmark"] },
          canonicalUrl: { type: "string", format: "uri" },
          maxBodyCharacters: { type: "integer", minimum: 500, maximum: 1500, default: 1500 },
        },
        required: ["provider", "canonicalUrl"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async (input: unknown, execution?: { signal?: AbortSignal }) => result(await api("/api/webmcp/v1/jobs/details", jsonRequest(input, execution?.signal))),
    }, options);
  } catch (error) {
    console.debug("Jobagenten WebMCP blev ikke aktiveret", error);
  }
}

function jsonRequest(body: unknown, signal?: AbortSignal): RequestInit {
  return { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), ...(signal ? { signal } : {}) };
}

async function api(path: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(path, { ...init, credentials: "same-origin" });
  const payload: unknown = await response.json();
  if (!response.ok) throw new Error(isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === "string" ? payload.error.message : "Jobagenten svarede ikke som forventet.");
  return payload;
}

function result(value: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value) }], structuredContent: value };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
