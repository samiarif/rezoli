"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

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
  const { prisma } = await import("@/lib/prisma");
  await prisma.service.update({
    where: { slug: data.slug },
    data: {
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
  return { ok: true };
}

const packSchema = z.object({
  packId: z.string(),
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
  const { prisma } = await import("@/lib/prisma");
  const pack = await prisma.servicePack.update({
    where: { id: data.packId },
    data: {
      name: data.name,
      badgeLabel: data.badgeLabel,
      description: data.description ?? null,
      content: data.content as object,
      order: data.order,
    },
    include: { service: true },
  });
  revalidatePath(`/nos-services/${pack.service.slug}`);
  revalidatePath("/nos-packs");
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
  return { ok: true };
}

const stationSchema = z.object({
  stationId: z.string(),
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
  const { prisma } = await import("@/lib/prisma");
  await prisma.station.update({
    where: { id: data.stationId },
    data: {
      name: data.name,
      description: data.description,
      pricing: data.pricing as object,
      order: data.order,
    },
  });
  revalidatePath("/nos-services/stations-street-food");
  return { ok: true };
}
