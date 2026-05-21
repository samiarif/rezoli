"use server";

import { revalidatePath } from "next/cache";
import {
  partnerApplicationSchema,
  type PartnerApplicationInput,
} from "@/lib/schemas";

export type PartnerActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function submitPartnerApplication(
  _prev: PartnerActionState | undefined,
  formData: FormData
): Promise<PartnerActionState> {
  const raw = {
    companyName: String(formData.get("companyName") ?? ""),
    contactName: String(formData.get("contactName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    partnerType: String(formData.get("partnerType") ?? "OTHER"),
    message: String(formData.get("message") ?? "") || undefined,
    consentRgpd: formData.get("consentRgpd") === "on",
  };

  const result = partnerApplicationSchema.safeParse(raw);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, errors };
  }

  await persistPartnerApplication(result.data);
  revalidatePath("/admin/partenaires");
  return {
    ok: true,
    message:
      "Merci ! Votre candidature est enregistrée. Notre équipe revient vers vous sous 5 jours ouvrés.",
  };
}

async function persistPartnerApplication(data: PartnerApplicationInput) {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.partnerApplication.create({
        data: {
          companyName: data.companyName,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone,
          partnerType: data.partnerType,
          message: data.message ?? null,
        },
      });
    } catch (err) {
      console.error("[partner] DB persist failed", err);
    }
  } else {
    console.log("[partner:dev-fallback]", data);
  }
}
