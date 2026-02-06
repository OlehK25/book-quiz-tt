import { generateCSVContent } from './csv-export';
import { loadQuizData } from '../quiz-data';
import { QuizSession } from '@/src/types/quiz';

describe('CSV Export', () => {
  const quiz = loadQuizData();

  const mockSession: QuizSession = {
    sessionId: 'test-session',
    currentStep: 5,
    answers: [
      { questionId: 'q1-language', value: 'lang-en' },
      { questionId: 'q2-gender', value: 'gender-female' },
      { questionId: 'q3-age', value: 'age-18-29' },
      { questionId: 'q4-hate', value: ['hate-logic', 'hate-speed'] }, 
      { questionId: 'q5-topics', value: ['topic-romance', 'topic-vampire'] }
    ],
    locale: 'en',
    email: 'test@example.com' 
  };

  it('should generate valid CSV header', () => {
    const csv = generateCSVContent(quiz, mockSession);
    const lines = csv.split('\n');
    // Header row
    expect(lines[0]).toContain('order,title,type,answer');
  });

  it('should correctly map answer IDs to labels', () => {
    const csv = generateCSVContent(quiz, mockSession);
    
    // Check Q1 (Language) - Expect "English" not "lang-en"
    expect(csv).toContain('"English"');
    
    // Check Q2 (Gender) - Expect "Female" not "gender-female"
    expect(csv).toContain('"Female"');
    
    // Check Q4 (Multi) - Expect "Lack of logic, A slow speed"
    expect(csv).toContain('"Lack of logic, A slow speed"');
  });

  it('should include email as the last row', () => {
    const csv = generateCSVContent(quiz, mockSession);
    const lines = csv.split('\n').filter(Boolean); // remove empty lines
    const lastLine = lines[lines.length - 1];
    
    expect(lastLine).toContain('Email');
    expect(lastLine).toContain('email');
    expect(lastLine).toContain('test@example.com');
  });

  it('should handle missing answers gracefully', () => {
    const incompleteSession: QuizSession = {
      ...mockSession,
      answers: [],
      email: null
    };
    
    const csv = generateCSVContent(quiz, incompleteSession);
    // Should contain header but no data rows (except maybe empty ones if logic allows, usually pure loop)
    // Actually our logic loops over answers. So expect only header.
    const lines = csv.split('\n').filter(l => l.trim().length > 0);
    // Depending on impl, might be just the header + data prefix
    expect(lines[0]).toContain('order,title,type,answer');
    
    // Email is null, so no email row
    expect(csv).not.toContain('test@example.com');
  });
});
