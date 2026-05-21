"use client";

import * as React from "react";
import {
  ChevronDown,
  Check,
  Coffee,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn, formatTND } from "@/lib/utils";
import {
  type PackCategory,
  type PackTier,
  priceForTier,
} from "@/lib/event-packs-catalog";
import { PackRequestDialog } from "./PackRequestDialog";

export function PackCapsule({
  category,
  defaultOpen = false,
}: {
  category: PackCategory;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [activeTier, setActiveTier] = React.useState<string>(
    category.tiers[0]?.id ?? "essentiel"
  );
  const initialGuest =
    category.guestCount.kind === "fixed"
      ? category.guestCount.value
      : category.guestCount.default;
  const [guestCount, setGuestCount] = React.useState<number>(initialGuest);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [dialog, setDialog] = React.useState<{ open: boolean; tier?: PackTier }>({
    open: false,
  });

  const adjustGuests = (delta: number) => {
    if (category.guestCount.kind !== "stepper") return;
    const { min, max, step } = category.guestCount;
    setGuestCount((g) => Math.max(min, Math.min(max, g + delta * step)));
  };

  const toggleOption = (id: string) => {
    setSelectedOptions((opts) =>
      opts.includes(id) ? opts.filter((x) => x !== id) : [...opts, id]
    );
  };

  const tier = category.tiers.find((t) => t.id === activeTier) ?? category.tiers[0];
  const packPriceHT = priceForTier(tier, guestCount);
  const optionsTotalHT = selectedOptions.reduce((sum, id) => {
    const opt = category.options.find((o) => o.id === id);
    return sum + (opt?.priceHT ?? 0);
  }, 0);
  const subtotalHT = packPriceHT + optionsTotalHT;
  const ttc = +(subtotalHT * 1.19).toFixed(3);

  return (
    <article
      className={cn(
        "rounded-2xl bg-background ring-1 transition-all overflow-hidden",
        open ? "ring-teal-500/40 shadow-md" : "ring-border shadow-xs"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-4 p-5 sm:p-6 text-left hover:bg-cream-50/50 transition-colors"
        aria-expanded={open}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          {category.slug === "soutenance" && <Coffee className="size-5" />}
          {category.slug !== "soutenance" && <Sparkles className="size-5" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px]">
              {category.badge}
            </Badge>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {category.guestCount.kind === "fixed"
                ? category.guestCount.label
                : `${category.guestCount.min} – ${category.guestCount.max} pers.`}
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold">
            {category.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {category.tagline}
          </p>
        </div>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-teal-700 transition-transform",
            open && "rotate-180"
          )}
        >
          <ChevronDown className="size-4" />
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-border bg-cream-50/40 p-5 sm:p-6 space-y-6">
          {/* Tier tabs */}
          <Tabs value={activeTier} onValueChange={setActiveTier}>
            <TabsList className="flex-wrap h-auto">
              {category.tiers.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.badge}
                </TabsTrigger>
              ))}
            </TabsList>

            {category.tiers.map((t) => (
              <TabsContent key={t.id} value={t.id}>
                <PackTierBody tier={t} />
              </TabsContent>
            ))}
          </Tabs>

          {/* Guest selector */}
          {category.guestCount.kind === "stepper" && (
            <div className="rounded-xl bg-background p-5 ring-1 ring-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Nombre de personnes
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustGuests(-1)}
                  disabled={guestCount <= category.guestCount.min}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-teal-700 hover:bg-cream-100/80 disabled:opacity-40"
                  aria-label="Diminuer"
                >
                  <Minus className="size-4" />
                </button>
                <span className="font-display text-3xl font-bold tabular-nums w-20 text-center">
                  {guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => adjustGuests(1)}
                  disabled={guestCount >= category.guestCount.max}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-teal-700 hover:bg-cream-100/80 disabled:opacity-40"
                  aria-label="Augmenter"
                >
                  <Plus className="size-4" />
                </button>
                <span className="text-xs text-muted-foreground ml-1">
                  paliers de {category.guestCount.step}
                </span>
              </div>
            </div>
          )}

          {/* Options */}
          {category.options.length > 0 && (
            <div className="rounded-xl bg-background p-5 ring-1 ring-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Options additionnelles
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.options.map((opt) => {
                  const checked = selectedOptions.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex items-start gap-3 rounded-md p-3 ring-1 cursor-pointer transition-colors text-sm",
                        checked
                          ? "ring-teal-500 bg-teal-50"
                          : "ring-border bg-cream-50/40 hover:ring-teal-500/30"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors mt-0.5",
                          checked
                            ? "bg-teal-500 text-white"
                            : "border-2 border-neutral-300"
                        )}
                      >
                        {checked && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <span className="flex-1">
                        <span className="font-medium block">{opt.name}</span>
                        {opt.description && (
                          <span className="text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums text-xs font-medium">
                        +{formatTND(opt.priceHT)}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleOption(opt.id)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing + CTA */}
          <div className="rounded-xl bg-teal-50 ring-1 ring-teal-100 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Total HT
              </p>
              <p className="font-display text-3xl font-bold tabular-nums">
                {formatTND(subtotalHT)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                {formatTND(ttc)} TTC · TVA 19%
              </p>
            </div>
            <Button
              variant="accent"
              size="lg"
              onClick={() => setDialog({ open: true, tier })}
            >
              Demander ce pack
            </Button>
          </div>
        </div>
      )}

      {dialog.open && dialog.tier && (
        <PackRequestDialog
          open={dialog.open}
          onOpenChange={(o) => setDialog({ open: o, tier: o ? dialog.tier : undefined })}
          category={category}
          tier={dialog.tier}
          guestCount={guestCount}
          selectedOptions={selectedOptions}
          packPriceHT={priceForTier(dialog.tier, guestCount)}
          optionsTotalHT={optionsTotalHT}
        />
      )}
    </article>
  );
}

function PackTierBody({ tier }: { tier: PackTier }) {
  const c = tier.content;
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-background p-4 ring-1 ring-border">
        <p className="text-sm text-muted-foreground">{tier.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {c.boissons && (
          <Section title="Boissons" items={c.boissons} />
        )}
        {c.stations && c.stations.length > 0 && (
          <Section
            title="Stations"
            items={c.stations.map((s) => `${s.name} — ${s.detail}`)}
          />
        )}
        {c.sale && (
          <Section
            title={`Salé${c.sale.quantity ? ` · ${c.sale.quantity}` : ""}`}
            items={c.sale.items}
          />
        )}
        {c.sucre && (
          <Section
            title={`Sucré${c.sucre.quantity ? ` · ${c.sucre.quantity}` : ""}`}
            items={c.sucre.items}
          />
        )}
        {c.bar && <Section title="Bar" items={c.bar} />}
        {c.mobilier && <Section title="Mobilier" items={c.mobilier} />}
        {c.materiel && <Section title="Matériel & service" items={c.materiel} />}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md bg-background p-4 ring-1 ring-border">
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm leading-snug">
            <Check className="size-3.5 text-teal-600 mt-0.5 shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
