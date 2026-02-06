import { loadQuizData } from './quiz-data';

describe('Quiz Data Integrity', () => {
  const quiz = loadQuizData();

  it('should have exactly 5 questions', () => {
    expect(quiz.questions).toHaveLength(5);
  });

  it('should have correct question types in order', () => {
    // Q1: Language -> single-select
    expect(quiz.questions[0].id).toBe('q1-language');
    expect(quiz.questions[0].type).toBe('single-select');

    // Q2: Gender -> single-select-image
    expect(quiz.questions[1].id).toBe('q2-gender');
    expect(quiz.questions[1].type).toBe('single-select-image');

    // Q3: Age -> single-select
    expect(quiz.questions[2].id).toBe('q3-age');
    expect(quiz.questions[2].type).toBe('single-select');

    // Q4: Hate -> multiple-select
    expect(quiz.questions[3].id).toBe('q4-hate');
    expect(quiz.questions[3].type).toBe('multiple-select');

    // Q5: Topics -> bubble
    expect(quiz.questions[4].id).toBe('q5-topics');
    expect(quiz.questions[4].type).toBe('bubble');
  });

  it('should verify conditional logic mapping exists for Q5', () => {
    const q5 = quiz.questions.find(q => q.id === 'q5-topics');
    expect(q5).toBeDefined();
    
    // Check if conditional property exists (if type is bubble)
    if (q5?.type === 'bubble') {
       expect(q5.conditional).toBeDefined();
       expect(q5.conditional?.dependsOn).toBe('q3-age');
       
       // Verify all mapped options actually exist in Q5 options
       const allOptionIds = q5.options.map(o => o.id);
       const mapping = q5.conditional?.mapping || {};
       
       Object.values(mapping).flat().forEach(mappedOptionId => {
         expect(allOptionIds).toContain(mappedOptionId);
       });
    }
  });

  it('should contain translations for all supported locales', () => {
     const locales = ['en', 'fr', 'de', 'es'] as const;
     
     quiz.questions.forEach(q => {
         locales.forEach(locale => {
             expect(q.text[locale]).toBeDefined();
             // Check options translations
             q.options.forEach(opt => {
                 expect(opt.text[locale]).toBeDefined();
             });
         });
     });
  });
});
