import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { partners } from "@/lib/catalog";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";

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
            </p>
          </header>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {partners.map((p) => (
              <li
                key={p.id}
                className="group flex flex-col items-center justify-center gap-3 h-32 rounded-xl bg-background ring-1 ring-border shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:ring-teal-500/30 transition-all px-4 py-3"
              >
                {p.logo ? (
                  <Image
                    src={p.logo}
                    alt={p.name}
                    width={180}
                    height={80}
                    className="max-h-14 w-auto object-contain"
                  />
                ) : (
                  <span className="font-display text-base font-semibold text-neutral-800 text-center">
                    {p.name}
                  </span>
                )}
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Partenaire culinaire
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection
        title="Vous voulez rejoindre notre écosystème ?"
        description="Traiteurs, pâtisseries, restaurants ou concepts food : nous sommes toujours à l'écoute des bons profils."
      />
    </>
  );
}
