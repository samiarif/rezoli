import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { formatTND, formatDateFr } from "@/lib/utils";
import { STATUS_LABELS, statusBadgeVariant } from "@/lib/quote-status";

export const metadata: Metadata = {
  title: "Mes demandes",
  robots: { index: false, follow: false },
};

export default async function ComptePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <ConfigPlaceholder />;
  }
  const session = await getSession();
  if (!session) redirect("/compte/login");

  const quotes = await loadQuotes(session.user.email!);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <p className="eyebrow">Espace client</p>
          <h1 className="display-2 mt-2">Mes demandes</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Bonjour <strong>{session.user.email}</strong>. Voici l&apos;historique
            de vos demandes de devis.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/nos-services">
            <Plus className="size-4" /> Nouvelle demande
          </Link>
        </Button>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-2xl bg-cream-50 ring-1 ring-cream-100 p-12 text-center">
          <FileText className="size-10 mx-auto text-teal-600" />
          <p className="font-display text-xl font-semibold mt-4">
            Aucune demande pour l&apos;instant
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Lorsque vous soumettrez une demande de devis, elle apparaîtra ici
            avec son statut et ses détails.
          </p>
          <Button asChild variant="solid" className="mt-6">
            <Link href="/nos-services">Faire une demande</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => (
            <li key={q.ref}>
              <Link
                href={`/compte/devis/${q.ref}`}
                className="group flex items-center justify-between gap-4 rounded-xl bg-background ring-1 ring-border p-5 hover:ring-teal-500/40 hover:shadow-sm transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-lg font-semibold">
                      {q.ref}
                    </span>
                    <Badge variant={statusBadgeVariant(q.status)}>
                      {STATUS_LABELS[q.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {q.eventType} · {q.guestCount} invités ·{" "}
                    {q.eventDate ? formatDateFr(q.eventDate) : "Date à préciser"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {q.totalTTC != null && (
                    <span className="hidden sm:inline text-sm tabular-nums font-medium">
                      {formatTND(q.totalTTC)}
                    </span>
                  )}
                  <ArrowRight className="size-4 text-teal-600 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function loadQuotes(email: string) {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.quoteRequest.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
      select: {
        ref: true,
        status: true,
        eventDate: true,
        eventType: true,
        guestCount: true,
        totalTTCSnapshot: true,
      },
    });
    return rows.map((r) => ({
      ref: r.ref,
      status: r.status,
      eventDate: r.eventDate,
      eventType: r.eventType,
      guestCount: r.guestCount,
      totalTTC: r.totalTTCSnapshot ? Number(r.totalTTCSnapshot) : null,
    }));
  } catch (err) {
    console.error("[compte] load quotes failed", err);
    return [];
  }
}

function ConfigPlaceholder() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
        <p className="font-display text-xl font-semibold text-amber-900">
          Espace client non encore activé
        </p>
        <p className="mt-2 text-sm text-amber-900/80">
          Connectez Supabase via les variables d&apos;environnement{" "}
          <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          et{" "}
          <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          pour activer la connexion par lien magique.
        </p>
      </div>
    </div>
  );
}
