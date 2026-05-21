import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";
import { loadEventPackCategory } from "@/lib/catalog-loader";
import { PackCapsule } from "@/components/event-packs/PackCapsule";

/**
 * Dedicated landing page per event-pack category. Lands the user directly on
 * the right capsule pre-expanded — ideal for QR codes on flyers and posters
 * (e.g. `https://rezoli.tn/nos-packs/soutenance`).
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
    title: `${category.name} — Pack tout inclus`,
    description: category.tagline,
    alternates: { canonical: `/nos-packs/${category.slug}` },
    openGraph: {
      title: category.name,
      description: category.tagline,
    },
  };
}

export async function generateStaticParams() {
  // Pre-render the 3 dedicated pack landing pages at build time
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
          { name: "Nos packs", url: `${SITE_URL}/nos-packs` },
          { name: category.name, url: `${SITE_URL}/nos-packs/${category.slug}` },
        ]}
      />
      <PageHero
        eyebrow={category.badge}
        title={category.name}
        description={category.tagline}
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/nos-packs", label: "Nos packs" },
          { href: `/nos-packs/${category.slug}`, label: category.name },
        ]}
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/nos-packs">
                <ArrowLeft className="size-4" /> Voir tous les packs
              </Link>
            </Button>
          </div>

          <PackCapsule category={category} defaultOpen />

          <p className="mt-10 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            Tous les prix sont indicatifs et hors taxes. Le devis final sera
            établi par notre équipe selon votre demande exacte.
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}
