import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadEventPackCategories } from "@/lib/catalog-loader";

export const metadata: Metadata = {
  title: "Admin · Packs événementiels",
  robots: { index: false, follow: false },
};

export default async function AdminEventPacksList() {
  const cats = await loadEventPackCategories();
  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-8">
        <p className="eyebrow">Catalogue</p>
        <h1 className="display-2 mt-2">Packs événementiels</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Gérez les catégories de packs (Soirée Bac, Cérémonies, Soutenance) et
          leurs formules.
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2">
        {cats.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/admin/catalog/event-packs/${c.slug}`}
              className="group flex items-start gap-4 rounded-xl bg-background ring-1 ring-border p-5 hover:ring-teal-500/40 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="eyebrow">{c.badge}</p>
                <h2 className="font-display text-lg font-semibold mt-1">
                  {c.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {c.tagline}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {c.tiers.length} formules · {c.options.length} option(s)
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
