"use client";

import * as React from "react";
import Script from "next/script";
import { CONSENT_KEY } from "@/lib/consent";

type Props = { measurementId?: string };

/**
 * Loads GA4 (gtag.js) ONLY after the user grants analytics consent.
 * Reactive: listens for the `rezoli:consent` event so toggling consent
 * mid-session immediately takes effect.
 *
 * SAFE WITHOUT GA: if `NEXT_PUBLIC_GA_ID` is missing or invalid, this
 * component renders nothing.
 */
export function GoogleAnalytics({ measurementId }: Props) {
  const id =
    measurementId ?? process.env.NEXT_PUBLIC_GA_ID ?? "";
  const [granted, setGranted] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    const check = () => {
      const v = localStorage.getItem(CONSENT_KEY);
      setGranted(v === "all");
    };
    check();
    const onConsent = () => check();
    window.addEventListener("rezoli:consent", onConsent);
    return () => window.removeEventListener("rezoli:consent", onConsent);
  }, [id]);

  if (!id || !granted) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
