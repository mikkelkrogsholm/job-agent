import * as z from "zod/v4";
import { isProviderDetailUrl } from "../../shared/provider-urls.ts";

export const JOBINDEX_AREAS = [
  "storkoebenhavn", "nordsjaelland", "sjaelland", "fyn", "nordjylland",
  "midtjylland", "sydjylland", "bornholm",
] as const;

export const searchJobindexSchema = z.object({
  query: z.string().trim().max(200).optional().describe(
    "Keyword phrase evaluated by Jobindex. Omit to browse a category or area. Set exactPhrase=true only when the user asks for an exact phrase.",
  ),
  exactPhrase: z.boolean().default(false).describe(
    "Wrap query in single quotes using Jobindex's exact-phrase syntax. Do not enable for ordinary broad searches.",
  ),
  area: z.enum(JOBINDEX_AREAS).optional().describe(
    "Verified Jobindex area path. This is interpreted by Jobindex, not filtered locally.",
  ),
  categoryGroup: z.string().regex(/^[a-z0-9-]+$/).max(80).optional().describe(
    "First segment of a verified Jobindex category path, for example it. Must be supplied together with categorySlug.",
  ),
  categorySlug: z.string().regex(/^[a-z0-9-]+$/).max(80).optional().describe(
    "Second segment of a verified Jobindex category path, for example itdrift. Must be supplied together with categoryGroup.",
  ),
  maxAgeDays: z.number().int().min(1).max(90).optional().describe(
    "Only results from at most this many days ago. Jobindex evaluates the jobage filter.",
  ),
  page: z.number().int().min(1).max(100).default(1).describe(
    "One-indexed Jobindex result page; approximately 20 advertisements per page.",
  ),
  limit: z.number().int().min(1).max(50).default(20).describe(
    "Maximum results returned from the selected page.",
  ),
}).refine(
  (value) => Boolean(value.categoryGroup) === Boolean(value.categorySlug),
  { message: "categoryGroup and categorySlug must be supplied together", path: ["categoryGroup"] },
);

export const jobindexDetailsSchema = z.object({
  url: z.url().refine((value) => isProviderDetailUrl("jobindex", value), {
    message: "url must be a canonical https://www.jobindex.dk/vis-job/... URL returned by search_jobindex_jobs",
  }),
  maxBodyCharacters: z.number().int().min(500).max(20_000).default(8_000),
});

export type SearchJobindexInput = z.infer<typeof searchJobindexSchema>;
