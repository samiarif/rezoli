import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";
import {
  ALLOWED_MIME,
  MAX_BYTES,
  bucketPathFor,
  getExtFromMime,
  randomFilename,
  uploadToStorage,
} from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await requireAdmin().catch(() => null);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const subdir = String(form.get("subdir") ?? "general");
  const altText = String(form.get("altText") ?? "") || null;

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return NextResponse.json(
      { error: "Format non supporté (jpg, png, webp, avif uniquement)" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 8 Mo)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let width: number | null = null;
  let height: number | null = null;
  try {
    const meta = await sharp(buffer).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
  } catch {
    // non-fatal
  }

  const ext = getExtFromMime(file.type);
  const filename = randomFilename(ext);
  const path = bucketPathFor(subdir, filename);

  try {
    const { publicUrl } = await uploadToStorage(path, buffer, file.type);

    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const asset = await prisma.mediaAsset.create({
          data: {
            url: publicUrl,
            bucketPath: path,
            originalName: (file as File).name ?? filename,
            mimeType: file.type,
            size: file.size,
            width,
            height,
            altText,
            uploadedById: session.user.id ?? null,
          },
        });
        return NextResponse.json({
          ok: true,
          url: publicUrl,
          id: asset.id,
          width,
          height,
        });
      } catch (err) {
        console.error("[upload] DB persist failed (asset still in storage)", err);
      }
    }

    return NextResponse.json({ ok: true, url: publicUrl, width, height });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
  }
}
