import "server-only";
import { DEMO_REALISATIONS, hasDatabase } from "@/lib/demo-fixtures";

export type RealisationSummary = {
  id: string;
  slug: string;
  title: string;
  eventType: string;
  clientName: string | null;
  date: Date | null;
  location: string | null;
  guestCount: number | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  shortPitch: string;
  featured: boolean;
};

export async function listPublishedRealisations(opts?: {
  eventType?: string;
  take?: number;
}): Promise<RealisationSummary[]> {
  if (!hasDatabase()) {
    let rows = DEMO_REALISATIONS.filter((r) => r.status === "PUBLISHED");
    if (opts?.eventType) rows = rows.filter((r) => r.eventType === opts.eventType);
    rows = rows.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const ax = a.date?.getTime() ?? 0;
      const bx = b.date?.getTime() ?? 0;
      if (bx !== ax) return bx - ax;
      return a.order - b.order;
    });
    if (opts?.take) rows = rows.slice(0, opts.take);
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      eventType: r.eventType,
      clientName: r.clientName,
      date: r.date,
      location: r.location,
      guestCount: r.guestCount,
      heroImageUrl: r.heroImageUrl,
      heroImageAlt: r.heroImageAlt,
      shortPitch: r.shortPitch,
      featured: r.featured,
    }));
  }
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.realisation.findMany({
    where: {
      status: "PUBLISHED",
      ...(opts?.eventType ? { eventType: opts.eventType } : {}),
    },
    orderBy: [{ featured: "desc" }, { date: "desc" }, { order: "asc" }],
    take: opts?.take ?? 50,
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    eventType: r.eventType,
    clientName: r.clientName,
    date: r.date,
    location: r.location,
    guestCount: r.guestCount,
    heroImageUrl: r.heroImageUrl,
    heroImageAlt: r.heroImageAlt,
    shortPitch: r.shortPitch,
    featured: r.featured,
  }));
}

export async function listPublishedEventTypes(): Promise<
  Array<{ value: string; label: string; count: number }>
> {
  if (!hasDatabase()) {
    const counts = new Map<string, number>();
    for (const r of DEMO_REALISATIONS) {
      if (r.status !== "PUBLISHED") continue;
      counts.set(r.eventType, (counts.get(r.eventType) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.realisation.findMany({
    where: { status: "PUBLISHED" },
    select: { eventType: true },
  });
  const counts = new Map<string, number>();
  for (const r of rows) {
    counts.set(r.eventType, (counts.get(r.eventType) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);
}

export type RealisationFull = {
  id: string;
  slug: string;
  title: string;
  eventType: string;
  clientName: string | null;
  date: Date | null;
  location: string | null;
  guestCount: number | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  gallery: string[];
  shortPitch: string;
  longContent: unknown;
  outcomes: unknown;
  testimonial: unknown;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function getRealisationBySlug(
  slug: string
): Promise<RealisationFull | null> {
  if (!hasDatabase()) {
    const r = DEMO_REALISATIONS.find((x) => x.slug === slug);
    if (!r) return null;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      eventType: r.eventType,
      clientName: r.clientName,
      date: r.date,
      location: r.location,
      guestCount: r.guestCount,
      heroImageUrl: r.heroImageUrl,
      heroImageAlt: r.heroImageAlt,
      gallery: r.gallery,
      shortPitch: r.shortPitch,
      longContent: r.longContent,
      outcomes: r.outcomes,
      testimonial: r.testimonial,
      status: r.status,
      publishedAt: r.publishedAt,
      featured: r.featured,
      order: r.order,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
  const { prisma } = await import("@/lib/prisma");
  const r = await prisma.realisation.findUnique({ where: { slug } });
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    eventType: r.eventType,
    clientName: r.clientName,
    date: r.date,
    location: r.location,
    guestCount: r.guestCount,
    heroImageUrl: r.heroImageUrl,
    heroImageAlt: r.heroImageAlt,
    gallery: r.gallery,
    shortPitch: r.shortPitch,
    longContent: r.longContent,
    outcomes: r.outcomes,
    testimonial: r.testimonial,
    status: r.status,
    publishedAt: r.publishedAt,
    featured: r.featured,
    order: r.order,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const STATUS_LABEL = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
} as const;
