"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Wine, Coffee, UtensilsCrossed, Pizza } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatTND } from "@/lib/utils";
import {
  cocktailPricePerPerson,
  cafePricePerPerson,
  dejeunerPricePerPerson,
  streetfoodLinePrice,
  totalsFromUnitPrice,
  totalsFromSubtotal,
} from "@/lib/service-pricing";
import type { ServiceSlug } from "@/lib/service-catalog";

type ServiceConfig = {
  slug: ServiceSlug;
  name: string;
  icon: LucideIcon;
  min: number;
  max: number;
  step: number;
  defaultGuests: number;
  defaultPack: string;
  packLabel: string;
};

const SERVICES: ServiceConfig[] = [
  {
    slug: "cocktails-dinatoires",
    name: "Cocktail dînatoire",
    icon: Wine,
    min: 30,
    max: 250,
    step: 10,
    defaultGuests: 50,
    defaultPack: "business",
    packLabel: "Cocktail Business",
  },
  {
    slug: "pauses-cafe",
    name: "Pause café",
    icon: Coffee,
    min: 15,
    max: 250,
    step: 5,
    defaultGuests: 30,
    defaultPack: "business",
    packLabel: "Pause Café Business",
  },
  {
    slug: "pauses-dejeuner",
    name: "Pause déjeuner",
    icon: UtensilsCrossed,
    min: 10,
    max: 200,
    step: 5,
    defaultGuests: 25,
    defaultPack: "business",
    packLabel: "Pause Déjeuner Business",
  },
  {
    slug: "stations-street-food",
    name: "Street-food",
    icon: Pizza,
    min: 100,
    max: 500,
    step: 10,
    defaultGuests: 150,
    defaultPack: "",
    packLabel: "2 stations · 2 pièces/pers.",
  },
];

function priceForService(svc: ServiceConfig, guests: number): number {
  switch (svc.slug) {
    case "cocktails-dinatoires":
      return cocktailPricePerPerson(svc.defaultPack, guests) ?? 0;
    case "pauses-cafe":
      return cafePricePerPerson(svc.defaultPack, guests, false) ?? 0;
    case "pauses-dejeuner":
      return dejeunerPricePerPerson(svc.defaultPack, guests, "lunch_box") ?? 0;
    case "stations-street-food": {
      // Estimate: 2 default stations (Shawarma + Fricassé) at 2 pcs/pers
      const a = streetfoodLinePrice(
        { stationId: "shawarma", piecesPerPerson: 1 },
        guests
      );
      const b = streetfoodLinePrice(
        { stationId: "fricasse", piecesPerPerson: 1 },
        guests
      );
      const subtotal = (a?.total ?? 0) + (b?.total ?? 0);
      // Return per-person equivalent so the formula below stays consistent.
      return guests > 0 ? subtotal / guests : 0;
    }
  }
}

export function QuoteCalculator() {
  const [serviceSlug, setServiceSlug] = React.useState<ServiceSlug>(
    "cocktails-dinatoires"
  );
  const svc = SERVICES.find((s) => s.slug === serviceSlug)!;
  const [guests, setGuests] = React.useState(svc.defaultGuests);

  const selectService = (slug: ServiceSlug) => {
    setServiceSlug(slug);
    const next = SERVICES.find((s) => s.slug === slug)!;
    setGuests(next.defaultGuests);
  };

  const clampedGuests = Math.max(svc.min, Math.min(svc.max, guests));
  const unitPriceHT = priceForService(svc, clampedGuests);
  const totals =
    svc.slug === "stations-street-food"
      ? totalsFromSubtotal(+(unitPriceHT * clampedGuests).toFixed(3))
      : totalsFromUnitPrice(unitPriceHT, clampedGuests);

  return (
    <section className="py-20 md:py-28 bg-cream-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="eyebrow">Estimer en 30 secondes</p>
          <h2 className="display-2 mt-2 text-balance">
            Combien ça coûte ?
          </h2>
          <p className="lede mt-4 text-pretty">
            Choisissez un service et un nombre d&apos;invités pour voir une
            estimation immédiate. Le devis final est toujours personnalisé.
          </p>
        </div>

        <div className="rounded-2xl bg-background p-6 sm:p-10 ring-1 ring-border shadow-sm">
          {/* Service selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              const active = s.slug === serviceSlug;
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => selectService(s.slug)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl p-4 ring-1 transition-all",
                    active
                      ? "bg-teal-50 ring-2 ring-teal-500 shadow-md"
                      : "bg-cream-50 ring-border hover:ring-teal-500/30"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      active ? "bg-teal-500 text-white" : "bg-background text-teal-700"
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="text-xs font-medium text-center">{s.name}</span>
                </button>
              );
            })}
          </div>

          {/* Guest count */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-2">
              <label
                htmlFor="qc-guests"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Nombre d&apos;invités
              </label>
              <span className="font-display text-3xl font-bold tabular-nums text-teal-700">
                {clampedGuests}
              </span>
            </div>
            <input
              id="qc-guests"
              type="range"
              min={svc.min}
              max={svc.max}
              step={svc.step}
              value={clampedGuests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full accent-teal-500"
              aria-valuemin={svc.min}
              aria-valuemax={svc.max}
              aria-valuenow={clampedGuests}
            />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>{svc.min} min.</span>
              <span>{svc.max}+</span>
            </div>
          </div>

          {/* Result */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-cream-50 p-4 ring-1 ring-cream-100">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Formule estimée
              </p>
              <p className="font-display text-base font-semibold mt-1 leading-snug">
                {svc.packLabel}
              </p>
            </div>
            <div className="rounded-xl bg-cream-50 p-4 ring-1 ring-cream-100">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sous-total HT
              </p>
              <p className="font-display text-2xl font-bold tabular-nums mt-1">
                {formatTND(totals.subtotalHT)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                soit {formatTND(unitPriceHT)} / pers.
              </p>
            </div>
            <div className="rounded-xl bg-teal-500 text-white p-4">
              <p className="text-[10px] uppercase tracking-wider text-teal-100">
                Total TTC estimé
              </p>
              <p className="font-display text-2xl font-bold tabular-nums mt-1">
                {formatTND(totals.totalTTC)}
              </p>
              <p className="text-[10px] text-teal-100">TVA {totals.tvaRate}%</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Estimation basée sur la formule {svc.packLabel}. Le tarif réel
              peut varier selon vos choix, la date, et les options.
            </p>
            <Button asChild variant="accent" size="lg">
              <Link href={`/nos-services/${serviceSlug}`}>
                Personnaliser <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
