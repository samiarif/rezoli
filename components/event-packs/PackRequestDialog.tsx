"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Separator } from "@/components/ui/separator";
import { formatTND } from "@/lib/utils";
import { submitPackRequest } from "@/app/(marketing)/nos-packs/actions";
import type {
  PackCategory,
  PackTier,
} from "@/lib/event-packs-catalog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: PackCategory;
  tier: PackTier;
  guestCount: number;
  selectedOptions: string[];
  packPriceHT: number;
  optionsTotalHT: number;
};

export function PackRequestDialog({
  open,
  onOpenChange,
  category,
  tier,
  guestCount,
  selectedOptions,
  packPriceHT,
  optionsTotalHT,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [form, setForm] = React.useState({
    eventDate: "",
    eventTime: "",
    location: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    consentRgpd: false,
  });

  React.useEffect(() => {
    if (!open) {
      // Reset error state when dialog closes; legitimate sync of state to props.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrors({});
    }
  }, [open]);

  const subtotal = packPriceHT + optionsTotalHT;
  const tva = +(subtotal * 0.19).toFixed(3);
  const ttc = +(subtotal + tva).toFixed(3);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const result = await submitPackRequest({
        packCategory: category.slug,
        packTier: tier.id,
        guestCount,
        options: selectedOptions,
        eventDate: form.eventDate,
        eventTime: form.eventTime || undefined,
        location: form.location,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        company: form.company || undefined,
        message: form.message || undefined,
        consentRgpd: form.consentRgpd,
      });
      if (result.ok) {
        router.push(`/devis-confirmation?ref=${encodeURIComponent(result.ref)}`);
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message ?? "Veuillez corriger les erreurs.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogTitle>Demander : {tier.name}</DialogTitle>
        <DialogDescription>
          {category.name} · {guestCount} invités. Notre équipe revient sous 24 h ouvrées.
        </DialogDescription>

        {/* Recap */}
        <div className="rounded-lg bg-cream-50 ring-1 ring-cream-100 p-4 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pack HT</span>
            <span className="tabular-nums font-medium">{formatTND(packPriceHT)}</span>
          </div>
          {optionsTotalHT > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Options HT</span>
              <span className="tabular-nums font-medium">
                {formatTND(optionsTotalHT)}
              </span>
            </div>
          )}
          <Separator className="my-1.5" />
          <div className="flex justify-between text-muted-foreground">
            <span>TVA 19%</span>
            <span className="tabular-nums">{formatTND(tva)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total TTC</span>
            <span className="tabular-nums">{formatTND(ttc)}</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 mt-4" noValidate>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label required>Date</Label>
              <Input
                type="date"
                value={form.eventDate}
                onChange={(e) =>
                  setForm({ ...form, eventDate: e.target.value })
                }
                aria-invalid={!!errors.eventDate}
              />
              <FieldError message={errors.eventDate} />
            </div>
            <div>
              <Label>Heure</Label>
              <Input
                type="time"
                value={form.eventTime}
                onChange={(e) =>
                  setForm({ ...form, eventTime: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label required>Lieu</Label>
            <Input
              placeholder="Adresse ou nom du lieu"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              aria-invalid={!!errors.location}
            />
            <FieldError message={errors.location} />
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label required>Prénom</Label>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
              />
              <FieldError message={errors.firstName} />
            </div>
            <div>
              <Label required>Nom</Label>
              <Input
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
              />
              <FieldError message={errors.lastName} />
            </div>
            <div>
              <Label required>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
              <FieldError message={errors.email} />
            </div>
            <div>
              <Label required>Téléphone</Label>
              <Input
                type="tel"
                placeholder="+216 …"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoComplete="tel"
                aria-invalid={!!errors.phone}
              />
              <FieldError message={errors.phone} />
            </div>
          </div>

          <div>
            <Label>Société (optionnel)</Label>
            <Input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              autoComplete="organization"
            />
          </div>

          <div>
            <Label>Message (optionnel)</Label>
            <Textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Précisions, contraintes, allergies…"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={form.consentRgpd}
              onCheckedChange={(v) =>
                setForm({ ...form, consentRgpd: v === true })
              }
              aria-invalid={!!errors.consentRgpd}
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              J&apos;accepte que mes données soient utilisées pour traiter ma
              demande, conformément à la{" "}
              <Link
                href="/politique-confidentialite"
                className="underline hover:text-teal-700"
              >
                politique de confidentialité
              </Link>
              .
            </span>
          </label>
          <FieldError message={errors.consentRgpd} />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={submitting}
            >
              <Send className="size-4" />
              {submitting ? "Envoi…" : "Envoyer ma demande"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
