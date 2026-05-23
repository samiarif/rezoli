"use client";

import { Check, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModalQuestion({
  index,
  total,
  title,
  hint,
  children,
  onPrev,
  onNext,
  nextDisabled,
  nextLabel = "Suivant",
  isLast = false,
}: {
  index: number;
  total: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  isLast?: boolean;
}) {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">
          Étape {index} / {total}
        </p>
        <h3 className="font-display text-xl font-semibold mt-1">{title}</h3>
        {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
      </header>

      <div>{children}</div>

      <footer className="flex items-center justify-between pt-2 border-t border-border">
        {onPrev ? (
          <Button variant="ghost" onClick={onPrev}>
            <ChevronLeft className="size-4" /> Précédent
          </Button>
        ) : (
          <span />
        )}
        <Button
          variant={isLast ? "accent" : "solid"}
          onClick={onNext}
          disabled={nextDisabled}
        >
          {nextLabel}
          {!isLast && <ChevronRight className="size-4" />}
        </Button>
      </footer>
    </div>
  );
}

export function OptionPill({
  label,
  selected,
  onClick,
  multi = true,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm text-left ring-1 transition-all",
        selected
          ? "bg-teal-50 ring-teal-500 text-teal-900 ring-2"
          : "bg-background ring-border hover:ring-teal-500/30"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center transition-colors",
          multi ? "rounded" : "rounded-full",
          selected
            ? "bg-teal-500 text-white"
            : "border-2 border-neutral-300"
        )}
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

export function PillGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>
  );
}

/**
 * Modern, structured recap card for the final step of any customization flow.
 * `rows` is a list of { label, value } pairs; values can be string, string[], or null.
 * Null / empty values render as "Aucun" in muted colour so users see the full picture.
 */
export type RecapRow = {
  label: string;
  value: string | string[] | null | undefined;
};

export function LiveRecap({
  rows,
  intro = "Voici un récapitulatif de vos choix. Validez pour les enregistrer dans votre devis.",
}: {
  rows: RecapRow[];
  intro?: string;
}) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-amber-50 to-cream-50 ring-1 ring-amber-200/70 p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="eyebrow text-amber-700">Récapitulatif</p>
          <p className="text-sm text-neutral-700 mt-0.5">{intro}</p>
        </div>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <RecapItem key={row.label} {...row} />
        ))}
      </dl>
    </div>
  );
}

function RecapItem({ label, value }: RecapRow) {
  const empty =
    value == null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);
  return (
    <div className="rounded-lg bg-white/80 ring-1 ring-amber-200/60 px-4 py-3">
      <dt className="text-[11px] uppercase font-medium tracking-wider text-amber-700">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-snug">
        {empty ? (
          <span className="text-muted-foreground italic">Aucun</span>
        ) : Array.isArray(value) ? (
          <ul className="space-y-0.5">
            {value.map((v) => (
              <li key={v} className="flex gap-1.5">
                <Check className="size-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-neutral-800">{value}</span>
        )}
      </dd>
    </div>
  );
}
