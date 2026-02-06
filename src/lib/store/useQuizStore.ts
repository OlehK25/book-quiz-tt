import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { QUIZ_DATA } from '@/src/lib/quiz-data';
import { getSecure, setSecure, removeSecure } from '@/src/lib/storage';
import { QuizState, Locale, Quiz } from '@/src/types/quiz';

// Initial state
const initialState = {
  session: null,
  quiz: null, // Will be loaded
  currentStep: 0,
  isLoading: false,
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initSession: (locale: Locale) => {
        const state = get();
        
        // Ensure quiz data is loaded (it's not persisted)
        if (!state.quiz) {
          set({ quiz: QUIZ_DATA });
        }

        // If session exists and matches locale, keep it (resume)
        const currentSession = state.session;
        if (currentSession && currentSession.locale === locale) {
          return;
        }

        // Otherwise start new session
        set({
          quiz: QUIZ_DATA,
          currentStep: 0,
          session: {
            sessionId: crypto.randomUUID(),
            locale,
            startedAt: Date.now(),
            answers: [],
            currentStep: 0,
          },
        });
      },

      setLocale: (locale: Locale) => {
        const { session } = get();
        if (!session) return;
        
        // Update locale without resetting progress
        set({
          session: {
            ...session,
            locale,
          },
        });
      },

      setAnswer: (questionId: string, value: string | string[]) => {
        const { session } = get();
        if (!session) return;

        const newAnswers = [
          // Filter out existing answer for this question
          ...session.answers.filter((a) => a.questionId !== questionId),
          // Add new answer
          {
            questionId,
            value,
            timestamp: Date.now(),
          },
        ];

        set({
          session: {
            ...session,
            answers: newAnswers,
          },
        });
      },

      nextStep: () => {
        const { currentStep, quiz, session } = get();
        if (!quiz || !session) return;

        const nextStep = currentStep + 1;
        
        // Update session's current step as well for persistence
        set({
          currentStep: nextStep,
          session: {
            ...session,
            currentStep: nextStep,
          },
        });
      },

      setStep: (step: number) => {
        const { session } = get();
        if (!session) return;
        
        set({
          currentStep: step,
          session: {
            ...session,
            currentStep: step,
          },
        });
      },

      previousStep: () => {
        const { currentStep, session } = get();
        if (!session || currentStep <= 0) return;

        const prevStep = currentStep - 1;

        set({
          currentStep: prevStep,
          session: {
            ...session,
            currentStep: prevStep,
          },
        });
      },

      setEmail: (email: string) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            email,
          },
        });
      },

      completeQuiz: () => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            completedAt: Date.now(),
          },
        });
      },

      retakeQuiz: () => {
        const { session } = get();
        if (!session) return;
        
        // Reset session to English default as per requirement
        get().initSession('en');
        
        // Force new session creation 
        set({
           currentStep: 0,
           session: {
             sessionId: crypto.randomUUID(),
             locale: 'en',
             startedAt: Date.now(),
             answers: [],
             currentStep: 0,
           }
        });
      },

      loadQuiz: (quiz: Quiz) => {
        set({ quiz });
      },
    }),
    {
      name: 'holywater-quiz-storage', // key in localStorage
      storage: createJSONStorage(() => ({
        getItem: async (name: string): Promise<string | null> => {
          return await getSecure<string>(name, { decrypt: true });
        },
        setItem: async (name: string, value: string): Promise<void> => {
          await setSecure(name, value, { 
            ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
            encrypt: true 
          });
        },
        removeItem: async (name: string): Promise<void> => {
          removeSecure(name);
        },
      })),
      // Only persist session and currentStep, not the whole quiz data (it's static)
      partialize: (state) => ({ 
        session: state.session, 
        currentStep: state.currentStep 
      }),
    }
  )
);
