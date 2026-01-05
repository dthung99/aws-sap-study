import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQAPackages } from "../hooks/useQAPackages";
import type { AWSService } from "../types";

interface AdvancedQAViewProps {
  services: AWSService[];
  onBack: () => void;
}

export function AdvancedQAView({ services, onBack }: AdvancedQAViewProps) {
  const navigate = useNavigate();
  const {
    config,
    progress,
    loading,
    generatePackages,
    resetPackages,
    getTotalQuestions,
  } = useQAPackages(services);

  const [questionsPerPackage, setQuestionsPerPackage] = useState<string>("50");
  const [showSetup, setShowSetup] = useState(true);
  const [error, setError] = useState<string>("");

  // Sync showSetup with config after loading from localStorage
  useEffect(() => {
    if (!loading) {
      setShowSetup(!config);
    }
  }, [config, loading]);

  const totalQuestions = getTotalQuestions();

  const handleGeneratePackages = () => {
    setError("");

    const count = parseInt(questionsPerPackage, 10);

    if (isNaN(count) || count < 1) {
      setError("Please enter a valid number");
      return;
    }

    if (count > totalQuestions) {
      setError(`Cannot exceed ${totalQuestions} total questions`);
      return;
    }

    generatePackages(count);
    setShowSetup(false);
  };

  const handleResetSeed = () => {
    if (window.confirm("Reset shuffle seed and clear all progress?")) {
      resetPackages();
      setShowSetup(true);
      setError("");
    }
  };

  const handleStartPackage = (packageId: string) => {
    navigate(`/advanced-qa-quiz/${packageId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const getProgressPercentage = (packageId: string) => {
    const pkg = config?.packages.find((p) => p.id === packageId);
    if (!pkg) return 0;

    const prog = progress[packageId];
    if (!prog) return 0;

    return Math.round((prog.completed / pkg.totalQuestions) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4 mx-auto" />
          <p className="text-white text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 p-6 flex flex-col">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">📚 Advanced Q&A</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          {/* Total Questions Available */}
          <div className="text-center mb-8">
            <p className="text-gray-600 font-semibold mb-2">
              Questions Available
            </p>
            <p className="text-5xl font-bold text-purple-600">
              {totalQuestions}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Across all AWS services
            </p>
          </div>

          {/* Setup Section */}
          {showSetup ? (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-600">
                <h2 className="text-xl font-bold text-purple-900 mb-4">
                  Create Practice Packages
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Questions per Package
                  </label>
                  <input
                    type="number"
                    value={questionsPerPackage}
                    onChange={(e) => {
                      setQuestionsPerPackage(e.target.value);
                      setError("");
                    }}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none text-lg"
                    min="1"
                    max={totalQuestions}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    💡 This splits {totalQuestions} questions into packages of
                    this size
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 text-red-800">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGeneratePackages}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                  Generate Packages
                </button>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600 text-blue-800">
                  <p className="text-sm font-semibold mb-2">Example:</p>
                  <p className="text-sm">
                    If you enter 50, questions will be split into packages:
                  </p>
                  <ul className="text-sm mt-2 ml-4 list-disc">
                    <li>Package All: 245 questions (all at once)</li>
                    <li>Package 1: Questions 1-50</li>
                    <li>Package 2: Questions 51-100</li>
                    <li>... and so on</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Configuration Info */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-800 mb-3">
                  Current Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Seed</p>
                    <p className="font-mono text-gray-800 break-all">
                      {config?.seed.substring(0, 12)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="text-gray-800">
                      {formatDate(config?.createdAt || "")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Questions per Package</p>
                    <p className="text-gray-800">
                      {config?.questionsPerPackage}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Available</p>
                    <p className="text-gray-800">{config?.totalQuestions}</p>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetSeed}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                🔄 Reset Shuffle Seed
              </button>

              {/* Packages List */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 mb-4">📦 Packages</h3>

                {config?.packages.map((pkg) => {
                  const percentage = getProgressPercentage(pkg.id);
                  const prog = progress[pkg.id];

                  return (
                    <button
                      key={pkg.id}
                      onClick={() => handleStartPackage(pkg.id)}
                      className="w-full text-left bg-white border-2 border-gray-200 hover:border-purple-600 rounded-lg p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-800">{pkg.name}</h4>
                        <span className="text-purple-600 font-bold">▶</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>
                            {prog?.completed || 0}/{pkg.totalQuestions} (
                            {percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Last Attempt */}
                      {prog?.lastAttempt && (
                        <p className="text-xs text-gray-500">
                          Last attempt: {formatDate(prog.lastAttempt)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
