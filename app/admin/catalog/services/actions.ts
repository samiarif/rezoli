"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_CACHE_TAGS } from "@/lib/catalog-loader";

/** Invalidate all catalog-related caches in one shot. `updateTag` is the
 *  Server-Action-scoped Next 16 helper that gives read-your-own-writes
 *  semantics — preferred over `revalidateTag` here. */
function revalidateAllCatalog() {
  updateTag(CATALOG_CACHE_TAGS.services);
  updateTag(CATALOG_CACHE_TAGS.packs);
  updateTag(CATALOG_CACHE_TAGS.stations);
  updateTag(CATALOG_CACHE_TAGS.customOptions);
}

/** Materialize the entire services catalog to the DB on first mutation.
 *  Idempotent: no-op if any Service row already exists.
 *  This mirrors prisma/seed.ts but runs inside the app at mutation time,
 *  preventing P2025 "record not found" errors when the DB was never seeded. */
async function ensureServicesSeeded() {
  if (!process.env.DATABASE_URL) return;
  const { prisma } = await import("@/lib/prisma");
  const count = await prisma.service.count();
  if (count > 0) return;

  const {
    services: codeServices,
    cocktailPacks,
    cafePacks,
    dejeunerPacks,
    streetfoodStations,
  } = await import("@/lib/service-catalog");

  // 1. Upsert the 4 service rows
  for (const [i, s] of codeServices.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        name: s.name,
        shortName: s.shortName,
        tagline: s.tagline,
        description: s.description,
        longDescription: s.longDescription,
        highlights: s.highlights,
        minGuests: s.minGuests,
        startingPriceTND: s.startingPriceTND,
        badge: s.badge ?? null,
        imageUrl: s.image,
        imageAlt: s.imageAlt,
        order: i,
        published: true,
      },
      update: {},
    });
  }

  const cocktail = await prisma.service.findUniqueOrThrow({ where: { slug: "cocktails-dinatoires" } });
  const cafe = await prisma.service.findUniqueOrThrow({ where: { slug: "pauses-cafe" } });
  const dejeuner = await prisma.service.findUniqueOrThrow({ where: { slug: "pauses-dejeuner" } });
  const streetfood = await prisma.service.findUniqueOrThrow({ where: { slug: "stations-street-food" } });

  // 2. Upsert cocktail packs
  for (const [i, p] of cocktailPacks.entries()) {
    await prisma.servicePack.upsert({
      where: { serviceId_packKey: { serviceId: cocktail.id, packKey: p.id } },
      create: {
        serviceId: cocktail.id,
        packKey: p.id,
        name: p.name,
        badgeLabel: p.badgeLabel,
        order: i,
        content: {
          boissons: p.boissons,
          sale: p.sale,
          sucre: p.sucre,
          nbSale: p.nbSale,
          nbSucre: p.nbSucre,
          prix: p.prix,
        },
      },
      update: {},
    });
  }

  // 3. Upsert café packs
  for (const [i, p] of cafePacks.entries()) {
    await prisma.servicePack.upsert({
      where: { serviceId_packKey: { serviceId: cafe.id, packKey: p.id } },
      create: {
        serviceId: cafe.id,
        packKey: p.id,
        name: p.name,
        badgeLabel: p.badgeLabel,
        order: i,
        content: {
          boissons: p.boissons,
          sale: p.sale,
          sucre: p.sucre,
          prixSans: p.prixSans,
          prixAvec: p.prixAvec,
        },
      },
      update: {},
    });
  }

  // 4. Upsert déjeuner packs
  for (const [i, p] of dejeunerPacks.entries()) {
    await prisma.servicePack.upsert({
      where: { serviceId_packKey: { serviceId: dejeuner.id, packKey: p.id } },
      create: {
        serviceId: dejeuner.id,
        packKey: p.id,
        name: p.name,
        badgeLabel: p.badgeLabel,
        order: i,
        content: {
          entree: p.entree,
          plat: p.plat,
          dessert: p.dessert,
          boisson: p.boisson,
          lbPrix: p.lbPrix,
          tblPrix: p.tblPrix,
        },
      },
      update: {},
    });
  }

  // 5. Upsert street-food stations
  for (const [i, st] of streetfoodStations.entries()) {
    await prisma.station.upsert({
      where: { serviceId_stationKey: { serviceId: streetfood.id, stationKey: st.id } },
      create: {
        serviceId: streetfood.id,
        stationKey: st.id,
        name: st.name,
        description: st.description,
        order: i,
        pricing: {
          prix: st.prix,
          variants: st.variants,
          multiVariant: st.multiVariant,
        },
      },
      update: {},
    });
  }
}

const serviceMetaSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  shortName: z.string().min(2),
  tagline: z.string().min(2),
  description: z.string().min(2),
  longDescription: z.string().min(2),
  highlights: z.array(z.string()).default([]),
  minGuests: z.coerce.number().int().min(1),
  startingPriceTND: z.coerce.number().min(0),
  badge: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  imageAlt: z.string().optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(true),
});

export async function updateServiceMeta(input: unknown) {
  await requireAdmin();
  const data = serviceMetaSchema.parse(input);
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }
  await ensureServicesSeeded();
  const { prisma } = await import("@/lib/prisma");
  // Upsert by natural key (slug) so this works whether or not the DB was pre-seeded.
  await prisma.service.upsert({
    where: { slug: data.slug },
    create: {
      slug: data.slug,
      name: data.name,
      shortName: data.shortName,
      tagline: data.tagline,
      description: data.description,
      longDescription: data.longDescription,
      highlights: data.highlights,
      minGuests: data.minGuests,
      startingPriceTND: data.startingPriceTND,
      badge: data.badge ?? null,
      imageUrl: data.imageUrl ?? null,
      imageAlt: data.imageAlt ?? null,
      order: data.order,
      published: data.published,
    },
    update: {
      name: data.name,
      shortName: data.shortName,
      tagline: data.tagline,
      description: data.description,
      longDescription: data.longDescription,
      highlights: data.highlights,
      minGuests: data.minGuests,
      startingPriceTND: data.startingPriceTND,
      badge: data.badge ?? null,
      imageUrl: data.imageUrl ?? null,
      imageAlt: data.imageAlt ?? null,
      order: data.order,
      published: data.published,
    },
  });
  revalidatePath("/nos-services");
  revalidatePath(`/nos-services/${data.slug}`);
  revalidatePath("/admin/catalog/services");
  revalidateAllCatalog();
  return { ok: true };
}

const packSchema = z.object({
  packId: z.string(),          // kept for backwards-compat (may be "demo-xxx")
  serviceSlug: z.string(),     // slug of the parent service
  packKey: z.string(),         // natural key (e.g. "essentielle")
  name: z.string().min(2),
  badgeLabel: z.string().min(1),
  description: z.string().optional().nullable(),
  // service-specific content is free-form JSON, validated at the public-facing UI
  content: z.unknown(),
  order: z.coerce.number().int().min(0).default(0),
});

export async function updateServicePack(input: unknown) {
  await requireAdmin();
  const data = packSchema.parse(input);
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }
  await ensureServicesSeeded();
  const { prisma } = await import("@/lib/prisma");
  // Upsert by natural key [serviceId, packKey] — safe even with "demo-xxx" packIds.
  const service = await prisma.service.findUniqueOrThrow({ where: { slug: data.serviceSlug } });
  await prisma.servicePack.upsert({
    where: { serviceId_packKey: { serviceId: service.id, packKey: data.packKey } },
    create: {
      serviceId: service.id,
      packKey: data.packKey,
      name: data.name,
      badgeLabel: data.badgeLabel,
      description: data.description ?? null,
      content: data.content as object,
      order: data.order,
    },
    update: {
      name: data.name,
      badgeLabel: data.badgeLabel,
      description: data.description ?? null,
      content: data.content as object,
      order: data.order,
    },
  });
  revalidatePath(`/nos-services/${data.serviceSlug}`);
  revalidatePath("/nos-packs");
  updateTag(CATALOG_CACHE_TAGS.packs);
  return { ok: true };
}

const customOptionsSchema = z.object({
  serviceSlug: z.string(),
  category: z.enum(["boissons", "sale", "sucre"]),
  labels: z.array(z.string().min(1)),
});

export async function replaceCustomOptions(input: unknown) {
  await requireAdmin();
  const data = customOptionsSchema.parse(input);
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }
  await ensureServicesSeeded();
  const { prisma } = await import("@/lib/prisma");
  const service = await prisma.service.findUnique({
    where: { slug: data.serviceSlug },
  });
  if (!service) return { ok: false, message: "Service introuvable." };
  await prisma.serviceCustomOption.deleteMany({
    where: { serviceId: service.id, category: data.category },
  });
  for (const [i, label] of data.labels.entries()) {
    await prisma.serviceCustomOption.create({
      data: {
        serviceId: service.id,
        category: data.category,
        label,
        order: i,
      },
    });
  }
  revalidatePath(`/nos-services/${data.serviceSlug}`);
  updateTag(CATALOG_CACHE_TAGS.customOptions);
  return { ok: true };
}

const stationSchema = z.object({
  stationId: z.string(),       // kept for backwards-compat (may be "demo-xxx")
  serviceSlug: z.string(),     // slug of the parent service
  stationKey: z.string(),      // natural key (e.g. "fricasse")
  name: z.string().min(1),
  description: z.string().min(1),
  pricing: z.unknown(),
  order: z.coerce.number().int().min(0).default(0),
});

export async function updateStation(input: unknown) {
  await requireAdmin();
  const data = stationSchema.parse(input);
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }
  await ensureServicesSeeded();
  const { prisma } = await import("@/lib/prisma");
  // Upsert by natural key [serviceId, stationKey] — safe even with "demo-xxx" stationIds.
  const service = await prisma.service.findUniqueOrThrow({ where: { slug: data.serviceSlug } });
  await prisma.station.upsert({
    where: { serviceId_stationKey: { serviceId: service.id, stationKey: data.stationKey } },
    create: {
      serviceId: service.id,
      stationKey: data.stationKey,
      name: data.name,
      description: data.description,
      pricing: data.pricing as object,
      order: data.order,
    },
    update: {
      name: data.name,
      description: data.description,
      pricing: data.pricing as object,
      order: data.order,
    },
  });
  revalidatePath("/nos-services/stations-street-food");
  updateTag(CATALOG_CACHE_TAGS.stations);
  return { ok: true };
}
