import { useCallback, useEffect, useRef, useState } from "react";
import { useProgress } from "../hooks/useProgress";
import type { AWSService } from "../types";
import { shuffleArray } from "../utils/shuffleArray";

interface TinderViewProps {
  services: AWSService[];
  onBack: () => void;
}

interface CardState {
  rotation: number;
  translateX: number;
  opacity: number;
}

export function TinderView({ services, onBack }: TinderViewProps) {
  const { addMasteredService, addReviewService } = useProgress();
  const [shuffled, setShuffled] = useState<AWSService[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardState, setCardState] = useState<CardState>({
    rotation: 0,
    translateX: 0,
    opacity: 1,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [sessionStats, setSessionStats] = useState({ known: 0, learning: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const [showComplete, setShowComplete] = useState(false);

  // All hooks must be called before any early returns
  useEffect(() => {
    if (services.length === 0) return;
    setShuffled(shuffleArray(services));
    setCurrentIndex(0);
    setSessionStats({ known: 0, learning: 0 });
    setShowComplete(false);
  }, [services]);

  const handleNextCard = useCallback(() => {
    if (currentIndex + 1 >= shuffled.length) {
      setShowComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setCardState({ rotation: 0, translateX: 0, opacity: 1 });
      setCurrentX(0);
    }
  }, [currentIndex, shuffled.length]);

  const animateCardOut = useCallback(
    (knew: boolean) => {
      const direction = knew ? 500 : -500;
      const rotation = knew ? 20 : -20;

      const steps = 20;
      let step = 0;

      const animate = () => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setCardState({
          rotation: rotation * easeOut,
          translateX: direction * easeOut,
          opacity: 1 - easeOut * 0.5,
        });

        if (step < steps) {
          requestAnimationFrame(animate);
        } else {
          handleNextCard();
        }
      };

      animate();
    },
    [handleNextCard]
  );

  const handleCardAction = useCallback(
    (knew: boolean) => {
      // Access currentService from shuffled array using currentIndex
      const service = shuffled[currentIndex];
      if (knew) {
        addMasteredService(service.serviceName);
        setSessionStats((prev) => ({ ...prev, known: prev.known + 1 }));
      } else {
        addReviewService(service.serviceName);
        setSessionStats((prev) => ({ ...prev, learning: prev.learning + 1 }));
      }

      animateCardOut(knew);
    },
    [
      shuffled,
      currentIndex,
      addMasteredService,
      addReviewService,
      animateCardOut,
    ]
  );

  // Keyboard controls - must come before early return
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (shuffled.length === 0) return;
      if (e.key === "ArrowRight") {
        handleCardAction(true);
      } else if (e.key === "ArrowLeft") {
        handleCardAction(false);
      } else if (e.key === " ") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [shuffled.length, currentIndex, isFlipped, handleCardAction]);

  // Early return after all hooks
  if (shuffled.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-600 to-rose-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4 mx-auto" />
          <p className="text-white text-xl font-semibold">
            Loading swipe cards...
          </p>
        </div>
      </div>
    );
  }

  const currentService = shuffled[currentIndex];
  const remaining = shuffled.length - currentIndex - 1;

  // Safety check: if currentService is undefined, show completion screen
  if (!currentService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Session Complete!
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">
                {sessionStats.known}
              </p>
              <p className="text-gray-600 font-semibold mt-2">Know It</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-yellow-600">
                {sessionStats.learning}
              </p>
              <p className="text-gray-600 font-semibold mt-2">Review</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            {sessionStats.known === shuffled.length
              ? "🎉 Perfect! You know all these services!"
              : sessionStats.known > sessionStats.learning
              ? "👍 Great job! Keep it up!"
              : "💪 Keep practicing!"}
          </p>

          <button
            onClick={() => {
              setShuffled(shuffleArray(services));
              setCurrentIndex(0);
              setSessionStats({ known: 0, learning: 0 });
              setShowComplete(false);
              setIsFlipped(false);
              setCardState({ rotation: 0, translateX: 0, opacity: 1 });
            }}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors mb-4"
          >
            Try Again
          </button>

          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Mouse/Touch tracking
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setCurrentX(delta);

    const rotation = (delta / 100) * 15;
    setCardState({
      rotation,
      translateX: delta,
      opacity: 1 - Math.abs(delta) / 500,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const threshold = 100;

    if (currentX > threshold) {
      handleCardAction(true);
    } else if (currentX < -threshold) {
      handleCardAction(false);
    } else {
      setCardState({ rotation: 0, translateX: 0, opacity: 1 });
      setCurrentX(0);
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - startX;
    setCurrentX(delta);

    const rotation = (delta / 100) * 15;
    setCardState({
      rotation,
      translateX: delta,
      opacity: 1 - Math.abs(delta) / 500,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 100;

    if (currentX > threshold) {
      handleCardAction(true);
    } else if (currentX < -threshold) {
      handleCardAction(false);
    } else {
      setCardState({ rotation: 0, translateX: 0, opacity: 1 });
      setCurrentX(0);
    }
  };

  if (showComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Session Complete!
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">
                {sessionStats.known}
              </p>
              <p className="text-gray-600 font-semibold mt-2">Know It</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-yellow-600">
                {sessionStats.learning}
              </p>
              <p className="text-gray-600 font-semibold mt-2">Review</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            {sessionStats.known === shuffled.length
              ? "🎉 Perfect! You know all these services!"
              : sessionStats.known > sessionStats.learning
              ? "👍 Great job! Keep it up!"
              : "💪 Keep practicing!"}
          </p>

          <button
            onClick={() => {
              setShuffled(shuffleArray(services));
              setCurrentIndex(0);
              setSessionStats({ known: 0, learning: 0 });
              setShowComplete(false);
              setIsFlipped(false);
              setCardState({ rotation: 0, translateX: 0, opacity: 1 });
            }}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors mb-4"
          >
            Try Again
          </button>

          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 to-rose-800 p-6 flex flex-col items-center justify-center select-none">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Swipe Mode</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white text-rose-600 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between text-white mb-2">
          <span className="font-semibold">
            Card {currentIndex + 1} of {shuffled.length}
          </span>
          <span className="text-sm">{remaining} remaining</span>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / shuffled.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 w-full max-w-2xl flex items-center justify-center mb-8">
        <div
          ref={cardRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => !isDragging && setIsFlipped(!isFlipped)}
          className="relative w-full max-w-sm h-96 bg-white rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing overflow-hidden transition-all"
          style={{
            transform: `translateX(${cardState.translateX}px) rotateZ(${cardState.rotation}deg)`,
            opacity: cardState.opacity,
          }}
        >
          {/* Card Content */}
          <div className="w-full h-full flex items-center justify-center p-8 text-center">
            {!isFlipped ? (
              <div>
                <p className="text-gray-400 text-sm font-medium mb-4">
                  SERVICE
                </p>
                <h2 className="text-4xl font-bold text-pink-600 mb-6 break-words">
                  {currentService.serviceName}
                </h2>
                <p className="text-gray-600 mb-8 text-lg font-semibold">
                  {currentService.category}
                </p>
                <p className="text-sm text-gray-400 animate-bounce">
                  Click to reveal →
                </p>
              </div>
            ) : (
              <div className="text-left max-h-80 overflow-y-auto">
                <p className="text-lg font-bold text-gray-800 mb-6">
                  {currentService.problemSolved}
                </p>
                <hr className="my-4 border-gray-300" />
                <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-2">
                  Solution
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {currentService.scenarioAndSolution}
                </p>
                <hr className="my-4 border-gray-300" />
                <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-2">
                  How to Use
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentService.simpleStepByStepUsage}
                </p>
              </div>
            )}
          </div>

          {/* Swipe Indicators */}
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
              {currentX > 0 && (
                <div className="text-4xl font-bold text-green-500 opacity-70">
                  ✓ KNOW
                </div>
              )}
              {currentX < 0 && (
                <div className="text-4xl font-bold text-red-500 opacity-70 ml-auto">
                  REVIEW ⟳
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl space-y-4">
        {/* Main Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleCardAction(false)}
            className="px-6 py-4 bg-red-500 text-white rounded-lg font-bold text-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            ← Review
          </button>
          <button
            onClick={() => handleCardAction(true)}
            className="px-6 py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Know →
          </button>
        </div>

        {/* Flip Button */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors focus:outline-none focus:ring-4 focus:ring-orange-300"
        >
          {isFlipped ? "← Show Service" : "Show Details →"} (SPACE)
        </button>

        {/* Stats */}
        <div className="bg-white rounded-lg p-4 shadow-lg text-center">
          <p className="text-sm font-bold text-gray-800">
            ✓ Know: <span className="text-green-600">{sessionStats.known}</span>{" "}
            | ⟳ Review:{" "}
            <span className="text-red-600">{sessionStats.learning}</span>
          </p>
        </div>

        <p className="text-center text-white text-sm">
          💡 Swipe or use ← → keys | SPACE to flip
        </p>
      </div>
    </div>
  );
}
