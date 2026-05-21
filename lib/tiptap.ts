import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";

/**
 * Shared TipTap extension set used by both the admin editor and the
 * server-side HTML renderer for public pages.
 */
export function buildTiptapExtensions(opts?: {
  placeholder?: string;
}) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      codeBlock: { HTMLAttributes: { class: "rounded-md bg-cream-100 p-3 text-sm" } },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: { class: "rounded-lg my-6" },
    }),
    Typography,
    Placeholder.configure({
      placeholder: opts?.placeholder ?? "Commencez à écrire…",
    }),
  ];
}

export type TipTapDoc = unknown;
