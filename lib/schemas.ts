import { z } from "zod";

const phoneRegex = /^\+?[0-9\s().-]{8,20}$/;

/* ─── Service quote details (one shape per service) ─────────────────── */

const baseFormulaId = z.enum([
  "essentielle",
  "business",
  "premium",
  "signature",
  "personnalise",
]);

export const cocktailDetailsSchema = z.object({
  service: z.literal("cocktails-dinatoires"),
  formulaId: baseFormulaId,
  boissons: z.array(z.string()).min(1, "Sélectionnez au moins une boisson"),
  sale: z.array(z.string()),
  sucre: z.array(z.string()),
  serviceMode: z.enum(["sans", "avec"]),
});

export const cafeDetailsSchema = z.object({
  service: z.literal("pauses-cafe"),
  formulaId: baseFormulaId,
  withVerrerie: z.boolean(),
  boissons: z.array(z.string()).min(1, "Sélectionnez au moins une boisson"),
  hasSale: z.boolean(),
  sale: z.array(z.string()),
  hasSucre: z.boolean(),
  sucre: z.array(z.string()),
  serviceMode: z.enum(["sans", "avec"]),
});

export const dejeunerDetailsSchema = z.object({
  service: z.literal("pauses-dejeuner"),
  formulaId: baseFormulaId,
  boissons: z.array(z.string()),
  entree: z.boolean(),
  plat: z.enum(["chaud", "sandwich"]),
  dessert: z.boolean(),
  dessertType: z.enum(["gateau", "fruit", "les_deux"]).optional(),
  serviceMode: z.enum(["lunch_box", "a_table"]),
  // Pre-built formula picks (entrée / plat / dessert chosen from the formula's option list).
  // Empty strings allowed so a formula with a single fixed option doesn't require a pick.
  selectedEntree: z.string().optional(),
  selectedPlat: z.string().optional(),
  selectedDessert: z.string().optional(),
});

export const stationSelectionSchema = z.object({
  stationId: z.string(),
  variant: z.string().optional(),
  /** Mixable stations (Pizza, Crêpe): 1 variety, or a mix of max 2 (price = average). */
  variants: z.array(z.string()).min(1).max(2).optional(),
  piecesPerPerson: z.coerce.number().int().min(1).max(20),
});

export const streetfoodDetailsSchema = z.object({
  service: z.literal("stations-street-food"),
  formulaId: z.literal("personnalise"),
  stations: z.array(stationSelectionSchema),
  /**
   * Optional multi-station pack ID — when set, replaces the individual stations
   * with a fixed bundle priced per person from `streetfoodMultiPacks`.
   */
  multiPackId: z.string().optional(),
}).refine(
  (val) => val.stations.length > 0 || !!val.multiPackId,
  { message: "Sélectionnez au moins une station ou un pack multi-stations", path: ["stations"] }
);

export const eventPackDetailsSchema = z.object({
  service: z.literal("event-pack"),
  packCategory: z.enum(["soutenance", "soiree-bac", "fetes-fin-annee"]),
  packTier: z.string(),
  packName: z.string(),
  guestCount: z.coerce.number().int().min(1),
  options: z.array(z.string()),
  packPriceHT: z.number().nonnegative(),
  optionsTotalHT: z.number().nonnegative(),
});

export const quoteDetailsSchema = z.discriminatedUnion("service", [
  cocktailDetailsSchema,
  cafeDetailsSchema,
  dejeunerDetailsSchema,
  streetfoodDetailsSchema,
  eventPackDetailsSchema,
]);

export type QuoteDetails = z.infer<typeof quoteDetailsSchema>;
export type StationSelection = z.infer<typeof stationSelectionSchema>;

/* ─── Page Step 1: Event ─────────────────────────────────────────── */

export const eventStepSchema = z.object({
  eventDate: z.string().min(1, "Sélectionnez une date"),
  eventTime: z.string().min(1, "Sélectionnez une heure"),
  location: z.string().min(2, "Précisez le lieu"),
  guestCount: z.coerce
    .number({ message: "Indiquez le nombre d'invités" })
    .int()
    .min(1, "Minimum 1 invité")
    .max(5000, "Pour plus de 5000 invités, contactez-nous"),
  withVerrerie: z.boolean().optional(),
});

export type EventStepInput = z.infer<typeof eventStepSchema>;

/* ─── Step 1 lead push (contact + event basics) ──────────────────── */

/* ─── Generic devis form (used by /devis page + home section) ───── */

export const genericDevisSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.email("Email invalide"),
  phone: z.string().regex(phoneRegex, "Téléphone invalide"),
  eventType: z.enum([
    "Réunion d'entreprise",
    "Séminaire / Conférence",
    "Cocktail / Buffet",
    "Formation",
    "Salon / Forum",
    "Tournage",
    "Autre",
  ]),
  serviceType: z.enum([
    "Pause café",
    "Pause déjeuner",
    "Cocktail dînatoire",
    "Station street-food",
  ]),
  guestCount: z.coerce.number().int().min(1, "Au moins 1 invité").max(5000),
  eventDate: z.string().optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  consentRgpd: z.boolean().refine((v) => v === true, {
    message: "Le consentement RGPD est obligatoire",
  }),
});

export type GenericDevisInput = z.infer<typeof genericDevisSchema>;

export const step1LeadSchema = z.object({
  service: z.enum([
    "cocktails-dinatoires",
    "pauses-cafe",
    "pauses-dejeuner",
    "stations-street-food",
  ]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().regex(phoneRegex),
  company: z.string().optional(),
  eventDate: z.string().min(1),
  eventTime: z.string().min(1),
  location: z.string().min(2),
  guestCount: z.coerce.number().int().min(1),
});

export type Step1LeadInput = z.infer<typeof step1LeadSchema>;

/* ─── Page Step 3: Contact + Submit ──────────────────────────────── */

export const contactStepSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.email("Email invalide"),
  phone: z.string().regex(phoneRegex, "Téléphone invalide"),
  company: z.string().optional(),
  message: z.string().max(1000).optional(),
  consentRgpd: z.boolean().refine((v) => v === true, {
    message: "Le consentement RGPD est obligatoire",
  }),
});

export type ContactStepInput = z.infer<typeof contactStepSchema>;

/* ─── Full quote submission ──────────────────────────────────────── */

export const serviceQuoteSubmissionSchema = z.object({
  // event
  eventDate: z.string().min(1),
  eventTime: z.string().min(1),
  location: z.string().min(2),
  guestCount: z.coerce.number().int().min(1).max(5000),
  // contact
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  phone: z.string().regex(phoneRegex),
  company: z.string().optional(),
  message: z.string().max(1000).optional(),
  consentRgpd: z.boolean().refine((v) => v === true),
  // service-specific
  details: quoteDetailsSchema,
  // HubSpot lead identity (optional — set by Step 1 lead push)
  hubspotContactId: z.string().nullable().optional(),
});

export type ServiceQuoteSubmissionInput = z.infer<
  typeof serviceQuoteSubmissionSchema
>;

/* ─── Other forms (contact, partner, magic link) — unchanged ─────── */

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.email("Email invalide"),
  phone: z.string().regex(phoneRegex, "Téléphone invalide").optional().or(z.literal("")),
  subject: z.string().min(3, "Sujet requis"),
  message: z.string().min(10, "Message trop court").max(2000),
  consentRgpd: z.boolean().refine((v) => v === true, {
    message: "Le consentement RGPD est obligatoire",
  }),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const partnerApplicationSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.email(),
  phone: z.string().regex(phoneRegex),
  partnerType: z.enum(["SUPPLIER", "VENUE", "FREELANCER", "OTHER"]),
  message: z.string().max(1000).optional(),
  consentRgpd: z.boolean().refine((v) => v === true, {
    message: "Consentement requis",
  }),
});

export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>;

export const magicLinkSchema = z.object({
  email: z.email("Email invalide"),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
