import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventPackCategoryForm } from "@/components/admin/EventPackCategoryForm";
import { EventPackTiersEditor } from "@/components/admin/EventPackTiersEditor";
import { EventPackOptionsEditor } from "@/components/admin/EventPackOptionsEditor";
import { loadEventPackCategory } from "@/lib/catalog-loader";

export const metadata: Metadata = {
  title: "Admin · Modifier le pack",
  robots: { index: false, follow: false },
};

export default async function AdminEventPackEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catMeta = await loadEventPackCategory(slug);
  if (!catMeta) notFound();

  // Try DB; fall back to code catalog so the form is browseable.
  let tierRows: Array<{
    id: string;
    tierKey: string;
    badge: string;
    name: string;
    description: string;
    content: never;
    price: never;
    order: number;
  }> = [];
  let optionRows: Array<{
    optionKey: string;
    name: string;
    description: string | null;
    priceHT: number;
  }> = [];

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const cat = await prisma.eventPackCategory.findUnique({
        where: { slug },
        include: {
          tiers: { orderBy: { order: "asc" } },
          options: { orderBy: { order: "asc" } },
        },
      });
      if (cat) {
        tierRows = cat.tiers.map((t) => ({
          id: t.id,
          tierKey: t.tierKey,
          badge: t.badge,
          name: t.name,
          description: t.description,
          content: (t.content ?? {}) as never,
          price: (t.price ?? { kind: "fixed", ht: 0 }) as never,
          order: t.order,
        }));
        optionRows = cat.options.map((o) => ({
          optionKey: o.optionKey,
          name: o.name,
          description: o.description,
          priceHT: Number(o.priceHT),
        }));
      }
    } catch {
      /* fall through */
    }
  }

  if (tierRows.length === 0) {
    // Demo fallback from code catalog
    tierRows = catMeta.tiers.map((t, i) => ({
      id: `demo-${slug}-${t.id}`,
      tierKey: t.id,
      badge: t.badge,
      name: t.name,
      description: t.description,
      content: t.content as never,
      price: t.price as never,
      order: i,
    }));
  }
  if (optionRows.length === 0) {
    optionRows = catMeta.options.map((o) => ({
      optionKey: o.id,
      name: o.name,
      description: o.description ?? null,
      priceHT: o.priceHT,
    }));
  }

  return (
    <div className="px-6 sm:px-10 py-8 space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/catalog/event-packs">
          <ArrowLeft className="size-4" /> Retour aux packs
        </Link>
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Catalogue · Pack événementiel</p>
          <h1 className="display-2 mt-1">{catMeta.name}</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/nos-packs" target="_blank" rel="noopener noreferrer">
            Voir /nos-packs <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </header>

      <EventPackCategoryForm
        initial={{
          slug: catMeta.slug,
          name: catMeta.name,
          description: catMeta.description,
          badge: catMeta.badge,
          tagline: catMeta.tagline,
          guestCountConfig: catMeta.guestCount as never,
          order: 0,
          published: true,
        }}
      />

      <EventPackTiersEditor tiers={tierRows} />

      <EventPackOptionsEditor categorySlug={slug} initial={optionRows} />
    </div>
  );
}
