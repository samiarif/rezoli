"use server";

import { redirect } from "next/navigation";
import { adminLoginSchema } from "@/lib/schemas";
import {
  verifyAdminCredentials,
  setAdminSession,
  clearAdminSession,
} from "@/lib/auth";

export type AdminLoginResult = { ok: true } | { ok: false; error: string };

export async function loginAdmin(input: {
  email: string;
  password: string;
}): Promise<AdminLoginResult> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Identifiants invalides.",
    };
  }
  const { email, password } = parsed.data;
  if (!verifyAdminCredentials(email, password)) {
    return { ok: false, error: "Email ou mot de passe incorrect." };
  }
  await setAdminSession(email);
  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
