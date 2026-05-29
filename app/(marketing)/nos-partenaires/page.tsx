import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { PartnersDirectory } from "@/components/sections/PartnersDirectory";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";

const STATS = [
  { value: "15+", label: "Enseignes partenaires" },
  { value: "4", label: "Catégories culinaires" },
  { value: "100%", label: "Tunisien & local" },
];

export const metadata: Metadata = {
  title: "Nos partenaires",
  description:
    "Traiteurs, pâtisseries, restaurants et concepts food : découvrez nos partenaires culinaires de confiance.",
  alternates: { canonical: "/nos-partenaires" },
};

export default function PartnersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Nos partenaires", url: `${SITE_URL}/nos-partenaires` },
        ]}
      />
      <PageHero
        eyebrow="Écosystème"
        title="Un réseau de partenaires d'exception"
        description="Rezoli réunit des partenaires culinaires de confiance : traiteurs, pâtisseries, restaurants et concepts food pour tous types d'événements."
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/nos-partenaires", label: "Nos partenaires" },
        ]}
      >
        <Button asChild variant="accent" size="lg">
          <Link href="/devenir-partenaire">
            Devenir partenaire
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </PageHero>

      {/* Key stats */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-background ring-1 ring-border shadow-xs p-6 text-center"
              >
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-4xl md:text-5xl font-bold text-teal-700">
                    {s.value}
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-10 text-center">
            <p className="eyebrow">Partenaires culinaires</p>
            <h2 className="display-2 mt-2 text-balance">
              Une sélection d&apos;enseignes de qualité
            </h2>
            <p className="lede mt-4 text-pretty mx-auto max-w-2xl">
              Traiteurs, pâtisseries, restaurants et concepts food : chaque
              partenaire est sélectionné pour son exigence et son savoir-faire.
              Filtrez par catégorie ci-dessous.
            </p>
          </header>

          <PartnersDirectory />
        </div>
      </section>

      <CTASection
        title="Vous voulez rejoindre notre écosystème ?"
        description="Traiteurs, pâtisseries, restaurants ou concepts food : nous sommes toujours à l'écoute des bons profils."
      />
    </>
  );
}
