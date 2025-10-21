import React from "react";
import { cn } from "@/lib/utils";
import { BlogStatus } from "@/types/blog.type";

interface Props {
  className?: string;
  color?: string;
  label?: string;
}

const CustomTag: React.FC<Props> = ({ color = "#ffffff", label, className }) => {
  const darkenColor = (hex: string, amount: number): string => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const color = hex.replace("#", "");
      return {
        r: parseInt(color.substring(0, 2), 16) / 255,
        g: parseInt(color.substring(2, 4), 16) / 255,
        b: parseInt(color.substring(4, 6), 16) / 255,
      };
    };

    // Convert RGB to HSL
    const rgbToHsl = (r: number, g: number, b: number) => {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0,
        s = 0,
        l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      return { h, s, l };
    };

    // Convert HSL to RGB
    const hslToRgb = (h: number, s: number, l: number) => {
      let r, g, b;

      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
      };
    };

    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Reduce lightness
    hsl.l = Math.max(0, hsl.l - amount / 100);

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);

    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(newRgb.r)}${toHex(newRgb.g)}${toHex(newRgb.b)}`;
  };

  const backgroundColor = color;
  const borderColor = darkenColor(color, 50);



  return (
    <span
      className={cn("border py-1 px-2 rounded-md bg-success-soft text-success", className)}
      style={{
        backgroundColor: backgroundColor || "#ffffff",
        borderColor: borderColor,
        color: borderColor || "#ffffff",
      }}
    >
      {label}
    </span>
  );
};

export default CustomTag;
