import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ────────────────────────────────────────────────────────────────────
// Admin auth — self-contained email + password, signed HttpOnly cookie.
// No external auth provider: credentials live in env (ADMIN_EMAIL /
// ADMIN_PASSWORD), the session is an HMAC-signed token. Runtime-only, so
// rotating the password is just an env edit + restart (no rebuild).
// ────────────────────────────────────────────────────────────────────

const ADMIN_COOKIE = "rezoli_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/** True once the admin login is usable (both credential vars present). */
export function isAdminConfigured(): boolean {
  return !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

/** Dev-only escape hatch so the admin UI can be browsed without auth. */
export function isAdminDevBypass(): boolean {
  return process.env.ADMIN_DEV_BYPASS === "1" || process.env.ADMIN_DEV_BYPASS === "true";
}

/**
 * Legacy allowlist check (comma-separated ADMIN_EMAILS). Retained for the
 * Supabase-backed customer session below; the admin flow no longer uses it.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}

/**
 * Cookie signing key. Prefer an explicit AUTH_SECRET; otherwise derive a
 * stable key from the credentials so a two-var setup still works. Rotating
 * either the password or the secret invalidates existing sessions.
 */
function signingKey(): string {
  const explicit = process.env.AUTH_SECRET;
  if (explicit) return explicit;
  return createHash("sha256")
    .update(`${process.env.ADMIN_PASSWORD ?? ""}:${process.env.ADMIN_EMAIL ?? ""}`)
    .digest("hex");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", signingKey()).update(payloadB64).digest("base64url");
}

/** Constant-time string compare (hash to fixed length to tolerate mismatch). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Validate raw credentials against env. Generic result (no field oracle). */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;
  const emailOk = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
  const passOk = safeEqual(password, adminPassword);
  return emailOk && passOk;
}

function createSessionToken(email: string): string {
  const payload = { email: email.trim().toLowerCase(), exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

function verifySessionToken(token: string | undefined): { email: string } | null {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (typeof payload.email !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

/** Issue an admin session cookie. Call from a Server Action / Route Handler. */
export async function setAdminSession(email: string): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSessionToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

/** Clear the admin session cookie. */
export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
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

/** Read + verify the admin session from the signed cookie. */
export async function getAdminSession(): Promise<Session | null> {
  if (isAdminDevBypass()) return devSession();
  const jar = await cookies();
  const verified = verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
  if (!verified) return null;
  return { user: { id: "admin", email: verified.email }, isAdmin: true };
}

export async function requireAdmin(): Promise<Session> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) redirect("/admin/login");
  return session;
}

// ────────────────────────────────────────────────────────────────────
// Customer auth — still backed by Supabase magic-link (separate flow).
// ────────────────────────────────────────────────────────────────────

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

export async function requireCustomer() {
  return await requireSession("/compte/login");
}
