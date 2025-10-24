import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  color?: string;
  label?: string;
}

const CustomTag: React.FC<Props> = ({ color = "#ffffff", label, className }) => {
  const [darkerColor, setDarkerColor] = useState("");
  const darkenColor = (hex: string, percentage: number = 20): string => {
    hex = hex.replace("#", "");

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Darken by reducing each channel by percentage
    const darken = (value: number) => Math.max(0, Math.floor(value * (1 - percentage / 100)));

    const newR = darken(r);
    const newG = darken(g);
    const newB = darken(b);

    // Convert back to hex
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  };

  useEffect(() => {
    const darkColor = darkenColor(color, 50);
    setDarkerColor(darkColor);
  }, [color]);

  return (
    <span
      className={cn("border py-1 px-2 rounded-md bg-success-soft text-success", className)}
      style={{
        backgroundColor: color,
        borderColor: darkerColor,
        color: darkerColor,
      }}
    >
      <span className="capitalize">{label}</span>
    </span>
  );
};

export default CustomTag;
