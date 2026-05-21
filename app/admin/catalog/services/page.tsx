import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { loadServices } from "@/lib/catalog-loader";

export const metadata: Metadata = {
  title: "Admin · Services",
  robots: { index: false, follow: false },
};

export default async function AdminServicesList() {
  const services = await loadServices();
  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-8">
        <p className="eyebrow">Catalogue</p>
        <h1 className="display-2 mt-2">Services</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Modifiez le contenu, les options et la grille tarifaire de vos 4
          services. Les changements s&apos;appliquent immédiatement au site
          public.
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/admin/catalog/services/${s.slug}`}
              className="group flex items-start gap-4 rounded-xl bg-background ring-1 ring-border p-5 hover:ring-teal-500/40 transition-all"
            >
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-cream-100">
                {s.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image}
                    alt={s.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">
                    {s.name}
                  </h2>
                  {s.badge && <Badge variant="amber">{s.badge}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {s.tagline}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Min. {s.minGuests} pers. · à partir de {s.startingPriceTND} TND
                </p>
              </div>
              <ArrowRight className="size-4 text-teal-600 mt-2" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
