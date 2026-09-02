import type {
  OccupationNode,
  RawJobAd,
  RawJobDetails,
} from "./jobnet-client.ts";

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "…",
  laquo: "«",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  nbsp: " ",
  quot: '"',
  raquo: "»",
  rdquo: "”",
  rsquo: "’",
};

export function htmlToPlainText(html: string | undefined): string {
  if (!html) return "";

  return decodeHtmlEntities(
    html
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\s*\/\s*(p|div|li|h[1-6]|tr)\s*>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "- ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeSearchJob(
  job: RawJobAd,
  includeDescription: boolean,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {
    id: job.jobAdId,
    title: job.title,
    employer: job.hiringOrgName ?? null,
    occupation: job.occupation ?? null,
    location: {
      country: job.country ?? null,
      municipality: job.municipality ?? null,
      postalCode: job.postalCode ?? null,
      postalDistrict: job.postalDistrictName ?? null,
      address: job.workPlaceAddress?.trim() || null,
    },
    announcementType: job.jobAnnouncementTypeName ?? null,
    partTime: job.workHourPartTime ?? null,
    publicationDate: job.publicationDate ?? null,
    applicationDeadline: job.applicationDeadline ?? null,
    applicationDeadlineStatus: job.applicationDeadlineStatus ?? null,
    isExternal: job.isExternal ?? false,
    jobnetUrl: `https://jobnet.dk/find-job/${job.jobAdId}`,
    applicationUrl: job.jobAdUrl || null,
  };

  if (includeDescription) {
    normalized.descriptionSnippet = truncate(
      htmlToPlainText(job.description),
      1_500,
    ).text;
  }

  return normalized;
}

export function normalizeJobDetails(
  details: RawJobDetails,
  maxBodyCharacters: number,
): Record<string, unknown> {
  const bodyResult = truncate(htmlToPlainText(details.body), maxBodyCharacters);

  return {
    id: details.id,
    title: details.title,
    body: bodyResult.text,
    bodyTruncated: bodyResult.truncated,
    publicationDateTime: details.publicationDateTime ?? null,
    unpublicationDateTime: details.unpublicationDateTime ?? null,
    updatedDateTime: details.updatedDateTime ?? null,
    approvalStatus: details.approvalStatus ?? null,
    anonymousEmployer: details.isAnonymousEmployer ?? false,
    employer: details.employer ?? null,
    job: details.job ?? null,
    application: details.application ?? null,
    jobnetUrl: `https://jobnet.dk/find-job/${details.id}`,
  };
}

export function normalizeOccupation(
  node: OccupationNode,
): Record<string, unknown> {
  return {
    id: node.identifier,
    name: node.name,
    level: node.hierarchyLevel,
    parentId: node.parentIdentifier || null,
    aliases:
      node.aliases?.map((alias) => ({
        id: alias.aliasIdentifier,
        name: alias.label,
      })) ?? [],
  };
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith("#")) {
      const hexadecimal = code[1]?.toLowerCase() === "x";
      const numeric = Number.parseInt(
        code.slice(hexadecimal ? 2 : 1),
        hexadecimal ? 16 : 10,
      );
      return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : entity;
    }
    return HTML_ENTITIES[code.toLowerCase()] ?? entity;
  });
}

function truncate(
  value: string,
  maximum: number,
): { text: string; truncated: boolean } {
  if (value.length <= maximum) return { text: value, truncated: false };
  return { text: `${value.slice(0, maximum - 1).trimEnd()}…`, truncated: true };
}
