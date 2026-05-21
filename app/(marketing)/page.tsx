import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHero } from "@/components/sections/HomeHero";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { Testimonials } from "@/components/sections/Testimonials";
import { PartnerScroller } from "@/components/sections/PartnerScroller";
import { FAQ } from "@/components/sections/FAQ";
import { CTASection } from "@/components/sections/CTASection";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { faqGeneral } from "@/lib/catalog";
import { loadServices, loadEventPackCategories } from "@/lib/catalog-loader";
import { RealisationFeaturedStrip } from "@/components/realisations/RealisationFeaturedStrip";
import { BlogRecentStrip } from "@/components/blog/BlogRecentStrip";
import { QuoteCalculator } from "@/components/sections/QuoteCalculator";
import { DevisFormSection } from "@/components/forms/DevisFormSection";

export default async function HomePage() {
  const [services, eventPackCategories] = await Promise.all([
    loadServices(),
    loadEventPackCategories(),
  ]);
  return (
    <>
      <FaqJsonLd items={faqGeneral} />
      <HomeHero />
      <ServicesGrid services={services} />
      <QuoteCalculator />
      <ProcessSteps />
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 mx-auto text-center">
            <p className="eyebrow">Solutions clé en main</p>
            <h2 className="display-2 mt-2 text-balance">
              Packs événementiels prêts à commander
            </h2>
            <p className="lede mt-4 text-pretty">
              Soirées du bac, cérémonies universitaires, soutenances — des
              formules tout inclus, avec livraison et service.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {eventPackCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href="/nos-packs"
                  className="group block rounded-xl bg-cream-50 p-6 ring-1 ring-cream-100 hover:ring-teal-500/40 hover:-translate-y-1 transition-all"
                >
                  <p className="eyebrow">{cat.badge}</p>
                  <h3 className="font-display text-xl font-semibold mt-1">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {cat.tagline}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
                    Voir les formules
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Button asChild variant="solid">
              <Link href="/nos-packs">
                Découvrir tous les packs <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <RealisationFeaturedStrip />
      <PartnerScroller />
      <Testimonials />
      <BlogRecentStrip />
      <FAQ />
      <DevisFormSection />
      <CTASection />
    </>
  );
}
