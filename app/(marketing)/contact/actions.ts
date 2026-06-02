"use server";

import { revalidatePath } from "next/cache";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/schemas";

export type ContactActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function submitContactMessage(
  _prev: ContactActionState | undefined,
  formData: FormData
): Promise<ContactActionState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? "") || undefined,
    company: String(formData.get("company") ?? "") || undefined,
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    consentRgpd: formData.get("consentRgpd") === "on",
  };

  const result = contactMessageSchema.safeParse(raw);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, errors, message: "Veuillez corriger les erreurs." };
  }

  await persistContactMessage(result.data);

  revalidatePath("/admin/messages");

  return {
    ok: true,
    message:
      "Merci ! Votre message est bien arrivé. Nous revenons vers vous sous 24 h ouvrées.",
  };
}

async function persistContactMessage(data: ContactMessageInput) {
  // Persists via Prisma when env wired up; otherwise logs server-side.
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
