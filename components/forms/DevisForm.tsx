"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { submitGenericDevis } from "@/app/(marketing)/devis/actions";
import type { GenericDevisInput } from "@/lib/schemas";

const EVENT_TYPES = [
  "Réunion d'entreprise",
  "Séminaire / Conférence",
  "Cocktail / Buffet",
  "Formation",
  "Salon / Forum",
  "Tournage",
  "Autre",
] as const;

const SERVICE_TYPES = [
  "Pause café",
  "Pause déjeuner",
  "Cocktail dînatoire",
  "Station street-food",
] as const;

const EMPTY: GenericDevisInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  eventType: "Réunion d'entreprise",
  serviceType: "Pause café",
  guestCount: 20,
  eventDate: "",
  message: "",
  consentRgpd: false,
};

export function DevisForm({
  variant = "page",
}: {
  variant?: "page" | "section";
}) {
  const router = useRouter();
  const [state, setState] = React.useState<GenericDevisInput>(EMPTY);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  function patch<K extends keyof GenericDevisInput>(
    key: K,
    value: GenericDevisInput[K]
  ) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const result = await submitGenericDevis(state);
      if (result.ok) {
        toast.success("Demande envoyée !");
        router.push(`/devis-confirmation?ref=${encodeURIComponent(result.ref)}`);
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message ?? "Veuillez corriger les erreurs.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  const wrapClass =
    variant === "section"
      ? "rounded-2xl bg-background ring-1 ring-border shadow-md p-6 sm:p-10"
      : "rounded-2xl bg-background ring-1 ring-border shadow-md p-6 sm:p-10";

  return (
    <form onSubmit={onSubmit} className={wrapClass}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="d-firstName" required>Prénom</Label>
          <Input
            id="d-firstName"
            autoComplete="given-name"
            value={state.firstName}
            onChange={(e) => patch("firstName", e.target.value)}
            aria-invalid={!!errors.firstName}
          />
          <FieldError message={errors.firstName} />
        </div>
        <div>
          <Label htmlFor="d-lastName" required>Nom</Label>
          <Input
            id="d-lastName"
            autoComplete="family-name"
            value={state.lastName}
            onChange={(e) => patch("lastName", e.target.value)}
            aria-invalid={!!errors.lastName}
          />
          <FieldError message={errors.lastName} />
        </div>
        <div>
          <Label htmlFor="d-phone" required>Téléphone</Label>
          <Input
            id="d-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+216 …"
            value={state.phone}
            onChange={(e) => patch("phone", e.target.value)}
            aria-invalid={!!errors.phone}
          />
          <FieldError message={errors.phone} />
        </div>
        <div>
          <Label htmlFor="d-email" required>Email</Label>
          <Input
            id="d-email"
            type="email"
            autoComplete="email"
            value={state.email}
            onChange={(e) => patch("email", e.target.value)}
            aria-invalid={!!errors.email}
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label htmlFor="d-eventType" required>Type d&apos;événement</Label>
          <select
            id="d-eventType"
            value={state.eventType}
            onChange={(e) =>
              patch("eventType", e.target.value as GenericDevisInput["eventType"])
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <FieldError message={errors.eventType} />
        </div>
        <div>
          <Label htmlFor="d-serviceType" required>Type de service</Label>
          <select
            id="d-serviceType"
            value={state.serviceType}
            onChange={(e) =>
              patch("serviceType", e.target.value as GenericDevisInput["serviceType"])
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <FieldError message={errors.serviceType} />
        </div>
        <div>
          <Label htmlFor="d-guestCount" required>Nombre de personnes</Label>
          <Input
            id="d-guestCount"
            type="number"
            min={1}
            value={state.guestCount}
            onChange={(e) => patch("guestCount", parseInt(e.target.value, 10) || 0)}
            aria-invalid={!!errors.guestCount}
          />
          <FieldError message={errors.guestCount} />
        </div>
        <div>
          <Label htmlFor="d-eventDate">Date de l&apos;événement (optionnel)</Label>
          <Input
            id="d-eventDate"
            type="date"
            value={state.eventDate ?? ""}
            onChange={(e) => patch("eventDate", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5">
        <Label htmlFor="d-message">Message / précisions (optionnel)</Label>
        <Textarea
          id="d-message"
          rows={3}
          placeholder="Allergies, contraintes, contexte de l'événement…"
          value={state.message ?? ""}
          onChange={(e) => patch("message", e.target.value)}
        />
      </div>

      <label className="mt-5 flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={state.consentRgpd}
          onCheckedChange={(v) => patch("consentRgpd", v === true)}
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

      <div className="mt-7 flex justify-end">
        <Button type="submit" variant="accent" size="lg" disabled={submitting}>
          <Send className="size-4" />
          {submitting ? "Envoi…" : "Envoyer ma demande"}
        </Button>
      </div>
    </form>
  );
}
