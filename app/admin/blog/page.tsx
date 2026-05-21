import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/blog";
import { createBlogPost } from "./actions";

export const metadata: Metadata = {
  title: "Admin · Blog",
  robots: { index: false, follow: false },
};

const STATUS_VARIANT = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  ARCHIVED: "neutral",
} as const;

export default async function AdminBlogList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const posts = await load(status);

  async function newPost() {
    "use server";
    await createBlogPost({ title: "Nouveau billet" });
  }

  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="eyebrow">Contenu</p>
          <h1 className="display-2 mt-2">Blog</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {posts.length} billet{posts.length > 1 ? "s" : ""}.
          </p>
        </div>
        <form action={newPost}>
          <Button type="submit" variant="accent">
            <Plus className="size-4" /> Nouveau billet
          </Button>
        </form>
      </header>

      <nav className="flex flex-wrap gap-2 mb-6 text-sm" aria-label="Filtres">
        <FilterLink current={status} value={undefined} label="Tous" />
        <FilterLink current={status} value="DRAFT" label="Brouillons" />
        <FilterLink current={status} value="PUBLISHED" label="Publiés" />
        <FilterLink current={status} value="ARCHIVED" label="Archivés" />
      </nav>

      {posts.length === 0 ? (
        <div className="rounded-xl bg-background ring-1 ring-border p-12 text-center">
          <FileText className="size-10 mx-auto text-teal-600 mb-3" />
          <p className="font-display text-lg">Aucun billet.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-background ring-1 ring-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Titre</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Auteur</th>
                <th className="text-left px-4 py-3">Publié le</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-cream-50/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/blog/${p.slug}`}
                      className="font-medium hover:text-teal-700"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[p.status as keyof typeof STATUS_VARIANT]}>
                      {STATUS_LABEL[p.status as keyof typeof STATUS_LABEL]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs">{p.authorName ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.publishedAt ? formatDateFr(p.publishedAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blog/${p.slug}`}
                      className="text-xs text-teal-700 hover:underline"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterLink({
  current,
  value,
  label,
}: {
  current?: string;
  value?: string;
  label: string;
}) {
  const href = value
    ? `/admin/blog?status=${value}`
    : "/admin/blog";
  const active = current === value;
  return (
    <Link
      href={href}
      className={
        "rounded-full px-3 py-1.5 ring-1 transition-colors " +
        (active
          ? "bg-teal-700 text-white ring-teal-700"
          : "bg-background ring-border hover:ring-teal-500/30")
      }
    >
      {label}
    </Link>
  );
}

async function load(status?: string) {
  if (!process.env.DATABASE_URL) {
    const { DEMO_BLOG_POSTS } = await import("@/lib/demo-fixtures");
    let rows = [...DEMO_BLOG_POSTS];
    if (status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      rows = rows.filter((r) => r.status === status);
    }
    rows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      publishedAt: r.publishedAt,
      authorName:
        r.author?.firstName && r.author.lastName
          ? `${r.author.firstName} ${r.author.lastName}`
          : r.author?.email ?? null,
    }));
  }
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.blogPost.findMany({
    where: status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)
      ? { status: status as never }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { author: true },
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    status: r.status,
    publishedAt: r.publishedAt,
    authorName:
      r.author?.firstName && r.author.lastName
        ? `${r.author.firstName} ${r.author.lastName}`
        : r.author?.email ?? null,
  }));
}
