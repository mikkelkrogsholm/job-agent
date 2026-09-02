import * as z from "zod/v4";
import { isProviderDetailUrl } from "../../shared/provider-urls.ts";

export const DANISH_PROVIDERS = ["jobnet", "jobbank", "jobindex", "jobdanmark"] as const;

export const searchDanishJobsSchema = z.object({
  query: z.string().trim().min(2).max(200).describe(
    "Ordinary job request. Phrases such as 'elektriker i Aalborg' are split into occupation and location before provider searches.",
  ),
  occupation: z.string().trim().min(2).max(120).optional().describe(
    "Job title, occupation, skill, or employer. Prefer this structured field when it is known.",
  ),
  location: z.string().trim().min(2).max(100).optional().describe(
    "Danish city or area. Prefer this structured field instead of putting the place in query.",
  ),
  postalCode: z.number().int().min(1000).max(9999).optional().describe(
    "Optional Danish postal code for providers that support radius search.",
  ),
  radiusKm: z.number().int().min(1).max(200).default(50).describe(
    "Radius around postalCode where the provider supports it.",
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
