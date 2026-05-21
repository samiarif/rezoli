import type { Metadata } from "next";
import { Sparkles, TrendingUp, Handshake } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Devenir partenaire",
  description:
    "Rejoignez l'écosystème Rezoli en tant que fournisseur, lieu événementiel ou chef freelance. Postulez en 3 minutes.",
  alternates: { canonical: "/devenir-partenaire" },
};

const ADVANTAGES = [
  {
    icon: TrendingUp,
    title: "Volume récurrent",
    body: "Nos événements génèrent un flux d'affaires régulier pour nos partenaires.",
  },
  {
    icon: Sparkles,
    title: "Image valorisée",
    body: "Nous mettons en avant nos partenaires sur le site et lors de nos prestations.",
  },
  {
    icon: Handshake,
    title: "Partenariat durable",
    body: "Conditions claires, paiements rapides, communication directe.",
  },
];

export default function DevenirPartenairePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          {
            name: "Devenir partenaire",
            url: `${SITE_URL}/devenir-partenaire`,
          },
        ]}
      />
      <PageHero
        eyebrow="Rejoignez-nous"
        title="Travaillons ensemble"
        description="Restaurateurs, fournisseurs locaux, lieux d'événements ou chefs freelances : nous cherchons des partenaires aussi exigeants que nous."
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/devenir-partenaire", label: "Devenir partenaire" },
        ]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
            {ADVANTAGES.map((a) => {
              const Icon = a.icon;
              return (
                <li
                  key={a.title}
                  className="rounded-xl bg-cream-50 p-6 ring-1 ring-cream-100"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {a.body}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mx-auto max-w-3xl rounded-2xl bg-background p-6 sm:p-10 ring-1 ring-border shadow-sm">
            <h2 className="font-display text-2xl font-semibold mb-1">
              Votre candidature
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Tous les champs marqués d&apos;un astérisque sont obligatoires.
            </p>
            <PartnerForm />
          </div>
        </div>
      </section>
    </>
  );
}
