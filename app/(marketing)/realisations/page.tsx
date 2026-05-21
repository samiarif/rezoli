import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { RealisationCard } from "@/components/realisations/RealisationCard";
import { FilterChips } from "@/components/ui/filter-chips";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";
import {
  listPublishedRealisations,
  listPublishedEventTypes,
} from "@/lib/realisations";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}): Promise<Metadata> {
  const { type } = await searchParams;
  return {
    title: type ? `Réalisations · ${type}` : "Nos réalisations",
    description: type
      ? `Événements Rezoli de type ${type}.`
      : "Découvrez nos événements passés : cocktails, cérémonies, soirées du bac, soutenances. Photos, retours et chiffres clés.",
    alternates: {
      canonical: type
        ? `/realisations?type=${encodeURIComponent(type)}`
        : "/realisations",
    },
  };
}

export default async function RealisationsIndex({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const [rows, types] = await Promise.all([
    listPublishedRealisations({ eventType: type, take: 50 }),
    listPublishedEventTypes(),
  ]);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Réalisations", url: `${SITE_URL}/realisations` },
        ]}
      />
      <PageHero
        eyebrow="Nos événements"
        title="Réalisations"
        description="Une sélection d'événements que nous avons orchestrés. Cliquez sur une fiche pour découvrir l'histoire complète."
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/realisations", label: "Réalisations" },
        ]}
      />
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {types.length > 0 && (
            <FilterChips
              options={types}
              activeValue={type}
              baseHref="/realisations"
              param="type"
            />
          )}
          {rows.length === 0 ? (
            <div className="rounded-2xl bg-cream-50 ring-1 ring-cream-100 p-16 text-center">
              <FolderOpen className="size-12 mx-auto text-teal-600 mb-4" />
              <h2 className="font-display text-2xl font-semibold">
                {type ? "Aucune réalisation pour ce filtre" : "Bientôt en ligne"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                {type
                  ? "Essayez un autre type d'événement."
                  : "Notre équipe prépare les fiches de nos derniers événements. Revenez très bientôt."}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rows.map((r) => (
                <li key={r.id}>
                  <RealisationCard r={r} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
