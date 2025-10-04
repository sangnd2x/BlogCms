"use client";

import { useTheme } from "next-themes";
import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

export default function ThemeSwitchButton() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="hover:bg-secondary-200 dark:hover:text-secondary-100 dark:hover:bg-primary-700 p-2 rounded-lg transition-colors cursor-pointer opacity-50">
        <SunIcon />
      </button>
    );
  }

  return (
    <button
      className="dark:hover:text-secondary-100 dark:hover:bg-primary-800 hover:text-secondary-900 p-2 rounded-lg transition-colors cursor-pointer dark:text-secondary-100"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
