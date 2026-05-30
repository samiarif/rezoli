"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Handshake,
  Users,
  ExternalLink,
  ChefHat,
  FolderOpen,
  Pencil,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { cn, BUSINESS } from "@/lib/utils";
import { logoutAdmin } from "@/app/admin/login/actions";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, group: "Activité" },
  { href: "/admin/devis", label: "Demandes de devis", icon: FileText, group: "Activité" },
  { href: "/admin/calendrier", label: "Calendrier", icon: CalendarDays, group: "Activité" },
  { href: "/admin/partenaires", label: "Partenaires", icon: Handshake, group: "Activité" },
  { href: "/admin/messages", label: "Messages", icon: Mail, group: "Activité" },
  { href: "/admin/clients", label: "Clients", icon: Users, group: "Activité" },
  { href: "/admin/catalog", label: "Catalogue", icon: ChefHat, group: "Contenu" },
  { href: "/admin/realisations", label: "Réalisations", icon: FolderOpen, group: "Contenu" },
  { href: "/admin/blog", label: "Blog", icon: Pencil, group: "Contenu" },
];

export function AdminSidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-neutral-900 text-cream-50">
      <div className="p-6 border-b border-white/10">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-white"
        >
          {BUSINESS.name}
          <span className="text-amber-500">.</span>
        </Link>
        <p className="mt-1 text-xs text-cream-50/60 uppercase tracking-wider">
          Admin Console
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto" aria-label="Admin">
        {["Activité", "Contenu"].map((group) => (
          <div key={group}>
            <p className="px-3 mb-1.5 text-[10px] text-cream-50/40 uppercase tracking-wider">
              {group}
            </p>
            <div className="space-y-1">
              {NAV.filter((item) => item.group === group).map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      active
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-cream-50/75 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10 text-xs space-y-2">
        <p className="text-cream-50/60 truncate">{userEmail ?? ""}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-cream-50/60 hover:text-amber-400"
        >
          <ExternalLink className="size-3" />
          Voir le site
        </Link>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="inline-flex items-center gap-1 text-cream-50/60 hover:text-amber-400"
          >
            <LogOut className="size-3" />
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
