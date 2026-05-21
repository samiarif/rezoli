import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";
import { BUSINESS } from "@/lib/utils";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BlogOG({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const title = post?.title ?? "Article Rezoli";
  const tag = post?.tags?.[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #145c5c 0%, #1d8080 60%, #c98a2c 100%)",
          color: "white",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>
            {BUSINESS.name}
            <span style={{ color: "#fbf7f1" }}>.</span>
          </div>
          <div
            style={{
              fontSize: 14,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
              fontFamily: "sans-serif",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Blog
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {tag && (
            <div
              style={{
                marginBottom: 16,
                fontSize: 20,
                fontFamily: "sans-serif",
                color: "#fbf7f1",
                opacity: 0.8,
              }}
            >
              # {tag}
            </div>
          )}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    size
  );
}
