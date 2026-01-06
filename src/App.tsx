import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAWSServices } from './hooks/useAWSServices';
import { useProgress } from './hooks/useProgress';
import { MenuView } from './components/MenuView';
import { AllServicesView } from './components/AllServicesView';
import { FlashcardView } from './components/FlashcardView';
import { ShortQuizView } from './components/ShortQuizView';
import { AdvancedQAView } from './components/AdvancedQAView';
import { AdvancedQAQuizView } from './components/AdvancedQAQuizView';
import { TinderView } from './components/TinderView';
import { OnlineMaterialsView } from './components/OnlineMaterialsView';
import type { ViewMode } from './types';

function App() {
  const { services, loading, error } = useAWSServices();
  const { progress } = useProgress();
  const navigate = useNavigate();

  const handleBackToMenu = () => {
    navigate('/');
  };

  const handleSelectMode = (mode: Exclude<ViewMode, 'menu'>) => {
    navigate(`/${mode}`);
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
      <Routes>
        <Route
          path="/"
          element={
            <MenuView
              onSelectMode={handleSelectMode}
              progress={{
                masteredCount: progress.masteredServices.length,
                totalServices: services.length,
              }}
            />
          }
        />
        <Route path="/all-services" element={<AllServicesView services={services} onBack={handleBackToMenu} />} />
        <Route path="/flashcards" element={<FlashcardView services={services} onBack={handleBackToMenu} />} />
        <Route path="/shortquiz" element={<ShortQuizView services={services} onBack={handleBackToMenu} />} />
        <Route
          path="/advanced-qa"
          element={<AdvancedQAView services={services} onBack={handleBackToMenu} />}
        />
        <Route path="/advanced-qa-quiz/:packageId" element={<AdvancedQAQuizView services={services} onBack={handleBackToMenu} />} />
        <Route path="/tinder" element={<TinderView services={services} onBack={handleBackToMenu} />} />
        <Route path="/online-materials" element={<OnlineMaterialsView onBack={handleBackToMenu} />} />
      </Routes>
    </div>
  );
}

export default App;
