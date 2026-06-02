"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { StringListEditor } from "@/components/admin/StringListEditor";
import { cn } from "@/lib/utils";
import { updateServicePack } from "@/app/admin/catalog/services/actions";

type ServiceKind = "cocktails" | "cafe" | "dejeuner";

type PackRow = {
  id: string;             // DB id (may be "demo-xxx" before first seed)
  packKey: string;        // natural key — always reliable
  name: string;
  badgeLabel: string;
  description: string | null;
  content: Record<string, unknown>;
  order: number;
};

export function ServicePacksEditor({
  kind,
  serviceSlug,
  packs,
}: {
  kind: ServiceKind;
  serviceSlug: string;
  packs: PackRow[];
}) {
  return (
    <section className="rounded-xl bg-background ring-1 ring-border p-6">
      <header className="mb-5">
        <h2 className="font-display text-lg font-semibold">Formules</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {packs.length} formules. Cliquez pour modifier le contenu, les
          quantités et la grille tarifaire.
        </p>
      </header>
      <ul className="space-y-3">
        {packs.map((p) => (
          <PackRowEditor key={p.id} kind={kind} serviceSlug={serviceSlug} pack={p} />
        ))}
      </ul>
    </section>
  );
}

function PackRowEditor({ kind, serviceSlug, pack }: { kind: ServiceKind; serviceSlug: string; pack: PackRow }) {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState({ ...pack });
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      const result = await updateServicePack({
        packId: state.id,
        serviceSlug,
        packKey: state.packKey,
        name: state.name,
        badgeLabel: state.badgeLabel,
        description: state.description,
        content: state.content,
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

  return (
    <li className="rounded-lg bg-cream-50/50 ring-1 ring-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {state.badgeLabel}
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
              <Label required>Nom</Label>
              <Input
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
              />
            </div>
            <div>
              <Label required>Badge</Label>
              <Input
                value={state.badgeLabel}
                onChange={(e) =>
                  setState({ ...state, badgeLabel: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description (optionnel)</Label>
              <Textarea
                rows={2}
                value={state.description ?? ""}
                onChange={(e) =>
                  setState({ ...state, description: e.target.value })
                }
              />
            </div>
          </div>

          {kind === "cocktails" && (
            <CocktailContentEditor
              content={state.content as CocktailContent}
              onChange={(content) => setState({ ...state, content })}
            />
          )}
          {kind === "cafe" && (
            <CafeContentEditor
              content={state.content as CafeContent}
              onChange={(content) => setState({ ...state, content })}
            />
          )}
          {kind === "dejeuner" && (
            <DejeunerContentEditor
              content={state.content as DejeunerContent}
              onChange={(content) => setState({ ...state, content })}
            />
          )}

          <div className="flex justify-end">
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

/* ─── Cocktails content editor ───────────────────────────────────── */

type CocktailContent = {
  boissons: string[];
  sale: string[];
  sucre: string[];
  nbSale: number;
  nbSucre: number;
  prix: [number, number, number, number, number, number];
};

const COCKTAIL_BRACKETS = ["≥ 30", "≥ 40", "≥ 50", "≥ 70", "≥ 100", "≥ 150"];

function CocktailContentEditor({
  content,
  onChange,
}: {
  content: CocktailContent;
  onChange: (c: CocktailContent) => void;
}) {
  const updatePrice = (i: number, v: number) => {
    const next = [...content.prix] as CocktailContent["prix"];
    next[i] = v;
    onChange({ ...content, prix: next });
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StringListEditor
          label="Boissons"
          value={content.boissons}
          onChange={(boissons) => onChange({ ...content, boissons })}
          placeholder="Ex: Eau"
        />
        <StringListEditor
          label="Salé (options de la formule)"
          value={content.sale}
          onChange={(sale) => onChange({ ...content, sale })}
          placeholder="Ex: Mini sandwich"
        />
        <StringListEditor
          label="Sucré (options de la formule)"
          value={content.sucre}
          onChange={(sucre) => onChange({ ...content, sucre })}
          placeholder="Ex: Macaron"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Nombre de pièces salées par personne</Label>
          <Input
            type="number"
            value={content.nbSale}
            onChange={(e) =>
              onChange({ ...content, nbSale: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>Nombre de pièces sucrées par personne</Label>
          <Input
            type="number"
            value={content.nbSucre}
            onChange={(e) =>
              onChange({ ...content, nbSucre: Number(e.target.value) })
            }
          />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Tarif par paliers (TND HT / pers.)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {COCKTAIL_BRACKETS.map((label, i) => (
            <div key={label}>
              <Label className="text-[10px]">{label}</Label>
              <Input
                type="number"
                step="0.5"
                value={content.prix[i] ?? 0}
                onChange={(e) => updatePrice(i, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Café content editor ────────────────────────────────────────── */

type CafeContent = {
  boissons: string[];
  sale: string[];
  sucre: string[];
  prixSans: Record<string, number>;
  prixAvec: Record<string, number>;
};
const CAFE_SANS = ["15-19", "20-29", "30-39", "40-49", "50+"];
const CAFE_AVEC = [
  "15-19", "20-29", "30-39", "40-49", "50-69",
  "70-99", "100-149", "150-199", "200-249", "250+",
];

function CafeContentEditor({
  content,
  onChange,
}: {
  content: CafeContent;
  onChange: (c: CafeContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StringListEditor
          label="Boissons"
          value={content.boissons}
          onChange={(boissons) => onChange({ ...content, boissons })}
        />
        <StringListEditor
          label="Salé"
          value={content.sale}
          onChange={(sale) => onChange({ ...content, sale })}
        />
        <StringListEditor
          label="Sucré"
          value={content.sucre}
          onChange={(sucre) => onChange({ ...content, sucre })}
        />
      </div>

      <BracketGrid
        title="Tarif sans verrerie (TND HT / pers.)"
        brackets={CAFE_SANS}
        values={content.prixSans}
        onChange={(prixSans) => onChange({ ...content, prixSans })}
      />
      <BracketGrid
        title="Tarif avec verrerie & service (TND HT / pers.)"
        brackets={CAFE_AVEC}
        values={content.prixAvec}
        onChange={(prixAvec) => onChange({ ...content, prixAvec })}
      />
    </div>
  );
}

/* ─── Déjeuner content editor ────────────────────────────────────── */

type DejeunerContent = {
  entree: string[] | null;
  plat: string[];
  dessert: string[];
  boisson: string[] | null;
  lbPrix: [number, number, number, number];
  tblPrix: number[] | null;
};
const DEJ_LB = ["10-19", "20-39", "40-69", "70+"];
const DEJ_TBL = ["10-19", "20-29", "30-49", "50-79", "80-119", "120-199", "200+"];

function DejeunerContentEditor({
  content,
  onChange,
}: {
  content: DejeunerContent;
  onChange: (c: DejeunerContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <StringListEditor
          label="Entrée (optionnel)"
          value={content.entree ?? []}
          onChange={(entree) =>
            onChange({ ...content, entree: entree.length ? entree : null })
          }
        />
        <StringListEditor
          label="Plat"
          value={content.plat}
          onChange={(plat) => onChange({ ...content, plat })}
        />
        <StringListEditor
          label="Dessert"
          value={content.dessert}
          onChange={(dessert) => onChange({ ...content, dessert })}
        />
        <StringListEditor
          label="Boisson (optionnel)"
          value={content.boisson ?? []}
          onChange={(boisson) =>
            onChange({ ...content, boisson: boisson.length ? boisson : null })
          }
        />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Tarif lunch box (TND HT / pers.) — 4 paliers
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEJ_LB.map((label, i) => (
            <div key={label}>
              <Label className="text-[10px]">{label}</Label>
              <Input
                type="number"
                step="0.5"
                value={content.lbPrix[i] ?? 0}
                onChange={(e) => {
                  const next = [...content.lbPrix] as DejeunerContent["lbPrix"];
                  next[i] = Number(e.target.value);
                  onChange({ ...content, lbPrix: next });
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Tarif à table (optionnel, 7 paliers) — laisser vide si non applicable
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {DEJ_TBL.map((label, i) => (
            <div key={label}>
              <Label className="text-[10px]">{label}</Label>
              <Input
                type="number"
                step="0.5"
                value={content.tblPrix?.[i] ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const next = [...(content.tblPrix ?? Array(7).fill(0))];
                  next[i] = raw === "" ? 0 : Number(raw);
                  const allZero = next.every((n) => n === 0);
                  onChange({ ...content, tblPrix: allZero ? null : next });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared bracket grid for café ───────────────────────────────── */

function BracketGrid({
  title,
  brackets,
  values,
  onChange,
}: {
  title: string;
  brackets: string[];
  values: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {brackets.map((b) => (
          <div key={b}>
            <Label className="text-[10px]">{b}</Label>
            <Input
              type="number"
              step="0.5"
              value={values[b] ?? 0}
              onChange={(e) =>
                onChange({ ...values, [b]: Number(e.target.value) })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
