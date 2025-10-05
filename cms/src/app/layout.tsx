import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { ThemeProvider } from "next-themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryProvider } from "@/components/layout/QueryProvider";
import StoreProvider from "@/lib/redux/storeProvider";

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
        <StoreProvider>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system">
              {children}
            </ThemeProvider>
            {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
