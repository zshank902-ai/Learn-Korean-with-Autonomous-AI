/**
 * roadmapTypes.ts
 * Strict TypeScript interfaces for the full TOPIK Roadmap system.
 * Zero 'any', zero @ts-ignore.
 */

export type ModuleType = 'flashcard' | 'grammar_drill' | 'mcq' | 'audio_task' | 'essay' | 'mock_exam' | 'playground';
export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type ExamType = 'TOPIK-I' | 'TOPIK-II';
export type TopikLevelNum = 1 | 2 | 3 | 4 | 5 | 6;

export interface ExamSection {
  name: string;
  questions: number;
  time_min: number;
}

export interface TopikModule {
  id: string;
  title: string;
  icon: string;
  type: ModuleType;
  xp: number;
  description: string;
  prerequisite: string | null;
  /** Injected by the backend — parent level id */
  level_id?: number;
  level_color?: string;
}

export interface TopikLevel {
  id: number;
  level_num: TopikLevelNum;
  title: string;
  subtitle: string;
  color: string;
  target_vocab: number;
  exam_type: ExamType;
  pass_score: number;
  max_score: number;
  sections: ExamSection[];
  xp_reward: number;
  modules: TopikModule[];
}

export interface RubricScores {
  content: number;
  structure: number;
  vocabulary: number;
  grammar: number;
}

export interface EssayGradeResult {
  totalScore: number;
  rubricScores: RubricScores;
  feedback: string;
  modelAnswer: string;
}

export interface MCQQuestion {
  question: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
  audioText?: string;
}

export interface MockExamConfig {
  examId: string;
  levelId: number;
  examType: ExamType;
  sections: ExamSection[];
  passScore: number;
  maxScore: number;
  totalTimeMin: number;
  createdAt: string;
}

export interface MockExamResult {
  totalScore: number;
  passed: boolean;
  sectionScores: Record<string, number>;
  weakAreas: string[];
  passScore: number;
  maxScore: number;
  readinessPercent: number;
}

export interface MockSession {
  config: MockExamConfig;
  questions: Record<string, MCQQuestion[]>;
  answers: Record<string, Record<string, { selected: number; correct: boolean }>>;
  phase: 'writing' | 'listening' | 'reading' | 'break' | 'submit' | 'results';
  timeRemainingSeconds: number;
}

export interface RoadmapProgressResponse {
  moduleStatuses: Record<string, ModuleStatus>;
  completedModules: string[];
  totalXP: number;
}

export interface CompleteModuleResponse {
  xpGained: number;
  newlyUnlocked: string[];
  levelProgress: number;
}
