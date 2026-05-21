"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { updateCategoryMeta } from "@/app/admin/catalog/event-packs/actions";

type GuestCountConfig =
  | { kind: "fixed"; value: number; label: string }
  | { kind: "stepper"; min: number; max: number; step: number; default: number };

type Props = {
  slug: string;
  name: string;
  description: string;
  badge: string;
  tagline: string;
  guestCountConfig: GuestCountConfig;
  order: number;
  published: boolean;
};

export function EventPackCategoryForm({ initial }: { initial: Props }) {
  const [state, setState] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      const result = await updateCategoryMeta(state);
      if (result.ok) toast.success("Catégorie enregistrée");
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
        <h2 className="font-display text-lg font-semibold">Catégorie</h2>
        <Button onClick={save} variant="solid" size="sm" disabled={busy}>
          <Save className="size-4" /> Enregistrer
        </Button>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
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
            value={state.badge}
            onChange={(e) => setState({ ...state, badge: e.target.value })}
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
        <div className="md:col-span-2">
          <Label required>Tagline</Label>
          <Input
            value={state.tagline}
            onChange={(e) => setState({ ...state, tagline: e.target.value })}
          />
        </div>

        <div className="md:col-span-2 rounded-lg bg-cream-50 p-4 ring-1 ring-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Sélecteur d&apos;invités
          </p>
          <div className="flex gap-4 mb-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="kind"
                checked={state.guestCountConfig.kind === "fixed"}
                onChange={() =>
                  setState({
                    ...state,
                    guestCountConfig: { kind: "fixed", value: 30, label: "~ 30 personnes" },
                  })
                }
              />
              <span>Fixe</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="kind"
                checked={state.guestCountConfig.kind === "stepper"}
                onChange={() =>
                  setState({
                    ...state,
                    guestCountConfig: {
                      kind: "stepper",
                      min: 100,
                      max: 200,
                      step: 10,
                      default: 100,
                    },
                  })
                }
              />
              <span>Stepper (min/max/pas)</span>
            </label>
          </div>
          <GuestCountEditor
            value={state.guestCountConfig}
            onChange={(guestCountConfig) =>
              setState({ ...state, guestCountConfig })
            }
          />
        </div>

        <label className="md:col-span-2 flex items-center gap-2">
          <Checkbox
            checked={state.published}
            onCheckedChange={(v) =>
              setState({ ...state, published: v === true })
            }
          />
          <span className="text-sm">Publié (visible sur /nos-packs)</span>
        </label>
      </div>
    </section>
  );
}

function GuestCountEditor({
  value,
  onChange,
}: {
  value: GuestCountConfig;
  onChange: (v: GuestCountConfig) => void;
}) {
  if (value.kind === "fixed") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[10px]">Valeur</Label>
          <Input
            type="number"
            value={value.value}
            onChange={(e) =>
              onChange({ ...value, value: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label className="text-[10px]">Label affiché</Label>
          <Input
            value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value })}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-3">
      {(["min", "max", "step", "default"] as const).map((k) => (
        <div key={k}>
          <Label className="text-[10px] capitalize">{k}</Label>
          <Input
            type="number"
            value={value[k]}
            onChange={(e) =>
              onChange({ ...value, [k]: Number(e.target.value) })
            }
          />
        </div>
      ))}
    </div>
  );
}
