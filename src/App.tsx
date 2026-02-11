import React, { useCallback, useEffect, useRef, useState } from 'react';
import GitAccountManager from './components/GitAccountManager';
import RepoView from './components/RepoView';
import SplashScreen from './components/SplashScreen';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const TAB_TRANSITION_MS = 140;

type Tab = 'accounts' | 'repos';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('accounts');
  const [exiting, setExiting] = useState(false);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTabClick = useCallback((tab: Tab) => {
    if (tab === activeTab) return;
    if (transitionRef.current) clearTimeout(transitionRef.current);
    setExiting(true);
    transitionRef.current = setTimeout(() => {
      setActiveTab(tab);
      setExiting(false);
      transitionRef.current = null;
    }, TAB_TRANSITION_MS);
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (transitionRef.current) clearTimeout(transitionRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className={`mx-auto py-2 px-4 ${activeTab === 'repos' ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Git X
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Git Manager
          </p>

          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
            <button
              onClick={() => handleTabClick('accounts')}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'accounts'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Account Manager
            </button>
            <button
              onClick={() => handleTabClick('repos')}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'repos'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Repos
            </button>
          </div>
        </header>

        <div
          className="transition-opacity duration-[140ms] ease-out"
          style={{ opacity: exiting ? 0 : 1 }}
        >
          {activeTab === 'accounts' ? <GitAccountManager /> : <RepoView />}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <AppContent />
      )}
    </ThemeProvider>
  );
}

export default App;
