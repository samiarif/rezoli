import Image from "next/image";
import { Handshake } from "lucide-react";
import { partnersForService } from "@/lib/catalog";
import type { ServiceSlug } from "@/lib/service-catalog";

/**
 * "Enseignes partenaires" block surfaced at the bottom of each /nos-services/[slug]
 * page. Renders text capsules by default; if a partner has a `logo` path, the
 * capsule shows the logo image instead.
 */
export function ServicePartners({
  service,
  title = "Enseignes partenaires",
  subtitle,
}: {
  service: ServiceSlug;
  title?: string;
  subtitle?: string;
}) {
  const list = partnersForService(service);
  if (list.length === 0) return null;

  const fallbackSubtitle = subtitlesByService[service] ?? subtitle;

  return (
    <section className="py-12 md:py-16 border-t border-border bg-cream-50/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="flex items-start gap-4 mb-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Handshake className="size-5" />
          </span>
          <div>
            <p className="eyebrow">Notre écosystème</p>
            <h2 className="font-display text-2xl font-semibold mt-1">
              {title}
            </h2>
            {fallbackSubtitle && (
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {fallbackSubtitle}
              </p>
            )}
          </div>
        </header>

        <ul className="flex flex-wrap gap-3">
          {list.map((p) => (
            <li
              key={p.id}
              className="inline-flex items-center gap-2.5 rounded-full bg-background ring-1 ring-border px-4 py-2.5 shadow-xs hover:ring-teal-500/40 hover:-translate-y-0.5 transition-all"
            >
              <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
              {p.logo ? (
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={120}
                  height={32}
                  className="h-6 w-auto"
                />
              ) : (
                <span className="font-display text-sm font-medium text-neutral-800">
                  {p.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const subtitlesByService: Record<ServiceSlug, string> = {
  "cocktails-dinatoires":
    "Une sélection d'enseignes de qualité pour vos cocktails dînatoires.",
  "pauses-cafe":
    "Nos partenaires gourmands pour vos pauses café et événements pro.",
  "pauses-dejeuner":
    "Traiteurs et chefs partenaires pour vos déjeuners d'entreprise.",
  "stations-street-food":
    "Une sélection d'enseignes de qualité pour vos stations street-food.",
};
