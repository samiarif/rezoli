import Link from "next/link";
import { Compass, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BUSINESS } from "@/lib/utils";

export const metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-cream-50">
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 ring-1 ring-amber-200">
              <Compass className="size-9 text-amber-700" />
            </div>
            <p className="eyebrow mt-6">Erreur 404</p>
            <h1 className="display-1 mt-2 text-balance">
              Cette page semble s&apos;être perdue
            </h1>
            <p className="lede mt-4 text-pretty">
              Le lien que vous suivez n&apos;existe pas, plus, ou contient une
              coquille. Pas de panique — voici quelques pistes utiles.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button asChild variant="solid">
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  Retour à l&apos;accueil
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/nos-services">Voir les services</Link>
              </Button>
              <Button asChild variant="ghost">
                <a href={`mailto:${BUSINESS.email}`}>
                  <Mail className="size-4" />
                  Nous écrire
                </a>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-sm">
              {[
                { href: "/nos-services", label: "Nos services" },
                { href: "/nos-packs", label: "Nos packs" },
                { href: "/realisations", label: "Réalisations" },
                { href: "/blog", label: "Blog" },
                { href: "/a-propos", label: "À propos" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md bg-background p-4 ring-1 ring-border hover:ring-teal-500/30 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
