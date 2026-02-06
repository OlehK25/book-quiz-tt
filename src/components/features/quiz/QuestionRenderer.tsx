"use client";

import { useEffect, useState } from "react";

import { Button } from "@/src/components/ui/Button";
import { QuestionTitle } from "./QuestionTitle";
import { SingleSelectOptions } from "./SingleSelectOptions";
import { MultipleSelectOptions } from "./MultipleSelectOptions";
import { BubbleOptions } from "./BubbleOptions";
import { useRouter } from "@/src/i18n/routing";
import { useQuizStore } from "@/src/lib/store/useQuizStore";
import {
  isSingleSelect,
  isSingleSelectImage,
  isMultipleSelect,
  isBubble,
  Locale,
} from "@/src/types/quiz";

interface QuestionRendererProps {
  step: number;
  locale: string;
}

export const QuestionRenderer = ({ step, locale }: QuestionRendererProps) => {
  const router = useRouter();
  const { quiz, session, setAnswer, setLocale, nextStep, setStep } =
    useQuizStore();

  /*
   * ANIMATION STATE MANAGEMENT
   * We introduce an exit state to play the 'slide-out-left' animation
   * before navigating to the next route.
   */
  const [isExiting, setIsExiting] = useState(false);

  /**
   * URL SYNC STRATEGY:
   * URL is the Source of Truth.
   * 1. We render based on props `step` and `locale` passed from URL.
   * 2. We sync these values back to the store for persistence.
   */

  // Sync store with URL on mount or when params change
  useEffect(() => {
    if (session?.locale !== locale) {
      setLocale(locale as Locale);
    }
  }, [locale, session?.locale, setLocale]);

  /**
   * GUARD LOGIC: Prevent jumping ahead
   * We use answers.length because session.currentStep might be out of sync or stale.
   * In a linear quiz where questions are required, step index cannot exceed answers count.
   */
  const storeStepIndex = step - 1;
  const answersCount = session?.answers.length ?? 0;

  /**
   * Allow storeStepIndex <= answersCount
   * Example: 0 answers. Can access Step 1 (index 0). 0 <= 0. OK.
   * Example: 0 answers. Try Step 2 (index 1). 1 > 0. BLOCK.
   */
  const isJumpingAhead = session && storeStepIndex > answersCount;

  useEffect(() => {
    if (isJumpingAhead) {
      // Allow going to the next immediate step (answers.length + 1)
      const allowedStep = answersCount + 1;
      router.replace(`/quiz/${allowedStep}`, { locale: locale as Locale });
    }
  }, [isJumpingAhead, answersCount, locale, router]);

  // Sync step to store ONLY if we are not jumping ahead
  useEffect(() => {
    if (session && !isJumpingAhead && session.currentStep !== storeStepIndex) {
      setStep(storeStepIndex);
    }
  }, [
    step,
    session?.currentStep,
    setStep,
    isJumpingAhead,
    storeStepIndex,
    session,
  ]);

  useEffect(() => {
    if (!router || !quiz) return;
    const nextStepIdx = step + 1;
    if (nextStepIdx <= quiz.questions.length) {
      router.prefetch(`/quiz/${nextStepIdx}`, { locale: locale as Locale });
    } else {
      router.prefetch(`/quiz/loading`, { locale: locale as Locale });
    }
  }, [step, locale, router, quiz]);

  if (!quiz || !session || isJumpingAhead) {
    // Show loader while redirecting or loading to prevent flicker
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentStepIndex = step - 1;
  const question = quiz.questions[currentStepIndex];

  if (!question) return null;

  // Use mapped locale for text (URL source of truth)
  const currentLocale = locale as Locale;

  const currentAnswer = session.answers.find(
    (a) => a.questionId === question.id,
  );

  const selectedValues = currentAnswer
    ? Array.isArray(currentAnswer.value)
      ? currentAnswer.value
      : [currentAnswer.value]
    : [];

  const handleSingleSelect = (optionId: string) => {
    setAnswer(question.id, optionId);

    // Special handling for language selection (Q1)
    let selectedLocale: Locale | undefined;
    if (question.id === "q1-language") {
      const localeMap: Record<string, Locale> = {
        "lang-en": "en",
        "lang-fr": "fr",
        "lang-de": "de",
        "lang-es": "es",
      };

      selectedLocale = localeMap[optionId];
      if (selectedLocale) {
        setLocale(selectedLocale);
      }
    }

    // Trigger Exit Animation
    setIsExiting(true);

    // Auto-advance after animation completes (300ms)
    setTimeout(() => {
      // Update store state via nextStep (which increments currentStep)
      // But we primarily rely on URL navigation
      nextStep();
      const newStep = step + 1;

      const targetLocale = selectedLocale || currentLocale;

      if (newStep > (quiz?.questions.length || 0)) {
        router.push("/quiz/loading", { locale: targetLocale });
      } else {
        router.push(`/quiz/${newStep}`, { locale: targetLocale });
      }
    }, 300);
  };

  const handleMultiSelect = (optionId: string) => {
    const newValues = selectedValues.includes(optionId)
      ? selectedValues.filter((id) => id !== optionId)
      : [...selectedValues, optionId];

    setAnswer(question.id, newValues);
  };

  const handleBubbleSelect = (optionId: string, max?: number) => {
    const isSelected = selectedValues.includes(optionId);

    if (isSelected) {
      setAnswer(
        question.id,
        selectedValues.filter((id) => id !== optionId),
      );
    } else {
      if (max && selectedValues.length >= max) {
        return;
      }
      setAnswer(question.id, [...selectedValues, optionId]);
    }
  };

  const canContinue = () => {
    if (isMultipleSelect(question)) {
      return selectedValues.length >= (question.minSelections || 1);
    }
    if (isBubble(question)) {
      return selectedValues.length >= (question.minSelections || 1);
    }
    return selectedValues.length > 0;
  };

  const handleNext = () => {
    // Trigger Exit Animation
    setIsExiting(true);

    // Wait for animation
    setTimeout(() => {
      nextStep();
      const newStep = step + 1;

      if (newStep > (quiz?.questions.length || 0)) {
        router.push("/quiz/loading", { locale: currentLocale });
      } else {
        router.push(`/quiz/${newStep}`, { locale: currentLocale });
      }
    }, 300);
  };

  const title = question.text[currentLocale];
  const subtitle = question.subtitle?.[currentLocale];

  const options = question.options
    .filter((opt) => {
      // Conditional Logic Implementation
      if (isBubble(question) && question.conditional) {
        const { dependsOn, mapping } = question.conditional;
        const prevAnswer = session.answers.find(
          (a) => a.questionId === dependsOn,
        );

        if (prevAnswer && typeof prevAnswer.value === "string") {
          const allowedIds = mapping[prevAnswer.value];
          // If mapping exists for this answer, filter. Otherwise show all (fallback).
          if (allowedIds) {
            return allowedIds.includes(opt.id);
          }
        }
      }
      return true; // Show by default if no condition or no match
    })
    .map((opt) => ({
      id: opt.id,
      label: opt.text[currentLocale],
      emoji: "emoji" in opt ? opt.emoji : undefined,
    }));

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-8">
      <QuestionTitle
        title={title}
        subtitle={subtitle}
        highlight={question.titleHighlight?.[currentLocale]}
        className="mb-8"
      />

      <div
        className={`flex-1 w-full flex flex-col items-center transition-all duration-300 ${
          isExiting
            ? "animate-out-left"
            : "animate-in fade-in slide-in-from-right-4"
        }`}
      >
        {(isSingleSelect(question) || isSingleSelectImage(question)) && (
          <SingleSelectOptions
            options={options}
            selectedId={selectedValues[0]}
            onSelect={handleSingleSelect}
          />
        )}

        {isMultipleSelect(question) && (
          <>
            <MultipleSelectOptions
              options={options}
              selectedIds={selectedValues}
              onToggle={handleMultiSelect}
            />
            <div className="mt-8 w-full">
              <Button fullWidth disabled={!canContinue()} onClick={handleNext}>
                Next
              </Button>
            </div>
          </>
        )}

        {isBubble(question) && (
          <>
            <BubbleOptions
              options={options}
              selectedIds={selectedValues}
              onToggle={handleBubbleSelect}
              maxSelections={question.maxSelections}
            />
            <div className="mt-8 w-full">
              <Button fullWidth disabled={!canContinue()} onClick={handleNext}>
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
