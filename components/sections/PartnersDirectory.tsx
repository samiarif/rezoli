"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  partners,
  PARTNER_CATEGORIES,
  type PartnerCategory,
} from "@/lib/catalog";

type Filter = "all" | PartnerCategory;

export function PartnersDirectory() {
  const [filter, setFilter] = React.useState<Filter>("all");

  const visible =
    filter === "all"
      ? partners
      : partners.filter((p) => p.category === filter);

  // Only show category chips that actually have partners.
  const availableCategories = PARTNER_CATEGORIES.filter((c) =>
    partners.some((p) => p.category === c.id)
  );

  return (
    <div>
      {/* Filter chips */}
      <div
        role="tablist"
        aria-label="Filtrer les partenaires par catégorie"
        className="flex flex-wrap justify-center gap-2 mb-10"
      >
        <FilterChip
          label="Tous"
          count={partners.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {availableCategories.map((c) => (
          <FilterChip
            key={c.id}
            label={c.label}
            count={partners.filter((p) => p.category === c.id).length}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
          />
        ))}
      </div>

      {/* Grid */}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((p) => (
          <li
            key={p.id}
            className="group flex flex-col items-center justify-center gap-3 h-32 rounded-xl bg-background ring-1 ring-border shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:ring-teal-500/30 transition-all px-4 py-3"
          >
            {p.logo ? (
              <>
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={180}
                  height={80}
                  className="max-h-14 w-auto object-contain"
                />
                <span className="text-xs font-medium text-neutral-700 text-center line-clamp-1">
                  {p.name}
                </span>
              </>
            ) : (
              <span className="font-display text-base font-semibold text-neutral-800 text-center">
                {p.name}
              </span>
            )}
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">
          Aucun partenaire dans cette catégorie pour le moment.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-all",
        active
          ? "bg-teal-600 text-white ring-teal-600 shadow-sm"
          : "bg-background text-neutral-700 ring-border hover:ring-teal-500/40 hover:text-teal-700"
      )}
    >
      {label}
      <span
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums",
          active ? "bg-white/20 text-white" : "bg-cream-100 text-neutral-600"
        )}
      >
        {count}
      </span>
    </button>
  );
}
