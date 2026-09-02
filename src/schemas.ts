import * as z from "zod/v4";

export const REGIONS = [
  "Nordjylland",
  "Midtjylland",
  "Syddanmark",
  "HovedstadenOgBornholm",
  "OevrigeSjaelland",
] as const;

export const ORDER_TYPES = [
  "BestMatch",
  "PublicationDate",
  "ApplicationDate",
] as const;

export const JOB_ANNOUNCEMENT_TYPES = [
  "Ordinaert",
  "Efterloenner",
  "Foertidspension",
  "Fleksjob",
  "Handicapingenhindring",
  "Hotjob",
] as const;

export const FACET_TYPES = [
  "countries",
  "regions",
  "occupationAreas",
  "occupationGroups",
  "occupations",
  "byAlias",
  "jobAnnouncements",
  "employmentDurations",
  "workHours",
  "workHoursPartTime",
  "disabilityFriendly",
] as const;

const uuidArray = z
  .array(z.uuid())
  .max(50)
  .optional()
  .describe(
    "Jobnet occupation or alias UUIDs. Use list_occupations to discover valid IDs.",
  );

export const searchFields = {
  searchString: z
    .string()
    .trim()
    .max(200)
    .optional()
    .describe(
      "Free-text query for title, employer, skills, or advertisement text. May be empty to browse all jobs.",
    ),
  resultsPerPage: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe(
      "Number of jobs to return. Keep this small unless the user explicitly asks for many results.",
    ),
  pageNumber: z.number().int().min(1).max(1000).default(1),
  orderType: z
    .enum(ORDER_TYPES)
    .default("BestMatch")
    .describe(
      "BestMatch needs a search string; PublicationDate means newest first; ApplicationDate means earliest deadline first.",
    ),
  workplaceFilter: z
    .literal("NonFixed")
    .optional()
    .describe("Only jobs without a fixed workplace."),
  employmentDurationType: z
    .enum(["Permanent", "Temporary"])
    .optional()
    .describe("Permanent or temporary employment."),
  workHoursType: z
    .enum(["PartTime", "FullTime"])
    .optional()
    .describe("Part-time or full-time employment."),
  workHourMin: z
    .number()
    .int()
    .min(1)
    .max(36)
    .optional()
    .describe("Minimum weekly hours for part-time jobs."),
  workHourMax: z
    .number()
    .int()
    .min(1)
    .max(36)
    .optional()
    .describe("Maximum weekly hours for part-time jobs."),
  countries: z
    .array(z.string().regex(/^[A-Z]{2}$/))
    .max(25)
    .optional()
    .describe(
      "ISO 3166-1 alpha-2 country codes, for example DK, GL, DE, or SE.",
    ),
  regions: z
    .array(z.enum(REGIONS))
    .max(REGIONS.length)
    .optional()
    .describe("One or more Danish Jobnet regions."),
  postalCode: z
    .number()
    .int()
    .min(1000)
    .max(9999)
    .optional()
    .describe(
      "Danish four-digit postal code used as the center of a radius search.",
    ),
  kmRadius: z
    .number()
    .int()
    .min(1)
    .max(200)
    .default(50)
    .describe("Radius in kilometers around postalCode."),
  occupationAreas: z
    .array(z.string().regex(/^\d+$/))
    .max(10)
    .optional()
    .describe(
      "Top-level occupation area IDs. Use list_occupations with no parentIdentifier to discover them.",
    ),
  occupationGroups: z
    .array(z.string().regex(/^\d+$/))
    .max(20)
    .optional()
    .describe(
      "Occupation group IDs. Use list_occupations with an occupation-area parentIdentifier.",
    ),
  occupations: uuidArray,
  aliasIdentifiers: uuidArray,
  jobAnnouncementType: z
    .enum(JOB_ANNOUNCEMENT_TYPES)
    .optional()
    .describe("Jobnet announcement category."),
};

function hasValidSearchRange(value: {
  workHourMin?: number | undefined;
  workHourMax?: number | undefined;
}): boolean {
  return (
    value.workHourMin === undefined ||
    value.workHourMax === undefined ||
    value.workHourMin <= value.workHourMax
  );
}

const rangeValidation = {
  path: ["workHourMin"],
  message: "workHourMin must be less than or equal to workHourMax",
};

export const searchJobsSchema = z
  .object(searchFields)
  .refine(hasValidSearchRange, rangeValidation);

export const searchJobsToolSchema = z
  .object({
    ...searchFields,
    includeDescriptionSnippet: z
      .boolean()
      .default(false)
      .describe(
        "Include up to 1,500 plain-text characters from each advertisement.",
      ),
  })
  .refine(hasValidSearchRange, rangeValidation);

export const facetSearchSchema = z
  .object({
    ...searchFields,
    facetTypes: z
      .array(z.enum(FACET_TYPES))
      .min(1)
      .max(FACET_TYPES.length)
      .default([
        "countries",
        "regions",
        "jobAnnouncements",
        "employmentDurations",
        "workHours",
      ]),
    limitPerFacet: z.number().int().min(1).max(100).default(25),
  })
  .refine(hasValidSearchRange, rangeValidation);

export const getJobSchema = z.object({
  jobId: z
    .uuid()
    .describe(
      "The stable Jobnet job advertisement UUID returned by search_jobs.",
    ),
  maxBodyCharacters: z
    .number()
    .int()
    .min(500)
    .max(30_000)
    .default(12_000)
    .describe(
      "Maximum number of plain-text advertisement characters to return.",
    ),
});

export const listOccupationsSchema = z.object({
  parentIdentifier: z
    .string()
    .max(100)
    .optional()
    .describe(
      "Omit for occupation areas; pass an area ID for groups; pass a group ID for occupations and aliases.",
    ),
});

export const suggestTermsSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .describe("Partial Jobnet search phrase; use at least two characters."),
});

export type SearchJobsInput = z.infer<typeof searchJobsSchema>;
export type FacetSearchInput = z.infer<typeof facetSearchSchema>;
