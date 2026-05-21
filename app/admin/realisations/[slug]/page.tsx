import type { Metadata } from "next";
import { RealisationEditor } from "@/components/admin/RealisationEditor";

export const metadata: Metadata = {
  title: "Admin · Modifier la réalisation",
  robots: { index: false, follow: false },
};

const DEMO_INITIAL = (slug: string) => ({
  slug,
  title: "Exemple de réalisation (mode démo)",
  eventType: "Cocktail dînatoire",
  clientName: "Société Exemple",
  date: new Date().toISOString(),
  location: "Tunis",
  guestCount: 120,
  heroImageUrl: null,
  heroImageAlt: null,
  gallery: [] as string[],
  shortPitch:
    "Décrivez ici l'événement en 1-2 phrases. C'est ce qui apparaît sur la fiche.",
  longContent: null,
  outcomes: [
    { label: "Invités servis", value: "120" },
    { label: "Satisfaction", value: "98%" },
  ],
  testimonial: null,
  status: "DRAFT" as const,
  featured: false,
  order: 0,
});

async function loadRealisation(slug: string) {
  if (!process.env.DATABASE_URL) {
    const { DEMO_REALISATIONS } = await import("@/lib/demo-fixtures");
    return DEMO_REALISATIONS.find((r) => r.slug === slug) ?? null;
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.realisation.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export default async function AdminRealisationEdit({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await loadRealisation(slug);

  const initial = r
    ? {
        slug: r.slug,
        title: r.title,
        eventType: r.eventType,
        clientName: r.clientName,
        date: r.date ? r.date.toISOString() : null,
        location: r.location,
        guestCount: r.guestCount,
        heroImageUrl: r.heroImageUrl,
        heroImageAlt: r.heroImageAlt,
        gallery: r.gallery,
        shortPitch: r.shortPitch,
        longContent: r.longContent,
        outcomes: (r.outcomes ?? null) as never,
        testimonial: (r.testimonial ?? null) as never,
        status: r.status,
        featured: r.featured,
        order: r.order,
      }
    : DEMO_INITIAL(slug);

  return <RealisationEditor initial={initial as never} />;
}
