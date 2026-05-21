"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONSENT_KEY, writeConsent, type ConsentChoice } from "@/lib/consent";

export function CookieBanner() {
  const [consent, setConsent] = React.useState<ConsentChoice>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY) as ConsentChoice;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setConsent(saved);
    else {
      const t = window.setTimeout(() => setVisible(true), 600);
      return () => window.clearTimeout(t);
    }
  }, []);

  const save = (value: Exclude<ConsentChoice, null>) => {
    writeConsent(value);
    setConsent(value);
    setVisible(false);
  };

  if (consent !== null && !visible) return null;
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-xl bg-neutral-900 text-cream-50 shadow-xl ring-1 ring-white/10 p-5 md:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
          <Cookie className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2
            id="cookie-banner-title"
            className="font-display text-base font-semibold text-white"
          >
            Cookies & confidentialité
          </h2>
          <p className="mt-1 text-sm text-cream-50/75 leading-relaxed">
            Nous utilisons des cookies strictement nécessaires au
            fonctionnement du site. Avec votre accord, nous utilisons aussi des
            cookies de mesure d&apos;audience (Google Analytics). Consultez
            notre{" "}
            <Link
              href="/politique-confidentialite"
              className="underline hover:text-amber-400"
            >
              politique de confidentialité
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="accent" size="sm" onClick={() => save("all")}>
              Tout accepter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-cream-50/30 text-cream-50 hover:bg-white/10 bg-transparent"
              onClick={() => save("necessary")}
            >
              Refuser les cookies analytiques
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => save("necessary")}
          className="text-cream-50/60 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
