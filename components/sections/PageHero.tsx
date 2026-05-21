import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Crumb = { href: string; label: string };

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  variant = "light",
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  variant?: "light" | "dark" | "cream";
  align?: "left" | "center";
  children?: React.ReactNode;
}) {
  const isDark = variant === "dark";
  const isCream = variant === "cream";

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        isDark
          ? "bg-neutral-900 text-cream-50"
          : isCream
          ? "bg-cream-50"
          : "bg-gradient-to-b from-teal-50/60 via-cream-50 to-background"
      )}
    >
      {/* Decorative pattern */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 pattern-dots opacity-40 pointer-events-none",
          isDark && "opacity-15"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl pointer-events-none",
          isDark ? "bg-teal-900/40" : "bg-teal-200/40"
        )}
      />

      <div
        className={cn(
          "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24",
          align === "center" && "text-center"
        )}
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Fil d'Ariane"
            className={cn(
              "mb-6 flex flex-wrap items-center gap-1 text-xs",
              isDark ? "text-cream-50/70" : "text-muted-foreground",
              align === "center" && "justify-center"
            )}
          >
            {breadcrumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3 opacity-50" aria-hidden />}
                {i < breadcrumbs.length - 1 ? (
                  <Link
                    href={c.href}
                    className={cn(
                      "hover:underline transition-colors",
                      isDark ? "hover:text-amber-400" : "hover:text-teal-700"
                    )}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className={cn(isDark ? "text-amber-400" : "text-teal-700", "font-medium")}
                  >
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && (
          <p
            className={cn(
              "eyebrow mb-3",
              isDark && "text-amber-400"
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "display-1 max-w-3xl text-balance",
            isDark ? "text-white" : "text-foreground",
            align === "center" && "mx-auto"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-5 max-w-2xl text-lg leading-relaxed text-pretty",
              isDark ? "text-cream-50/80" : "text-muted-foreground",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        )}
        {children && <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
