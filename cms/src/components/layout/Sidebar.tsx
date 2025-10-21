"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  FileText,
  FolderOpen,
  LayoutDashboard,
  PenTool,
  Settings,
  Tags,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAppSelector } from "@/lib/redux/hooks";

const SidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Blogs",
    href: "/blogs",
    icon: FileText,
  },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  {
    name: "Tags",
    href: "/tags",
    icon: Tags,
  },
  { name: "Media", href: "/media", icon: ImageIcon },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAppSelector(state => state.auth);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-secondary-100 dark:bg-secondary-900 mx-auto border-secondary-200 dark:border-secondary-900 border dark:border-r-secondary-700 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Top sidebar*/}
      <div className="flex items-center justify-between gap-2 border-secondary-200 border-b dark:border-b-secondary-700 h-16">
        {!collapsed && (
          <div className="flex items-center justify-center gap-2 ml-4">
            <div className="bg-primary-500 text-secondary-100 dark:text-secondary-950 p-2 rounded-lg my-4">
              <PenTool />
            </div>
            <p className="text-primary-500 font-bold dark:text-secondary-100">Blog CMS</p>
          </div>
        )}
        <button
          className={cn(
            "text-secondary-950 dark:text-secondary-100 dark:hover:bg-primary-800 hover:bg-secondary-200 hover:text-secondary-900 p-2 rounded-lg transition-colors cursor-pointer",
            collapsed ? "m-4" : "mr-4"
          )}
          onClick={() => toggleSidebar()}
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigations */}
      <nav
        className={cn(
          " flex-1 space-y-2 text-secondary-950 dark:text-secondary-100 flex flex-col items-left my-4 gap-2",
          collapsed ? "mx-2" : "mx-6"
        )}
      >
        {SidebarItems.map(item => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex gap-2 py-2 transition-all duration-200",
                isActive
                  ? "border-blue-300 dark:border-blue-600 bg-blue-100 dark:bg-blue-900 border rounded-md text-blue-500 dark:text-blue-300 font-semibold"
                  : "hover:bg-secondary-200 hover:rounded-md",
                collapsed ? "px-2" : "px-4"
              )}
            >
              <item.icon />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className={cn("border-secondary-200 border-t dark:border-t-secondary-700", collapsed ? "p-2" : "p-2")}>
        <div className={cn("flex gap-2 justify-center items-center p-2 hover:bg-secondary-200 hover:rounded-md")}>
          <Image
            src="/spiderman.jpg"
            alt="Spiderman"
            height="40"
            width="40"
            className="rounded-full object-cover aspect-square"
          />
          {!collapsed && (
              <div className={cn("flex flex-col")}>
                <span className="text-secondary-950 dark:text-secondary-100 text-sm">{user?.name}</span>
                <span className="text-secondary-400 text-xs">{user?.email}</span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
