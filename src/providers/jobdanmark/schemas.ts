import * as z from "zod/v4";
import { isProviderDetailUrl } from "../../shared/provider-urls.ts";

export const JOBDANMARK_JOB_TYPES = [
  "fuldtid", "deltid", "fleksjob", "elev", "studiejob", "praktik",
] as const;
export const JOBDANMARK_LOCATION_TYPES = [
  "city", "municipality", "administrativeRegion", "region", "zip",
] as const;

export const searchJobdanmarkSchema = z.object({
  query: z.string().trim().max(200).optional().describe(
    "Free text sent to Jobdanmark as a freetext filter. Omit to browse by other filters.",
  ),
  jobTypes: z.array(z.enum(JOBDANMARK_JOB_TYPES)).max(JOBDANMARK_JOB_TYPES.length).optional().describe(
    "Jobdanmark's verified job-type values. Multiple values are OR alternatives.",
  ),
  categoryIds: z.array(z.number().int().positive()).max(10).optional().describe(
    "Jobdanmark category IDs. Call list_jobdanmark_filters to get the current IDs and labels.",
  ),
  jobTitleSlugs: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10).optional().describe(
    "Exact current job-title slugs from list_jobdanmark_filters. Do not guess slugs.",
  ),
  locations: z.array(z.object({
    query: z.string().trim().min(1).max(100).describe("City, municipality, region, or postal-code text resolved through Jobdanmark's own location search."),
    type: z.enum(JOBDANMARK_LOCATION_TYPES).optional().describe("Optional required location level. Omit to accept Jobdanmark's first matching level."),
  })).max(10).optional().describe("Locations resolved and filtered by Jobdanmark, not by the MCP server."),
  page: z.number().int().min(1).max(100).default(1).describe(
    "One-indexed page. Jobdanmark returns 30 results per page.",
  ),
  limit: z.number().int().min(1).max(30).default(30).describe(
    "Maximum results returned from the selected page; Jobdanmark's page size is 30.",
  ),
});

export const jobdanmarkFilterSchema = z.object({
  includeJobTitles: z.boolean().default(false).describe(
    "Include Jobdanmark's large live job-title taxonomy. Leave false when only category and job-type values are needed.",
  ),
});

export const jobdanmarkLocationSchema = z.object({
  query: z.string().trim().min(1).max(100).describe(
    "Location text or postal code to resolve using Jobdanmark's own autocomplete.",
  ),
});

export const jobdanmarkDetailsSchema = z.object({
  url: z.url().refine((value) => isProviderDetailUrl("jobdanmark", value), {
    message: "url must be a canonical https://jobdanmark.dk/job/... URL returned by search_jobdanmark_jobs",
  }),
  maxBodyCharacters: z.number().int().min(500).max(30_000).default(12_000),
});

export type SearchJobdanmarkInput = z.infer<typeof searchJobdanmarkSchema>;

export interface JobdanmarkFilter {
  type: string;
  value: string | number;
  displayText: string;
  slug?: string;
}
