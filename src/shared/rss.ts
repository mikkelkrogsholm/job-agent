import { XML } from "bun";

export interface RssItem {
  title: string;
  link: string;
  guid: string;
  description: string;
  publicationDate: string | null;
  categories: string[];
}

export interface RssChannel {
  title: string;
  description: string;
  link: string;
  items: RssItem[];
}

export function parseRss(input: Uint8Array | string): RssChannel {
  let document: Record<string, unknown>;
  try {
    document = XML.parse(input) as unknown as Record<string, unknown>;
  } catch {
    throw new Error("Invalid RSS feed");
  }
  const rss = asRecord(document.rss);
  const channel = asRecord(rss.channel);
  if (!hasRecord(document.rss) || !hasRecord(rss.channel)) throw new Error("Invalid RSS feed");
  const items = array(channel.item).map((raw) => {
    const item = asRecord(raw);
    const title = scalar(item.title);
    const link = scalar(item.link);
    if (!title || !link) throw new Error("Invalid RSS feed item");
    return {
      title,
      link,
      guid: scalar(item.guid) || scalar(item.link),
      description: scalar(item.description),
      publicationDate: scalar(item.pubDate) || null,
      categories: array(item.category).map(scalar).filter(Boolean),
    };
  });
  return {
    title: scalar(channel.title),
    description: scalar(channel.description),
    link: scalar(channel.link),
    items,
  };
}

function hasRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function scalar(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("#text" in record) return scalar(record["#text"]);
  }
  return "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function array(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}
