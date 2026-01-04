export interface AWSService {
  category: string;
  serviceName: string;
  knowledgeDepth: number;
  problemSolved: string;
  scenarioAndSolution: string;
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

export type ViewMode = 'menu' | 'all-services' | 'flashcards' | 'qa' | 'tinder';
