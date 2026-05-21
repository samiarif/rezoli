"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/utils";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface to Sentry if it's wired (no-op otherwise).
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
    }
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 ring-1 ring-red-200">
          <AlertTriangle className="size-9 text-red-700" />
        </div>
        <p className="eyebrow mt-6">Erreur inattendue</p>
        <h1 className="display-1 mt-2 text-balance">
          Quelque chose s&apos;est mal passé
        </h1>
        <p className="lede mt-4 text-pretty">
          Notre équipe a été notifiée. Vous pouvez réessayer ou nous écrire
          directement.
        </p>
        {error.digest && (
          <p className="mt-3 text-[11px] text-muted-foreground font-mono">
            Code : {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button variant="solid" onClick={reset}>
            <RefreshCw className="size-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
          <Button asChild variant="ghost">
            <a href={`mailto:${BUSINESS.email}`}>
              <Mail className="size-4" />
              Nous écrire
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
