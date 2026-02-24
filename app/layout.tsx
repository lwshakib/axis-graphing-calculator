import type { Metadata } from "next";

/**
 * RootLayout: The top-level layout component for the entire application.
 * Defines global fonts, metadata, theme providers, and shared UI elements 
 * like the Navbar and Toast notifications.
 */

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import NextTopLoader from "nextjs-toploader"; // Progress bar for navigation

/**
 * Global Metadata Configuration for SEO and Browser Branding.
 */
export const metadata: Metadata = {
  title: "AXIS | Advanced Graphing & Scientific Calculator",
  description:
    "Precision meets elegance. AXIS is a powerful suite of mathematical tools for students, engineers, and researchers.",
  icons: {
    icon: [
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      { url: "/favicon_io/favicon.ico", sizes: "any", type: "image/x-icon" },
      {
        url: "/favicon_io/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/favicon_io/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        {/*
          ThemeProvider manages dark/light mode persistence and avoids 
          content flickering during hydration by using the 'class' attribute.
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Visual progress bar at the top of the viewport during route transitions */}
          <NextTopLoader
            color="var(--primary)"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
          />
          
          {/* Global Navbar shared across all routes */}
          <Navbar />
          
          {/* Main content area with top padding to clear the fixed Navbar */}
          <div className="pt-16">{children}</div>
          
          {/* Sonner Toaster for application-wide notifications */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
