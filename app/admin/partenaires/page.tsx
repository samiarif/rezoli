import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin · Partenaires",
  robots: { index: false, follow: false },
};

const STATUS_LABELS = {
  PENDING: "En attente",
  APPROVED: "Approuvée",
  REJECTED: "Rejetée",
} as const;

const STATUS_VARIANT = {
  PENDING: "amber",
  APPROVED: "success",
  REJECTED: "danger",
} as const;

export default async function AdminPartnersPage() {
  const apps = await loadApplications();
  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-6">
        <h1 className="display-2">Candidatures partenaires</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {apps.length} candidature{apps.length > 1 ? "s" : ""}.
        </p>
      </header>
      {apps.length === 0 ? (
        <div className="rounded-xl bg-background ring-1 ring-border p-12 text-center text-muted-foreground">
          Aucune candidature pour l&apos;instant.
        </div>
      ) : (
        <div className="rounded-xl bg-background ring-1 ring-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Structure</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Reçue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apps.map((a) => (
                <tr key={a.id} className="hover:bg-cream-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.companyName}</p>
                    {a.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 max-w-md">
                        {a.message}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p>{a.contactName}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                    <p className="text-xs text-muted-foreground">{a.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{a.partnerType}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[a.status]}>
                      {STATUS_LABELS[a.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateFr(a.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

async function loadApplications() {
  if (!process.env.DATABASE_URL) {
    const { DEMO_PARTNERS } = await import("@/lib/demo-fixtures");
    return [...DEMO_PARTNERS].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.partnerApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (err) {
    console.error("[admin/partners] failed", err);
    return [];
  }
}
