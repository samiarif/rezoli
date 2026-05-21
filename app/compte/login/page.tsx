import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { MagicLinkForm } from "@/components/forms/MagicLinkForm";
import { BUSINESS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Espace client",
  robots: { index: false, follow: false },
};

export default async function CompteLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main id="main" className="flex-1 bg-cream-50">
      <div className="mx-auto max-w-md px-4 py-20 md:py-28">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-teal-700 block text-center mb-10"
        >
          {BUSINESS.name}
          <span className="text-neutral-900">.</span>
        </Link>
        <div className="rounded-2xl bg-background p-8 shadow-sm ring-1 ring-border">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <Mail className="size-6 text-teal-700" />
          </div>
          <h1 className="display-2 text-center mt-5">Espace client</h1>
          <p className="text-sm text-center text-muted-foreground mt-2">
            Entrez votre email pour recevoir un lien de connexion sécurisé.
            Aucun mot de passe à retenir.
          </p>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700"
            >
              {decodeURIComponent(error)}
            </p>
          )}
          <div className="mt-6">
            <MagicLinkForm purpose="customer" />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Pas encore client ?{" "}
          <Link href="/nos-services" className="underline hover:text-teal-700">
            Demandez un devis
          </Link>
        </p>
      </div>
    </main>
  );
}
