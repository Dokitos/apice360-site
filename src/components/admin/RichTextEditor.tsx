"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
    extensions: [StarterKit],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[240px] px-4 py-3 focus:outline-none",
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
          <div className="flex flex-wrap gap-1 border-b border-outline-variant/40 p-2">
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
