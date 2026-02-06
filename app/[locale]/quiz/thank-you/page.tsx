"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/src/i18n/routing";
import { useQuizStore } from "@/src/lib/store/useQuizStore";
import { Button } from "@/src/components/ui/Button";
import { downloadCSV } from "@/src/lib/utils/csv-export";
import { QUIZ_DATA } from "@/src/lib/quiz-data";
import { CheckIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";

export default function ThankYouPage() {
  const t = useTranslations("ThankYouStep");
  const router = useRouter();
  const { session, retakeQuiz } = useQuizStore();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!session) return;

    // Guard 1: Must have completed quiz (all answers)
    if (session.answers.length < QUIZ_DATA.questions.length) {
      const nextStep = session.answers.length + 1;
      router.replace(`/quiz/${nextStep}`);
      return;
    }

    // Guard 2: Must have email (since it's a required step before Thank You)
    if (!session.email) {
      router.replace("/quiz/email");
      return;
    }

    // If all checks pass
    setTimeout(() => setIsVerified(true), 0);
  }, [session, router]);

  const handleDownload = () => {
    // Use direct QUIZ_DATA to ensure we have question titles even if store is partial
    if (session) {
      downloadCSV(QUIZ_DATA, session);
    }
  };

  const handleRetake = () => {
    retakeQuiz();
    router.replace("/quiz/1", { locale: "en" });
  };

  if (!isVerified || !session) return null;

  return (
    <div className="flex-1 flex flex-col bg-background px-4 pb-8 pt-6 text-center">
      {/* Top Header Section */}
      <div className="w-full max-w-[340px] mx-auto">
        <h1 className="mb-2 text-display-xl text-primary font-display leading-normal">
          {t("title")}
        </h1>

        <p className="text-body-lg text-text-primary font-medium leading-relaxed">
          {t("message")}
        </p>
      </div>

      {/* Middle Icon Section (Centered in remaining space) */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-circle">
          <CheckIcon className="h-16 w-16 text-success" />
        </div>
      </div>

      {/* Bottom Actions Section */}
      <div className="w-full max-w-[340px] mx-auto space-y-4">
        {/* Download Button - Secondary/Different Style */}
        <Button
          fullWidth
          variant="ghost"
          onClick={handleDownload}
          className="font-semibold text-text-purple-light text-body-md flex items-center justify-center gap-2"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          {t("download")}
        </Button>

        {/* Retake Button - Primary (Same as Next) */}
        <Button
          fullWidth
          variant="primary"
          onClick={handleRetake}
          className="font-semibold text-body-md"
        >
          {t("retake")}
        </Button>
      </div>
    </div>
  );
}
