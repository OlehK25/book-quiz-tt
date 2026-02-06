/**
 * Quiz Data Types
 * Following best practices:
 * - Union types for different question types
 * - Granular interfaces for flexibility
 * - Type guards for runtime checking
 */

// ============================================================================
// Base Types
// ============================================================================

export type Locale = 'en' | 'fr' | 'de' | 'es';

export type QuestionType = 'single-select' | 'single-select-image' | 'multiple-select' | 'bubble';

// ============================================================================
// Question Interfaces
// ============================================================================

interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: Record<Locale, string>;
  titleHighlight?: Record<Locale, string>; // Optional word to highlight
  subtitle?: Record<Locale, string>; // Optional subtitle
  required: boolean;
}

export interface SingleSelectQuestion extends BaseQuestion {
  type: 'single-select';
  options: Array<{
    id: string;
    text: Record<Locale, string>;
    emoji?: string; // Emoji support (from Figma)
    icon?: string; // Optional icon name (Heroicons/Lucide)
  }>;
}

export interface SingleSelectImageQuestion extends BaseQuestion {
  type: 'single-select-image';
  options: Array<{
    id: string;
    text: Record<Locale, string>;
    emoji?: string; 
    icon?: string;
  }>;
}

export interface MultipleSelectQuestion extends BaseQuestion {
  type: 'multiple-select';
  options: Array<{
    id: string;
    text: Record<Locale, string>;
    emoji?: string;
    icon?: string;
  }>;
  minSelections?: number;
  maxSelections?: number;
}

export interface BubbleQuestion extends BaseQuestion {
  type: 'bubble';
  options: Array<{
    id: string;
    text: Record<Locale, string>;
    emoji?: string; // Display emoji for bubble
  }>;
  minSelections?: number;
  maxSelections?: number;
  conditional?: {
    dependsOn: string; // Question ID
    mapping: Record<string, string[]>; // Answer ID -> Option IDs to show
  };
}

// Union type for all question types
export type Question =
  | SingleSelectQuestion
  | SingleSelectImageQuestion
  | MultipleSelectQuestion
  | BubbleQuestion;

// ============================================================================
// Type Guards
// ============================================================================

export function isSingleSelect(
  question: Question
): question is SingleSelectQuestion {
  return question.type === 'single-select';
}

export function isSingleSelectImage(
  question: Question
): question is SingleSelectImageQuestion {
  return question.type === 'single-select-image';
}

export function isMultipleSelect(
  question: Question
): question is MultipleSelectQuestion {
  return question.type === 'multiple-select';
}

export function isBubble(question: Question): question is BubbleQuestion {
  return question.type === 'bubble';
}

// ============================================================================
// Quiz Structure
// ============================================================================

export interface Quiz {
  id: string;
  title: Record<Locale, string>;
  description?: Record<Locale, string>;
  questions: Question[];
  config: QuizConfig;
}

export interface QuizConfig {
  allowRetake: boolean;
  showProgressBar: boolean;
  requireEmail: boolean;
  emailValidation?: {
    pattern?: string;
    message?: Record<Locale, string>;
  };
}

// ============================================================================
// Answer Types
// ============================================================================

export interface Answer {
  questionId: string;
  value: string | string[]; // Single value or array for multiple-select
  timestamp: number;
}

export interface QuizSession {
  sessionId: string;
  locale: Locale;
  startedAt: number;
  completedAt?: number;
  answers: Answer[];
  email?: string;
  currentStep: number;
}

// ============================================================================
// State Types
// ============================================================================

export interface QuizState {
  // Session data
  session: QuizSession | null;
  quiz: Quiz | null;

  // UI state
  currentStep: number;
  isLoading: boolean;

  // Actions
  initSession: (locale: Locale) => void;
  setLocale: (locale: Locale) => void;
  setAnswer: (questionId: string, value: string | string[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  setStep: (step: number) => void;
  setEmail: (email: string) => void;
  completeQuiz: () => void;
  retakeQuiz: () => void;
  loadQuiz: (quiz: Quiz) => void;
}

// ============================================================================
// CSV Export Types
// ============================================================================

export interface CSVRow {
  sessionId: string;
  completedAt: string;
  email: string;
  locale: string;
  [key: string]: string; // Dynamic question columns
}
