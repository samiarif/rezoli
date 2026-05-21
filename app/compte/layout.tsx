import Link from "next/link";
import { BUSINESS } from "@/lib/utils";

export default function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-teal-700"
          >
            {BUSINESS.name}
            <span className="text-neutral-900">.</span>
          </Link>
          <nav aria-label="Espace client" className="flex items-center gap-4 text-sm">
            <Link href="/compte" className="text-foreground hover:text-teal-700">
              Mes demandes
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-teal-700">
              Retour site
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
