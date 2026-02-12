import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { AuthPage } from './pages/Auth';
import { AuthCallbackPage } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';
import { BotsPage } from './pages/Bots';
import { SignalsPage } from './pages/Signals';
import { TraderPage } from './pages/Trader';
import { CopyTradingPage } from './pages/CopyTrading';
import { ReportsPage } from './pages/Reports';
import { BotBuilderPage } from './pages/BotBuilder';
import { SettingsPage } from './pages/Settings';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { isLoading, session } = useAuth();

  useEffect(() => {
    const checkForCallback = () => {
      if (window.location.search.includes('acct1') && window.location.search.includes('token1')) {
        setCurrentPage('auth-callback');
      }
    };
    checkForCallback();
  }, []);

  if (currentPage === 'auth-callback') {
    return <AuthCallbackPage />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (currentPage === 'home') {
      return <Home onGetStarted={() => setCurrentPage('auth')} />;
    }
    return <AuthPage onAuthSuccess={() => setCurrentPage('dashboard')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'trader':
        return <TraderPage />;
      case 'bots':
        return <BotsPage />;
      case 'bot-builder':
        return <BotBuilderPage />;
      case 'signals':
        return <SignalsPage />;
      case 'copy-trading':
        return <CopyTradingPage />;
      case 'charts':
        return <ChartsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

const ChartsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-white mb-2">Charts</h1>
    <p className="text-slate-400 mb-6">Professional TradingView charts coming soon</p>
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
      <p className="text-slate-400">TradingView integration coming soon</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
