import * as z from "zod/v4";
import { isProviderDetailUrl } from "../../shared/provider-urls.ts";

export const DANISH_PROVIDERS = ["jobnet", "jobbank", "jobindex", "jobdanmark"] as const;

export const searchDanishJobsSchema = z.object({
  query: z.string().trim().min(2).max(200).describe(
    "Job title, skill, employer, or phrase to search for on every selected Danish portal.",
  ),
  providers: z.array(z.enum(DANISH_PROVIDERS)).min(1).max(4).default([...DANISH_PROVIDERS]).describe(
    "Portals to search. Omit to search Jobnet, Jobbank, Jobindex, and Jobdanmark in parallel.",
  ),
  limitPerProvider: z.number().int().min(1).max(30).default(10).describe(
    "Maximum results requested from each portal before cross-portal deduplication.",
  ),
});

export const danishJobDetailsSchema = z.object({
  provider: z.enum(DANISH_PROVIDERS).describe(
    "The provider value returned by search_danish_jobs.",
  ),
  canonicalUrl: z.url().describe(
    "The exact canonicalUrl returned by search_danish_jobs. It must belong to the selected provider.",
  ),
  maxBodyCharacters: z.number().int().min(500).max(30_000).default(12_000),
}).refine(
  ({ provider, canonicalUrl }) => isProviderDetailUrl(provider, canonicalUrl),
  { path: ["canonicalUrl"], message: "canonicalUrl must be an exact HTTPS job URL for the selected provider" },
);

export type DanishProvider = (typeof DANISH_PROVIDERS)[number];
export type SearchDanishJobsInput = z.infer<typeof searchDanishJobsSchema>;
