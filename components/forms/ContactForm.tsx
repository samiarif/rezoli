"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
type ContactActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

// Submits to the Route Handler at app/api/contact/route.ts (validate → persist
// → email the owner). Shaped as a useActionState reducer so the form UX and the
// <SubmitButton> pending state below stay exactly the same.
async function submitContactMessage(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? "") || undefined,
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    consentRgpd: formData.get("consentRgpd") === "on",
  };
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await res.json()) as ContactActionState;
  } catch {
    return {
      ok: false,
      message: "Une erreur réseau est survenue. Merci de réessayer.",
    };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="solid" size="lg">
      <Send className="size-4" />
      {pending ? "Envoi…" : "Envoyer le message"}
    </Button>
  );
}

const initial: ContactActionState = { ok: false };

export function ContactForm() {
  const [state, action] = useActionState(submitContactMessage, initial);

  if (state.ok) {
    return (
      <div className="rounded-xl bg-teal-50 border border-teal-100 p-6 text-center">
        <p className="font-display text-xl font-semibold text-teal-800">
          Message reçu !
        </p>
        <p className="mt-2 text-sm text-teal-900/80 max-w-md mx-auto">
          {state.message}
        </p>
        <Button asChild variant="ghost" className="mt-4">
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
          <Label htmlFor="name" required>Nom complet</Label>
          <Input
            id="name"
            name="name"
            required
            aria-invalid={!!err.name}
            aria-describedby={err.name ? "err-name" : undefined}
            autoComplete="name"
          />
          <FieldError id="err-name" message={err.name} />
        </div>
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            required
            aria-invalid={!!err.email}
            aria-describedby={err.email ? "err-email" : undefined}
            autoComplete="email"
          />
          <FieldError id="err-email" message={err.email} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            aria-invalid={!!err.phone}
            aria-describedby={err.phone ? "err-phone" : undefined}
            autoComplete="tel"
            placeholder="+216 …"
          />
          <FieldError id="err-phone" message={err.phone} />
        </div>
        <div>
          <Label htmlFor="subject" required>Sujet</Label>
          <Input
            id="subject"
            name="subject"
            required
            aria-invalid={!!err.subject}
            aria-describedby={err.subject ? "err-subject" : undefined}
          />
          <FieldError id="err-subject" message={err.subject} />
        </div>
      </div>

      <div>
        <Label htmlFor="message" required>Votre message</Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={!!err.message}
          aria-describedby={err.message ? "err-message" : undefined}
        />
        <FieldError id="err-message" message={err.message} />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="consentRgpd"
          name="consentRgpd"
          required
          aria-invalid={!!err.consentRgpd}
          aria-describedby={err.consentRgpd ? "err-consent" : undefined}
        />
        <Label htmlFor="consentRgpd" className="text-xs text-muted-foreground leading-relaxed mb-0">
          J&apos;accepte que mes données soient utilisées pour répondre à ma
          demande, conformément à la{" "}
          <Link
            href="/politique-confidentialite"
            className="underline hover:text-teal-700"
          >
            politique de confidentialité
          </Link>
          .
        </Label>
      </div>
      <FieldError id="err-consent" message={err.consentRgpd} />

      {state.message && !state.ok && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
