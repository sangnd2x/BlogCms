"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BellIcon } from "lucide-react";
import Image from "next/image";
import ThemeSwitchButton from "@/_components/ThemeSwitchButton";

export default function Header() {
  return (
    <div className="flex justify-end bg-secondary-100 dark:bg-secondary-900 text-white border-secondary-200 border-b dark:border-b-secondary-700">
      <div className={cn("flex items-center justify-between mr-4 gap-2 h-16 text-secondary-950")}>
        <ThemeSwitchButton />
        <button className="dark:text-secondary-100 dark:hover:text-secondary-100 dark:hover:bg-primary-800 hover:bg-secondary-200 hover:text-secondary-900 p-2 rounded-lg transition-colors cursor-pointer">
          <BellIcon />
        </button>
        <Image
          src="/spiderman.jpg"
          alt="Spiderman"
          height="40"
          width="40"
          className="rounded-full object-cover aspect-square"
        />
      </div>
    </div>
  );
}
