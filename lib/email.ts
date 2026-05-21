import "server-only";
import { BUSINESS } from "./utils";
import {
  REJECTION_REASON_LABEL,
  type RejectionReasonKey,
} from "./rejection-reasons";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult = { ok: true } | { ok: false; reason: string };

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailInput): Promise<SendEmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email:dev]", { to, subject, htmlPreview: html.slice(0, 200) });
    return { ok: false, reason: "no-resend-key" };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from =
      process.env.EMAIL_FROM_NOREPLY ?? "Rezoli <no-reply@rezoli.tn>";
    const r = await resend.emails.send({ from, to, subject, html });
    if (r.error) {
      console.error("[email] send error", r.error);
      return { ok: false, reason: r.error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false, reason: String(err) };
  }
}

/**
 * Minimal HTML wrapper for transactional emails. No CSS framework, just basic
 * inline styles for cross-client compatibility.
 */
export function emailWrap(opts: {
  title: string;
  body: string;
  footer?: string;
}): string {
  return `
<!doctype html>
<html lang="fr">
  <body style="margin:0;font-family:Georgia,serif;background:#fbf7f1;padding:24px;color:#0f0b0b">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="padding:24px 32px;background:#145c5c;color:#fff">
          <div style="font-size:24px;font-weight:700;letter-spacing:-0.5px">${BUSINESS.name}<span style="color:#e9b76a">.</span></div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px">
          <h1 style="font-size:22px;font-weight:600;margin:0 0 16px;color:#0f0b0b">${opts.title}</h1>
          <div style="font-size:15px;line-height:1.7;color:#3f3b35;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
            ${opts.body}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;background:#faf8f5;font-size:12px;color:#8a857c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
          ${opts.footer ?? `<p style="margin:0">— L'équipe ${BUSINESS.name} · <a href="${BUSINESS.email ? `mailto:${BUSINESS.email}` : "#"}" style="color:#145c5c">${BUSINESS.email}</a></p>`}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/* ─── Status-change templates ────────────────────────────────────── */

import type { QuoteStatus } from "@prisma/client";

export const STATUS_EMAIL_SUBJECT: Partial<Record<QuoteStatus, string>> = {
  REVIEWED: "Votre demande Rezoli est en cours d'étude",
  QUOTE_SENT: "Votre devis Rezoli est prêt",
  CONFIRMED: "Votre commande Rezoli est confirmée 🎉",
  COMPLETED: "Merci d'avoir choisi Rezoli",
  CANCELLED: "Votre demande Rezoli a été annulée",
};

export function buildStatusEmailBody(
  status: QuoteStatus,
  data: {
    firstName: string;
    ref: string;
    serviceName: string;
    finalPriceTTC?: number | null;
    finalQuoteUrl?: string | null;
    cancellationReason?: string | null;
  }
): string {
  const greeting = `<p>Bonjour ${data.firstName},</p>`;
  switch (status) {
    case "REVIEWED":
      return `
        ${greeting}
        <p>Bonne nouvelle : notre équipe a bien pris connaissance de votre demande <strong>${data.ref}</strong> (${data.serviceName}) et la prépare en ce moment.</p>
        <p>Vous recevrez votre devis personnalisé sous 24 heures ouvrées.</p>
      `;
    case "QUOTE_SENT":
      return `
        ${greeting}
        <p>Votre devis pour <strong>${data.serviceName}</strong> (référence ${data.ref}) est prêt.</p>
        ${data.finalPriceTTC ? `<p><strong>Total TTC : ${data.finalPriceTTC.toFixed(3)} TND</strong></p>` : ""}
        ${data.finalQuoteUrl ? `<p><a href="${data.finalQuoteUrl}" style="display:inline-block;background:#1d8080;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:500">Télécharger le devis</a></p>` : ""}
        <p>Pour valider, répondez à cet email ou contactez-nous directement.</p>
      `;
    case "CONFIRMED":
      return `
        ${greeting}
        <p>Votre commande pour <strong>${data.serviceName}</strong> (référence <strong>${data.ref}</strong>) est confirmée. 🎉</p>
        <p>Nous reviendrons vers vous quelques jours avant l'événement pour caler les derniers détails. D'ici là, si vous avez la moindre question, écrivez-nous.</p>
      `;
    case "COMPLETED":
      return `
        ${greeting}
        <p>Merci d'avoir choisi Rezoli pour <strong>${data.serviceName}</strong> (référence ${data.ref}). Nous espérons que l'événement a été à la hauteur de vos attentes.</p>
        <p>Si vous avez 30 secondes, votre retour nous aide à nous améliorer : répondez simplement à cet email avec vos impressions.</p>
      `;
    case "CANCELLED":
      return `
        ${greeting}
        <p>Votre demande <strong>${data.ref}</strong> (${data.serviceName}) a été annulée${data.cancellationReason ? ` : <em>${data.cancellationReason}</em>` : ""}.</p>
        <p>Si c'est une erreur, ou si vous souhaitez relancer un projet, écrivez-nous à <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>.</p>
      `;
    default:
      return `${greeting}<p>Votre demande ${data.ref} a évolué.</p>`;
  }
}

/* ─── Acceptance / rejection email builders ──────────────────────── */

export type AcceptanceEmailData = {
  firstName: string;
  ref: string;
  serviceName: string;
  eventDate: Date | null;
  eventTime: string | null;
  location: string | null;
  guestCount: number;
  totalTTC: number | null;
};

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  try {
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export const ACCEPTANCE_EMAIL_SUBJECT = "Votre demande Rezoli est acceptée 🎉";

export function buildAcceptanceEmailBody(data: AcceptanceEmailData): string {
  const rows: Array<[string, string]> = [
    ["Référence", data.ref],
    ["Prestation", data.serviceName],
    ["Date", fmtDate(data.eventDate)],
    ...(data.eventTime ? ([["Heure", data.eventTime]] as Array<[string, string]>) : []),
    ...(data.location ? ([["Lieu", data.location]] as Array<[string, string]>) : []),
    ["Invités", String(data.guestCount)],
    ...(data.totalTTC != null
      ? ([["Total TTC estimé", `${data.totalTTC.toFixed(3)} TND`]] as Array<[string, string]>)
      : []),
  ];

  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#666;font-size:13px">${k}</td><td style="padding:6px 12px;font-weight:600">${v}</td></tr>`
    )
    .join("");

  return `
    <p>Bonjour ${data.firstName},</p>
    <p>Excellente nouvelle : votre demande <strong>${data.ref}</strong> est <strong>acceptée</strong>. 🎉</p>
    <p>Voici le récapitulatif de votre événement :</p>
    <table cellpadding="0" cellspacing="0" style="margin:12px 0;border-collapse:collapse;background:#f8f6f1;border-radius:10px">
      ${table}
    </table>
    <p>Notre équipe vous recontacte sous 48 h pour caler les derniers détails (logistique, dégustation, signature de la prestation).</p>
    <p>Pour toute question, répondez directement à cet email.</p>
  `;
}

export type RejectionEmailData = {
  firstName: string;
  ref: string;
  serviceName: string;
  reason: RejectionReasonKey;
  alternativeProposal?: string | null;
};

export const REJECTION_EMAIL_SUBJECT =
  "Votre demande Rezoli — réponse de notre équipe";

export function buildRejectionEmailBody(data: RejectionEmailData): string {
  const reasonLabel = REJECTION_REASON_LABEL[data.reason];
  const altBlock = data.alternativeProposal?.trim()
    ? `
        <p style="margin-top:18px">Voici une alternative que nous pouvons vous proposer :</p>
        <blockquote style="margin:8px 0;padding:10px 16px;border-left:3px solid #1d8080;background:#f5f8f6">
          ${data.alternativeProposal
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>")}
        </blockquote>
      `
    : "";
  return `
    <p>Bonjour ${data.firstName},</p>
    <p>Nous avons étudié votre demande <strong>${data.ref}</strong> (${data.serviceName}) avec attention.</p>
    <p>Malheureusement, nous ne pourrons pas l'honorer pour la raison suivante :</p>
    <p style="margin:12px 0;padding:12px 16px;background:#fff4ec;border-left:3px solid #d97706;border-radius:4px"><strong>${reasonLabel}</strong></p>
    ${altBlock}
    <p>Nous restons à votre disposition pour étudier d'autres formats. N'hésitez pas à nous répondre directement.</p>
  `;
}
