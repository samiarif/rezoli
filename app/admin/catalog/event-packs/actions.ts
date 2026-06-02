"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_CACHE_TAGS } from "@/lib/catalog-loader";
import { slugify } from "@/lib/slugify";

const noDb = { ok: false as const, message: "Base de données non configurée." };

/** Invalidate every surface that renders event packs. */
function revalidatePacks(slug?: string) {
  revalidatePath("/nos-packs");
  if (slug) revalidatePath(`/nos-packs/${slug}`);
  updateTag(CATALOG_CACHE_TAGS.eventPacks);
  revalidatePath("/admin/catalog/event-packs");
  if (slug) revalidatePath(`/admin/catalog/event-packs/${slug}`);
}

/**
 * Seed-on-demand. The public loader switches wholesale from the code catalog to
 * the DB the moment ANY published category row exists — so a partially
 * populated table would make the un-materialized packs vanish from /nos-packs.
 * The first mutation therefore materializes the ENTIRE code catalog (category +
 * tiers + options) in one shot. Idempotent: no-op once anything exists.
 */
async function ensureSeeded() {
  const { prisma } = await import("@/lib/prisma");
  const count = await prisma.eventPackCategory.count();
  if (count > 0) return;
  const { eventPackCategories } = await import("@/lib/event-packs-catalog");
  for (const [i, c] of eventPackCategories.entries()) {
    await prisma.eventPackCategory.create({
      data: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        badge: c.badge,
        tagline: c.tagline,
        guestCountConfig: c.guestCount as object,
        order: i,
        published: true,
        tiers: {
          create: c.tiers.map((t, ti) => ({
            tierKey: t.id,
            badge: t.badge,
            name: t.name,
            description: t.description,
            content: t.content as object,
            price: t.price as object,
            order: ti,
          })),
        },
        options: {
          create: c.options.map((o, oi) => ({
            optionKey: o.id,
            name: o.name,
            description: o.description ?? null,
            priceHT: o.priceHT,
            order: oi,
          })),
        },
      },
    });
  }
}

/* ─── Category meta ─────────────────────────────────────────────────── */

const categoryMetaSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  description: z.string().min(2),
  badge: z.string().min(1),
  tagline: z.string().min(2),
  guestCountConfig: z.unknown(),
  order: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(true),
});

/** Edit an existing category (upsert by slug — materializes if not seeded). */
export async function updateCategoryMeta(input: unknown) {
  await requireAdmin();
  const data = categoryMetaSchema.parse(input);
  if (!process.env.DATABASE_URL) return noDb;
  await ensureSeeded();
  const { prisma } = await import("@/lib/prisma");
  const meta = {
    name: data.name,
    description: data.description,
    badge: data.badge,
    tagline: data.tagline,
    guestCountConfig: data.guestCountConfig as object,
    order: data.order,
    published: data.published,
  };
  await prisma.eventPackCategory.upsert({
    where: { slug: data.slug },
    update: meta,
    create: { slug: data.slug, ...meta },
  });
  revalidatePacks(data.slug);
  return { ok: true as const };
}

const createCategorySchema = categoryMetaSchema.extend({
  slug: z.string().optional(),
  published: z.coerce.boolean().default(false),
});

/** Create a brand-new category. Rejects if the slug is already taken. */
export async function createCategory(input: unknown) {
  await requireAdmin();
  const data = createCategorySchema.parse(input);
  const slug = slugify(data.slug || data.name);
  if (slug.length < 2) {
    return { ok: false as const, message: "Slug invalide (trop court)." };
  }
  if (!process.env.DATABASE_URL) return noDb;
  await ensureSeeded();
  const { prisma } = await import("@/lib/prisma");
  const exists = await prisma.eventPackCategory.findUnique({ where: { slug } });
  if (exists) {
    return { ok: false as const, message: "Un pack avec ce slug existe déjà." };
  }
  await prisma.eventPackCategory.create({
    data: {
      slug,
      name: data.name,
      description: data.description,
      badge: data.badge,
      tagline: data.tagline,
      guestCountConfig: data.guestCountConfig as object,
      order: data.order,
      published: data.published,
    },
  });
  revalidatePacks(slug);
  return { ok: true as const, slug };
}

/** Delete a category. Cascade removes its tiers + options (quotes snapshot
 * pack data as strings, so existing quotes are unaffected). */
export async function deleteCategory(slug: string) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) return noDb;
  await ensureSeeded();
  const { prisma } = await import("@/lib/prisma");
  await prisma.eventPackCategory.deleteMany({ where: { slug } });
  revalidatePacks(slug);
  return { ok: true as const };
}

/* ─── Tiers (formules) ──────────────────────────────────────────────── */

const tierSchema = z.object({
  categorySlug: z.string().min(2),
  tierKey: z.string().min(1),
  badge: z.string().min(1),
  name: z.string().min(2),
  description: z.string().min(2),
  content: z.unknown(),
  price: z.unknown(),
  order: z.coerce.number().int().min(0).default(0),
});

/** Edit a formule (upsert by [category, tierKey] — materializes if not seeded). */
export async function updateTier(input: unknown) {
  await requireAdmin();
  const data = tierSchema.parse(input);
  if (!process.env.DATABASE_URL) return noDb;
  await ensureSeeded();
  const { prisma } = await import("@/lib/prisma");
  const cat = await prisma.eventPackCategory.findUnique({
    where: { slug: data.categorySlug },
  });
  if (!cat) return { ok: false as const, message: "Catégorie introuvable." };
  const fields = {
    badge: data.badge,
    name: data.name,
    description: data.description,
    content: data.content as object,
    price: data.price as object,
    order: data.order,
  };
  await prisma.eventPackTier.upsert({
    where: { categoryId_tierKey: { categoryId: cat.id, tierKey: data.tierKey } },
    update: fields,
    create: { categoryId: cat.id, tierKey: data.tierKey, ...fields },
  });
  revalidatePacks(data.categorySlug);
  return { ok: true as const };
}

/** Append a blank formule to a category; returns its generated tierKey. */
export async function createTier(categorySlug: string) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) return noDb;
  await ensureSeeded();
  const { prisma } = await import("@/lib/prisma");
  const cat = await prisma.eventPackCategory.findUnique({
    where: { slug: categorySlug },
    include: { tiers: true },
  });
  if (!cat) return { ok: false as const, message: "Catégorie introuvable." };
  const keys = new Set(cat.tiers.map((t) => t.tierKey));
  let tierKey = "formule";
  let n = 1;
  while (keys.has(tierKey)) tierKey = `formule-${++n}`;
  await prisma.eventPackTier.create({
    data: {
      categoryId: cat.id,
      tierKey,
      badge: "Formule",
      name: "Nouvelle formule",
      description: "Description de la formule.",
      content: {},
      price: { kind: "fixed", ht: 0 },
      order: cat.tiers.length,
    },
  });
  revalidatePacks(categorySlug);
  return { ok: true as const, tierKey };
}

/** Delete a single formule from a category. */
export async function deleteTier(categorySlug: string, tierKey: string) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) return noDb;
  await ensureSeeded();
  const { prisma } = await import("@/lib/prisma");
  const cat = await prisma.eventPackCategory.findUnique({
    where: { slug: categorySlug },
  });
  if (!cat) return { ok: false as const, message: "Catégorie introuvable." };
  await prisma.eventPackTier.deleteMany({
    where: { categoryId: cat.id, tierKey },
  });
  revalidatePacks(categorySlug);
  return { ok: true as const };
}

/* ─── Options ───────────────────────────────────────────────────────── */

const optionsSchema = z.object({
  categorySlug: z.string(),
  options: z.array(
    z.object({
      optionKey: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      priceHT: z.coerce.number().min(0),
    })
  ),
});

export async function replaceOptions(input: unknown) {
  await requireAdmin();
  const data = optionsSchema.parse(input);
  if (!process.env.DATABASE_URL) return noDb;
  await ensureSeeded();
  const { prisma } = await import("@/lib/prisma");
  const cat = await prisma.eventPackCategory.findUnique({
    where: { slug: data.categorySlug },
  });
  if (!cat) return { ok: false as const, message: "Catégorie introuvable." };
  await prisma.eventPackOption.deleteMany({ where: { categoryId: cat.id } });
  for (const [i, o] of data.options.entries()) {
    await prisma.eventPackOption.create({
      data: {
        categoryId: cat.id,
        optionKey: o.optionKey,
        name: o.name,
        description: o.description ?? null,
        priceHT: o.priceHT,
        order: i,
      },
    });
  }
  revalidatePacks(data.categorySlug);
  return { ok: true as const };
}
