import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventPackCategoryForm } from "@/components/admin/EventPackCategoryForm";

export const metadata: Metadata = {
  title: "Admin · Nouveau pack",
  robots: { index: false, follow: false },
};

export default function NewEventPackPage() {
  return (
    <div className="px-6 sm:px-10 py-8 space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/catalog/event-packs">
          <ArrowLeft className="size-4" /> Retour aux packs
        </Link>
      </Button>

      <header>
        <p className="eyebrow">Catalogue · Pack événementiel</p>
        <h1 className="display-2 mt-1">Nouveau pack</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Créez une nouvelle catégorie de pack. Vous pourrez ajouter des formules
          et des options après l&apos;enregistrement. Le pack reste en brouillon
          tant que vous ne l&apos;avez pas publié.
        </p>
      </header>

      <EventPackCategoryForm
        mode="create"
        initial={{
          slug: "",
          name: "",
          description: "",
          badge: "",
          tagline: "",
          guestCountConfig: {
            kind: "stepper",
            min: 50,
            max: 200,
            step: 10,
            default: 100,
          },
          order: 0,
          published: false,
        }}
      />
    </div>
  );
}
