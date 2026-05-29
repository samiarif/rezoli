"use client";

import * as React from "react";
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
              `${p.nbSale} pièces salées par personne — ${p.sale.join(", ")}`,
              `${p.nbSucre} pièces sucrées par personne — ${p.sucre.join(", ")}`,
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
  const avec = state.withVerrerie;

  const buildDetails = (p: CafePack, withService: boolean): QuoteDetails => ({
    service: "pauses-cafe",
    formulaId: p.id,
    withVerrerie: withService,
    boissons: p.boissons,
    hasSale: true,
    sale: p.sale,
    hasSucre: true,
    sucre: p.sucre,
    serviceMode: withService ? "avec" : "sans",
  });

  // Toggle service mode; re-commit the selected formula so details + price stay in sync.
  const setService = (withService: boolean) => {
    dispatch({ type: "SET_EVENT", patch: { withVerrerie: withService } });
    if (state.formulaId && state.formulaId !== "personnalise") {
      const p = packs.find((x) => x.id === state.formulaId);
      if (p) {
        dispatch({
          type: "PICK_PREBUILT",
          formulaId: p.id,
          details: buildDetails(p, withService),
        });
      }
    }
  };

  return (
    <div className="space-y-5">
      <ServiceModeToggle
        avec={avec}
        onChange={setService}
        sansTitle="Sans service"
        sansDesc="Livraison des produits, consommables, et thermos café & lait."
        avecTitle="Avec service"
        avecDesc="Mise en place, service par un ou plusieurs serveurs, et plateaux de service."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {packs.map((p) => {
          const unit = cafePricePerPerson(p.id, nb, avec);
          return (
            <PackCard
              key={p.id}
              selected={state.formulaId === p.id}
              onClick={() =>
                dispatch({
                  type: "PICK_PREBUILT",
                  formulaId: p.id,
                  details: buildDetails(p, avec),
                })
              }
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
    </div>
  );
}

/**
 * Sans service / Avec service selector shown at the top of the café & déjeuner
 * formula steps. Drives which price table is used for the formulas below.
 */
function ServiceModeToggle({
  avec,
  onChange,
  sansTitle,
  sansDesc,
  avecTitle,
  avecDesc,
}: {
  avec: boolean;
  onChange: (avec: boolean) => void;
  sansTitle: string;
  sansDesc: string;
  avecTitle: string;
  avecDesc: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-neutral-800 mb-2">
        Option de service
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ServiceModeOption
          title={sansTitle}
          desc={sansDesc}
          selected={!avec}
          onClick={() => onChange(false)}
        />
        <ServiceModeOption
          title={avecTitle}
          desc={avecDesc}
          selected={avec}
          onClick={() => onChange(true)}
        />
      </div>
    </fieldset>
  );
}

function ServiceModeOption({
  title,
  desc,
  selected,
  onClick,
  disabled,
}: {
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "rounded-xl p-4 ring-1 text-left transition-all",
        disabled && "opacity-50 cursor-not-allowed",
        selected
          ? "bg-teal-50 ring-2 ring-teal-500 shadow-sm"
          : "bg-background ring-border hover:ring-teal-500/30"
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors",
            selected ? "bg-teal-500 text-white" : "border-2 border-neutral-300"
          )}
        >
          {selected && <Check className="size-2.5" strokeWidth={3} />}
        </span>
        <span className="font-display font-semibold">{title}</span>
      </span>
      <span className="mt-1.5 block text-xs text-muted-foreground leading-snug">
        {desc}
      </span>
    </button>
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
  const serviceMode = state.dejeunerServiceMode;
  const aTable = serviceMode === "a_table";

  const buildDetails = (
    p: DejeunerPack,
    picks: { entree?: string; plat?: string; dessert?: string },
    mode: "lunch_box" | "a_table"
  ): QuoteDetails => ({
    service: "pauses-dejeuner",
    formulaId: p.id,
    boissons: p.boisson ?? [],
    entree: !!p.entree,
    plat: "chaud",
    dessert: !!p.dessert,
    dessertType: "les_deux",
    serviceMode: mode,
    selectedEntree: picks.entree,
    selectedPlat: picks.plat,
    selectedDessert: picks.dessert,
  });

  // Toggle service mode. "À table" is only valid for formulas that have table
  // pricing (tblPrix). If the currently-selected formula can't be served à
  // table, clear the selection so the user re-picks an eligible one.
  const setService = (mode: "lunch_box" | "a_table") => {
    dispatch({ type: "SET_EVENT", patch: { dejeunerServiceMode: mode } });
    if (state.formulaId && state.formulaId !== "personnalise") {
      const p = packs.find((x) => x.id === state.formulaId);
      if (p && mode === "a_table" && !p.tblPrix) {
        dispatch({ type: "RESET_FORMULA" });
      } else if (p) {
        const existing =
          state.details?.service === "pauses-dejeuner"
            ? state.details
            : null;
        dispatch({
          type: "PICK_PREBUILT",
          formulaId: p.id,
          details: buildDetails(
            p,
            {
              entree: existing?.selectedEntree,
              plat: existing?.selectedPlat,
              dessert: existing?.selectedDessert,
            },
            mode
          ),
        });
      }
    }
  };

  return (
    <div className="space-y-5">
      <ServiceModeToggle
        avec={aTable}
        onChange={(avec) => setService(avec ? "a_table" : "lunch_box")}
        sansTitle="Sans service — Lunch box"
        sansDesc="Repas préparés et livrés en lunch box individuelles, prêtes à distribuer."
        avecTitle="Avec service — À table"
        avecDesc="Repas servis à table avec le matériel nécessaire (vaisselle, verrerie) et serveurs."
      />

      <div className="grid gap-4">
        {packs.map((p) => (
          <DejeunerCard
            key={p.id}
            pack={p}
            guestCount={nb}
            serviceMode={serviceMode}
            selected={state.formulaId === p.id}
            existing={
              state.details?.service === "pauses-dejeuner" &&
              state.details.formulaId === p.id
                ? state.details
                : null
            }
            onSelect={(picks) =>
              dispatch({
                type: "PICK_PREBUILT",
                formulaId: p.id,
                details: buildDetails(p, picks, serviceMode),
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Pauses Déjeuner formula card with embedded radio pickers for entrée / plat /
 * dessert. When a formula has a single option for a course, the picker is
 * skipped. The "Sélectionner cette formule" button is disabled until every
 * multi-option course has been chosen.
 */
function DejeunerCard({
  pack,
  guestCount,
  serviceMode,
  selected,
  existing,
  onSelect,
}: {
  pack: DejeunerPack;
  guestCount: number;
  serviceMode: "lunch_box" | "a_table";
  selected: boolean;
  existing: Extract<QuoteDetails, { service: "pauses-dejeuner" }> | null;
  onSelect: (picks: {
    entree?: string;
    plat?: string;
    dessert?: string;
  }) => void;
}) {
  // "À table" is only available for formulas with table pricing (tblPrix).
  const unavailableATable = serviceMode === "a_table" && !pack.tblPrix;
  const unit = unavailableATable
    ? null
    : dejeunerPricePerPerson(pack.id, guestCount, serviceMode);
  const needsEntreePick = !!pack.entree && pack.entree.length > 1;
  const needsPlatPick = pack.plat.length > 1;
  const needsDessertPick = pack.dessert.length > 1;

  const [entree, setEntree] = React.useState<string | undefined>(
    existing?.selectedEntree ??
      (pack.entree && pack.entree.length === 1 ? pack.entree[0] : undefined)
  );
  const [plat, setPlat] = React.useState<string | undefined>(
    existing?.selectedPlat ??
      (pack.plat.length === 1 ? pack.plat[0] : undefined)
  );
  const [dessert, setDessert] = React.useState<string | undefined>(
    existing?.selectedDessert ??
      (pack.dessert.length === 1 ? pack.dessert[0] : undefined)
  );

  const ready =
    !unavailableATable &&
    (!needsEntreePick || !!entree) &&
    (!needsPlatPick || !!plat) &&
    (!needsDessertPick || !!dessert);

  return (
    <article
      className={cn(
        "rounded-xl bg-background ring-1 p-5 transition-all",
        unavailableATable && "opacity-60",
        selected
          ? "ring-2 ring-teal-500 shadow-md"
          : "ring-border hover:ring-teal-500/40"
      )}
    >
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="eyebrow">{pack.badgeLabel}</p>
          <h3 className="font-display text-xl font-semibold mt-1">
            {pack.name}
          </h3>
        </div>
        {unit != null && (
          <p className="text-right">
            <span className="font-display text-2xl font-bold text-teal-700">
              {formatTND(unit)}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              / pers. HT
            </span>
          </p>
        )}
      </header>

      {unavailableATable && (
        <p className="mb-4 rounded-lg bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-xs text-amber-800">
          Cette formule est disponible uniquement en lunch box. Choisissez
          « Sans service » pour la sélectionner.
        </p>
      )}

      <div className="space-y-4">
        {pack.entree && pack.entree.length > 0 && (
          <CourseChoice
            title="Entrée"
            options={pack.entree}
            value={entree}
            onChange={setEntree}
          />
        )}
        <CourseChoice
          title="Plat"
          options={pack.plat}
          value={plat}
          onChange={setPlat}
        />
        <CourseChoice
          title="Dessert"
          options={pack.dessert}
          value={dessert}
          onChange={setDessert}
        />
        {pack.boisson && pack.boisson.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-neutral-700">Boisson</span>{" "}
            incluse : {pack.boisson.join(", ")}
          </p>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          variant={selected ? "outline" : "solid"}
          size="sm"
          disabled={!ready}
          onClick={() => onSelect({ entree, plat, dessert })}
        >
          {selected ? (
            <>
              <Check className="size-4" /> Formule sélectionnée
            </>
          ) : (
            "Sélectionner cette formule"
          )}
        </Button>
      </div>
    </article>
  );
}

function CourseChoice({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const singleOption = options.length === 1;
  return (
    <fieldset>
      <legend className="text-sm font-medium text-neutral-800">
        {title}
        {!singleOption && (
          <span className="ml-1 text-xs text-muted-foreground">
            ({options.length} options — choisissez-en une)
          </span>
        )}
      </legend>
      {singleOption ? (
        <p className="mt-1 text-sm text-muted-foreground">{options[0]}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((opt) => {
            const checked = value === opt;
            return (
              <label
                key={opt}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ring-1 transition-colors cursor-pointer",
                  checked
                    ? "bg-teal-50 ring-teal-500 text-teal-900 ring-2"
                    : "bg-background ring-border hover:ring-teal-500/30"
                )}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onChange(opt)}
                  name={`${title}-${options[0]}`}
                />
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors",
                    checked
                      ? "bg-teal-500 text-white"
                      : "border-2 border-neutral-300"
                  )}
                >
                  {checked && <Check className="size-2.5" strokeWidth={3} />}
                </span>
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
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
