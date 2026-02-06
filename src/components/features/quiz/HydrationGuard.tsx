"use client";

import { useEffect, useState } from "react";

/**
 * HydrationGuard - prevents flash of incorrect content during SSR/hydration
 * Shows loader while Zustand store is not hydrated from localStorage
 */
export const HydrationGuard = ({ children }: { children: React.ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist middleware uses onRehydrateStorage callback
    // We'll just wait for next tick to ensure hydration completed
    const timeout = setTimeout(() => {
      setHydrated(true);
    }, 100); // Small delay to ensure persistence loaded

    return () => clearTimeout(timeout);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
