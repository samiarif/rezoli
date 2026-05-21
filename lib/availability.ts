import "server-only";

/**
 * Load list of blocked / unavailable dates (yyyy-mm-dd) from the DB.
 * Returns [] if no DB / no blocked dates.
 */
export async function loadBlockedDates(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.blockedDate.findMany({
      orderBy: { date: "asc" },
      select: { date: true },
    });
    return rows.map((r) => r.date.toISOString().slice(0, 10));
  } catch (err) {
    console.error("[availability] load failed", err);
    return [];
  }
}
