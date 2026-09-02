import * as z from "zod/v4";
import { isProviderDetailUrl } from "../../shared/provider-urls.ts";

const numericIds = (description: string, maximum = 20) =>
  z.array(z.number().int().positive()).max(maximum).optional().describe(description);

export const searchJobbankSchema = z.object({
  keywords: z.string().trim().max(200).optional().describe(
    "Words that Jobbank must search for. Omit to browse using filters only. This maps to Jobbank's key field.",
  ),
  excludeKeywords: z.string().trim().max(200).optional().describe(
    "Words Jobbank should exclude from matches. This maps to antikey and is evaluated by Jobbank, not locally.",
  ),
  jobTypeIds: numericIds(
    "Jobbank cvtype IDs. Multiple values are OR alternatives. Call get_jobbank_filter_reference for exact IDs.",
  ),
  educationAreaIds: numericIds(
    "Jobbank udd IDs for educational background, for example 24 for IT.",
  ),
  locationIds: numericIds(
    "Jobbank amt IDs for Danish areas, for example 2 for Greater Copenhagen and 8 for East Jutland/Aarhus.",
  ),
  workAreaIds: numericIds(
    "Jobbank erf IDs for work functions, for example 31 for software and 43 for data/analysis.",
  ),
  industryIds: numericIds(
    "Jobbank branche IDs, for example 10331 for IT/telecom.",
  ),
  suitabilityIds: numericIds(
    "Jobbank andet IDs: 2 new graduates, 4 international background, 5 experienced.",
  ),
  company: z.string().trim().max(150).optional().describe(
    "Company-name filter evaluated by Jobbank.",
  ),
  remoteWork: z.enum(["helt", "delvist"]).optional().describe(
    "Jobbank remote-work filter: helt means fully remote; delvist means partially remote.",
  ),
  postedSince: z.iso.date().optional().describe(
    "Only advertisements posted on or after this ISO date (YYYY-MM-DD). Maps to oprettet.",
  ),
  page: z.number().int().min(1).max(100).default(1).describe(
    "One-indexed Jobbank results page. Each page contains up to about 100 RSS results.",
  ),
  limit: z.number().int().min(1).max(100).default(20).describe(
    "Maximum results returned to the MCP client from the selected Jobbank result page.",
  ),
});

export const jobbankDetailsSchema = z.object({
  url: z.url().refine((value) => isProviderDetailUrl("jobbank", value), {
    message: "url must be a canonical https://jobbank.dk/job/... URL returned by search_jobbank_jobs",
  }).describe("Canonical Jobbank result URL returned by search_jobbank_jobs."),
  maxBodyCharacters: z.number().int().min(500).max(30_000).default(12_000),
});

export type SearchJobbankInput = z.infer<typeof searchJobbankSchema>;
