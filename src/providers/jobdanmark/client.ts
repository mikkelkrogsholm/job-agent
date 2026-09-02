import { ProviderHttpClient, type ProviderHttpOptions } from "../../shared/provider-http.ts";
import { decodeHtmlEntities, firstMatch, htmlToPlainText, truncateText } from "../../shared/content.ts";
import type { JobdanmarkFilter, SearchJobdanmarkInput } from "./schemas.ts";

export interface JobdanmarkSettings {
  categories: Array<{ id: number; title: string; helpText?: string; count?: number }>;
  jobTitles: Array<{ id: number; businessGroupId?: number; name: string; slug: string }>;
  jobTypes: string[];
  periods?: Record<string, unknown>;
}

export interface JobdanmarkLocationGroup {
  title: string;
  items: Array<{ id: string; text: string; value: string; category: string; slug: string }>;
}

export interface JobdanmarkSearchResponse {
  currentPage: number;
  items: Array<{
    title: string; companyName: string; companyAddress?: string; jobTypes?: string[];
    publishedDate?: string; applicationDeadline?: string; url: string;
  }>;
  itemsPrPage: number;
  totalItems: number;
  totalPages: number;
}

export class JobdanmarkClient {
  private readonly http: ProviderHttpClient;

  constructor(options: Partial<ProviderHttpOptions> = {}) {
    this.http = new ProviderHttpClient("Jobdanmark", {
      baseUrl: options.baseUrl ?? "https://jobdanmark.dk",
      ...(options.fetch ? { fetch: options.fetch } : {}),
      ...(options.timeoutMs ? { timeoutMs: options.timeoutMs } : {}),
      cacheTtlMs: options.cacheTtlMs ?? 5 * 60 * 1000,
      ...(options.now ? { now: options.now } : {}),
    });
  }

  getSettings(signal?: AbortSignal): Promise<JobdanmarkSettings> {
    return this.http.json("/api/jobsearch/settings", {}, signal);
  }

  listLocations(query: string, signal?: AbortSignal): Promise<JobdanmarkLocationGroup[]> {
    return this.http.json(`/api/search/locations?q=${encodeURIComponent(query)}`, {}, signal);
  }

  async search(input: SearchJobdanmarkInput, signal?: AbortSignal) {
    const settings = await this.getSettings(signal);
    const filters: JobdanmarkFilter[] = [];
    if (input.query) filters.push({ type: "freetext", value: input.query, displayText: input.query });
    for (const id of input.categoryIds ?? []) {
      const category = settings.categories.find((candidate) => candidate.id === id);
      if (!category) throw new Error(`Unknown Jobdanmark category ID ${id}; call list_jobdanmark_filters`);
      filters.push({ type: "category", value: id, displayText: category.title });
    }
    for (const slug of input.jobTitleSlugs ?? []) {
      const title = settings.jobTitles.find((candidate) => candidate.slug === slug);
      if (!title) throw new Error(`Unknown Jobdanmark job-title slug ${slug}; call list_jobdanmark_filters with includeJobTitles=true`);
      filters.push({ type: "jobtitle", value: title.id, displayText: title.name, slug: title.slug });
    }
    for (const requested of input.locations ?? []) {
      const groups = await this.listLocations(requested.query, signal);
      const candidates = groups.flatMap((group) => group.items);
      const location = requested.type
        ? candidates.find((candidate) => candidate.category === requested.type)
        : candidates[0];
      if (!location) throw new Error(`Jobdanmark could not resolve location '${requested.query}'${requested.type ? ` as ${requested.type}` : ""}`);
      filters.push({ type: location.category, value: location.value, displayText: location.text, slug: location.slug });
    }

    const body = {
      locationMode: "Text",
      distance: 50,
      jobTypes: input.jobTypes ?? [],
      filters,
    };
    const response = await this.http.json<JobdanmarkSearchResponse>(
      `/api/jobsearch/search/${input.page}`,
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
      signal,
    );
    return {
      ...response,
      appliedFilters: filters,
      jobs: response.items.slice(0, input.limit).map((item) => ({
        provider: "jobdanmark",
        id: item.url.replace(/^\/job\//, ""),
        title: item.title,
        employer: item.companyName,
        location: item.companyAddress ?? null,
        employmentTypes: item.jobTypes ?? [],
        publicationDate: item.publishedDate ?? null,
        applicationDeadline: item.applicationDeadline ?? null,
        canonicalUrl: new URL(item.url, this.http.baseUrl).toString(),
        sourceAttribution: "Jobdanmark",
      })),
    };
  }

  async getDetails(url: string, maximum: number, signal?: AbortSignal) {
    const html = await this.http.text(url, {}, signal);
    const encodedJson = firstMatch(
      html,
      /<script[^>]*type="application\/ld(?:&#x2B;|\+)json"[^>]*>([\s\S]*?)<\/script>/i,
    );
    if (!encodedJson) throw new Error("Jobdanmark page contained no JobPosting structured data");
    const posting = JSON.parse(escapeJsonStringNewlines(encodedJson)) as Record<string, unknown>;
    const body = truncateText(htmlToPlainText(decodeHtmlEntities(String(posting.description ?? ""))), maximum);
    return {
      provider: "jobdanmark",
      id: new URL(url).pathname.replace(/^\/job\//, ""),
      title: decodeHtmlEntities(String(posting.title ?? "")),
      employer: nestedString(posting, "hiringOrganization", "name"),
      location: posting.jobLocation ?? null,
      employmentType: posting.employmentType ?? null,
      publicationDate: posting.datePosted ?? null,
      applicationDeadline: posting.validThrough ?? null,
      body: body.text,
      bodyTruncated: body.truncated,
      canonicalUrl: url,
      sourceAttribution: "Jobdanmark",
    };
  }
}

function escapeJsonStringNewlines(value: string): string {
  let result = "";
  let inString = false;
  let escaped = false;
  for (const character of value) {
    if (inString && (character === "\n" || character === "\r" || character === "\t")) {
      result += character === "\t" ? "\\t" : "\\n";
      escaped = false;
      continue;
    }
    result += character;
    if (escaped) escaped = false;
    else if (character === "\\" && inString) escaped = true;
    else if (character === '"') inString = !inString;
  }
  return result;
}

function nestedString(record: Record<string, unknown>, key: string, nestedKey: string): string | null {
  const nested = record[key];
  if (!nested || typeof nested !== "object") return null;
  const value = (nested as Record<string, unknown>)[nestedKey];
  return typeof value === "string" ? decodeHtmlEntities(value) : null;
}
