import { ReactNode } from "react";

import { Header } from "@/src/components/features/quiz/Header";
import { ProgressBar } from "@/src/components/features/quiz/ProgressBar";
import { QuizInitializer } from "@/src/components/features/quiz/QuizInitializer";
import { HydrationGuard } from "@/src/components/features/quiz/HydrationGuard";

interface QuizLayoutProps {
  children: ReactNode;
}

export default function QuizLayout({ children }: QuizLayoutProps) {
  return (
    <HydrationGuard>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Persistent UI elements that won't unmount on route changes */}
        <QuizInitializer />
        <Header />
        <ProgressBar />

        {/* Main content which changes per route */}
        <main className="flex-1 flex flex-col mt-30">
          <div
            className="mx-auto w-full flex-1 flex flex-col"
            style={{
              maxWidth: "var(--container-max-content)",
              paddingInline: "var(--spacing-container-x-fluid)",
              paddingBlock: "var(--spacing-container-y-fluid)",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </HydrationGuard>
  );
}
