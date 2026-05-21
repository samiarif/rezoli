"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatTND } from "@/lib/utils";
import type { FlowState, FlowAction } from "./state";
import type { QuoteDetails } from "@/lib/schemas";
import type {
  CafePack,
  CocktailPack,
  DejeunerPack,
  ServiceSlug,
} from "@/lib/service-catalog";

type AnyPack = CocktailPack | CafePack | DejeunerPack;
import {
  cocktailPricePerPerson,
  cafePricePerPerson,
  dejeunerPricePerPerson,
} from "@/lib/service-pricing";

export function Step2Formula({
  state,
  dispatch,
  service,
  packs,
  onContinue,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  service: ServiceSlug;
  packs: AnyPack[];
  onContinue: () => void;
}) {
  if (service === "stations-street-food") return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Étape 2 / 3</p>
        <h2 className="display-2 mt-1">Choisissez votre formule</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Sélectionnez une formule pré-définie ou créez votre menu personnalisé.
        </p>
      </header>

      {service === "cocktails-dinatoires" && (
        <CocktailPicker
          state={state}
          dispatch={dispatch}
          packs={packs as CocktailPack[]}
        />
      )}
      {service === "pauses-cafe" && (
        <CafePicker
          state={state}
          dispatch={dispatch}
          packs={packs as CafePack[]}
        />
      )}
      {service === "pauses-dejeuner" && (
        <DejeunerPicker
          state={state}
          dispatch={dispatch}
          packs={packs as DejeunerPack[]}
        />
      )}

      <PersonnaliseCard
        selected={state.formulaId === "personnalise"}
        onClick={() => dispatch({ type: "OPEN_MODAL" })}
      />

      <div className="flex justify-end pt-2">
        <Button
          variant="solid"
          size="lg"
          disabled={!state.formulaId || !state.details}
          onClick={onContinue}
        >
          Continuer <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Per-service pickers ─────────────────────────────────────────── */

function CocktailPicker({
  state,
  dispatch,
  packs,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  packs: CocktailPack[];
}) {
  const nb = state.guestCount;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {packs.map((p) => {
        const unit = cocktailPricePerPerson(p.id, nb);
        return (
          <PackCard
            key={p.id}
            selected={state.formulaId === p.id}
            onClick={() => {
              const details: QuoteDetails = {
                service: "cocktails-dinatoires",
                formulaId: p.id,
                boissons: p.boissons,
                sale: p.sale,
                sucre: p.sucre,
                serviceMode: "avec",
              };
              dispatch({ type: "PICK_PREBUILT", formulaId: p.id, details });
            }}
            badge={p.badgeLabel}
            name={p.name}
            unit={unit}
            inclusions={[
              `Boissons : ${p.boissons.join(", ")}`,
              `${p.nbSale} pièces salées au choix (${p.sale.length} options)`,
              `${p.nbSucre} pièces sucrées au choix (${p.sucre.length} options)`,
            ]}
          />
        );
      })}
    </div>
  );
}

function CafePicker({
  state,
  dispatch,
  packs,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  packs: CafePack[];
}) {
  const nb = state.guestCount;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {packs.map((p) => {
        const unit = cafePricePerPerson(p.id, nb, state.withVerrerie);
        return (
          <PackCard
            key={p.id}
            selected={state.formulaId === p.id}
            onClick={() => {
              const details: QuoteDetails = {
                service: "pauses-cafe",
                formulaId: p.id,
                withVerrerie: state.withVerrerie,
                boissons: p.boissons,
                hasSale: true,
                sale: p.sale,
                hasSucre: true,
                sucre: p.sucre,
                serviceMode: state.withVerrerie ? "avec" : "sans",
              };
              dispatch({ type: "PICK_PREBUILT", formulaId: p.id, details });
            }}
            badge={p.badgeLabel}
            name={p.name}
            unit={unit}
            inclusions={[
              `Boissons : ${p.boissons.join(" · ")}`,
              `Salé : ${p.sale.join(", ")}`,
              `Sucré : ${p.sucre.join(", ")}`,
            ]}
          />
        );
      })}
    </div>
  );
}

function DejeunerPicker({
  state,
  dispatch,
  packs,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  packs: DejeunerPack[];
}) {
  const nb = state.guestCount;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {packs.map((p) => {
        const unit = dejeunerPricePerPerson(p.id, nb, "lunch_box");
        const inclusions = [
          p.entree ? `Entrée : ${p.entree.join(", ")}` : null,
          `Plat : ${p.plat.join(", ")}`,
          `Dessert : ${p.dessert.join(", ")}`,
          p.boisson ? `Boisson : ${p.boisson.join(", ")}` : null,
        ].filter(Boolean) as string[];
        return (
          <PackCard
            key={p.id}
            selected={state.formulaId === p.id}
            onClick={() => {
              const details: QuoteDetails = {
                service: "pauses-dejeuner",
                formulaId: p.id,
                boissons: p.boisson ?? [],
                entree: !!p.entree,
                plat: "chaud",
                dessert: !!p.dessert,
                dessertType: "les_deux",
                serviceMode: "lunch_box",
              };
              dispatch({ type: "PICK_PREBUILT", formulaId: p.id, details });
            }}
            badge={p.badgeLabel}
            name={p.name}
            unit={unit}
            inclusions={inclusions}
          />
        );
      })}
    </div>
  );
}

/* ─── Shared card ─────────────────────────────────────────────────── */

function PackCard({
  selected,
  onClick,
  badge,
  name,
  unit,
  inclusions,
}: {
  selected: boolean;
  onClick: () => void;
  badge: string;
  name: string;
  unit: number | null;
  inclusions: string[];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative text-left rounded-xl bg-background p-5 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md",
        selected
          ? "ring-2 ring-teal-500 shadow-md"
          : "ring-border hover:ring-teal-500/40"
      )}
    >
      {selected && (
        <span className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )}
      <p className="eyebrow">{badge}</p>
      <h3 className="font-display text-xl font-semibold mt-1">{name}</h3>
      {unit != null && (
        <p className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-2xl font-bold text-teal-700">
            {formatTND(unit)}
          </span>
          <span className="text-xs text-muted-foreground">/ pers. HT</span>
        </p>
      )}
      <ul className="mt-3 space-y-1.5">
        {inclusions.map((i) => (
          <li key={i} className="text-xs text-muted-foreground leading-snug flex gap-2">
            <Check className="size-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

function PersonnaliseCard({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "w-full text-left rounded-xl p-5 transition-all hover:-translate-y-0.5 flex items-center gap-4",
        selected
          ? "bg-amber-50 ring-2 ring-amber-500 shadow-md"
          : "bg-amber-50/40 ring-1 ring-amber-200 hover:ring-amber-400"
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
        <Sparkles className="size-5" />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-semibold">Personnalisé</h3>
          {selected && <Badge variant="amber">Sélectionné</Badge>}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Composez votre menu sur-mesure : on s&apos;adapte à vos envies, votre
          budget et vos contraintes.
        </p>
      </div>
      <span className="text-sm font-medium text-amber-700">
        {selected ? "Modifier" : "Personnaliser"}
      </span>
    </button>
  );
}
