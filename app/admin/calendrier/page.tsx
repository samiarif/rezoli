import type { Metadata } from "next";
import { CalendarDays, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatDateFr } from "@/lib/utils";
import { blockDate, unblockDate } from "./actions";

export const metadata: Metadata = {
  title: "Admin · Calendrier",
  robots: { index: false, follow: false },
};

export default async function AdminCalendarPage() {
  const blocked = await loadBlocked();

  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-6">
        <p className="eyebrow">Opérations</p>
        <h1 className="display-2 mt-2">Calendrier — dates bloquées</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Marquez les dates où Rezoli est complet ou indisponible. Les
          visiteurs verront ces dates comme déjà prises lors de leur demande.
        </p>
      </header>

      {/* Block form */}
      <section className="rounded-xl bg-background ring-1 ring-border p-6 mb-8">
        <form action={blockDate} className="grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
          <div>
            <Label htmlFor="date" required>
              Date à bloquer
            </Label>
            <Input id="date" type="date" name="date" required />
          </div>
          <div>
            <Label htmlFor="reason">Raison (optionnel)</Label>
            <Input
              id="reason"
              name="reason"
              placeholder="Ex : événement déjà confirmé, congés équipe"
            />
          </div>
          <Button type="submit" variant="solid">
            <CalendarDays className="size-4" /> Bloquer
          </Button>
        </form>
      </section>

      {/* List */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">
          {blocked.length} date{blocked.length > 1 ? "s" : ""} bloquée
          {blocked.length > 1 ? "s" : ""}
        </h2>
        {blocked.length === 0 ? (
          <div className="rounded-xl bg-cream-50 ring-1 ring-cream-100 p-10 text-center">
            <CalendarDays className="size-10 mx-auto text-teal-600 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune date bloquée. Toutes les dates futures sont disponibles
              pour les demandes.
            </p>
          </div>
        ) : (
          <ul className="rounded-xl bg-background ring-1 ring-border divide-y divide-border">
            {blocked.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{formatDateFr(b.date)}</p>
                  {b.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.reason}
                    </p>
                  )}
                </div>
                <form action={unblockDate}>
                  <input type="hidden" name="id" value={b.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    <Trash2 className="size-4" /> Débloquer
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

async function loadBlocked() {
  if (!process.env.DATABASE_URL) {
    // A couple of plausible blocked dates for the demo
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = (n: number) =>
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
    return [
      {
        id: "blk-1",
        date: d(5),
        reason: "Repos équipe — pont 1er mai",
        createdAt: d(-10),
      },
      {
        id: "blk-2",
        date: d(12),
        reason: "Maintenance cuisine centrale",
        createdAt: d(-3),
      },
      {
        id: "blk-3",
        date: d(28),
        reason: "Réservation interne (équipe complète)",
        createdAt: d(-1),
      },
    ];
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.blockedDate.findMany({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
    });
  } catch (err) {
    console.error("[calendrier] load failed", err);
    return [];
  }
}
