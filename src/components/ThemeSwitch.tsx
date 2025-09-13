import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitch: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  console.log('ThemeSwitch renderizado con tema:', theme);

  return (
    <div className="flex items-center space-x-3">
      {/* Debug element */}
      <div className="debug-theme w-4 h-4 rounded mr-2"></div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {theme === 'light' ? '☀️' : '🌙'}
      </span>
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-300 ease-in-out focus:outline-none
          focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${theme === 'dark' 
            ? 'bg-blue-600 focus:ring-offset-gray-800' 
            : 'bg-gray-200 focus:ring-offset-white'
          }
        `}
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white 
            transition-transform duration-300 ease-in-out
            ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {theme === 'light' ? 'Claro' : 'Oscuro'}
      </span>
    </div>
  );
};

export default ThemeSwitch;
