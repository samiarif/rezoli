import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTND, formatDateFr } from "@/lib/utils";
import { STATUS_LABELS, statusBadgeVariant, STATUS_ORDER, type Status } from "@/lib/quote-status";

export const metadata: Metadata = {
  title: "Admin · Demandes de devis",
  robots: { index: false, follow: false },
};

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const quotes = await loadQuotes(status, q);

  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="display-2">Demandes de devis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {quotes.length} demande{quotes.length > 1 ? "s" : ""} affichée
            {quotes.length > 1 ? "s" : ""}.
          </p>
        </div>

        <form className="flex flex-wrap items-center gap-2 text-sm">
          <div className="relative">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Référence, email, nom…"
              className="h-9 w-56 rounded-md border border-input bg-background pl-3 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            />
          </div>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <option value="">Tous statuts</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1 rounded-md bg-teal-700 px-4 text-xs font-medium text-white hover:bg-teal-800"
          >
            <Filter className="size-3.5" />
            Filtrer
          </button>
        </form>
      </header>

      <div className="rounded-xl bg-background ring-1 ring-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream-50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Référence</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Événement</th>
              <th className="text-left px-4 py-3">Invités</th>
              <th className="text-right px-4 py-3">Total TTC</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Reçue</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  Aucune demande ne correspond à ces critères.
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.ref} className="hover:bg-cream-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{q.ref}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{q.customer}</p>
                    <p className="text-xs text-muted-foreground">{q.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{q.eventType}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.eventDate ? formatDateFr(q.eventDate) : "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{q.guestCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {q.totalTTC != null ? formatTND(q.totalTTC) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(q.status)}>
                      {STATUS_LABELS[q.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateFr(q.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/devis/${q.ref}`}
                      className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline"
                    >
                      Ouvrir <ArrowUpRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function loadQuotes(status?: string, q?: string) {
  if (!process.env.DATABASE_URL) {
    const { DEMO_QUOTES } = await import("@/lib/demo-fixtures");
    let rows = [...DEMO_QUOTES];
    if (status && STATUS_ORDER.includes(status as Status)) {
      rows = rows.filter((r) => r.status === status);
    }
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter((r) =>
        [
          r.ref,
          r.email,
          r.firstName,
          r.lastName,
          r.company ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }
    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return rows.map((r) => ({
      ref: r.ref,
      customer: `${r.firstName} ${r.lastName}`,
      email: r.email,
      eventType: r.eventType,
      eventDate: r.eventDate,
      guestCount: r.guestCount,
      status: r.status as Status,
      totalTTC: r.totalTTC,
      createdAt: r.createdAt,
    }));
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.quoteRequest.findMany({
      where: {
        ...(status && STATUS_ORDER.includes(status as Status)
          ? { status: status as Status }
          : {}),
        ...(q
          ? {
              OR: [
                { ref: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
                { company: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        ref: true,
        firstName: true,
        lastName: true,
        email: true,
        eventType: true,
        eventDate: true,
        guestCount: true,
        status: true,
        totalTTCSnapshot: true,
        createdAt: true,
      },
    });
    return rows.map((r) => ({
      ref: r.ref,
      customer: `${r.firstName} ${r.lastName}`,
      email: r.email,
      eventType: r.eventType,
      eventDate: r.eventDate,
      guestCount: r.guestCount,
      status: r.status as Status,
      totalTTC: r.totalTTCSnapshot ? Number(r.totalTTCSnapshot) : null,
      createdAt: r.createdAt,
    }));
  } catch (err) {
    console.error("[admin/devis] load failed", err);
    return [];
  }
}
