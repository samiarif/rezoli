import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/schemas";
import { sendEmail, emailWrap } from "@/lib/email";
import { BUSINESS } from "@/lib/utils";

// Email + DB are request-time side effects — never prerender/cache this route.
export const dynamic = "force-dynamic";

export type ContactResponse = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

/** Escape user-supplied text before interpolating into the HTML email body. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request): Promise<NextResponse<ContactResponse>> {
  // Accept both JSON (fetch) and classic form posts.
  let raw: Record<string, unknown>;
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      raw = (await request.json()) as Record<string, unknown>;
    } else {
      const fd = await request.formData();
      raw = {
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone") || undefined,
        company: fd.get("company") || undefined,
        subject: fd.get("subject"),
        message: fd.get("message"),
        consentRgpd: fd.get("consentRgpd") === "on" || fd.get("consentRgpd") === "true",
      };
    }
  } catch {
    return NextResponse.json(
      { ok: false, message: "Requête invalide." },
      { status: 400 }
    );
  }

  const result = contactMessageSchema.safeParse(raw);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json(
      { ok: false, errors, message: "Veuillez corriger les erreurs." },
      { status: 422 }
    );
  }

  const data = result.data;

  // Persist first so a message is never lost even if the mailbox is down.
  await persistContactMessage(data);
  revalidatePath("/admin/messages");

  // Notify the project owner. Reply-To is set to the visitor so the team can
  // answer straight from their inbox.
  const ownerEmail =
    process.env.CONTACT_TO_EMAIL ??
    process.env.QUOTE_TO_EMAIL ??
    process.env.SMTP_USER ??
    BUSINESS.email;

  const sent = await sendEmail({
    to: ownerEmail,
    replyTo: data.email,
    subject: `[${BUSINESS.name}] Nouveau message — ${data.subject}`,
    html: emailWrap({
      title: `Nouveau message de ${esc(data.name)}`,
      body: `
        <p style="margin:0 0 4px"><strong>De :</strong> ${esc(data.name)} &lt;${esc(data.email)}&gt;</p>
        ${data.phone ? `<p style="margin:0 0 4px"><strong>Téléphone :</strong> ${esc(data.phone)}</p>` : ""}
        ${data.company ? `<p style="margin:0 0 4px"><strong>Société :</strong> ${esc(data.company)}</p>` : ""}
        <p style="margin:0 0 4px"><strong>Sujet :</strong> ${esc(data.subject)}</p>
        <p style="margin:16px 0 4px"><strong>Message :</strong></p>
        <p style="white-space:pre-wrap;margin:0">${esc(data.message)}</p>
      `,
      footer: `<p style="margin:0">Répondez directement à cet email pour contacter ${esc(data.name)}.</p>`,
    }),
  });

  if (!sent.ok && sent.reason !== "no-smtp-config") {
    // The message is safely persisted; surface a soft warning to logs only.
    console.error("[contact] owner notification failed:", sent.reason);
  }

  return NextResponse.json({
    ok: true,
    message:
      "Merci ! Votre message est bien arrivé. Nous revenons vers vous sous 24 h ouvrées.",
  });
}

async function persistContactMessage(data: ContactMessageInput) {
  // Persists via Prisma when the DB is wired up; otherwise logs server-side.
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          company: data.company || null,
          subject: data.subject,
          message: data.message,
        },
      });
    } catch (err) {
      console.error("[contact] DB persist failed", err);
    }
  } else {
    console.log("[contact:dev-fallback]", data);
  }
}
