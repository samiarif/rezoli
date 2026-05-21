import type { MetadataRoute } from "next";
import { services } from "@/lib/catalog";
import { SITE_URL } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticPaths = [
    "",
    "/nos-services",
    "/nos-packs",
    "/realisations",
    "/blog",
    "/nos-partenaires",
    "/devenir-partenaire",
    "/a-propos",
    "/contact",
    "/cgu",
    "/mentions-legales",
    "/politique-confidentialite",
  ];

  const out: MetadataRoute.Sitemap = [
    ...staticPaths.map((p) => ({
      url: `${SITE_URL}${p}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...services.map((s) => ({
      url: `${SITE_URL}/nos-services/${s.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  // Add published blog posts + realisations if DB is available
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const [posts, realisations] = await Promise.all([
        prisma.blogPost.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
        }),
        prisma.realisation.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
        }),
      ]);
      for (const p of posts) {
        out.push({
          url: `${SITE_URL}/blog/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
      for (const r of realisations) {
        out.push({
          url: `${SITE_URL}/realisations/${r.slug}`,
          lastModified: r.updatedAt,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    } catch (err) {
      console.error("[sitemap] DB load failed", err);
    }
  }

  return out;
}
