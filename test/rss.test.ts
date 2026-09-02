import { describe, expect, test } from "bun:test";
import { parseRss } from "../src/shared/rss.ts";

describe("Bun.XML RSS parser", () => {
  test("normalizes one item, repeated categories, CDATA and ISO-8859-1 bytes", () => {
    const source = `<?xml version="1.0" encoding="ISO-8859-1"?><rss><channel><title>Danske job</title><description>Søgning</description><link>https://example.test</link><item><title><![CDATA[Udvikler]]></title><link>https://example.test/1</link><guid>1</guid><description><![CDATA[Et job i København]]></description><pubDate>Tue, 02 Sep 2026 08:00:00 GMT</pubDate><category>IT</category><category>Data</category></item></channel></rss>`;
    const bytes = new TextEncoder().encode(source.replace("ø", "o"));
    const result = parseRss(bytes);
    expect(result.title).toBe("Danske job");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ title: "Udvikler", categories: ["IT", "Data"] });
  });

  test("accepts a valid empty channel but rejects invalid feed and item shapes", () => {
    expect(parseRss("<rss><channel><title>Empty</title></channel></rss>").items).toEqual([]);
    for (const source of [
      "<rss><channel>",
      "<feed><channel></channel></feed>",
      "<rss></rss>",
      "<rss><channel><item><link>https://example.test/1</link></item></channel></rss>",
      "<rss><channel><item><title>Title</title></item></channel></rss>",
    ]) expect(() => parseRss(source)).toThrow();
  });
});
