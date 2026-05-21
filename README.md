# Rezoli — Traiteur événementiel premium

Production platform for a Tunisian B2B catering business. Next.js 16 (App Router) + Supabase (Postgres + Auth + Storage) + Prisma + Tailwind v4 + shadcn-style components.

## What's in the box

- **Public marketing site** in French — home, services + 4 service detail pages, packs (with audience tabs), partners, about, contact (DB-persisted), become-partner (DB-persisted), legal pages.
- **Cart-based quote flow** (`/panier`): users add services/packs, edit quantities, then go through a 3-step `/devis` form (event details → contact → review) that submits to Postgres via a Server Action and emails customer + admin via Resend.
- **Customer area** at `/compte` with magic-link login: list of your quotes, status timeline, reorder.
- **Admin dashboard** at `/admin` (email allowlist): KPI dashboard, quote table with filter/search, quote detail with status workflow + internal notes + history, partner applications, contact messages, clients.
- **SEO**: per-route metadata, JSON-LD (`FoodEstablishment`, `Service`, `BreadcrumbList`, `FAQPage`), sitemap, robots, branded `@vercel/og` social image.
- **A11y**: skip-link, focus rings everywhere, semantic landmarks, Radix-based primitives, `prefers-reduced-motion` honoured.
- **GDPR / CNIL**: cookie banner blocking non-essential cookies by default, refreshed privacy policy.

## Quickstart

```bash
pnpm install
cp .env.example .env.local           # fill in Supabase, Resend, ADMIN_EMAILS
pnpm db:generate                     # generate Prisma client
pnpm db:migrate                      # run migrations against Supabase Postgres
pnpm dev                             # http://localhost:3000
```

Build & start:

```bash
pnpm build && pnpm start
```

Type-check / lint:

```bash
pnpm typecheck
pnpm lint
```

## Environment

See `.env.example`. The site degrades gracefully when env is missing:
- No Supabase → admin / `/compte` show a "not yet activated" placeholder; site still works.
- No `DATABASE_URL` → quote submissions log to the server console.
- No `RESEND_API_KEY` → emails are skipped (logged).

## Domain wiring (production)

- Vercel project pointed at `rezoli.tn`.
- DNS for Resend: SPF / DKIM / DMARC records on `rezoli.tn`.
- Supabase project with Auth → SMTP → Resend (override default sender) and a `quotes` storage bucket for final-quote PDFs.
- `ADMIN_EMAILS` includes the email(s) allowed into `/admin`.

## Important paths

- `app/(marketing)` — public marketing pages.
- `app/(legal)` — legal pages with prose container.
- `app/devis` — 3-step quote flow + Server Action + confirmation.
- `app/panier` — cart full review.
- `app/compte` — customer area (magic link).
- `app/admin` — admin dashboard.
- `prisma/schema.prisma` — DB schema.
- `lib/catalog.ts` — services + packs catalog (single source of truth).
- `lib/cart-store.ts` — Zustand cart + persist.
- `next.config.ts` — `.html` redirects to preserve old URLs.

## Open decisions (confirm before launch)

- **TVA rate** — assumed 19 % standard. Tunisia catering may qualify for 13 %. Configurable via `TVA_RATE` env var.
- **Currency** — TND. Verify against client price list.
- **Real photography** — current placeholders pull from Unsplash; swap with branded photography before launch.
- **PDF final quote** — admin can attach a PDF when the time comes; final-quote PDF generation is wired (`finalQuotePdfUrl` field) but the UI for it is a v2 admin feature.
