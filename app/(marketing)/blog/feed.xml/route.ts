import { listPublishedPosts } from "@/lib/blog";
import { SITE_URL, BUSINESS } from "@/lib/utils";

export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await listPublishedPosts({ take: 50 });
  const lastBuild = posts[0]?.publishedAt ?? new Date();

  const items = posts
    .map((p) => {
      const link = `${SITE_URL}/blog/${p.slug}`;
      const pubDate = (p.publishedAt ?? new Date()).toUTCString();
      const description = p.excerpt
        ? escapeXml(p.excerpt)
        : escapeXml(p.title);
      const categories = p.tags
        .map((t) => `<category>${escapeXml(t)}</category>`)
        .join("");
      return `
      <item>
        <title>${escapeXml(p.title)}</title>
        <link>${link}</link>
        <guid isPermaLink="true">${link}</guid>
        <pubDate>${pubDate}</pubDate>
        <description>${description}</description>
        ${categories}
      </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${BUSINESS.name} — Blog`)}</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(`Le journal ${BUSINESS.name} — tendances, conseils et coulisses du traiteur événementiel en Tunisie.`)}</description>
    <language>fr</language>
    <lastBuildDate>${(lastBuild instanceof Date ? lastBuild : new Date(lastBuild)).toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
