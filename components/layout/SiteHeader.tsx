"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn, BUSINESS } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/nos-services", label: "Services" },
  { href: "/nos-packs", label: "Packs" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/nos-partenaires", label: "Nos partenaires" },
  { href: "/blog", label: "Blog" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ variant = "light" }: { variant?: "light" | "dark" }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = variant === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors",
        isDark
          ? "border-neutral-800 bg-neutral-900/85 text-cream-50 backdrop-blur-md"
          : scrolled
          ? "border-teal-500/10 bg-white/85 backdrop-blur-md shadow-xs"
          : "border-transparent bg-white/80 backdrop-blur-sm"
      )}
    >
      <nav
        aria-label="Principal"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className={cn(
            "font-display text-2xl font-bold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded",
            isDark ? "text-white" : "text-teal-700"
          )}
        >
          {BUSINESS.name}
          <span className={isDark ? "text-amber-500" : "text-neutral-900"}>.</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    isDark
                      ? active
                        ? "text-amber-400"
                        : "text-cream-100/80 hover:text-white"
                      : active
                      ? "text-teal-700"
                      : "text-neutral-700 hover:text-teal-700"
                  )}
                >
                  {link.label}
                  {active && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full",
                        isDark ? "bg-amber-400" : "bg-teal-500"
                      )}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant={isDark ? "accent" : "solid"}
            size="sm"
            className="hidden md:inline-flex"
          >
            <Link href="/devis">Demander un devis</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Ouvrir le menu"
                className={cn(
                  "lg:hidden",
                  isDark
                    ? "text-cream-50 hover:bg-white/10 hover:text-white"
                    : "text-neutral-700"
                )}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetHeader>
                <SheetTitle>
                  <span className="text-teal-700">{BUSINESS.name}</span>
                  <span className="text-neutral-900">.</span>
                </SheetTitle>
              </SheetHeader>
              <ul className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-4 py-3 text-base font-medium hover:bg-cream-100 hover:text-teal-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="px-6 py-4 border-t border-border bg-cream-50">
                <Button
                  asChild
                  variant="solid"
                  size="lg"
                  className="w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href="/devis">Demander un devis</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
