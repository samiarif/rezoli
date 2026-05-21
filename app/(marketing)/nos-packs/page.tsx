import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { FAQ } from "@/components/sections/FAQ";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";
import { loadEventPackCategories } from "@/lib/catalog-loader";
import { PackCapsule } from "@/components/event-packs/PackCapsule";

export const metadata: Metadata = {
  title: "Nos packs événementiels",
  description:
    "Soirée Bac, fêtes de fin d'année, soutenances : nos formules clés-en-main tout inclus, avec livraison et service.",
  alternates: { canonical: "/nos-packs" },
};

export default async function PacksPage() {
  const eventPackCategories = await loadEventPackCategories();
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Nos packs", url: `${SITE_URL}/nos-packs` },
        ]}
      />
      <PageHero
        eyebrow="Solutions complètes"
        title="Nos packs"
        description="Des formules clé en main, pensées pour chaque contexte : soirées du bac, cérémonies universitaires, soutenances. Livraison et service inclus, prix total — rien à gérer."
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/nos-packs", label: "Nos packs" },
        ]}
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="eyebrow">Catalogue</p>
            <h2 className="display-2 mt-2 text-balance">
              Choisissez votre pack
            </h2>
            <p className="lede mt-4 text-pretty mx-auto max-w-2xl">
              Dépliez une catégorie pour voir les 4 formules disponibles, choisir
              le nombre d&apos;invités et ajouter les options.
            </p>
          </div>

          <div className="space-y-5">
            {eventPackCategories.map((cat) => (
              <PackCapsule key={cat.slug} category={cat} />
            ))}
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
