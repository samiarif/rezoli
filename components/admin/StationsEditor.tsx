"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save, Plus, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { updateStation } from "@/app/admin/catalog/services/actions";

type Variant = { label: string; prix: [number, number] };
type StationPricing = {
  prix: [number, number];
  variants?: Variant[];
  multiVariant?: boolean;
};
type StationRow = {
  id: string;
  stationKey: string;
  name: string;
  description: string;
  pricing: StationPricing;
  order: number;
};

export function StationsEditor({ stations }: { stations: StationRow[] }) {
  return (
    <section className="rounded-xl bg-background ring-1 ring-border p-6">
      <header className="mb-5">
        <h2 className="font-display text-lg font-semibold">Stations</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {stations.length} stations. Tarification à 2 paliers (100-149 et
          150+).
        </p>
      </header>
      <ul className="space-y-3">
        {stations.map((s) => (
          <StationRowEditor key={s.id} initial={s} />
        ))}
      </ul>
    </section>
  );
}

function StationRowEditor({ initial }: { initial: StationRow }) {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      const result = await updateStation({
        stationId: state.id,
        name: state.name,
        description: state.description,
        pricing: state.pricing,
        order: state.order,
      });
      if (result.ok) toast.success("Station enregistrée");
      else toast.error(result.message ?? "Échec");
    } catch (err) {
      console.error(err);
      toast.error("Erreur");
    } finally {
      setBusy(false);
    }
  }

  const updateBasePrice = (i: 0 | 1, v: number) => {
    const next: [number, number] = [...state.pricing.prix];
    next[i] = v;
    setState({ ...state, pricing: { ...state.pricing, prix: next } });
  };

  const updateVariant = (i: number, patch: Partial<Variant>) => {
    const variants = (state.pricing.variants ?? []).map((v, j) =>
      j === i ? { ...v, ...patch } : v
    );
    setState({ ...state, pricing: { ...state.pricing, variants } });
  };

  const addVariant = () => {
    const variants = [
      ...(state.pricing.variants ?? []),
      { label: "Nouvelle variante", prix: [0, 0] as [number, number] },
    ];
    setState({ ...state, pricing: { ...state.pricing, variants } });
  };

  const removeVariant = (i: number) => {
    const variants = (state.pricing.variants ?? []).filter((_, j) => j !== i);
    setState({
      ...state,
      pricing: {
        ...state.pricing,
        variants: variants.length ? variants : undefined,
      },
    });
  };

  return (
    <li className="rounded-lg bg-cream-50/50 ring-1 ring-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
      >
        <div>
          <h3 className="font-display text-base font-semibold">{state.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {state.description}
          </p>
        </div>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label required>Nom</Label>
              <Input
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={state.description}
                onChange={(e) =>
                  setState({ ...state, description: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Tarif de base (TND HT / pièce)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">100-149 pers.</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={state.pricing.prix[0]}
                  onChange={(e) =>
                    updateBasePrice(0, Number(e.target.value))
                  }
                />
              </div>
              <div>
                <Label className="text-[10px]">150+ pers.</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={state.pricing.prix[1]}
                  onChange={(e) =>
                    updateBasePrice(1, Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Variantes (optionnel)
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addVariant}
              >
                <Plus className="size-3.5" /> Ajouter
              </Button>
            </div>
            <label className="flex items-center gap-2 mb-3 text-sm">
              <Checkbox
                checked={!!state.pricing.multiVariant}
                onCheckedChange={(v) =>
                  setState({
                    ...state,
                    pricing: { ...state.pricing, multiVariant: v === true },
                  })
                }
              />
              <span>Multi-sélection (ex: Pizza — l&apos;utilisateur peut prendre plusieurs variantes)</span>
            </label>
            <ul className="space-y-2">
              {(state.pricing.variants ?? []).map((v, i) => (
                <li
                  key={i}
                  className="grid grid-cols-12 gap-2 items-end rounded-md bg-background p-3 ring-1 ring-border"
                >
                  <div className="col-span-6">
                    <Label className="text-[10px]">Libellé</Label>
                    <Input
                      value={v.label}
                      onChange={(e) =>
                        updateVariant(i, { label: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px]">100-149</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={v.prix[0]}
                      onChange={(e) =>
                        updateVariant(i, {
                          prix: [Number(e.target.value), v.prix[1]],
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px]">150+</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={v.prix[1]}
                      onChange={(e) =>
                        updateVariant(i, {
                          prix: [v.prix[0], Number(e.target.value)],
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="col-span-2 inline-flex items-center justify-center h-9 rounded-md bg-cream-100 text-muted-foreground hover:text-danger hover:bg-red-50"
                    aria-label="Supprimer la variante"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Textarea
            value={state.description}
            onChange={(e) =>
              setState({ ...state, description: e.target.value })
            }
            rows={2}
          />

          <div className="flex justify-end">
            <Button onClick={save} variant="solid" disabled={busy}>
              <Save className="size-4" />
              {busy ? "Enregistrement…" : "Enregistrer la station"}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
