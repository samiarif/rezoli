"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import type { Status } from "@/lib/quote-status";
import {
  STATUS_EMAIL_SUBJECT,
  ACCEPTANCE_EMAIL_SUBJECT,
  REJECTION_EMAIL_SUBJECT,
  buildStatusEmailBody,
  buildAcceptanceEmailBody,
  buildRejectionEmailBody,
  emailWrap,
  sendEmail,
} from "@/lib/email";
import {
  isRejectionReason,
  type RejectionReasonKey,
} from "@/lib/rejection-reasons";
import { updateDealStage } from "@/lib/hubspot";

export async function updateQuoteStatus(formData: FormData) {
  const session = await requireAdmin();
  const ref = String(formData.get("ref") ?? "");
  const next = String(formData.get("status") ?? "") as Status;
  const notifyCustomer = formData.get("notify") !== "off";
  if (!ref || !next || !process.env.DATABASE_URL) return;

  const { prisma } = await import("@/lib/prisma");
  const current = await prisma.quoteRequest.findUnique({
    where: { ref },
    select: {
      id: true,
      status: true,
      email: true,
      firstName: true,
      eventType: true,
      finalQuoteTotalTND: true,
      finalQuotePdfUrl: true,
    },
  });
  if (!current) return;

  // Update + log status change
  await prisma.$transaction([
    prisma.quoteRequest.update({
      where: { ref },
      data: { status: next },
    }),
    prisma.quoteEvent.create({
      data: {
        quoteId: current.id,
        type: "STATUS_CHANGE",
        fromStatus: current.status,
        toStatus: next,
        actorUserId: session.user.id,
      },
    }),
  ]);

  // Send customer notification email
  const subject = STATUS_EMAIL_SUBJECT[next];
  if (notifyCustomer && subject && current.email) {
    const body = buildStatusEmailBody(next, {
      firstName: current.firstName,
      ref,
      serviceName: current.eventType,
      finalPriceTTC: current.finalQuoteTotalTND
        ? Number(current.finalQuoteTotalTND)
        : null,
      finalQuoteUrl: current.finalQuotePdfUrl ?? null,
    });
    const html = emailWrap({ title: subject, body });
    const result = await sendEmail({ to: current.email, subject, html });
    if (result.ok) {
      await prisma.quoteEvent.create({
        data: {
          quoteId: current.id,
          type: "EMAIL_SENT",
          actorUserId: session.user.id,
          payload: { subject, kind: "status-change", toStatus: next },
        },
      });
    }
  }

  revalidatePath(`/admin/devis/${ref}`);
  revalidatePath("/admin/devis");
  revalidatePath("/admin");
}

export async function addInternalNote(formData: FormData) {
  const session = await requireAdmin();
  const ref = String(formData.get("ref") ?? "");
  const note = String(formData.get("note") ?? "");
  if (!ref || !note.trim() || !process.env.DATABASE_URL) return;

  const { prisma } = await import("@/lib/prisma");
  const quote = await prisma.quoteRequest.findUnique({
    where: { ref },
    select: { id: true, internalNotes: true },
  });
  if (!quote) return;

  const stamp = new Date().toISOString();
  const prefix = quote.internalNotes ? `${quote.internalNotes}\n\n` : "";

  await prisma.$transaction([
    prisma.quoteRequest.update({
      where: { ref },
      data: {
        internalNotes: `${prefix}[${stamp} · ${session.user.email}]\n${note}`,
      },
    }),
    prisma.quoteEvent.create({
      data: {
        quoteId: quote.id,
        type: "NOTE_ADDED",
        actorUserId: session.user.id,
        payload: { preview: note.slice(0, 120) },
      },
    }),
  ]);

  revalidatePath(`/admin/devis/${ref}`);
}

/* ─── Reply-by-email to the customer ─────────────────────────────── */

export type ReplyResult =
  | { ok: true }
  | { ok: false; message: string };

export async function replyToQuote(input: {
  ref: string;
  subject: string;
  body: string;
}): Promise<ReplyResult> {
  const session = await requireAdmin();
  const ref = input.ref.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!ref || !subject || !body) {
    return { ok: false, message: "Tous les champs sont requis." };
  }
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }

  const { prisma } = await import("@/lib/prisma");
  const quote = await prisma.quoteRequest.findUnique({
    where: { ref },
    select: { id: true, email: true, firstName: true },
  });
  if (!quote) return { ok: false, message: "Demande introuvable." };

  // Convert plain-text body to simple HTML (preserve line breaks)
  const safeHtml = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  const html = emailWrap({
    title: subject,
    body: `<p>Bonjour ${quote.firstName},</p><div>${safeHtml}</div>`,
  });

  const result = await sendEmail({ to: quote.email, subject, html });
  if (!result.ok) {
    return { ok: false, message: `Échec de l'envoi : ${result.reason}` };
  }

  await prisma.quoteEvent.create({
    data: {
      quoteId: quote.id,
      type: "EMAIL_SENT",
      actorUserId: session.user.id,
      payload: {
        subject,
        kind: "reply",
        preview: body.slice(0, 200),
      },
    },
  });

  revalidatePath(`/admin/devis/${ref}`);
  return { ok: true };
}

/* ─── Acceptance ────────────────────────────────────────────────── */

export type AcceptResult =
  | { ok: true }
  | { ok: false; message: string };

export async function acceptQuote(ref: string): Promise<AcceptResult> {
  const session = await requireAdmin();
  if (!ref) return { ok: false, message: "Référence manquante." };
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }
  const { prisma } = await import("@/lib/prisma");
  const quote = await prisma.quoteRequest.findUnique({
    where: { ref },
    select: {
      id: true,
      status: true,
      email: true,
      firstName: true,
      eventType: true,
      eventDate: true,
      eventTime: true,
      location: true,
      guestCount: true,
      totalTTCSnapshot: true,
      hubspotDealId: true,
    },
  });
  if (!quote) return { ok: false, message: "Demande introuvable." };

  await prisma.$transaction([
    prisma.quoteRequest.update({
      where: { ref },
      data: { status: "CONFIRMED" },
    }),
    prisma.quoteEvent.create({
      data: {
        quoteId: quote.id,
        type: "STATUS_CHANGE",
        fromStatus: quote.status,
        toStatus: "CONFIRMED",
        actorUserId: session.user.id,
      },
    }),
  ]);

  // Customer acceptance email with event summary
  const body = buildAcceptanceEmailBody({
    firstName: quote.firstName,
    ref,
    serviceName: quote.eventType,
    eventDate: quote.eventDate,
    eventTime: quote.eventTime,
    location: quote.location,
    guestCount: quote.guestCount,
    totalTTC: quote.totalTTCSnapshot ? Number(quote.totalTTCSnapshot) : null,
  });
  const result = await sendEmail({
    to: quote.email,
    subject: ACCEPTANCE_EMAIL_SUBJECT,
    html: emailWrap({ title: ACCEPTANCE_EMAIL_SUBJECT, body }),
  });
  if (result.ok) {
    await prisma.quoteEvent.create({
      data: {
        quoteId: quote.id,
        type: "EMAIL_SENT",
        actorUserId: session.user.id,
        payload: { subject: ACCEPTANCE_EMAIL_SUBJECT, kind: "acceptance" },
      },
    });
  }

  // HubSpot — move deal to closed-won
  await updateDealStage(quote.hubspotDealId, "closedwon");

  revalidatePath(`/admin/devis/${ref}`);
  revalidatePath("/admin/devis");
  revalidatePath("/admin");
  return { ok: true };
}

/* ─── Rejection ─────────────────────────────────────────────────── */

const rejectInputSchema = z.object({
  ref: z.string().min(1),
  reason: z.string().refine(isRejectionReason, "Motif invalide"),
  alternativeProposal: z.string().max(2000).optional(),
});

export type RejectInput = {
  ref: string;
  reason: RejectionReasonKey;
  alternativeProposal?: string;
};

export type RejectResult =
  | { ok: true }
  | { ok: false; message: string; errors?: Record<string, string> };

export async function rejectQuote(input: RejectInput): Promise<RejectResult> {
  const session = await requireAdmin();
  const parsed = rejectInputSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[issue.path.length - 1])] = issue.message;
    }
    return { ok: false, message: "Veuillez corriger les erreurs.", errors };
  }
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Base de données non configurée." };
  }
  const { prisma } = await import("@/lib/prisma");
  const quote = await prisma.quoteRequest.findUnique({
    where: { ref: parsed.data.ref },
    select: {
      id: true,
      status: true,
      email: true,
      firstName: true,
      eventType: true,
      hubspotDealId: true,
    },
  });
  if (!quote) return { ok: false, message: "Demande introuvable." };

  const reason = parsed.data.reason as RejectionReasonKey;
  const alt = parsed.data.alternativeProposal?.trim() || null;

  await prisma.$transaction([
    prisma.quoteRequest.update({
      where: { ref: parsed.data.ref },
      data: {
        status: "CANCELLED",
        rejectionReason: reason,
        alternativeProposal: alt,
      },
    }),
    prisma.quoteEvent.create({
      data: {
        quoteId: quote.id,
        type: "STATUS_CHANGE",
        fromStatus: quote.status,
        toStatus: "CANCELLED",
        actorUserId: session.user.id,
        payload: { reason, hasAlternative: !!alt },
      },
    }),
  ]);

  // Customer rejection email
  const body = buildRejectionEmailBody({
    firstName: quote.firstName,
    ref: parsed.data.ref,
    serviceName: quote.eventType,
    reason,
    alternativeProposal: alt,
  });
  const result = await sendEmail({
    to: quote.email,
    subject: REJECTION_EMAIL_SUBJECT,
    html: emailWrap({ title: REJECTION_EMAIL_SUBJECT, body }),
  });
  if (result.ok) {
    await prisma.quoteEvent.create({
      data: {
        quoteId: quote.id,
        type: "EMAIL_SENT",
        actorUserId: session.user.id,
        payload: { subject: REJECTION_EMAIL_SUBJECT, kind: "rejection", reason },
      },
    });
  }

  // HubSpot — move deal to closed-lost with reason
  await updateDealStage(quote.hubspotDealId, "closedlost", {
    closed_lost_reason: reason,
  });

  revalidatePath(`/admin/devis/${parsed.data.ref}`);
  revalidatePath("/admin/devis");
  revalidatePath("/admin");
  return { ok: true };
}
