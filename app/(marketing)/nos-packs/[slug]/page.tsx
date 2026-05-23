import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";
import { loadEventPackCategory } from "@/lib/catalog-loader";
import { PackQuoteFlow } from "@/components/event-packs/PackQuoteFlow";

/**
 * Dedicated landing page per event-pack category.
 * Renders a 3-step quote flow (Événement → Formule → Récapitulatif) mirroring
 * the structure of /nos-services/[slug] for consistency.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadEventPackCategory(slug);
  if (!category) return { title: "Pack introuvable" };
  return {
    title: `${category.name} — Pack Événement tout inclus`,
    description: category.tagline,
    alternates: { canonical: `/nos-packs/${category.slug}` },
    openGraph: {
      title: category.name,
      description: category.tagline,
    },
  };
}

export async function generateStaticParams() {
  return [
    { slug: "soutenance" },
    { slug: "soiree-bac" },
    { slug: "fetes-fin-annee" },
  ];
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await loadEventPackCategory(slug);
  if (!category) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Packs Événements", url: `${SITE_URL}/nos-packs` },
          { name: category.name, url: `${SITE_URL}/nos-packs/${category.slug}` },
        ]}
      />
      <PageHero
        eyebrow={category.badge}
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/nos-packs", label: "Packs Événements" },
          { href: `/nos-packs/${category.slug}`, label: category.name },
        ]}
      />

      <PackQuoteFlow category={category} />
    </>
  );
}
