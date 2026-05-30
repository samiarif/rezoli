"use server";

import { nanoid } from "nanoid";
import {
  serviceQuoteSubmissionSchema,
  step1LeadSchema,
  type ServiceQuoteSubmissionInput,
  type Step1LeadInput,
} from "@/lib/schemas";
import {
  totalsFromUnitPrice,
  totalsFromSubtotal,
  pricePerPersonForService,
  streetfoodSubtotal,
} from "@/lib/service-pricing";
import { getServiceMeta } from "@/lib/service-catalog";
import { renderDetailsAsText } from "@/components/service-flow/details-render";
import { upsertContact, createDeal } from "@/lib/hubspot";

export type SubmitResult =
  | { ok: true; ref: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

/**
 * Step 1 lead push — capture contact + event basics in HubSpot **before**
 * the user finishes the quote flow. Returns `{ hubspotContactId }` so the
 * client can attach it to the final submit, avoiding a second upsert.
 *
 * Non-throwing: failures are logged and the client is allowed to continue.
 */
export async function pushStep1Lead(
  input: Step1LeadInput
): Promise<{ ok: boolean; hubspotContactId: string | null; errors?: Record<string, string> }> {
  const parsed = step1LeadSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[issue.path.length - 1])] = issue.message;
    }
    return { ok: false, hubspotContactId: null, errors };
  }
  const d = parsed.data;
  const meta = getServiceMeta(d.service);
  const serviceLabel = meta?.name ?? d.service;
  const contactId = await upsertContact({
    email: d.email,
    firstName: d.firstName,
    lastName: d.lastName,
    phone: d.phone,
    company: d.company ?? null,
    lifecycleStage: "lead",
    extra: {
      rezoli_last_service: serviceLabel,
      rezoli_last_event_date: d.eventDate,
      rezoli_last_guest_count: d.guestCount,
      rezoli_last_location: d.location.slice(0, 200),
    },
  });
  return { ok: true, hubspotContactId: contactId };
}

export async function submitServiceQuote(
  input: ServiceQuoteSubmissionInput
): Promise<SubmitResult> {
  const result = serviceQuoteSubmissionSchema.safeParse(input);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      errors[String(issue.path[issue.path.length - 1])] = issue.message;
    }
    return { ok: false, errors, message: "Veuillez corriger les erreurs." };
  }

  const data = result.data;
  const meta = getServiceMeta(data.details.service);
  if (!meta) return { ok: false, message: "Service introuvable." };

  // Compute pricing
  let subtotalHT = 0;
  let tvaRate = 0;
  let tvaAmount = 0;
  let totalTTC = 0;
  let unitPriceHT: number | null = null;

  if (data.details.service === "event-pack") {
    // Event packs go through /nos-packs flow, not the service flow
    return { ok: false, message: "Service invalide pour cette voie." };
  }
  if (data.details.service === "stations-street-food") {
    const r = streetfoodSubtotal(
      data.details.stations,
      data.guestCount,
      data.details.multiPackId
    );
    const t = totalsFromSubtotal(r.subtotalHT);
    subtotalHT = t.subtotalHT;
    tvaRate = t.tvaRate;
    tvaAmount = t.tvaAmount;
    totalTTC = t.totalTTC;
  } else {
    unitPriceHT = pricePerPersonForService(
      data.details.service,
      data.details.formulaId,
      data.guestCount,
      {
        withVerrerie:
          data.details.service === "pauses-cafe"
            ? data.details.withVerrerie
            : undefined,
        serviceMode:
          data.details.service === "pauses-dejeuner"
            ? data.details.serviceMode
            : undefined,
      }
    );
    const t = totalsFromUnitPrice(unitPriceHT, data.guestCount);
    subtotalHT = t.subtotalHT;
    tvaRate = t.tvaRate;
    tvaAmount = t.tvaAmount;
    totalTTC = t.totalTTC;
  }

  const ref = `RZL-${nanoid(8).toUpperCase()}`;

  // We already early-returned for event-pack; narrow the type for the helpers.
  const narrowed = data as Omit<ServiceQuoteSubmissionInput, "details"> & {
    details: ServiceFlowDetails;
  };

  // HubSpot — ensure contact + create deal. Re-uses the Step1 contactId if
  // present (no double upsert).
  let contactId: string | null = data.hubspotContactId ?? null;
  if (!contactId) {
    contactId = await upsertContact({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      company: data.company ?? null,
      lifecycleStage: "marketingqualifiedlead",
    });
  }
  let dealId: string | null = null;
  if (contactId) {
    dealId = await createDeal({
      contactId,
      dealName: `${meta.name} — ${data.firstName} ${data.lastName} (${ref})`,
      amount: totalTTC || undefined,
      extra: {
        rezoli_ref: ref,
        rezoli_service: meta.name,
        rezoli_guest_count: data.guestCount,
        rezoli_event_date: data.eventDate,
      },
    });
  }

  await persistQuote(ref, narrowed, meta.name, {
    subtotalHT,
    tvaRate,
    totalTTC,
    hubspotContactId: contactId,
    hubspotDealId: dealId,
  });
  await sendEmails(ref, narrowed, meta.name, {
    subtotalHT,
    tvaRate,
    tvaAmount,
    totalTTC,
    unitPriceHT,
  });

  return { ok: true, ref };
}

type ServiceFlowDetails = Exclude<
  ServiceQuoteSubmissionInput["details"],
  { service: "event-pack" }
>;

async function persistQuote(
  ref: string,
  data: Omit<ServiceQuoteSubmissionInput, "details"> & { details: ServiceFlowDetails },
  serviceName: string,
  totals: {
    subtotalHT: number;
    tvaRate: number;
    totalTTC: number;
    hubspotContactId?: string | null;
    hubspotDealId?: string | null;
  }
) {
  if (!process.env.DATABASE_URL) {
    console.log("[quote:dev]", { ref, data, totals, serviceName });
    return;
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const eventDate = new Date(data.eventDate);

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

    // Build a single QuoteItem describing the chosen formula.
    let itemName = serviceName;
    if (data.details.service !== "stations-street-food") {
      itemName = `${serviceName} — ${formulaLabel(data.details.formulaId)}`;
    } else {
      const parts: string[] = [];
      if (data.details.multiPackId) parts.push("pack multi-stations");
      if (data.details.stations.length > 0)
        parts.push(
          `${data.details.stations.length} station${
            data.details.stations.length > 1 ? "s" : ""
          }`
        );
      itemName = `${serviceName} — ${parts.join(" + ") || "sélection"}`;
    }

    await prisma.quoteRequest.create({
      data: {
        ref,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company ?? null,
        eventDate,
        eventTime: data.eventTime,
        eventType: serviceName,
        guestCount: data.guestCount,
        location: data.location,
        message: data.message ?? null,
        consentRgpd: data.consentRgpd,
        details: data.details,
        subtotalHTSnapshot: totals.subtotalHT,
        tvaRateSnapshot: totals.tvaRate,
        totalTTCSnapshot: totals.totalTTC,
        hubspotContactId: totals.hubspotContactId ?? null,
        hubspotDealId: totals.hubspotDealId ?? null,
        user: { connect: { email: data.email } },
        items: {
          create: [
            {
              refId: data.details.service,
              kind:
                data.details.service === "stations-street-food"
                  ? "PACK"
                  : data.details.formulaId === "personnalise"
                  ? "SERVICE"
                  : "PACK",
              name: itemName,
              tier:
                data.details.service !== "stations-street-food"
                  ? data.details.formulaId
                  : null,
              audience: null,
              quantity: data.guestCount,
            },
          ],
        },
        events: {
          create: {
            type: "SUBMITTED",
            toStatus: "PENDING",
            payload: { source: "web" },
          },
        },
      },
    });
  } catch (err) {
    console.error("[quote] DB persist failed", err);
  }
}

function formulaLabel(id: string): string {
  switch (id) {
    case "essentielle":
      return "Essentielle";
    case "business":
      return "Business";
    case "premium":
      return "Premium";
    case "signature":
      return "Signature";
    case "personnalise":
      return "Personnalisé";
    default:
      return id;
  }
}

async function sendEmails(
  ref: string,
  data: Omit<ServiceQuoteSubmissionInput, "details"> & { details: ServiceFlowDetails },
  serviceName: string,
  totals: {
    subtotalHT: number;
    tvaRate: number;
    tvaAmount: number;
    totalTTC: number;
    unitPriceHT: number | null;
  }
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email:dev] would send emails for", ref);
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const adminEmail = process.env.QUOTE_TO_EMAIL ?? "sales@rezoli.tn";
    const from =
      process.env.EMAIL_FROM_NOREPLY ?? "Rezoli <no-reply@rezoli.tn>";

    const detailsText = renderDetailsAsText(data.details, data.guestCount);

    const adminBody = `
      <h1 style="font-family:Georgia,serif;color:#1d8080">Nouvelle demande ${ref}</h1>
      <p><strong>${data.firstName} ${data.lastName}</strong> — ${data.email} — ${data.phone}${data.company ? " — " + data.company : ""}</p>
      <p>Service : <strong>${serviceName}</strong></p>
      <p>${data.guestCount} invités · ${data.eventDate} ${data.eventTime} · ${data.location}</p>
      <pre style="white-space:pre-wrap;font-family:inherit;background:#f5f4f0;padding:12px;border-radius:8px">${detailsText}</pre>
      <p><strong>Total TTC estimé : ${totals.totalTTC} TND</strong> (HT ${totals.subtotalHT} · TVA ${totals.tvaRate}%)</p>
      ${data.message ? `<p>Message : ${data.message}</p>` : ""}
    `;

    const clientBody = `
      <h1 style="font-family:Georgia,serif;color:#1d8080">Merci ${data.firstName} !</h1>
      <p>Nous avons bien reçu votre demande de devis <strong>${ref}</strong>.</p>
      <p>Notre équipe revient vers vous sous 24 heures ouvrées avec une proposition personnalisée.</p>
      <p style="color:#666;font-size:12px">— L'équipe Rezoli</p>
    `;

    await Promise.all([
      resend.emails.send({
        from,
        to: adminEmail,
        subject: `[Rezoli] ${ref} · ${serviceName} · ${data.guestCount} pers.`,
        html: adminBody,
      }),
      resend.emails.send({
        from,
        to: data.email,
        subject: `Votre demande Rezoli ${ref}`,
        html: clientBody,
      }),
    ]);
  } catch (err) {
    console.error("[email] failed", err);
  }
}
