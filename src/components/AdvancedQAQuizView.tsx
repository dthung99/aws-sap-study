import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { AWSService, QAQuestion } from '../types';
import { useQAPackages } from '../hooks/useQAPackages';

interface AdvancedQAQuizViewProps {
  services: AWSService[];
  onBack: () => void;
}

export function AdvancedQAQuizView({ services, onBack }: AdvancedQAQuizViewProps) {
  const { packageId } = useParams<{ packageId: string }>();
  const routeNavigate = useNavigate();
  const { config, updateProgress } = useQAPackages(services);

  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [packageName, setPackageName] = useState('');

  // Load questions from the package
  useEffect(() => {
    if (!config) return;

    const pkg = config.packages.find((p) => p.id === packageId);
    if (!pkg) {
      // Package not found, go back
      routeNavigate('/advanced-qa');
      return;
    }

    setPackageName(pkg.name);
    setQuestions(pkg.questions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setQuizComplete(false);
  }, [config, packageId]);

  if (!config || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
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

    const handleComplete = () => {
      if (packageId) {
        updateProgress(packageId, score, totalQuestions);
      }
      routeNavigate('/advanced-qa');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>

          <div className="mb-8">
            <p className="text-6xl font-bold text-purple-600 mb-2">{score}</p>
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
            onClick={handleComplete}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors mb-4"
          >
            Back to Packages
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
  const isCorrect = selectedAnswer === currentQuestion.answer;

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);
    setAnswered(true);
    if (option === currentQuestion.answer) {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 p-6 flex flex-col">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced Q&A</h1>
          <p className="text-purple-100 text-sm mt-1">{packageName}</p>
        </div>
        <button
          onClick={() => {
            routeNavigate('/advanced-qa');
          }}
          className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-8">{currentQuestion.question}</h2>

          {/* Options */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.answer;
              const showCorrect = answered && isCorrectOption;
              const showIncorrect = answered && isSelected && !isCorrectOption;

              return (
                <button
                  key={option}
                  onClick={() => !answered && handleSelectAnswer(option)}
                  disabled={answered}
                  className={`p-4 rounded-lg font-semibold text-lg text-left transition-all focus:outline-none focus:ring-4 disabled:cursor-default
                    ${
                      showCorrect
                        ? 'bg-green-100 border-2 border-green-500 text-green-800 focus:ring-green-300'
                        : showIncorrect
                          ? 'bg-red-100 border-2 border-red-500 text-red-800 focus:ring-red-300'
                          : isSelected
                            ? 'bg-purple-100 border-2 border-purple-500 text-purple-800 focus:ring-purple-300'
                            : 'bg-gray-100 border-2 border-gray-300 text-gray-800 hover:border-gray-500 focus:ring-gray-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {answered && isCorrectOption && <span className="text-xl">✓</span>}
                    {answered && isSelected && !isCorrectOption && <span className="text-xl">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <>
              <div
                className={`rounded-lg p-4 mb-8 ${
                  isCorrect
                    ? 'bg-green-50 border-l-4 border-green-600 text-green-800'
                    : 'bg-red-50 border-l-4 border-red-600 text-red-800'
                }`}
              >
                {isCorrect ? (
                  <div>
                    <p>
                      <span className="font-bold">Correct!</span> The answer is{' '}
                      <span className="font-semibold">{currentQuestion.answer}</span>.
                    </p>
                    {currentQuestion.explanation && (
                      <p className="text-sm mt-3">{currentQuestion.explanation}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-bold mb-2">Incorrect</p>
                    <p className="text-sm mb-3">
                      The correct answer is <span className="font-semibold">{currentQuestion.answer}</span>.
                    </p>
                    {currentQuestion.explanation && (
                      <p className="text-sm bg-white bg-opacity-30 rounded p-3 mt-3">
                        {currentQuestion.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Service Context */}
              {currentQuestion.serviceName && (
                <div className="bg-purple-50 rounded-lg p-4 mb-8 border-l-4 border-purple-600 text-sm text-purple-900">
                  <p className="font-semibold">Service Category:</p>
                  <p>{currentQuestion.serviceName}</p>
                  {currentQuestion.category && <p className="text-purple-700">Category: {currentQuestion.category}</p>}
                </div>
              )}
            </>
          )}

          {/* Next Button */}
          {answered && (
            <button
              onClick={handleNextQuestion}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              {currentIndex + 1 >= questions.length ? 'Complete Quiz' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
