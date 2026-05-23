import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, PartyPopper, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { FAQ } from "@/components/sections/FAQ";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, formatTND } from "@/lib/utils";
import { loadEventPackCategories } from "@/lib/catalog-loader";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Nos packs événementiels",
  description:
    "Soirée Bac, fêtes de fin d'année, soutenances : nos formules clés-en-main tout inclus, avec livraison et service.",
  alternates: { canonical: "/nos-packs" },
};

const ICONS: Record<string, LucideIcon> = {
  soutenance: GraduationCap,
  "soiree-bac": PartyPopper,
  "fetes-fin-annee": Sparkles,
};

export default async function PacksPage() {
  const eventPackCategories = await loadEventPackCategories();
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Packs Événements", url: `${SITE_URL}/nos-packs` },
        ]}
      />
      <PageHero
        eyebrow="Solutions complètes"
        title="Packs Événements"
        description="Des formules clé en main, pensées pour chaque contexte : soirées du bac, cérémonies universitaires, soutenances. Livraison et service inclus, prix total — rien à gérer."
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/nos-packs", label: "Packs Événements" },
        ]}
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="eyebrow">Catalogue</p>
            <h2 className="display-2 mt-2 text-balance">
              Choisissez votre pack événement
            </h2>
            <p className="lede mt-4 text-pretty mx-auto max-w-2xl">
              Sélectionnez la catégorie qui correspond à votre événement :
              vous accéderez à la page dédiée pour configurer vos coordonnées,
              votre formule et finaliser votre devis.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {eventPackCategories.map((cat) => {
              const Icon = ICONS[cat.slug] ?? Sparkles;
              // Starting price = cheapest tier at min guest count
              const guestCountForPreview =
                cat.guestCount.kind === "fixed"
                  ? cat.guestCount.value
                  : cat.guestCount.min;
              const startingPrice = cat.tiers
                .map((t) =>
                  t.price.kind === "fixed"
                    ? t.price.ht
                    : t.price.table[guestCountForPreview] ??
                      Math.min(...Object.values(t.price.table))
                )
                .reduce((min, p) => (p < min ? p : min), Infinity);
              return (
                <Link
                  key={cat.slug}
                  href={`/nos-packs/${cat.slug}`}
                  className="group flex flex-col rounded-2xl bg-background ring-1 ring-border p-6 transition-all hover:-translate-y-1 hover:shadow-md hover:ring-teal-500/40"
                >
                  <header className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                      <Icon className="size-5" />
                    </span>
                    <Badge variant="neutral">{cat.tiers.length} formules</Badge>
                  </header>
                  <h3 className="font-display text-xl font-semibold mt-4">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
                    {cat.tagline}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {cat.guestCount.kind === "fixed"
                      ? cat.guestCount.label
                      : `De ${cat.guestCount.min} à ${cat.guestCount.max} invités`}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <p className="text-sm">
                      <span className="text-muted-foreground">À partir de </span>
                      <span className="font-display text-lg font-semibold text-teal-700">
                        {formatTND(startingPrice)}
                      </span>
                      <span className="text-xs text-muted-foreground"> HT</span>
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-teal-700 transition-transform group-hover:translate-x-0.5">
                      Découvrir
                      <ArrowRight className="size-4 ml-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            Tous les prix sont indicatifs et hors taxes. Le devis final sera
            établi par notre équipe selon votre demande exacte.
          </p>
        </div>
      </section>

      <FAQ />
      <CTASection />
    </>
  );
}
