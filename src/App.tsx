import React, { useState, useEffect } from 'react';
import GitAccountManager from './components/GitAccountManager';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeSwitch from './components/ThemeSwitch';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  console.log('App renderizado con tema:', theme);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            {/* <div className="flex-1"></div> */}
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Git X
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Git Account Manager
              </p>
            </div>
           {/*  <div className="flex-1 flex justify-end">
              <ThemeSwitch />
            </div> */}
          </div>
        </header>
        
        <GitAccountManager />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
