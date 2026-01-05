import { useState, useEffect } from 'react';
import type { ViewMode } from './types';
import { useAWSServices } from './hooks/useAWSServices';
import { useProgress } from './hooks/useProgress';
import { MenuView } from './components/MenuView';
import { AllServicesView } from './components/AllServicesView';
import { FlashcardView } from './components/FlashcardView';
import { ShortQuizView } from './components/ShortQuizView';
import { AdvancedQAView } from './components/AdvancedQAView';
import { AdvancedQAQuizView } from './components/AdvancedQAQuizView';
import { TinderView } from './components/TinderView';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('menu');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const { services, loading, error } = useAWSServices();
  const { progress } = useProgress();

  // Handle URL-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'menu';
      const [view, queryString] = hash.split('?');
      const validViews: ViewMode[] = ['menu', 'all-services', 'flashcards', 'shortquiz', 'advanced-qa', 'advanced-qa-quiz', 'tinder'];

      if (validViews.includes(view as ViewMode)) {
        setCurrentView(view as ViewMode);

        // Parse package ID from query string if present
        if (view === 'advanced-qa-quiz' && queryString) {
          const params = new URLSearchParams(queryString);
          setSelectedPackageId(params.get('pkg'));
        }
      } else {
        setCurrentView('menu');
        window.location.hash = '#menu';
      }
    };

    // Set initial view from URL
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleBackToMenu = () => {
    window.location.hash = '#menu';
  };

  const handleSelectMode = (mode: Exclude<ViewMode, 'menu'>) => {
    window.location.hash = `#${mode}`;
  };

  const handleStartQAPackage = (packageId: string) => {
    window.location.hash = `#advanced-qa-quiz?pkg=${packageId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4 mx-auto" />
          <p className="text-white text-xl font-semibold">Loading AWS services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <p className="text-gray-600 text-sm">
            Make sure the aws_services_note.jsonl file is in the public folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentView === 'menu' && (
        <MenuView
          onSelectMode={handleSelectMode}
          progress={{
            masteredCount: progress.masteredServices.length,
            totalServices: services.length,
          }}
        />
      )}

      {currentView === 'all-services' && (
        <AllServicesView services={services} onBack={handleBackToMenu} />
      )}

      {currentView === 'flashcards' && (
        <FlashcardView services={services} onBack={handleBackToMenu} />
      )}

      {currentView === 'shortquiz' && (
        <ShortQuizView services={services} onBack={handleBackToMenu} />
      )}

      {currentView === 'advanced-qa' && (
        <AdvancedQAView
          services={services}
          onBack={handleBackToMenu}
          onStartPackage={handleStartQAPackage}
        />
      )}

      {currentView === 'advanced-qa-quiz' && selectedPackageId && (
        <AdvancedQAQuizView
          services={services}
          packageId={selectedPackageId}
          onBack={handleBackToMenu}
        />
      )}

      {currentView === 'tinder' && (
        <TinderView services={services} onBack={handleBackToMenu} />
      )}
    </div>
  );
}

export default App;
