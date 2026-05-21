"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function GalleryLightbox({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const prev = React.useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = React.useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length]
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (images.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((url, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => openAt(i)}
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream-100 w-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              aria-label={`Agrandir l'image ${i + 1} sur ${images.length}`}
            >
              <Image
                src={url}
                alt={`${title} – image ${i + 1}`}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover img-warm transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0 bg-neutral-900 ring-0 border-0">
          <DialogTitle className="sr-only">
            {title} — image {index + 1} sur {images.length}
          </DialogTitle>
          <div className="relative w-full" style={{ aspectRatio: "16 / 10" }}>
            <Image
              src={images[index]}
              alt={`${title} – image ${index + 1}`}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/70 text-white backdrop-blur hover:bg-neutral-900 transition-colors"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/70 text-white backdrop-blur hover:bg-neutral-900 transition-colors"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-xs text-cream-50/80">
            <span>{title}</span>
            <span>
              {index + 1} / {images.length}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
