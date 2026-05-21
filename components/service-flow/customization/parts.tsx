"use client";

import { Check, ChevronRight, ChevronLeft } from "lucide-react";
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
