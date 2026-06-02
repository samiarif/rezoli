"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ChevronDown, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { StringListEditor } from "@/components/admin/StringListEditor";
import { cn } from "@/lib/utils";
import {
  updateTier,
  createTier,
  deleteTier,
} from "@/app/admin/catalog/event-packs/actions";

type Content = {
  boissons?: string[];
  sale?: { items: string[]; quantity?: string };
  sucre?: { items: string[]; quantity?: string };
  stations?: Array<{ name: string; detail: string }>;
  bar?: string[];
  mobilier?: string[];
  materiel?: string[];
};
type Price =
  | { kind: "fixed"; ht: number }
  | { kind: "scaled"; table: Record<string, number> };

type Tier = {
  id: string;
  tierKey: string;
  badge: string;
  name: string;
  description: string;
  content: Content;
  price: Price;
  order: number;
};

export function EventPackTiersEditor({
  tiers,
  categorySlug,
}: {
  tiers: Tier[];
  categorySlug: string;
}) {
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);

  async function addTier() {
    setAdding(true);
    try {
      const result = await createTier(categorySlug);
      if (result.ok) {
        toast.success("Formule ajoutée");
        router.refresh();
      } else {
        toast.error(result.message ?? "Échec");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur");
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="rounded-xl bg-background ring-1 ring-border p-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Formules</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {tiers.length} formules. Contenu et grille tarifaire
            personnalisables.
          </p>
        </div>
        <Button onClick={addTier} variant="outline" size="sm" disabled={adding}>
          <Plus className="size-4" />{" "}
          {adding ? "Ajout…" : "Ajouter une formule"}
        </Button>
      </header>
      {tiers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune formule. Cliquez sur « Ajouter une formule » pour commencer.
        </p>
      ) : (
        <ul className="space-y-3">
          {tiers.map((t) => (
            <TierRow key={t.id} initial={t} categorySlug={categorySlug} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TierRow({
  initial,
  categorySlug,
}: {
  initial: Tier;
  categorySlug: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      const result = await updateTier({
        categorySlug,
        tierKey: state.tierKey,
        badge: state.badge,
        name: state.name,
        description: state.description,
        content: state.content,
        price: state.price,
        order: state.order,
      });
      if (result.ok) toast.success("Formule enregistrée");
      else toast.error(result.message ?? "Échec");
    } catch (err) {
      console.error(err);
      toast.error("Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Supprimer la formule « ${state.name} » ?`)) return;
    setBusy(true);
    try {
      const result = await deleteTier(categorySlug, state.tierKey);
      if (result.ok) {
        toast.success("Formule supprimée");
        router.refresh();
      } else {
        toast.error(result.message ?? "Échec");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur");
    } finally {
      setBusy(false);
    }
  }

  const updateContent = (patch: Partial<Content>) =>
    setState({ ...state, content: { ...state.content, ...patch } });

  return (
    <li className="rounded-lg bg-cream-50/50 ring-1 ring-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
      >
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {state.badge}
          </p>
          <h3 className="font-display text-base font-semibold mt-0.5">
            {state.name}
          </h3>
        </div>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-border p-4 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label required>Badge</Label>
              <Input
                value={state.badge}
                onChange={(e) => setState({ ...state, badge: e.target.value })}
              />
            </div>
            <div>
              <Label required>Nom</Label>
              <Input
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label required>Description</Label>
              <Textarea
                rows={2}
                value={state.description}
                onChange={(e) =>
                  setState({ ...state, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-4 md:grid-cols-2">
            <StringListEditor
              label="Boissons"
              value={state.content.boissons ?? []}
              onChange={(boissons) => updateContent({ boissons })}
            />
            <StringListEditor
              label="Bar (lounge / scénographie)"
              value={state.content.bar ?? []}
              onChange={(bar) => updateContent({ bar })}
            />
          </div>

          <QuantityListEditor
            label="Salé"
            value={state.content.sale}
            onChange={(sale) => updateContent({ sale })}
          />
          <QuantityListEditor
            label="Sucré"
            value={state.content.sucre}
            onChange={(sucre) => updateContent({ sucre })}
          />

          <StationsListEditor
            value={state.content.stations ?? []}
            onChange={(stations) => updateContent({ stations })}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <StringListEditor
              label="Mobilier"
              value={state.content.mobilier ?? []}
              onChange={(mobilier) => updateContent({ mobilier })}
            />
            <StringListEditor
              label="Matériel & service"
              value={state.content.materiel ?? []}
              onChange={(materiel) => updateContent({ materiel })}
            />
          </div>

          {/* Pricing */}
          <PricingEditor
            value={state.price}
            onChange={(price) => setState({ ...state, price })}
          />

          <div className="flex justify-between items-center">
            <Button
              onClick={remove}
              variant="ghost"
              size="sm"
              disabled={busy}
              className="text-danger hover:text-danger"
            >
              <Trash2 className="size-4" /> Supprimer
            </Button>
            <Button onClick={save} variant="solid" disabled={busy}>
              <Save className="size-4" />
              {busy ? "Enregistrement…" : "Enregistrer la formule"}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function QuantityListEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Content["sale"] | undefined;
  onChange: (v: Content["sale"]) => void;
}) {
  const items = value?.items ?? [];
  const quantity = value?.quantity ?? "";
  return (
    <div className="rounded-lg bg-cream-50 p-4 ring-1 ring-border space-y-3">
      <StringListEditor
        label={label}
        value={items}
        onChange={(items) => onChange({ items, quantity })}
      />
      <div>
        <Label className="text-[10px]">Quantité affichée (ex: 5 pièces / pers.)</Label>
        <Input
          value={quantity}
          onChange={(e) => onChange({ items, quantity: e.target.value })}
        />
      </div>
    </div>
  );
}

function StationsListEditor({
  value,
  onChange,
}: {
  value: NonNullable<Content["stations"]>;
  onChange: (v: Content["stations"]) => void;
}) {
  const update = (i: number, patch: Partial<NonNullable<Content["stations"]>[number]>) =>
    onChange(value.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const add = () =>
    onChange([...value, { name: "Station ", detail: "" }]);
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

  return (
    <div className="rounded-lg bg-cream-50 p-4 ring-1 ring-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Stations
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={add}>
          <Plus className="size-3.5" /> Ajouter
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucune station.</p>
      ) : (
        <ul className="space-y-2">
          {value.map((s, i) => (
            <li
              key={i}
              className="grid grid-cols-12 gap-2 items-end rounded-md bg-background p-3 ring-1 ring-border"
            >
              <div className="col-span-5">
                <Label className="text-[10px]">Nom</Label>
                <Input
                  value={s.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                />
              </div>
              <div className="col-span-6">
                <Label className="text-[10px]">Détail</Label>
                <Input
                  value={s.detail}
                  onChange={(e) => update(i, { detail: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="col-span-1 inline-flex items-center justify-center h-9 rounded-md text-muted-foreground hover:text-danger"
                aria-label="Supprimer"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PricingEditor({
  value,
  onChange,
}: {
  value: Price;
  onChange: (v: Price) => void;
}) {
  return (
    <div className="rounded-lg bg-cream-50 p-4 ring-1 ring-border">
      <div className="flex gap-4 mb-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={value.kind === "fixed"}
            onChange={() => onChange({ kind: "fixed", ht: 0 })}
          />
          <span>Prix fixe</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={value.kind === "scaled"}
            onChange={() =>
              onChange({
                kind: "scaled",
                table: value.kind === "scaled" ? value.table : { "100": 0 },
              })
            }
          />
          <span>Prix paliers (par nombre d&apos;invités)</span>
        </label>
      </div>
      {value.kind === "fixed" ? (
        <div>
          <Label className="text-[10px]">Prix HT (TND)</Label>
          <Input
            type="number"
            step="0.5"
            value={value.ht}
            onChange={(e) =>
              onChange({ kind: "fixed", ht: Number(e.target.value) })
            }
          />
        </div>
      ) : (
        <ScaledTable
          table={value.table}
          onChange={(table) => onChange({ kind: "scaled", table })}
        />
      )}
    </div>
  );
}

function ScaledTable({
  table,
  onChange,
}: {
  table: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
}) {
  const rows = Object.entries(table).sort(([a], [b]) => Number(a) - Number(b));
  const [newGuest, setNewGuest] = React.useState("");
  const addRow = () => {
    const k = newGuest.trim();
    if (!k) return;
    onChange({ ...table, [k]: 0 });
    setNewGuest("");
  };
  return (
    <div>
      <ul className="space-y-1.5">
        {rows.map(([k, v]) => (
          <li key={k} className="grid grid-cols-12 gap-2 items-center">
            <span className="col-span-3 text-sm">{k} pers.</span>
            <Input
              type="number"
              step="0.5"
              value={v}
              className="col-span-7"
              onChange={(e) =>
                onChange({ ...table, [k]: Number(e.target.value) })
              }
            />
            <button
              type="button"
              onClick={() => {
                const next = { ...table };
                delete next[k];
                onChange(next);
              }}
              className="col-span-2 inline-flex items-center justify-center h-9 rounded-md text-muted-foreground hover:text-danger"
              aria-label="Supprimer"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mt-3">
        <Input
          type="number"
          placeholder="Ajouter palier (nb invités)"
          value={newGuest}
          onChange={(e) => setNewGuest(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addRow();
            }
          }}
        />
        <Button type="button" variant="outline" size="md" onClick={addRow}>
          <Plus className="size-4" /> Ajouter
        </Button>
      </div>
    </div>
  );
}
