"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptQuote } from "@/app/admin/devis/actions";

export function AcceptQuoteButton({ quoteRef }: { quoteRef: string }) {
  const [submitting, setSubmitting] = React.useState(false);

  async function onClick() {
    if (
      !window.confirm(
        "Confirmer l'acceptation ? Un email récapitulatif sera envoyé au client."
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await acceptQuote(quoteRef);
      if (res.ok) {
        toast.success("Demande acceptée — email envoyé.");
      } else {
        toast.error(res.message ?? "Échec.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={submitting}
      variant="solid"
      size="sm"
      className="bg-emerald-600 hover:bg-emerald-700"
    >
      <CheckCircle2 className="size-4" />
      {submitting ? "Envoi…" : "Accepter la demande"}
    </Button>
  );
}
