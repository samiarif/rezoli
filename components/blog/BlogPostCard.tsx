import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";
import type { BlogPostSummary } from "@/lib/blog";

export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="block h-full rounded-xl overflow-hidden bg-background ring-1 ring-border shadow-xs hover:ring-teal-500/30 hover:-translate-y-1 hover:shadow-md transition-all"
      >
        <div className="relative aspect-[16/9] bg-cream-100 overflow-hidden">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover img-warm transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-teal-50 via-cream-50 to-cream-100">
              <Newspaper
                className="size-8 text-teal-600/45 transition-transform duration-500 group-hover:scale-110"
                aria-hidden
              />
              <span className="font-display text-sm font-semibold tracking-wide text-teal-700/55">
                Rezoli
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {post.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="neutral" className="text-[10px]">
                {t}
              </Badge>
            ))}
            {post.publishedAt && (
              <span className="text-xs text-muted-foreground">
                {formatDateFr(post.publishedAt)}
              </span>
            )}
          </div>
          <h3 className="font-display text-xl font-semibold leading-tight text-balance">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
            Lire la suite{" "}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
