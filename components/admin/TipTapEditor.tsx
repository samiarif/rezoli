"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildTiptapExtensions, type TipTapDoc } from "@/lib/tiptap";

type Props = {
  value: TipTapDoc | null;
  onChange: (value: TipTapDoc) => void;
  placeholder?: string;
  imageSubdir?: string;
};

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Commencez à écrire…",
  imageSubdir = "blog",
}: Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const editor = useEditor({
    extensions: buildTiptapExtensions({ placeholder }),
    content: (value as Record<string, unknown>) ?? "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose-rezoli max-w-none focus:outline-none min-h-[400px] px-4 py-4",
      },
    },
  });

  async function uploadImage(file: File) {
    if (!editor) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subdir", imageSubdir);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Échec de l'upload");
        return;
      }
      editor.chain().focus().setImage({ src: data.url, alt: "" }).run();
    } finally {
      setUploading(false);
    }
  }

  function onImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) uploadImage(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-cream-50/50 px-2 py-2">
        <ToolBtn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Titre 2"
        >
          <Heading2 className="size-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Titre 3"
        >
          <Heading3 className="size-4" />
        </ToolBtn>
        <Sep />
        <ToolBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Gras"
        >
          <Bold className="size-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italique"
        >
          <Italic className="size-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="Souligné"
        >
          <UnderlineIcon className="size-4" />
        </ToolBtn>
        <Sep />
        <ToolBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Liste à puces"
        >
          <List className="size-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Liste numérotée"
        >
          <ListOrdered className="size-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Citation"
        >
          <Quote className="size-4" />
        </ToolBtn>
        <Sep />
        <ToolBtn
          active={editor.isActive("link")}
          onClick={setLink}
          label="Lien"
        >
          <Link2 className="size-4" />
        </ToolBtn>
        <ToolBtn
          active={false}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          label="Image"
        >
          <ImageIcon className="size-4" />
        </ToolBtn>
        <ToolBtn
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          label="Séparateur"
        >
          <Minus className="size-4" />
        </ToolBtn>
        <span className="ml-auto flex items-center gap-1">
          <ToolBtn
            active={false}
            onClick={() => editor.chain().focus().undo().run()}
            label="Annuler"
          >
            <Undo2 className="size-4" />
          </ToolBtn>
          <ToolBtn
            active={false}
            onClick={() => editor.chain().focus().redo().run()}
            label="Rétablir"
          >
            <Redo2 className="size-4" />
          </ToolBtn>
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={onImageFile}
        />
      </div>

      {/* Editor body */}
      <EditorContent editor={editor} />

      {/* Embedded prose styling */}
      <style>{`
        .prose-rezoli h1 { font-family: var(--font-display); font-size: 2.25rem; font-weight: 600; letter-spacing: -0.02em; margin: 1.5rem 0 0.75rem; }
        .prose-rezoli h2 { font-family: var(--font-display); font-size: 1.75rem; font-weight: 600; margin: 1.75rem 0 0.75rem; }
        .prose-rezoli h3 { font-size: 1.25rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
        .prose-rezoli p { color: var(--color-neutral-700); line-height: 1.75; margin-bottom: 1rem; }
        .prose-rezoli ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose-rezoli ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose-rezoli li { margin-bottom: 0.25rem; }
        .prose-rezoli blockquote { border-left: 3px solid var(--color-teal-500); padding-left: 1rem; color: var(--color-neutral-600); font-style: italic; margin: 1rem 0; }
        .prose-rezoli a { color: var(--color-teal-700); text-decoration: underline; }
        .prose-rezoli strong { color: var(--color-foreground); }
        .prose-rezoli img { max-width: 100%; height: auto; border-radius: 0.5rem; }
        .prose-rezoli hr { margin: 2rem 0; border-color: var(--color-border); }
        .prose-rezoli p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--color-neutral-400); pointer-events: none; float: left; height: 0; }
      `}</style>
    </div>
  );
}

function ToolBtn({
  children,
  active,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "h-8 w-8",
        active && "bg-teal-50 text-teal-700"
      )}
    >
      {children}
    </Button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}
