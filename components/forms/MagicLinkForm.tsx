"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { magicLinkSchema } from "@/lib/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function MagicLinkForm({
  purpose,
}: {
  purpose: "customer" | "admin";
}) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = magicLinkSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email invalide");
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setError(
        "Authentification non configurée — connectez Supabase pour activer la connexion."
      );
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}${
        purpose === "admin" ? "/admin/auth/callback" : "/compte/auth/callback"
      }`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      if (authError) {
        setError(authError.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center rounded-lg bg-teal-50 border border-teal-100 p-5">
        <p className="font-medium text-teal-800">Lien envoyé !</p>
        <p className="mt-2 text-sm text-teal-900/80">
          Consultez votre boîte mail à <strong>{email}</strong> et cliquez sur
          le lien pour vous connecter. Il expire dans 10 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div>
        <Label htmlFor="magic-email">Email</Label>
        <Input
          id="magic-email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
        />
        <FieldError message={error ?? undefined} />
      </div>
      <Button type="submit" variant="solid" size="lg" className="w-full" disabled={submitting}>
        <Send className="size-4" />
        {submitting ? "Envoi…" : "Recevoir mon lien"}
      </Button>
    </form>
  );
}
