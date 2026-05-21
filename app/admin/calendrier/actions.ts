"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function blockDate(formData: FormData) {
  await requireAdmin();
  const date = String(formData.get("date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!date || !process.env.DATABASE_URL) return;
  const { prisma } = await import("@/lib/prisma");
  try {
    await prisma.blockedDate.upsert({
      where: { date: new Date(date) },
      create: { date: new Date(date), reason },
      update: { reason },
    });
  } catch (err) {
    console.error("[calendrier] block failed", err);
  }
  revalidatePath("/admin/calendrier");
  revalidatePath("/nos-services/cocktails-dinatoires");
  revalidatePath("/nos-services/pauses-cafe");
  revalidatePath("/nos-services/pauses-dejeuner");
  revalidatePath("/nos-services/stations-street-food");
}

export async function unblockDate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || !process.env.DATABASE_URL) return;
  const { prisma } = await import("@/lib/prisma");
  try {
    await prisma.blockedDate.delete({ where: { id } });
  } catch (err) {
    console.error("[calendrier] unblock failed", err);
  }
  revalidatePath("/admin/calendrier");
}
