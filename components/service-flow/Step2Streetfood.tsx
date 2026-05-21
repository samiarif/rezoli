"use client";

import * as React from "react";
import { Check, ArrowRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatTND } from "@/lib/utils";
import type { StreetfoodStation } from "@/lib/service-catalog";
import { streetfoodLinePrice } from "@/lib/service-pricing";
import type { FlowState, FlowAction } from "./state";
import type { StationSelection } from "@/lib/schemas";

export function Step2Streetfood({
  state,
  dispatch,
  stations,
  onContinue,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  stations: StreetfoodStation[];
  onContinue: () => void;
}) {
  const existing: StationSelection[] =
    state.details?.service === "stations-street-food"
      ? state.details.stations
      : [];
  const [selections, setSelections] = React.useState<StationSelection[]>(existing);
  const nb = state.guestCount;

  function getSel(stationId: string, variant?: string): StationSelection | undefined {
    return selections.find(
      (x) => x.stationId === stationId && (x.variant ?? "") === (variant ?? "")
    );
  }

  function add(stationId: string, variant?: string) {
    setSelections((p) => [...p, { stationId, variant, piecesPerPerson: 1 }]);
  }

  function remove(stationId: string, variant?: string) {
    setSelections((p) =>
      p.filter(
        (x) => !(x.stationId === stationId && (x.variant ?? "") === (variant ?? ""))
      )
    );
  }

  function setPieces(stationId: string, variant: string | undefined, pieces: number) {
    setSelections((p) =>
      p.map((x) =>
        x.stationId === stationId && (x.variant ?? "") === (variant ?? "")
          ? { ...x, piecesPerPerson: Math.max(1, pieces) }
          : x
      )
    );
  }

  function commit() {
    dispatch({
      type: "SET_CUSTOM_DETAILS",
      details: {
        service: "stations-street-food",
        formulaId: "personnalise",
        stations: selections,
      },
    });
    onContinue();
  }

  const total = selections.reduce((sum, s) => {
    const line = streetfoodLinePrice(s, nb);
    return sum + (line?.total ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Étape 2 / 3</p>
        <h2 className="display-2 mt-1">Sélectionnez vos stations</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Composez votre événement. Indiquez le nombre de pièces par personne
          pour chaque station choisie.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {stations.map((station) => {
          if (station.variants && station.multiVariant) {
            // Pizza: multi-select variants
            return (
              <div
                key={station.id}
                className="rounded-xl bg-background ring-1 ring-border p-5"
              >
                <h3 className="font-display text-lg font-semibold">{station.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{station.description}</p>
                <ul className="mt-3 space-y-2">
                  {station.variants.map((v) => {
                    const sel = getSel(station.id, v.label);
                    return (
                      <VariantRow
                        key={v.label}
                        label={v.label}
                        unit={nb >= 150 ? v.prix[1] : v.prix[0]}
                        selection={sel}
                        onToggle={() =>
                          sel
                            ? remove(station.id, v.label)
                            : add(station.id, v.label)
                        }
                        onPieces={(n) => setPieces(station.id, v.label, n)}
                      />
                    );
                  })}
                </ul>
              </div>
            );
          }

          if (station.variants) {
            // Pâtes / Crêpe / Burger: pick 1 of 2 variants
            return (
              <div
                key={station.id}
                className="rounded-xl bg-background ring-1 ring-border p-5"
              >
                <h3 className="font-display text-lg font-semibold">{station.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{station.description}</p>
                <ul className="mt-3 space-y-2">
                  {station.variants.map((v) => {
                    const sel = getSel(station.id, v.label);
                    return (
                      <VariantRow
                        key={v.label}
                        label={v.label}
                        unit={nb >= 150 ? v.prix[1] : v.prix[0]}
                        selection={sel}
                        // For single-variant stations remove any other variant of the same station before adding
                        onToggle={() => {
                          if (sel) remove(station.id, v.label);
                          else {
                            setSelections((p) => [
                              ...p.filter((x) => x.stationId !== station.id),
                              { stationId: station.id, variant: v.label, piecesPerPerson: 1 },
                            ]);
                          }
                        }}
                        onPieces={(n) => setPieces(station.id, v.label, n)}
                      />
                    );
                  })}
                </ul>
              </div>
            );
          }

          // No variants — div container with a select-toggle button inside
          const sel = getSel(station.id);
          const unit = nb >= 150 ? station.prix[1] : station.prix[0];
          return (
            <div
              key={station.id}
              className={cn(
                "rounded-xl bg-background p-5 ring-1 transition-all",
                sel ? "ring-2 ring-teal-500 shadow-md" : "ring-border hover:ring-teal-500/40"
              )}
            >
              <button
                type="button"
                onClick={() => (sel ? remove(station.id) : add(station.id))}
                aria-pressed={!!sel}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {station.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {station.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
                      sel ? "bg-teal-500 text-white" : "border-2 border-neutral-300"
                    )}
                  >
                    {sel && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </div>
                <p className="mt-3 text-sm">
                  <span className="font-semibold text-teal-700">
                    {formatTND(unit)}
                  </span>
                  <span className="text-xs text-muted-foreground"> / pièce</span>
                </p>
              </button>
              {sel && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Pièces / pers.
                  </span>
                  <PiecesStepper
                    value={sel.piecesPerPerson}
                    onChange={(n) => setPieces(station.id, undefined, n)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live total */}
      {selections.length > 0 && (
        <div className="rounded-xl bg-teal-50 ring-1 ring-teal-100 p-4 text-sm flex items-center justify-between">
          <span>
            <strong>{selections.length}</strong> station
            {selections.length > 1 ? "s" : ""} pour <strong>{nb}</strong> invités
          </span>
          <span className="tabular-nums font-semibold">
            Total HT : {formatTND(total)}
          </span>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          variant="solid"
          size="lg"
          disabled={selections.length === 0}
          onClick={commit}
        >
          Continuer <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function VariantRow({
  label,
  unit,
  selection,
  onToggle,
  onPieces,
}: {
  label: string;
  unit: number;
  selection?: StationSelection;
  onToggle: () => void;
  onPieces: (n: number) => void;
}) {
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-md p-2.5 ring-1 transition-colors",
        selection ? "bg-teal-50 ring-teal-200" : "bg-cream-50 ring-border"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={!!selection}
        className="flex items-center gap-2 text-sm flex-1 text-left"
      >
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded transition-colors",
            selection ? "bg-teal-500 text-white" : "border-2 border-neutral-300"
          )}
        >
          {selection && <Check className="size-3" strokeWidth={3} />}
        </span>
        <span className="flex-1">{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatTND(unit)} / pièce
        </span>
      </button>
      {selection && (
        <PiecesStepper
          value={selection.piecesPerPerson}
          onChange={onPieces}
        />
      )}
    </li>
  );
}

function PiecesStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md ring-1 ring-border bg-background overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="p-1 hover:bg-cream-100"
        aria-label="Diminuer"
      >
        <Minus className="size-3.5" />
      </button>
      <Input
        type="number"
        min={1}
        max={20}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 1)}
        className="h-7 w-12 text-center border-0 ring-0 focus-visible:ring-0 px-0 text-xs tabular-nums"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        className="p-1 hover:bg-cream-100"
        aria-label="Augmenter"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
