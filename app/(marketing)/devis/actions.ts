"use server";

import { nanoid } from "nanoid";
import {
  genericDevisSchema,
  type GenericDevisInput,
} from "@/lib/schemas";
import { upsertContact, createDeal } from "@/lib/hubspot";

export type SubmitGenericDevisResult =
  | { ok: true; ref: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

export async function submitGenericDevis(
  input: GenericDevisInput
): Promise<SubmitGenericDevisResult> {
  const parsed = genericDevisSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[issue.path.length - 1])] = issue.message;
    }
    return { ok: false, errors, message: "Veuillez corriger les erreurs." };
  }

  const d = parsed.data;
  const ref = `RZL-${nanoid(8).toUpperCase()}`;

  // HubSpot push
  const contactId = await upsertContact({
    email: d.email,
    firstName: d.firstName,
    lastName: d.lastName,
    phone: d.phone,
    lifecycleStage: "lead",
    extra: {
      rezoli_event_type: d.eventType,
      rezoli_service_type: d.serviceType,
      rezoli_guest_count: d.guestCount,
      ...(d.company ? { company: d.company } : {}),
      ...(d.eventDate ? { rezoli_event_date: d.eventDate } : {}),
    },
  });

  let dealId: string | null = null;
  if (contactId) {
    dealId = await createDeal({
      contactId,
      dealName: `${d.serviceType} — ${d.firstName} ${d.lastName} (${ref})`,
      extra: {
        rezoli_ref: ref,
        rezoli_event_type: d.eventType,
        rezoli_service_type: d.serviceType,
        rezoli_guest_count: d.guestCount,
      },
    });
  }

  // Persist (best-effort)
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.user.upsert({
        where: { email: d.email },
        create: {
          email: d.email,
          firstName: d.firstName,
          lastName: d.lastName,
          phone: d.phone,
          company: d.company ?? null,
        },
        update: {
          firstName: d.firstName,
          lastName: d.lastName,
          phone: d.phone,
          company: d.company ?? null,
        },
      });
      await prisma.quoteRequest.create({
        data: {
          ref,
          email: d.email,
          firstName: d.firstName,
          lastName: d.lastName,
          phone: d.phone,
          company: d.company ?? null,
          eventDate: d.eventDate ? new Date(d.eventDate) : null,
          eventTime: null,
          eventType: d.eventType,
          guestCount: d.guestCount,
          location: "—",
          message: d.message ?? null,
          consentRgpd: d.consentRgpd,
          details: { source: "generic_devis", serviceType: d.serviceType },
          hubspotContactId: contactId,
          hubspotDealId: dealId,
          user: { connect: { email: d.email } },
          events: {
            create: {
              type: "SUBMITTED",
              toStatus: "PENDING",
              payload: { source: "generic_devis" },
            },
          },
        },
      });
    } catch (err) {
      console.error("[devis] persist failed", err);
    }
  } else {
    console.log("[devis:dev]", { ref, d });
  }

  // Best-effort emails: admin notification (so the team receives the request)
  // + client confirmation.
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from =
        process.env.EMAIL_FROM_NOREPLY ?? "Rezoli <no-reply@rezoli.tn>";
      const adminEmail = process.env.QUOTE_TO_EMAIL ?? "sales@rezoli.tn";

      const adminBody = `
        <h1 style="font-family:Georgia,serif;color:#1d8080">Nouvelle demande de devis ${ref}</h1>
        <p><strong>${d.firstName} ${d.lastName}</strong> — ${d.email} — ${d.phone}${d.company ? " — " + d.company : ""}</p>
        <p>Type d'événement : <strong>${d.eventType}</strong></p>
        <p>Service : <strong>${d.serviceType}</strong></p>
        <p>${d.guestCount} invités${d.eventDate ? ` · ${d.eventDate}` : ""}</p>
        ${d.message ? `<p>Message : ${d.message}</p>` : ""}
      `;

      await Promise.all([
        resend.emails.send({
          from,
          to: adminEmail,
          subject: `[Rezoli] Devis ${ref} · ${d.serviceType} · ${d.guestCount} pers.`,
          html: adminBody,
        }),
        resend.emails.send({
          from,
          to: d.email,
          subject: `Votre demande Rezoli ${ref}`,
          html: `<p>Merci ${d.firstName} ! Nous avons bien reçu votre demande <strong>${ref}</strong>. Notre équipe revient vers vous sous 48 h.</p>`,
        }),
      ]);
    } catch (err) {
      console.error("[devis] email failed", err);
    }
  }

  return { ok: true, ref };
}
