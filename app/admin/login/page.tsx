import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { MagicLinkForm } from "@/components/forms/MagicLinkForm";
import { BUSINESS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin · Connexion",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main id="main" className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-cream-50 block text-center mb-10"
        >
          {BUSINESS.name}
          <span className="text-amber-500">.</span>
        </Link>
        <div className="rounded-2xl bg-background p-8 shadow-xl ring-1 ring-white/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <Lock className="size-6 text-amber-700" />
          </div>
          <h1 className="display-2 text-center mt-5">Admin Rezoli</h1>
          <p className="text-sm text-center text-muted-foreground mt-2">
            Connexion réservée à l&apos;équipe. Entrez votre email pour recevoir
            un lien sécurisé.
          </p>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700"
            >
              {error === "not-authorized"
                ? "Cet email n'est pas autorisé à accéder à l'admin."
                : decodeURIComponent(error)}
            </p>
          )}
          <div className="mt-6">
            <MagicLinkForm purpose="admin" />
          </div>
        </div>
      </div>
    </main>
  );
}
