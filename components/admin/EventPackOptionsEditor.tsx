"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { replaceOptions } from "@/app/admin/catalog/event-packs/actions";

type Option = {
  optionKey: string;
  name: string;
  description: string | null;
  priceHT: number;
};

export function EventPackOptionsEditor({
  categorySlug,
  initial,
}: {
  categorySlug: string;
  initial: Option[];
}) {
  const [opts, setOpts] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);

  const update = (i: number, patch: Partial<Option>) =>
    setOpts(opts.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  const add = () =>
    setOpts([
      ...opts,
      { optionKey: `opt-${opts.length + 1}`, name: "Nouvelle option", description: "", priceHT: 0 },
    ]);
  const remove = (i: number) => setOpts(opts.filter((_, j) => j !== i));

  async function save() {
    setBusy(true);
    try {
      const result = await replaceOptions({ categorySlug, options: opts });
      if (result.ok) toast.success("Options enregistrées");
      else toast.error(result.message ?? "Échec");
    } catch (err) {
      console.error(err);
      toast.error("Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl bg-background ring-1 ring-border p-6">
      <header className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Options additionnelles</h2>
          <p className="text-xs text-muted-foreground mt-1">
            DJ, mobilier extra, sécurité, etc. — sélectionnables dans la
            demande de pack.
          </p>
        </div>
        <Button onClick={save} variant="solid" size="sm" disabled={busy}>
          <Save className="size-4" /> Enregistrer
        </Button>
      </header>

      {opts.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucune option pour cette catégorie.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {opts.map((o, i) => (
            <li
              key={i}
              className="grid grid-cols-12 gap-2 items-end rounded-md bg-cream-50 p-3 ring-1 ring-border"
            >
              <div className="col-span-3">
                <Label className="text-[10px]">Clé</Label>
                <Input
                  value={o.optionKey}
                  onChange={(e) => update(i, { optionKey: e.target.value })}
                />
              </div>
              <div className="col-span-4">
                <Label className="text-[10px]">Nom</Label>
                <Input
                  value={o.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                />
              </div>
              <div className="col-span-3">
                <Label className="text-[10px]">Description</Label>
                <Input
                  value={o.description ?? ""}
                  onChange={(e) => update(i, { description: e.target.value })}
                />
              </div>
              <div className="col-span-1">
                <Label className="text-[10px]">Prix HT</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={o.priceHT}
                  onChange={(e) =>
                    update(i, { priceHT: Number(e.target.value) })
                  }
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

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="size-4" /> Ajouter une option
      </Button>
    </section>
  );
}
