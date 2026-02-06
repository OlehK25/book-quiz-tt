"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { useQuizStore } from "@/src/lib/store/useQuizStore";
import { Locale } from "@/src/types/quiz";
import { QUIZ_DATA } from "@/src/lib/quiz-data";

/**
 * QuizInitializer - initializes the Zustand store on load
 * Creates a session ONLY if it does not exist
 * Locale is controlled via user selection in Q1, NOT via URL
 */
export const QuizInitializer = () => {
  const params = useParams();
  const { session, initSession, quiz, loadQuiz } = useQuizStore();

  const urlLocale = (params?.locale as string) || "en";

  useEffect(() => {
    // Ensure quiz data is loaded (it's not persisted)
    if (!quiz) {
      loadQuiz(QUIZ_DATA);
    }

    // Only init if no session exists
    // Once session exists, locale is controlled by user choice in Q1
    if (!session) {
      initSession(urlLocale as Locale);
    }
  }, [session, urlLocale, initSession, quiz, loadQuiz]);

  return null; // Invisible component
};
