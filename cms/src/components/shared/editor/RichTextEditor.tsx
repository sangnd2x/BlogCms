"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import RichTextEditorMenu from "@/components/shared/editor/RichTextEditorMenu";
import React, { useEffect } from "react";
import BlogPreview from "@/app/(pages)/blogs/components/BlogPreview";

interface Props {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor: React.FC<Props> = ({content, onChange}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),

      Link.configure({
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      TextStyle,
      FontFamily,
      Highlight,
      Image,
    ],
    immediatelyRender: false,
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      // Remove trailing empty paragraphs and line breaks
      const cleanedHtml = html
        .replace(/(<p><\/p>\s*)+$/, "") // Remove empty <p></p> at the end
        .replace(/(<p>\s*<\/p>\s*)+$/, "") // Remove <p> </p> with whitespace
        .trim();
      onChange(cleanedHtml);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl border rounded-xl px-4 py-8 min-h-[800px] max-h-[800px] overflow-y-auto",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="flex flex-col gap-2">
        <div className="border rounded-md p-1 h-11 animate-pulse bg-gray-100" />
        <div className="min-h-[350px] border rounded-md p-4 animate-pulse bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <RichTextEditorMenu editor={editor} />
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <EditorContent editor={editor} />
        </div>

        <div className="flex-1 min-h-[800px] max-h-[800px] overflow-y-auto">
          <BlogPreview content={content} mode="edit" />
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
