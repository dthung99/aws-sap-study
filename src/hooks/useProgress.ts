import { useState, useEffect } from 'react';
import type { UserProgress } from '../types';

const STORAGE_KEY = 'aws_study_progress';

const defaultProgress: UserProgress = {
  masteredServices: [],
  reviewServices: [],
  studyStreak: 0,
  lastStudyDate: new Date().toISOString().split('T')[0],
  modeStats: {
    flashcards: { correct: 0, total: 0 },
    qa: { correct: 0, total: 0 },
    tinder: { known: 0, learning: 0 },
  },
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress, isLoaded]);

  const updateProgress = (updates: Partial<UserProgress>) => {
    setProgress((prev) => ({ ...prev, ...updates }));
  };

  const addMasteredService = (serviceName: string) => {
    setProgress((prev) => ({
      ...prev,
      masteredServices: [...new Set([...prev.masteredServices, serviceName])],
      reviewServices: prev.reviewServices.filter((s) => s !== serviceName),
    }));
  };

  const addReviewService = (serviceName: string) => {
    setProgress((prev) => ({
      ...prev,
      reviewServices: [...new Set([...prev.reviewServices, serviceName])],
      masteredServices: prev.masteredServices.filter((s) => s !== serviceName),
    }));
  };

  const updateModeStats = (
    mode: 'flashcards' | 'qa' | 'tinder',
    updates: Partial<(typeof progress.modeStats)[typeof mode]>
  ) => {
    setProgress((prev) => ({
      ...prev,
      modeStats: {
        ...prev.modeStats,
        [mode]: {
          ...prev.modeStats[mode],
          ...updates,
        },
      },
    }));
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
  };

  return {
    progress,
    isLoaded,
    updateProgress,
    addMasteredService,
    addReviewService,
    updateModeStats,
    resetProgress,
  };
}
