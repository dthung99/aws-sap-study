import { useState, useEffect, useCallback } from 'react';
import type { AWSService, QAPackageConfig, QAPackageProgress, QAQuestion } from '../types';
import { seededShuffle, generateSeed } from '../utils/seededShuffle';

const CONFIG_KEY = 'aws-qa-package-config';
const PROGRESS_KEY = 'aws-qa-package-progress';

export function useQAPackages(services: AWSService[]) {
  const [config, setConfig] = useState<QAPackageConfig | null>(null);
  const [progress, setProgress] = useState<QAPackageProgress>({});
  const [loading, setLoading] = useState(true);

  // Load config and progress from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    const savedProgress = localStorage.getItem(PROGRESS_KEY);

    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }

    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Failed to parse saved progress', e);
      }
    }

    setLoading(false);
  }, []);

  /**
   * Extract all QA questions from services
   */
  const getAllQAQuestions = useCallback((): QAQuestion[] => {
    const allQuestions: QAQuestion[] = [];

    for (const service of services) {
      if (service.qa && Array.isArray(service.qa)) {
        for (const qa of service.qa) {
          // Add service context to each question
          allQuestions.push({
            ...qa,
            serviceName: qa.serviceName || service.serviceName,
            category: qa.category || service.category,
          });
        }
      }
    }

    return allQuestions;
  }, [services]);

  /**
   * Generate packages based on total questions and questions per package
   */
  const generatePackages = useCallback(
    (questionsPerPackage: number) => {
      const allQuestions = getAllQAQuestions();
      const totalQuestions = allQuestions.length;
      const newSeed = generateSeed();

      // Shuffle all questions with the seed
      const shuffledQuestions = seededShuffle(allQuestions, newSeed);

      // Create packages
      const packages = [
        {
          id: 'pkg-all',
          name: `All Questions (${totalQuestions})`,
          questions: shuffledQuestions,
          totalQuestions: totalQuestions,
        },
      ];

      // Split into smaller packages
      let packageIndex = 1;
      for (let i = 0; i < totalQuestions; i += questionsPerPackage) {
        const endIndex = Math.min(i + questionsPerPackage, totalQuestions);
        const packageQuestions = shuffledQuestions.slice(i, endIndex);
        const displayStart = i + 1;
        const displayEnd = endIndex;

        packages.push({
          id: `pkg-${packageIndex}`,
          name: `Package ${packageIndex} (Questions ${displayStart}-${displayEnd})`,
          questions: packageQuestions,
          totalQuestions: packageQuestions.length,
        });

        packageIndex++;
      }

      // Create new config
      const newConfig: QAPackageConfig = {
        seed: newSeed,
        questionsPerPackage,
        totalQuestions,
        createdAt: new Date().toISOString(),
        packages,
      };

      // Save to localStorage
      localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));

      // Reset progress when generating new packages
      const newProgress: QAPackageProgress = {};
      for (const pkg of packages) {
        newProgress[pkg.id] = {
          completed: 0,
          correct: 0,
          lastAttempt: '',
        };
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));

      setConfig(newConfig);
      setProgress(newProgress);

      return newConfig;
    },
    [getAllQAQuestions]
  );

  /**
   * Update progress for a specific package
   */
  const updateProgress = useCallback(
    (packageId: string, correct: number, total: number) => {
      const newProgress = { ...progress };
      newProgress[packageId] = {
        completed: total,
        correct,
        lastAttempt: new Date().toISOString(),
      };

      setProgress(newProgress);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    },
    [progress]
  );

  /**
   * Reset packages and progress
   */
  const resetPackages = useCallback(() => {
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    setConfig(null);
    setProgress({});
  }, []);

  /**
   * Get total questions available
   */
  const getTotalQuestions = useCallback((): number => {
    return getAllQAQuestions().length;
  }, [getAllQAQuestions]);

  return {
    config,
    progress,
    loading,
    generatePackages,
    updateProgress,
    resetPackages,
    getTotalQuestions,
  };
}
