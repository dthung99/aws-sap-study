export interface QAQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  serviceName?: string;
  category?: string;
}

export interface AWSService {
  category: string;
  serviceName: string;
  knowledgeDepth: number;
  problemSolved: string;
  scenarioAndSolution: string;
  simpleStepByStepUsage: string;
  qa?: QAQuestion[];
}

export interface UserProgress {
  masteredServices: string[];
  reviewServices: string[];
  studyStreak: number;
  lastStudyDate: string;
  modeStats: {
    flashcards: {
      correct: number;
      total: number;
    };
    qa: {
      correct: number;
      total: number;
    };
    tinder: {
      known: number;
      learning: number;
    };
  };
}

export interface QAPackage {
  id: string;
  name: string;
  questions: QAQuestion[];
  totalQuestions: number;
}

export interface QAPackageConfig {
  seed: string;
  questionsPerPackage: number;
  totalQuestions: number;
  createdAt: string;
  packages: QAPackage[];
}

export interface QAPackageProgress {
  [packageId: string]: {
    completed: number;
    correct: number;
    lastAttempt: string;
  };
}

export type ViewMode = 'menu' | 'all-services' | 'flashcards' | 'qa' | 'tinder' | 'shortquiz' | 'advanced-qa' | 'advanced-qa-quiz';
