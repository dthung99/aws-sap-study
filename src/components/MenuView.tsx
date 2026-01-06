import type { ViewMode } from '../types';

interface MenuViewProps {
  onSelectMode: (mode: Exclude<ViewMode, 'menu'>) => void;
  progress: {
    masteredCount: number;
    totalServices: number;
  };
}

export function MenuView({ onSelectMode, progress }: MenuViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            AWS SAP Study
          </h1>
          <p className="text-blue-100 text-lg">
            Master AWS services with interactive learning modes
          </p>
        </div>

        {/* Progress Summary */}
        <div className="bg-white rounded-xl p-8 mb-12 shadow-2xl">
          <div className="text-center">
            <p className="text-gray-700 font-bold text-lg mb-3">Services Mastered</p>
            <p className="text-5xl font-black text-blue-600 mb-2">
              {progress.masteredCount}
            </p>
            <p className="text-gray-600 text-lg mb-6">
              out of <span className="font-bold text-gray-800">{progress.totalServices}</span>
            </p>
            <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-3 transition-all duration-500"
                style={{
                  width: `${(progress.masteredCount / progress.totalServices) * 100}%`,
                }}
              />
            </div>
            <p className="text-gray-500 text-sm mt-3">
              {Math.round((progress.masteredCount / progress.totalServices) * 100)}% Complete
            </p>
          </div>
        </div>

        {/* Feature Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* All Services */}
          <button
            onClick={() => onSelectMode('all-services')}
            className="group relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            <div className="text-4xl mb-3">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">All Services</h2>
            <p className="text-gray-600">
              Browse and search all AWS services with detailed descriptions
            </p>
          </button>

          {/* Flashcards */}
          <button
            onClick={() => onSelectMode('flashcards')}
            className="group relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            <div className="text-4xl mb-3">🎴</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Flashcards</h2>
            <p className="text-gray-600">
              Study with flip cards and mark services as known or review
            </p>
          </button>

          {/* Swipe Mode */}
          <button
            onClick={() => onSelectMode('tinder')}
            className="group relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Swipe Mode</h2>
            <p className="text-gray-600">
              Swipe cards to quickly review and rate your knowledge
            </p>
          </button>

          {/* Short Quiz */}
          <button
            onClick={() => onSelectMode('shortquiz')}
            className="group relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            <div className="text-4xl mb-3">⚡</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Short Quiz</h2>
            <p className="text-gray-600">
              Quick 20-question quiz with auto-generated questions
            </p>
          </button>

          {/* Advanced Q&A */}
          <button
            onClick={() => onSelectMode('advanced-qa')}
            className="group relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            <div className="text-4xl mb-3">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Advanced Q&A</h2>
            <p className="text-gray-600">
              Create practice packages from structured QA questions
            </p>
          </button>

          {/* Online Materials */}
          <button
            onClick={() => onSelectMode('online-materials')}
            className="group relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            <div className="text-4xl mb-3">🔗</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Online Materials</h2>
            <p className="text-gray-600">
              Access curated external resources and study materials
            </p>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-100 text-sm space-y-4">
          <p>Select a learning mode to get started</p>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/aws_services_note.jsonl';
              link.download = 'aws_services_note.jsonl';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-lg"
          >
            📥 Download JSONL
          </button>
        </div>
      </div>
    </div>
  );
}
