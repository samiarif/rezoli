import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { DevisForm } from "@/components/forms/DevisForm";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Demander un devis",
  description:
    "Décrivez votre événement en quelques clics — pause café, pause déjeuner, cocktail dînatoire ou station street-food. Notre équipe revient vers vous sous 48 h.",
  alternates: { canonical: "/devis" },
};

export default function DevisPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Demander un devis", url: `${SITE_URL}/devis` },
        ]}
      />
      <PageHero
        eyebrow="Devis"
        title="Décrivez votre événement, on revient sous 48 h"
        description="Un seul formulaire pour démarrer. Notre équipe vous rappelle pour préciser le format et vous proposer une offre adaptée."
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/devis", label: "Demander un devis" },
        ]}
      />
      <section className="py-12 md:py-16 bg-cream-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <DevisForm variant="page" />
        </div>
      </section>
    </>
  );
}
