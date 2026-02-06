"use client";

import { usePathname } from "next/navigation";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useQuizStore } from "@/src/lib/store/useQuizStore";
import { useRouter } from "@/src/i18n/routing";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentStep, quiz, session, previousStep } = useQuizStore();

  // Hide Header on loading, email, thank-you pages
  if (
    pathname.includes("/loading") ||
    pathname.includes("/email") ||
    pathname.includes("/thank-you")
  ) {
    return null;
  }

  const totalSteps = quiz?.questions.length || 5;
  const displayStep = currentStep + 1;
  const showBack = currentStep > 0;

  const handleBack = () => {
    if (!session) return;
    previousStep();
    // next-intl router automatically adds locale prefix
    router.push(`/quiz/${currentStep}`, { locale: session.locale });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex h-[60px] w-full max-w-md mx-auto items-center justify-between bg-background">
      <div className="flex w-10 items-center justify-start">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full transition-all duration-200 hover:bg-text-primary/10 active:scale-90 cursor-pointer"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="h-7 w-7 text-text-primary" />
          </button>
        )}
      </div>
      <div className="text-body-xl font-bold text-text-primary">
        <span className="text-primary">{displayStep}</span>
        <span className="text-soft-gray">/{totalSteps}</span>
      </div>
      <div className="w-10"></div> {/* Spacer for center alignment */}
    </header>
  );
};
