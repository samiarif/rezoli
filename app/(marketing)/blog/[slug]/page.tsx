import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShareLinks } from "@/components/ui/share-links";
import { BreadcrumbJsonLd, ArticleJsonLd } from "@/components/seo/JsonLd";
import { TipTapRender } from "@/lib/tiptap-render";
import { SITE_URL, formatDateFr } from "@/lib/utils";
import { getPostBySlug } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") return { title: "Billet introuvable" };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const authorName =
    post.author?.firstName && post.author?.lastName
      ? `${post.author.firstName} ${post.author.lastName}`
      : null;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
        ]}
      />
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        url={`${SITE_URL}/blog/${post.slug}`}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        authorName={authorName}
        coverImageUrl={post.coverImageUrl}
      />

      <article className="bg-background">
        <header className="bg-gradient-to-b from-teal-50/40 to-background pt-12 pb-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-teal-700 mb-6"
            >
              <ArrowLeft className="size-3.5" /> Tous les billets
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="neutral">
                  {t}
                </Badge>
              ))}
              {post.publishedAt && (
                <span className="text-xs text-muted-foreground">
                  {formatDateFr(post.publishedAt)}
                </span>
              )}
              {authorName && (
                <span className="text-xs text-muted-foreground">
                  · par {authorName}
                </span>
              )}
            </div>
            <h1 className="display-1 text-balance">{post.title}</h1>
            {post.excerpt && (
              <p className="lede mt-5 text-pretty">{post.excerpt}</p>
            )}
          </div>
        </header>

        {post.coverImageUrl && (
          <div className="relative aspect-[21/9] w-full mb-12 bg-cream-100">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority
              sizes="(min-width:1280px) 1280px, 100vw"
              className="object-cover img-warm-strong"
            />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-20">
          <TipTapRender doc={post.content as object} />
          <div className="mt-12 pt-8 border-t border-border">
            <ShareLinks
              url={`/blog/${post.slug}`}
              title={post.title}
              description={post.excerpt ?? undefined}
            />
          </div>
        </div>
      </article>
    </>
  );
}
