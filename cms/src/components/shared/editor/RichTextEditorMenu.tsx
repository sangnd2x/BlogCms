import { Editor } from "@tiptap/core";
import React, { JSX, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignLeft,
  Highlighter,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
  Unlink,
  List,
  ListOrdered,
} from "lucide-react";
import TooltipButton from "@/components/shared/TooltipButton";
import { useEditorState } from "@tiptap/react";
import { toast } from "sonner";
import FontFamilyDropdown from "@/components/shared/editor/FontDropdown";
import { uploadImage } from "@/routes/media";

interface Props {
  editor: Editor | null;
  onImageUploaded?: (imageUrl: string) => void;
}

type Options = {
  name: string;
  onClick: () => void;
  icon: JSX.Element;
  className: string;
  disabled?: boolean;
};

const RichTextEditorMenu: React.FC<Props> = ({ editor, onImageUploaded }) => {
  if (!editor) return null;

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        isHighlight: ctx.editor.isActive("highlight") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
        isAlignLeft: ctx.editor.isActive({ textAlign: "left" }) ?? false,
        isAlignCenter: ctx.editor.isActive({ textAlign: "center" }) ?? false,
        isAlignRight: ctx.editor.isActive({ textAlign: "right" }) ?? false,
        isAlignJustify: ctx.editor.isActive({ textAlign: "justify" }) ?? false,
        isLink: ctx.editor.isActive("link") ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
      };
    },
  });

  // Handle file upload to backend
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    const displayName = file.name.length > 40 ? file.name.substring(0, 37) + "..." : file.name;

    const loadingSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#f9fafb"/>
        <circle cx="200" cy="150" r="30" fill="none" stroke="#e5e7eb" stroke-width="4"/>
        <circle cx="200" cy="150" r="30" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round" stroke-dasharray="47 94.2">
          <animateTransform attributeName="transform" type="rotate" from="0 200 150" to="360 200 150" dur="1s" repeatCount="indefinite"/>
        </circle>
        <text x="200" y="190" text-anchor="middle" fill="#9ca3af" font-family="system-ui, -apple-system, sans-serif" font-size="11">
            ${displayName}
          </text>
      </svg>
    `)}`;

    // Insert loading placeholder into editor
    editor.chain().focus().setImage({ src: loadingSVG }).run();

    try {
      const response = await uploadImage.uploadImage(file);
      const uploadedImageUrl = response?.data?.url as string;

      // Find and replace the placeholder
      const { state } = editor;
      const { doc } = state;
      let placeholderPos: number | null = null;

      doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.src === loadingSVG) {
          placeholderPos = pos;
          return false; // Stop iteration
        }
      });

      if (placeholderPos !== null) {
        editor
          .chain()
          .focus()
          .setNodeSelection(placeholderPos)
          .deleteSelection()
          .insertContentAt(placeholderPos, {
            type: "image",
            attrs: {
              src: uploadedImageUrl,
              alt: file.name,
            },
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setImage({
            src: uploadedImageUrl,
            alt: file.name,
          })
          .run();
      }

      // Notify parent component that an image was uploaded
      if (onImageUploaded) {
        onImageUploaded(uploadedImageUrl);
      }

      toast.success(response.message || "Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Trigger file input
  const addImageFromFile = () => {
    fileInputRef.current?.click();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    // Cancelled
    if (url === null) {
      return;
    }

    // Empty - remove link
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Validate URL format
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      alert("URL must start with http:// or https://");
      return;
    }

    // Set link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // ✅ Remove link functionality
  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const options: Options[] = [
    {
      name: "heading 1",
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      icon: <Heading1 className="h-8 w-8" />,
      className: editorState.isHeading1 ? "bg-gray-200" : "",
    },
    {
      name: "heading 2",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      icon: <Heading2 className="h-8 w-8" />,
      className: editorState.isHeading2 ? "bg-gray-200" : "",
    },
    {
      name: "heading 3",
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      icon: <Heading3 className="h-8 w-8" />,
      className: editorState.isHeading3 ? "bg-gray-200" : "",
    },
    {
      name: "heading 4",
      onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
      icon: <Heading4 className="h-8 w-8" />,
      className: editorState.isHeading4 ? "bg-gray-200" : "",
    },
    {
      name: "bold",
      onClick: () => editor.chain().focus().toggleBold().run(),
      icon: <Bold className="h-8 w-8" />,
      className: editorState.isBold ? "bg-gray-200" : "",
    },
    {
      name: "italic",
      onClick: () => editor.chain().focus().toggleItalic().run(),
      icon: <Italic className="h-8 w-8" />,
      className: editorState.isItalic ? "bg-gray-200" : "",
    },
    {
      name: "strike through",
      onClick: () => editor.chain().focus().toggleStrike().run(),
      icon: <Strikethrough className="h-8 w-8" />,
      className: editorState.isStrike ? "bg-gray-200" : "",
    },
    {
      name: "bullet list",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      icon: <List className="h-8 w-8" />,
      className: editorState.isBulletList ? "bg-gray-200" : "",
    },
    {
      name: "numbered list",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      icon: <ListOrdered className="h-8 w-8" />,
      className: editorState.isOrderedList ? "bg-gray-200" : "",
    },
    {
      name: "align left",
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      icon: <AlignLeft className="h-8 w-8" />,
      className: editorState.isAlignLeft ? "bg-gray-200" : "",
    },
    {
      name: "align center",
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      icon: <AlignCenter className="h-8 w-8" />,
      className: editorState.isAlignCenter ? "bg-gray-200" : "",
    },
    {
      name: "align right",
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      icon: <AlignRight className="h-8 w-8" />,
      className: editorState.isAlignRight ? "bg-gray-200" : "",
    },
    {
      name: "align justify",
      onClick: () => editor.chain().focus().setTextAlign("justify").run(),
      icon: <AlignJustify className="h-8 w-8" />,
      className: editorState.isAlignJustify ? "bg-gray-200" : "",
    },
    {
      name: "highlight",
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      icon: <Highlighter className="h-8 w-8" />,
      className: editorState.isHighlight ? "bg-gray-200" : "",
    },
    {
      name: "insert image",
      onClick: addImageFromFile,
      icon: isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImageIcon className="h-8 w-8" />,
      className: "",
      disabled: isUploading,
    },
    {
      name: "add link",
      onClick: setLink,
      icon: <LinkIcon className="h-8 w-8" />,
      className: editorState.isLink ? "bg-gray-200" : "",
    },
    {
      name: "remove link",
      onClick: removeLink,
      icon: <Unlink className="h-8 w-8" />,
      className: "",
      disabled: !editorState.isLink,
    },
  ];

  return (
    <div className="border rounded-md p-1 bg-white dark:bg-gray-900 sticky z-20 shadow-sm -top-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageUpload}
        className="hidden"
        disabled={isUploading}
      />

      <div className="flex flex-wrap gap-2 items-center">
        <FontFamilyDropdown editor={editor} />
        {options.map(option => {
          return (
            <TooltipButton
              key={option.name}
              variant="outline"
              tooltip={option.name}
              onClick={option.onClick}
              icon={option.icon}
              className={option.className}
              disabled={option.disabled}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RichTextEditorMenu;
