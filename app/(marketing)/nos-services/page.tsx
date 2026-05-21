import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTASection } from "@/components/sections/CTASection";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";
import { loadServices } from "@/lib/catalog-loader";

export const metadata: Metadata = {
  title: "Nos services traiteur",
  description:
    "Cocktails dînatoires, pauses café, pauses déjeuner et stations street-food : découvrez nos quatre expertises pour vos événements professionnels.",
  alternates: { canonical: "/nos-services" },
};

export default async function ServicesPage() {
  const services = await loadServices();
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Nos services", url: `${SITE_URL}/nos-services` },
        ]}
      />
      <PageHero
        eyebrow="Expertises"
        title="Quatre façons de faire vivre vos événements"
        description="De la pause matinale au grand cocktail, chaque formule est pensée pour s'adapter à vos invités, votre budget et votre image de marque."
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/nos-services", label: "Nos services" },
        ]}
      />
      <ServicesGrid
        heading="Tous nos services en un coup d'œil"
        eyebrow="Catalogue"
        description="Quatre formules complémentaires, déclinables et personnalisables."
        services={services}
      />
      <ProcessSteps />
      <Testimonials />
      <FAQ />
      <CTASection />
    </>
  );
}
