import { useState } from 'react';
import type { NavPage } from './types';
import type { Language } from './i18n/translations';
import { storageService } from './services/storageService';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LayoutPage } from './pages/LayoutPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { SafetyRulesPage } from './pages/SafetyRulesPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { SensitivityPage } from './pages/SensitivityPage';
import { FailureCasesPage } from './pages/FailureCasesPage';
import { DataCapturePage } from './pages/DataCapturePage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [language, setLanguage] = useState<Language>(storageService.getLanguage());

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    storageService.setLanguage(lang);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} language={language} />;
      case 'simulator':
        return <SimulatorPage language={language} />;
      case 'layout':
        return <LayoutPage language={language} />;
      case 'scenarios':
        return <ScenariosPage onNavigate={setCurrentPage} language={language} />;
      case 'safety_rules':
        return <SafetyRulesPage language={language} />;
      case 'experiments':
        return <ExperimentsPage language={language} />;
      case 'sensitivity':
        return <SensitivityPage language={language} />;
      case 'failure_cases':
        return <FailureCasesPage onNavigate={setCurrentPage} language={language} />;
      case 'data_capture':
        return <DataCapturePage language={language} />;
      case 'settings':
        return <SettingsPage language={language} onLanguageChange={handleLanguageChange} />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Dynamic Human-Robot Safety-Zone Simulator &copy; 2026 Process Plant Research</span>
          <span className="font-mono text-amber-500/80 text-[11px]">
            RESEARCH PROTOTYPE • NOT CERTIFIED INDUSTRIAL SAFETY
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
