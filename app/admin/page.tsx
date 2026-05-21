import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Mail, Handshake, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTND, formatDateFr } from "@/lib/utils";
import { STATUS_LABELS, statusBadgeVariant } from "@/lib/quote-status";

export const metadata: Metadata = {
  title: "Admin · Tableau de bord",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const stats = await loadStats();

  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-8">
        <h1 className="display-2">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vue synthétique de l&apos;activité Rezoli.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard
          icon={FileText}
          label="Demandes (7 j)"
          value={stats.newQuotes7d}
          delta="+12 %"
        />
        <KpiCard
          icon={TrendingUp}
          label="Pipeline TTC"
          value={formatTND(stats.pipelineTTC)}
          delta="estimé"
        />
        <KpiCard
          icon={Mail}
          label="Messages non lus"
          value={stats.unreadMessages}
        />
        <KpiCard
          icon={Handshake}
          label="Partenaires en attente"
          value={stats.pendingPartners}
        />
      </div>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-background ring-1 ring-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">
              Dernières demandes
            </h2>
            <Link
              href="/admin/devis"
              className="text-xs text-teal-700 hover:underline inline-flex items-center gap-1"
            >
              Voir tout <ArrowRight className="size-3" />
            </Link>
          </div>
          {stats.recentQuotes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Aucune demande pour l&apos;instant.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recentQuotes.map((q) => (
                <li key={q.ref}>
                  <Link
                    href={`/admin/devis/${q.ref}`}
                    className="flex items-center justify-between py-3 hover:bg-cream-50 px-2 -mx-2 rounded-md transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {q.ref} · {q.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {q.eventType} · {q.guestCount} invités · {formatDateFr(q.createdAt)}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant(q.status)}>
                      {STATUS_LABELS[q.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-background ring-1 ring-border p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Statuts</h2>
          <ul className="space-y-2 text-sm">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <li
                key={status}
                className="flex items-center justify-between rounded-md bg-cream-50 px-3 py-2"
              >
                <Badge
                  variant={statusBadgeVariant(status as keyof typeof STATUS_LABELS)}
                >
                  {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                </Badge>
                <span className="tabular-nums font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  delta?: string;
}) {
  return (
    <div className="rounded-xl bg-background ring-1 ring-border p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <Icon className="size-4" />
        </span>
        {delta && (
          <span className="text-[11px] text-amber-700 font-medium">{delta}</span>
        )}
      </div>
      <p className="mt-4 font-display text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

async function loadStats() {
  const empty = {
    newQuotes7d: 0,
    pipelineTTC: 0,
    unreadMessages: 0,
    pendingPartners: 0,
    recentQuotes: [] as Array<{
      ref: string;
      customer: string;
      eventType: string;
      guestCount: number;
      status: keyof typeof STATUS_LABELS;
      createdAt: Date;
    }>,
    statusBreakdown: {
      PENDING: 0,
      REVIEWED: 0,
      QUOTE_SENT: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    } as Record<keyof typeof STATUS_LABELS, number>,
  };
  if (!process.env.DATABASE_URL) {
    // Demo mode — derive stats from the in-memory fixtures.
    const { DEMO_QUOTES, DEMO_MESSAGES, DEMO_PARTNERS } = await import(
      "@/lib/demo-fixtures"
    );
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newQuotes7d = DEMO_QUOTES.filter(
      (q) => q.createdAt.getTime() >= sevenDaysAgo.getTime()
    ).length;
    const pipelineTTC = DEMO_QUOTES.filter((q) =>
      ["PENDING", "REVIEWED", "QUOTE_SENT", "CONFIRMED"].includes(q.status)
    ).reduce((sum, q) => sum + (q.totalTTC ?? 0), 0);
    const breakdown = { ...empty.statusBreakdown };
    for (const q of DEMO_QUOTES) {
      breakdown[q.status as keyof typeof STATUS_LABELS] += 1;
    }
    return {
      newQuotes7d,
      pipelineTTC,
      unreadMessages: DEMO_MESSAGES.filter((m) => m.status === "NEW").length,
      pendingPartners: DEMO_PARTNERS.filter((p) => p.status === "PENDING").length,
      recentQuotes: [...DEMO_QUOTES]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map((q) => ({
          ref: q.ref,
          customer: `${q.firstName} ${q.lastName}`,
          eventType: q.eventType,
          guestCount: q.guestCount,
          status: q.status as keyof typeof STATUS_LABELS,
          createdAt: q.createdAt,
        })),
      statusBreakdown: breakdown,
    };
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      newQuotes7d,
      pipelineRows,
      unreadMessages,
      pendingPartners,
      recentRows,
      statusRows,
    ] = await Promise.all([
      prisma.quoteRequest.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.quoteRequest.aggregate({
        where: { status: { in: ["PENDING", "REVIEWED", "QUOTE_SENT", "CONFIRMED"] } },
        _sum: { totalTTCSnapshot: true },
      }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
      prisma.partnerApplication.count({ where: { status: "PENDING" } }),
      prisma.quoteRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          ref: true,
          firstName: true,
          lastName: true,
          eventType: true,
          guestCount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.quoteRequest.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);
    const breakdown = { ...empty.statusBreakdown };
    for (const row of statusRows) {
      breakdown[row.status as keyof typeof STATUS_LABELS] = row._count._all;
    }
    return {
      newQuotes7d,
      pipelineTTC: Number(pipelineRows._sum.totalTTCSnapshot ?? 0),
      unreadMessages,
      pendingPartners,
      recentQuotes: recentRows.map((r) => ({
        ref: r.ref,
        customer: `${r.firstName} ${r.lastName}`,
        eventType: r.eventType,
        guestCount: r.guestCount,
        status: r.status as keyof typeof STATUS_LABELS,
        createdAt: r.createdAt,
      })),
      statusBreakdown: breakdown,
    };
  } catch (err) {
    console.error("[admin/dashboard] failed", err);
    return empty;
  }
}
