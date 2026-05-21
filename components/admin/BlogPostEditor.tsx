"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { StringListEditor } from "@/components/admin/StringListEditor";
import { slugify } from "@/lib/slugify";
import { updateBlogPost, deleteBlogPost } from "@/app/admin/blog/actions";
import type { TipTapDoc } from "@/lib/tiptap";

type Initial = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  content: TipTapDoc;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seoTitle: string | null;
  seoDescription: string | null;
};

export function BlogPostEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [state, setState] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);
  const [showSeo, setShowSeo] = React.useState(false);

  async function save(nextStatus?: Initial["status"]) {
    setBusy(true);
    try {
      const payload = { ...state, status: nextStatus ?? state.status };
      const result = await updateBlogPost(payload);
      if (result.ok) {
        setState((s) => ({ ...s, status: payload.status }));
        toast.success("Billet enregistré");
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
    if (!confirm("Supprimer ce billet définitivement ?")) return;
    setBusy(true);
    try {
      await deleteBlogPost(state.slug);
      toast.success("Billet supprimé");
      router.push("/admin/blog");
    } catch (err) {
      console.error(err);
      toast.error("Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/blog">
            <ArrowLeft className="size-4" /> Tous les billets
          </Link>
        </Button>
        {state.status === "PUBLISHED" && (
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/blog/${state.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="sticky top-16 z-30 -mx-6 sm:-mx-10 px-6 sm:px-10 py-3 bg-cream-50/90 backdrop-blur border-y border-cream-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
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
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={remove} disabled={busy}>
            <Trash2 className="size-4" /> Supprimer
          </Button>
          {state.status !== "PUBLISHED" && (
            <Button
              variant="solid"
              size="sm"
              disabled={busy}
              onClick={() => save("PUBLISHED")}
            >
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
        <div>
          <Label required>Titre</Label>
          <Input
            value={state.title}
            onChange={(e) => setState({ ...state, title: e.target.value })}
            className="text-lg font-medium"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Slug (URL)</Label>
            <div className="flex gap-2">
              <Input
                value={state.slug}
                onChange={(e) =>
                  setState({ ...state, slug: slugify(e.target.value) })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setState({ ...state, slug: slugify(state.title) })
                }
              >
                Régénérer
              </Button>
            </div>
          </div>
          <div>
            <StringListEditor
              label="Tags"
              value={state.tags}
              onChange={(tags) => setState({ ...state, tags })}
              placeholder="Ex: cocktails"
            />
          </div>
        </div>
        <div>
          <Label>Extrait (résumé court affiché en liste)</Label>
          <Textarea
            rows={2}
            value={state.excerpt ?? ""}
            onChange={(e) => setState({ ...state, excerpt: e.target.value })}
          />
        </div>
      </section>

      {/* Cover */}
      <section className="rounded-xl bg-background ring-1 ring-border p-6">
        <h2 className="font-display text-lg font-semibold mb-3">Image de couverture</h2>
        <MediaUploader
          value={state.coverImageUrl ?? undefined}
          altText={state.title}
          onChange={(asset) =>
            setState({ ...state, coverImageUrl: asset?.url ?? null })
          }
          subdir="blog"
        />
      </section>

      {/* Editor */}
      <section className="rounded-xl bg-background ring-1 ring-border p-3">
        <TipTapEditor
          value={state.content}
          onChange={(content) => setState({ ...state, content })}
          imageSubdir="blog"
          placeholder="Écrivez votre billet…"
        />
      </section>

      {/* SEO accordion */}
      <section className="rounded-xl bg-background ring-1 ring-border">
        <button
          type="button"
          onClick={() => setShowSeo((s) => !s)}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <span className="font-display text-lg font-semibold">SEO</span>
          <span className="text-xs text-muted-foreground">
            {showSeo ? "Masquer" : "Afficher"}
          </span>
        </button>
        {showSeo && (
          <div className="border-t border-border p-5 space-y-4">
            <div>
              <Label>Titre SEO (≤ 60 caractères recommandé)</Label>
              <Input
                value={state.seoTitle ?? ""}
                onChange={(e) =>
                  setState({ ...state, seoTitle: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Description SEO (≤ 160 caractères recommandé)</Label>
              <Textarea
                rows={2}
                value={state.seoDescription ?? ""}
                onChange={(e) =>
                  setState({ ...state, seoDescription: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
