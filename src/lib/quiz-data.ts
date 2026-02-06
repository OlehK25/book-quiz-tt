import { Quiz, Question, QuestionType, Locale } from '@/src/types/quiz';
import rawData from '@/src/data/quiz-questions.json';

/**
 * Types for raw JSON structure
 * This allows us to type the imported JSON without using 'any'
 */
interface RawQuestionOption {
  id: string;
  label: string;
  emoji?: string;
}

interface RawQuestionTranslation {
  title: string;
  subtitle?: string;
  titleHighlight?: string;
  options: (string | RawQuestionOption)[];
}

interface RawQuestion {
  id: string;
  type: string;
  isRequired: boolean;
  autoSubmit?: boolean;
  minSelections?: number;
  maxSelections?: number;
  nextQuestion: string | null;
  conditional?: {
    dependsOn: string;
    mapping: Record<string, string[]>;
  };
  translations: {
    en: RawQuestionTranslation;
    fr: RawQuestionTranslation;
    de: RawQuestionTranslation;
    es: RawQuestionTranslation;
  };
}

interface RawQuizData {
  meta: {
    created: string;
    version: string;
    description: string;
    totalQuestions: number;
    languages: string[];
    questionTypes: string[];
    source?: string;
  };
  questions: RawQuestion[];
}

/**
 * Load and transform quiz data from JSON to typed structure
 * Handles new question format with emojis, subtitles, and conditional logic
 */
export const loadQuizData = (): Quiz => {
  const typedRawData = rawData as RawQuizData;
  
  const questions: Question[] = typedRawData.questions.map((q) => {
    // Determine type
    let type: QuestionType = 'single-select'; // Default
    if (q.type === 'multiple-select') type = 'multiple-select';
    if (q.type === 'bubble') type = 'bubble';
    if (q.type === 'single-select-image') type = 'single-select-image';

    // Normalize text (title)
    const text: Record<Locale, string> = {
      en: q.translations.en.title,
      fr: q.translations.fr.title,
      de: q.translations.de.title,
      es: q.translations.es.title,
    };

    // Normalize subtitle (if exists)
    const subtitle: Record<Locale, string> | undefined = q.translations.en.subtitle
      ? {
          en: q.translations.en.subtitle || '',
          fr: q.translations.fr.subtitle || '',
          de: q.translations.de.subtitle || '',
          es: q.translations.es.subtitle || '',
        }
      : undefined;

    // Normalize titleHighlight (if exists)
    const titleHighlight: Record<Locale, string> | undefined = q.translations.en.titleHighlight
      ? {
          en: q.translations.en.titleHighlight || '',
          fr: q.translations.fr.titleHighlight || '',
          de: q.translations.de.titleHighlight || '',
          es: q.translations.es.titleHighlight || '',
        }
      : undefined;

    // Normalize options (new format with id, label, emoji)
    const optionCount = q.translations.en.options.length;
    const options = Array.from({ length: optionCount }).map((_, idx) => {
      const enOption = q.translations.en.options[idx];
      const frOption = q.translations.fr.options[idx];
      const deOption = q.translations.de.options[idx];
      const esOption = q.translations.es.options[idx];

      // Handle both old string format and new object format
      const optText: Record<Locale, string> = {
        en: typeof enOption === 'string' ? enOption : enOption.label,
        fr: typeof frOption === 'string' ? frOption : frOption.label,
        de: typeof deOption === 'string' ? deOption : deOption.label,
        es: typeof esOption === 'string' ? esOption : esOption.label,
      };

      // Extract emoji if present
      const emoji =
        typeof enOption === 'object' && 'emoji' in enOption ? enOption.emoji : undefined;

      // Extract option ID (new format)
      const optionId =
        typeof enOption === 'object' && 'id' in enOption
          ? enOption.id
          : `${q.id}-opt${idx + 1}`;

      return {
        id: optionId,
        text: optText,
        emoji,
      };
    });

    const baseQuestion = {
      id: q.id,
      type,
      text,
      titleHighlight,
      subtitle,
      required: q.isRequired,
    };

    // Multiple-select questions
    if (type === 'multiple-select') {
      return {
        ...baseQuestion,
        type: 'multiple-select',
        options,
        minSelections: q.minSelections || 1,
        maxSelections: q.maxSelections || options.length,
      } as Question;
    }

    // Bubble questions (with conditional logic)
    if (type === 'bubble') {
      const bubbleQuestion: Question = {
        ...baseQuestion,
        type: 'bubble',
        options,
        minSelections: q.minSelections || 1,
        maxSelections: q.maxSelections || options.length,
      };

      // Add conditional logic if present
      if (q.conditional) {
        bubbleQuestion.conditional = {
          dependsOn: q.conditional.dependsOn,
          mapping: q.conditional.mapping,
        };
      }

      return bubbleQuestion;
    }

    // Single-select image questions
    if (type === 'single-select-image') {
      return {
        ...baseQuestion,
        type: 'single-select-image',
        options,
      } as Question;
    }

    // Single-select questions (default)
    return {
      ...baseQuestion,
      type: 'single-select',
      options,
    } as Question;
  });

  return {
    id: 'holywater-quiz-v2',
    title: {
      en: 'Personalized Reading Quiz',
      fr: 'Quiz de Lecture Personnalisé',
      de: 'Personalisiertes Lese-Quiz',
      es: 'Cuestionario de Lectura Personalizado',
    },
    questions,
    config: {
      allowRetake: true,
      showProgressBar: true,
      requireEmail: true,
    },
  };
};

export const QUIZ_DATA = loadQuizData();
