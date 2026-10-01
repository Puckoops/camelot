"use client";

import { ThemeProvider, Toaster, TooltipProvider } from "@puckoops/camelot";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultPreference="light">
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
