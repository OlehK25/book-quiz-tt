import { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuestionRenderer } from "@/src/components/features/quiz/QuestionRenderer";
import { QUIZ_DATA } from "@/src/lib/quiz-data";
import { Locale } from "@/src/types/quiz";

interface QuizStepPageProps {
  params: Promise<{
    locale: string;
    step: string;
  }>;
}

export async function generateMetadata({
  params,
}: QuizStepPageProps): Promise<Metadata> {
  const { step, locale } = await params;
  const stepNumber = parseInt(step, 10);
  const currentLocale = locale as Locale;

  if (
    isNaN(stepNumber) ||
    stepNumber < 1 ||
    stepNumber > QUIZ_DATA.questions.length
  ) {
    return {
      title: "Page Not Found",
    };
  }

  const question = QUIZ_DATA.questions[stepNumber - 1];
  const questionTitle = question.text[currentLocale] || "Quiz Question";
  const mainTitle = QUIZ_DATA.title[currentLocale];

  return {
    title: `Question ${stepNumber}: ${questionTitle} | ${mainTitle}`,
    description:
      question.subtitle?.[currentLocale] ||
      `Step ${stepNumber} of our personalized quiz.`,
    alternates: {
      languages: {
        en: `/en/quiz/${step}`,
        fr: `/fr/quiz/${step}`,
        de: `/de/quiz/${step}`,
        es: `/es/quiz/${step}`,
      },
    },
  };
}

export default async function QuizStepPage({ params }: QuizStepPageProps) {
  const { step, locale } = await params;

  // Validate step is a number
  const stepNumber = parseInt(step, 10);

  if (
    isNaN(stepNumber) ||
    stepNumber < 1 ||
    stepNumber > QUIZ_DATA.questions.length
  ) {
    notFound();
  }

  return <QuestionRenderer step={stepNumber} locale={locale} />;
}
