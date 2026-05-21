"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { slugify } from "@/lib/slugify";
import {
  updateRealisation,
  deleteRealisation,
} from "@/app/admin/realisations/actions";
import type { TipTapDoc } from "@/lib/tiptap";

type Outcome = { label: string; value: string };
type Testimonial = {
  author: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
};

type Initial = {
  slug: string;
  title: string;
  eventType: string;
  clientName: string | null;
  date: string | null;
  location: string | null;
  guestCount: number | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  gallery: string[];
  shortPitch: string;
  longContent: TipTapDoc | null;
  outcomes: Outcome[] | null;
  testimonial: Testimonial | null;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  order: number;
};

export function RealisationEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [state, setState] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);

  async function save(nextStatus?: Initial["status"]) {
    setBusy(true);
    try {
      const payload = { ...state, status: nextStatus ?? state.status };
      const result = await updateRealisation(payload);
      if (result.ok) {
        setState((s) => ({ ...s, status: payload.status }));
        toast.success("Réalisation enregistrée");
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

  async function remove() {
    if (!confirm("Supprimer cette réalisation ?")) return;
    setBusy(true);
    try {
      await deleteRealisation(state.slug);
      toast.success("Supprimé");
      router.push("/admin/realisations");
    } finally {
      setBusy(false);
    }
  }

  const addGallery = (url: string) =>
    setState({ ...state, gallery: [...state.gallery, url] });
  const removeGallery = (i: number) =>
    setState({ ...state, gallery: state.gallery.filter((_, j) => j !== i) });
  const moveGallery = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= state.gallery.length) return;
    const next = [...state.gallery];
    [next[i], next[j]] = [next[j], next[i]];
    setState({ ...state, gallery: next });
  };

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/realisations">
            <ArrowLeft className="size-4" /> Toutes les réalisations
          </Link>
        </Button>
        {state.status === "PUBLISHED" && (
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/realisations/${state.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <div className="sticky top-16 z-30 -mx-6 sm:-mx-10 px-6 sm:px-10 py-3 bg-cream-50/90 backdrop-blur border-y border-cream-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={state.featured}
              onCheckedChange={(v) => setState({ ...state, featured: v === true })}
            />
            <span>À la une (featured)</span>
          </label>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">Statut :</span>
          <select
            value={state.status}
            onChange={(e) =>
              setState({ ...state, status: e.target.value as Initial["status"] })
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={remove} disabled={busy}>
            <Trash2 className="size-4" /> Supprimer
          </Button>
          {state.status !== "PUBLISHED" && (
            <Button variant="solid" size="sm" disabled={busy} onClick={() => save("PUBLISHED")}>
              Publier
            </Button>
          )}
          <Button variant="accent" size="sm" disabled={busy} onClick={() => save()}>
            <Save className="size-4" />
            {busy ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>

      {/* Identity */}
      <section className="rounded-xl bg-background ring-1 ring-border p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Identité</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label required>Titre</Label>
            <Input
              value={state.title}
              onChange={(e) => setState({ ...state, title: e.target.value })}
              className="text-lg font-medium"
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={state.slug}
              onChange={(e) =>
                setState({ ...state, slug: slugify(e.target.value) })
              }
            />
          </div>
          <div>
            <Label required>Type d&apos;événement</Label>
            <Input
              value={state.eventType}
              onChange={(e) =>
                setState({ ...state, eventType: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Client</Label>
            <Input
              value={state.clientName ?? ""}
              onChange={(e) =>
                setState({ ...state, clientName: e.target.value || null })
              }
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={state.date ? state.date.slice(0, 10) : ""}
              onChange={(e) =>
                setState({ ...state, date: e.target.value || null })
              }
            />
          </div>
          <div>
            <Label>Lieu</Label>
            <Input
              value={state.location ?? ""}
              onChange={(e) =>
                setState({ ...state, location: e.target.value || null })
              }
            />
          </div>
          <div>
            <Label>Nombre d&apos;invités</Label>
            <Input
              type="number"
              value={state.guestCount ?? ""}
              onChange={(e) =>
                setState({
                  ...state,
                  guestCount: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label required>Pitch court</Label>
            <Textarea
              rows={2}
              value={state.shortPitch}
              onChange={(e) =>
                setState({ ...state, shortPitch: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {/* Visuel */}
      <section className="rounded-xl bg-background ring-1 ring-border p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Visuel</h2>
        <div>
          <Label>Image héro</Label>
          <MediaUploader
            value={state.heroImageUrl ?? undefined}
            altText={state.heroImageAlt ?? state.title}
            onChange={(asset) =>
              setState({ ...state, heroImageUrl: asset?.url ?? null })
            }
            subdir={`realisations/${state.slug}`}
          />
        </div>
        <div>
          <Label>Alt de l&apos;image héro</Label>
          <Input
            value={state.heroImageAlt ?? ""}
            onChange={(e) =>
              setState({ ...state, heroImageAlt: e.target.value || null })
            }
          />
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Galerie ({state.gallery.length} image{state.gallery.length > 1 ? "s" : ""})
          </p>
          {state.gallery.length > 0 && (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {state.gallery.map((url, i) => (
                <li
                  key={i}
                  className="relative aspect-[4/3] rounded-md overflow-hidden ring-1 ring-border group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end justify-between p-2 bg-gradient-to-t from-neutral-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveGallery(i, -1)}
                        disabled={i === 0}
                        className="bg-white/90 text-foreground rounded p-1 disabled:opacity-30"
                        aria-label="Reculer"
                      >
                        <ArrowUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGallery(i, 1)}
                        disabled={i === state.gallery.length - 1}
                        className="bg-white/90 text-foreground rounded p-1 disabled:opacity-30"
                        aria-label="Avancer"
                      >
                        <ArrowDown className="size-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGallery(i)}
                      className="bg-white/90 text-danger rounded p-1"
                      aria-label="Retirer"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <MediaUploader
            label="Ajouter une image à la galerie"
            onChange={(asset) => {
              if (asset?.url) addGallery(asset.url);
            }}
            subdir={`realisations/${state.slug}/gallery`}
          />
        </div>
      </section>

      {/* Optional long content */}
      <section className="rounded-xl bg-background ring-1 ring-border p-3">
        <header className="px-3 pt-3">
          <h2 className="font-display text-lg font-semibold">
            Étude de cas (optionnelle)
          </h2>
          <p className="text-xs text-muted-foreground px-0">
            Rédigez une étude de cas longue avec contexte, défi, solution, résultats.
          </p>
        </header>
        <div className="mt-3">
          <TipTapEditor
            value={state.longContent}
            onChange={(longContent) => setState({ ...state, longContent })}
            imageSubdir={`realisations/${state.slug}/content`}
            placeholder="Racontez l'histoire de cet événement…"
          />
        </div>
      </section>

      {/* Outcomes */}
      <OutcomesEditor
        value={state.outcomes ?? []}
        onChange={(outcomes) =>
          setState({
            ...state,
            outcomes: outcomes.length ? outcomes : null,
          })
        }
      />

      {/* Testimonial */}
      <TestimonialEditor
        value={state.testimonial}
        onChange={(testimonial) => setState({ ...state, testimonial })}
      />
    </div>
  );
}

function OutcomesEditor({
  value,
  onChange,
}: {
  value: Outcome[];
  onChange: (v: Outcome[]) => void;
}) {
  const update = (i: number, patch: Partial<Outcome>) =>
    onChange(value.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  const add = () => onChange([...value, { label: "Invités servis", value: "" }]);
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

  return (
    <section className="rounded-xl bg-background ring-1 ring-border p-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Résultats (optionnel)
          </h2>
          <p className="text-xs text-muted-foreground">
            Chiffres clés : invités, taux de satisfaction, plats servis, etc.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={add}>
          <Plus className="size-3.5" /> Ajouter
        </Button>
      </header>
      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucun résultat ajouté.</p>
      ) : (
        <ul className="space-y-2">
          {value.map((o, i) => (
            <li
              key={i}
              className="grid grid-cols-12 gap-2 items-end rounded-md bg-cream-50 p-3 ring-1 ring-border"
            >
              <div className="col-span-5">
                <Label className="text-[10px]">Libellé</Label>
                <Input
                  value={o.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                />
              </div>
              <div className="col-span-6">
                <Label className="text-[10px]">Valeur</Label>
                <Input
                  value={o.value}
                  onChange={(e) => update(i, { value: e.target.value })}
                  placeholder="Ex: 350 ou 98%"
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
    </section>
  );
}

function TestimonialEditor({
  value,
  onChange,
}: {
  value: Testimonial | null;
  onChange: (v: Testimonial | null) => void;
}) {
  const enabled = !!value;
  const v: Testimonial =
    value ?? {
      author: "",
      role: null,
      company: null,
      content: "",
      rating: 5,
    };
  return (
    <section className="rounded-xl bg-background ring-1 ring-border p-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Témoignage client (optionnel)
          </h2>
          <p className="text-xs text-muted-foreground">
            Quote du client à afficher en bas de la fiche.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={enabled}
            onCheckedChange={(c) => onChange(c === true ? v : null)}
          />
          <span>Inclure</span>
        </label>
      </header>
      {enabled && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label required>Auteur</Label>
            <Input
              value={v.author}
              onChange={(e) => onChange({ ...v, author: e.target.value })}
            />
          </div>
          <div>
            <Label>Rôle</Label>
            <Input
              value={v.role ?? ""}
              onChange={(e) => onChange({ ...v, role: e.target.value || null })}
            />
          </div>
          <div>
            <Label>Société</Label>
            <Input
              value={v.company ?? ""}
              onChange={(e) =>
                onChange({ ...v, company: e.target.value || null })
              }
            />
          </div>
          <div>
            <Label>Note (1-5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={v.rating ?? 5}
              onChange={(e) =>
                onChange({ ...v, rating: Number(e.target.value) })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label required>Texte du témoignage</Label>
            <Textarea
              rows={4}
              value={v.content}
              onChange={(e) => onChange({ ...v, content: e.target.value })}
            />
          </div>
        </div>
      )}
    </section>
  );
}
