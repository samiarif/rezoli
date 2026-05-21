import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostCard } from "./BlogPostCard";
import { listPublishedPosts } from "@/lib/blog";

export async function BlogRecentStrip() {
  const posts = await listPublishedPosts({ take: 3 });
  if (posts.length === 0) return null;

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow">Du blog</p>
            <h2 className="display-2 mt-2 text-balance">
              Conseils & inspirations
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/blog">
              Voir tous les billets <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <li key={p.id}>
              <BlogPostCard post={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
