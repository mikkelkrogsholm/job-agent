export type GuideAudience = "jobseeker" | "advisor" | "technical";

export type GuideFrontmatter = {
  id: string;
  title: string;
  description: string;
  summary: string;
  stage: string;
  audience: GuideAudience;
  lastVerified: string;
  sourceLinks: string[];
  optionalCapabilities: string[];
  humanConfirmations: string[];
  related: string[];
  route?: `/${string}/`;
  markdownRoute?: `/${string}.md`;
  previous?: string;
  next?: string;
};

const required = ["id", "title", "description", "summary", "stage", "audience", "lastVerified"] as const;
const audiences: GuideAudience[] = ["jobseeker", "advisor", "technical"];

function stringArray(record: Record<string, unknown>, key: string, source: string): string[] {
  if (!Array.isArray(record[key]) || !record[key].every((entry) => typeof entry === "string")) {
    throw new Error(`${source}: ${key} skal være en liste af tekster`);
  }
  return record[key] as string[];
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  return typeof record[key] === "string" && record[key] ? record[key] : undefined;
}

export function validateGuideFrontmatter(value: unknown, source: string): GuideFrontmatter {
  if (!value || typeof value !== "object") throw new Error(`${source}: frontmatter mangler`);
  const record = value as Record<string, unknown>;
  for (const key of required) {
    if (typeof record[key] !== "string" || !record[key]) throw new Error(`${source}: ${key} skal være tekst`);
  }
  if (!audiences.includes(record.audience as GuideAudience)) throw new Error(`${source}: ukendt audience`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.lastVerified as string)) {
    throw new Error(`${source}: lastVerified skal være en ISO-dato (YYYY-MM-DD)`);
  }
  const route = optionalString(record, "route");
  const markdownRoute = optionalString(record, "markdownRoute");
  if (route && !/^\/[^?#]*\/$/.test(route)) throw new Error(`${source}: route skal begynde og slutte med /`);
  if (markdownRoute && !/^\/[^?#]+\.md$/.test(markdownRoute)) throw new Error(`${source}: markdownRoute skal være en absolut .md-route`);

  const previous = optionalString(record, "previous");
  const next = optionalString(record, "next");
  return {
    id: record.id as string,
    title: record.title as string,
    description: record.description as string,
    summary: record.summary as string,
    stage: record.stage as string,
    audience: record.audience as GuideAudience,
    lastVerified: record.lastVerified as string,
    sourceLinks: stringArray(record, "sourceLinks", source),
    optionalCapabilities: stringArray(record, "optionalCapabilities", source),
    humanConfirmations: stringArray(record, "humanConfirmations", source),
    related: stringArray(record, "related", source),
    ...(route ? { route: route as `/${string}/` } : {}),
    ...(markdownRoute ? { markdownRoute: markdownRoute as `/${string}.md` } : {}),
    ...(previous ? { previous } : {}),
    ...(next ? { next } : {}),
  };
}
