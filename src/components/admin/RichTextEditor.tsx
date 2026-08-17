"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type RichTextEditorProps = {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
};

export function RichTextEditor({ id, name, label, defaultValue = "" }: RichTextEditorProps) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[240px] px-4 py-3 focus:outline-none",
      },
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      <div className="overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-low">
        {editor ? (
          <div className="flex flex-wrap items-center gap-1 border-b border-outline-variant/40 p-2">
            <ToolbarButton
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
              icon="format_bold"
            />
            <ToolbarButton
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              icon="format_italic"
            />
            <ToolbarButton
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              icon="format_h2"
            />
            <ToolbarButton
              active={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              icon="format_h3"
            />
            <ToolbarButton
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              icon="format_list_bulleted"
            />
            <ToolbarButton
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              icon="format_list_numbered"
            />
            <ToolbarButton
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              icon="format_quote"
            />
            <span className="mx-1 h-5 w-px bg-outline-variant/40" />
            <ImageToolbarButton editor={editor} />
          </div>
        ) : null}
        <EditorContent editor={editor} id={id} />
      </div>
      {/* Hidden field carries the serialized HTML into the native form submit. */}
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded transition-colors",
        active ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:bg-surface-container",
      )}
    >
      <Icon name={icon} className="text-lg" />
    </button>
  );
}

function ImageToolbarButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function insert(src: string) {
    if (!src.trim()) return;
    editor.chain().focus().setImage({ src: src.trim() }).run();
    setUrl("");
    setOpen(false);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data: { url?: string; error?: string } | null = await response.json().catch(() => null);
      if (!response.ok || !data?.url) {
        setError(data?.error ?? "Falha ao carregar a imagem.");
        return;
      }
      insert(data.url);
    } catch {
      setError("Falha ao carregar a imagem. Verifica a tua ligação e tenta novamente.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative">
      <ToolbarButton active={open} onClick={() => setOpen((v) => !v)} icon="image" />
      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-outline-variant/40 bg-surface p-3 shadow-xl">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            Inserir Imagem
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insert(url);
                }
              }}
              placeholder="https://..."
              className="w-full flex-1 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => insert(url)}
              className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold uppercase text-on-primary transition-transform hover:scale-105"
            >
              Ok
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="text-[10px] uppercase text-on-surface-variant">ou</span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "A enviar..." : "Carregar ficheiro"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void uploadFile(file);
            }}
          />
          {error ? <p className="mt-2 text-xs text-primary">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
