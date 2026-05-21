import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ShoppingBasket, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { partners } from "@/lib/catalog";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nos partenaires",
  description:
    "Hôtels, fournisseurs, lieux d'événements : découvrez l'écosystème qui soutient chaque événement Rezoli.",
  alternates: { canonical: "/nos-partenaires" },
};

const CATEGORIES = {
  client: { label: "Clients", icon: Building2, color: "bg-teal-50 text-teal-700" },
  venue: { label: "Lieux", icon: Sparkles, color: "bg-amber-50 text-amber-700" },
  supplier: { label: "Fournisseurs", icon: ShoppingBasket, color: "bg-rose-50 text-rose-700" },
} as const;

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
        description="Nous travaillons main dans la main avec les meilleurs hôtels, fournisseurs locaux et lieux d'événements de Tunisie."
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((cat) => {
            const info = CATEGORIES[cat];
            const Icon = info.icon;
            const list = partners.filter((p) => p.category === cat);
            return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${info.color}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <h2 className="font-display text-2xl font-semibold">
                    {info.label}
                  </h2>
                  <Badge variant="neutral">{list.length}</Badge>
                </div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {list.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-center h-20 rounded-xl bg-background ring-1 ring-border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <span className="font-display text-base font-semibold text-neutral-700 text-center px-3">
                        {p.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <CTASection
        title="Vous voulez rejoindre notre écosystème ?"
        description="Restaurateurs, fournisseurs, lieux ou freelances : nous sommes toujours à l'écoute des bons profils."
      />
    </>
  );
}
