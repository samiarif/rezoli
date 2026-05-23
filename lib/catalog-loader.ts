/**
 * Catalog loaders: DB-first, with code-catalog fallback when DATABASE_URL is
 * missing or the table is empty. The returned shapes mirror the in-code types
 * so existing UI components keep working.
 *
 * Each public loader is wrapped with `unstable_cache` (tagged) at the bottom of
 * the file so repeated calls within the same request — and across requests —
 * hit the Next.js Data Cache. Admin mutations should call `revalidateTag()`
 * with the matching tag to invalidate, in addition to the existing
 * `revalidatePath()` calls.
 */
import "server-only";
import { unstable_cache } from "next/cache";

import type {
  ServiceMeta,
  CocktailPack,
  CafePack,
  DejeunerPack,
  StreetfoodStation,
  ServiceSlug,
} from "./service-catalog";
import type { PackCategory } from "./event-packs-catalog";

/**
 * Cache tags — call `revalidateTag(tag)` from server actions when the
 * underlying data changes (in addition to revalidatePath).
 */
export const CATALOG_CACHE_TAGS = {
  services: "catalog:services",
  packs: "catalog:packs",
  stations: "catalog:stations",
  customOptions: "catalog:custom-options",
  eventPacks: "catalog:event-packs",
} as const;

const CATALOG_REVALIDATE_SECONDS = 300; // 5 minutes — catalog is near-static

/* ─── Services ─────────────────────────────────────────────────────── */

async function _loadServices(): Promise<ServiceMeta[]> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("./prisma");
      const rows = await prisma.service.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      });
      if (rows.length) {
        const { services: codeServices } = await import("./service-catalog");
        return rows.map((r) => {
          const code = codeServices.find((s) => s.slug === r.slug);
          return {
            slug: r.slug as ServiceSlug,
            name: r.name,
            shortName: r.shortName,
            tagline: r.tagline,
            description: r.description,
            longDescription: r.longDescription,
            // icon resolved from slug client-side; pass undefined for serialization safety
            icon: undefined as unknown as ServiceMeta["icon"],
            image: r.imageUrl ?? code?.image ?? "",
            imageAlt: r.imageAlt ?? code?.imageAlt ?? "",
            highlights: r.highlights,
            minGuests: r.minGuests,
            startingPriceTND: Number(r.startingPriceTND),
            badge: r.badge ?? undefined,
          };
        });
      }
    } catch (err) {
      console.error("[catalog-loader] services DB load failed", err);
    }
  }
  // Fallback to code (icons are kept for server-side use, but when this is
  // passed to a client component we strip them at the call site).
  const { services } = await import("./service-catalog");
  return services.map((s) => ({ ...s, icon: undefined as unknown as ServiceMeta["icon"] }));
}

export const loadServices = unstable_cache(_loadServices, ["catalog:services"], {
  tags: [CATALOG_CACHE_TAGS.services],
  revalidate: CATALOG_REVALIDATE_SECONDS,
});

export async function loadServiceBySlug(
  slug: string
): Promise<ServiceMeta | undefined> {
  const list = await loadServices();
  return list.find((s) => s.slug === slug);
}

/* ─── Packs ────────────────────────────────────────────────────────── */

type AnyPack = CocktailPack | CafePack | DejeunerPack;

async function _loadServicePacks(slug: ServiceSlug): Promise<AnyPack[]> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("./prisma");
      const service = await prisma.service.findUnique({
        where: { slug },
        include: { packs: { orderBy: { order: "asc" } } },
      });
      if (service?.packs.length) {
        return service.packs.map((p) => {
          const content = (p.content ?? {}) as Record<string, unknown>;
          return {
            id: p.packKey,
            name: p.name,
            badgeLabel: p.badgeLabel,
            ...content,
          };
        }) as unknown as AnyPack[];
      }
    } catch (err) {
      console.error("[catalog-loader] packs DB load failed", err);
    }
  }
  // Fallback
  if (slug === "cocktails-dinatoires") {
    const { cocktailPacks } = await import("./service-catalog");
    return cocktailPacks;
  }
  if (slug === "pauses-cafe") {
    const { cafePacks } = await import("./service-catalog");
    return cafePacks;
  }
  if (slug === "pauses-dejeuner") {
    const { dejeunerPacks } = await import("./service-catalog");
    return dejeunerPacks;
  }
  return [];
}

export const loadServicePacks = unstable_cache(
  _loadServicePacks,
  ["catalog:packs"],
  { tags: [CATALOG_CACHE_TAGS.packs], revalidate: CATALOG_REVALIDATE_SECONDS }
);

/* ─── Stations (street-food) ───────────────────────────────────────── */

async function _loadStations(): Promise<StreetfoodStation[]> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("./prisma");
      const service = await prisma.service.findUnique({
        where: { slug: "stations-street-food" },
        include: { stations: { orderBy: { order: "asc" } } },
      });
      if (service?.stations.length) {
        return service.stations.map((st) => {
          const p = (st.pricing ?? {}) as Record<string, unknown>;
          return {
            id: st.stationKey,
            name: st.name,
            description: st.description,
            prix: (p.prix as [number, number]) ?? [0, 0],
            variants: p.variants as StreetfoodStation["variants"],
            multiVariant: p.multiVariant as boolean | undefined,
          };
        });
      }
    } catch (err) {
      console.error("[catalog-loader] stations DB load failed", err);
    }
  }
  const { streetfoodStations } = await import("./service-catalog");
  return streetfoodStations;
}

export const loadStations = unstable_cache(_loadStations, ["catalog:stations"], {
  tags: [CATALOG_CACHE_TAGS.stations],
  revalidate: CATALOG_REVALIDATE_SECONDS,
});

/* ─── Custom options ───────────────────────────────────────────────── */

async function _loadCustomOptions(
  slug: ServiceSlug
): Promise<{ boissons: string[]; sale: string[]; sucre: string[] }> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("./prisma");
      const service = await prisma.service.findUnique({
        where: { slug },
        include: { customOptions: { orderBy: { order: "asc" } } },
      });
      if (service?.customOptions.length) {
        const out = { boissons: [] as string[], sale: [] as string[], sucre: [] as string[] };
        for (const o of service.customOptions) {
          const key = o.category as "boissons" | "sale" | "sucre";
          if (key in out) out[key].push(o.label);
        }
        return out;
      }
    } catch (err) {
      console.error("[catalog-loader] custom options DB load failed", err);
    }
  }
  if (slug === "cocktails-dinatoires") {
    const { cocktailCustomOptions } = await import("./service-catalog");
    return cocktailCustomOptions;
  }
  if (slug === "pauses-cafe") {
    const { cafeCustomOptions } = await import("./service-catalog");
    return cafeCustomOptions;
  }
  if (slug === "pauses-dejeuner") {
    const { dejeunerOptions } = await import("./service-catalog");
    return { boissons: dejeunerOptions.boissons, sale: [], sucre: [] };
  }
  return { boissons: [], sale: [], sucre: [] };
}

export const loadCustomOptions = unstable_cache(
  _loadCustomOptions,
  ["catalog:custom-options"],
  {
    tags: [CATALOG_CACHE_TAGS.customOptions],
    revalidate: CATALOG_REVALIDATE_SECONDS,
  }
);

/* ─── Event packs ──────────────────────────────────────────────────── */

async function _loadEventPackCategories(): Promise<PackCategory[]> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("./prisma");
      const rows = await prisma.eventPackCategory.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        include: {
          tiers: { orderBy: { order: "asc" } },
          options: { orderBy: { order: "asc" } },
        },
      });
      if (rows.length) {
        return rows.map((r) => ({
          slug: r.slug as PackCategory["slug"],
          name: r.name,
          description: r.description,
          badge: r.badge,
          tagline: r.tagline,
          guestCount: r.guestCountConfig as PackCategory["guestCount"],
          tiers: r.tiers.map((t) => ({
            id: t.tierKey as PackCategory["tiers"][number]["id"],
            badge: t.badge,
            name: t.name,
            description: t.description,
            content: t.content as PackCategory["tiers"][number]["content"],
            price: t.price as PackCategory["tiers"][number]["price"],
          })),
          options: r.options.map((o) => ({
            id: o.optionKey,
            name: o.name,
            description: o.description ?? undefined,
            priceHT: Number(o.priceHT),
          })),
        }));
      }
    } catch (err) {
      console.error("[catalog-loader] event packs DB load failed", err);
    }
  }
  const { eventPackCategories } = await import("./event-packs-catalog");
  return eventPackCategories;
}

export const loadEventPackCategories = unstable_cache(
  _loadEventPackCategories,
  ["catalog:event-packs"],
  {
    tags: [CATALOG_CACHE_TAGS.eventPacks],
    revalidate: CATALOG_REVALIDATE_SECONDS,
  }
);

export async function loadEventPackCategory(
  slug: string
): Promise<PackCategory | undefined> {
  const list = await loadEventPackCategories();
  return list.find((c) => c.slug === slug);
}
