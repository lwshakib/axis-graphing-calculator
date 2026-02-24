"use client";

/**
 * ThemeProvider component that wraps the application with `next-themes` support.
 * This enables theme switching (dark/light/system) across the entire component tree.
 */

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Pass all props directly to the NextThemesProvider from 'next-themes'
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
