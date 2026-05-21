import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Award, Users, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/PageHero";
import { AboutTimeline } from "@/components/sections/AboutTimeline";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTASection } from "@/components/sections/CTASection";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Rezoli, c'est l'histoire d'une passion pour la gastronomie événementielle en Tunisie. Découvrez notre équipe, nos valeurs et notre méthode.",
  alternates: { canonical: "/a-propos" },
};

const VALUES = [
  {
    icon: Heart,
    title: "Passion du goût",
    body: "Chaque bouchée est pensée comme une signature. Nos chefs sélectionnent les meilleurs produits locaux pour vous offrir une expérience mémorable.",
  },
  {
    icon: Award,
    title: "Excellence du service",
    body: "Une équipe formée, ponctuelle, à l'écoute. Du devis au dernier verre servi, nous gardons un standard élevé sans concession.",
  },
  {
    icon: Users,
    title: "Sur-mesure",
    body: "Pas de menus pré-fabriqués. Chaque événement est unique, votre prestation aussi : nous adaptons saveurs, formats et services à votre image.",
  },
  {
    icon: Leaf,
    title: "Produits responsables",
    body: "Nous privilégions les circuits courts, le bio quand c'est possible, et nous minimisons les déchets avec une logistique pensée pour l'environnement.",
  },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "À propos", url: `${SITE_URL}/a-propos` },
        ]}
      />
      <PageHero
        eyebrow="Notre histoire"
        title="L'organisation culinaire réinventée"
        description="Né d'une équipe de passionnés de gastronomie et d'événementiel, Rezoli accompagne les entreprises tunisiennes dans leurs moments les plus importants."
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/a-propos", label: "À propos" },
        ]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-border shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"
                alt="Équipe de chefs en cuisine"
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="eyebrow">Notre mission</p>
              <h2 className="display-2 mt-2 text-balance">
                Simplifier chaque événement culinaire
              </h2>
              <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Nous avons créé Rezoli pour répondre à un problème concret :
                  organiser un événement gastronomique en Tunisie impliquait des
                  dizaines d&apos;appels, de devis et de prestataires différents.
                  Nous avons centralisé tout ça en une seule plateforme.
                </p>
                <p>
                  Notre mission est d&apos;offrir une expérience sans friction —
                  de la sélection des formules à l&apos;installation le jour J —
                  pour que vous puissiez vous concentrer sur ce qui compte
                  vraiment.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild variant="solid" size="lg">
                  <Link href="/nos-services">
                    Préparer mon événement
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-24 bg-cream-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">Valeurs</p>
            <h2 className="display-2 mt-2 text-balance">
              Ce qui guide notre travail
            </h2>
          </div>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <li
                  key={v.title}
                  className="rounded-xl bg-background p-6 ring-1 ring-border"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {v.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <AboutTimeline />
      <Testimonials />
      <CTASection />
    </>
  );
}
