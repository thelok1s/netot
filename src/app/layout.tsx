import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";
import React from "react";
import type { Viewport } from "next";

export const metadata = {
  title: "neTOT",
  description: "Безопасники решают теорию (электро)связи по своему",
  keywords: ["zss", "зсс", "теория связи", "тэс", "отс"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div style={{ userSelect: "none" }}>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
