/**
 * examTypes.ts
 * Strict TypeScript interfaces for the K-Mastery TOPIK exam system.
 * Zero 'any'. Zero @ts-ignore.
 */

// ─── TOPIK-I ──────────────────────────────────────────────────────────────────

export type TopikISection = 'listening' | 'reading';
export type TopikIQuestionType = 'image_mcq' | 'text_mcq' | 'passage_mcq' | 'gap_fill_mcq';

export interface TopikIQuestion {
  id: string;
  section: TopikISection;
  questionNumber: number;        // 1-30 (listening) or 1-40 (reading)
  type: TopikIQuestionType;
  audioUrl?: string;             // for listening questions
  passageText?: string;          // for reading passage questions
  questionText: string;
  options: [string, string, string, string]; // exactly 4
  correctAnswer: number;         // 0-3 index
  explanation?: string;
}

// ─── TOPIK-II Writing ────────────────────────────────────────────────────────

export type WritingQuestionType = 'sentence_completion' | 'short_essay' | 'long_essay';

export interface TopikIIWritingQuestion {
  questionNumber: 51 | 52 | 53 | 54;
  type: WritingQuestionType;
  passageText?: string;          // for Q51-52 sentence completion
  blankLabel?: string;           // e.g. "㉠" for Q51-52
  topic?: string;                // for Q53-54
  hints?: string[];              // for Q53 only
  charMin: number;               // 0 for Q51-52, 200 for Q53, 600 for Q54
  charMax: number;               // 50 for Q51-52, 300 for Q53, 700 for Q54
}

// ─── TOPIK-II MCQ ─────────────────────────────────────────────────────────────

export type TopikIIReadingQuestionType =
  | 'grammar_mcq'
  | 'similar_meaning_mcq'
  | 'functional_text_mcq'
  | 'content_match_mcq'
  | 'gap_fill_mcq'
  | 'main_idea_mcq'
  | 'sentence_insertion_mcq'
  | 'passage_mcq';

export interface TopikIIListeningQuestion {
  id: string;
  section: 'listening';
  questionNumber: number;        // 1-50
  type: 'text_mcq' | 'image_mcq';
  audioUrl?: string;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation?: string;
}

export interface TopikIIReadingQuestion {
  id: string;
  section: 'reading';
  questionNumber: number;        // 1-50
  type: TopikIIReadingQuestionType;
  passageText?: string;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation?: string;
}

// ─── Exam State Machines ──────────────────────────────────────────────────────

export type TopikIPhase = 'listening' | 'transition' | 'reading' | 'results';
export type TopikIIPhase = 'writing' | 'break' | 'listening' | 'reading' | 'results';

export interface TopikIExamState {
  phase: TopikIPhase;
  listeningAnswers: Record<string, number>;   // questionId → selected option index
  readingAnswers: Record<string, number>;
  listeningScore: number;
  readingScore: number;
}

export interface TopikIIExamState {
  phase: TopikIIPhase;
  writingAnswers: Record<51 | 52 | 53 | 54, string>;
  listeningAnswers: Record<string, number>;
  readingAnswers: Record<string, number>;
  writingScore: number;
  listeningScore: number;
  readingScore: number;
  essayRubric: EssayRubric | null;
}

// ─── Score / Report ───────────────────────────────────────────────────────────

export interface EssayRubric {
  totalScore: number;
  rubricScores: {
    content: number;
    structure: number;
    vocabulary: number;
    grammar: number;
  };
  feedback: string;
  modelAnswer: string;
}

export interface TopikIResult {
  listeningScore: number;
  readingScore: number;
  totalScore: number;
  levelAwarded: 0 | 1 | 2;       // 0=fail, 1=TOPIK I L1, 2=TOPIK I L2
  xpGained: number;
  listeningAnswers: Record<string, number>;
  readingAnswers: Record<string, number>;
  listeningQuestions: TopikIQuestion[];
  readingQuestions: TopikIQuestion[];
}

export interface TopikIIResult {
  writingScore: number;
  listeningScore: number;
  readingScore: number;
  totalScore: number;
  levelAwarded: 0 | 3 | 4 | 5 | 6;
  xpGained: number;
  essayRubric: EssayRubric | null;
  listeningAnswers: Record<string, number>;
  readingAnswers: Record<string, number>;
  listeningQuestions: TopikIIListeningQuestion[];
  readingQuestions: TopikIIReadingQuestion[];
}

// ─── API Response shapes ──────────────────────────────────────────────────────

export interface TopikIQuestionsResponse {
  listeningQuestions: TopikIQuestion[];
  readingQuestions: TopikIQuestion[];
}

export interface TopikIIQuestionsResponse {
  writingQuestions: TopikIIWritingQuestion[];
  listeningQuestions: TopikIIListeningQuestion[];
  readingQuestions: TopikIIReadingQuestion[];
}
