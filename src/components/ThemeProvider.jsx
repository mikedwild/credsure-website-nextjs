"use client";
import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Light-only theme. Dark mode was removed in iter 49 — `forcedTheme="light"`
 * pins the document class, neutering any leftover `dark:*` Tailwind utilities.
 */
export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
