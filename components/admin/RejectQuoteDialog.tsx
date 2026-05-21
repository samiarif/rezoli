"use client";

import * as React from "react";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { REJECTION_REASONS, type RejectionReasonKey } from "@/lib/rejection-reasons";
import { rejectQuote } from "@/app/admin/devis/actions";

export function RejectQuoteDialog({
  quoteRef,
}: {
  quoteRef: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<RejectionReasonKey | "">("");
  const [alternative, setAlternative] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit() {
    if (!reason) {
      toast.error("Choisissez un motif de refus.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await rejectQuote({
        ref: quoteRef,
        reason: reason as RejectionReasonKey,
        alternativeProposal: alternative.trim() || undefined,
      });
      if (res.ok) {
        toast.success("Demande refusée — email envoyé au client.");
        setOpen(false);
        setReason("");
        setAlternative("");
      } else {
        toast.error(res.message ?? "Échec du refus.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-danger border-danger/40 hover:bg-danger/5">
          <XCircle className="size-4" />
          Refuser la demande
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Refuser la demande {quoteRef}</DialogTitle>
          <DialogDescription>
            Sélectionnez le motif de refus. Le client recevra un email
            explicatif. Vous pouvez aussi proposer une alternative.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <fieldset>
            <legend className="text-sm font-medium mb-2">Motif</legend>
            <ul className="space-y-2 max-h-72 overflow-y-auto rounded-md border border-border p-3 bg-cream-50/50">
              {REJECTION_REASONS.map((r) => (
                <li key={r.key}>
                  <label className="flex items-start gap-3 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="reason"
                      value={r.key}
                      checked={reason === r.key}
                      onChange={() => setReason(r.key)}
                      className="mt-1 accent-teal-600"
                    />
                    <span>{r.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <div>
            <Label htmlFor="alt">Proposer une alternative (optionnel)</Label>
            <Textarea
              id="alt"
              rows={4}
              placeholder="Ex. : « Nous pouvons vous proposer un format pause café à 35 invités à la place… »"
              value={alternative}
              onChange={(e) => setAlternative(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Le texte sera inclus dans l&apos;email envoyé au client.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting || !reason}
            variant="solid"
            className="bg-danger hover:bg-danger/90"
          >
            {submitting ? "Envoi…" : "Confirmer le refus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
