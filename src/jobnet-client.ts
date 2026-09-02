import type { FacetSearchInput, SearchJobsInput } from "./schemas.ts";

export const DEFAULT_JOBNET_BASE_URL = "https://jobnet.dk/bff";

export interface JobnetClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

export interface RawSearchResponse {
  jobAds: RawJobAd[];
  searchFacets: Record<string, unknown[]>;
  searchString: string;
  totalJobAdCount: number;
}

export interface RawJobAd {
  jobAdId: string;
  jobAdUrl?: string;
  title: string;
  description?: string;
  hiringOrgName?: string;
  country?: string;
  municipality?: string;
  postalCode?: number;
  postalDistrictName?: string;
  workPlaceAddress?: string;
  occupation?: string;
  conceptUriDa?: string;
  jobAnnouncementTypeName?: string;
  workHourPartTime?: boolean;
  applicationDeadline?: string;
  applicationDeadlineStatus?: string;
  publicationDate?: string;
  isExternal?: boolean;
}

export interface RawJobDetails {
  id: string;
  title: string;
  body?: string;
  publicationDateTime?: string;
  unpublicationDateTime?: string;
  approvalStatus?: string;
  updatedDateTime?: string;
  isAnonymousEmployer?: boolean;
  job?: Record<string, unknown>;
  application?: Record<string, unknown>;
  employer?: Record<string, unknown>;
}

export interface OccupationNode {
  name: string;
  identifier: string;
  hierarchyLevel: "OccupationArea" | "OccupationGroup" | "Occupation" | string;
  parentIdentifier: string;
  aliases?: Array<{ aliasIdentifier: string; label: string }>;
}

export class JobnetError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "JobnetError";
  }
}

export class JobnetClient {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  private readonly fetchImplementation: typeof globalThis.fetch;

  constructor(options: JobnetClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_JOBNET_BASE_URL).replace(
      /\/$/,
      "",
    );
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.fetchImplementation = options.fetch ?? globalThis.fetch;
  }

  search(
    input: SearchJobsInput | FacetSearchInput,
    signal?: AbortSignal,
  ): Promise<RawSearchResponse> {
    const query = buildSearchQuery(input);
    return this.getJson<RawSearchResponse>("/FindJob/Search", query, signal);
  }

  getJob(jobId: string, signal?: AbortSignal): Promise<RawJobDetails> {
    return this.getJson<RawJobDetails>(
      `/FindJob/JobAdDetails/${encodeURIComponent(jobId)}`,
      undefined,
      signal,
    );
  }

  async findJobById(
    jobId: string,
    signal?: AbortSignal,
  ): Promise<RawJobAd | undefined> {
    const response = await this.search(
      {
        searchString: jobId,
        resultsPerPage: 10,
        pageNumber: 1,
        orderType: "BestMatch",
        kmRadius: 50,
      },
      signal,
    );
    return response.jobAds.find((job) => job.jobAdId === jobId);
  }

  listOccupations(
    parentIdentifier = "",
    signal?: AbortSignal,
  ): Promise<OccupationNode[]> {
    return this.getJson<OccupationNode[]>(
      `/OccupationSearch/GetChildOccupations/${encodeURIComponent(parentIdentifier)}`,
      undefined,
      signal,
    );
  }

  suggestTerms(query: string, signal?: AbortSignal): Promise<string[]> {
    return this.getJson<string[]>(
      "/FindJob/GetTypeaheadSuggestions",
      new URLSearchParams({ query }),
      signal,
    );
  }

  private async getJson<T>(
    endpoint: string,
    query?: URLSearchParams,
    externalSignal?: AbortSignal,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (query) {
      url.search = query.toString();
    }

    const timeoutController = new AbortController();
    const timeout = setTimeout(
      () => timeoutController.abort("Jobnet request timed out"),
      this.timeoutMs,
    );
    const signal = combineSignals(externalSignal, timeoutController.signal);

    try {
      const response = await this.fetchImplementation(url, {
        headers: {
          accept: "application/json",
          "user-agent": "jobnet-mcp/1.0 (+https://jobnet.dk)",
          "x-csrf": "1",
        },
        signal,
      });

      if (!response.ok) {
        const responseText = (await response.text()).slice(0, 500);
        throw new JobnetError(
          `Jobnet returned ${response.status} ${response.statusText}${responseText ? `: ${responseText}` : ""}`,
          response.status,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof JobnetError) {
        throw error;
      }
      if (signal.aborted) {
        throw new JobnetError("The Jobnet request was cancelled or timed out");
      }
      throw new JobnetError(
        `Could not reach Jobnet: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function buildSearchQuery(
  input: SearchJobsInput | FacetSearchInput,
): URLSearchParams {
  const query = new URLSearchParams();
  const ignoredKeys = new Set(["facetTypes", "limitPerFacet"]);

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || ignoredKeys.has(key)) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, String(item));
      }
      continue;
    }

    query.set(key, String(value));
  }

  if (!query.has("searchString")) query.set("searchString", "");
  if (!query.has("resultsPerPage")) query.set("resultsPerPage", "10");
  if (!query.has("pageNumber")) query.set("pageNumber", "1");
  if (!query.has("orderType")) query.set("orderType", "BestMatch");
  if (!query.has("kmRadius")) query.set("kmRadius", "50");

  return query;
}

function combineSignals(
  first: AbortSignal | undefined,
  second: AbortSignal,
): AbortSignal {
  if (!first) return second;
  if (first.aborted) return first;
  if (second.aborted) return second;
  return AbortSignal.any([first, second]);
}
