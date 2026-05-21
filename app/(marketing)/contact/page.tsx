import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { BUSINESS, SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Une question, un projet ? Échangeons. Réponse garantie sous 24 heures ouvrées.",
  alternates: { canonical: "/contact" },
};

const CONTACT_BLOCKS = [
  {
    icon: Mail,
    label: "Email",
    value: BUSINESS.email,
    href: `mailto:${BUSINESS.email}`,
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: BUSINESS.phoneDisplay,
    href: `tel:${BUSINESS.phone.replace(/\s/g, "")}`,
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: `${BUSINESS.address.locality}, ${BUSINESS.address.region}`,
  },
  {
    icon: Clock,
    label: "Horaires",
    value: "Lun–Ven 9h–18h",
  },
];

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Contact", url: `${SITE_URL}/contact` },
        ]}
      />
      <PageHero
        eyebrow="Parlons-nous"
        title="Une question ? Un projet ?"
        description="Notre équipe revient vers vous sous 24 heures ouvrées, avec un premier diagnostic et une proposition personnalisée."
        variant="dark"
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/contact", label: "Contact" },
        ]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <aside className="lg:col-span-1 space-y-3">
              {CONTACT_BLOCKS.map((b) => {
                const Icon = b.icon;
                const content = (
                  <div className="flex items-start gap-3 rounded-xl bg-cream-50 p-5 ring-1 ring-cream-100 hover:ring-teal-500/30 transition-colors">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {b.label}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {b.value}
                      </p>
                    </div>
                  </div>
                );
                return b.href ? (
                  <a key={b.label} href={b.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={b.label}>{content}</div>
                );
              })}
            </aside>
            <div className="lg:col-span-2 rounded-2xl bg-background p-6 sm:p-8 ring-1 ring-border shadow-sm">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
