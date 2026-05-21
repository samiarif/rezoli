"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Événement" },
  { n: 2, label: "Formule" },
  { n: 3, label: "Récapitulatif" },
] as const;

type StepN = 1 | 2 | 3;

export function Stepper({
  current,
  doneSteps,
  onJump,
  canGoTo,
}: {
  current: StepN;
  doneSteps: Record<StepN, boolean>;
  onJump: (step: StepN) => void;
  canGoTo: (step: StepN) => boolean;
}) {
  return (
    <ol
      className="mx-auto flex max-w-2xl items-center justify-between gap-2"
      aria-label="Progression"
    >
      {STEPS.map((s, idx) => {
        const sn = s.n as StepN;
        const done = doneSteps[sn];
        const active = current === sn && !done;
        const reachable = canGoTo(sn);
        const Tag = reachable ? "button" : "div";
        return (
          <li key={s.n} className="flex items-center gap-2 flex-1 min-w-0">
            <Tag
              {...(reachable ? { onClick: () => onJump(sn), type: "button" } : {})}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 transition-colors",
                reachable && "hover:opacity-80 cursor-pointer",
                !reachable && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-transparent transition-colors shrink-0",
                  done && "bg-teal-700 text-white",
                  active && "bg-teal-500 text-white ring-teal-200",
                  !done && !active && "bg-cream-100 text-neutral-500"
                )}
              >
                {done ? <Check className="size-4" /> : s.n}
              </span>
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium hidden sm:inline truncate",
                  done
                    ? "text-foreground"
                    : active
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </Tag>
            {idx < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1 transition-colors",
                  done ? "bg-teal-700" : "bg-neutral-200"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
