/**
 * Type-safe environment validation. Failing-loud beats silent runtime
 * surprises in production.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   if (env.DATABASE_URL) { ... }
 *
 * In dev, missing optional vars are tolerated and `env.X` returns undefined.
 * In production, the schema is parsed once at server-process boot; if a
 * required-in-prod var is missing, we log a warning but don't crash the build
 * (so previews still work).
 */
import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Database
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  // Supabase (server-only)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  // Email (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_TLS_REJECT_UNAUTHORIZED: z.string().optional(),
  EMAIL_FROM_NOREPLY: z.string().optional(),
  QUOTE_TO_EMAIL: z.string().email().optional(),
  CONTACT_TO_EMAIL: z.string().email().optional(),
  // Admin auth (self-contained email + password → signed cookie)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  // Legacy allowlist (still used by the Supabase-backed customer session)
  ADMIN_EMAILS: z.string().optional(),
  ADMIN_DEV_BYPASS: z.string().optional(),
  // Tax
  TVA_RATE: z.coerce.number().optional(),
  // Sentry (server)
  SENTRY_DSN: z.string().url().optional(),
  // HubSpot (server-side push)
  HUBSPOT_API_KEY: z.string().optional(),
  HUBSPOT_PIPELINE: z.string().optional(),
  HUBSPOT_STAGE_NEW: z.string().optional(),
  HUBSPOT_STAGE_QUALIFIED: z.string().optional(),
  HUBSPOT_STAGE_QUOTE_SENT: z.string().optional(),
  HUBSPOT_STAGE_CLOSED_WON: z.string().optional(),
  HUBSPOT_STAGE_CLOSED_LOST: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

function parseEnv() {
  const server = serverSchema.safeParse(process.env);
  const client = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });

  if (!server.success) {
    console.error("[env] invalid server env vars", server.error.flatten().fieldErrors);
  }
  if (!client.success) {
    console.error("[env] invalid client env vars", client.error.flatten().fieldErrors);
  }

  return {
    ...(server.success ? server.data : {}),
    ...(client.success ? client.data : {}),
  };
}

// Eager parse at module load (server-side; on the client only the
// NEXT_PUBLIC_* vars are accessible).
export const env = parseEnv() as Partial<
  z.infer<typeof serverSchema> & z.infer<typeof clientSchema>
>;

/**
 * Throw if a required env is missing. Use in server actions / route handlers
 * that absolutely need a value to function.
 */
export function requireEnv<K extends keyof typeof env>(
  key: K,
  errMsg?: string
): NonNullable<(typeof env)[K]> {
  const v = env[key];
  if (v == null || v === "") {
    throw new Error(errMsg ?? `Environment variable ${String(key)} is required.`);
  }
  return v as NonNullable<(typeof env)[K]>;
}

/**
 * Returns a clean object listing which optional integrations are available.
 * Useful for health checks + admin status pages.
 */
export function envSummary() {
  return {
    db: !!env.DATABASE_URL,
    supabase: !!env.NEXT_PUBLIC_SUPABASE_URL,
    adminAuth: !!(env.ADMIN_EMAIL && env.ADMIN_PASSWORD),
    smtp: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD),
    sentry: !!env.SENTRY_DSN || !!env.NEXT_PUBLIC_SENTRY_DSN,
    ga: !!env.NEXT_PUBLIC_GA_ID,
    hubspot: !!env.HUBSPOT_API_KEY,
    adminBypass:
      env.ADMIN_DEV_BYPASS === "1" || env.ADMIN_DEV_BYPASS === "true",
  };
}
