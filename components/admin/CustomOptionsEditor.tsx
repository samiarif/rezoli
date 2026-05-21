"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StringListEditor } from "@/components/admin/StringListEditor";
import { replaceCustomOptions } from "@/app/admin/catalog/services/actions";

type Category = "boissons" | "sale" | "sucre";

const TITLES: Record<Category, string> = {
  boissons: "Boissons (palette personnalisé)",
  sale: "Salé (palette personnalisé)",
  sucre: "Sucré (palette personnalisé)",
};

const PLACEHOLDERS: Record<Category, string> = {
  boissons: "Ex: Eau, Citronnade…",
  sale: "Ex: Mini sandwich…",
  sucre: "Ex: Macaron…",
};

export function CustomOptionsEditor({
  serviceSlug,
  initial,
}: {
  serviceSlug: string;
  initial: { boissons: string[]; sale: string[]; sucre: string[] };
}) {
  return (
    <section className="rounded-xl bg-background ring-1 ring-border p-6">
      <header className="mb-5">
        <h2 className="font-display text-lg font-semibold">
          Options de personnalisation
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-prose">
          Catalogue des options disponibles quand le client choisit
          &laquo; Personnalisé &raquo; dans le formulaire de devis.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {(["boissons", "sale", "sucre"] as Category[]).map((cat) => (
          <CategoryEditor
            key={cat}
            serviceSlug={serviceSlug}
            category={cat}
            initial={initial[cat]}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryEditor({
  serviceSlug,
  category,
  initial,
}: {
  serviceSlug: string;
  category: Category;
  initial: string[];
}) {
  const [labels, setLabels] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      const result = await replaceCustomOptions({
        serviceSlug,
        category,
        labels,
      });
      if (result.ok) toast.success(`Options enregistrées (${category})`);
      else toast.error(result.message ?? "Échec");
    } catch (err) {
      console.error(err);
      toast.error("Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg bg-cream-50 p-4 ring-1 ring-border">
      <StringListEditor
        label={TITLES[category]}
        value={labels}
        onChange={setLabels}
        placeholder={PLACEHOLDERS[category]}
      />
      <Button
        onClick={save}
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        disabled={busy}
      >
        <Save className="size-4" /> Enregistrer
      </Button>
    </div>
  );
}
