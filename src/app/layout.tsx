import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import ThemeProvider from "@/app/theme/ThemeProvider";

import * as ui from "@/ui/classes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareShift",
  description: "Hospital workforce scheduling demo",
};

// Applies the saved or system theme before React hydrates.
// This prevents a visible light/dark flash on initial load.
const themeScript = `
  (() => {
    try {
      const storedTheme = localStorage.getItem("careshift-theme");

      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      const resolvedTheme =
        storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : systemDark
            ? "dark"
            : "light";

      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedTheme);
    } catch {
      document.documentElement.classList.add("light");
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <div className="min-h-screen p-3">
            <div className={ui.appFrame}>{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
