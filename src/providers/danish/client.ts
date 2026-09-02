import { JobnetClient, JobnetError } from "../../jobnet-client.ts";
import { normalizeJobDetails, normalizeSearchJob } from "../../normalize.ts";
import { JobbankClient } from "../jobbank/client.ts";
import { JobindexClient } from "../jobindex/client.ts";
import { JobdanmarkClient } from "../jobdanmark/client.ts";
import { assertProviderDetailUrl } from "../../shared/provider-urls.ts";
import type { DanishProvider, SearchDanishJobsInput } from "./schemas.ts";

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
    const settled = await Promise.allSettled(
      input.providers.map(async (provider) => ({
        provider,
        jobs: await this.searchProvider(provider, input.query, input.limitPerProvider, signal),
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

    return {
      jobs: deduplicateJobs(jobs),
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

  private async searchProvider(provider: DanishProvider, query: string, limit: number, signal?: AbortSignal): Promise<DanishJob[]> {
    if (provider === "jobnet") {
      const response = await this.providers.jobnet.search({ searchString: query, resultsPerPage: limit, pageNumber: 1, orderType: "PublicationDate", kmRadius: 50 }, signal);
      return response.jobAds.map((job) => ({
        provider, providerJobId: job.jobAdId, title: job.title, company: job.hiringOrgName ?? null,
        location: [job.postalCode, job.postalDistrictName].filter(Boolean).join(" ") || job.municipality || null,
        postedDate: normalizeDate(job.publicationDate), deadline: normalizeDate(job.applicationDeadline),
        canonicalUrl: `https://jobnet.dk/find-job/${job.jobAdId}`, alsoFoundOn: [],
      }));
    }
    if (provider === "jobbank") {
      const response = await this.providers.jobbank.search({ keywords: query, page: 1, limit }, signal);
      return response.jobs.map((job) => ({ provider, providerJobId: job.id, title: job.title, company: job.employer,
        location: null, postedDate: normalizeDate(job.publicationDate), deadline: normalizeDate(job.applicationDeadline),
        canonicalUrl: job.canonicalUrl, alsoFoundOn: [] }));
    }
    if (provider === "jobindex") {
      const response = await this.providers.jobindex.search({ query, exactPhrase: false, page: 1, limit }, signal);
      return response.jobs.map((job) => ({ provider, providerJobId: job.id, title: job.title, company: job.employer,
        location: job.location, postedDate: normalizeDate(job.publicationDate), deadline: null,
        canonicalUrl: job.canonicalUrl, alsoFoundOn: [] }));
    }
    const response = await this.providers.jobdanmark.search({ query, page: 1, limit }, signal);
    return response.jobs.map((job) => ({ provider, providerJobId: job.id, title: job.title, company: job.employer,
      location: job.location, postedDate: normalizeDate(job.publicationDate), deadline: normalizeDate(job.applicationDeadline),
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
  return Boolean(leftTitle && rightTitle && leftCompany && rightCompany && leftLocation && rightLocation)
    && leftTitle === rightTitle
    && leftCompany === rightCompany
    && leftLocation === rightLocation;
}

function normalizeKeyPart(value: string | null): string {
  return (value ?? "").toLocaleLowerCase("da-DK").normalize("NFKD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, " ").trim();
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
