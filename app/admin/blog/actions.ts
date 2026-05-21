"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

const blogPostSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  excerpt: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  content: z.unknown(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export async function createBlogPost(input: { title: string }) {
  const session = await requireAdmin();
  if (!process.env.DATABASE_URL) {
    // Demo mode: open the editor anyway with a placeholder slug.
    redirect("/admin/blog/exemple-billet");
  }
  const { prisma } = await import("@/lib/prisma");
  const title = input.title.trim() || "Nouveau billet";
  const baseSlug = slugify(title) || `billet-${Date.now()}`;
  let slug = baseSlug;
  let i = 1;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
  const post = await prisma.blogPost.create({
    data: {
      slug,
      title,
      content: { type: "doc", content: [] },
      tags: [],
      status: "DRAFT",
      authorId: session.user.id ?? null,
    },
  });
  redirect(`/admin/blog/${post.slug}`);
}

export async function updateBlogPost(input: unknown) {
  await requireAdmin();
  const data = blogPostSchema.parse(input);
  if (!process.env.DATABASE_URL) return { ok: false, message: "DB non configurée." };
  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
  if (!existing) return { ok: false, message: "Billet introuvable." };
  const publishedAt =
    data.status === "PUBLISHED"
      ? existing.publishedAt ?? new Date()
      : data.status === "DRAFT"
      ? null
      : existing.publishedAt;
  await prisma.blogPost.update({
    where: { slug: data.slug },
    data: {
      title: data.title,
      excerpt: data.excerpt ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      content: data.content as object,
      tags: data.tags,
      status: data.status,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      publishedAt,
    },
  });
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { ok: true };
}

export async function deleteBlogPost(slug: string) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) return { ok: false };
  const { prisma } = await import("@/lib/prisma");
  await prisma.blogPost.delete({ where: { slug } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true };
}
