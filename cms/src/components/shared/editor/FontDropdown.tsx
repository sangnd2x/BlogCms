import React from "react";
import { Editor } from "@tiptap/core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FontFamilyDropdownProps {
  editor: Editor;
}

const FONT_FAMILIES = [
  { name: "Default", value: "default" },
  { name: "Inter", value: "Inter" },
  { name: "Arial", value: "Arial" },
  { name: "Helvetica", value: "Helvetica" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Georgia", value: "Georgia" },
  { name: "Courier New", value: "Courier New" },
  { name: "Verdana", value: "Verdana" },
  { name: "Comic Sans MS", value: "Comic Sans MS" },
  { name: "Roboto", value: "Roboto" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Poppins", value: "Poppins" },
  { name: "Playfair Display", value: "Playfair Display" },
];

const FontFamilyDropdown: React.FC<FontFamilyDropdownProps> = ({ editor }) => {
  const currentFont = editor.getAttributes("textStyle").fontFamily || "";

  const handleFontChange = (fontFamily: string) => {
    if (fontFamily === "") {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(fontFamily).run();
    }
  };

  return (
    <Select value={currentFont} onValueChange={handleFontChange}>
      <SelectTrigger className="w-[180px] h-10">
        <SelectValue placeholder="Font" />
      </SelectTrigger>
      <SelectContent>
        {FONT_FAMILIES.map(font => (
          <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value || "inherit" }}>
            {font.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FontFamilyDropdown;
