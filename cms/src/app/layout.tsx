import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Sidebar from "@/_components/Sidebar";
import Header from "@/_components/Header";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Blog CMS",
  description: "Blog CMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
