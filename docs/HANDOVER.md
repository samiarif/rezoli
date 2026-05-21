# Rezoli — Handover technique

> **Cible** : développeur·se en charge du déploiement et de la maintenance de la plateforme Rezoli.
> **État** : application complète, prête à déployer. Reste à brancher les services tiers (Supabase, Resend, HubSpot, Vercel) et le domaine `rezoli.tn`.
> **Mode démo** : l'app tourne sans aucune dépendance externe via `ADMIN_DEV_BYPASS=1` (voir §10).

---

## 1. Stack

| Couche | Techno | Version |
|---|---|---|
| Framework | Next.js (App Router) | **16.2.6** |
| Runtime | React | **19.2.4** |
| Style | Tailwind CSS | **v4** (avec `@theme` tokens) |
| ORM | Prisma | **6.x** |
| DB | Postgres (via Supabase) | — |
| Auth | Supabase Auth (magic links) | — |
| Storage | Supabase Storage (bucket `media`) | — |
| Editor rich-text | TipTap | **v3** |
| Email transactionnel | Resend | v6 |
| CRM | HubSpot v3 REST API | (fetch direct, pas de SDK) |
| Observability | Sentry | v10 |
| Analytics | GA4 (gtag.js, consent-gated) | — |
| Rate limit (prévu) | Upstash Ratelimit + Redis | (installé, pas encore câblé) |
| Forms | react-hook-form + zod 4 | — |
| Animation | framer-motion | v12 |
| Toasts | sonner | v2 |

Gestionnaire de paquets : **pnpm** (`pnpm-lock.yaml` committé). Ne pas mélanger avec npm/yarn.

---

## 2. Arborescence du repo

```
rezoli/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Routes publiques (groupées sans préfixe URL)
│   │   ├── a-propos/
│   │   ├── blog/                 # /blog, /blog/[slug], /blog/feed.xml
│   │   ├── contact/
│   │   ├── devenir-partenaire/
│   │   ├── devis/                # NEW — formulaire generic devis
│   │   ├── nos-packs/            # /nos-packs + /nos-packs/[slug] dédié (QR codes)
│   │   ├── nos-partenaires/
│   │   ├── nos-services/         # /nos-services + /nos-services/[slug]
│   │   ├── realisations/         # /realisations + /realisations/[slug]
│   │   ├── layout.tsx            # SiteHeader + SiteFooter
│   │   └── page.tsx              # Home
│   ├── (legal)/                  # /cgu, /mentions-legales, /politique-confidentialite
│   ├── admin/                    # Back-office (auth requise)
│   │   ├── blog/                 # CMS articles
│   │   ├── calendrier/           # Dates bloquées
│   │   ├── catalog/              # CMS services + event-packs
│   │   ├── clients/              # Liste clients
│   │   ├── devis/                # Demandes de devis + accept/reject
│   │   ├── messages/             # Inbox contact
│   │   ├── partenaires/          # Candidatures partenaires
│   │   ├── realisations/         # CMS portfolio
│   │   ├── auth/                 # Magic link callback
│   │   ├── login/                # Page de login
│   │   ├── layout.tsx            # AdminSidebar
│   │   └── page.tsx              # Dashboard KPIs
│   ├── api/
│   │   └── admin/upload/         # Upload Supabase Storage
│   ├── compte/                   # Espace client (magic link)
│   ├── devis-confirmation/       # Page post-submit
│   ├── globals.css               # Tailwind v4 + tokens
│   ├── layout.tsx                # RootLayout (GA, Sentry, fonts)
│   ├── not-found.tsx             # 404 brandé
│   ├── error.tsx                 # Error boundary
│   ├── global-error.tsx          # Catastrophe
│   ├── opengraph-image.tsx       # OG par défaut
│   ├── robots.ts                 # robots.txt dynamique
│   └── sitemap.ts                # sitemap.xml dynamique
│
├── components/
│   ├── admin/                    # Composants spécifiques admin
│   │   ├── AcceptQuoteButton.tsx
│   │   ├── RejectQuoteDialog.tsx
│   │   ├── ReplyToQuoteDialog.tsx
│   │   ├── BlogPostEditor.tsx    # Wrapper TipTap pour le blog
│   │   ├── RealisationEditor.tsx
│   │   ├── MediaUploader.tsx
│   │   └── TipTapEditor.tsx      # Éditeur TipTap réutilisable
│   ├── analytics/                # GA4 (consent-gated)
│   ├── blog/                     # BlogPostCard, BlogRecentStrip
│   ├── event-packs/              # PackCapsule, PackRequestDialog
│   ├── forms/                    # DevisForm, DevisFormSection (NEW)
│   ├── gdpr/                     # CookieBanner
│   ├── layout/                   # SiteHeader, SiteFooter, AdminSidebar
│   ├── realisations/             # RealisationCard, GalleryLightbox, FeaturedStrip
│   ├── sections/                 # Sections home (HomeHero, ServicesGrid, AboutTimeline, etc.)
│   ├── service-flow/             # Wizard de booking 3 étapes
│   │   ├── ServiceQuoteFlow.tsx  # Orchestrateur one-step-at-a-time
│   │   ├── Step1Event.tsx        # Contact + événement (push HubSpot)
│   │   ├── Step2Formula.tsx
│   │   ├── Step2Streetfood.tsx
│   │   ├── Step3Recap.tsx
│   │   ├── CustomizationModal.tsx
│   │   ├── state.ts              # Reducer + validators
│   │   └── PriceSummary.tsx
│   ├── seo/                      # JsonLd helpers
│   └── ui/                       # Primitives shadcn-style (Button, Dialog, etc.)
│
├── lib/
│   ├── auth.ts                   # requireAdmin() + ADMIN_DEV_BYPASS
│   ├── availability.ts           # loadBlockedDates()
│   ├── blog.ts                   # listPublishedPosts, getPostBySlug (avec fallback fixtures)
│   ├── catalog-loader.ts         # DB-first reads, code fallback
│   ├── consent.ts                # GDPR consent cookie + event bus
│   ├── demo-fixtures.ts          # Données démo (blog, realisations, devis, partners, messages)
│   ├── email.ts                  # Resend wrapper + builders (acceptance, rejection, status)
│   ├── env.ts                    # Zod env validation
│   ├── event-packs-catalog.ts    # Catalogue packs (soutenance, soiree-bac, fetes-fin-annee)
│   ├── hubspot.ts                # upsertContact, createDeal, updateDealStage
│   ├── media.ts                  # Supabase Storage helpers
│   ├── prisma.ts                 # Prisma client singleton
│   ├── quote-status.ts           # Enum + labels FR
│   ├── realisations.ts           # listPublished + getBySlug (avec fallback)
│   ├── rejection-reasons.ts      # 15 motifs verbatim
│   ├── schemas.ts                # Tous les zod schemas
│   ├── service-catalog.ts        # Catalogue services en dur (cocktails, café, déjeuner, stations)
│   ├── service-pricing.ts        # Calculs HT/TVA/TTC par service
│   ├── supabase/                 # Clients server + browser
│   ├── tiptap.ts                 # Extensions TipTap
│   ├── tiptap-render.tsx         # SSR TipTap JSON → HTML
│   └── utils.ts                  # cn(), BUSINESS const, formatTND, etc.
│
├── prisma/
│   ├── schema.prisma             # Modèles : User, QuoteRequest, BlogPost, Realisation, etc.
│   └── seed.ts                   # Idempotent — peuple le catalogue depuis le code
│
├── public/                       # Assets statiques
├── docs/                         # Cette documentation
│   ├── HANDOVER.md               # CE document
│   └── Rezoli - Brief copywriter - Blog & Realisations.docx
│
├── sentry.{client,server,edge}.config.ts   # Init Sentry (DSN-gated)
├── instrumentation.ts            # Charge Sentry server/edge
├── proxy.ts                      # Auth middleware (Supabase)
├── next.config.ts                # Redirects .html → app, image patterns, headers
├── eslint.config.mjs
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── .env.example
```

---

## 3. Prérequis locaux

```bash
node --version    # ≥ 20.x
pnpm --version    # ≥ 9.x  (npm i -g pnpm)
psql --version    # ≥ 14 (optionnel — Supabase Cloud suffit)
```

---

## 4. Setup local en 5 commandes

```bash
git clone <repo-url> rezoli
cd rezoli
pnpm install
cp .env.example .env.local        # remplir les valeurs (voir §5)
pnpm dev                          # http://localhost:3000
```

Pour **tester l'admin en mode démo** (sans Supabase) :

```bash
echo "ADMIN_DEV_BYPASS=1" >> .env.local
pnpm dev
# → http://localhost:3000/admin    (pas de login requis)
```

Scripts disponibles :

| Commande | Description |
|---|---|
| `pnpm dev` | Dev server (port 3000 par défaut, `-p 3008` pour changer) |
| `pnpm build` | Build production |
| `pnpm start` | Serveur de prod local |
| `pnpm lint` | ESLint (`--max-warnings 0`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:generate` | Régénère le Prisma Client (à faire après modif `schema.prisma`) |
| `pnpm db:migrate` | Crée + applique une migration en dev |
| `pnpm db:studio` | UI Prisma Studio (browse les tables) |
| `pnpm db:seed` | Peuple la DB depuis `lib/service-catalog.ts` + `event-packs-catalog.ts` |

---

## 5. Variables d'environnement

**Référence complète** — fichier `.env.example` à dupliquer en `.env.local` (dev) ou à pousser dans Vercel (prod).

### Bloc « Site » (toujours requis)

| Var | Exemple | Note |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://rezoli.tn` | Utilisé par sitemap, RSS, OG images, JSON-LD |

### Bloc « Supabase » (requis en prod)

| Var | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role secret |

### Bloc « Database » (requis en prod)

| Var | Source |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (mode **Pooler**, 6543) |
| `DIRECT_URL` | Idem mais en mode **Direct** (5432) — utilisé par Prisma migrate |

### Bloc « Email » (requis pour notifications)

| Var | Exemple |
|---|---|
| `RESEND_API_KEY` | `re_xxx` (dashboard Resend → API Keys) |
| `EMAIL_FROM_NOREPLY` | `Rezoli <no-reply@rezoli.tn>` (domaine vérifié dans Resend) |
| `QUOTE_TO_EMAIL` | `contact@rezoli.tn` (où arrivent les devis admin) |

### Bloc « Admin » (toujours requis)

| Var | Exemple |
|---|---|
| `ADMIN_EMAILS` | `sami@rezoli.tn,equipe@rezoli.tn` (allowlist, séparée par virgules) |
| `ADMIN_DEV_BYPASS` | `1` en dev uniquement — **JAMAIS en prod** |

### Bloc « Tax »

| Var | Défaut | Note |
|---|---|---|
| `TVA_RATE` | `19` | Tunisie. Change la valeur pour ajuster toute la fiscalité du calculateur |

### Bloc « Sentry » (optionnel)

| Var | Note |
|---|---|
| `SENTRY_DSN` | DSN serveur — depuis le project Sentry |
| `NEXT_PUBLIC_SENTRY_DSN` | Même DSN, exposé au client |

### Bloc « HubSpot » (optionnel mais recommandé)

| Var | Source |
|---|---|
| `HUBSPOT_API_KEY` | HubSpot → Settings → Integrations → Private Apps → Create app → Bearer token |
| `HUBSPOT_PIPELINE` | Pipeline ID (HubSpot → Settings → Objects → Deals → Pipelines, copier l'ID) |
| `HUBSPOT_STAGE_NEW` | ID du stage « Nouveau lead » |
| `HUBSPOT_STAGE_QUALIFIED` | ID du stage « Qualifié » |
| `HUBSPOT_STAGE_QUOTE_SENT` | ID du stage « Devis envoyé » |
| `HUBSPOT_STAGE_CLOSED_WON` | ID du stage « Gagné » |
| `HUBSPOT_STAGE_CLOSED_LOST` | ID du stage « Perdu » |

**Scopes requis pour le Private App HubSpot** :
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`
- `crm.schemas.contacts.read`
- `crm.schemas.deals.read`

---

## 6. Base de données

### Provisioning Supabase

1. Créer un projet sur supabase.com
2. Copier `Project URL` + `anon key` + `service_role secret` dans `.env.local`
3. Récupérer les 2 connection strings (Pooler 6543 → `DATABASE_URL`, Direct 5432 → `DIRECT_URL`)
4. Lancer les migrations Prisma :

```bash
pnpm exec prisma migrate deploy    # prod : applique les migrations existantes
# OU
pnpm db:migrate                    # dev : crée une nouvelle migration
```

5. Régénérer le client typé :

```bash
pnpm db:generate
```

6. Seed le catalogue de base (idempotent) :

```bash
pnpm db:seed
```

Cela peuple : 4 Services, 12+ ServicePacks, 7 Stations, 3 EventPackCategories avec leurs Tiers + Options, les custom options.

### Modèles principaux (`prisma/schema.prisma`)

- **User** — clients + admins (allowlist via `ADMIN_EMAILS`)
- **QuoteRequest** + **QuoteItem** + **QuoteEvent** (audit log) — demandes de devis avec snapshot prix
- **Service** + **ServicePack** + **ServiceCustomOption** + **Station** — catalogue services
- **EventPackCategory** + **EventPackTier** + **EventPackOption** — catalogue packs
- **BlogPost** — articles (TipTap JSON)
- **Realisation** — portfolio / études de cas (TipTap JSON + outcomes + testimonial)
- **MediaAsset** — index Supabase Storage
- **BlockedDate** — calendrier d'indisponibilité (admin)
- **PartnerApplication** — candidatures partenaires
- **ContactMessage** — inbox contact

### Enums clés
- `QuoteStatus` : `PENDING` → `REVIEWED` → `QUOTE_SENT` → `CONFIRMED` → `COMPLETED` (ou `CANCELLED`)
- `RejectionReason` : 15 motifs canoniques (`lib/rejection-reasons.ts`)
- `BlogPostStatus` : `DRAFT` / `PUBLISHED` / `ARCHIVED`
- `RealisationStatus` : `DRAFT` / `PUBLISHED`

---

## 7. Supabase — config détaillée

### 7.1 Auth (magic links)

1. Supabase Dashboard → Authentication → Providers → **Email** : enable, désactiver « Confirm email » (magic link only)
2. Authentication → URL Configuration :
   - Site URL : `https://rezoli.tn`
   - Redirect URLs : `https://rezoli.tn/admin/auth/callback`, `https://rezoli.tn/compte/auth/callback`, et les équivalents en dev (`http://localhost:3000/...`)
3. Authentication → Email Templates → Magic Link : personnaliser (sujet + body en FR)
4. Les utilisateurs créés via magic link sont automatiquement synchronisés avec la table `User` (champ `supabaseUserId`) la première fois qu'ils se connectent — voir `lib/auth.ts`

### 7.2 Storage — bucket `media`

1. Storage → Create bucket : nom = **`media`**, public = **on**
2. Policies → ajouter :

```sql
-- Read public
create policy "media public read"
  on storage.objects for select
  to public
  using (bucket_id = 'media');

-- Write authenticated (revérifié côté Route Handler via requireAdmin)
create policy "media admin write"
  on storage.objects for insert
  to authenticated
  using (bucket_id = 'media');

create policy "media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
```

L'admin allowlist (`ADMIN_EMAILS`) reste l'autorité finale — vérifiée dans `app/api/admin/upload/route.ts`.

---

## 8. Services tiers

### 8.1 Resend (email transactionnel)
1. Créer un compte sur resend.com
2. Vérifier le domaine `rezoli.tn` (DNS records SPF + DKIM)
3. Générer une API key → `RESEND_API_KEY`
4. Templates utilisés (tous générés à la volée par `lib/email.ts`) :
   - Confirmation client (post-submit)
   - Notification admin (post-submit)
   - Status change (REVIEWED, QUOTE_SENT, CONFIRMED, COMPLETED, CANCELLED)
   - **Acceptance** (nouveau, avec récap événement)
   - **Rejection** (nouveau, avec motif + alternative optionnelle)
   - Reply free-form (depuis le dialog admin)

### 8.2 HubSpot
1. HubSpot → Settings → Integrations → Private Apps → Create
2. Définir les scopes (voir §5)
3. Récupérer le token → `HUBSPOT_API_KEY`
4. Settings → Objects → Deals → Pipelines → noter les IDs de chaque stage et les mapper dans les 6 `HUBSPOT_STAGE_*` env vars
5. **Custom properties** (à créer côté HubSpot) :
   - Contact : `rezoli_last_service`, `rezoli_last_event_date`, `rezoli_last_guest_count`, `rezoli_last_location`, `rezoli_event_type`, `rezoli_service_type`, `rezoli_pack_tier`
   - Deal : `rezoli_ref`, `rezoli_service`, `rezoli_event_type`, `rezoli_service_type`, `rezoli_pack_tier`, `rezoli_guest_count`, `rezoli_event_date`, `closed_lost_reason`

Sans HubSpot configuré, `hubspotEnabled()` renvoie `false` et toutes les fonctions de `lib/hubspot.ts` sont des no-op silencieux. **Aucun submit public ne casse**.

### 8.3 Sentry (optionnel)
1. Créer un project Next.js sur Sentry
2. Copier le DSN dans `SENTRY_DSN` (server) + `NEXT_PUBLIC_SENTRY_DSN` (client)
3. Les configs (`sentry.{client,server,edge}.config.ts`) sont déjà branchées et inactives si le DSN est absent

### 8.4 GA4 (optionnel)
1. Mesure ID GA4 (`G-XXXXXXXXXX`) → `NEXT_PUBLIC_GA_ID`
2. Le composant `components/analytics/GoogleAnalytics.tsx` charge gtag.js **uniquement après consentement utilisateur** (cookie banner GDPR-compliant)

---

## 9. Déploiement Vercel + `rezoli.tn`

### 9.1 Setup Vercel
1. Connecter le repo GitHub
2. Framework preset : **Next.js** (auto-détecté)
3. Build command : `pnpm build` (auto)
4. Install command : `pnpm install` (auto)
5. Output : `.next` (auto)
6. Environment Variables → ajouter **toutes** les valeurs de `.env.local` sauf `ADMIN_DEV_BYPASS`
7. Déployer une preview pour valider

### 9.2 Domain `rezoli.tn`
1. Vercel → Project → Settings → Domains → ajouter `rezoli.tn` ET `www.rezoli.tn`
2. Chez le registrar de `rezoli.tn`, ajouter :
   - Record `A` : `@` → `76.76.21.21` (IP Vercel)
   - Record `CNAME` : `www` → `cname.vercel-dns.com`
3. Vercel délivre automatiquement le SSL (Let's Encrypt)
4. Mettre à jour `NEXT_PUBLIC_SITE_URL=https://rezoli.tn` dans les env vars Vercel

### 9.3 Post-déploiement (checklist)
- [ ] `pnpm exec prisma migrate deploy` exécuté sur la DB de prod (via Vercel CLI ou script de post-build)
- [ ] `pnpm db:seed` exécuté **une fois**
- [ ] Bucket Supabase `media` créé + policies
- [ ] Domaine Resend `rezoli.tn` vérifié
- [ ] Première connexion admin via magic link testée
- [ ] Un devis test soumis end-to-end (form → email → HubSpot deal)
- [ ] `https://rezoli.tn/robots.txt` et `/sitemap.xml` répondent
- [ ] `https://rezoli.tn/blog/feed.xml` répond
- [ ] OG images se génèrent (`/blog/[slug]/opengraph-image-*`)

---

## 10. Mode démo (`ADMIN_DEV_BYPASS=1`)

Quand cette var est à `1` ou `true` (cf. `lib/auth.ts`), `requireAdmin()` renvoie une **fake session** sans interroger Supabase. L'admin est alors browsable sans aucun login.

**Conséquences** :
- Toutes les pages `/admin/*` répondent 200
- Les Server Actions (`updateQuoteStatus`, `replyToQuote`, etc.) acceptent la fake session
- Les loaders qui interrogeaient la DB tombent sur le **fallback fixtures** (`lib/demo-fixtures.ts`) : 3 articles blog, 4 réalisations, 7 devis, 4 messages, 3 candidatures partenaires, 3 dates bloquées

**⚠️ Ne JAMAIS activer cette var en production.** Sinon l'admin devient public. Un check `process.env.NODE_ENV === "production"` peut être ajouté en garde-fou si besoin.

---

## 11. Architecture — points clés

### 11.1 Catalog-loader (DB-first avec fallback code)
`lib/catalog-loader.ts` est l'intermédiaire entre les pages publiques et la donnée. Pattern :
```ts
if (process.env.DATABASE_URL) {
  // Lire la DB
} else {
  // Fallback : importer le code (lib/service-catalog.ts)
}
```
Avantage : le site marche AVANT que la DB soit seedée. Inconvénient : ne pas modifier `service-catalog.ts` en prod (la DB doit dominer).

### 11.2 Service quote flow (one-step-at-a-time)
`components/service-flow/ServiceQuoteFlow.tsx` rend **une seule étape à la fois** (URL unique, navigation par `state.step` dans le reducer). La sortie de Step 1 pousse un Contact HubSpot via `pushStep1Lead` (`app/(marketing)/nos-services/[slug]/actions.ts`). Step 3 finalise avec création du Deal.

### 11.3 Pack request popup
`components/event-packs/PackCapsule.tsx` rend les 3 catégories de packs. Cliquer "Demander ce pack" ouvre `PackRequestDialog.tsx` (formulaire complet : date, lieu, heure, contact, RGPD). Submit → Server Action `submitPackRequest` (`app/(marketing)/nos-packs/actions.ts`) → push HubSpot + persist DB.

Les **URLs dédiées par pack** (pour QR codes) sont à `/nos-packs/[slug]` :
- `https://rezoli.tn/nos-packs/soutenance`
- `https://rezoli.tn/nos-packs/soiree-bac`
- `https://rezoli.tn/nos-packs/fetes-fin-annee`

Le composant PackCapsule accepte un prop `defaultOpen` qui ouvre la capsule au chargement.

### 11.4 Admin accept / reject
`app/admin/devis/actions.ts` expose :
- `acceptQuote(ref)` — status → CONFIRMED + email récap + HubSpot deal → closedwon
- `rejectQuote({ref, reason, alternativeProposal?})` — status → CANCELLED + email motif + HubSpot deal → closedlost + custom property `closed_lost_reason`
- 15 motifs dans `lib/rejection-reasons.ts`

UI : `components/admin/AcceptQuoteButton.tsx` + `RejectQuoteDialog.tsx`.

### 11.5 HubSpot push — 4 points d'entrée publics
| Endroit | Fonction | Crée |
|---|---|---|
| Step 1 du flow services | `pushStep1Lead` | Contact (lifecyclestage=lead) |
| Step 3 final | `submitServiceQuote` | Contact + Deal |
| Popup packs | `submitPackRequest` | Contact + Deal |
| Form `/devis` + section home | `submitGenericDevis` | Contact + Deal |

### 11.6 Démo data
`lib/demo-fixtures.ts` est un **fichier unique** importé par tous les loaders (blog, réalisations, devis, messages, partners, calendrier, dashboard). Modifier ce fichier change la démo entière. À supprimer ou laisser tel quel en prod (les loaders n'y vont jamais quand `DATABASE_URL` est set).

### 11.7 Middleware (`proxy.ts`)
Next.js 16 a renommé `middleware.ts` → `proxy.ts`. Le proxy gère l'auth Supabase sur `/admin/*` et `/compte/*`. Si Supabase n'est pas configuré, il laisse passer (la page gère la redirection vers /login).

---

## 12. Limitations connues + TODOs prioritaires

Issues identifiées dans la dernière revue de code (à fixer avant prod) :

### 🔴 Critique
1. **`submitGenericDevis` écrit un `details` non-discriminé** — `app/(marketing)/devis/actions.ts` ligne ~90. Le champ JSON ne match pas `quoteDetailsSchema`. Risque de crash quand l'admin ouvre la fiche. **Fix** : utiliser `Prisma.JsonNull` et reporter le contexte dans `message`.
2. **`submitServiceQuote` pousse HubSpot AVANT persist DB** — risque de Deal HubSpot orphelin si DB tombe. **Fix** : inverser, puis update du row avec les IDs HubSpot.
3. **XSS potentiel via `firstName` non-échappé dans les emails** — `lib/email.ts`, tous les `build*EmailBody`. **Fix** : helper `escapeHtml()` partout.
4. **Bouton Step 3 désactivé seulement sur `!details`, pas sur `!consentRgpd`** — `Step3Recap.tsx`. **Fix** : ajouter la condition.

### 🟠 Important
5. **Consentement RGPD capturé après push HubSpot** — checkbox en Step 3 alors que push HubSpot en Step 1. Légalement borderline. **Fix** : ajouter checkbox RGPD aussi en Step 1.
6. **Pas de rate-limit / honeypot sur les forms publics** — Upstash est installé mais pas câblé. **Fix v1** : honeypot. **Fix v2** : rate-limit IP.
7. **Pas de validation du `dealId` dans URL HubSpot** — `lib/hubspot.ts` ligne ~201. Faible risque mais à durcir.

### 🟡 Nice-to-have
- `AcceptQuoteButton` utilise `window.confirm` → remplacer par un Dialog
- Pas de purge auto Storage quand un `MediaAsset` est supprimé (job cron à prévoir)
- Cache HTTP des loaders catalogue → `unstable_cache` + `revalidateTag('catalog')` sur les Server Actions admin
- Tests E2E (Playwright) à ajouter
- `Step1Event.isStep1Valid` ne couvre pas blocked-date (guard séparé sur le bouton)

---

## 13. Logique métier — ressources clés

### Catalogue services (code source)
- `lib/service-catalog.ts` — 4 services, 12 packs, 7 stations street-food, custom options
- `lib/service-pricing.ts` — `pricePerPersonForService()`, `streetfoodSubtotal()`, `totalsFromUnitPrice()`, `totalsFromSubtotal()` — calculs HT/TVA/TTC

### Catalogue packs événementiels
- `lib/event-packs-catalog.ts` — 3 catégories (soutenance, soiree-bac, fetes-fin-annee), tiers (Essentiel/Vibe/Business/Premium/Signature), options additionnelles

### Status workflow devis
Source de vérité : `lib/quote-status.ts`. Labels FR dans `STATUS_LABELS`. Transitions logiques (recommandées, pas enforced) :
```
PENDING → REVIEWED → QUOTE_SENT → CONFIRMED → COMPLETED
                                   ↓
                              CANCELLED (à n'importe quel moment, via "Refuser")
```

### Authorization
- **Public** — pas d'auth
- **Admin** — `requireAdmin()` dans `lib/auth.ts` :
  1. Si `ADMIN_DEV_BYPASS=1` → fake session
  2. Sinon : Supabase session valide ET `user.email ∈ ADMIN_EMAILS`

Aucune permission granulaire (RBAC) en v1. Tous les admins ont les mêmes droits.

---

## 14. Ressources externes

| Service | Console | Doc |
|---|---|---|
| Supabase | dashboard.supabase.com | supabase.com/docs |
| Vercel | vercel.com/dashboard | vercel.com/docs |
| Resend | resend.com/dashboard | resend.com/docs |
| HubSpot | app.hubspot.com | developers.hubspot.com/docs/api |
| Sentry | sentry.io | docs.sentry.io/platforms/javascript/guides/nextjs |
| GA4 | analytics.google.com | developers.google.com/analytics |

---

## 15. Contact

- **Sami** — `sami@rezoli.tn` — questions produit, contenus, admin allowlist
- **Code repo** — voir GitHub Settings pour les accès
- **Brief copywriter** — `docs/Rezoli - Brief copywriter - Blog & Realisations.docx`

---

**Bon déploiement.**
