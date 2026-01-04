import { useState, useEffect } from 'react';
import type { AWSService } from '../types';
import { shuffleArray } from '../utils/shuffleArray';
import { useProgress } from '../hooks/useProgress';

interface FlashcardViewProps {
  services: AWSService[];
  onBack: () => void;
}

export function FlashcardView({ services, onBack }: FlashcardViewProps) {
  const { addMasteredService, addReviewService, progress } = useProgress();
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled, setShuffled] = useState<AWSService[]>([]);
  const [isShuffle, setIsShuffle] = useState(true);

  // Keyboard navigation - must be defined before early return
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (shuffled.length === 0) return;
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % shuffled.length);
        setIsFlipped(false);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + shuffled.length) % shuffled.length);
        setIsFlipped(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shuffled.length]);

  useEffect(() => {
    if (services.length === 0) return;
    const serviceList = isShuffle ? shuffleArray(services) : services;
    setShuffled(serviceList);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [services, isShuffle]);

  // Early return with loading state - after all hooks
  if (shuffled.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4 mx-auto" />
          <p className="text-white text-xl font-semibold">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  const currentService = shuffled[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % shuffled.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + shuffled.length) % shuffled.length);
  };

  const handleKnowIt = () => {
    addMasteredService(currentService.serviceName);
    handleNext();
  };

  const handleReview = () => {
    addReviewService(currentService.serviceName);
    handleNext();
  }

  const isMastered = progress.masteredServices.includes(currentService.serviceName);
  const isInReview = progress.reviewServices.includes(currentService.serviceName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-6 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Flashcards</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between text-white mb-2">
          <span className="font-semibold">
            Card {currentIndex + 1} of {shuffled.length}
          </span>
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className="text-sm px-4 py-2 bg-yellow-400 text-gray-800 font-bold rounded-full hover:bg-yellow-300 transition-colors"
          >
            {isShuffle ? '🔀 Shuffled' : '📋 Sequential'}
          </button>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / shuffled.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl mb-8">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-80 bg-white rounded-2xl shadow-2xl cursor-pointer transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 relative overflow-hidden"
        >
          <div className={`w-full h-full flex items-center justify-center p-8 text-center transition-all duration-500 ${isFlipped ? 'bg-blue-50' : 'bg-white'}`}>
            <div>
              {!isFlipped ? (
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-4">SERVICE NAME</p>
                  <h2 className="text-4xl font-bold text-purple-600 mb-4">
                    {currentService.serviceName}
                  </h2>
                  <p className="text-gray-600 mb-6">{currentService.category}</p>
                  <p className="text-sm text-gray-400">Click to reveal</p>
                </div>
              ) : (
                <div className="text-left">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                    Problem Solved
                  </p>
                  <p className="text-lg font-semibold text-gray-800 mb-6">
                    {currentService.problemSolved}
                  </p>
                  <hr className="my-6 border-gray-300" />
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                    Scenario & Solution
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {currentService.scenarioAndSolution}
                  </p>
                </div>
              )}
            </div>

            {/* Status Badge */}
            {(isMastered || isInReview) && (
              <div className="absolute top-4 right-4">
                {isMastered && (
                  <span className="inline-block px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                    ✓ Mastered
                  </span>
                )}
                {isInReview && (
                  <span className="inline-block px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-semibold">
                    ⟳ Review
                  </span>
                )}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl space-y-4">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleReview}
            className="px-6 py-4 bg-yellow-500 text-white rounded-lg font-bold text-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-4 focus:ring-yellow-300"
          >
            Need Review
          </button>
          <button
            onClick={handleKnowIt}
            className="px-6 py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Know It
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handlePrev}
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Next →
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg p-4 shadow-lg text-center">
          <p className="text-sm font-bold text-gray-800">
            ✓ Mastered: <span className="text-green-600">{progress.masteredServices.length}</span> |
            ⟳ Review: <span className="text-yellow-600">{progress.reviewServices.length}</span>
          </p>
        </div>

        <p className="text-center text-white text-sm">
          💡 Press SPACE to flip | ← → to navigate
        </p>
      </div>
    </div>
  );
}
