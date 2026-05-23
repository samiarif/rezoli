import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { ServicePartners } from "@/components/sections/ServicePartners";
import { ServiceQuoteFlow } from "@/components/service-flow/ServiceQuoteFlow";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";
import {
  loadServices,
  loadServiceBySlug,
  loadServicePacks,
  loadStations,
  loadCustomOptions,
} from "@/lib/catalog-loader";
import { loadBlockedDates } from "@/lib/availability";
import type { ServiceSlug } from "@/lib/service-catalog";

export async function generateStaticParams() {
  const services = await loadServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const svc = await loadServiceBySlug(slug);
  if (!svc) return { title: "Service introuvable" };
  return {
    title: svc.name,
    description: svc.description,
    alternates: { canonical: `/nos-services/${svc.slug}` },
    openGraph: {
      title: `${svc.name} — Rezoli`,
      description: svc.description,
      images: [{ url: svc.image, alt: svc.imageAlt }],
    },
  };
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ formule?: string }>;
}) {
  const { slug } = await params;
  const svc = await loadServiceBySlug(slug);
  if (!svc) notFound();

  const { formule } = await searchParams;

  const serviceSlug = svc.slug as ServiceSlug;
  const [packs, stations, customOptions, blockedDates] = await Promise.all([
    loadServicePacks(serviceSlug),
    serviceSlug === "stations-street-food" ? loadStations() : Promise.resolve([]),
    loadCustomOptions(serviceSlug),
    loadBlockedDates(),
  ]);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Nos services", url: `${SITE_URL}/nos-services` },
          { name: svc.name, url: `${SITE_URL}/nos-services/${svc.slug}` },
        ]}
      />
      <ServiceJsonLd
        name={svc.name}
        description={svc.description}
        url={`${SITE_URL}/nos-services/${svc.slug}`}
        startingPrice={svc.startingPriceTND}
      />

      <PageHero
        eyebrow={svc.tagline}
        title={svc.name}
        description={svc.longDescription}
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/nos-services", label: "Nos services" },
          { href: `/nos-services/${svc.slug}`, label: svc.shortName },
        ]}
      />

      <ServiceQuoteFlow
        service={serviceSlug}
        meta={svc}
        packs={packs}
        stations={stations}
        customOptions={customOptions}
        blockedDates={blockedDates}
        preselectFormula={formule}
      />

      <ServicePartners service={serviceSlug} />
    </>
  );
}
