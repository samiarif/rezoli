"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, Mail, Check } from "lucide-react";

// Brand icons (dropped from lucide v1) — minimal inline SVGs.
const Twitter = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M22 4.01s-1.4.81-2.42 1.09a4.34 4.34 0 0 0-7.49 3.96 12.31 12.31 0 0 1-9-4.57 4.34 4.34 0 0 0 1.34 5.79 4.31 4.31 0 0 1-1.96-.54v.05a4.34 4.34 0 0 0 3.48 4.25 4.36 4.36 0 0 1-1.96.07 4.34 4.34 0 0 0 4.05 3.01 8.69 8.69 0 0 1-5.38 1.86A8.8 8.8 0 0 1 2 19.54a12.27 12.27 0 0 0 6.64 1.95c7.97 0 12.33-6.6 12.33-12.33 0-.19 0-.37-.01-.56A8.81 8.81 0 0 0 23 6.59a8.65 8.65 0 0 1-2.49.68A4.34 4.34 0 0 0 22 4.01z" />
  </svg>
);
const Linkedin = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

type Props = {
  url: string;
  title: string;
  description?: string;
};

export function ShareLinks({ url, title, description }: Props) {
  const [copied, setCopied] = React.useState(false);

  // Resolve absolute URL on the client (in case `url` is relative).
  const absoluteUrl = React.useMemo(() => {
    if (typeof window === "undefined") return url;
    try {
      return new URL(url, window.location.origin).toString();
    } catch {
      return url;
    }
  }, [url]);

  const encoded = encodeURIComponent(absoluteUrl);
  const titleEnc = encodeURIComponent(title);
  const descEnc = encodeURIComponent(description ?? "");

  async function copy() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Lien copié");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier — copiez l'URL manuellement.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">
        Partager
      </span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${titleEnc}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur X (Twitter)"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream-50 ring-1 ring-border hover:ring-teal-500/30 hover:text-teal-700 transition-colors"
      >
        <Twitter className="size-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur LinkedIn"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream-50 ring-1 ring-border hover:ring-teal-500/30 hover:text-teal-700 transition-colors"
      >
        <Linkedin className="size-4" />
      </a>
      <a
        href={`mailto:?subject=${titleEnc}&body=${descEnc}%20${encoded}`}
        aria-label="Partager par email"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream-50 ring-1 ring-border hover:ring-teal-500/30 hover:text-teal-700 transition-colors"
      >
        <Mail className="size-4" />
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label="Copier le lien"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream-50 ring-1 ring-border hover:ring-teal-500/30 hover:text-teal-700 transition-colors"
      >
        {copied ? <Check className="size-4 text-teal-700" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
