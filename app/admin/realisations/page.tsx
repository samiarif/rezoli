import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";
import { createRealisation } from "./actions";

export const metadata: Metadata = {
  title: "Admin · Réalisations",
  robots: { index: false, follow: false },
};

const STATUS_LABEL = { DRAFT: "Brouillon", PUBLISHED: "Publié" } as const;
const STATUS_VARIANT = { DRAFT: "neutral", PUBLISHED: "success" } as const;

export default async function AdminRealisationsList() {
  const rows = await load();

  async function create() {
    "use server";
    await createRealisation({ title: "Nouvelle réalisation" });
  }

  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="eyebrow">Contenu</p>
          <h1 className="display-2 mt-2">Réalisations</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {rows.length} fiche{rows.length > 1 ? "s" : ""}.
          </p>
        </div>
        <form action={create}>
          <Button type="submit" variant="accent">
            <Plus className="size-4" /> Nouvelle réalisation
          </Button>
        </form>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl bg-background ring-1 ring-border p-12 text-center">
          <FolderOpen className="size-10 mx-auto text-teal-600 mb-3" />
          <p className="font-display text-lg">Aucune réalisation.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/realisations/${r.slug}`}
                className="block rounded-xl overflow-hidden bg-background ring-1 ring-border shadow-xs hover:ring-teal-500/30 transition-all"
              >
                <div className="relative aspect-[4/3] bg-cream-100">
                  {r.heroImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.heroImageUrl}
                      alt={r.heroImageAlt ?? r.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  {r.featured && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[10px] text-white">
                      <Star className="size-3 fill-current" /> Featured
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant={STATUS_VARIANT[r.status]}>
                      {STATUS_LABEL[r.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {r.date ? formatDateFr(r.date) : "Date à définir"}
                    </span>
                  </div>
                  <h2 className="font-display text-base font-semibold leading-tight line-clamp-2">
                    {r.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.eventType}
                    {r.clientName ? ` · ${r.clientName}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function load() {
  if (!process.env.DATABASE_URL) {
    const { DEMO_REALISATIONS } = await import("@/lib/demo-fixtures");
    return [...DEMO_REALISATIONS].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }
  const { prisma } = await import("@/lib/prisma");
  return prisma.realisation.findMany({
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: 200,
  });
}
