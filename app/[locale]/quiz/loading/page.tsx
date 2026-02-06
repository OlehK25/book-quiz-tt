"use client";

import { useEffect, useState } from "react";

import { CircularLoader } from "@/src/components/features/quiz/CircularLoader";
import { useRouter } from "@/src/i18n/routing";
import { useQuizStore } from "@/src/lib/store/useQuizStore";

import { QUIZ_DATA } from "@/src/lib/quiz-data";

export default function LoadingPage() {
  const router = useRouter();
  const { session } = useQuizStore();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Wait for session to be ready
    if (!session) return;

    // Guard: Must have answered all questions
    if (session.answers.length < QUIZ_DATA.questions.length) {
      // Redirect to the first unanswered question
      const nextStep = session.answers.length + 1;
      router.replace(`/quiz/${nextStep}`);
    } else {
      // Pass - defer update to avoid render warning
      setTimeout(() => setIsVerified(true), 0);
    }
  }, [session, router]);

  if (!isVerified) return null;

  return (
    <div className="flex flex-col items-center justify-center bg-background px-4">
      <CircularLoader
        duration={5000}
        onComplete={() => router.replace("/quiz/email")}
      />
    </div>
  );
}
