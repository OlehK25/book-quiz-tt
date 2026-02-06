"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { useRouter } from "@/src/i18n/routing";
import { useQuizStore } from "@/src/lib/store/useQuizStore";

import { QUIZ_DATA } from "@/src/lib/quiz-data";

const emailSchema = z.string().email();

export default function EmailPage() {
  const t = useTranslations("EmailStep");
  const router = useRouter();
  const { setEmail, session } = useQuizStore();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Guard: Must have answered all questions
    if (session && session.answers.length < QUIZ_DATA.questions.length) {
      const nextStep = session.answers.length + 1;
      router.replace(`/quiz/${nextStep}`);
    } else {
      setTimeout(() => setIsVerified(true), 0);
    }
  }, [session, router]);

  const [emailValue, setEmailValue] = useState(session?.email || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isVerified) return null;

  const validate = (val: string) => {
    const result = emailSchema.safeParse(val);
    if (!result.success) {
      setError(t("invalid"));
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    // Always validate on click
    if (!validate(emailValue)) return;

    setIsSubmitting(true);
    setEmail(emailValue);

    setTimeout(() => {
      router.push("/quiz/thank-you");
    }, 500);
  };

  const isValid =
    emailValue.length > 0 && emailSchema.safeParse(emailValue).success;

  return (
    // Header removed as per request
    <div className="flex-1 flex flex-col bg-background px-4 pb-8 pt-6">
      <div className="flex-1 flex flex-col items-center w-full max-w-[400px] mx-auto text-center">
        <h1 className="mb-2 text-heading-lg font-bold text-text-primary font-heading">
          {t("title")}
        </h1>
        <p className="mb-8 text-text-secondary">{t("description")}</p>

        <div className="w-full mb-12">
          <Input
            type="email"
            placeholder={t("placeholder")}
            value={emailValue}
            onChange={(e) => {
              const val = e.target.value;
              setEmailValue(val);
              // Real-time error clearing
              if (error) {
                const result = emailSchema.safeParse(val);
                if (result.success) setError("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleNext();
              }
            }}
            onBlur={() => {
              // Optional: validate on blur if non-empty, or strict
              if (emailValue.length > 0) validate(emailValue);
            }}
            error={!!error}
            errorMessage={error}
            disabled={isSubmitting}
            className={error ? "animate-shake" : ""}
          />
        </div>

        <p className="px-8 mb-4 text-body-lg text-text-pink-light text-center">
          {t.rich("disclaimer", {
            privacy: (chunks) => (
              <span
                className="cursor-pointer text-primary-highlight transition-all hover:text-primary-highlight/80"
                onClick={(e) => e.preventDefault()}
              >
                {chunks}
              </span>
            ),
            terms: (chunks) => (
              <span
                className="cursor-pointer text-primary-highlight transition-all hover:text-primary-highlight/80"
                onClick={(e) => e.preventDefault()}
              >
                {chunks}
              </span>
            ),
          })}
        </p>
      </div>

      <div className="w-full max-w-[400px] mx-auto">
        <Button
          fullWidth
          onClick={handleNext}
          disabled={isSubmitting || !isValid} // Disabled if submitting OR invalid
        >
          {t("cta")}
        </Button>
      </div>
    </div>
  );
}
