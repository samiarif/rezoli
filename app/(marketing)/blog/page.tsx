import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { FilterChips } from "@/components/ui/filter-chips";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";
import { listPublishedPosts, listPublishedTags } from "@/lib/blog";
import { FileText } from "lucide-react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}): Promise<Metadata> {
  const { tag } = await searchParams;
  return {
    title: tag ? `Blog · ${tag}` : "Blog",
    description: tag
      ? `Tous les billets Rezoli sur le sujet « ${tag} ».`
      : "Le journal Rezoli : tendances, conseils et coulisses du traiteur événementiel en Tunisie.",
    alternates: {
      canonical: tag ? `/blog?tag=${encodeURIComponent(tag)}` : "/blog",
    },
  };
}

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [posts, tags] = await Promise.all([
    listPublishedPosts({ tag, take: 48 }),
    listPublishedTags(),
  ]);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
        ]}
      />
      <PageHero
        eyebrow="Blog"
        title="Le journal Rezoli"
        description="Tendances, conseils pratiques et coulisses de nos événements. Pour les organisateurs et les curieux."
        breadcrumbs={[
          { href: "/", label: "Accueil" },
          { href: "/blog", label: "Blog" },
        ]}
      />
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {tags.length > 0 && (
            <FilterChips
              options={tags}
              activeValue={tag}
              baseHref="/blog"
              param="tag"
            />
          )}
          {posts.length === 0 ? (
            <div className="rounded-2xl bg-cream-50 ring-1 ring-cream-100 p-16 text-center">
              <FileText className="size-12 mx-auto text-teal-600 mb-4" />
              <h2 className="font-display text-2xl font-semibold">
                {tag
                  ? "Aucun billet pour ce tag"
                  : "Aucun billet publié pour l'instant"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {tag
                  ? "Essayez un autre filtre."
                  : "Revenez bientôt — nos premiers articles arrivent."}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p.id}>
                  <BlogPostCard post={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
