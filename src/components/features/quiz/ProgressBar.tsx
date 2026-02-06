"use client";

import { usePathname } from "next/navigation";

import { useQuizStore } from "@/src/lib/store/useQuizStore";

export const ProgressBar = () => {
  const { currentStep, quiz } = useQuizStore();
  const pathname = usePathname();

  // Hide ProgressBar on loading, email, thank-you pages
  if (
    pathname.includes("/loading") ||
    pathname.includes("/email") ||
    pathname.includes("/thank-you")
  ) {
    return null;
  }

  const total = quiz?.questions.length || 5;
  const current = currentStep + 1;
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="fixed top-[60px] left-0 right-0 z-10 bg-background pb-4 pt-2 w-full max-w-md mx-auto px-5 md:px-0">
      <div className="h-[4px] w-full bg-soft-gray rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
