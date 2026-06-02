import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadAdminEventPackCategories } from "@/lib/catalog-loader";

export const metadata: Metadata = {
  title: "Admin · Packs événementiels",
  robots: { index: false, follow: false },
};

// Admin lists must reflect mutations immediately — never statically cached.
export const dynamic = "force-dynamic";

export default async function AdminEventPacksList() {
  const cats = await loadAdminEventPackCategories();
  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="display-2 mt-2">Packs événementiels</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Gérez les catégories de packs (Soirée Bac, Cérémonies, Soutenance) et
            leurs formules.
          </p>
        </div>
        <Button asChild variant="solid" size="sm">
          <Link href="/admin/catalog/event-packs/new">
            <Plus className="size-4" /> Nouveau pack
          </Link>
        </Button>
      </header>
      <ul className="grid gap-4 md:grid-cols-2">
        {cats.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/admin/catalog/event-packs/${c.slug}`}
              className="group flex items-start gap-4 rounded-xl bg-background ring-1 ring-border p-5 hover:ring-teal-500/40 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="eyebrow">{c.badge}</p>
                  {!c.published && (
                    <span className="text-[10px] font-medium uppercase tracking-wider rounded bg-amber-500/15 text-amber-700 px-1.5 py-0.5">
                      Brouillon
                    </span>
                  )}
                </div>
                <h2 className="font-display text-lg font-semibold mt-1">
                  {c.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {c.tagline}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {c.tierCount} formules · {c.optionCount} option(s)
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
