"use client";

import * as React from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UploadedAsset = {
  url: string;
  id?: string;
  width?: number | null;
  height?: number | null;
};

type Props = {
  value?: string;
  onChange: (asset: UploadedAsset | null) => void;
  subdir?: string;
  altText?: string;
  className?: string;
  label?: string;
};

export function MediaUploader({
  value,
  onChange,
  subdir = "general",
  altText,
  className,
  label = "Téléverser une image",
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subdir", subdir);
      if (altText) fd.append("altText", altText);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Échec de l'upload");
        return;
      }
      onChange({
        url: data.url,
        id: data.id,
        width: data.width,
        height: data.height,
      });
      toast.success("Image téléversée");
    } finally {
      setBusy(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  }

  if (value) {
    return (
      <div className={cn("relative inline-block group", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt={altText ?? ""}
          className="max-h-48 w-auto rounded-lg ring-1 ring-border"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
          aria-label="Retirer l'image"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-cream-50 p-8 text-center transition-colors",
        dragOver ? "border-teal-500 bg-teal-50" : "border-border",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background ring-1 ring-border">
        <ImageIcon className="size-5 text-teal-700" />
      </span>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Glissez-déposez ou cliquez (jpg, png, webp, avif · max 8 Mo)
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        <Upload className="size-4" />
        {busy ? "Téléversement…" : "Choisir une image"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}
