import { ProviderHttpClient, type ProviderHttpOptions } from "../../shared/provider-http.ts";
import { htmlToPlainText, firstMatch, truncateText } from "../../shared/content.ts";
import { parseRss } from "../../shared/rss.ts";
import { isProviderDetailUrl } from "../../shared/provider-urls.ts";
import { ProviderHttpError } from "../../shared/provider-http.ts";
import type { SearchJobbankInput } from "./schemas.ts";

export class JobbankClient {
  private readonly http: ProviderHttpClient;

  constructor(options: Partial<ProviderHttpOptions> = {}) {
    this.http = new ProviderHttpClient("Jobbank", {
      baseUrl: options.baseUrl ?? "https://jobbank.dk",
      ...(options.fetch ? { fetch: options.fetch } : {}),
      ...(options.timeoutMs ? { timeoutMs: options.timeoutMs } : {}),
      cacheTtlMs: options.cacheTtlMs ?? 15 * 60 * 1000,
      ...(options.now ? { now: options.now } : {}),
    });
  }

  async search(input: SearchJobbankInput, signal?: AbortSignal) {
    const query = buildJobbankQuery(input);
    const bytes = await this.http.bytes(`/job/rss?${query}`, {}, signal);
    let channel;
    try {
      channel = parseRss(bytes);
    } catch {
      throw new ProviderHttpError("Jobbank", "Jobbank returned invalid RSS");
    }
    return {
      title: channel.title,
      searchUrl: `${this.http.baseUrl}/job/?${query}`,
      resultsUrl: `${this.http.baseUrl}/job/rss?${query}`,
      jobs: channel.items.slice(0, input.limit).map((item) => {
        if (!isProviderDetailUrl("jobbank", item.link)) {
          throw new ProviderHttpError("Jobbank", "Jobbank returned an invalid job URL");
        }
        return ({
        provider: "jobbank",
        id: firstMatch(item.link, /\/job\/(\d+)\//) ?? item.guid,
        title: item.title,
        employer: parseEmployer(item.description),
        summary: htmlToPlainText(item.description),
        publicationDate: item.publicationDate,
        applicationDeadline:
          firstMatch(item.description, /Ansøgningsfrist:\s*([^)]+)/i) ?? null,
        canonicalUrl: item.link,
        sourceAttribution: "Akademikernes Jobbank",
        });
      }),
    };
  }

  async getDetails(url: string, maximum: number, signal?: AbortSignal) {
    const html = await this.http.text(url, {}, signal);
    const body = truncateText(
      htmlToPlainText(firstMatch(html, /<div[^>]*class="[^"]*jobContent[^"]*"[^>]*itemprop="description"[^>]*>([\s\S]*?)<\/div>/i)),
      maximum,
    );
    const title = htmlToPlainText(firstMatch(html, /<h1[^>]*itemprop="title"[^>]*>([\s\S]*?)<\/h1>/i));
    if (!title || !body.text) throw new ProviderHttpError("Jobbank", "Jobbank returned invalid job details");
    return {
      provider: "jobbank",
      id: firstMatch(url, /\/job\/(\d+)\//) ?? url,
      title,
      employer: htmlToPlainText(firstMatch(html, /<h2[^>]*itemprop="hiringOrganization"[^>]*>([\s\S]*?)<\/h2>/i)),
      body: body.text,
      bodyTruncated: body.truncated,
      applicationDeadline: firstMatch(html, /itemprop="validThrough"[^>]*>([^<]+)/i) ?? null,
      locationAreas: firstMatch(html, /title="Geografiske områder:\s*([^"]+)"/i) ?? null,
      canonicalUrl: url,
      sourceAttribution: "Akademikernes Jobbank",
    };
  }
}

export function buildJobbankQuery(input: SearchJobbankInput): URLSearchParams {
  const query = new URLSearchParams();
  if (input.keywords) query.set("key", input.keywords);
  if (input.excludeKeywords) query.set("antikey", input.excludeKeywords);
  append(query, "cvtype", input.jobTypeIds);
  append(query, "udd", input.educationAreaIds);
  append(query, "amt", input.locationIds);
  append(query, "erf", input.workAreaIds);
  append(query, "branche", input.industryIds);
  append(query, "andet", input.suitabilityIds);
  if (input.company) query.set("virk", input.company);
  if (input.remoteWork) query.set("fjernarbejde", input.remoteWork);
  if (input.postedSince) query.set("oprettet", input.postedSince);
  if (input.page > 1) query.set("page", String(input.page));
  return query;
}

function append(query: URLSearchParams, key: string, values?: number[]): void {
  values?.forEach((value) => query.append(key, String(value)));
}

function parseEmployer(description: string): string | null {
  return firstMatch(htmlToPlainText(description), /\bhos\s+(.+?)(?:,|\s*\()/i) ?? null;
}
