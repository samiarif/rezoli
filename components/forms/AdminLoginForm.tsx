"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { loginAdmin } from "@/app/admin/login/actions";

export function AdminLoginForm({ redirectTo = "/admin" }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginAdmin({ email, password });
      if (res.ok) {
        router.replace(redirectTo);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div>
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@rezoli.tn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
        />
      </div>
      <div>
        <Label htmlFor="admin-password">Mot de passe</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
        />
        <FieldError message={error ?? undefined} />
      </div>
      <Button
        type="submit"
        variant="solid"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        <LogIn className="size-4" />
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
