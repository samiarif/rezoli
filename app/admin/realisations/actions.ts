"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

const outcomeSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const testimonialSchema = z.object({
  author: z.string().min(1),
  role: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  content: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
});

const realisationSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  eventType: z.string().min(2),
  clientName: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  guestCount: z.coerce.number().int().min(0).optional().nullable(),
  heroImageUrl: z.string().optional().nullable(),
  heroImageAlt: z.string().optional().nullable(),
  gallery: z.array(z.string()).default([]),
  shortPitch: z.string().min(2),
  longContent: z.unknown().nullable(),
  outcomes: z.array(outcomeSchema).nullable(),
  testimonial: testimonialSchema.nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.coerce.boolean().default(false),
  order: z.coerce.number().int().min(0).default(0),
});

export async function createRealisation(input: { title: string }) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) {
    redirect("/admin/realisations/exemple-realisation");
  }
  const { prisma } = await import("@/lib/prisma");
  const title = input.title.trim() || "Nouvelle réalisation";
  const baseSlug = slugify(title) || `realisation-${Date.now()}`;
  let slug = baseSlug;
  let i = 1;
  while (await prisma.realisation.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
  const r = await prisma.realisation.create({
    data: {
      slug,
      title,
      eventType: "Cocktail dînatoire",
      shortPitch: "Décrivez l'événement en quelques mots…",
      gallery: [],
      status: "DRAFT",
    },
  });
  redirect(`/admin/realisations/${r.slug}`);
}

export async function updateRealisation(input: unknown) {
  await requireAdmin();
  const data = realisationSchema.parse(input);
  if (!process.env.DATABASE_URL) return { ok: false };
  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.realisation.findUnique({ where: { slug: data.slug } });
  if (!existing) return { ok: false, message: "Réalisation introuvable." };
  const publishedAt =
    data.status === "PUBLISHED"
      ? existing.publishedAt ?? new Date()
      : null;
  await prisma.realisation.update({
    where: { slug: data.slug },
    data: {
      title: data.title,
      eventType: data.eventType,
      clientName: data.clientName ?? null,
      date: data.date ? new Date(data.date) : null,
      location: data.location ?? null,
      guestCount: data.guestCount ?? null,
      heroImageUrl: data.heroImageUrl ?? null,
      heroImageAlt: data.heroImageAlt ?? null,
      gallery: data.gallery,
      shortPitch: data.shortPitch,
      longContent: (data.longContent ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      outcomes: data.outcomes
        ? (data.outcomes as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      testimonial: data.testimonial
        ? (data.testimonial as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      status: data.status,
      featured: data.featured,
      order: data.order,
      publishedAt,
    },
  });
  revalidatePath(`/realisations/${data.slug}`);
  revalidatePath("/realisations");
  revalidatePath("/admin/realisations");
  return { ok: true };
}

export async function deleteRealisation(slug: string) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) return { ok: false };
  const { prisma } = await import("@/lib/prisma");
  await prisma.realisation.delete({ where: { slug } });
  revalidatePath("/admin/realisations");
  revalidatePath("/realisations");
  return { ok: true };
}
