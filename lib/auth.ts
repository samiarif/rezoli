import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}

/** Dev-only escape hatch so the admin UI can be browsed without Supabase. */
export function isAdminDevBypass(): boolean {
  return process.env.ADMIN_DEV_BYPASS === "1" || process.env.ADMIN_DEV_BYPASS === "true";
}

type Session = {
  user: { id: string; email?: string | null };
  isAdmin: boolean;
  demo?: boolean;
};

function devSession(): Session {
  return {
    user: { id: "dev-admin", email: "dev@rezoli.local" },
    isAdmin: true,
    demo: true,
  };
}

export async function getSession(): Promise<Session | null> {
  if (isAdminDevBypass()) return devSession();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { user: { id: user.id, email: user.email }, isAdmin: isAdminEmail(user.email) };
}

export async function requireSession(redirectTo: string) {
  const session = await getSession();
  if (!session) redirect(redirectTo);
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) redirect("/admin/login");
  return session;
}

export async function requireCustomer() {
  return await requireSession("/compte/login");
}
