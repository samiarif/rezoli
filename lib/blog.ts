import "server-only";
import { DEMO_BLOG_POSTS, hasDatabase } from "@/lib/demo-fixtures";

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[];
  publishedAt: Date | null;
  authorName: string | null;
};

export async function listPublishedPosts(opts?: {
  tag?: string;
  take?: number;
  skip?: number;
}): Promise<BlogPostSummary[]> {
  if (!hasDatabase()) {
    let rows = DEMO_BLOG_POSTS.filter((p) => p.status === "PUBLISHED");
    if (opts?.tag) rows = rows.filter((p) => p.tags.includes(opts.tag!));
    rows = rows.sort((a, b) => {
      const ax = a.publishedAt?.getTime() ?? 0;
      const bx = b.publishedAt?.getTime() ?? 0;
      return bx - ax;
    });
    if (opts?.skip) rows = rows.slice(opts.skip);
    if (opts?.take) rows = rows.slice(0, opts.take);
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      coverImageUrl: r.coverImageUrl,
      tags: r.tags,
      publishedAt: r.publishedAt,
      authorName:
        r.author?.firstName && r.author.lastName
          ? `${r.author.firstName} ${r.author.lastName}`
          : null,
    }));
  }
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(opts?.tag ? { tags: { has: opts.tag } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: opts?.take ?? 24,
    skip: opts?.skip ?? 0,
    include: { author: true },
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    coverImageUrl: r.coverImageUrl,
    tags: r.tags,
    publishedAt: r.publishedAt,
    authorName:
      r.author?.firstName && r.author.lastName
        ? `${r.author.firstName} ${r.author.lastName}`
        : null,
  }));
}

/** Aggregate tags across all published posts with their occurrence counts. */
export async function listPublishedTags(): Promise<
  Array<{ value: string; label: string; count: number }>
> {
  if (!hasDatabase()) {
    const counts = new Map<string, number>();
    for (const r of DEMO_BLOG_POSTS) {
      if (r.status !== "PUBLISHED") continue;
      for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { tags: true },
  });
  const counts = new Map<string, number>();
  for (const r of rows) {
    for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Returns the full post or `null` if not found. Shape is compatible with the
 * Prisma row plus a flattened `author` relation.
 */
export type BlogPostFull = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  content: unknown;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  seoTitle: string | null;
  seoDescription: string | null;
  author: { firstName: string | null; lastName: string | null; email: string } | null;
};

export async function getPostBySlug(slug: string): Promise<BlogPostFull | null> {
  if (!hasDatabase()) {
    const row = DEMO_BLOG_POSTS.find((p) => p.slug === slug);
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      coverImageUrl: row.coverImageUrl,
      content: row.content,
      tags: row.tags,
      status: row.status,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      author: row.author,
    };
  }
  const { prisma } = await import("@/lib/prisma");
  const row = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: true },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    content: row.content,
    tags: row.tags,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    author: row.author
      ? {
          firstName: row.author.firstName,
          lastName: row.author.lastName,
          email: row.author.email,
        }
      : null,
  };
}

export const STATUS_LABEL = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
} as const;
