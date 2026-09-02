import { ProviderHttpClient, type ProviderHttpOptions } from "../../shared/provider-http.ts";
import { decodeHtmlEntities, firstMatch, htmlToPlainText, truncateText } from "../../shared/content.ts";
import { parseRss } from "../../shared/rss.ts";
import { isProviderDetailUrl } from "../../shared/provider-urls.ts";
import { ProviderHttpError } from "../../shared/provider-http.ts";
import type { SearchJobindexInput } from "./schemas.ts";

export class JobindexClient {
  private readonly http: ProviderHttpClient;

  constructor(options: Partial<ProviderHttpOptions> = {}) {
    this.http = new ProviderHttpClient("Jobindex", {
      baseUrl: options.baseUrl ?? "https://www.jobindex.dk",
      ...(options.fetch ? { fetch: options.fetch } : {}),
      ...(options.timeoutMs ? { timeoutMs: options.timeoutMs } : {}),
      cacheTtlMs: options.cacheTtlMs ?? 15 * 60 * 1000,
      ...(options.now ? { now: options.now } : {}),
    });
  }

  async search(input: SearchJobindexInput, signal?: AbortSignal) {
    const searchPath = buildJobindexSearchPath(input);
    const pageHtml = await this.http.text(searchPath, {}, signal);
    const rssHref = firstMatch(
      pageHtml,
      /<link\b[^>]*href="([^"]+)"[^>]*type="application\/rss\+xml"[^>]*>/i,
    );
    if (!rssHref) throw new Error("Jobindex did not publish an RSS representation for this search");
    const rssUrl = new URL(decodeHtmlEntities(rssHref), this.http.baseUrl).toString();
    let channel;
    try {
      channel = parseRss(await this.http.bytes(rssUrl, {}, signal));
    } catch {
      throw new ProviderHttpError("Jobindex", "Jobindex returned invalid RSS");
    }
    return {
      title: channel.title,
      searchUrl: new URL(searchPath, this.http.baseUrl).toString(),
      resultsUrl: rssUrl,
      jobs: channel.items.slice(0, input.limit).map((item) => normalizeItem(item)),
    };
  }

  async getDetails(url: string, maximum: number, signal?: AbortSignal) {
    const html = await this.http.text(url, {}, signal);
    const content = firstMatch(
      html,
      /<div[^>]*class="PaidJob-inner"[^>]*>([\s\S]*?)<div[^>]*class="jix_toolbar/i,
    );
    const body = truncateText(htmlToPlainText(content), maximum);
    const title = htmlToPlainText(firstMatch(html, /<h1[^>]*>\s*Jobannonce:\s*([\s\S]*?)<\/h1>/i)) || htmlToPlainText(firstMatch(html, /<h4[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i));
    if (!title || !body.text) throw new ProviderHttpError("Jobindex", "Jobindex returned invalid job details");
    return {
      provider: "jobindex",
      id: firstMatch(url, /\/vis-job\/([^/?#]+)/) ?? url,
      title,
      employer: htmlToPlainText(firstMatch(html, /class="jix-toolbar-top__company"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)),
      location: htmlToPlainText(firstMatch(html, /class="jix_robotjob--area"[^>]*>([\s\S]*?)<\/span>/i)),
      publicationDate: firstMatch(html, /class="jix-toolbar__pubdate"[\s\S]*?<time[^>]*datetime="([^"]+)"/i) ?? null,
      applicationUrl: decodeHtmlEntities(firstMatch(html, /class="[^"]*seejobdesktop[^"]*"[^>]*href="([^"]+)"/i) ?? "") || null,
      body: body.text,
      bodyTruncated: body.truncated,
      canonicalUrl: url,
      sourceAttribution: "Jobindex",
    };
  }
}

export function buildJobindexSearchPath(input: SearchJobindexInput): string {
  const segments = ["jobsoegning"];
  if (input.categoryGroup && input.categorySlug) segments.push(input.categoryGroup, input.categorySlug);
  if (input.area) segments.push(input.area);
  const query = new URLSearchParams();
  if (input.query) query.set("q", input.exactPhrase ? `'${input.query}'` : input.query);
  if (input.maxAgeDays) query.set("jobage", String(input.maxAgeDays));
  if (input.page > 1) query.set("page", String(input.page));
  return `/${segments.join("/")}${query.size ? `?${query}` : ""}`;
}

function normalizeItem(item: ReturnType<typeof parseRss>["items"][number]) {
  if (!isProviderDetailUrl("jobindex", item.link)) {
    throw new ProviderHttpError("Jobindex", "Jobindex returned an invalid job URL");
  }
  const description = htmlToPlainText(item.description);
  const titleParts = item.title.split(",");
  const employer = titleParts.length > 1 ? titleParts.pop()?.trim() ?? null : null;
  const title = titleParts.join(",").trim();
  if (!title) throw new ProviderHttpError("Jobindex", "Jobindex returned invalid RSS");
  return {
    provider: "jobindex",
    id: firstMatch(item.link, /\/vis-job\/([^/?#]+)/) ?? item.guid,
    title,
    employer,
    location: firstMatch(item.description, /class="jix_robotjob--area"[^>]*>([^<]+)/i) ?? null,
    descriptionSnippet: truncateText(description, 1_500).text,
    publicationDate: item.publicationDate,
    categories: item.categories,
    canonicalUrl: item.link,
    sourceAttribution: "Jobindex",
  };
}
