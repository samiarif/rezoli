"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_CACHE_TAGS } from "@/lib/catalog-loader";

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

export async function updateCategoryMeta(input: unknown) {
  await requireAdmin();
  const data = categoryMetaSchema.parse(input);
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }
  const { prisma } = await import("@/lib/prisma");
  await prisma.eventPackCategory.update({
    where: { slug: data.slug },
    data: {
      name: data.name,
      description: data.description,
      badge: data.badge,
      tagline: data.tagline,
      guestCountConfig: data.guestCountConfig as object,
      order: data.order,
      published: data.published,
    },
  });
  revalidatePath("/nos-packs");
  updateTag(CATALOG_CACHE_TAGS.eventPacks);
  revalidatePath("/admin/catalog/event-packs");
  return { ok: true };
}

const tierSchema = z.object({
  tierId: z.string(),
  badge: z.string().min(1),
  name: z.string().min(2),
  description: z.string().min(2),
  content: z.unknown(),
  price: z.unknown(),
  order: z.coerce.number().int().min(0).default(0),
});

export async function updateTier(input: unknown) {
  await requireAdmin();
  const data = tierSchema.parse(input);
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }
  const { prisma } = await import("@/lib/prisma");
  const tier = await prisma.eventPackTier.update({
    where: { id: data.tierId },
    data: {
      badge: data.badge,
      name: data.name,
      description: data.description,
      content: data.content as object,
      price: data.price as object,
      order: data.order,
    },
    include: { category: true },
  });
  revalidatePath("/nos-packs");
  updateTag(CATALOG_CACHE_TAGS.eventPacks);
  revalidatePath(`/admin/catalog/event-packs/${tier.category.slug}`);
  return { ok: true };
}

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
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }
  const { prisma } = await import("@/lib/prisma");
  const cat = await prisma.eventPackCategory.findUnique({
    where: { slug: data.categorySlug },
  });
  if (!cat) return { ok: false, message: "Catégorie introuvable." };
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
  revalidatePath("/nos-packs");
  updateTag(CATALOG_CACHE_TAGS.eventPacks);
  return { ok: true };
}
