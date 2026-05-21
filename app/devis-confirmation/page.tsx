import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Home, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BUSINESS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Demande envoyée",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const reference = ref ?? "—";

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-cream-50">
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-background ring-1 ring-border shadow-sm p-10 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 ring-1 ring-teal-100">
                <CheckCircle2
                  className="size-10 text-teal-600"
                  strokeWidth={1.5}
                />
              </div>
              <p className="eyebrow mt-6">Merci !</p>
              <h1 className="display-2 mt-2 text-balance">
                Votre demande est envoyée
              </h1>
              <p className="lede mt-4">
                Notre équipe revient vers vous sous 24 heures ouvrées avec une
                proposition personnalisée.
              </p>
              <p className="mt-3 text-sm font-medium text-teal-700">
                Vous recevrez un email de la part de notre équipe dans les 48 h.
              </p>

              <div className="mt-8 inline-block rounded-xl bg-cream-50 p-5 ring-1 ring-cream-100">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Référence
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-teal-700">
                  {reference}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <Button asChild variant="solid">
                  <Link href="/">
                    <Home className="size-4" /> Retour à l&apos;accueil
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${BUSINESS.email}`}>
                    <Mail className="size-4" /> {BUSINESS.email}
                  </a>
                </Button>
                <Button asChild variant="ghost">
                  <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>
                    <Phone className="size-4" /> {BUSINESS.phoneDisplay}
                  </a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-8">
                Conservez votre référence pour faciliter les échanges avec
                notre équipe.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
