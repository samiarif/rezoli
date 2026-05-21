import type { Metadata } from "next";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";

export const metadata: Metadata = {
  title: "Admin · Modifier le billet",
  robots: { index: false, follow: false },
};

const DEMO_INITIAL = (slug: string) => ({
  slug,
  title: "Exemple de billet (mode démo)",
  excerpt:
    "Ceci est un billet de démonstration. Modifiez le contenu, ajoutez une image, testez l'éditeur — les changements ne sont pas sauvegardés sans base de données.",
  coverImageUrl: null,
  content: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Bienvenue dans l'éditeur Rezoli. Essayez chaque outil de la barre — titres, gras, italique, listes, citations, liens, images.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Un titre de section" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Le contenu est stocké en JSON TipTap et rendu côté serveur en HTML pour les pages publiques.",
          },
        ],
      },
    ],
  },
  tags: ["démo"],
  status: "DRAFT" as const,
  seoTitle: null,
  seoDescription: null,
});

async function loadPost(slug: string) {
  if (!process.env.DATABASE_URL) {
    const { DEMO_BLOG_POSTS } = await import("@/lib/demo-fixtures");
    return DEMO_BLOG_POSTS.find((p) => p.slug === slug) ?? null;
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.blogPost.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export default async function AdminBlogEdit({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await loadPost(slug);

  const initial = post
    ? {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverImageUrl: post.coverImageUrl,
        content: post.content,
        tags: post.tags,
        status: post.status,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
      }
    : DEMO_INITIAL(slug);

  return <BlogPostEditor initial={initial} />;
}
