"use server";

import { nanoid } from "nanoid";
import { z } from "zod";
import { getPackCategory, getPackTier, priceForTier } from "@/lib/event-packs-catalog";
import { totalsFromSubtotal } from "@/lib/service-pricing";
import { renderDetailsAsText } from "@/components/service-flow/details-render";
import type { QuoteDetails } from "@/lib/schemas";
import { upsertContact, createDeal } from "@/lib/hubspot";

const phoneRegex = /^\+?[0-9\s().-]{8,20}$/;

const packRequestSchema = z.object({
  packCategory: z.enum(["soutenance", "soiree-bac", "fetes-fin-annee"]),
  packTier: z.string(),
  guestCount: z.coerce.number().int().min(1).max(2000),
  options: z.array(z.string()).default([]),
  eventDate: z.string().min(1, "Date requise"),
  eventTime: z.string().optional(),
  location: z.string().min(2, "Lieu requis"),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.email("Email invalide"),
  phone: z.string().regex(phoneRegex, "Téléphone invalide"),
  company: z.string().optional(),
  message: z.string().max(1000).optional(),
  consentRgpd: z.boolean().refine((v) => v === true, {
    message: "Consentement RGPD requis",
  }),
});

export type PackRequestInput = z.infer<typeof packRequestSchema>;

export type PackRequestResult =
  | { ok: true; ref: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

export async function submitPackRequest(
  input: PackRequestInput
): Promise<PackRequestResult> {
  const result = packRequestSchema.safeParse(input);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      errors[String(issue.path[issue.path.length - 1])] = issue.message;
    }
    return { ok: false, errors, message: "Veuillez corriger les erreurs." };
  }

  const data = result.data;
  const category = getPackCategory(data.packCategory);
  const found = getPackTier(data.packCategory, data.packTier);
  if (!category || !found) {
    return { ok: false, message: "Pack introuvable." };
  }

  const { tier } = found;
  const packPriceHT = priceForTier(tier, data.guestCount);
  const optionsTotalHT = data.options.reduce((sum, id) => {
    const opt = category.options.find((o) => o.id === id);
    return sum + (opt?.priceHT ?? 0);
  }, 0);

  const subtotalHT = +(packPriceHT + optionsTotalHT).toFixed(3);
  const totals = totalsFromSubtotal(subtotalHT);

  const ref = `RZL-${nanoid(8).toUpperCase()}`;

  const details: QuoteDetails = {
    service: "event-pack",
    packCategory: data.packCategory,
    packTier: data.packTier,
    packName: tier.name,
    guestCount: data.guestCount,
    options: data.options,
    packPriceHT,
    optionsTotalHT,
  };

  // HubSpot — contact + deal
  const contactId = await upsertContact({
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    company: data.company ?? null,
    lifecycleStage: "marketingqualifiedlead",
    extra: {
      rezoli_event_type: category.name,
      rezoli_pack_tier: tier.name,
      rezoli_guest_count: data.guestCount,
    },
  });
  let dealId: string | null = null;
  if (contactId) {
    dealId = await createDeal({
      contactId,
      dealName: `${tier.name} — ${data.firstName} ${data.lastName} (${ref})`,
      amount: totals.totalTTC || undefined,
      extra: {
        rezoli_ref: ref,
        rezoli_event_type: category.name,
        rezoli_pack_tier: tier.name,
        rezoli_guest_count: data.guestCount,
      },
    });
  }

  await persist(ref, data, tier.name, category.name, details, totals, {
    hubspotContactId: contactId,
    hubspotDealId: dealId,
  });
  await sendEmails(ref, data, tier.name, category.name, details, totals);

  return { ok: true, ref };
}

async function persist(
  ref: string,
  data: PackRequestInput,
  packName: string,
  categoryName: string,
  details: QuoteDetails,
  totals: { subtotalHT: number; tvaRate: number; totalTTC: number },
  hubspot: { hubspotContactId: string | null; hubspotDealId: string | null }
) {
  if (!process.env.DATABASE_URL) {
    console.log("[pack:dev]", { ref, data, details, totals });
    return;
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const eventDate = data.eventDate ? new Date(data.eventDate) : null;

    await prisma.user.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company ?? null,
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company ?? null,
      },
    });

    await prisma.quoteRequest.create({
      data: {
        ref,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company ?? null,
        eventDate,
        eventTime: data.eventTime ?? null,
        eventType: categoryName,
        guestCount: data.guestCount,
        location: data.location,
        message: data.message ?? null,
        consentRgpd: data.consentRgpd,
        details,
        subtotalHTSnapshot: totals.subtotalHT,
        tvaRateSnapshot: totals.tvaRate,
        totalTTCSnapshot: totals.totalTTC,
        hubspotContactId: hubspot.hubspotContactId,
        hubspotDealId: hubspot.hubspotDealId,
        user: { connect: { email: data.email } },
        items: {
          create: [
            {
              refId: `${data.packCategory}:${data.packTier}`,
              kind: "PACK",
              name: `${packName} (${categoryName})`,
              tier: data.packTier,
              quantity: data.guestCount,
            },
          ],
        },
        events: {
          create: {
            type: "SUBMITTED",
            toStatus: "PENDING",
            payload: { source: "web-pack" },
          },
        },
      },
    });
  } catch (err) {
    console.error("[pack] DB persist failed", err);
  }
}

async function sendEmails(
  ref: string,
  data: PackRequestInput,
  packName: string,
  categoryName: string,
  details: QuoteDetails,
  totals: { subtotalHT: number; tvaRate: number; tvaAmount: number; totalTTC: number }
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email:dev] would send pack emails for", ref);
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const adminEmail = process.env.QUOTE_TO_EMAIL ?? "contact@rezoli.tn";
    const from =
      process.env.EMAIL_FROM_NOREPLY ?? "Rezoli <no-reply@rezoli.tn>";

    const detailsText = renderDetailsAsText(details, data.guestCount);

    const adminBody = `
      <h1 style="font-family:Georgia,serif;color:#1d8080">Nouvelle commande pack ${ref}</h1>
      <p><strong>${data.firstName} ${data.lastName}</strong> — ${data.email} — ${data.phone}${data.company ? " — " + data.company : ""}</p>
      <p>Pack : <strong>${packName}</strong> · ${categoryName}</p>
      <p>${data.guestCount} invités · ${data.eventDate}${data.eventTime ? " " + data.eventTime : ""} · ${data.location}</p>
      <pre style="white-space:pre-wrap;font-family:inherit;background:#f5f4f0;padding:12px;border-radius:8px">${detailsText}</pre>
      <p><strong>Total TTC : ${totals.totalTTC} TND</strong> (HT ${totals.subtotalHT} · TVA ${totals.tvaRate}%)</p>
      ${data.message ? `<p>Message : ${data.message}</p>` : ""}
    `;

    const clientBody = `
      <h1 style="font-family:Georgia,serif;color:#1d8080">Merci ${data.firstName} !</h1>
      <p>Nous avons bien reçu votre demande pour le pack <strong>${packName}</strong> (référence ${ref}).</p>
      <p>Notre équipe revient vers vous sous 24 heures ouvrées pour finaliser votre commande.</p>
      <p style="color:#666;font-size:12px">— L'équipe Rezoli</p>
    `;

    await Promise.all([
      resend.emails.send({
        from,
        to: adminEmail,
        subject: `[Rezoli] Pack ${ref} · ${packName} · ${data.guestCount} pers.`,
        html: adminBody,
      }),
      resend.emails.send({
        from,
        to: data.email,
        subject: `Votre commande Rezoli ${ref}`,
        html: clientBody,
      }),
    ]);
  } catch (err) {
    console.error("[pack:email] failed", err);
  }
}
