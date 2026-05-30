import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { getAdminSession, isAdminConfigured, isAdminDevBypass } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login route renders standalone; the matching path skips this layout.
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";
  const isLogin = pathname.startsWith("/admin/login");

  // No admin credentials AND no dev bypass → placeholder.
  if (!isAdminConfigured() && !isAdminDevBypass()) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 bg-neutral-900 text-cream-50">
        <div className="max-w-md rounded-xl bg-amber-500/10 border border-amber-500/30 p-6 text-center">
          <p className="font-display text-xl font-semibold text-amber-300">
            Admin non encore configuré
          </p>
          <p className="mt-2 text-sm text-cream-50/80">
            Définissez{" "}
            <code className="bg-amber-500/15 px-1.5 py-0.5 rounded">
              ADMIN_EMAIL
            </code>{" "}
            et{" "}
            <code className="bg-amber-500/15 px-1.5 py-0.5 rounded">
              ADMIN_PASSWORD
            </code>{" "}
            dans les variables d&apos;environnement (ou{" "}
            <code className="bg-amber-500/15 px-1.5 py-0.5 rounded">
              ADMIN_DEV_BYPASS=1
            </code>{" "}
            pour la démo).
          </p>
        </div>
      </main>
    );
  }

  if (!isLogin) {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) redirect("/admin/login");
    const demo = !!session.demo;
    return (
      <div className="min-h-screen flex bg-cream-50">
        <AdminSidebar userEmail={session.user.email} />
        <main id="main" className="flex-1 min-w-0">
          {demo && (
            <div
              role="status"
              className="sticky top-0 z-20 bg-amber-500 text-neutral-900 px-4 sm:px-6 lg:px-10 py-2 text-xs font-medium"
            >
              <span className="inline-flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-neutral-900" />
                Mode démo (ADMIN_DEV_BYPASS) — l&apos;UI est navigable, mais
                les enregistrements ne sont pas persistés.
              </span>
            </div>
          )}
          {children}
        </main>
      </div>
    );
  }
  return <>{children}</>;
}
