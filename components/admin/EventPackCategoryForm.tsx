"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { slugify } from "@/lib/slugify";
import {
  updateCategoryMeta,
  createCategory,
  deleteCategory,
} from "@/app/admin/catalog/event-packs/actions";

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

export function EventPackCategoryForm({
  initial,
  mode = "edit",
}: {
  initial: Props;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [state, setState] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);
  // In create mode the slug auto-follows the name until the user edits it.
  const [slugDirty, setSlugDirty] = React.useState(false);

  function setName(name: string) {
    setState((s) => ({
      ...s,
      name,
      slug: mode === "create" && !slugDirty ? slugify(name) : s.slug,
    }));
  }

  async function save() {
    setBusy(true);
    try {
      if (mode === "create") {
        const result = await createCategory(state);
        if (result.ok) {
          toast.success("Pack créé");
          router.push(`/admin/catalog/event-packs/${result.slug}`);
        } else {
          toast.error(result.message ?? "Échec");
        }
      } else {
        const result = await updateCategoryMeta(state);
        if (result.ok) toast.success("Catégorie enregistrée");
        else toast.error(result.message ?? "Échec");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (
      !window.confirm(
        `Supprimer le pack « ${state.name} » et toutes ses formules ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const result = await deleteCategory(state.slug);
      if (result.ok) {
        toast.success("Pack supprimé");
        router.push("/admin/catalog/event-packs");
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

  return (
    <section className="rounded-xl bg-background ring-1 ring-border p-6">
      <header className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-lg font-semibold">Catégorie</h2>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <Button
              onClick={remove}
              variant="ghost"
              size="sm"
              disabled={busy}
              className="text-danger hover:text-danger"
            >
              <Trash2 className="size-4" /> Supprimer
            </Button>
          )}
          <Button onClick={save} variant="solid" size="sm" disabled={busy}>
            <Save className="size-4" />{" "}
            {mode === "create" ? "Créer le pack" : "Enregistrer"}
          </Button>
        </div>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label required>Nom</Label>
          <Input value={state.name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label required>Badge</Label>
          <Input
            value={state.badge}
            onChange={(e) => setState({ ...state, badge: e.target.value })}
          />
        </div>

        {mode === "create" && (
          <div className="md:col-span-2">
            <Label required>Slug (URL)</Label>
            <Input
              value={state.slug}
              onChange={(e) => {
                setSlugDirty(true);
                setState({ ...state, slug: e.target.value });
              }}
              placeholder="ex: mariage"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              /nos-packs/{state.slug || "…"} — minuscules, sans espaces ni
              accents.
            </p>
          </div>
        )}

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
                    guestCountConfig: {
                      kind: "fixed",
                      value: 30,
                      label: "~ 30 personnes",
                    },
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
