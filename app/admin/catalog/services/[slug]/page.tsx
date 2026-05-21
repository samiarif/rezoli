import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceMetaForm } from "@/components/admin/ServiceMetaForm";
import { ServicePacksEditor } from "@/components/admin/ServicePacksEditor";
import { CustomOptionsEditor } from "@/components/admin/CustomOptionsEditor";
import { StationsEditor } from "@/components/admin/StationsEditor";
import { loadServiceBySlug, loadCustomOptions } from "@/lib/catalog-loader";
import {
  cocktailPacks,
  cafePacks,
  dejeunerPacks,
  streetfoodStations,
  type ServiceSlug,
} from "@/lib/service-catalog";

export const metadata: Metadata = {
  title: "Admin · Modifier le service",
  robots: { index: false, follow: false },
};

export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const svcMeta = await loadServiceBySlug(slug);
  if (!svcMeta) notFound();

  let dbPacks: Array<{
    id: string;
    packKey: string;
    name: string;
    badgeLabel: string;
    description: string | null;
    content: Record<string, unknown>;
    order: number;
  }> = [];
  let dbStations: Array<{
    id: string;
    stationKey: string;
    name: string;
    description: string;
    pricing: never;
    order: number;
  }> = [];
  let needsFallback = true;

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const dbService = await prisma.service.findUnique({
        where: { slug },
        include: {
          packs: { orderBy: { order: "asc" } },
          stations: { orderBy: { order: "asc" } },
        },
      });
      if (dbService) {
        dbPacks = dbService.packs.map((p) => ({
          id: p.id,
          packKey: p.packKey,
          name: p.name,
          badgeLabel: p.badgeLabel,
          description: p.description,
          content: (p.content ?? {}) as Record<string, unknown>,
          order: p.order,
        }));
        dbStations = dbService.stations.map((s) => ({
          id: s.id,
          stationKey: s.stationKey,
          name: s.name,
          description: s.description,
          pricing: (s.pricing ?? { prix: [0, 0] }) as never,
          order: s.order,
        }));
        needsFallback = false;
      }
    } catch {
      /* fall through */
    }
  }

  if (needsFallback) {
    // Synthesize editor rows from the code catalog so the UI is browseable.
    if (slug === "cocktails-dinatoires") {
      dbPacks = cocktailPacks.map((p, i) => ({
        id: `demo-${p.id}`,
        packKey: p.id,
        name: p.name,
        badgeLabel: p.badgeLabel,
        description: null,
        content: {
          boissons: p.boissons,
          sale: p.sale,
          sucre: p.sucre,
          nbSale: p.nbSale,
          nbSucre: p.nbSucre,
          prix: p.prix,
        },
        order: i,
      }));
    } else if (slug === "pauses-cafe") {
      dbPacks = cafePacks.map((p, i) => ({
        id: `demo-${p.id}`,
        packKey: p.id,
        name: p.name,
        badgeLabel: p.badgeLabel,
        description: null,
        content: {
          boissons: p.boissons,
          sale: p.sale,
          sucre: p.sucre,
          prixSans: p.prixSans,
          prixAvec: p.prixAvec,
        },
        order: i,
      }));
    } else if (slug === "pauses-dejeuner") {
      dbPacks = dejeunerPacks.map((p, i) => ({
        id: `demo-${p.id}`,
        packKey: p.id,
        name: p.name,
        badgeLabel: p.badgeLabel,
        description: null,
        content: {
          entree: p.entree,
          plat: p.plat,
          dessert: p.dessert,
          boisson: p.boisson,
          lbPrix: p.lbPrix,
          tblPrix: p.tblPrix,
        },
        order: i,
      }));
    } else if (slug === "stations-street-food") {
      dbStations = streetfoodStations.map((s, i) => ({
        id: `demo-${s.id}`,
        stationKey: s.id,
        name: s.name,
        description: s.description,
        pricing: {
          prix: s.prix,
          variants: s.variants,
          multiVariant: s.multiVariant,
        } as never,
        order: i,
      }));
    }
  }

  const customOptions = await loadCustomOptions(slug as ServiceSlug);

  const kind =
    slug === "cocktails-dinatoires"
      ? "cocktails"
      : slug === "pauses-cafe"
      ? "cafe"
      : slug === "pauses-dejeuner"
      ? "dejeuner"
      : null;

  return (
    <div className="px-6 sm:px-10 py-8 space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/catalog/services">
          <ArrowLeft className="size-4" /> Retour aux services
        </Link>
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Catalogue · Service</p>
          <h1 className="display-2 mt-1">{svcMeta.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            /nos-services/{svcMeta.slug}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link
            href={`/nos-services/${svcMeta.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Voir la page publique <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </header>

      <ServiceMetaForm service={svcMeta} />

      {kind && (
        <>
          <ServicePacksEditor kind={kind} packs={dbPacks} />
          <CustomOptionsEditor serviceSlug={slug} initial={customOptions} />
        </>
      )}

      {slug === "stations-street-food" && <StationsEditor stations={dbStations} />}
    </div>
  );
}
