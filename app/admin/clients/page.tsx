import type { Metadata } from "next";
import { formatDateFr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin · Clients",
  robots: { index: false, follow: false },
};

export default async function AdminClientsPage() {
  const users = await loadUsers();
  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-6">
        <h1 className="display-2">Clients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {users.length} client{users.length > 1 ? "s" : ""}.
        </p>
      </header>

      {users.length === 0 ? (
        <div className="rounded-xl bg-background ring-1 ring-border p-12 text-center text-muted-foreground">
          Aucun client enregistré pour le moment.
        </div>
      ) : (
        <div className="rounded-xl bg-background ring-1 ring-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Téléphone</th>
                <th className="text-left px-4 py-3">Société</th>
                <th className="text-right px-4 py-3">Demandes</th>
                <th className="text-left px-4 py-3">Inscrit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-cream-50/50">
                  <td className="px-4 py-3">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-xs">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{u.company ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{u.quoteCount}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateFr(u.createdAt)}
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

async function loadUsers() {
  if (!process.env.DATABASE_URL) {
    const { DEMO_QUOTES } = await import("@/lib/demo-fixtures");
    // Synthesize clients from the quotes (unique by email)
    const byEmail = new Map<
      string,
      {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
        company: string | null;
        createdAt: Date;
        quoteCount: number;
      }
    >();
    for (const q of DEMO_QUOTES) {
      const existing = byEmail.get(q.email);
      if (existing) {
        existing.quoteCount += 1;
        if (q.createdAt < existing.createdAt) existing.createdAt = q.createdAt;
      } else {
        byEmail.set(q.email, {
          id: `demo-client-${byEmail.size + 1}`,
          firstName: q.firstName,
          lastName: q.lastName,
          email: q.email,
          phone: q.phone,
          company: q.company,
          createdAt: q.createdAt,
          quoteCount: 1,
        });
      }
    }
    return Array.from(byEmail.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { _count: { select: { quotes: true } } },
    });
    return rows.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      company: u.company,
      createdAt: u.createdAt,
      quoteCount: u._count.quotes,
    }));
  } catch (err) {
    console.error("[admin/clients] failed", err);
    return [];
  }
}
