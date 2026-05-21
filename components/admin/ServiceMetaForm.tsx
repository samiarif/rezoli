"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StringListEditor } from "@/components/admin/StringListEditor";
import { MediaUploader } from "@/components/admin/MediaUploader";
import type { ServiceMeta } from "@/lib/service-catalog";
import { updateServiceMeta } from "@/app/admin/catalog/services/actions";

export function ServiceMetaForm({ service }: { service: ServiceMeta }) {
  const [state, setState] = React.useState({
    slug: service.slug,
    name: service.name,
    shortName: service.shortName,
    tagline: service.tagline,
    description: service.description,
    longDescription: service.longDescription,
    highlights: service.highlights,
    minGuests: service.minGuests,
    startingPriceTND: service.startingPriceTND,
    badge: service.badge ?? "",
    imageUrl: service.image,
    imageAlt: service.imageAlt,
    order: 0,
    published: true,
  });
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      const result = await updateServiceMeta({
        ...state,
        badge: state.badge || null,
      });
      if (result.ok) toast.success("Service mis à jour");
      else toast.error(result.message ?? "Échec");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl bg-background ring-1 ring-border p-6">
      <header className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg font-semibold">Méta</h2>
        <Button onClick={save} variant="solid" size="sm" disabled={busy}>
          <Save className="size-4" /> {busy ? "Enregistrement…" : "Enregistrer"}
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
          <Label required>Nom court</Label>
          <Input
            value={state.shortName}
            onChange={(e) => setState({ ...state, shortName: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Label required>Accroche</Label>
          <Input
            value={state.tagline}
            onChange={(e) => setState({ ...state, tagline: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Label required>Description courte</Label>
          <Textarea
            rows={2}
            value={state.description}
            onChange={(e) =>
              setState({ ...state, description: e.target.value })
            }
          />
        </div>
        <div className="md:col-span-2">
          <Label required>Description longue</Label>
          <Textarea
            rows={4}
            value={state.longDescription}
            onChange={(e) =>
              setState({ ...state, longDescription: e.target.value })
            }
          />
        </div>
        <div>
          <Label required>Min. invités</Label>
          <Input
            type="number"
            value={state.minGuests}
            onChange={(e) =>
              setState({ ...state, minGuests: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label required>Prix de départ (TND)</Label>
          <Input
            type="number"
            step="0.01"
            value={state.startingPriceTND}
            onChange={(e) =>
              setState({
                ...state,
                startingPriceTND: Number(e.target.value),
              })
            }
          />
        </div>
        <div>
          <Label>Badge (ex: Nouveau, Signature)</Label>
          <Input
            value={state.badge ?? ""}
            onChange={(e) => setState({ ...state, badge: e.target.value })}
          />
        </div>
        <div>
          <Label>Alt image</Label>
          <Input
            value={state.imageAlt ?? ""}
            onChange={(e) => setState({ ...state, imageAlt: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Image héro</Label>
          <MediaUploader
            value={state.imageUrl}
            altText={state.imageAlt}
            onChange={(asset) =>
              setState({ ...state, imageUrl: asset?.url ?? "" })
            }
            subdir={`services/${state.slug}`}
          />
        </div>
        <div className="md:col-span-2">
          <StringListEditor
            label="Points forts (affichés dans la liste des services)"
            value={state.highlights}
            onChange={(highlights) => setState({ ...state, highlights })}
            placeholder="Ajouter un point fort…"
          />
        </div>
        <label className="md:col-span-2 flex items-center gap-2">
          <Checkbox
            checked={state.published}
            onCheckedChange={(v) =>
              setState({ ...state, published: v === true })
            }
          />
          <span className="text-sm">Publié (visible sur le site)</span>
        </label>
      </div>
    </section>
  );
}
