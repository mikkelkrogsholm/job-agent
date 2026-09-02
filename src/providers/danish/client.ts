import { JobnetClient, JobnetError } from "../../jobnet-client.ts";
import { normalizeJobDetails, normalizeSearchJob } from "../../normalize.ts";
import { JobbankClient } from "../jobbank/client.ts";
import { JobindexClient } from "../jobindex/client.ts";
import { JobdanmarkClient } from "../jobdanmark/client.ts";
import { assertProviderDetailUrl } from "../../shared/provider-urls.ts";
import type { DanishProvider, SearchDanishJobsInput } from "./schemas.ts";
import { decodeHtmlEntities } from "../../shared/content.ts";

export interface DanishJob {
  provider: DanishProvider;
  providerJobId: string;
  title: string;
  company: string | null;
  location: string | null;
  postedDate: string | null;
  deadline: string | null;
  canonicalUrl: string;
  alsoFoundOn: DanishProvider[];
}

export interface DanishJobsDependencies {
  jobnet: JobnetClient;
  jobbank: JobbankClient;
  jobindex: JobindexClient;
  jobdanmark: JobdanmarkClient;
}

export class DanishJobsClient {
  private readonly providers: DanishJobsDependencies;

  constructor(dependencies: Partial<DanishJobsDependencies> = {}) {
    this.providers = {
      jobnet: dependencies.jobnet ?? new JobnetClient({
        ...(Bun.env.JOBNET_BASE_URL ? { baseUrl: Bun.env.JOBNET_BASE_URL } : {}),
        timeoutMs: positiveInteger(Bun.env.JOBNET_TIMEOUT_MS, 15_000),
      }),
      jobbank: dependencies.jobbank ?? new JobbankClient({
        ...(Bun.env.JOBBANK_BASE_URL ? { baseUrl: Bun.env.JOBBANK_BASE_URL } : {}),
        timeoutMs: positiveInteger(Bun.env.JOBBANK_TIMEOUT_MS, 15_000),
      }),
      jobindex: dependencies.jobindex ?? new JobindexClient({
        ...(Bun.env.JOBINDEX_BASE_URL ? { baseUrl: Bun.env.JOBINDEX_BASE_URL } : {}),
        timeoutMs: positiveInteger(Bun.env.JOBINDEX_TIMEOUT_MS, 15_000),
      }),
      jobdanmark: dependencies.jobdanmark ?? new JobdanmarkClient({
        ...(Bun.env.JOBDANMARK_BASE_URL ? { baseUrl: Bun.env.JOBDANMARK_BASE_URL } : {}),
        timeoutMs: positiveInteger(Bun.env.JOBDANMARK_TIMEOUT_MS, 15_000),
      }),
    };
  }

  async search(input: SearchDanishJobsInput, signal?: AbortSignal) {
    const intent = resolveSearchIntent(input);
    const settled = await Promise.allSettled(
      input.providers.map(async (provider) => ({
        provider,
        jobs: await this.searchProvider(provider, intent, input.limitPerProvider, signal),
      })),
    );
    const jobs: DanishJob[] = [];
    const failures: Array<{ provider: DanishProvider; error: string }> = [];

    settled.forEach((result, index) => {
      const provider = input.providers[index]!;
      if (result.status === "fulfilled") jobs.push(...result.value.jobs);
      else failures.push({ provider, error: errorMessage(result.reason) });
    });

    if (failures.length === input.providers.length) {
      throw new Error(`All selected providers failed: ${failures.map(({ provider, error }) => `${provider}: ${error}`).join("; ")}`);
    }

    const uniqueJobs = rankJobs(deduplicateJobs(jobs), intent);
    return {
      jobs: uniqueJobs,
      intent,
      providerStrategies: Object.fromEntries(input.providers.map((provider) => [provider, providerStrategy(provider, intent)])),
      rawCount: jobs.length,
      uniqueCount: uniqueJobs.length,
      searchedProviders: input.providers,
      successfulProviders: input.providers.filter((provider) => !failures.some((failure) => failure.provider === provider)),
      failures,
    };
  }

  async getDetails(provider: DanishProvider, canonicalUrl: string, maximum: number, signal?: AbortSignal) {
    assertProviderDetailUrl(provider, canonicalUrl);
    if (provider === "jobbank") return this.providers.jobbank.getDetails(canonicalUrl, maximum, signal);
    if (provider === "jobindex") return this.providers.jobindex.getDetails(canonicalUrl, maximum, signal);
    if (provider === "jobdanmark") return this.providers.jobdanmark.getDetails(canonicalUrl, maximum, signal);

    const jobId = new URL(canonicalUrl).pathname.split("/").filter(Boolean).at(-1);
    if (!jobId) throw new Error("Jobnet canonicalUrl contained no job ID");
    try {
      return normalizeJobDetails(await this.providers.jobnet.getJob(jobId, signal), maximum);
    } catch (error) {
      if (!(error instanceof JobnetError) || error.status !== 404) throw error;
      const fallback = await this.providers.jobnet.findJobById(jobId, signal);
      if (!fallback) throw error;
      return { ...normalizeSearchJob(fallback, true), detailsLimited: true };
    }
  }

  private async searchProvider(provider: DanishProvider, intent: SearchIntent, limit: number, signal?: AbortSignal): Promise<DanishJob[]> {
    const query = intent.occupation;
    if (provider === "jobnet") {
      const response = await this.providers.jobnet.search({ searchString: query, resultsPerPage: limit, pageNumber: 1, orderType: "BestMatch", ...(intent.postalCode ? { postalCode: intent.postalCode } : {}), kmRadius: intent.radiusKm }, signal);
      return response.jobAds.map((job) => ({
        provider, providerJobId: job.jobAdId, title: cleanValue(job.title)!, company: cleanValue(job.hiringOrgName),
        location: cleanValue([job.postalCode, job.postalDistrictName].filter(Boolean).join(" ") || job.municipality),
        postedDate: normalizeDate(job.publicationDate), deadline: normalizeDate(job.applicationDeadline),
        canonicalUrl: `https://jobnet.dk/find-job/${job.jobAdId}`, alsoFoundOn: [],
      }));
    }
    if (provider === "jobbank") {
      const response = await this.providers.jobbank.search({ keywords: query, ...(jobbankLocationId(intent.location) ? { locationIds: [jobbankLocationId(intent.location)!] } : {}), page: 1, limit }, signal);
      return response.jobs.map((job) => ({ provider, providerJobId: job.id, title: cleanValue(job.title)!, company: cleanValue(job.employer),
        location: null, postedDate: normalizeDate(job.publicationDate), deadline: normalizeDate(job.applicationDeadline),
        canonicalUrl: job.canonicalUrl, alsoFoundOn: [] }));
    }
    if (provider === "jobindex") {
      const response = await this.providers.jobindex.search({ query, exactPhrase: false, ...(jobindexArea(intent.location) ? { area: jobindexArea(intent.location)! } : {}), page: 1, limit }, signal);
      return response.jobs.map((job) => ({ provider, providerJobId: job.id, title: cleanValue(job.title)!, company: cleanValue(job.employer),
        location: cleanValue(job.location), postedDate: normalizeDate(job.publicationDate), deadline: null,
        canonicalUrl: job.canonicalUrl, alsoFoundOn: [] }));
    }
    const response = await this.providers.jobdanmark.search({ query, ...(intent.location ? { locations: [{ query: intent.location }] } : {}), page: 1, limit }, signal);
    return response.jobs.map((job) => ({ provider, providerJobId: job.id, title: cleanValue(job.title)!, company: cleanValue(job.employer),
      location: cleanValue(job.location), postedDate: normalizeDate(job.publicationDate), deadline: normalizeDate(job.applicationDeadline),
      canonicalUrl: job.canonicalUrl, alsoFoundOn: [] }));
  }
}

export function deduplicateJobs(jobs: DanishJob[]): DanishJob[] {
  const unique: DanishJob[] = [];
  for (const job of jobs) {
    const existing = unique.find((candidate) => sameJob(candidate, job));
    if (!existing) {
      unique.push({ ...job, alsoFoundOn: [...job.alsoFoundOn] });
      continue;
    }
    if (existing.provider !== job.provider && !existing.alsoFoundOn.includes(job.provider)) existing.alsoFoundOn.push(job.provider);
    existing.deadline ??= job.deadline;
    existing.postedDate ??= job.postedDate;
    existing.location ??= job.location;
  }
  return unique.sort((left, right) => (right.postedDate ?? "").localeCompare(left.postedDate ?? ""));
}

function sameJob(left: DanishJob, right: DanishJob): boolean {
  if (left.canonicalUrl === right.canonicalUrl) return true;
  if (left.provider === right.provider) return false;
  const leftTitle = normalizeKeyPart(left.title);
  const rightTitle = normalizeKeyPart(right.title);
  const leftCompany = normalizeKeyPart(left.company);
  const rightCompany = normalizeKeyPart(right.company);
  const leftLocation = normalizeKeyPart(left.location);
  const rightLocation = normalizeKeyPart(right.location);
  const sameCore = Boolean(leftTitle && rightTitle && leftCompany && rightCompany)
    && leftTitle === rightTitle
    && leftCompany === rightCompany;
  if (!sameCore) return false;
  if (leftLocation && rightLocation && locationsCompatible(leftLocation, rightLocation)) return true;
  return Boolean(left.deadline && right.deadline && left.deadline === right.deadline);
}

function normalizeKeyPart(value: string | null): string {
  return decodeHtmlEntities(value ?? "").toLocaleLowerCase("da-DK")
    .replaceAll("æ", "ae").replaceAll("ø", "o").replaceAll("å", "a")
    .normalize("NFKD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, " ").trim();
}

type SearchIntent = { occupation: string; location: string | null; postalCode: number | null; radiusKm: number; interpretation: "structured" | "parsed_query" | "query_only" };

export function resolveSearchIntent(input: SearchDanishJobsInput): SearchIntent {
  if (input.occupation || input.location || input.postalCode) return {
    occupation: input.occupation ?? input.query,
    location: input.location ?? null,
    postalCode: input.postalCode ?? postalCodeFor(input.location),
    radiusKm: input.radiusKm,
    interpretation: "structured",
  };
  const match = input.query.match(/^(.+?)\s+i\s+([^,]+)$/iu);
  if (!match) return { occupation: input.query, location: null, postalCode: null, radiusKm: input.radiusKm, interpretation: "query_only" };
  const location = match[2]!.trim();
  return { occupation: match[1]!.trim(), location, postalCode: postalCodeFor(location), radiusKm: input.radiusKm, interpretation: "parsed_query" };
}

function locationsCompatible(left: string, right: string): boolean {
  const a = normalizeKeyPart(left).replace(/^\d{4}\s+/, "");
  const b = normalizeKeyPart(right).replace(/^\d{4}\s+/, "");
  return Boolean(a && b) && (a === b || a.includes(b) || b.includes(a));
}

function rankJobs(jobs: DanishJob[], intent: SearchIntent): DanishJob[] {
  const occupationTokens = normalizeKeyPart(intent.occupation).split(" ").filter((token) => token.length >= 3);
  const location = normalizeKeyPart(intent.location);
  const score = (job: DanishJob) => {
    const title = normalizeKeyPart(job.title);
    const place = normalizeKeyPart(job.location);
    const occupationMatch = occupationTokens.some((token) => title.includes(token)) ? 4 : 0;
    const locationMatch = location && place && (place.includes(location) || location.includes(place)) ? 2 : 0;
    return occupationMatch + locationMatch;
  };
  return jobs.sort((left, right) => score(right) - score(left) || (right.postedDate ?? "").localeCompare(left.postedDate ?? ""));
}

function cleanValue(value: string | null | undefined): string | null {
  const cleaned = decodeHtmlEntities(value ?? "").replace(/\s+/g, " ").trim();
  return cleaned || null;
}

const locationKey = (value: string | null | undefined) => normalizeKeyPart(value ?? "");
function postalCodeFor(location: string | null | undefined): number | null {
  return ({ aarhus: 8000, odense: 5000, aalborg: 9000, kobenhavn: 1050 } as Record<string, number>)[locationKey(location)] ?? null;
}
function jobindexArea(location: string | null): "storkoebenhavn" | "fyn" | "nordjylland" | "midtjylland" | undefined {
  return ({ aarhus: "midtjylland", odense: "fyn", aalborg: "nordjylland", kobenhavn: "storkoebenhavn" } as const)[locationKey(location) as "aarhus" | "odense" | "aalborg" | "kobenhavn"];
}
function jobbankLocationId(location: string | null): number | undefined {
  return ({ aarhus: 8, odense: 13, aalborg: 6, kobenhavn: 2 } as Record<string, number>)[locationKey(location)];
}

function providerStrategy(provider: DanishProvider, intent: SearchIntent) {
  if (!intent.location && !intent.postalCode) return { occupation: "provider_native", location: "not_requested" } as const;
  if (provider === "jobdanmark") return { occupation: "provider_native", location: "provider_native_exact_resolution" } as const;
  if (provider === "jobnet") return { occupation: "provider_native", location: intent.postalCode ? "provider_native_postal_radius" : "not_applied_requires_postal_code" } as const;
  if (provider === "jobindex") return { occupation: "provider_native_plus_fail_closed_term_check", location: jobindexArea(intent.location) ? "provider_native_area" : "not_applied_unsupported_area" } as const;
  return { occupation: "provider_native", location: jobbankLocationId(intent.location) ? "provider_native_area" : "not_applied_unsupported_area" } as const;
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value || /løbende|lobende|asap/i.test(value)) return null;
  const danish = value.match(/^(\d{2})[.-](\d{2})[.-](\d{4})$/);
  if (danish) return `${danish[3]}-${danish[2]}-${danish[1]}`;
  const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1]!;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString().slice(0, 10);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
