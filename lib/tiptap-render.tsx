/**
 * Server-side TipTap → HTML renderer for public pages.
 * Wraps the generated HTML in `.prose-rezoli` for typography styles.
 */
import { generateHTML } from "@tiptap/html";
import { buildTiptapExtensions, type TipTapDoc } from "./tiptap";

export function TipTapRender({ doc }: { doc: TipTapDoc | null | undefined }) {
  if (!doc || typeof doc !== "object") return null;
  let html: string;
  try {
    html = generateHTML(doc as Record<string, unknown>, buildTiptapExtensions());
  } catch (err) {
    console.error("[tiptap-render]", err);
    return null;
  }
  return (
    <article
      className="prose-rezoli max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
