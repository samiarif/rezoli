import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const BUCKET = "media";

export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export function getExtFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

export function randomFilename(ext: string): string {
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return `${id}.${ext}`;
}

export function bucketPathFor(subdir: string, filename: string): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${subdir.replace(/^\/+|\/+$/g, "")}/${yyyy}-${mm}/${filename}`;
}

/**
 * Upload a file to Supabase Storage and return a public URL.
 * Throws if SUPABASE env not configured.
 */
export async function uploadToStorage(
  bucketPath: string,
  data: ArrayBuffer | Buffer,
  contentType: string
): Promise<{ publicUrl: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Supabase URL not configured");

  // Use the service role key if available (server-side, bypass RLS); otherwise
  // anon with the user's session cookie. Service role is the safer default.
  if (serviceKey) {
    // service-role uploads via REST
    const endpoint = `${url}/storage/v1/object/${BUCKET}/${bucketPath}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: data as ArrayBuffer,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Supabase upload failed: ${res.status} ${txt}`);
    }
  } else {
    // Fallback: use the user's auth session via @supabase/ssr
    const cookieStore = await cookies();
    const supabase = createServerClient(
      url,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            /* no-op */
          },
        },
      }
    );
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(bucketPath, data as ArrayBuffer, {
        contentType,
        upsert: true,
      });
    if (error) throw error;
  }

  return {
    publicUrl: `${url}/storage/v1/object/public/${BUCKET}/${bucketPath}`,
  };
}

export const MEDIA_BUCKET = BUCKET;
