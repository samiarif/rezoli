import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterChips({
  options,
  activeValue,
  baseHref,
  param,
  allLabel = "Tous",
}: {
  options: Array<{ value: string; label: string; count?: number }>;
  activeValue?: string;
  baseHref: string;
  param: string;
  allLabel?: string;
}) {
  if (options.length === 0) return null;
  const hrefFor = (value?: string) => {
    if (!value) return baseHref;
    const sp = new URLSearchParams({ [param]: value });
    return `${baseHref}?${sp.toString()}`;
  };
  return (
    <nav aria-label="Filtres" className="flex flex-wrap gap-2 mb-8">
      <Chip href={hrefFor(undefined)} active={!activeValue} label={allLabel} />
      {options.map((o) => (
        <Chip
          key={o.value}
          href={hrefFor(o.value)}
          active={activeValue === o.value}
          label={o.label}
          count={o.count}
        />
      ))}
    </nav>
  );
}

function Chip({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors ring-1",
        active
          ? "bg-teal-700 text-white ring-teal-700"
          : "bg-background text-foreground ring-border hover:ring-teal-500/30"
      )}
    >
      <span>{label}</span>
      {count != null && (
        <span
          className={cn(
            "rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
            active ? "bg-white/20 text-white" : "bg-cream-100 text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
