"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import {
  submitPartnerApplication,
  type PartnerActionState,
} from "@/app/(marketing)/devenir-partenaire/actions";

const initial: PartnerActionState = { ok: false };

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="solid" size="lg" disabled={pending}>
      <Handshake className="size-4" />
      {pending ? "Envoi…" : "Envoyer ma candidature"}
    </Button>
  );
}

const TYPES = [
  { value: "SUPPLIER", label: "Fournisseur produit" },
  { value: "VENUE", label: "Lieu / espace événementiel" },
  { value: "FREELANCER", label: "Chef / freelance" },
  { value: "OTHER", label: "Autre" },
];

export function PartnerForm() {
  const [state, action] = useActionState(submitPartnerApplication, initial);

  if (state.ok) {
    return (
      <div className="rounded-xl bg-teal-50 border border-teal-100 p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-teal-800">
          Candidature reçue 🎉
        </h2>
        <p className="mt-3 text-sm text-teal-900/80 max-w-md mx-auto">
          {state.message}
        </p>
        <Button asChild variant="ghost" className="mt-5">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    );
  }

  const err = state.errors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="companyName" required>Nom de la structure</Label>
          <Input
            id="companyName"
            name="companyName"
            required
            aria-invalid={!!err.companyName}
          />
          <FieldError message={err.companyName} />
        </div>
        <div>
          <Label htmlFor="contactName" required>Personne à contacter</Label>
          <Input
            id="contactName"
            name="contactName"
            required
            aria-invalid={!!err.contactName}
          />
          <FieldError message={err.contactName} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            aria-invalid={!!err.email}
            autoComplete="email"
          />
          <FieldError message={err.email} />
        </div>
        <div>
          <Label htmlFor="phone" required>Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            aria-invalid={!!err.phone}
            autoComplete="tel"
            placeholder="+216 …"
          />
          <FieldError message={err.phone} />
        </div>
      </div>

      <div>
        <Label htmlFor="partnerType" required>Type de partenariat</Label>
        <select
          id="partnerType"
          name="partnerType"
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="message">Présentation</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Parlez-nous de votre activité et de ce que vous proposez…"
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox id="consentRgpd" name="consentRgpd" required aria-invalid={!!err.consentRgpd} />
        <Label
          htmlFor="consentRgpd"
          className="text-xs text-muted-foreground leading-relaxed mb-0"
        >
          J&apos;accepte que mes données soient utilisées pour étudier ma
          candidature, conformément à la{" "}
          <Link href="/politique-confidentialite" className="underline hover:text-teal-700">
            politique de confidentialité
          </Link>
          .
        </Label>
      </div>
      <FieldError message={err.consentRgpd} />

      <SubmitBtn />
    </form>
  );
}
