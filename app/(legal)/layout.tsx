import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <article className="prose-rezoli">{children}</article>
        </div>
      </main>
      <SiteFooter />

      <style>{`
        .prose-rezoli h1 { font-family: var(--font-display); font-size: clamp(2rem, 3vw + 1rem, 3rem); font-weight: 600; letter-spacing: -0.02em; margin-bottom: 1rem; }
        .prose-rezoli h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 0.75rem; }
        .prose-rezoli h3 { font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .prose-rezoli p { color: var(--color-neutral-700); line-height: 1.75; margin-bottom: 1rem; }
        .prose-rezoli ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose-rezoli li { color: var(--color-neutral-700); margin-bottom: 0.35rem; }
        .prose-rezoli a { color: var(--color-teal-700); text-decoration: underline; }
        .prose-rezoli a:hover { color: var(--color-teal-500); }
        .prose-rezoli strong { color: var(--color-foreground); }
        .prose-rezoli hr { margin: 2rem 0; border-color: var(--color-border); }
      `}</style>
    </>
  );
}
