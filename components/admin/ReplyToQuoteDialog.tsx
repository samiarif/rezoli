"use client";

import * as React from "react";
import { toast } from "sonner";
import { Send, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { replyToQuote } from "@/app/admin/devis/actions";

const TEMPLATES = [
  {
    id: "info",
    label: "Demander une précision",
    subject: "Une question sur votre demande",
    body:
      "Avant de finaliser votre devis, j'ai une petite question :\n\n— [votre question]\n\nUne fois que j'ai cette info, je vous renvoie une proposition détaillée dans la foulée.",
  },
  {
    id: "schedule",
    label: "Proposer un appel",
    subject: "Un appel pour caler les détails ?",
    body:
      "Pour bien comprendre vos attentes, est-ce qu'un appel rapide (15-20 min) cette semaine vous conviendrait ?\n\nVoici mes disponibilités :\n— [créneaux]\n\nDites-moi ce qui marche.",
  },
  {
    id: "followup",
    label: "Relance courtoise",
    subject: "Petit rappel — votre demande Rezoli",
    body:
      "Je voulais juste m'assurer que ma dernière proposition vous est bien parvenue.\n\nSi vous avez besoin d'ajustements, de plus d'options, ou si une autre date vous arrange, dites-le-moi — on s'adapte.",
  },
];

export function ReplyToQuoteDialog({
  open,
  onOpenChange,
  ref: quoteRef,
  customerEmail,
  customerName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ref: string;
  customerEmail: string;
  customerName: string;
}) {
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function applyTemplate(id: string) {
    const t = TEMPLATES.find((x) => x.id === id);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
  }

  async function onSend() {
    setBusy(true);
    try {
      const result = await replyToQuote({ ref: quoteRef, subject, body });
      if (result.ok) {
        toast.success("Email envoyé");
        setSubject("");
        setBody("");
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogTitle className="flex items-center gap-2">
          <Mail className="size-4 text-teal-700" />
          Répondre à {customerName}
        </DialogTitle>
        <DialogDescription>
          L&apos;email part de {process.env.NEXT_PUBLIC_EMAIL_FROM ?? "no-reply@rezoli.tn"} vers {customerEmail}.
        </DialogDescription>

        <div className="space-y-4 mt-2">
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.id)}
                className="rounded-full bg-cream-100 hover:bg-cream-50 px-3 py-1 text-xs ring-1 ring-border"
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <Label required>Sujet</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sujet de l'email"
            />
          </div>
          <div>
            <Label required>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder={`Bonjour ${customerName.split(" ")[0] || ""},\n\n`}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Les sauts de ligne sont préservés. Le message est précédé d&apos;une
              salutation automatique au prénom du client.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={onSend}
              disabled={busy || !subject.trim() || !body.trim()}
            >
              <Send className="size-4" />
              {busy ? "Envoi…" : "Envoyer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
