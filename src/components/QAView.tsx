import { useState, useEffect } from 'react';
import type { AWSService } from '../types';
import { shuffleArray, getRandomItems } from '../utils/shuffleArray';
import { useProgress } from '../hooks/useProgress';

interface QAViewProps {
  services: AWSService[];
  onBack: () => void;
}

interface Question {
  question: string;
  correctService: AWSService;
  options: AWSService[];
}

export function QAView({ services, onBack }: QAViewProps) {
  const { updateModeStats } = useProgress();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  function generateQuestions(serviceList: AWSService[], count: number): Question[] {
    const selectedServices = getRandomItems(serviceList, Math.min(count, serviceList.length));

    return selectedServices.map((correctService) => {
      const distractors = getRandomItems(
        serviceList.filter((s) => s.serviceName !== correctService.serviceName),
        3
      );

      const options = shuffleArray([correctService, ...distractors]);

      return {
        question: correctService.problemSolved,
        correctService,
        options,
      };
    });
  }

  // Generate questions on component mount or when services change
   
  useEffect(() => {
    if (services.length === 0) return;
    const generatedQuestions = generateQuestions(services, 20);
    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setQuizComplete(false);
  }, [services]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-cyan-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4 mx-auto" />
          <p className="text-white text-xl font-semibold">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-cyan-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>

          <div className="mb-8">
            <p className="text-6xl font-bold text-blue-600 mb-2">{score}</p>
            <p className="text-gray-600 text-lg">
              out of {totalQuestions} ({percentage}%)
            </p>
          </div>

          {/* Score Feedback */}
          <div className="mb-8 p-4 rounded-lg bg-gray-100">
            {percentage >= 80 && (
              <p className="text-lg font-semibold text-green-600">🎉 Excellent work!</p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="text-lg font-semibold text-yellow-600">👍 Good job!</p>
            )}
            {percentage < 60 && (
              <p className="text-lg font-semibold text-red-600">💪 Keep practicing!</p>
            )}
          </div>

          <button
            onClick={() => {
              const generatedQuestions = generateQuestions(services, 20);
              setQuestions(generatedQuestions);
              setCurrentIndex(0);
              setSelectedAnswer(null);
              setAnswered(false);
              setScore(0);
              setQuizComplete(false);
              updateModeStats('qa', { correct: score, total: totalQuestions });
            }}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors mb-4"
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

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctService.serviceName;

  const handleSelectAnswer = (serviceName: string) => {
    setSelectedAnswer(serviceName);
    setAnswered(true);
    if (serviceName === currentQuestion.correctService.serviceName) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-cyan-800 p-6 flex flex-col">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Q&A Quiz</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between text-white mb-2">
          <span className="font-semibold">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm">Score: {score} / {currentIndex + (answered ? 1 : 0)}</span>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8">
          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            Which AWS service would you use for this?
          </h2>
          <div className="bg-blue-50 rounded-lg p-6 mb-8 border-l-4 border-blue-600">
            <p className="text-gray-700 text-lg leading-relaxed">{currentQuestion.question}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.serviceName;
              const isCorrectOption = option.serviceName === currentQuestion.correctService.serviceName;
              const showCorrect = answered && isCorrectOption;
              const showIncorrect = answered && isSelected && !isCorrectOption;

              return (
                <button
                  key={option.serviceName}
                  onClick={() => !answered && handleSelectAnswer(option.serviceName)}
                  disabled={answered}
                  className={`p-4 rounded-lg font-semibold text-lg transition-all focus:outline-none focus:ring-4 disabled:cursor-default
                    ${
                      showCorrect
                        ? 'bg-green-100 border-2 border-green-500 text-green-800 focus:ring-green-300'
                        : showIncorrect
                          ? 'bg-red-100 border-2 border-red-500 text-red-800 focus:ring-red-300'
                          : isSelected
                            ? 'bg-blue-100 border-2 border-blue-500 text-blue-800 focus:ring-blue-300'
                            : 'bg-gray-100 border-2 border-gray-300 text-gray-800 hover:border-gray-500 focus:ring-gray-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.serviceName}</span>
                    {answered && isCorrectOption && <span className="text-xl">✓</span>}
                    {answered && isSelected && !isCorrectOption && <span className="text-xl">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div
              className={`rounded-lg p-4 mb-8 ${
                isCorrect
                  ? 'bg-green-50 border-l-4 border-green-600 text-green-800'
                  : 'bg-red-50 border-l-4 border-red-600 text-red-800'
              }`}
            >
              {isCorrect ? (
                <p>
                  <span className="font-bold">Correct!</span> The answer is{' '}
                  <span className="font-semibold">{currentQuestion.correctService.serviceName}</span>.
                </p>
              ) : (
                <div>
                  <p className="font-bold mb-2">Incorrect</p>
                  <p className="text-sm mb-3">
                    The correct answer is{' '}
                    <span className="font-semibold">{currentQuestion.correctService.serviceName}</span>.
                  </p>
                  <p className="text-sm">{currentQuestion.correctService.scenarioAndSolution}</p>
                </div>
              )}
            </div>
          )}

          {/* Next Button */}
          {answered && (
            <button
              onClick={handleNextQuestion}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              {currentIndex + 1 >= questions.length ? 'Complete Quiz' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
